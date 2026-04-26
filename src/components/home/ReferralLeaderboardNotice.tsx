"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "voyd-dismiss-referral-notice-v1";

/**
 * One-line liquid-glass notice: waitlist + referral leaderboard. Dismissible; sits above the dock.
 */
export default function ReferralLeaderboardNotice() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            if (window.localStorage.getItem(STORAGE_KEY) === "1") return;
        } catch {
            /* ignore */
        }
        setShow(true);
    }, []);

    const dismiss = () => {
        try {
            window.localStorage.setItem(STORAGE_KEY, "1");
        } catch {
            /* ignore */
        }
        setShow(false);
    };

    return (
        <AnimatePresence>
            {show ? (
                <motion.div
                    role="status"
                    initial={{ opacity: 0, y: 16, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    className="pointer-events-none fixed inset-x-0 bottom-0 z-[105] flex justify-center px-3 pb-[max(5.75rem,calc(env(safe-area-inset-bottom,0px)+5.25rem))] pt-2 sm:px-4"
                >
                    <div
                        className={cn(
                            "pointer-events-auto relative max-w-[min(42rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl",
                            "border border-white/[0.12] shadow-[0_24px_80px_-20px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.14)]"
                        )}
                        style={{
                            background:
                                "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 45%, rgba(12,18,24,0.65) 100%)",
                            backdropFilter: "blur(22px) saturate(1.35)",
                            WebkitBackdropFilter: "blur(22px) saturate(1.35)",
                        }}
                    >
                        {/* Liquid glass blobs */}
                        <div
                            className="liquid-blob-a pointer-events-none absolute -left-[20%] -top-[60%] h-[140%] w-[55%] rounded-full opacity-[0.35]"
                            style={{
                                background:
                                    "radial-gradient(circle at 30% 40%, rgba(130,220,200,0.45) 0%, transparent 62%)",
                                filter: "blur(28px)",
                            }}
                            aria-hidden
                        />
                        <div
                            className="liquid-blob-b pointer-events-none absolute -bottom-[50%] -right-[15%] h-[130%] w-[50%] rounded-full opacity-[0.3]"
                            style={{
                                background:
                                    "radial-gradient(circle at 60% 50%, rgba(140,160,255,0.42) 0%, transparent 58%)",
                                filter: "blur(32px)",
                            }}
                            aria-hidden
                        />
                        <div
                            className="pointer-events-none absolute inset-0 opacity-[0.45] motion-reduce:animate-none motion-reduce:opacity-25"
                            style={{
                                background:
                                    "linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.06) 42%, transparent 68%)",
                                backgroundSize: "200% 100%",
                                animation: "liquid-shimmer 9s ease-in-out infinite",
                            }}
                            aria-hidden
                        />

                        <div className="relative flex items-start gap-2.5 px-3.5 py-3 sm:items-center sm:gap-3 sm:px-4 sm:py-3.5">
                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] sm:mt-0">
                                <Trophy className="size-4 text-amber-200/90" aria-hidden />
                            </div>
                            <p className="min-w-0 flex-1 text-[12px] leading-snug text-white/[0.88] sm:text-[13px] sm:leading-relaxed">
                                <span className="text-white/95">
                                    Join the waitlist—share your link to earn referral points and climb the pre-launch
                                    leaderboard. Top 3 get early access and free Pro at launch.
                                </span>{" "}
                                <button
                                    type="button"
                                    data-waitlist-trigger
                                    className="font-semibold text-teal-200/95 underline decoration-teal-400/35 underline-offset-2 transition hover:text-teal-100 hover:decoration-teal-300/60"
                                >
                                    Get started
                                </button>
                            </p>
                            <button
                                type="button"
                                onClick={dismiss}
                                className="shrink-0 rounded-lg p-1.5 text-white/35 transition hover:bg-white/[0.08] hover:text-white/70"
                                aria-label="Dismiss notice"
                            >
                                <X className="size-4" strokeWidth={2} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            ) : null}
        </AnimatePresence>
    );
}
