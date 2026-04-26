import { WAITLIST_SETUP_MESSAGE } from "@/lib/waitlist/supabase-errors";

const isProd = process.env.NODE_ENV === "production";

/** User-safe copy when DB / pooler is down (no hostnames or SQL hints in prod). */
export const WAITLIST_UNAVAILABLE =
    "Waitlist signup is temporarily unavailable. Please try again in a few minutes.";

export function waitlistUnavailableMessage(detail?: string): string {
    if (!isProd && detail) return detail;
    return WAITLIST_UNAVAILABLE;
}

export function waitlistNotConfiguredMessage(): string {
    if (!isProd) {
        return "Waitlist is not configured. Set DATABASE_URL or NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY.";
    }
    return WAITLIST_UNAVAILABLE;
}

export function waitlistTableMissingMessage(): string {
    if (!isProd) return WAITLIST_SETUP_MESSAGE;
    return WAITLIST_UNAVAILABLE;
}

export function waitlistServerErrorMessage(internal?: string): string {
    if (!isProd && internal) return internal;
    return WAITLIST_UNAVAILABLE;
}
