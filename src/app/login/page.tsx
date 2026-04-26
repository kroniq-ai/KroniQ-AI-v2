"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getAuthCallbackRedirectUrl } from "@/lib/supabase/auth-email-redirect";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { KroniQWordmarkOnDark } from "@/components/brand/kroniq-logo-png";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [otpCode, setOtpCode] = useState("");
    const [stage, setStage] = useState<"email" | "otp">("email");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const sendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const supabase = createClient();
            const { error: err } = await supabase.auth.signInWithOtp({
                email: email.trim().toLowerCase(),
                options: {
                    shouldCreateUser: false,
                    emailRedirectTo: getAuthCallbackRedirectUrl("/dashboard"),
                },
            });
            if (err) {
                setError(err.message);
                return;
            }
            setStage("otp");
        } catch {
            setError("Could not send code.");
        } finally {
            setLoading(false);
        }
    };

    const verify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const supabase = createClient();
            const { error: err } = await supabase.auth.verifyOtp({
                email: email.trim().toLowerCase(),
                token: otpCode.replace(/\s/g, ""),
                type: "email",
            });
            if (err) {
                setError(err.message);
                return;
            }
            router.replace("/dashboard");
        } catch {
            setError("Invalid or expired code.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
            <div className="w-full max-w-md p-8 glass-card">
                <Link href="/" className="mb-8 block">
                    <KroniQWordmarkOnDark className="h-8" priority />
                </Link>
                <h1 className="text-xl font-semibold mb-6">Sign in</h1>

                {stage === "email" ? (
                    <form onSubmit={sendCode} className="space-y-4">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/25"
                            required
                            autoComplete="email"
                        />
                        {error && <p className="text-neutral-400 text-sm">{error}</p>}
                        <button type="submit" disabled={loading} className="w-full btn-gradient py-3 disabled:opacity-50">
                            {loading ? "Sending…" : "Email me a sign-in code"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={verify} className="space-y-4">
                        <p className="text-sm text-white/50">Code sent to {email.trim()}</p>
                        <input
                            type="text"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder="6-digit code"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-center text-lg tracking-widest font-mono placeholder-white/30 focus:outline-none focus:border-white/25"
                        />
                        {error && <p className="text-neutral-400 text-sm">{error}</p>}
                        <button type="submit" disabled={loading || otpCode.length !== 6} className="w-full btn-gradient py-3 disabled:opacity-50">
                            {loading ? "Verifying…" : "Sign in"}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setStage("email");
                                setOtpCode("");
                                setError("");
                            }}
                            className="w-full text-sm text-white/40 hover:text-white/60"
                        >
                            Use a different email
                        </button>
                    </form>
                )}

                <p className="text-sm text-white/50 mt-6 text-center">
                    No account?{" "}
                    <Link href="/signup" className="text-white/80 hover:text-white">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
