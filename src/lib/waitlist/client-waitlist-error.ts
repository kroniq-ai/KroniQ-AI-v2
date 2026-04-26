/**
 * Display-safe waitlist errors in the browser (fallback if API ever returns raw hints).
 */
export function formatWaitlistClientError(message: string | undefined, status: number): string {
    if (!message?.trim()) {
        return "Something went wrong. Try again.";
    }
    if (process.env.NODE_ENV === "production" && (status === 503 || status === 500)) {
        if (
            /pooler|supabase|PGRST|postgres\.|DATABASE_URL|WAITLIST_DATABASE/i.test(message)
        ) {
            return "Waitlist signup is temporarily unavailable. Please try again in a few minutes.";
        }
    }
    return message;
}
