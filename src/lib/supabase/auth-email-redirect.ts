/**
 * Magic-link redirect target for signInWithOtp. Must be listed in Supabase Dashboard →
 * Authentication → URL Configuration → Redirect URLs (e.g. https://www.kroniqai.com/api/auth/callback and http://localhost:3000/api/auth/callback).
 */
export function getAuthCallbackRedirectUrl(nextPath = "/"): string {
    const next = nextPath.startsWith("/") ? nextPath : `/${nextPath}`;
    const q = `next=${encodeURIComponent(next)}`;
    if (typeof window !== "undefined") {
        return `${window.location.origin}/api/auth/callback?${q}`;
    }
    const base = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ?? "";
    return `${base}/api/auth/callback?${q}`;
}
