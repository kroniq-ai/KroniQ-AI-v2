"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { KroniqBrowserFrame, MockOneMemory, MockParallel, MockOvernight, MockActionQueue, MockLeads } from "@/components/home/product-ui-mocks";
import type { LucideIcon } from "lucide-react";
import { Brain, Layers, Moon, ListChecks, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS: {
    icon: LucideIcon;
    kicker: string;
    title: ReactNode;
    body: string;
    label: string;
    mock: ReactNode;
    accentClass: string;
}[] = [
    {
        icon: Brain,
        kicker: "Memory",
        title: (<>Brief once. <span className="gradient-amber">Growth runs forever.</span></>),
        body: "Your ICP, goals, and history live in one place. Every agent works from the same truth — no more re-explaining yourself to every tool.",
        label: "memory",
        mock: <MockOneMemory />,
        accentClass: "gradient-amber",
    },
    {
        icon: Layers,
        kicker: "Pipeline",
        title: (<>Parallel campaigns, <span className="gradient-teal">zero effort.</span></>),
        body: "Research, outreach, and content run simultaneously — cross-checking each other before anything sends. Nothing slips through.",
        label: "pipeline",
        mock: <MockParallel />,
        accentClass: "gradient-teal",
    },
    {
        icon: ListChecks,
        kicker: "Approval",
        title: (<>Your queue, <span className="gradient-heading">your sign-off.</span></>),
        body: "Every outreach goes through your approval queue. KroniQ proposes, you authorize. You're always in control.",
        label: "queue",
        mock: <MockActionQueue />,
        accentClass: "gradient-heading",
    },
    {
        icon: Search,
        kicker: "Leads",
        title: (<>Lead sourcing, <span className="gradient-violet">hands-free.</span></>),
        body: "Bright Data + LinkedIn — no manual prospecting. Your ICP surfaced continuously, enriched, and ready to contact.",
        label: "leads",
        mock: <MockLeads />,
        accentClass: "gradient-violet",
    },
    {
        icon: Moon,
        kicker: "Overnight",
        title: (<>Runs while <span className="gradient-amber">you sleep.</span></>),
        body: "KroniQ executes autonomously overnight. Your pending action queue is ready the moment you wake up — reviewed and waiting.",
        label: "overnight",
        mock: <MockOvernight />,
        accentClass: "gradient-amber",
    },
];

function StepRow({
    index,
    icon: Icon,
    title,
    body,
    label,
    kicker,
    mock,
    inView,
    reduce,
}: (typeof STEPS)[number] & { index: number; inView: boolean; reduce: boolean | null }) {
    const flip = index % 2 === 1;
    const on = inView && !reduce;

    return (
        <div
            className={cn(
                "flex flex-col items-stretch gap-10 md:gap-14 lg:flex-row lg:items-center lg:gap-20",
                flip && "lg:flex-row-reverse"
            )}
        >
            {/* Text side */}
            <motion.div
                className="min-w-0 flex-1"
                initial={on ? { opacity: 0, x: flip ? 28 : -28 } : false}
                animate={on ? { opacity: 1, x: 0 } : undefined}
                transition={{ duration: 0.65, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
                {/* Kicker pill */}
                <div className="mb-5 flex justify-start">
                    <span className="pill-label">
                        <Icon className="size-3.5" strokeWidth={2.5} aria-hidden />
                        {kicker}
                    </span>
                </div>

                <h3
                    className="text-balance text-white"
                    style={{
                        fontFamily: "var(--font-heading)",
                        fontWeight: 800,
                        fontSize: "clamp(1.875rem, 3.5vw, 2.75rem)",
                        letterSpacing: "-0.03em",
                        lineHeight: 1.1,
                    }}
                >
                    {title}
                </h3>
                <p className="mt-4 text-[15px] md:text-[16px] leading-relaxed max-w-md"
                   style={{ color: "rgba(255,255,255,0.5)" }}>
                    {body}
                </p>
            </motion.div>

            {/* Mockup side */}
            <motion.div
                className="min-w-0 w-full flex-1"
                initial={on ? { opacity: 0, y: 24, scale: 0.97 } : false}
                animate={on ? { opacity: 1, y: 0, scale: 1 } : undefined}
                transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
                <KroniqBrowserFrame
                    className="mx-auto w-full max-w-md md:max-w-lg lg:mx-0"
                    label={`app.kroniq.io · ${label}`}
                >
                    {mock}
                </KroniqBrowserFrame>
            </motion.div>
        </div>
    );
}

export default function LandingFeaturesSection() {
    const ref = useRef<HTMLElement>(null);
    const isInView = useInView(ref, { once: true, amount: 0.06, margin: "0px 0px -6%" });
    const reduce = useReducedMotion();

    return (
        <section
            id="how-it-works"
            className="relative scroll-mt-16 overflow-x-hidden"
            style={{ background: "#0A0A0A" }}
            ref={ref}
        >
            {/* Top divider */}
            <div className="section-divider" />

            <div className="section-container relative z-10 py-24 md:py-32 lg:py-40">
                {/* Section header */}
                <motion.div
                    className="mb-20 md:mb-24"
                    initial={reduce ? false : { opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : undefined}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                    <span className="pill-label mb-5">How it works</span>
                    <h2
                        className="text-white mt-4 max-w-2xl"
                        style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.03em", lineHeight: 1.1 }}
                    >
                        Brief KroniQ once.{" "}
                        <span className="gradient-heading">Growth runs from there.</span>
                    </h2>
                    <p className="mt-4 text-[16px] leading-relaxed max-w-xl" style={{ color: "rgba(255,255,255,0.45)" }}>
                        Multi-agent workstreams share one company context: outreach, content, and lead research in parallel — with a review queue so nothing surprise-sends.
                    </p>
                </motion.div>

                {/* Alternating rows */}
                <div className="flex flex-col gap-24 md:gap-32 lg:gap-40">
                    {STEPS.map((step, index) => (
                        <StepRow
                            key={step.label}
                            index={index}
                            {...step}
                            inView={isInView}
                            reduce={reduce}
                        />
                    ))}
                </div>
            </div>

            <div className="section-divider" />
        </section>
    );
}
