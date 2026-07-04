import type { SupabaseClient } from "@supabase/supabase-js";
import { publicLeaderboardName } from "@/lib/waitlist/display-name";
import { normalizeReferralCode } from "@/lib/waitlist/referral-code";
import type { WaitlistInvitee, WaitlistMemberReferralStatsOk } from "@/lib/waitlist/pg-handlers";

function computeRankWithTies(
  rows: { id: string; referral_points: number }[],
  myId: string
): number | null {
  const sorted = [...rows].sort(
    (a, b) => b.referral_points - a.referral_points || a.id.localeCompare(b.id)
  );
  let rank = 1;
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i].referral_points < sorted[i - 1].referral_points) {
      rank = i + 1;
    }
    if (sorted[i].id === myId) return rank;
  }
  return null;
}

export async function getWaitlistMemberReferralStatsRest(
  supabase: SupabaseClient,
  input: { emailRaw?: string; referralCode?: string | null }
): Promise<WaitlistMemberReferralStatsOk | { status: "not_found" } | { status: "error"; message: string }> {
  const emailRaw = input.emailRaw?.trim().toLowerCase();
  const codeNorm = normalizeReferralCode(input.referralCode ?? null);

  if (!emailRaw && !codeNorm) {
    return { status: "error", message: "Missing identifier" };
  }

  let query = supabase
    .from("waitlist_signups")
    .select("id, email, referral_code, referral_points, name, disqualified");

  if (emailRaw) {
    query = query.eq("email", emailRaw);
  } else {
    query = query.eq("referral_code", codeNorm!);
  }

  const { data: row, error } = await query.maybeSingle();

  if (error) {
    console.error("[waitlist] member stats rest select", error);
    return { status: "error", message: "Could not load referral stats" };
  }
  if (!row) {
    return { status: "not_found" };
  }

  const { count: dbCountRaw, error: cErr } = await supabase
    .from("waitlist_signups")
    .select("*", { count: "exact", head: true });

  if (cErr) {
    console.error("[waitlist] member stats rest count", cErr);
    return { status: "error", message: "Could not load referral stats" };
  }

  const { count: totalRankedRaw, error: trErr } = await supabase
    .from("waitlist_signups")
    .select("*", { count: "exact", head: true })
    .eq("disqualified", false);

  if (trErr) {
    console.error("[waitlist] member stats rest ranked count", trErr);
    return { status: "error", message: "Could not load referral stats" };
  }

  const dbCount = dbCountRaw ?? 0;
  const totalRanked = totalRankedRaw ?? 0;

  let invitees: WaitlistInvitee[] = [];
  try {
    const { data: invRows, error: invErr } = await supabase
      .from("waitlist_signups")
      .select("email, name, created_at")
      .eq("referred_by_code", row.referral_code as string)
      .order("created_at", { ascending: false })
      .limit(100);

    if (!invErr && invRows) {
      invitees = invRows.map((inv) => ({
        email: inv.email as string,
        displayName: publicLeaderboardName((inv.name as string) ?? ""),
        joinedAt: new Date(inv.created_at as string).toISOString(),
      }));
    } else if (invErr) {
      console.error("[waitlist] member stats invitees", invErr);
    }
  } catch (e) {
    console.error("[waitlist] member stats invitees", e);
  }

  if (row.disqualified) {
    return {
      status: "ok",
      email: row.email,
      referralCode: row.referral_code,
      referralPoints: row.referral_points ?? 0,
      displayName: publicLeaderboardName(row.name ?? ""),
      rank: null,
      totalRanked,
      dbCount,
      disqualified: true,
      invitees,
    };
  }

  const { data: rankedRows, error: rErr } = await supabase
    .from("waitlist_signups")
    .select("id, referral_points")
    .eq("disqualified", false);

  if (rErr || !rankedRows) {
    console.error("[waitlist] member stats rest rank rows", rErr);
    return { status: "error", message: "Could not load referral stats" };
  }

  const rank = computeRankWithTies(
    rankedRows.map((r) => ({
      id: r.id as string,
      referral_points: r.referral_points ?? 0,
    })),
    row.id as string
  );

  return {
    status: "ok",
    email: row.email,
    referralCode: row.referral_code,
    referralPoints: row.referral_points ?? 0,
    displayName: publicLeaderboardName(row.name ?? ""),
    rank,
    totalRanked,
    dbCount,
    disqualified: false,
    invitees,
  };
}
