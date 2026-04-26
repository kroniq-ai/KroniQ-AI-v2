import { DEFAULT_PUBLIC_SITE_ORIGIN } from "@/lib/waitlist/public-site-url";

export const WAITLIST_MEMBER_STORAGE_KEY = "voyd_waitlist_member";

export type WaitlistMemberSession = {
  email: string;
  name: string;
  avatarUrl: string | null;
  referralCode: string;
  source: "form" | "otp";
};

const originListeners = new Set<() => void>();

/** Client-only: set from GET /api/public-config or waitlist API responses (server-authoritative). */
let clientPublicOriginOverride: string | null = null;

function notifyPublicSiteOriginListeners() {
  originListeners.forEach((cb) => cb());
}

/**
 * Subscribe to changes in the resolved public origin (e.g. after /api/public-config loads).
 * Use with useSyncExternalStore in components that display referral URLs.
 */
export function subscribePublicSiteOrigin(onStoreChange: () => void): () => void {
  originListeners.add(onStoreChange);
  return () => originListeners.delete(onStoreChange);
}

/** Apply origin from GET /api/public-config or JSON field `publicSiteUrl` on signup responses. */
export function setPublicSiteOriginOverride(raw: string | null | undefined) {
  if (!raw || typeof raw !== "string") {
    clientPublicOriginOverride = null;
    notifyPublicSiteOriginListeners();
    return;
  }
  const trimmed = raw.trim().replace(/\/+$/, "");
  try {
    clientPublicOriginOverride = new URL(trimmed).origin;
  } catch {
    clientPublicOriginOverride = null;
  }
  notifyPublicSiteOriginListeners();
}

function originFromEnv(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  if (fromEnv) {
    try {
      return new URL(fromEnv).origin;
    } catch {
      /* fall through */
    }
  }
  return "";
}

/**
 * Snapshot for useSyncExternalStore getServerSnapshot (no window).
 * Matches first client paint when env is set; otherwise uses production default so SSR/hydration stay aligned.
 */
export function getPublicSiteOriginServerSnapshot(): string {
  const fromEnv = originFromEnv();
  if (fromEnv) return fromEnv;
  return DEFAULT_PUBLIC_SITE_ORIGIN;
}

export function getWaitlistMemberSession(): WaitlistMemberSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(WAITLIST_MEMBER_STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as WaitlistMemberSession;
    if (!p?.email || !p?.referralCode) return null;
    return p;
  } catch {
    return null;
  }
}

export function setWaitlistMemberSession(session: WaitlistMemberSession) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WAITLIST_MEMBER_STORAGE_KEY, JSON.stringify(session));
    window.dispatchEvent(new Event("kroniq-waitlist-member-change"));
  } catch {
    // ignore
  }
}

export function clearWaitlistMemberSession() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(WAITLIST_MEMBER_STORAGE_KEY);
    window.dispatchEvent(new Event("kroniq-waitlist-member-change"));
  } catch {
    // ignore
  }
}

/**
 * Public site origin for referral links: server override (from /api/public-config), then env, then default.
 * Does not use window.location (avoids localhost in copied links when env is missing).
 */
export function getPublicSiteOrigin(): string {
  if (clientPublicOriginOverride) return clientPublicOriginOverride;
  const fromEnv = originFromEnv();
  if (fromEnv) return fromEnv;
  return DEFAULT_PUBLIC_SITE_ORIGIN;
}

/** Full share URL for the waitlist referral query param (client-only). */
export function buildWaitlistReferralShareUrl(referralCode: string): string {
  if (typeof window === "undefined") return "";
  const origin = getPublicSiteOrigin();
  if (!origin) return "";
  return `${origin}/?ref=${encodeURIComponent(referralCode)}`;
}

export function openLeaderboardModal() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("voyd-open-leaderboard"));
}
