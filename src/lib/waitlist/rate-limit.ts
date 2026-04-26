/**
 * In-memory rate limiter for waitlist POST. Fine for single-instance / low volume.
 * For multi-region serverless, replace with Redis or similar.
 *
 * Localhost / loopback uses a higher cap so dev (many retries) doesn’t hit 429 for 15 minutes.
 */

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 15 * 60 * 1000;
/** Production-ish: strict anti-abuse cap. */
const MAX_REQUESTS = 5;
/** Same window, room for local testing (npm run dev / npm start on this machine). */
const MAX_REQUESTS_LOOPBACK = 120;

function isLoopbackRateLimitKey(key: string): boolean {
  return (
    key.includes("127.0.0.1") ||
    key.includes("::1") ||
    key.endsWith(":unknown")
  );
}

function maxRequestsForKey(key: string): number {
  const override = process.env.WAITLIST_RATE_LIMIT_MAX?.trim();
  if (override && /^\d{1,5}$/.test(override)) {
    return Math.min(50_000, parseInt(override, 10));
  }
  return isLoopbackRateLimitKey(key) ? MAX_REQUESTS_LOOPBACK : MAX_REQUESTS;
}

export function checkWaitlistRateLimit(key: string): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const maxRequests = maxRequestsForKey(key);
  let b = buckets.get(key);
  if (!b || now >= b.resetAt) {
    b = { count: 1, resetAt: now + WINDOW_MS };
    buckets.set(key, b);
    return { ok: true };
  }
  if (b.count >= maxRequests) {
    return { ok: false, retryAfterSec: Math.ceil((b.resetAt - now) / 1000) };
  }
  b.count += 1;
  return { ok: true };
}

/** Read-only member stats — higher cap than waitlist POST. */
const MEMBER_STATS_BUCKETS = new Map<string, Bucket>();
const MEMBER_STATS_WINDOW_MS = 15 * 60 * 1000;
const MEMBER_STATS_MAX = 40;

export function checkWaitlistMemberStatsRateLimit(
  key: string
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  let b = MEMBER_STATS_BUCKETS.get(key);
  if (!b || now >= b.resetAt) {
    b = { count: 1, resetAt: now + MEMBER_STATS_WINDOW_MS };
    MEMBER_STATS_BUCKETS.set(key, b);
    return { ok: true };
  }
  if (b.count >= MEMBER_STATS_MAX) {
    return { ok: false, retryAfterSec: Math.ceil((b.resetAt - now) / 1000) };
  }
  b.count += 1;
  return { ok: true };
}

/**
 * Per-email PATCH rate limit (profile updates).
 * Limits to 3 updates per 24 h per email address.
 * Prevents anyone who knows an email from mass-editing that user's profile
 * without requiring full email verification.
 * Dev loopback gets a higher cap so testing isn't friction.
 */
const PATCH_EMAIL_BUCKETS = new Map<string, Bucket>();
const PATCH_EMAIL_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours
const PATCH_EMAIL_MAX = 3;
const PATCH_EMAIL_MAX_LOOPBACK = 120;

export function checkWaitlistPatchEmailRateLimit(
  emailKey: string
): { ok: true } | { ok: false; retryAfterSec: number } {
  const now = Date.now();
  const max = isLoopbackRateLimitKey(emailKey) ? PATCH_EMAIL_MAX_LOOPBACK : PATCH_EMAIL_MAX;
  let b = PATCH_EMAIL_BUCKETS.get(emailKey);
  if (!b || now >= b.resetAt) {
    b = { count: 1, resetAt: now + PATCH_EMAIL_WINDOW_MS };
    PATCH_EMAIL_BUCKETS.set(emailKey, b);
    return { ok: true };
  }
  if (b.count >= max) {
    return { ok: false, retryAfterSec: Math.ceil((b.resetAt - now) / 1000) };
  }
  b.count += 1;
  return { ok: true };
}
