"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { LandingSectionHeader } from "@/components/home/LandingSectionHeader";
import { HowItWorksAtmosphere } from "@/components/home/section-atmospheres";
import { HeroGlassShell } from "@/components/ui/hero-glass-shell";
import type { LucideIcon } from "lucide-react";
import { Brain, Layers, Moon } from "lucide-react";

const STEPS: { icon: LucideIcon; title: string; body: string }[] = [
    {
        icon: Brain,
        title: "One company memory",
        body: "Your ICP, goals, and history live in one place. Every agent works from the same truth.",
    },
    {
        icon: Layers,
        title: "Parallel campaigns",
        body: "Research, outreach, and content run at the same time — cross-checking each other before anything sends.",
    },
    {
        icon: Moon,
        title: "Runs while you sleep",
        body: "KroniQ executes autonomously overnight. Your pending actions queue is ready when you wake up.",
    },
];

/** How it works — WebGL ribbons + diagonal sheen (see `HowItWorksAtmosphere`). */
export default function LandingFeaturesSection() {
    const ref = useRef<HTMLElement>(null);
    const isInView = useInView(ref, { once: true, amount: 0.1 });

    return (
        <section
            id="how-it-works"
            className="relative scroll-mt-[max(5rem,env(safe-area-inset-top))] overflow-x-hidden overflow-y-visible bg-black"
            ref={ref}
        >
            <HowItWorksAtmosphere />
            <div className="section-container relative z-10 pt-12 pb-20 md:pt-16 md:pb-28 lg:pt-20 lg:pb-32">
                <LandingSectionHeader
                    kicker="How it works"
                    title="You brief KroniQ once. Growth runs from there."
                    subtitle="KroniQ's multi-agent system works from your company context — outreach, content, and lead research happen simultaneously, with hallucination guardrails on."
                    className="mb-10 md:mb-12"
                />

                <motion.div
                    initial={{ opacity: 0, y: 22 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="mx-auto max-w-4xl"
                >
                    <HeroGlassShell paddingClassName="p-6 md:p-10">
                        <div className="grid gap-8 md:grid-cols-3 md:gap-8">
                            {STEPS.map(({ icon: Icon, title, body }) => (
                                <div key={title} className="flex flex-col gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.1] bg-white/[0.05]">
                                        <Icon className="size-5 text-white/80" strokeWidth={1.25} aria-hidden />
                                    </div>
                                    <h3 className="text-base font-semibold tracking-tight text-white">{title}</h3>
                                    <p className="text-sm leading-relaxed text-white/45">{body}</p>
                                </div>
                            ))}
                        </div>
                    </HeroGlassShell>
                </motion.div>
            </div>
        </section>
    );
}
