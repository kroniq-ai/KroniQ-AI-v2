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

function canUsePostgrestCount(): boolean {
  return (
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()) &&
    Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim())
  );
}

function waitlistConfigured(): boolean {
  return isWaitlistDirectPg() || canUsePostgrestCount();
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

function notConfiguredResponse(): PublicWaitlistStats {
  const displayOffset = getWaitlistDisplayOffset();
  return {
    configured: false,
    dbCount: 0,
    /** Shown as exact number (no +) when the API cannot reach the DB. */
    displayCount: displayOffset,
    displayOffset,
    showPlus: false,
    leaderboardEnabled: process.env.NEXT_PUBLIC_WAITLIST_LEADERBOARD !== "false",
    leaderboard: [],
  };
}

/**
 * Build leaderboard from PostgREST (same shape as direct-PG path).
 */
async function buildLeaderboardPostgrest(
  supabase: Awaited<ReturnType<typeof createServiceRoleClient>>
): Promise<PublicWaitlistStats["leaderboard"]> {
  const out: PublicWaitlistStats["leaderboard"] = [];
  if (process.env.NEXT_PUBLIC_WAITLIST_LEADERBOARD === "false") {
    return out;
  }
  const { data: rows, error: lbError } = await supabase
    .from("waitlist_signups")
    .select("name, referral_points")
    .eq("disqualified", false)
    .gt("referral_points", 0)
    .order("referral_points", { ascending: false })
    .limit(5);

  if (lbError) {
    console.error("[getPublicWaitlistStats] leaderboard", lbError);
    return out;
  }
  if (!rows) return out;
  return rows.map((r, i) => ({
    rank: i + 1,
    displayName: publicLeaderboardName(r.name ?? ""),
    referralPoints: r.referral_points ?? 0,
  }));
}

/**
 * Row count: **PostgREST (service role) first** so the hero matches the Supabase dashboard
 * (direct Postgres was tried first before and a bad/empty pooler read could yield 0 → 0+40=40 only).
 * Falls back to direct Postgres on PostgREST errors (e.g. PGRST cache / transient issues).
 */
export async function getPublicWaitlistStats(): Promise<PublicWaitlistStats> {
  try {
    if (!waitlistConfigured()) {
      return notConfiguredResponse();
    }

    const leaderboardEnabled = process.env.NEXT_PUBLIC_WAITLIST_LEADERBOARD !== "false";
    const displayOffset = getWaitlistDisplayOffset();
    const canRest = canUsePostgrestCount();
    const canDirectPg = isWaitlistDirectPg();

    if (canRest) {
      try {
        const supabase = await createServiceRoleClient();
        const { count: dbCountRaw, error: countError } = await supabase
          .from("waitlist_signups")
          .select("*", { count: "exact", head: true });

        if (!countError) {
          const dbCount = dbCountRaw ?? 0;
          const displayCount = dbCount + displayOffset;
          const leaderboard = leaderboardEnabled ? await buildLeaderboardPostgrest(supabase) : [];
          return {
            configured: true,
            dbCount,
            displayCount,
            displayOffset,
            showPlus: false,
            leaderboardEnabled,
            leaderboard,
          };
        }

        console.error("[getPublicWaitlistStats] PostgREST count", countError);
        if (isWaitlistTableMissing(countError)) {
          return notConfiguredResponse();
        }
        /* else fall through to direct PG */
      } catch (e) {
        console.error("[getPublicWaitlistStats] PostgREST unexpected", e);
        /* fall through to direct PG */
      }
    }

    if (canDirectPg) {
      try {
        const { dbCount, leaderboard } = await getWaitlistStatsPgWithRetry();
        return {
          configured: true,
          dbCount,
          displayCount: dbCount + displayOffset,
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

    return notConfiguredResponse();
  } catch (e) {
    console.error("[getPublicWaitlistStats] unexpected", e);
    return notConfiguredResponse();
  }
}
