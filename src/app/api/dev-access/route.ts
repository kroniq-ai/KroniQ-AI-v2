import { NextResponse } from "next/server";
import { DEV_ACCESS_COOKIE } from "@/lib/app-access";

export async function POST(request: Request) {
  const secret = process.env.DEV_ACCESS_PASSWORD;
  if (!secret) {
    return NextResponse.json(
      { error: "DEV_ACCESS_PASSWORD is not configured" },
      { status: 503 }
    );
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.password !== secret) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  const isProd = process.env.NODE_ENV === "production";
  res.cookies.set(DEV_ACCESS_COOKIE, "1", {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}
