/**
 * Canonical public site origin for referral links, sitemap, and OG metadata.
 * Server-only default when NEXT_PUBLIC_SITE_URL is unset or invalid.
 */
/** Fallback when `NEXT_PUBLIC_SITE_URL` is unset; keep in sync with your canonical host (www vs apex). */
export const DEFAULT_PUBLIC_SITE_ORIGIN = "https://www.kroniqai.com";

/** Use from API routes and server code; never relies on window. */
export function resolvePublicSiteOriginServer(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  if (raw) {
    try {
      return new URL(raw).origin;
    } catch {
      /* fall through */
    }
  }
  return DEFAULT_PUBLIC_SITE_ORIGIN;
}

/** Spread into waitlist JSON responses so clients can set the canonical origin before building share links. */
export function publicSiteUrlField(): { publicSiteUrl: string } {
  return { publicSiteUrl: resolvePublicSiteOriginServer() };
}
