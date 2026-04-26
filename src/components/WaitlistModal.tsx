"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVignette } from "./Vignette";
import { WAITLIST_AUTO_OPEN_MODAL_KEY, WAITLIST_REF_STORAGE_KEY } from "@/lib/waitlist/storage";
import { requestLaunchAccess } from "@/lib/launch-access-client";
import {
    buildWaitlistReferralShareUrl,
    getPublicSiteOriginServerSnapshot,
    openLeaderboardModal,
    setPublicSiteOriginOverride,
    setWaitlistMemberSession,
    subscribePublicSiteOrigin,
} from "@/lib/waitlist/client-session";
import { fetchWithTimeout, isTimeoutAbort } from "@/lib/waitlist/client-fetch";
import { formatWaitlistClientError } from "@/lib/waitlist/client-waitlist-error";
import { isDisposableEmailDomain, isValidEmailForSignup } from "@/lib/waitlist/email-validation";

const roles = [
    { label: "Founder", icon: "🚀" },
    { label: "CTO", icon: "⚙️" },
    { label: "Developer", icon: "💻" },
    { label: "Student", icon: "🎓" },
    { label: "Teacher", icon: "📚" },
    { label: "Other", icon: "✦" },
];

const stepLabels = ["Email", "You're in", "Optional"];

const sparkleOffsets = [
    { x: -80, y: -60 },
    { x: 70, y: -90 },
    { x: -95, y: 40 },
    { x: 85, y: 55 },
    { x: -40, y: -85 },
    { x: 50, y: 70 },
];

export default function WaitlistModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState(0);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState("");
    const [otherRole, setOtherRole] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [shareReferralCode, setShareReferralCode] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [alreadyJoined, setAlreadyJoined] = useState(false);
    const [profileSavedBanner, setProfileSavedBanner] = useState(false);
    const [referrerEmail, setReferrerEmail] = useState<string | null>(null);
    const { setHidden } = useVignette();

    const shareUrl = useSyncExternalStore(
        subscribePublicSiteOrigin,
        () => (shareReferralCode ? buildWaitlistReferralShareUrl(shareReferralCode) : null),
        () =>
            shareReferralCode
                ? `${getPublicSiteOriginServerSnapshot()}/?ref=${encodeURIComponent(shareReferralCode)}`
                : null
    );

    useEffect(() => {
        const openFromReferral = () => {
            try {
                sessionStorage.removeItem(WAITLIST_AUTO_OPEN_MODAL_KEY);
            } catch {
                /* ignore */
            }
            setIsOpen(true);
        };
        window.addEventListener("voyd-open-waitlist-modal", openFromReferral);
        try {
            if (sessionStorage.getItem(WAITLIST_AUTO_OPEN_MODAL_KEY) === "1") {
                openFromReferral();
            }
        } catch {
            /* ignore */
        }
        return () => window.removeEventListener("voyd-open-waitlist-modal", openFromReferral);
    }, []);

    useEffect(() => {
        const handler = (e: Event) => {
            const target = e.target as HTMLElement;
            const trigger = target.closest("[data-waitlist-trigger]");
            if (trigger) {
                e.preventDefault();
                setIsOpen(true);
            }
        };
        document.addEventListener("click", handler);
        return () => document.removeEventListener("click", handler);
    }, []);

    useEffect(() => {
        setHidden(isOpen);
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen, setHidden]);

    const close = () => {
        setIsOpen(false);
        setTimeout(() => {
            setStep(0);
            setEmail("");
            setName("");
            setPhone("");
            setRole("");
            setOtherRole("");
            setSubmitError("");
            setShareReferralCode(null);
            setCopied(false);
            setAlreadyJoined(false);
            setProfileSavedBanner(false);
            setReferrerEmail(null);
        }, 400);
    };

    const emailValid =
        email.trim().length > 0 &&
        isValidEmailForSignup(email.trim()) &&
        !isDisposableEmailDomain(email.trim().toLowerCase());

    const submitQuickJoin = async () => {
        const trimmed = email.trim().toLowerCase();
        if (!isValidEmailForSignup(trimmed)) {
            setSubmitError("Enter a valid email address.");
            return;
        }
        if (isDisposableEmailDomain(trimmed)) {
            setSubmitError("Please use a permanent email address.");
            return;
        }

        setIsSubmitting(true);
        setSubmitError("");
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

            const data = (await res.json()) as {
                status?: string;
                referralCode?: string;
                publicSiteUrl?: string;
                referrerEmail?: string;
                error?: string;
                retryAfterSec?: number;
            };

            if (!res.ok) {
                if (res.status === 429) {
                    setSubmitError(`Too many attempts. Try again in ${data.retryAfterSec ?? 60} seconds.`);
                } else if (res.status === 503) {
                    setSubmitError(
                        data.error ||
                            "Waitlist isn’t connected to the database yet. Check Supabase migrations."
                    );
                } else {
                    setSubmitError(formatWaitlistClientError(data.error ?? "Something went wrong.", res.status));
                }
                return;
            }

            const dup = data.status === "duplicate";
            setAlreadyJoined(dup);
            setProfileSavedBanner(false);
            setReferrerEmail(!dup && data.referrerEmail ? data.referrerEmail : null);

            setPublicSiteOriginOverride(data.publicSiteUrl);
            if (data.referralCode) {
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
            setStep(1);
        } catch (e) {
            setSubmitError(
                isTimeoutAbort(e)
                    ? "Request timed out. Check your connection and try again."
                    : "Something went wrong. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const canSaveOptional =
        name.trim().length > 0 ||
        phone.trim().length > 0 ||
        (role.length > 0 && (role !== "Other" || otherRole.trim().length > 0));

    const submitOptionalProfile = async () => {
        const trimmedEmail = email.trim().toLowerCase();
        if (!trimmedEmail) return;

        if (role === "Other" && !otherRole.trim()) {
            setSubmitError("Add a short description for “Other”, or pick a different role.");
            return;
        }

        if (!canSaveOptional) {
            setSubmitError("Add at least your name, phone, or role—or tap Skip.");
            return;
        }

        setIsSubmitting(true);
        setSubmitError("");
        try {
            const body: Record<string, string> = { email: trimmedEmail };
            if (name.trim()) body.name = name.trim();
            if (phone.trim()) body.phone = phone.trim();
            if (role) {
                body.role = role;
                body.otherRole = role === "Other" ? otherRole.trim() : "";
            }

            const res = await fetchWithTimeout("/api/waitlist", {
                method: "PATCH",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = (await res.json()) as { error?: string; retryAfterSec?: number };

            if (!res.ok) {
                if (res.status === 429) {
                    setSubmitError(`Too many attempts. Try again in ${data.retryAfterSec ?? 60} seconds.`);
                } else {
                    setSubmitError(data.error || "Could not save. Try again.");
                }
                return;
            }

            if (shareReferralCode) {
                setWaitlistMemberSession({
                    email: trimmedEmail,
                    name: name.trim() || "Waitlist member",
                    avatarUrl: null,
                    referralCode: shareReferralCode,
                    source: "form",
                });
            }
            setProfileSavedBanner(true);
            setStep(1);
        } catch (e) {
            setSubmitError(
                isTimeoutAbort(e)
                    ? "Request timed out. Check your connection and try again."
                    : "Something went wrong. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const headerSubtitle = () => {
        if (step === 0) return "We're in early access. Join with your email—we'll send your referral link next.";
        if (step === 1) return "Welcome aboard.";
        return "Optional — helps us tailor your invite.";
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        className="absolute inset-0 bg-black/70 backdrop-blur-xl"
                        onClick={close}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />

                    <motion.div
                        className="relative z-10 w-full max-w-[480px]"
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.97 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div
                            className="relative rounded-2xl overflow-hidden"
                            style={{
                                background: "rgba(10, 10, 10, 0.85)",
                                backdropFilter: "blur(40px) saturate(1.3)",
                                WebkitBackdropFilter: "blur(40px) saturate(1.3)",
                                border: "1px solid rgba(255,255,255,0.07)",
                                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04), 0 20px 60px rgba(0,0,0,0.5)",
                            }}
                        >
                            <div className="px-7 pt-7 pb-0">
                                <div className="flex items-start justify-between mb-1">
                                    <div>
                                        <h3 className="text-[22px] font-semibold text-white tracking-tight font-[var(--font-heading)]">
                                            Join the Waitlist
                                        </h3>
                                        <p className="text-[13px] text-white/30 font-light mt-1">{headerSubtitle()}</p>
                                    </div>
                                    <button
                                        onClick={close}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.06] transition-colors duration-200 text-white/30 hover:text-white/60 shrink-0 mt-0.5"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M18 6L6 18M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="flex gap-2 mt-5 mb-6">
                                    {stepLabels.map((_, i) => (
                                        <div key={i} className="flex-1 h-[3px] rounded-full overflow-hidden bg-white/[0.06]">
                                            <motion.div
                                                className="h-full rounded-full bg-white/50"
                                                initial={{ width: "0%" }}
                                                animate={{ width: step >= i ? "100%" : "0%" }}
                                                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="px-7 pb-7">
                                <AnimatePresence mode="wait">
                                    {step === 0 && (
                                        <motion.div
                                            key="step0"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                            className="space-y-5"
                                        >
                                            <p className="text-[12px] text-white/40 leading-relaxed">
                                                Drop your email to claim your spot. You&apos;ll get a personal
                                                referral link — the more people you invite, the higher you climb.
                                            </p>
                                            <div>
                                                <label className="block text-[11px] uppercase tracking-[0.12em] text-white/40 font-medium mb-2">
                                                    Email <span className="text-neutral-500">*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => {
                                                        setEmail(e.target.value);
                                                        setSubmitError("");
                                                    }}
                                                    placeholder="you@company.com"
                                                    className="waitlist-input"
                                                    autoFocus
                                                    autoComplete="email"
                                                />
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 1 && (
                                        <motion.div
                                            key="step1-success"
                                            initial={{ opacity: 0, scale: 0.96 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                                            className="text-center py-6 relative"
                                        >
                                            <motion.div
                                                initial={{ scale: 0, rotate: -180 }}
                                                animate={{ scale: 1, rotate: 0 }}
                                                transition={{ delay: 0.1, duration: 0.55, type: "spring", stiffness: 200 }}
                                                className="w-[72px] h-[72px] rounded-full mx-auto mb-5 flex items-center justify-center bg-emerald-500/15 border border-emerald-400/45 shadow-[0_0_40px_rgba(52,211,153,0.22)]"
                                            >
                                                <svg
                                                    width="36"
                                                    height="36"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    className="text-emerald-400"
                                                    stroke="currentColor"
                                                    strokeWidth="2.75"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <path d="M20 6L9 17l-5-5" />
                                                </svg>
                                            </motion.div>

                                            <h3 className="text-[20px] font-semibold text-white mb-2">
                                                {alreadyJoined ? "Already on the list!" : "You're on the waitlist!"}
                                            </h3>
                                            {referrerEmail && !alreadyJoined ? (
                                                <p className="text-[13px] text-emerald-300/95 mb-3 max-w-[320px] mx-auto leading-snug">
                                                    You joined through a referral from{" "}
                                                    <span className="font-semibold text-white">{referrerEmail}</span>
                                                </p>
                                            ) : null}
                                            <p className="text-[14px] text-white/35 font-light leading-relaxed max-w-[300px] mx-auto mb-1">
                                                {alreadyJoined
                                                    ? "You're already signed up. Your referral link is below."
                                                    : "We'll reach out when your spot opens. Share your link to climb the leaderboard."}
                                            </p>
                                            {profileSavedBanner ? (
                                                <p className="text-[12px] text-emerald-400/90 mb-4">Saved your optional details.</p>
                                            ) : null}

                                            {shareUrl ? (
                                                <div className="mt-6 text-left max-w-[320px] mx-auto">
                                                    <p className="text-[11px] uppercase tracking-[0.12em] text-white/40 font-medium mb-2">
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

                                            <div className="mt-6 flex flex-col gap-2.5 max-w-[280px] mx-auto">
                                                <button
                                                    type="button"
                                                    onClick={() => setStep(2)}
                                                    className="w-full rounded-full py-3 text-[13px] font-semibold border border-white/15 bg-white/[0.04] text-white/90 hover:bg-white/[0.08] transition-colors"
                                                >
                                                    Add optional details
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        close();
                                                        setTimeout(() => openLeaderboardModal(), 350);
                                                    }}
                                                    className="w-full rounded-full py-3 text-[13px] font-semibold text-black bg-white/95 hover:bg-white transition-colors"
                                                >
                                                    View leaderboard &amp; rules
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={close}
                                                    className="text-[12px] font-medium text-white/30 hover:text-white/50 pt-1"
                                                >
                                                    Close
                                                </button>
                                            </div>

                                            {!alreadyJoined
                                                ? sparkleOffsets.map((offset, i) => (
                                                      <motion.div
                                                          key={i}
                                                          className="absolute w-1 h-1 rounded-full bg-white/20 pointer-events-none"
                                                          initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                                                          animate={{
                                                              x: offset.x,
                                                              y: offset.y,
                                                              scale: [0, 1, 0],
                                                              opacity: [0, 0.6, 0],
                                                          }}
                                                          transition={{
                                                              delay: 0.2 + i * 0.1,
                                                              duration: 1.2,
                                                              ease: "easeOut",
                                                          }}
                                                          style={{ left: "50%", top: "28%" }}
                                                      />
                                                  ))
                                                : null}
                                        </motion.div>
                                    )}

                                    {step === 2 && (
                                        <motion.div
                                            key="step2-optional"
                                            initial={{ opacity: 0, x: 16 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -16 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-4"
                                        >
                                            <p className="text-[12px] text-white/40">
                                                Signed up as{" "}
                                                <span className="text-white/70">{email.trim().toLowerCase()}</span>. Add
                                                what you like—we use it to personalize your invite.
                                            </p>
                                            <div>
                                                <label className="block text-[11px] uppercase tracking-[0.12em] text-white/40 font-medium mb-2">
                                                    Name <span className="text-white/20 normal-case">(optional)</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => {
                                                        setName(e.target.value);
                                                        setSubmitError("");
                                                    }}
                                                    placeholder="Your name"
                                                    className="waitlist-input"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] uppercase tracking-[0.12em] text-white/40 font-medium mb-2">
                                                    Phone <span className="text-white/20 normal-case">(optional)</span>
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={phone}
                                                    onChange={(e) => {
                                                        setPhone(e.target.value);
                                                        setSubmitError("");
                                                    }}
                                                    placeholder="+1 (555) 000-0000"
                                                    className="waitlist-input"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] uppercase tracking-[0.12em] text-white/40 font-medium mb-3">
                                                    I am a… <span className="text-white/20 normal-case">(optional)</span>
                                                </label>
                                                <div className="grid grid-cols-3 gap-2.5">
                                                    {roles.map((r) => (
                                                        <button
                                                            key={r.label}
                                                            type="button"
                                                            onClick={() => setRole(r.label)}
                                                            className="relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all duration-300"
                                                            style={{
                                                                background:
                                                                    role === r.label ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
                                                                border: `1px solid ${role === r.label ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)"}`,
                                                            }}
                                                        >
                                                            <span className="text-[18px]">{r.icon}</span>
                                                            <span
                                                                className={`text-[11px] font-medium ${
                                                                    role === r.label ? "text-white/80" : "text-white/35"
                                                                }`}
                                                            >
                                                                {r.label}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                                <AnimatePresence>
                                                    {role === "Other" && (
                                                        <motion.div
                                                            initial={{ opacity: 0, height: 0 }}
                                                            animate={{ opacity: 1, height: "auto" }}
                                                            exit={{ opacity: 0, height: 0 }}
                                                            className="overflow-hidden mt-2"
                                                        >
                                                            <input
                                                                type="text"
                                                                value={otherRole}
                                                                onChange={(e) => setOtherRole(e.target.value)}
                                                                placeholder="Describe your role…"
                                                                className="waitlist-input"
                                                            />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {submitError && (step === 0 || step === 2) ? (
                                    <p className="text-[12px] sm:text-[13px] text-neutral-400 mt-3 px-0.5 text-left leading-relaxed whitespace-pre-wrap">
                                        {submitError}
                                    </p>
                                ) : null}

                                {step === 0 ? (
                                    <div className="flex items-center justify-end mt-6 pt-5 border-t border-white/[0.05]">
                                        <button
                                            type="button"
                                            onClick={() => void submitQuickJoin()}
                                            disabled={!emailValid || isSubmitting}
                                            className="btn-glass-primary !py-2.5 !px-6 !text-[12px] disabled:opacity-30 disabled:pointer-events-none"
                                        >
                                            {isSubmitting ? (
                                                <span className="flex items-center gap-2">
                                                    <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                                                        <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="10"
                                                            stroke="currentColor"
                                                            strokeWidth="3"
                                                            strokeDasharray="32"
                                                            strokeLinecap="round"
                                                        />
                                                    </svg>
                                                    Joining…
                                                </span>
                                            ) : (
                                                <>
                                                    Join waitlist
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                                    </svg>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                ) : null}

                                {step === 2 ? (
                                    <div className="flex flex-col gap-3 mt-6 pt-5 border-t border-white/[0.05] sm:flex-row sm:items-center sm:justify-between">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setStep(1);
                                                setSubmitError("");
                                            }}
                                            className="text-[13px] font-medium text-white/30 hover:text-white/50 order-2 sm:order-1"
                                        >
                                            ← Back
                                        </button>
                                        <div className="flex gap-2 order-1 sm:order-2 sm:ml-auto">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setStep(1);
                                                    setSubmitError("");
                                                }}
                                                className="rounded-full px-4 py-2.5 text-[12px] font-medium text-white/45 border border-white/10 hover:bg-white/[0.04]"
                                            >
                                                Skip
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => void submitOptionalProfile()}
                                                disabled={isSubmitting || !canSaveOptional}
                                                className="btn-glass-primary !py-2.5 !px-5 !text-[12px] disabled:opacity-30"
                                            >
                                                {isSubmitting ? "Saving…" : "Save"}
                                            </button>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
