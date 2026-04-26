import { NextResponse } from "next/server";
import { getPublicWaitlistStats } from "@/lib/waitlist/get-public-waitlist-stats";

export async function GET() {
  try {
    const stats = await getPublicWaitlistStats();
    return NextResponse.json({
      configured: stats.configured,
      dbCount: stats.dbCount,
      displayCount: stats.displayCount,
      displayOffset: stats.displayOffset,
      showPlus: stats.showPlus,
      leaderboardEnabled: stats.leaderboardEnabled,
      leaderboard: stats.leaderboard,
    });
  } catch {
    return NextResponse.json({ error: "Stats unavailable" }, { status: 500 });
  }
}
