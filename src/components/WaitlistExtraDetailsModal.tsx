"use client";

import { useVignette } from "@/components/Vignette";
import { openLeaderboardModal } from "@/lib/waitlist/client-session";
import { fetchWithTimeout, isTimeoutAbort } from "@/lib/waitlist/client-fetch";
import { formatWaitlistClientError } from "@/lib/waitlist/client-waitlist-error";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, Trophy } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const EXTRA_OPEN = "voyd-waitlist-extra-open";

const roles = [
    { label: "Founder", icon: "🚀" },
    { label: "CTO", icon: "⚙️" },
    { label: "Developer", icon: "💻" },
    { label: "Student", icon: "🎓" },
    { label: "Teacher", icon: "📚" },
    { label: "Other", icon: "✦" },
];

const glassInput =
    "w-full rounded-2xl border border-white/[0.14] bg-white/[0.06] px-4 py-3.5 text-[15px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-md outline-none transition-all duration-300 placeholder:text-white/30 focus:border-white/30 focus:bg-white/[0.1] focus:shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_0_0_3px_rgba(255,255,255,0.06)]";

export default function WaitlistExtraDetailsModal() {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState("");
    const [otherRole, setOtherRole] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [saved, setSaved] = useState(false);
    const { setHidden } = useVignette();

    const close = useCallback(() => {
        setOpen(false);
        setTimeout(() => {
            setName("");
            setPhone("");
            setRole("");
            setOtherRole("");
            setError("");
            setSaved(false);
        }, 300);
    }, []);

    useEffect(() => {
        const onOpen = (e: Event) => {
            const ce = e as CustomEvent<{ email?: string }>;
            const em = ce.detail?.email?.trim();
            if (em) setEmail(em);
            setOpen(true);
        };
        window.addEventListener(EXTRA_OPEN, onOpen);
        return () => window.removeEventListener(EXTRA_OPEN, onOpen);
    }, []);

    useEffect(() => {
        setHidden(open);
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [open, setHidden]);

    const canSave =
        (name.trim().length > 0 ||
            phone.trim().length > 0 ||
            (role.length > 0 && (role !== "Other" || otherRole.trim().length > 0))) &&
        !(role === "Other" && !otherRole.trim());

    const save = async () => {
        if (!email.includes("@")) return;
        setBusy(true);
        setError("");
        try {
            const body: Record<string, string> = { email };
            if (name.trim()) body.name = name.trim();
            if (phone.trim()) body.phone = phone.trim();
            if (role) {
                body.role = role;
                if (role === "Other") {
                    body.otherRole = otherRole.trim();
                }
            }

            const keys = Object.keys(body).filter((k) => k !== "email");
            if (keys.length === 0) {
                close();
                return;
            }

            const res = await fetchWithTimeout("/api/waitlist", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = (await res.json()) as { error?: string; status?: string };
            if (!res.ok) {
                setError(formatWaitlistClientError(data.error ?? "Could not save.", res.status));
                return;
            }
            setSaved(true);
            setTimeout(() => close(), 900);
        } catch (e) {
            setError(
                isTimeoutAbort(e) ? "Request timed out. Check your connection and try again." : "Could not save. Try again."
            );
        } finally {
            setBusy(false);
        }
    };

    const skip = () => close();

    return (
        <AnimatePresence>
            {open ? (
                <motion.div
                    className="fixed inset-0 z-[200] flex items-end justify-center p-4 sm:items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <button
                        type="button"
                        aria-label="Close"
                        className="absolute inset-0 bg-black/65 backdrop-blur-md"
                        onClick={skip}
                    />
                    <motion.div
                        role="dialog"
                        aria-modal
                        aria-labelledby="waitlist-extra-title"
                        className="relative z-10 w-full max-w-md overflow-hidden rounded-[1.75rem] border border-white/[0.18] shadow-[0_32px_120px_-24px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.14)]"
                        style={{
                            background:
                                "linear-gradient(165deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.04) 42%, rgba(12,18,28,0.55) 100%)",
                        }}
                        initial={{ opacity: 0, y: 28, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 360, damping: 34 }}
                    >
                        <div
                            className="pointer-events-none absolute inset-0 backdrop-blur-2xl"
                            style={{ WebkitBackdropFilter: "blur(40px)" }}
                        />

                        {/* Liquid / iridescent blobs */}
                        <div
                            className="liquid-blob-a pointer-events-none absolute -left-32 -top-28 h-[22rem] w-[22rem] rounded-full bg-gradient-to-br from-cyan-400/25 via-violet-500/20 to-transparent blur-3xl"
                            aria-hidden
                        />
                        <div
                            className="liquid-blob-b pointer-events-none absolute -bottom-36 -right-28 h-[20rem] w-[20rem] rounded-full bg-gradient-to-tl from-fuchsia-500/22 via-sky-400/12 to-transparent blur-3xl"
                            aria-hidden
                        />
                        <div
                            className="pointer-events-none absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-white/5 via-white/[0.02] to-transparent blur-2xl"
                            aria-hidden
                        />

                        {/* Rim light */}
                        <div
                            className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent"
                            aria-hidden
                        />
                        <div
                            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.07] to-transparent"
                            aria-hidden
                        />

                        <div className="relative z-10 p-6 sm:p-7">
                            {saved ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center gap-3 py-4 text-center"
                                >
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] backdrop-blur-md">
                                        <Sparkles className="size-6 text-white/90" aria-hidden />
                                    </div>
                                    <p className="text-lg font-semibold tracking-tight text-white">
                                        Thanks — you&apos;re all set.
                                    </p>
                                    <p className="text-sm text-white/45">We&apos;ll use this to tailor your invite.</p>
                                </motion.div>
                            ) : (
                                <>
                                    <div className="flex items-start gap-2">
                                        <h2
                                            id="waitlist-extra-title"
                                            className="text-xl font-semibold tracking-tight text-white drop-shadow-[0_1px_12px_rgba(0,0,0,0.35)]"
                                        >
                                            Tell us more{" "}
                                            <span className="font-normal text-white/40">(optional)</span>
                                        </h2>
                                    </div>
                                    <p className="mt-2 text-sm leading-relaxed text-white/55">
                                        Add a name, phone, or role so we can tailor your invite. Skip if you prefer.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => openLeaderboardModal()}
                                        className="group mt-5 flex w-full items-center justify-center gap-2 rounded-full border border-white/[0.18] bg-white/[0.07] py-3 text-sm font-medium text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_32px_-8px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-300 hover:border-white/30 hover:bg-white/[0.12] hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_12px_40px_-8px_rgba(99,102,241,0.15)]"
                                    >
                                        <Trophy className="size-4 shrink-0 text-amber-200/90" aria-hidden />
                                        Share your link — referral leaderboard
                                    </button>

                                    <div className="mt-6 space-y-3">
                                        <input
                                            className={glassInput}
                                            placeholder="Name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            autoComplete="name"
                                        />
                                        <input
                                            className={glassInput}
                                            placeholder="Phone"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            autoComplete="tel"
                                            inputMode="tel"
                                        />
                                        <p className="pt-1 text-[11px] uppercase tracking-[0.22em] text-white/40">
                                            Role
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {roles.map((r) => (
                                                <button
                                                    key={r.label}
                                                    type="button"
                                                    onClick={() => {
                                                        setRole(r.label);
                                                        if (r.label !== "Other") setOtherRole("");
                                                    }}
                                                    className={cn(
                                                        "rounded-full border px-3.5 py-2 text-xs font-medium backdrop-blur-md transition-all duration-300",
                                                        role === r.label
                                                            ? "border-white/40 bg-white/[0.16] text-white shadow-[0_0_24px_rgba(255,255,255,0.12),inset_0_1px_0_rgba(255,255,255,0.2)] ring-1 ring-white/25"
                                                            : "border-white/[0.12] bg-white/[0.05] text-white/65 hover:border-white/25 hover:bg-white/[0.09] hover:text-white/90"
                                                    )}
                                                >
                                                    <span className="mr-1.5 opacity-90">{r.icon}</span>
                                                    {r.label}
                                                </button>
                                            ))}
                                        </div>
                                        {role === "Other" ? (
                                            <input
                                                className={cn(glassInput, "mt-1")}
                                                placeholder="Describe your role"
                                                value={otherRole}
                                                onChange={(e) => setOtherRole(e.target.value)}
                                            />
                                        ) : null}
                                    </div>

                                    {error ? (
                                        <p className="mt-4 text-sm text-red-300/95" role="alert">
                                            {error}
                                        </p>
                                    ) : null}

                                    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end sm:gap-3">
                                        <button
                                            type="button"
                                            onClick={skip}
                                            className="order-2 rounded-full border border-white/[0.18] bg-white/[0.04] px-6 py-3 text-sm font-medium text-white/75 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-md transition-all hover:border-white/28 hover:bg-white/[0.09] hover:text-white sm:order-1"
                                        >
                                            Skip
                                        </button>
                                        <button
                                            type="button"
                                            onClick={save}
                                            disabled={busy || !canSave}
                                            className="order-1 rounded-full bg-gradient-to-b from-white via-white to-zinc-100 px-6 py-3 text-sm font-semibold text-zinc-950 shadow-[0_0_28px_rgba(255,255,255,0.22),inset_0_1px_0_rgba(255,255,255,0.5)] transition-all hover:shadow-[0_0_36px_rgba(255,255,255,0.3)] disabled:cursor-not-allowed disabled:opacity-35 sm:order-2"
                                        >
                                            {busy ? "Saving…" : "Save"}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}
