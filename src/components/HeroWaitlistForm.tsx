"use client";

import { WAITLIST_REF_STORAGE_KEY } from "@/lib/waitlist/storage";
import {
    buildWaitlistReferralShareUrl,
    getPublicSiteOriginServerSnapshot,
    getWaitlistMemberSession,
    openLeaderboardModal,
    setPublicSiteOriginOverride,
    setWaitlistMemberSession,
    subscribePublicSiteOrigin,
} from "@/lib/waitlist/client-session";
import { requestLaunchAccess } from "@/lib/launch-access-client";
import { fetchWithTimeout, isTimeoutAbort } from "@/lib/waitlist/client-fetch";
import { formatWaitlistClientError } from "@/lib/waitlist/client-waitlist-error";
import { isDisposableEmailDomain, isValidEmailForSignup } from "@/lib/waitlist/email-validation";
import { cn } from "@/lib/utils";
import { ArrowRight, CircleCheck, Trophy, Copy, Check } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import { motion } from "framer-motion";
import ReferralOnboardingModal from "./ReferralOnboardingModal";

/* ─── Confetti burst ─── */
interface Particle { id: number; x: number; y: number; vx: number; vy: number; color: string; life: number; }
const CONFETTI_COLORS = ["#10b981", "#22d3ee", "#f59e0b", "#a78bfa", "#fb7185"];

function useConfetti(trigger: boolean) {
    const [particles, setParticles] = useState<Particle[]>([]);
    const fired = useRef(false);
    useEffect(() => {
        if (!trigger || fired.current) return;
        fired.current = true;
        const burst: Particle[] = Array.from({ length: 28 }, (_, i) => ({
            id: i,
            x: 50,
            y: 50,
            vx: (Math.random() - 0.5) * 12,
            vy: -(Math.random() * 8 + 4),
            color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
            life: 1,
        }));
        setParticles(burst);
        const interval = setInterval(() => {
            setParticles(prev => {
                const next = prev
                    .map(p => ({ ...p, x: p.x + p.vx * 0.5, y: p.y + p.vy * 0.5, vy: p.vy + 0.4, life: p.life - 0.025 }))
                    .filter(p => p.life > 0);
                if (next.length === 0) clearInterval(interval);
                return next;
            });
        }, 16);
        return () => clearInterval(interval);
    }, [trigger]);
    return particles;
}

function ConfettiBurst({ trigger }: { trigger: boolean }) {
    const particles = useConfetti(trigger);
    if (!particles.length) return null;
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            {particles.map(p => (
                <div
                    key={p.id}
                    className="absolute h-2 w-2 rounded-sm"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        background: p.color,
                        opacity: p.life,
                        transform: `rotate(${p.x * 4}deg)`,
                        transition: "none",
                    }}
                />
            ))}
        </div>
    );
}

const EXTRA_OPEN = "voyd-waitlist-extra-open";

function validateEmailInput(raw: string): string | null {
    const t = raw.trim();
    if (!t) return "Enter your email.";
    if (!isValidEmailForSignup(t)) return "That doesn't look like a valid email address.";
    if (isDisposableEmailDomain(t)) return "Please use a permanent email address.";
    return null;
}

type HeroWaitlistFormProps = { className?: string };

export function HeroWaitlistForm({ className }: HeroWaitlistFormProps) {
    const mounted = useRef(true);
    useEffect(() => {
        mounted.current = true;
        return () => { mounted.current = false; };
    }, []);

    const [email, setEmail] = useState("");
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState(false);
    const [alreadyJoined, setAlreadyJoined] = useState(false);
    const [error, setError] = useState("");
    const [touched, setTouched] = useState(false);
    const [shareReferralCode, setShareReferralCode] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [referrerEmail, setReferrerEmail] = useState<string | null>(null);
    const [onboardingOpen, setOnboardingOpen] = useState(false);

    useEffect(() => {
        const m = getWaitlistMemberSession();
        if (m?.referralCode) {
            setDone(true);
            setAlreadyJoined(true);
            setShareReferralCode(m.referralCode);
        }
    }, []);

    const joinWaitlist = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = email.trim().toLowerCase();
        const localErr = validateEmailInput(trimmed);
        if (localErr) { setError(localErr); return; }
        setBusy(true);
        setError("");
        let referredBy: string | undefined;
        try { referredBy = sessionStorage.getItem(WAITLIST_REF_STORAGE_KEY) ?? undefined; } catch { referredBy = undefined; }
        try {
            const res = await fetchWithTimeout("/api/waitlist", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: trimmed, quickJoin: true, referredBy }),
            });
            if (!mounted.current) return;
            const data = (await res.json()) as {
                status?: string; referralCode?: string; publicSiteUrl?: string;
                referrerEmail?: string; error?: string; retryAfterSec?: number;
            };
            if (!mounted.current) return;
            if (!res.ok) {
                if (res.status === 429) setError(`Too many attempts. Try again in ${data.retryAfterSec ?? 60}s.`);
                else setError(formatWaitlistClientError(data.error ?? "Something went wrong", res.status));
                return;
            }
            const dup = data.status === "duplicate";
            setAlreadyJoined(dup);
            setReferrerEmail(!dup && data.referrerEmail ? data.referrerEmail : null);
            if (data.referralCode) {
                setPublicSiteOriginOverride(data.publicSiteUrl);
                setWaitlistMemberSession({ email: trimmed, name: "Waitlist member", avatarUrl: null, referralCode: data.referralCode, source: "form" });
                setShareReferralCode(data.referralCode);
                setOnboardingOpen(true);
            } else {
                setShareReferralCode(null);
            }
            void requestLaunchAccess(trimmed);
            setDone(true);
            window.dispatchEvent(new CustomEvent(EXTRA_OPEN, { detail: { email: trimmed } }));
        } catch (e) {
            if (mounted.current) {
                setError(isTimeoutAbort(e) ? "Request timed out. Check your connection and try again." : "Something went wrong. Try again.");
            }
        } finally {
            if (mounted.current) setBusy(false);
        }
    };

    const shareUrl = useSyncExternalStore(
        subscribePublicSiteOrigin,
        () => (shareReferralCode ? buildWaitlistReferralShareUrl(shareReferralCode) : null),
        () => shareReferralCode ? `${getPublicSiteOriginServerSnapshot()}/?ref=${encodeURIComponent(shareReferralCode)}` : null
    );

    return (
        <div className={cn("relative w-full", className)}>
            <ConfettiBurst trigger={done} />
            {!done && (
                <form onSubmit={joinWaitlist} className="relative">
                    <div className="flex flex-col sm:flex-row items-stretch gap-2.5 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md shadow-2xl">
                        <label className="sr-only" htmlFor="hero-waitlist-email">Email address</label>
                        <input
                            id="hero-waitlist-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            inputMode="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); if (touched) setError(""); }}
                            onBlur={() => setTouched(true)}
                            disabled={busy}
                            className="flex-1 min-w-0 min-h-[3rem] px-5 py-3 text-[15px] bg-transparent text-white placeholder:text-white/30 outline-none rounded-xl transition-all focus:bg-white/[0.02]"
                        />
                        <div className="shrink-0 flex items-center justify-center">
                            {busy ? (
                                <button
                                    type="button"
                                    disabled={true}
                                    className="group inline-flex items-center justify-center min-h-[3rem] px-7 rounded-full text-[14px] font-bold text-black bg-white/50 cursor-not-allowed transition-all duration-200"
                                >
                                    <span className="tabular-nums opacity-70">…</span>
                                </button>
                            ) : (
                                <LiquidMetalButton label="Join Waitlist" />
                            )}
                        </div>
                    </div>
                </form>
            )}

            {/* Error */}
            {error && (
                <p className="mt-3 text-center text-[13px] text-red-500" role="alert">{error}</p>
            )}

            {/* Privacy note */}
            {!done && (
                <p className="mt-3 text-center text-[11px] text-white/22">
                    No spam · Unsubscribe anytime · Private beta
                </p>
            )}

            {/* Success state */}
            {done && (
                <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col items-center text-center gap-4 mt-6 p-7 rounded-2xl bg-black/40 border border-white/[0.08] backdrop-blur-2xl shadow-[0_16px_40px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] w-full"
                >
                    <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_24px_rgba(16,185,129,0.4),inset_0_2px_6px_rgba(255,255,255,0.5),inset_0_-3px_6px_rgba(0,0,0,0.2)] mb-2">
                        <Check className="size-8 text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]" strokeWidth={3.5} aria-hidden />
                    </div>
                    <div>
                        <p className="text-[16px] font-semibold text-white mb-1">
                            {alreadyJoined ? "You're already on the list!" : "You're on the waitlist!"}
                        </p>
                        <p className="text-[13px] text-white/50 max-w-sm mx-auto leading-relaxed">
                            {alreadyJoined 
                                ? "You've already secured your spot. Share your referral link below to move up the queue." 
                                : referrerEmail 
                                    ? `Referred by ${referrerEmail}. We'll reach out when your spot is ready.`
                                    : "We'll reach out when your spot is ready. Share your link to move up."}
                        </p>
                    </div>

                    {/* Referral link */}
                    {shareUrl && (
                        <div className="w-full mt-2">
                            <p className="text-[10px] uppercase tracking-[0.15em] font-medium text-white/40 mb-2 text-left px-1">Your Referral Link</p>
                            <div className="flex gap-2 items-stretch p-1.5 rounded-xl bg-black/40 border border-white/[0.08]">
                                <div
                                    className="flex-1 min-w-0 px-3 py-2 text-[12px] truncate text-white/70 flex items-center bg-transparent"
                                    title={shareUrl}
                                >
                                    {shareUrl}
                                </div>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        try { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { setCopied(false); }
                                    }}
                                    className={cn(
                                        "shrink-0 px-4 flex items-center justify-center gap-1.5 rounded-lg text-[12px] font-semibold transition-all duration-300 cursor-pointer min-w-[90px]",
                                        copied 
                                            ? "bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-emerald-400" 
                                            : "bg-white text-black hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98]"
                                    )}
                                >
                                    {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                                    {copied ? "Copied!" : "Copy Link"}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Leaderboard button */}
                    <div className="mt-1 w-full">
                        <button
                            type="button"
                            onClick={() => openLeaderboardModal()}
                            className="w-full inline-flex justify-center items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-[12px] font-medium text-white/70 transition-all hover:bg-white/[0.06] hover:text-white"
                        >
                            <Trophy className="size-3.5" aria-hidden />
                            View Referral Leaderboard
                        </button>
                    </div>
                </motion.div>
            )}

            <ReferralOnboardingModal 
                open={onboardingOpen} 
                onClose={() => setOnboardingOpen(false)} 
                referralShareUrl={shareUrl || ""} 
            />
        </div>
    );
}
