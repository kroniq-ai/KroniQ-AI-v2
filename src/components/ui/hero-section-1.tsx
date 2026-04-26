"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import { HeroWaitlistForm } from "@/components/HeroWaitlistForm";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { AnimatedGroup } from "@/components/ui/animated-group";
import WaitlistHeroSocialProof from "@/components/WaitlistHeroSocialProof";
import { LogoCloud } from "@/components/ui/logo-cloud-4";
import { HERO_STACK_LOGOS } from "@/lib/hero-stack-logos";
import { HeroHero1Background } from "@/components/ui/hero-hero1-background";
import type { WaitlistHeroInitialStats } from "@/lib/waitlist/hero-initial-stats";

const ThermodynamicGrid = dynamic(
    () =>
        import("@/components/ui/interactive-thermodynamic-grid").then((m) => m.ThermodynamicGrid),
    { ssr: false, loading: () => null }
);

function DiscordLogoIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M20.317 4.37a19.792 19.792 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
        </svg>
    );
}

const transitionVariants = {
    item: {
        hidden: { opacity: 0, y: 14 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring" as const,
                bounce: 0.26,
                duration: 0.95,
            },
        },
    },
};

type VoydHeroFromTemplateProps = {
    /** Extra top padding when the floating waitlist bar is visible (signed-in / member state). */
    reserveTopNav?: boolean;
    initialWaitlistStats?: WaitlistHeroInitialStats | null;
};

/**
 * Primary marketing hero — KroniQ narrative with column lines + intro thermodynamic field.
 */
export function VoydHeroFromTemplate({
    reserveTopNav = false,
    initialWaitlistStats = null,
}: VoydHeroFromTemplateProps) {
    const sectionRef = useRef<HTMLElement>(null);
    const reduceMotion = useReducedMotion();
    const [introDone, setIntroDone] = useState(false);
    const [showThermoGrid, setShowThermoGrid] = useState(false);
    const [thermoReady, setThermoReady] = useState(false);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ["start start", "end start"],
    });
    const bgY = useTransform(scrollYProgress, [0, 1], [0, reduceMotion ? 0 : 40]);

    useEffect(() => {
        const handleDone = () => setIntroDone(true);
        window.addEventListener("voyd-intro-done", handleDone);
        const fuse = setTimeout(handleDone, 5500);
        return () => {
            window.removeEventListener("voyd-intro-done", handleDone);
            clearTimeout(fuse);
        };
    }, []);

    useEffect(() => {
        const m = () => setShowThermoGrid(typeof window !== "undefined" && window.innerWidth >= 768);
        m();
        window.addEventListener("resize", m, { passive: true });
        return () => window.removeEventListener("resize", m);
    }, []);

    useEffect(() => {
        if (!introDone || reduceMotion || !showThermoGrid) {
            setThermoReady(false);
            return;
        }
        if (typeof requestIdleCallback === "function") {
            const id = requestIdleCallback(
                () => {
                    setThermoReady(true);
                },
                { timeout: 900 }
            );
            return () => cancelIdleCallback(id);
        }
        const t = window.setTimeout(() => setThermoReady(true), 0);
        return () => clearTimeout(t);
    }, [introDone, reduceMotion, showThermoGrid]);

    return (
        <section
            id="hero"
            ref={sectionRef}
            className="relative min-h-[100dvh] overflow-hidden bg-background text-foreground"
        >
            <motion.div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-0 will-change-transform"
                style={{ y: reduceMotion ? 0 : bgY }}
            >
                <HeroHero1Background />
            </motion.div>
            {thermoReady ? (
                <ThermodynamicGrid
                    interactive
                    palette="frost"
                    resolution={44}
                    coolingFactor={0.97}
                    className="pointer-events-auto z-[1]"
                />
            ) : null}

            <main className="pointer-events-none relative z-10 overflow-hidden">
                <div
                    className={cn(
                        "relative z-[2]",
                        reserveTopNav
                            ? "pt-[calc(8.5rem+env(safe-area-inset-top,0px))] md:pt-[calc(9rem+env(safe-area-inset-top,0px))] lg:pt-[calc(8.5rem+env(safe-area-inset-top,0px))]"
                            : "pt-14 md:pt-20 lg:pt-16"
                    )}
                >
                    <div className="mx-auto max-w-7xl px-6 pb-[max(6rem,calc(env(safe-area-inset-bottom,0px)+5.5rem))] lg:pb-[max(7rem,calc(env(safe-area-inset-bottom,0px)+6rem))]">
                        <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                            <AnimatedGroup variants={transitionVariants}>
                                <h1
                                    className="pointer-events-none max-w-4xl mx-auto text-balance text-4xl sm:text-5xl md:text-6xl lg:mt-2 xl:text-[4.25rem] leading-[0.98] tracking-[-0.04em]"
                                    style={{ fontFamily: "var(--font-heading)", fontWeight: 700 }}
                                >
                                    <span className="text-white/90">Your autonomous AI CMO that </span>
                                    <span className="text-white">runs growth while you build</span>
                                    <span className="text-white/90">.</span>
                                </h1>
                                <p className="pointer-events-none mx-auto mt-4 max-w-3xl text-balance text-sm text-white/55">
                                    Outreach · Content · Leads · Follow-up · All from one mission.
                                </p>
                                <p className="pointer-events-none mx-auto mt-3 max-w-3xl text-balance text-sm md:text-[15px] leading-snug text-white/65 md:leading-relaxed">
                                    KroniQ learns your company once, then runs every growth campaign from that context
                                    — around the clock.
                                </p>
                            </AnimatedGroup>

                            <AnimatedGroup
                                variants={{
                                    container: {
                                        visible: {
                                            transition: {
                                                staggerChildren: 0.05,
                                                delayChildren: 0.35,
                                            },
                                        },
                                    },
                                    ...transitionVariants,
                                }}
                                className="mt-10"
                            >
                                <div id="waitlist" className="w-full max-w-2xl mx-auto">
                                    <HeroWaitlistForm className="pointer-events-auto" />
                                </div>
                            </AnimatedGroup>

                            <WaitlistHeroSocialProof
                                className="pointer-events-auto justify-center"
                                initialStats={initialWaitlistStats}
                            />

                            <div className="pointer-events-auto mt-5 flex justify-center px-2">
                                <a
                                    href="https://discord.gg/CbgH53Fnpz"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group inline-flex min-h-[2.5rem] max-w-full items-center gap-2 rounded-lg bg-[#5865F2] px-3.5 py-2.5 text-left text-sm font-semibold leading-tight text-white shadow-[0_2px_12px_rgba(88,101,242,0.4)] transition-[background-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:bg-[#4752C4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70 active:translate-y-0 sm:min-h-11 sm:gap-2.5 sm:px-5 sm:py-2.5 sm:text-[15px]"
                                >
                                    <DiscordLogoIcon className="size-5 shrink-0 text-white sm:size-5" />
                                    <span>Join the community on Discord</span>
                                </a>
                            </div>

                            <div className="pointer-events-auto mt-10 w-full max-w-4xl mx-auto">
                                <p className="text-center text-[11px] uppercase tracking-[0.2em] text-white/30 mb-3">
                                    Built on world-class infrastructure
                                </p>
                                <LogoCloud logos={HERO_STACK_LOGOS} />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </section>
    );
}
