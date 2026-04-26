import { NextResponse, type NextRequest } from "next/server";

import { hasValidLaunchAccessCookie, isLaunchAccessConfigured } from "@/lib/launch-access";

export async function GET(request: NextRequest) {
  if (!isLaunchAccessConfigured()) {
    return NextResponse.json({ allowed: false });
  }
  const allowed = await hasValidLaunchAccessCookie(request);
  return NextResponse.json({ allowed });
}
