import type { Metadata } from "next";
import { resolvePublicSiteOriginServer } from "@/lib/waitlist/public-site-url";

export const siteName = "KroniQ";
export const siteTagline = "Your autonomous AI CMO";

const DEFAULT_DESC =
  "KroniQ is your autonomous AI CMO: outreach, content, leads, and follow-up from one mission. Learn your company once — growth runs around the clock. Private beta waitlist.";

export function getSiteUrl(): string {
  return resolvePublicSiteOriginServer().replace(/\/$/, "");
}

export function absUrl(path: string): string {
  const base = getSiteUrl();
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export const defaultDescription = DEFAULT_DESC;

export const openGraphImage = {
  url: "/opengraph-image" as const,
  width: 1200,
  height: 630,
  alt: `${siteName} — ${siteTagline} for founder-led growth`,
} as const;

export function verificationMetadata(): Metadata["verification"] {
  const google = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
  if (!google) return undefined;
  return { google };
}

/** Sitemap + JSON-LD sitelink-style list — indexable URLs only. */
export const SITEMAP_LANDING_ROUTES: {
  path: string;
  name: string;
  description: string;
}[] = [
  { path: "/", name: "Home", description: defaultDescription },
  { path: "/#how-it-works", name: "How it works", description: "Brief once, then KroniQ runs memory, parallel campaigns, and lead sourcing from one workspace." },
  { path: "/#faq", name: "FAQ", description: "Common questions about the KroniQ private beta, waitlist, and autonomous AI CMO." },
  { path: "/about", name: "About KroniQ", description: "Mission, team, and roadmap behind KroniQ — AI growth for startups and enterprises." },
  { path: "/cto", name: "KroniQ CTO", description: "AI agents that architect, build, deploy, and secure your product." },
  { path: "/login", name: "Log in", description: "Sign in to your KroniQ dashboard and missions." },
  { path: "/privacy", name: "Privacy policy", description: "How KroniQ handles your data for the site and waitlist." },
  { path: "/terms", name: "Terms of service", description: "Terms for using the KroniQ website, waitlist, and previews." },
];
