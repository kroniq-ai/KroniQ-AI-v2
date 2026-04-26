import { NextResponse } from "next/server";

/**
 * Legacy endpoint: linked Google OAuth sessions to waitlist rows.
 * Authentication is now email OTP; clients should not call this route.
 */
export function POST() {
  return NextResponse.json(
    {
      error:
        "This endpoint is no longer available. Complete the waitlist using email verification (one-time code) in the app.",
      code: "DEPRECATED" as const,
    },
    { status: 410 }
  );
}
