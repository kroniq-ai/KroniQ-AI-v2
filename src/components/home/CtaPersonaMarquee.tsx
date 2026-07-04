"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { HeroWaitlistForm } from "@/components/HeroWaitlistForm";
import { motion, useInView } from "framer-motion";

const MARQUEE_ITEMS = [
    "Solo founders",
    "Indie hackers",
    "B2B SaaS teams",
    "Agencies & studios",
    "Growth & RevOps",
    "Content leads",
    "E-commerce brands",
    "Pre-seed startups",
];

interface VerticalMarqueeProps {
    children: React.ReactNode;
    speed?: number;
    reverse?: boolean;
    className?: string;
}

function VerticalMarquee({ children, speed = 30, reverse = false, className }: VerticalMarqueeProps) {
    return (
        <div
            className={cn("group flex flex-col overflow-hidden", className)}
            style={{ "--duration": `${speed}s` } as React.CSSProperties}
        >
            <div className={cn("flex shrink-0 flex-col animate-marquee-vertical", reverse && "[animation-direction:reverse]")}>
                {children}
            </div>
            <div className={cn("flex shrink-0 flex-col animate-marquee-vertical", reverse && "[animation-direction:reverse]")} aria-hidden>
                {children}
            </div>
        </div>
    );
}

export function CtaPersonaMarquee() {
    const marqueeRef = useRef<HTMLDivElement>(null);
    const sectionRef = useRef<HTMLElement>(null);
    const inView = useInView(sectionRef as React.RefObject<HTMLElement>, { once: true, amount: 0.15 });
    const marqueeActiveRef = useRef(false);

    useEffect(() => {
        const container = marqueeRef.current;
        const section = sectionRef.current;
        if (!container || !section) return;

        let frameId = 0;

        const update = () => {
            if (!marqueeActiveRef.current) return;
            const items = container.querySelectorAll<HTMLElement>(".marquee-item");
            const rect = container.getBoundingClientRect();
            const centerY = rect.top + rect.height / 2;
            items.forEach((item) => {
                const iRect = item.getBoundingClientRect();
                const dist = Math.abs(centerY - (iRect.top + iRect.height / 2));
                const max = rect.height / 2;
                item.style.opacity = String(1 - Math.min(dist / max, 1) * 0.78);
            });
            frameId = requestAnimationFrame(update);
        };

        const observer = new IntersectionObserver(
            ([entry]) => {
                marqueeActiveRef.current = entry.isIntersecting;
                if (entry.isIntersecting) {
                    if (!frameId) frameId = requestAnimationFrame(update);
                } else {
                    cancelAnimationFrame(frameId);
                    frameId = 0;
                }
            },
            { rootMargin: "120px", threshold: 0 },
        );

        observer.observe(section);
        return () => {
            observer.disconnect();
            cancelAnimationFrame(frameId);
        };
    }, []);

    return (
        <section
            ref={sectionRef}
            className="min-h-screen text-white flex items-center justify-center px-6 py-16 overflow-hidden border-t border-white/[0.05]"
            style={{ background: "#000000" }}
        >
            <div className="w-full max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">

                    {/* ── Left: CTA copy + waitlist form ── */}
                    <motion.div
                        className="space-y-7 max-w-xl"
                        initial={{ opacity: 0, y: 28 }}
                        animate={inView ? { opacity: 1, y: 0 } : undefined}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {/* Headline */}
                        <h2
                            className="font-black text-white leading-[1.03] tracking-tight"
                            style={{
                                fontFamily: "var(--font-heading)",
                                fontSize: "clamp(2.5rem, 5.5vw, 4.5rem)",
                                letterSpacing: "-0.035em",
                            }}
                        >
                            Get started{" "}
                            <span style={{
                                background: "linear-gradient(90deg, #10b981 0%, #22d3ee 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}>
                                in minutes.
                            </span>
                        </h2>

                        {/* Subheading */}
                        <p className="text-[16px] leading-relaxed" style={{ color: "rgba(255,255,255,0.42)" }}>
                            Brief KroniQ once on your company, ICP, and goals. From there,
                            growth runs autonomously — outreach, content, and leads, in parallel.
                        </p>

                        {/* ── Inline waitlist form ── */}
                        <div className="w-full">
                            <HeroWaitlistForm />
                        </div>

                        {/* Discord CTA — solid indigo */}
                        <div className="pt-1">
                            <a
                                href="https://discord.gg/CbgH53Fnpz"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2.5 rounded-lg px-6 py-3 text-[14px] font-semibold text-white transition-all hover:brightness-110 active:scale-[0.97]"
                                style={{ background: "#5865F2", boxShadow: "0 4px 20px rgba(88,101,242,0.3)" }}
                            >
                                <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                                    <path d="M20.317 4.37a19.792 19.792 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                                </svg>
                                Join Discord community
                            </a>
                        </div>
                    </motion.div>

                    {/* ── Right: vertical persona marquee ── */}
                    <motion.div
                        ref={marqueeRef}
                        className="relative h-[580px] lg:h-[660px] flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={inView ? { opacity: 1 } : undefined}
                        transition={{ duration: 1, delay: 0.2 }}
                    >
                        <div className="relative w-full h-full">
                            <VerticalMarquee speed={22} className="h-full">
                                {MARQUEE_ITEMS.map((item, i) => (
                                    <div
                                        key={i}
                                        className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter py-7 marquee-item text-white"
                                        style={{ fontFamily: "var(--font-heading)", letterSpacing: "-0.03em" }}
                                    >
                                        {item}
                                    </div>
                                ))}
                            </VerticalMarquee>

                            {/* Vignette */}
                            <div className="pointer-events-none absolute top-0 left-0 right-0 h-56 bg-gradient-to-b from-black via-black/60 to-transparent z-10" />
                            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-black via-black/60 to-transparent z-10" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
