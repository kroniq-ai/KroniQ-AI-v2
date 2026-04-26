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
import { ArrowRight, CircleCheck, Trophy } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

const EXTRA_OPEN = "voyd-waitlist-extra-open";

function validateEmailInput(raw: string): string | null {
    const t = raw.trim();
    if (!t) return "Enter your email.";
    if (!isValidEmailForSignup(t)) {
        return "That doesn’t look like a valid email address.";
    }
    if (isDisposableEmailDomain(t)) {
        return "Please use a permanent email address.";
    }
    return null;
}

type HeroWaitlistFormProps = {
    className?: string;
};

export function HeroWaitlistForm({ className }: HeroWaitlistFormProps) {
    const mounted = useRef(true);
    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
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

    // Restore "already on waitlist" from localStorage; referral URL uses origin from /api/public-config (see layout).
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
        if (localErr) {
            setError(localErr);
            return;
        }
        setBusy(true);
        setError("");
        let referredBy: string | undefined;
        try {
            referredBy = sessionStorage.getItem(WAITLIST_REF_STORAGE_KEY) ?? undefined;
        } catch {
            referredBy = undefined;
        }
        try {
            const res = await fetchWithTimeout("/api/waitlist", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: trimmed,
                    quickJoin: true,
                    referredBy,
                }),
            });
            if (!mounted.current) return;

            const data = (await res.json()) as {
                status?: string;
                referralCode?: string;
                publicSiteUrl?: string;
                referrerEmail?: string;
                error?: string;
                retryAfterSec?: number;
            };
            if (!mounted.current) return;

            if (!res.ok) {
                if (res.status === 429) {
                    setError(`Too many attempts. Try again in ${data.retryAfterSec ?? 60}s.`);
                } else {
                    setError(formatWaitlistClientError(data.error ?? "Something went wrong", res.status));
                }
                return;
            }

            const dup = data.status === "duplicate";
            setAlreadyJoined(dup);
            setReferrerEmail(!dup && data.referrerEmail ? data.referrerEmail : null);

            if (data.referralCode) {
                setPublicSiteOriginOverride(data.publicSiteUrl);
                setWaitlistMemberSession({
                    email: trimmed,
                    name: "Waitlist member",
                    avatarUrl: null,
                    referralCode: data.referralCode,
                    source: "form",
                });
                setShareReferralCode(data.referralCode);
            } else {
                setShareReferralCode(null);
            }

            void requestLaunchAccess(trimmed);
            setDone(true);
            window.dispatchEvent(new CustomEvent(EXTRA_OPEN, { detail: { email: trimmed } }));
        } catch (e) {
            if (mounted.current) {
                setError(
                    isTimeoutAbort(e)
                        ? "Request timed out. Check your connection and try again."
                        : "Something went wrong. Try again."
                );
            }
        } finally {
            if (mounted.current) setBusy(false);
        }
    };

    const shareUrl = useSyncExternalStore(
        subscribePublicSiteOrigin,
        () => (shareReferralCode ? buildWaitlistReferralShareUrl(shareReferralCode) : null),
        () =>
            shareReferralCode
                ? `${getPublicSiteOriginServerSnapshot()}/?ref=${encodeURIComponent(shareReferralCode)}`
                : null
    );

    return (
        <div className={cn("mt-10 w-full max-w-xl mx-auto", className)}>
            {!done && (
                <form onSubmit={joinWaitlist} className="relative">
                    <div
                        className="relative overflow-hidden rounded-[1.35rem] p-[1px] shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
                        style={{
                            background:
                                "linear-gradient(145deg, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0.08) 42%, rgba(255,255,255,0.04) 100%)",
                        }}
                    >
                        <div
                            className="flex flex-col overflow-hidden rounded-[1.3rem] sm:flex-row sm:items-stretch"
                            style={{
                                background:
                                    "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)",
                                boxShadow:
                                    "inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.45), 0 16px 48px -28px rgba(0,0,0,0.65)",
                            }}
                        >
                            <div className="relative min-h-[3.25rem] min-w-0 flex-1 overflow-hidden rounded-t-[1.28rem] backdrop-blur-2xl sm:rounded-bl-[1.28rem] sm:rounded-tl-[1.28rem] sm:rounded-tr-none sm:rounded-br-none">
                                <label className="sr-only" htmlFor="hero-waitlist-email">
                                    Email
                                </label>
                                <input
                                    id="hero-waitlist-email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    inputMode="email"
                                    placeholder="you@company.com"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        if (touched) setError("");
                                    }}
                                    onBlur={() => setTouched(true)}
                                    disabled={busy}
                                    className="h-full min-h-[3.25rem] w-full bg-transparent px-5 py-3.5 text-[15px] tracking-[0.01em] text-white placeholder:text-white/38 outline-none ring-0 transition-[box-shadow] duration-200 focus-visible:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.22)] disabled:opacity-60"
                                />
                            </div>
                            <div
                                className="h-px shrink-0 bg-gradient-to-r from-transparent via-white/20 to-transparent sm:h-auto sm:w-px sm:bg-gradient-to-b sm:from-transparent sm:via-white/18 sm:to-transparent"
                                aria-hidden
                            />
                            <button
                                type="submit"
                                disabled={busy}
                                className="group relative min-h-[3.25rem] shrink-0 overflow-hidden rounded-b-[1.28rem] border-t border-white/[0.08] bg-white px-8 text-[15px] font-semibold text-black transition-[transform,opacity] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70 sm:rounded-bl-none sm:rounded-br-[1.28rem] sm:rounded-tl-none sm:rounded-tr-[1.28rem] sm:border-l sm:border-t-0 sm:border-white/[0.1]"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {busy ? (
                                        <span className="tabular-nums">…</span>
                                    ) : (
                                        <>
                                            Join waitlist
                                            <ArrowRight
                                                className="size-4 transition-transform group-hover:translate-x-0.5"
                                                aria-hidden
                                            />
                                        </>
                                    )}
                                </span>
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {error ? (
                <p className="mt-3 text-center text-sm text-red-400/90" role="alert">
                    {error}
                </p>
            ) : null}
            <div className="mt-5 flex flex-col items-center gap-3 text-center text-[13px] text-zinc-400">
                <p
                    className="inline-flex max-w-[min(100%,26rem)] justify-center rounded-full border border-white/[0.1] bg-white/[0.04] px-4 py-1.5 text-center text-[11px] font-medium leading-tight tracking-wide text-zinc-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-sm sm:text-xs"
                    role="note"
                >
                    Private beta | limited spots for testers
                </p>
                {done && alreadyJoined ? (
                    <div className="flex flex-col items-center gap-2 text-center">
                        <CircleCheck
                            className="size-14 text-white/60 drop-shadow-[0_0_16px_rgba(255,255,255,0.15)]"
                            strokeWidth={1.5}
                            aria-hidden
                        />
                        <p className="text-[15px] font-semibold text-white">Already on the list!</p>
                        <p className="text-[13px] text-white/45 max-w-md">
                            You&apos;re already signed up. Your referral link is below.
                        </p>
                    </div>
                ) : done && referrerEmail ? (
                    <div className="flex flex-col items-center gap-2 text-center">
                        <CircleCheck
                            className="size-14 text-white/80"
                            strokeWidth={1.5}
                            aria-hidden
                        />
                        <p className="text-[15px] font-semibold text-white">You&apos;re on the waitlist!</p>
                        <p className="text-[13px] text-white/55 max-w-md">
                            Referred by <span className="font-semibold text-white">{referrerEmail}</span>
                        </p>
                    </div>
                ) : null}
                {done && shareUrl ? (
                    <div className="w-full max-w-md text-left">
                        <p className="text-[11px] uppercase tracking-[0.12em] text-white/40 font-medium mb-2 text-center">
                            Your referral link
                        </p>
                        <div className="flex gap-2 items-stretch">
                            <div
                                className="flex-1 min-w-0 rounded-lg px-3 py-2.5 text-[12px] text-white/70 truncate"
                                style={{
                                    background: "rgba(255,255,255,0.04)",
                                    border: "1px solid rgba(255,255,255,0.08)",
                                }}
                                title={shareUrl}
                            >
                                {shareUrl}
                            </div>
                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        await navigator.clipboard.writeText(shareUrl);
                                        setCopied(true);
                                        setTimeout(() => setCopied(false), 2000);
                                    } catch {
                                        setCopied(false);
                                    }
                                }}
                                className="shrink-0 px-4 rounded-lg text-[12px] font-medium text-black bg-white/90 hover:bg-white transition-colors"
                            >
                                {copied ? "Copied" : "Copy"}
                            </button>
                        </div>
                    </div>
                ) : null}
                {done ? (
                    <button
                        type="button"
                        onClick={() => openLeaderboardModal()}
                        className="inline-flex items-center gap-2 rounded-full border border-white/[0.14] bg-white/[0.03] px-4 py-2 text-[12px] font-medium text-white/70 backdrop-blur-md transition-colors hover:border-white/25 hover:bg-white/[0.06] hover:text-white/90"
                    >
                        <Trophy className="size-3.5" aria-hidden />
                        Referral leaderboard
                    </button>
                ) : null}
            </div>
        </div>
    );
}
