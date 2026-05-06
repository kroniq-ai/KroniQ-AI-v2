"use client";

import { useEffect, useRef, type ComponentProps } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

/* ─── Magnetic button (exact pattern from your snippet) ─── */
type MagneticProps = ComponentProps<"button"> & ComponentProps<"a"> & {
    as?: "button" | "a";
};

const MagneticButton = ({ className, children, as: Tag = "button", ...props }: MagneticProps) => {
    const ref = useRef<HTMLElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const ctx = gsap.context(() => {
            const onMove = (e: MouseEvent) => {
                const r = el.getBoundingClientRect();
                const x = e.clientX - (r.left + r.width / 2);
                const y = e.clientY - (r.top + r.height / 2);
                gsap.to(el, { x: x * 0.4, y: y * 0.4, rotationX: -y * 0.15, rotationY: x * 0.15, scale: 1.05, ease: "power2.out", duration: 0.4 });
            };
            const onLeave = () => gsap.to(el, { x: 0, y: 0, rotationX: 0, rotationY: 0, scale: 1, ease: "elastic.out(1,0.3)", duration: 1.2 });
            el.addEventListener("mousemove", onMove as EventListener);
            el.addEventListener("mouseleave", onLeave);
            return () => {
                el.removeEventListener("mousemove", onMove as EventListener);
                el.removeEventListener("mouseleave", onLeave);
            };
        }, el);
        return () => ctx.revert();
    }, []);

    // @ts-expect-error polymorphic ref
    return <Tag ref={ref} className={cn("cursor-pointer inline-block will-change-transform", className)} {...props}>{children}</Tag>;
};

/* ─── Marquee items ─── */
const MarqueeItem = () => (
    <div className="flex items-center space-x-12 px-6 text-xs font-bold uppercase tracking-[0.28em] text-white/40">
        <span>Autonomous CMO</span><span className="text-emerald-500/60">✦</span>
        <span>Brief once, run forever</span><span className="text-emerald-500/60">✦</span>
        <span>KroniQ</span><span className="text-emerald-500/60">✦</span>
        <span>Private beta</span><span className="text-emerald-500/60">✦</span>
        <span>Founder-led growth</span><span className="text-emerald-500/60">✦</span>
    </div>
);

/* ─── Main ─── */
export function CinematicFooterKroniq() {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const giantRef = useRef<HTMLDivElement>(null);
    const headingRef = useRef<HTMLHeadingElement>(null);
    const linksRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!wrapperRef.current) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(giantRef.current, { y: "10vh", scale: 0.8, opacity: 0 }, {
                y: "0vh", scale: 1, opacity: 1, ease: "power1.out",
                scrollTrigger: { trigger: wrapperRef.current, start: "top 80%", end: "bottom bottom", scrub: 1 },
            });
            gsap.fromTo([headingRef.current, linksRef.current], { y: 50, opacity: 0 }, {
                y: 0, opacity: 1, stagger: 0.15, ease: "power3.out",
                scrollTrigger: { trigger: wrapperRef.current, start: "top 40%", end: "bottom bottom", scrub: 1 },
            });
        }, wrapperRef);
        return () => ctx.revert();
    }, []);

    return (
        <>
            {/* Curtain reveal wrapper — sits in flow, clips the fixed footer */}
            <div
                ref={wrapperRef}
                className="relative h-screen w-full"
                style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
            >
                <footer className="fixed bottom-0 left-0 flex h-screen w-full flex-col justify-between overflow-hidden bg-black text-white">

                    {/* Grid background */}
                    <div className="pointer-events-none absolute inset-0 z-0"
                        style={{
                            backgroundSize: "60px 60px",
                            backgroundImage: "linear-gradient(to right,rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(to bottom,rgba(255,255,255,0.04) 1px,transparent 1px)",
                            maskImage: "linear-gradient(to bottom,transparent,black 30%,black 70%,transparent)",
                        }}
                    />

                    {/* Giant background text */}
                    <div
                        ref={giantRef}
                        className="pointer-events-none select-none absolute -bottom-[5vh] left-1/2 -translate-x-1/2 whitespace-nowrap z-0"
                        style={{
                            fontSize: "26vw",
                            lineHeight: 0.75,
                            fontWeight: 900,
                            letterSpacing: "-0.05em",
                            color: "transparent",
                            WebkitTextStroke: "1px rgba(255,255,255,0.04)",
                        }}
                        aria-hidden
                    >
                        KRONIQ
                    </div>

                    {/* Diagonal marquee strip */}
                    <div className="absolute top-12 left-0 w-full overflow-hidden border-y border-white/[0.07] bg-black/60 py-3 z-10 -rotate-2 scale-110 shadow-2xl backdrop-blur-md">
                        <div className="marquee-track flex w-max">
                            <MarqueeItem /><MarqueeItem />
                        </div>
                    </div>

                    {/* Center content */}
                    <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 mt-20 w-full max-w-4xl mx-auto">


                        <h2
                            ref={headingRef}
                            className="text-center font-black tracking-tighter leading-[1.1] pb-2 mb-5"
                            style={{
                                fontFamily: "var(--font-heading)",
                                fontSize: "clamp(3.5rem, 9vw, 7.5rem)",
                                background: "linear-gradient(160deg, #ffffff 30%, rgba(255,255,255,0.5) 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}
                        >
                            Ready to begin?
                        </h2>

                        <p className="mb-10 text-center text-sm md:text-base text-white/35 max-w-sm leading-relaxed">
                            Your autonomous AI CMO goes live in minutes. Brief it once — it runs forever.
                        </p>

                        <div ref={linksRef} className="flex flex-col items-center gap-4 w-full">
                            {/* Primary row */}
                            <div className="flex flex-wrap items-center justify-center gap-3">
                                {/* Primary CTA — LiquidMetalButton */}
                                <LiquidMetalButton 
                                    label="Get early access →" 
                                    onClick={() => {
                                        document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
                                    }} 
                                />

                                {/* Secondary CTA — outlined */}
                                <MagneticButton
                                    as="a"
                                    href="https://discord.gg/CbgH53Fnpz"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group rounded-xl px-9 py-4 text-sm md:text-base font-semibold text-white flex items-center gap-2.5 transition-all hover:brightness-110"
                                    style={{ background: "#5865F2", boxShadow: "0 4px 24px rgba(88,101,242,0.3)" }}
                                >
                                    {/* Discord icon */}
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.04.032.052a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.04.001-.088-.041-.104a13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                                    </svg>
                                    <span>Discord community</span>
                                </MagneticButton>
                            </div>

                            {/* Legal links — plain text, no pill */}
                            <div className="flex flex-wrap justify-center gap-1 mt-1">
                                {[
                                    { label: "Privacy Policy", href: "/privacy" },
                                    { label: "Terms of Service", href: "/terms" },
                                    { label: "Contact", href: "mailto:hello@kroniq.io" },
                                ].map((link, i, arr) => (
                                    <span key={link.href} className="flex items-center gap-1">
                                        <a
                                            href={link.href}
                                            className="text-[11px] text-white/25 hover:text-white/55 transition-colors duration-200 font-medium tracking-wide"
                                        >
                                            {link.label}
                                        </a>
                                        {i < arr.length - 1 && (
                                            <span className="text-white/15 text-[11px]">·</span>
                                        )}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Bottom bar — copyright left, back-to-top right */}
                    <div className="relative z-20 w-full pb-8 px-6 md:px-12 flex items-center justify-between">
                        <div className="text-white/25 text-[10px] md:text-xs font-medium tracking-wider w-[70%] md:w-1/3">
                            © {new Date().getFullYear()} KroniQ Tech Inc. All rights reserved.
                        </div>
                        
                        {/* Centered links */}
                        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-3">
                            {[
                                { label: "Privacy", href: "/privacy" },
                                { label: "Terms", href: "/terms" },
                                { label: "Contact", href: "mailto:hello@kroniq.io" },
                            ].map((link, i, arr) => (
                                <span key={link.href} className="flex items-center gap-3">
                                    <a href={link.href} className="text-[11px] text-white/22 hover:text-white/50 transition-colors">
                                        {link.label}
                                    </a>
                                    {i < arr.length - 1 && <span className="text-white/12 text-[10px]">·</span>}
                                </span>
                            ))}
                        </div>

                        <div className="flex justify-end w-[30%] md:w-1/3">
                            <MagneticButton
                                as="button"
                                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                                className="footer-glass-pill w-10 h-10 rounded-lg flex items-center justify-center text-white/40 hover:text-white/80 group border border-white/[0.07] transition-colors"
                                aria-label="Back to top"
                            >
                                <svg className="w-4 h-4 transform group-hover:-translate-y-0.5 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                            </MagneticButton>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
