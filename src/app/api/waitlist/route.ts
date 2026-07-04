import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { generateReferralCode, normalizeReferralCode } from "@/lib/waitlist/referral-code";
import { checkWaitlistRateLimit, checkWaitlistPatchEmailRateLimit } from "@/lib/waitlist/rate-limit";
import { hashClientIp } from "@/lib/waitlist/ip-hash";
import { isWaitlistTableMissing } from "@/lib/waitlist/supabase-errors";
import { getWaitlistDbUrlConfigIssue, isWaitlistDirectPg } from "@/lib/waitlist/direct-pg";
import { waitlistPgFailureHint } from "@/lib/waitlist/pg-connect-errors";
import { isDisposableEmailDomain, isValidEmailForSignup } from "@/lib/waitlist/email-validation";
import {
  postWaitlistPg,
  updateWaitlistProfilePg,
  WAITLIST_QUICK_JOIN_MARKER,
} from "@/lib/waitlist/pg-handlers";
import {
  waitlistNotConfiguredMessage,
  waitlistServerErrorMessage,
  waitlistTableMissingMessage,
  waitlistUnavailableMessage,
} from "@/lib/waitlist/public-waitlist-error";
import { publicSiteUrlField } from "@/lib/waitlist/public-site-url";

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

const MAX_NAME = 200;
const MAX_OTHER = 200;
const MAX_PHONE = 40;

function waitlistConfigured(): boolean {
  const rest =
    Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim());
  return isWaitlistDirectPg() || rest;
}

export async function POST(request: NextRequest) {
  if (!waitlistConfigured()) {
    return NextResponse.json({ error: waitlistNotConfiguredMessage() }, { status: 503 });
  }

  const ip = getClientIp(request);
  const rl = checkWaitlistRateLimit(`waitlist:${ip}`);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests", retryAfterSec: rl.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const quickJoin = body.quickJoin === true;
  let name = typeof body.name === "string" ? body.name.trim() : "";
  const emailRaw = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  let phone = typeof body.phone === "string" ? body.phone.trim().slice(0, MAX_PHONE) : "";
  let role = typeof body.role === "string" ? body.role.trim() : "";
  let otherRole =
    typeof body.otherRole === "string" ? body.otherRole.trim().slice(0, MAX_OTHER) : "";
  const referredBy = normalizeReferralCode(typeof body.referredBy === "string" ? body.referredBy : null);

  if (quickJoin) {
    if (!isValidEmailForSignup(emailRaw)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (isDisposableEmailDomain(emailRaw)) {
      return NextResponse.json({ error: "Please use a permanent email address." }, { status: 400 });
    }
    name = "Waitlist member";
    phone = "";
    role = "Other";
    otherRole = WAITLIST_QUICK_JOIN_MARKER;
  } else {
    if (!name || name.length > MAX_NAME || !isValidEmailForSignup(emailRaw)) {
      return NextResponse.json({ error: "Invalid name or email" }, { status: 400 });
    }
    if (isDisposableEmailDomain(emailRaw)) {
      return NextResponse.json({ error: "Please use a permanent email address." }, { status: 400 });
    }
    if (!role) {
      return NextResponse.json({ error: "Role is required" }, { status: 400 });
    }
  }

  const ipHash = hashClientIp(ip);

  if (isWaitlistDirectPg()) {
    try {
      const result = await postWaitlistPg({
        name,
        emailRaw,
        phone,
        role,
        otherRole,
        referredByRaw: typeof body.referredBy === "string" ? body.referredBy : null,
        ipHash,
      });
      if (result.status === "duplicate") {
        return NextResponse.json({
          status: "duplicate" as const,
          referralCode: result.referralCode,
          ...publicSiteUrlField(),
        });
      }
      if (result.status === "error") {
        return NextResponse.json(
          { error: waitlistServerErrorMessage(result.message) },
          { status: 500 }
        );
      }
      return NextResponse.json({
        status: "ok" as const,
        referralCode: result.referralCode,
        ...(result.referrerEmail ? { referrerEmail: result.referrerEmail } : {}),
        ...publicSiteUrlField(),
      });
    } catch (e) {
      console.error("[waitlist] direct Postgres failed", e);
      const templateHint = getWaitlistDbUrlConfigIssue();
      const pgHint = waitlistPgFailureHint(e);
      return NextResponse.json(
        {
          error: waitlistUnavailableMessage(
            templateHint ||
              pgHint ||
              "Could not reach the database. Check DATABASE_URL / WAITLIST_DATABASE_URL (use the Supabase transaction pooler URI and correct password)."
          ),
        },
        { status: 503 }
      );
    }
  }

  const supabase = await createServiceRoleClient();

  const { data: existing, error: selectErr } = await supabase
    .from("waitlist_signups")
    .select("id, referral_code")
    .eq("email", emailRaw)
    .maybeSingle();

  if (selectErr) {
    if (isWaitlistTableMissing(selectErr)) {
      console.error("[waitlist] table missing — run SQL migrations in Supabase (002_waitlist_referrals.sql)");
      return NextResponse.json(
        { error: waitlistTableMissingMessage(), code: "TABLE_MISSING" as const },
        { status: 503 }
      );
    }
    console.error("[waitlist] lookup", selectErr);
    return NextResponse.json(
      { error: waitlistServerErrorMessage("Could not join waitlist") },
      { status: 500 }
    );
  }

  if (existing) {
    return NextResponse.json({
      status: "duplicate" as const,
      referralCode: existing.referral_code as string,
      ...publicSiteUrlField(),
    });
  }

  let referrerId: string | null = null;
  let referredByStored: string | null = null;
  let referrerEmailForResponse: string | undefined;

  if (referredBy) {
    const { data: referrer } = await supabase
      .from("waitlist_signups")
      .select("id, email, disqualified")
      .eq("referral_code", referredBy)
      .maybeSingle();

    if (referrer && referrer.email.toLowerCase() !== emailRaw && !referrer.disqualified) {
      referrerId = referrer.id;
      referredByStored = referredBy;
      referrerEmailForResponse = referrer.email.toLowerCase();
    }
  }

  let referralCode = "";
  let lastError: { message: string; code?: string } | null = null;

  for (let attempt = 0; attempt < 8; attempt++) {
    referralCode = generateReferralCode(8);
    const { error } = await supabase.from("waitlist_signups").insert({
      email: emailRaw,
      name: name.slice(0, MAX_NAME),
      phone: phone || null,
      role,
      other_role: otherRole || null,
      referral_code: referralCode,
      referred_by_code: referredByStored,
      signup_ip_hash: ipHash,
    });

    if (!error) {
      lastError = null;
      break;
    }
    lastError = error;
    if (error.code === "23505" && String(error.message).includes("referral_code")) {
      continue;
    }
    break;
  }

  if (lastError) {
    console.error("[waitlist]", lastError);
    if (isWaitlistTableMissing(lastError)) {
      return NextResponse.json(
        { error: waitlistTableMissingMessage(), code: "TABLE_MISSING" as const },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: waitlistServerErrorMessage("Could not join waitlist") },
      { status: 500 }
    );
  }

  if (referrerId) {
    const { error: rpcErr } = await supabase.rpc("increment_waitlist_referrer_points", {
      p_referrer_id: referrerId,
    });
    if (rpcErr) {
      console.error("[waitlist] increment referrer", rpcErr);
    }
  }

  return NextResponse.json({
    status: "ok" as const,
    referralCode,
    ...(referrerEmailForResponse ? { referrerEmail: referrerEmailForResponse } : {}),
    ...publicSiteUrlField(),
  });
}

export async function PATCH(request: NextRequest) {
  if (!waitlistConfigured()) {
    return NextResponse.json({ error: waitlistNotConfiguredMessage() }, { status: 503 });
  }

  const ip = getClientIp(request);
  const rl = checkWaitlistRateLimit(`waitlist-profile:${ip}`);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests", retryAfterSec: rl.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const emailRaw = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!isValidEmailForSignup(emailRaw)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  // Per-email rate limit: max 3 profile updates per 24 h.
  // Prevents mass-tampering with any user's profile by someone who knows their email,
  // without requiring email verification (product choice: no-OTP).
  const emailRl = checkWaitlistPatchEmailRateLimit(`patch-email:${emailRaw}`);
  if (!emailRl.ok) {
    return NextResponse.json(
      { error: "Too many profile updates for this email. Try again later.", retryAfterSec: emailRl.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(emailRl.retryAfterSec) } }
    );
  }

  const name = typeof body.name === "string" ? body.name.trim() : undefined;
  const phone = typeof body.phone === "string" ? body.phone.trim() : undefined;
  const role = typeof body.role === "string" ? body.role.trim() : undefined;
  const otherRole = typeof body.otherRole === "string" ? body.otherRole.trim() : undefined;

  const hasUpdate =
    (name && name.length > 0) ||
    phone !== undefined ||
    (role && role.length > 0) ||
    otherRole !== undefined;
  if (!hasUpdate) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  if (isWaitlistDirectPg()) {
    try {
      const result = await updateWaitlistProfilePg({
        emailRaw,
        name,
        phone,
        role,
        otherRole,
      });
      if (result.status === "not_found") {
        return NextResponse.json({ error: "Email not on waitlist" }, { status: 404 });
      }
      if (result.status === "error") {
        return NextResponse.json(
          { error: waitlistServerErrorMessage(result.message ?? "Update failed") },
          { status: 500 }
        );
      }
      return NextResponse.json({ status: "ok" as const });
    } catch (e) {
      console.error("[waitlist PATCH] direct Postgres failed", e);
      const templateHint = getWaitlistDbUrlConfigIssue();
      const pgHint = waitlistPgFailureHint(e);
      return NextResponse.json(
        {
          error: waitlistUnavailableMessage(
            templateHint ||
              pgHint ||
              "Could not reach the database. Check DATABASE_URL / WAITLIST_DATABASE_URL."
          ),
        },
        { status: 503 }
      );
    }
  }

  const supabase = await createServiceRoleClient();

  const { data: row, error: selectErr } = await supabase
    .from("waitlist_signups")
    .select("id")
    .eq("email", emailRaw)
    .maybeSingle();

  if (selectErr) {
    if (isWaitlistTableMissing(selectErr)) {
      return NextResponse.json(
        { error: waitlistTableMissingMessage(), code: "TABLE_MISSING" as const },
        { status: 503 }
      );
    }
    console.error("[waitlist PATCH] lookup", selectErr);
    return NextResponse.json(
      { error: waitlistServerErrorMessage("Could not update profile") },
      { status: 500 }
    );
  }

  if (!row) {
    return NextResponse.json({ error: "Email not on waitlist" }, { status: 404 });
  }

  const updates: Record<string, string | null> = {};
  if (name && name.length > 0) {
    updates.name = name.slice(0, MAX_NAME);
  }
  if (phone !== undefined) {
    updates.phone = phone ? phone.slice(0, MAX_PHONE) : null;
  }
  if (role && role.length > 0) {
    updates.role = role;
    updates.other_role = role === "Other" ? (otherRole?.slice(0, MAX_OTHER) || null) : null;
  } else if (otherRole !== undefined && !role) {
    updates.other_role = otherRole ? otherRole.slice(0, MAX_OTHER) : null;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ status: "ok" as const });
  }

  const { error: upErr } = await supabase.from("waitlist_signups").update(updates).eq("email", emailRaw);

  if (upErr) {
    console.error("[waitlist PATCH]", upErr);
    if (isWaitlistTableMissing(upErr)) {
      return NextResponse.json(
        { error: waitlistTableMissingMessage(), code: "TABLE_MISSING" as const },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: waitlistServerErrorMessage("Could not update profile") },
      { status: 500 }
    );
  }

  return NextResponse.json({ status: "ok" as const });
}
