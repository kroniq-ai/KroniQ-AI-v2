import { NextResponse } from "next/server";

import { LAUNCH_ACCESS_COOKIE } from "@/lib/app-access";
import { getLaunchAllowedEmails, isLaunchAccessConfigured } from "@/lib/launch-access";
import { signLaunchToken } from "@/lib/launch-access-token";

const MAX_AGE_SEC = 60 * 60 * 24 * 7; // 7 days

export async function POST(request: Request) {
  if (!isLaunchAccessConfigured()) {
    // 200 avoids noisy browser console "503" when optional launch gate env is unset (waitlist still works).
    return NextResponse.json({ ok: false, configured: false });
  }

  const secret = process.env.LAUNCH_ACCESS_SECRET!.trim();
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const allowed = getLaunchAllowedEmails();
  if (!allowed.has(email)) {
    return NextResponse.json({ error: "Not available" }, { status: 403 });
  }

  const exp = Date.now() + MAX_AGE_SEC * 1000;
  const token = await signLaunchToken(email, exp, secret);

  const res = NextResponse.json({ ok: true });
  const isProd = process.env.NODE_ENV === "production";
  res.cookies.set(LAUNCH_ACCESS_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
  return res;
}
