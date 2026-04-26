"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { LiquidMetalBadgeShell } from "@/components/ui/liquid-metal-badge";
import type { WaitlistHeroInitialStats } from "@/lib/waitlist/hero-initial-stats";

type StatsPayload = {
    configured: boolean;
    displayCount: number;
    showPlus: boolean;
};

type Props = {
    className?: string;
    /** From server on first paint — avoids “— on the waitlist” while client fetch warms up. */
    initialStats?: WaitlistHeroInitialStats | null;
};

/** First `/api` compile in dev can take 20–60+ s; short timeouts were aborting the request and left the error copy forever. */
const STATS_FETCH_TIMEOUT_MS = 90000;
const MAX_ATTEMPTS = 3;
const RETRY_MS = 800;

function toPayload(s: WaitlistHeroInitialStats): StatsPayload {
    return { configured: s.configured, displayCount: s.displayCount, showPlus: s.showPlus };
}

async function fetchStatsOnce(signal: AbortSignal) {
    const res = await fetch("/api/waitlist/stats", { cache: "no-store", signal });
    const data = (await res.json()) as StatsPayload;
    if (!res.ok) throw new Error("stats not ok");
    return data;
}

export default function WaitlistHeroSocialProof({ className, initialStats = null }: Props) {
    const hadServerStats = useRef(initialStats != null);
    const [stats, setStats] = useState<StatsPayload | null>(() => (initialStats ? toPayload(initialStats) : null));
    const [phase, setPhase] = useState<"loading" | "ready" | "error">(() => (initialStats ? "ready" : "loading"));
    const reqId = useRef(0);

    useEffect(() => {
        const myId = ++reqId.current;
        if (!hadServerStats.current) {
            setPhase("loading");
            setStats(null);
        }
        const cancelled = { current: false };
        (async () => {
            for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
                if (myId !== reqId.current) return;
                if (cancelled.current) return;
                const ctrl = new AbortController();
                const t = window.setTimeout(() => ctrl.abort(), STATS_FETCH_TIMEOUT_MS);
                try {
                    const data = await fetchStatsOnce(ctrl.signal);
                    if (myId !== reqId.current) return;
                    if (cancelled.current) return;
                    setStats(data);
                    setPhase("ready");
                    return;
                } catch {
                    /* retry or fall through */
                } finally {
                    window.clearTimeout(t);
                }
                if (attempt < MAX_ATTEMPTS - 1) {
                    await new Promise((r) => setTimeout(r, RETRY_MS));
                }
            }
            if (myId !== reqId.current) return;
            if (!hadServerStats.current) {
                setPhase("error");
            }
        })();
        return () => {
            cancelled.current = true;
            reqId.current += 1;
        };
    }, []);

    const shell = (children: ReactNode) => (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className={`mt-8 flex w-full justify-center px-2 ${className ?? ""}`}
        >
            <LiquidMetalBadgeShell className="shadow-[0_14px_44px_rgba(0,0,0,0.55)]">{children}</LiquidMetalBadgeShell>
        </motion.div>
    );

    if (phase === "loading") {
        return shell(
            <>
                <span className="relative flex h-2 w-2 shrink-0 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/20 opacity-50" />
                    <span
                        className="relative inline-flex h-[7px] w-[7px] rounded-full bg-white/40"
                        aria-hidden
                    />
                </span>
                <p className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-[13px] font-medium leading-none tracking-tight text-white/85 md:text-[14px]">
                    <span className="inline-flex min-w-[2.75ch] justify-center tabular-nums font-semibold text-white/45">
                        —
                    </span>
                    <span className="font-normal text-white/45">on the waitlist</span>
                </p>
            </>
        );
    }

    if (phase === "error") {
        return shell(
            <>
                <span className="relative flex h-2 w-2 shrink-0 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/20 opacity-50" />
                    <span
                        className="relative inline-flex h-[7px] w-[7px] rounded-full bg-white/40"
                        aria-hidden
                    />
                </span>
                <p className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-[13px] font-medium leading-none tracking-tight text-white/55 md:text-[14px]">
                    <span className="inline-flex min-w-[2.75ch] justify-center tabular-nums font-semibold text-white/50">
                        —
                    </span>
                    <span className="font-normal text-white/45">on the waitlist</span>
                </p>
            </>
        );
    }

    if (!stats) {
        return null;
    }

    const n = Number(stats.displayCount);
    const countLabel = `${(Number.isFinite(n) ? n : 0).toLocaleString()}${stats.showPlus ? "+" : ""}`;
    const showDevHint = process.env.NODE_ENV === "development" && !stats.configured;

    return shell(
        <>
            <span className="relative flex h-2 w-2 shrink-0 items-center justify-center">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/20 opacity-60" />
                <span
                    className="relative inline-flex h-[7px] w-[7px] rounded-full bg-white shadow-[0_0_0_1px_rgba(255,255,255,0.35),0_0_12px_rgba(255,255,255,0.35)]"
                    aria-hidden
                />
            </span>
            <p className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-[13px] font-medium leading-none tracking-tight text-white/85 md:text-[14px]">
                <span
                    className="inline-flex min-w-[2.75ch] justify-center tabular-nums font-semibold text-white"
                    style={{ fontFeatureSettings: '"tnum"' }}
                >
                    {countLabel}
                </span>
                <span className="font-normal text-white/50">on the waitlist</span>
            </p>
            {showDevHint ? (
                <p className="mt-2 max-w-[20rem] text-center text-[10px] leading-snug text-white/30 sm:mx-auto sm:text-left">
                    Live count: set{" "}
                    <code className="rounded bg-white/10 px-0.5 text-white/50">NEXT_PUBLIC_SUPABASE_URL</code> +{" "}
                    <code className="rounded bg-white/10 px-0.5 text-white/50">SUPABASE_SERVICE_ROLE_KEY</code> and
                    apply <code className="rounded bg-white/10 px-0.5 text-white/50">db/migrations</code>.
                </p>
            ) : null}
        </>
    );
}
