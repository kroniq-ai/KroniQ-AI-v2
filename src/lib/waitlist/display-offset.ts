/**
 * Hero / marketing number = `dbCount + offset` (returned as `displayCount` from `/api/waitlist/stats`).
 * Set `NEXT_PUBLIC_WAITLIST_DISPLAY_OFFSET=0` to show the raw DB count only; override for marketing (e.g. 40).
 */
const DEFAULT_OFFSET = 40;
const MAX_OFFSET = 100;

export function getWaitlistDisplayOffset(): number {
  const raw = process.env.NEXT_PUBLIC_WAITLIST_DISPLAY_OFFSET?.trim();
  if (raw) {
    const n = parseInt(raw, 10);
    if (!Number.isNaN(n)) {
      return Math.min(MAX_OFFSET, Math.max(0, n));
    }
  }
  return DEFAULT_OFFSET;
}
