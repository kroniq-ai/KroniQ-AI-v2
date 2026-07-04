import type { NextRequest } from "next/server";

import { LAUNCH_ACCESS_COOKIE } from "@/lib/app-access";
import { verifyLaunchToken } from "@/lib/launch-access-token";

export function getLaunchAllowedEmails(): Set<string> {
  const raw = process.env.LAUNCH_ALLOWED_EMAILS?.trim();
  if (!raw) return new Set();
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isLaunchAccessConfigured(): boolean {
  return (
    getLaunchAllowedEmails().size > 0 &&
    Boolean(process.env.LAUNCH_ACCESS_SECRET?.trim())
  );
}

export async function hasValidLaunchAccessCookie(request: NextRequest): Promise<boolean> {
  if (!isLaunchAccessConfigured()) return false;
  const secret = process.env.LAUNCH_ACCESS_SECRET!.trim();
  const token = request.cookies.get(LAUNCH_ACCESS_COOKIE)?.value;
  if (!token) return false;
  const payload = await verifyLaunchToken(token, secret);
  if (!payload) return false;
  const allowed = getLaunchAllowedEmails();
  return allowed.has(payload.e.toLowerCase());
}
