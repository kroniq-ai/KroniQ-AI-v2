"use client";

import { cn } from "@/lib/utils";
import { HERO_STACK_LOGOS } from "@/lib/hero-stack-logos";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { useReducedMotion } from "framer-motion";

function LogoStrip({ reverse, className }: { reverse?: boolean; className?: string }) {
    return (
        <div className={cn("relative w-full border-y border-border/30 bg-secondary/30 py-4 md:py-5", className)}>
            <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
            <div className="mx-auto w-full max-w-6xl">
                <InfiniteSlider
                    gap={40}
                    duration={reverse ? 40 : 36}
                    durationOnHover={18}
                    reverse={!!reverse}
                    className="opacity-90"
                >
                    {HERO_STACK_LOGOS.map((logo) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            alt={logo.alt}
                            key={`${logo.alt}-${reverse ? "r" : "f"}`}
                            className="pointer-events-none h-4 max-h-5 w-auto select-none dark:brightness-0 dark:invert md:h-5"
                            height={logo.height ?? "auto"}
                            loading="lazy"
                            src={logo.src}
                            width={logo.width ?? "auto"}
                        />
                    ))}
                </InfiniteSlider>
            </div>
            <ProgressiveBlur
                blurIntensity={1.2}
                className="pointer-events-none absolute left-0 top-0 h-full w-[min(22vw,140px)]"
                direction="left"
            />
            <ProgressiveBlur
                blurIntensity={1.2}
                className="pointer-events-none absolute right-0 top-0 h-full w-[min(22vw,140px)]"
                direction="right"
            />
        </div>
    );
}

/** Two-row “integrates with your stack” marquees — reuses the same wordmarks as the hero. */
export function IntegrationsMarqueeSection() {
    const reduce = useReducedMotion();
    if (reduce) {
        return (
            <section id="integrations" className="scroll-mt-16 py-10 md:py-14" style={{ background: "#050607" }}>
                <p className="text-center text-xs text-white/35">
                    OpenAI, Claude, Supabase, Vercel, and more
                </p>
            </section>
        );
    }
    return (
        <section id="integrations" className="scroll-mt-20 overflow-x-hidden relative" style={{ background: "#050607" }}>
            {/* Subtle ambient orb — matches hero palette */}
            <div
                className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-0 h-[320px] w-[600px] opacity-[0.07] blur-[100px]"
                style={{ background: "radial-gradient(ellipse, #7c3aed 0%, transparent 70%)" }}
            />

            <div className="section-container max-w-6xl py-10 md:py-14 text-center relative z-10">
                <span className="pill-label mx-auto mb-4">
                    <span className="text-[10px]">⚡</span>
                    Integrations
                </span>
                <h2 className="section-heading">Built for your real stack</h2>
                <p className="mt-3 max-w-lg mx-auto text-[15px] leading-relaxed" style={{ color: "rgba(255,255,255,0.38)" }}>
                    The same models and infra you already trust — not a black box in the corner.
                </p>
            </div>

            <div className="flex flex-col gap-3 relative z-10 pb-10 md:pb-14">
                <LogoStrip />
                <LogoStrip reverse />
            </div>

            {/* Bottom edge fade into next dark section */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#050607] to-transparent" />
        </section>
    );
}
