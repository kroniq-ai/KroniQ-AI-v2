import { createClient } from "@/lib/supabase/client";
import { getAuthCallbackRedirectUrl } from "@/lib/supabase/auth-email-redirect";

/**
 * Sends Supabase email auth (6-digit OTP and/or magic link per project template).
 * `emailRedirectTo` must match Supabase Redirect URLs so the magic link can complete the session.
 */
export async function sendWaitlistEmailOtp(email: string) {
    const supabase = createClient();
    return supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
            shouldCreateUser: true,
            emailRedirectTo: getAuthCallbackRedirectUrl("/"),
        },
    });
}

export async function verifyEmailOtp(email: string, token: string) {
    const supabase = createClient();
    return supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: token.replace(/\s/g, ""),
        type: "email",
    });
}
