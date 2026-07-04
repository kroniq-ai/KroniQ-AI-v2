/**
 * Public waitlist vs full app access (dev gate).
 * Set NEXT_PUBLIC_APP_ACCESS=waitlist to hide the app from the public.
 */

export const DEV_ACCESS_COOKIE = "voyd_dev_access";

/** HttpOnly cookie: HMAC-signed launch gate (POST /api/launch-access/verify when email ∈ LAUNCH_ALLOWED_EMAILS). */
export const LAUNCH_ACCESS_COOKIE = "voyd_launch_access";

export function isWaitlistMode(): boolean {
  return process.env.NEXT_PUBLIC_APP_ACCESS === "waitlist";
}

export function isAppAccessOpen(): boolean {
  return !isWaitlistMode();
}
