import { createServiceRoleClient } from "@/lib/supabase/server";
import { publicLeaderboardName } from "@/lib/waitlist/display-name";
import { getWaitlistDisplayOffset } from "@/lib/waitlist/display-offset";
import { isWaitlistTableMissing } from "@/lib/waitlist/supabase-errors";
import { isWaitlistDirectPg } from "@/lib/waitlist/direct-pg";
import { waitlistPgFailureHint } from "@/lib/waitlist/pg-connect-errors";
import { getWaitlistStatsPg } from "@/lib/waitlist/pg-handlers";

const PG_STATS_TIMEOUT_MS = 4000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`PG stats timeout after ${ms}ms`)), ms)
    ),
  ]);
}

async function getWaitlistStatsPgWithRetry() {
  return withTimeout(getWaitlistStatsPg(), PG_STATS_TIMEOUT_MS);
}

function waitlistConfigured(): boolean {
  const rest =
    Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim());
  return isWaitlistDirectPg() || rest;
}

export type PublicWaitlistStats = {
  configured: boolean;
  dbCount: number;
  displayCount: number;
  displayOffset: number;
  showPlus: boolean;
  leaderboardEnabled: boolean;
  leaderboard: { rank: number; displayName: string; referralPoints: number }[];
};

const empty: PublicWaitlistStats = {
  configured: false,
  dbCount: 0,
  displayCount: 0,
  displayOffset: 0,
  showPlus: false,
  leaderboardEnabled: false,
  leaderboard: [],
};

/**
 * Shared by `GET /api/waitlist/stats` and the home page (SSR) so the hero can show a count on first paint.
 */
export async function getPublicWaitlistStats(): Promise<PublicWaitlistStats> {
  try {
  if (!waitlistConfigured()) {
    return { ...empty };
  }

  const leaderboardEnabled = process.env.NEXT_PUBLIC_WAITLIST_LEADERBOARD !== "false";
  const displayOffset = getWaitlistDisplayOffset();

  if (isWaitlistDirectPg()) {
    try {
      const { dbCount, leaderboard } = await getWaitlistStatsPgWithRetry();
      const displayCount = dbCount + displayOffset;
      return {
        configured: true,
        dbCount,
        displayCount,
        displayOffset,
        showPlus: false,
        leaderboardEnabled,
        leaderboard,
      };
    } catch (e) {
      const pgHint = waitlistPgFailureHint(e);
      console.error("[getPublicWaitlistStats] direct Postgres failed", pgHint ?? e);
    }
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  ) {
    console.error(
      "[getPublicWaitlistStats] no REST credentials — cannot use PostgREST (set URL + service role, or fix DATABASE_URL pooler)"
    );
    return { ...empty };
  }

  const supabase = await createServiceRoleClient();

  const { count: dbCountRaw, error: countError } = await supabase
    .from("waitlist_signups")
    .select("*", { count: "exact", head: true });

  if (countError) {
    console.error("[getPublicWaitlistStats] count", countError);
    if (isWaitlistTableMissing(countError)) {
      return { ...empty };
    }
    return { ...empty };
  }

  const dbCount = dbCountRaw ?? 0;
  const displayCount = dbCount + displayOffset;

  let leaderboard: PublicWaitlistStats["leaderboard"] = [];

  if (leaderboardEnabled) {
    const { data: rows, error: lbError } = await supabase
      .from("waitlist_signups")
      .select("name, referral_points")
      .eq("disqualified", false)
      .gt("referral_points", 0)
      .order("referral_points", { ascending: false })
      .limit(5);

    if (lbError) {
      console.error("[getPublicWaitlistStats] leaderboard", lbError);
    } else if (rows) {
      leaderboard = rows.map((r, i) => ({
        rank: i + 1,
        displayName: publicLeaderboardName(r.name ?? ""),
        referralPoints: r.referral_points ?? 0,
      }));
    }
  }

  return {
    configured: true,
    dbCount,
    displayCount,
    displayOffset,
    showPlus: false,
    leaderboardEnabled,
    leaderboard,
  };
  } catch (e) {
    console.error("[getPublicWaitlistStats] unexpected", e);
    return { ...empty };
  }
}
