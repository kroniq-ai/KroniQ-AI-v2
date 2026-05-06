"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useReducedMotion } from "framer-motion";
import { MorphingText } from "@/components/ui/morphing-text";

/* ── Step data ── */
const SLIDES = [
    {
        step: "01",
        verb: ["Brief it once.", "One mission.", "Just describe it.", "Natural language."],
        title: "Brief once, run forever.",
        description:
            "Describe your company, ICP, and growth goal in plain English. KroniQ builds a full campaign plan — channels, sequences, messaging — aligned to your voice.",
        stat: "< 5 min",
        statLabel: "to first campaign",
        accent: "#10B981",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2000&auto=format&fit=crop",
        tags: ["ICP", "Brand voice", "Channels"],
    },
    {
        step: "02",
        verb: ["One memory.", "Context persists.", "Never re-explain.", "Always in sync."],
        title: "One memory. Every campaign.",
        description:
            "Your context, outcomes, and history live in a persistent memory layer. Every agent draws from the same truth — no more re-explaining yourself to every tool.",
        stat: "∞",
        statLabel: "context retention",
        accent: "#22D3EE",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2000&auto=format&fit=crop",
        tags: ["Memory", "Context", "Outcomes"],
    },
    {
        step: "03",
        verb: ["Runs in parallel.", "Always reviewing.", "Nothing slips.", "You approve."],
        title: "Parallel. Simultaneous. Zero effort.",
        description:
            "Research, outreach, and content run in parallel — cross-checking each other before anything sends. You set rules. Nothing goes out without meeting your criteria.",
        stat: "3×",
        statLabel: "parallel agent lanes",
        accent: "#818CF8",
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2000&auto=format&fit=crop",
        tags: ["Research", "Outreach", "Content"],
    },
    {
        step: "04",
        verb: ["Leads overnight.", "Sourced by AI.", "Pick, don't build.", "Wakes up first."],
        title: "Leads while you sleep.",
        description:
            "Bright Data + LinkedIn surface your ICP continuously overnight. In the morning you're choosing who to contact — not spending hours building lists from scratch.",
        stat: "24/7",
        statLabel: "autonomous operation",
        accent: "#F59E0B",
        image: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?q=80&w=2000&auto=format&fit=crop",
        tags: ["LinkedIn", "Bright Data", "Leads"],
    },
];

const BG = "#000000";

export function KroniqScrollShowcase() {
    const [activeIndex, setActiveIndex] = useState(0);
    const sectionRef = useRef<HTMLDivElement>(null);
    const reduce = useReducedMotion();

    const handleScroll = useCallback(() => {
        const section = sectionRef.current;
        if (!section) return;
        const rect = section.getBoundingClientRect();
        const sectionTop = section.offsetTop;
        const scrolled = window.scrollY - sectionTop;
        const scrollable = section.offsetHeight - window.innerHeight;
        if (scrollable <= 0) return;
        const clamped = Math.max(0, Math.min(scrolled, scrollable));
        const progress = clamped / scrollable;
        const idx = Math.min(SLIDES.length - 1, Math.floor(progress * SLIDES.length));
        setActiveIndex(idx);
    }, []);

    useEffect(() => {
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    const scrollToSlide = (index: number) => {
        const section = sectionRef.current;
        if (!section) return;
        const scrollable = section.offsetHeight - window.innerHeight;
        const step = scrollable / SLIDES.length;
        const target = section.offsetTop + step * index + step * 0.1;
        window.scrollTo({ top: target, behavior: "smooth" });
    };

    /* ── Reduced motion fallback ── */
    if (reduce) {
        return (
            <section id="how-it-works" className="py-24" style={{ background: BG }}>
                <div className="mx-auto max-w-3xl px-8 space-y-14">
                    {SLIDES.map((s) => (
                        <div key={s.step}>
                            <p className="text-xs font-mono tracking-widest mb-2" style={{ color: s.accent }}>STEP {s.step}</p>
                            <h2 className="text-3xl font-bold text-white mb-3">{s.title}</h2>
                            <p className="text-white/50 leading-relaxed">{s.description}</p>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    const slide = SLIDES[activeIndex];

    return (
        /* Total scroll height = 4 screens */
        <section
            id="how-it-works"
            ref={sectionRef}
            style={{ height: `${SLIDES.length * 100}vh`, background: BG, position: "relative" }}
        >
            {/* Sticky viewport */}
            <div
                style={{
                    position: "sticky",
                    top: 0,
                    height: "100vh",
                    overflow: "hidden",
                    background: BG,
                }}
            >
                {/* ── Section pill — placed at very top of sticky area ── */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
                    <div
                        className="inline-flex items-center gap-2 rounded-lg px-4 py-2"
                        style={{
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.09)",
                        }}
                    >
                        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">✦ How it works</span>
                    </div>
                </div>

                {/* ── 2-column layout: left content | right image ── */}
                <div className="h-full w-full grid lg:grid-cols-2">

                    {/* ── LEFT: Step content ── */}
                    <div className="flex flex-col justify-center h-full px-8 md:px-12 lg:px-16 xl:px-20 pt-20 pb-12">

                        {/* Step progress indicator */}
                        <div className="flex items-center gap-3 mb-8">
                            {SLIDES.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => scrollToSlide(i)}
                                    aria-label={`Go to step ${i + 1}`}
                                    className="transition-all duration-500 rounded-full cursor-pointer"
                                    style={{
                                        height: "3px",
                                        width: i === activeIndex ? "2.25rem" : "0.75rem",
                                        background: i === activeIndex ? slide.accent : "rgba(255,255,255,0.15)",
                                    }}
                                />
                            ))}
                            <span className="ml-1 text-[11px] font-mono text-white/22 tabular-nums">
                                {String(activeIndex + 1).padStart(2, "0")} / {String(SLIDES.length).padStart(2, "0")}
                            </span>
                        </div>

                        {/* Animated content for each step */}
                        <div style={{ position: "relative", minHeight: "380px" }}>
                            {SLIDES.map((s, i) => (
                                <div
                                    key={i}
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        display: "flex",
                                        flexDirection: "column",
                                        opacity: i === activeIndex ? 1 : 0,
                                        transform: i === activeIndex ? "translateY(0px)" : "translateY(18px)",
                                        transition: "opacity 550ms ease, transform 550ms ease",
                                        pointerEvents: i === activeIndex ? "auto" : "none",
                                    }}
                                >
                                    {/* Step label */}
                                    <p className="text-[10px] font-mono tracking-[0.3em] font-bold mb-3" style={{ color: s.accent }}>
                                        STEP {s.step}
                                    </p>

                                    {/* Morphing verb */}
                                    <div className="mb-1 font-semibold text-xl md:text-2xl" style={{ color: s.accent }}>
                                        {i === activeIndex && <MorphingText texts={s.verb} className="text-xl md:text-2xl font-semibold" />}
                                    </div>

                                    {/* Main heading */}
                                    <h2
                                        className="font-black text-white leading-[1.04]"
                                        style={{
                                            fontSize: "clamp(2rem, 4vw, 3.25rem)",
                                            fontFamily: "var(--font-heading)",
                                            letterSpacing: "-0.03em",
                                            marginTop: "4px",
                                        }}
                                    >
                                        {s.title}
                                    </h2>

                                    {/* Description */}
                                    <p className="mt-4 text-[15px] text-white/42 leading-relaxed max-w-md">
                                        {s.description}
                                    </p>

                                    {/* Stat + tags */}
                                    <div className="mt-6 flex flex-wrap items-center gap-3">
                                        <div
                                            className="flex items-center gap-2.5 rounded-lg border px-4 py-2.5"
                                            style={{
                                                background: "rgba(255,255,255,0.04)",
                                                borderColor: `${s.accent}25`,
                                            }}
                                        >
                                            <span className="text-xl font-black tabular-nums" style={{ color: s.accent }}>{s.stat}</span>
                                            <span className="text-[11px] text-white/32 font-medium leading-tight max-w-[70px]">{s.statLabel}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {s.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-wide border"
                                                    style={{
                                                        color: s.accent,
                                                        borderColor: `${s.accent}28`,
                                                        background: `${s.accent}0c`,
                                                    }}
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* CTA */}
                                    <div className="mt-7">
                                        <a
                                            href="#waitlist"
                                            className="inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-[13px] font-semibold text-white transition-all hover:brightness-125"
                                            style={{
                                                background: `${s.accent}15`,
                                                border: `1px solid ${s.accent}30`,
                                            }}
                                        >
                                            Get early access
                                            <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2.5 7h9M8 3.5l3.5 3.5L8 10.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── RIGHT: Sliding image panel ── */}
                    <div className="hidden lg:block relative h-full overflow-hidden">

                        {/* Subtle grid lines */}
                        <div
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
                                backgroundSize: "3rem 3rem",
                            }}
                            aria-hidden
                        />

                        {/* Edge fades */}
                        <div className="absolute inset-y-0 left-0 w-20 z-10 pointer-events-none" style={{ background: `linear-gradient(to right, ${BG}, transparent)` }} />
                        <div className="absolute inset-x-0 top-0 h-24 z-10 pointer-events-none" style={{ background: `linear-gradient(to bottom, ${BG}, transparent)` }} />
                        <div className="absolute inset-x-0 bottom-0 h-24 z-10 pointer-events-none" style={{ background: `linear-gradient(to top, ${BG}, transparent)` }} />

                        {/* Vertical accent glow */}
                        <div
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-px h-3/4 z-10 pointer-events-none"
                            style={{ background: `linear-gradient(to bottom, transparent, ${slide.accent}40, transparent)`, transition: "background 700ms ease" }}
                            aria-hidden
                        />

                        {/* Image strip */}
                        <div
                            style={{
                                position: "absolute",
                                inset: 0,
                                height: `${SLIDES.length * 100}%`,
                                transform: `translateY(-${(activeIndex / SLIDES.length) * 100}%)`,
                                transition: "transform 750ms cubic-bezier(0.22, 1, 0.36, 1)",
                            }}
                        >
                            {SLIDES.map((s, i) => (
                                <div
                                    key={i}
                                    className="relative w-full overflow-hidden"
                                    style={{ height: `${100 / SLIDES.length}%` }}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={s.image}
                                        alt={s.title}
                                        className="h-full w-full object-cover"
                                        style={{ filter: "brightness(0.4) saturate(0.5)" }}
                                    />
                                    {/* Accent color overlay */}
                                    <div
                                        className="absolute inset-0"
                                        style={{ background: `radial-gradient(ellipse at 60% 50%, ${s.accent}18, transparent 65%)` }}
                                    />
                                    {/* Step indicator bottom-right */}
                                    <div className="absolute bottom-12 right-8 z-20">
                                        <span className="text-[10px] font-mono tracking-[0.35em]" style={{ color: `${s.accent}80` }}>
                                            {s.step} / {String(SLIDES.length).padStart(2, "0")}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
