/** Product app origin (app.kroniqai.com / localhost:3000). */
const DEFAULT_APP_URL = "https://app.kroniqai.com";

export function getAppUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_ORIGIN?.trim() ||
    DEFAULT_APP_URL;
  return raw.replace(/\/$/, "");
}

/** Marketing site origin (kroniqai.com / localhost:3001). */
const DEFAULT_SITE_URL = "https://kroniqai.com";

export function getMarketingSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL;
  return raw.replace(/\/$/, "");
}

/** Pilot login always lives on the marketing site. */
export function getMarketingLoginUrl(nextPath?: string): string {
  const url = new URL(`${getMarketingSiteUrl()}/login`);
  if (nextPath?.trim()) url.searchParams.set("next", nextPath.trim());
  return url.toString();
}

function localLoginPath(nextPath?: string): string {
  if (!nextPath?.trim()) return "/login";
  return `/login?next=${encodeURIComponent(nextPath.trim())}`;
}

/** Login CTA on marketing pages — always same-origin `/login`. */
export function getPilotLoginHref(nextPath?: string): string {
  return localLoginPath(nextPath);
}

/** True when product app is on a different host than marketing (not used for login routing). */
export function usesSplitDeploy(siteOrigin?: string): boolean {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!appUrl) return false;

  try {
    const appOrigin = new URL(appUrl).origin;
    const marketing = siteOrigin ?? (process.env.NEXT_PUBLIC_SITE_URL?.trim() ? new URL(getMarketingSiteUrl()).origin : null);
    if (!marketing) return true;
    return appOrigin !== marketing;
  } catch {
    return true;
  }
}

/** After login on marketing, send users to the product app in production. */
export function getPostLoginAppUrl(nextPath?: string): string | null {
  if (!usesSplitDeploy()) return null;
  if (process.env.NODE_ENV === "development") return null;
  const path = nextPath?.trim() || "/home";
  return `${getAppUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

/** @deprecated Use getMarketingLoginUrl — login is on marketing, not app. */
export function getAppLoginUrl(nextPath?: string): string {
  return getMarketingLoginUrl(nextPath);
}
