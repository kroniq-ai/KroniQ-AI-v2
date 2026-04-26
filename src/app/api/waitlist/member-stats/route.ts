import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";
import { getWaitlistDbUrlConfigIssue, isWaitlistDirectPg } from "@/lib/waitlist/direct-pg";
import { getWaitlistMemberReferralStatsRest } from "@/lib/waitlist/member-referral-stats-rest";
import { waitlistPgFailureHint } from "@/lib/waitlist/pg-connect-errors";
import { getWaitlistMemberReferralStatsPg } from "@/lib/waitlist/pg-handlers";
import { normalizeReferralCode } from "@/lib/waitlist/referral-code";
import { checkWaitlistMemberStatsRateLimit } from "@/lib/waitlist/rate-limit";

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

function waitlistConfigured(): boolean {
  const rest =
    Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim());
  return isWaitlistDirectPg() || rest;
}

async function memberStatsByReferralCode(codeNorm: string) {
  if (isWaitlistDirectPg()) {
    try {
      const result = await getWaitlistMemberReferralStatsPg({
        emailRaw: undefined,
        referralCode: codeNorm,
      });
      if (result.status === "not_found") {
        return NextResponse.json({ error: "Waitlist profile not found" }, { status: 404 });
      }
      if (result.status === "error") {
        return NextResponse.json({ error: result.message }, { status: 500 });
      }
      return NextResponse.json({
        ...result,
        authSource: "referral_code" as const,
      });
    } catch (e) {
      console.error("[waitlist/member-stats] pg", e);
      const pgHint = waitlistPgFailureHint(e);
      const templateHint = getWaitlistDbUrlConfigIssue();
      return NextResponse.json(
        { error: templateHint || pgHint || "Database error" },
        { status: 503 }
      );
    }
  }

  const supabase = await createServiceRoleClient();
  const result = await getWaitlistMemberReferralStatsRest(supabase, {
    emailRaw: undefined,
    referralCode: codeNorm,
  });
  if (result.status === "not_found") {
    return NextResponse.json({ error: "Waitlist profile not found" }, { status: 404 });
  }
  if (result.status === "error") {
    return NextResponse.json({ error: result.message }, { status: 500 });
  }
  return NextResponse.json({
    ...result,
    authSource: "referral_code" as const,
  });
}

export async function POST(request: NextRequest) {
  if (!waitlistConfigured()) {
    return NextResponse.json({ error: "Waitlist is not configured" }, { status: 503 });
  }

  const ip = getClientIp(request);

  let body: { referralCode?: string };
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const referralCodeBody = typeof body.referralCode === "string" ? body.referralCode : undefined;
  const codeNorm = normalizeReferralCode(referralCodeBody ?? null);

  /**
   * Referral-code lookups do not need Supabase Auth. Calling `getUser()` first caused hangs
   * (SSR/cookie refresh) while `/api/waitlist/stats` still succeeded — endless skeleton in LeaderboardModal.
   */
  if (codeNorm) {
    const rl = checkWaitlistMemberStatsRateLimit(`member-stats:${ip}`);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Too many requests", retryAfterSec: rl.retryAfterSec },
        { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
      );
    }
    return memberStatsByReferralCode(codeNorm);
  }

  const authClient = await createServerSupabaseClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  const rateKey = user?.id ? `member-stats:user:${user.id}` : `member-stats:${ip}`;
  const rl = checkWaitlistMemberStatsRateLimit(rateKey);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests", retryAfterSec: rl.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } }
    );
  }

  const emailFromAuth = user?.email?.trim().toLowerCase() ?? null;

  if (!emailFromAuth) {
    return NextResponse.json(
      {
        error:
          "Join the waitlist to get a referral link, or sign in with your waitlist email to view referral stats and rank.",
        code: "SIGN_IN_REQUIRED" as const,
      },
      { status: 401 }
    );
  }

  const emailRaw = emailFromAuth;

  if (isWaitlistDirectPg()) {
    try {
      const result = await getWaitlistMemberReferralStatsPg({
        emailRaw,
        referralCode: undefined,
      });
      if (result.status === "not_found") {
        return NextResponse.json({ error: "Waitlist profile not found" }, { status: 404 });
      }
      if (result.status === "error") {
        return NextResponse.json({ error: result.message }, { status: 500 });
      }
      return NextResponse.json({
        ...result,
        authSource: "session" as const,
      });
    } catch (e) {
      console.error("[waitlist/member-stats] pg", e);
      const pgHint = waitlistPgFailureHint(e);
      const templateHint = getWaitlistDbUrlConfigIssue();
      return NextResponse.json(
        { error: templateHint || pgHint || "Database error" },
        { status: 503 }
      );
    }
  }

  const supabase = await createServiceRoleClient();
  const result = await getWaitlistMemberReferralStatsRest(supabase, {
    emailRaw,
    referralCode: undefined,
  });

  if (result.status === "not_found") {
    return NextResponse.json({ error: "Waitlist profile not found" }, { status: 404 });
  }
  if (result.status === "error") {
    return NextResponse.json({ error: result.message }, { status: 500 });
  }

  return NextResponse.json({
    ...result,
    authSource: "session" as const,
  });
}
