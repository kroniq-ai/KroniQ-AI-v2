"use client";

import { HeroWaitlistForm } from "@/components/HeroWaitlistForm";
import { useEffect, useState, useCallback, useMemo, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowRight, Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

function getTimeLeft(target: Date) {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 };
    }
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return { hours, minutes, seconds };
}

function googleCalendarAllDayUrl(title: string, day: Date) {
    const fmt = (d: Date) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${y}${m}${dd}`;
    };
    const end = new Date(day);
    end.setDate(end.getDate() + 1);
    const params = new URLSearchParams({
        action: "TEMPLATE",
        text: title,
        dates: `${fmt(day)}/${fmt(end)}`,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function AnimatedDigit({ value, reduceMotion }: { value: number; reduceMotion: boolean }) {
    const text = value >= 100 ? String(value) : String(value).padStart(2, "0");
    if (reduceMotion) {
        return <span className="tabular-nums leading-none">{text}</span>;
    }
    return (
        <div className="relative flex h-[1.15em] min-w-[2.5ch] items-center justify-center overflow-hidden tabular-nums leading-none">
            <AnimatePresence mode="popLayout">
                <motion.span
                    key={value}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    {text}
                </motion.span>
            </AnimatePresence>
        </div>
    );
}

const GLASS_STROKE =
    "linear-gradient(145deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.07) 40%, rgba(255,255,255,0.03) 100%)";
const GLASS_FILL =
    "linear-gradient(180deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.03) 100%)";
const GLASS_INSET =
    "inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.45), 0 18px 60px -24px rgba(0,0,0,0.85)";

function TimeUnit({
    value,
    label,
    reduceMotion,
}: {
    value: number;
    label: string;
    reduceMotion: boolean;
}) {
    return (
        <div className="flex flex-col items-center gap-2.5">
            <div
                className="relative overflow-hidden rounded-xl p-[1px] shadow-[0_0_0_1px_rgba(255,255,255,0.05)]"
                style={{ background: GLASS_STROKE }}
            >
                <div
                    className="flex h-[120px] w-[84px] items-center justify-center backdrop-blur-2xl sm:h-[128px] sm:w-[92px] md:h-[136px] md:w-[100px]"
                    style={{
                        background: GLASS_FILL,
                        boxShadow: GLASS_INSET,
                    }}
                >
                    <span className="font-mono text-4xl font-medium tracking-tight text-foreground md:text-5xl lg:text-[3.25rem]">
                        <AnimatedDigit value={value} reduceMotion={reduceMotion} />
                    </span>
                </div>
            </div>
            <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground md:text-xs">
                {label}
            </span>
        </div>
    );
}

export type CountdownCtaProps = {
    className?: string;
    /** Absolute deadline; if omitted, `daysFromNow` is used after mount (local midnight). */
    targetDate?: Date;
    /** Days from today (local) → target midnight; default 3. Ignored if `targetDate` is set. */
    daysFromNow?: number;
    /** Omit outer glass card + blobs (e.g. inside {@link HeroGlassShell}). */
    embedded?: boolean;
    /** When false, no timer — use glass waitlist form + optional secondary CTA (e.g. final landing block). */
    showCountdown?: boolean;
    badgeText?: string;
    title?: ReactNode;
    description?: string;
    primaryCtaLabel?: string;
    calendarTitle?: string;
};

/**
 * Optional countdown + CTAs, or headline + {@link HeroWaitlistForm} when `showCountdown` is false.
 */
export function CountdownCta({
    className,
    targetDate: targetDateProp,
    daysFromNow = 3,
    embedded = false,
    showCountdown = true,
    badgeText = "Next wave",
    title = "Launching soon",
    description = "We open the waitlist in waves. Lock your spot before the countdown hits zero—early members keep the best pricing.",
    primaryCtaLabel = "Join the waitlist",
    calendarTitle = "KroniQ - waitlist wave",
}: CountdownCtaProps) {
    const reduceMotion = useReducedMotion();
    const [target, setTarget] = useState<Date | null>(null);
    const [time, setTime] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted || !showCountdown) return;
        if (targetDateProp) {
            const t = new Date(targetDateProp);
            setTarget(t);
            return;
        }
        const t = new Date();
        t.setDate(t.getDate() + daysFromNow);
        t.setHours(0, 0, 0, 0);
        setTarget(t);
    }, [mounted, targetDateProp, daysFromNow, showCountdown]);

    const tick = useCallback(() => {
        if (!target) return;
        setTime(getTimeLeft(target));
    }, [target]);

    useEffect(() => {
        if (!showCountdown || !target) return;
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [target, tick, showCountdown]);

    const calendarHref = useMemo(() => {
        if (!target) return "#";
        return googleCalendarAllDayUrl(calendarTitle, target);
    }, [target, calendarTitle]);

    if (!mounted) {
        return (
            <div
                className={cn(
                    "flex min-h-[200px] w-full items-center justify-center rounded-3xl border border-border/40 bg-card/20",
                    className
                )}
                aria-hidden
            />
        );
    }

    const inner = (
        <>
            <div className={cn("relative z-10 flex flex-col items-center gap-8 text-center md:gap-10", embedded && "gap-8")}>
                <div className="relative z-10 flex flex-col items-center gap-4">
                    <motion.div
                        initial={reduceMotion ? false : { scale: 0.92, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        className="inline-flex overflow-hidden rounded-full p-[1px] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
                        style={{ background: GLASS_STROKE }}
                    >
                        <div
                            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-xl"
                            style={{
                                background: GLASS_FILL,
                                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.35)",
                            }}
                        >
                            <Sparkles className="h-3.5 w-3.5 text-white/85" aria-hidden />
                            <span>{badgeText}</span>
                        </div>
                    </motion.div>

                    <h2
                        className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl md:text-5xl"
                        style={{ fontFamily: "var(--font-heading)" }}
                    >
                        {title}
                    </h2>

                    <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">{description}</p>
                </div>

                {showCountdown ? (
                    <>
                        <div className="relative z-10 flex flex-wrap items-end justify-center gap-2 md:gap-3">
                            <TimeUnit value={time?.hours ?? 0} label="Hours" reduceMotion={!!reduceMotion} />
                            <div className="flex h-[120px] items-center justify-center pb-7 sm:h-[128px] md:h-[136px] md:pb-8">
                                <span className="text-2xl font-light text-muted-foreground/45 md:text-3xl">:</span>
                            </div>
                            <TimeUnit value={time?.minutes ?? 0} label="Minutes" reduceMotion={!!reduceMotion} />
                            <div className="flex h-[120px] items-center justify-center pb-7 sm:h-[128px] md:h-[136px] md:pb-8">
                                <span className="text-2xl font-light text-muted-foreground/45 md:text-3xl">:</span>
                            </div>
                            <TimeUnit value={time?.seconds ?? 0} label="Seconds" reduceMotion={!!reduceMotion} />
                        </div>

                        <motion.div
                            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                            className="relative z-10 w-full max-w-xl"
                        >
                            <div
                                className="overflow-hidden rounded-[1.35rem] p-[1px] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
                                style={{ background: GLASS_STROKE }}
                            >
                                <div
                                    className="flex flex-col overflow-hidden rounded-[1.3rem] sm:flex-row sm:items-stretch"
                                    style={{
                                        background: GLASS_FILL,
                                        boxShadow:
                                            "inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.45), 0 18px 60px -24px rgba(0,0,0,0.85)",
                                    }}
                                >
                                    <button
                                        type="button"
                                        data-waitlist-trigger
                                        className="group inline-flex min-h-[3.25rem] flex-1 items-center justify-center gap-2 px-6 text-[15px] font-semibold text-white transition-[transform,opacity] active:scale-[0.98]"
                                        style={{
                                            background:
                                                "linear-gradient(165deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.06) 45%, rgba(20,60,55,0.35) 100%)",
                                            boxShadow:
                                                "inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.35)",
                                        }}
                                    >
                                        <span>{primaryCtaLabel}</span>
                                        <ArrowRight
                                            className="h-4 w-4 opacity-90 transition-transform group-hover:translate-x-0.5"
                                            aria-hidden
                                        />
                                    </button>
                                    <div
                                        className="h-px shrink-0 bg-gradient-to-r from-transparent via-white/20 to-transparent sm:h-auto sm:w-px sm:bg-gradient-to-b sm:from-transparent sm:via-white/18 sm:to-transparent"
                                        aria-hidden
                                    />
                                    <a
                                        href={calendarHref}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex min-h-[3.25rem] flex-1 items-center justify-center gap-2 px-6 text-[15px] font-medium text-white/90 backdrop-blur-2xl transition-colors hover:bg-white/[0.06]"
                                    >
                                        <Clock className="h-4 w-4 text-white/55" aria-hidden />
                                        <span>Add to Calendar</span>
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    </>
                ) : (
                    <motion.div
                        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.12, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        className="relative z-10 w-full max-w-xl"
                    >
                        <HeroWaitlistForm className="mt-0" />
                    </motion.div>
                )}
            </div>
        </>
    );

    if (embedded) {
        return <div className={cn("relative w-full overflow-hidden", className)}>{inner}</div>;
    }

    return (
        <section
            className={cn(
                "relative flex min-h-[min(100dvh,920px)] w-full items-center justify-center overflow-hidden bg-background px-4 py-16 md:py-24",
                className
            )}
        >
            <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-border/50 bg-card/40 p-8 shadow-2xl backdrop-blur-xl md:p-14"
            >
                {inner}
            </motion.div>
        </section>
    );
}

/** Standalone marketing block (full section). Prefer {@link CountdownCta} with defaults. */
export function CountdownBanner(props: Omit<CountdownCtaProps, "embedded">) {
    return <CountdownCta {...props} embedded={false} />;
}
