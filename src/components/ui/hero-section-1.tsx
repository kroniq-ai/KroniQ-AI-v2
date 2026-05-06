"use client";

import { motion } from "framer-motion";
import { GrainGradient, grainGradientPresets } from "@paper-design/shaders-react";
import { HeroWaitlistForm } from "@/components/HeroWaitlistForm";
import WaitlistHeroSocialProof from "@/components/WaitlistHeroSocialProof";
import { SiGoogleads, SiMeta, SiGmail } from "react-icons/si";
import { HeroMockupParallax } from "@/components/ui/hero-mockup-parallax";
import type { WaitlistHeroInitialStats } from "@/lib/waitlist/hero-initial-stats";

/* ─── Floating brand icons ─────────────────────────────────────── */
const ICONS: {
    label: string;
    top?: string; bottom?: string; left?: string; right?: string;
    delay: number;
    bg: string;
    icon: React.ReactNode;
}[] = [
        {
            label: "YouTube", top: "12%", left: "5%", delay: 0, bg: "rgba(255,0,0,0.1)",
            icon: <svg viewBox="0 0 24 24" className="h-6 w-6" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>,
        },
        {
            label: "Instagram", top: "22%", right: "5%", delay: 0.3, bg: "rgba(225,48,108,0.1)",
            icon: (
                <svg viewBox="0 0 24 24" className="h-6 w-6">
                    <defs><linearGradient id="ig-hero" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#FD5949" /><stop offset="50%" stopColor="#D6249F" /><stop offset="100%" stopColor="#285AEB" /></linearGradient></defs>
                    <path fill="url(#ig-hero)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
            ),
        },
        {
            label: "LinkedIn", top: "42%", left: "4%", delay: 0.6, bg: "rgba(10,102,194,0.12)",
            icon: <svg viewBox="0 0 24 24" className="h-6 w-6" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>,
        },
        {
            label: "X", top: "52%", right: "5%", delay: 0.15, bg: "rgba(255,255,255,0.06)",
            icon: <svg viewBox="0 0 24 24" className="h-6 w-6" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.26 5.633L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" /></svg>,
        },
        {
            label: "TikTok", top: "30%", left: "6%", delay: 0.9, bg: "rgba(255,255,255,0.05)",
            icon: <svg viewBox="0 0 24 24" className="h-6 w-6" fill="white"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>,
        },
        {
            label: "HubSpot", top: "14%", right: "6%", delay: 0.5, bg: "rgba(255,122,89,0.1)",
            icon: <svg viewBox="0 0 24 24" className="h-6 w-6" fill="#FF7A59"><path d="M18.164 7.93V5.084a2.198 2.198 0 0 0 1.266-1.978V3.08a2.199 2.199 0 0 0-2.196-2.196h-.022a2.199 2.199 0 0 0-2.197 2.196v.026a2.198 2.198 0 0 0 1.266 1.978V7.93a6.232 6.232 0 0 0-2.962 1.314L5.765 4.556a2.434 2.434 0 0 0 .071-.536 2.44 2.44 0 1 0-2.44 2.44c.433 0 .84-.115 1.19-.315l9.577 5.577a6.24 6.24 0 0 0 0 3.508L5.586 20.88a2.43 2.43 0 0 0-1.19-.315 2.44 2.44 0 1 0 2.44 2.44 2.434 2.434 0 0 0-.071-.537l8.305-4.839a6.242 6.242 0 0 0 4.587 2.02A6.254 6.254 0 0 0 24 13.405c0-2.97-2.07-5.455-4.836-6.476zM17.212 17.65a3.246 3.246 0 1 1 0-6.492 3.246 3.246 0 0 1 0 6.492z" /></svg>,
        },
        {
            label: "Google Ads", top: "8%", right: "20%", delay: 0.2, bg: "rgba(234,67,53,0.1)",
            icon: <img src="https://upload.wikimedia.org/wikipedia/commons/c/c7/Google_Ads_logo.svg" alt="Google Ads" className="h-6 w-6 object-contain" />,
        },
        {
            label: "Meta", top: "60%", left: "10%", delay: 0.8, bg: "rgba(6,104,225,0.1)",
            icon: <SiMeta className="h-6 w-6" color="#0668E1" />,
        },
        {
            label: "Gmail", top: "40%", right: "12%", delay: 0.4, bg: "rgba(234,67,53,0.1)",
            icon: <SiGmail className="h-6 w-6" color="#EA4335" />,
        },
    ];

type Props = {
    reserveTopNav?: boolean;
    initialWaitlistStats?: WaitlistHeroInitialStats | null;
};

export function VoydHeroFromTemplate({ reserveTopNav = false, initialWaitlistStats = null }: Props) {
    return (
        <div id="hero" className="relative overflow-hidden" style={{ minHeight: "100svh" }}>
            {/* GrainGradient shader with KroniQ colors */}
            <GrainGradient
                {...grainGradientPresets[0]}
                colors={["hsl(160, 84%, 39%)", "hsl(188, 86%, 53%)", "hsl(255, 71%, 54%)"]}
                style={{ position: "absolute", inset: 0, zIndex: -10, pointerEvents: "none" }}
            />

            {/* ── Floating brand icons ── */}
            {ICONS.map((ic, i) => (
                <motion.div
                    key={ic.label}
                    className="pointer-events-none absolute z-[2] hidden md:flex"
                    style={{ top: ic.top, bottom: ic.bottom, left: ic.left, right: ic.right }}
                    initial={{ opacity: 0, scale: 0.75, y: 14 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: ic.delay + 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                    <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 3.8 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                        title={ic.label}
                        className="h-[52px] w-[52px] rounded-full flex items-center justify-center"
                        style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.15)",
                            boxShadow: "0 4px 24px -4px rgba(0,0,0,0.5)",
                            backdropFilter: "blur(24px) saturate(150%)",
                            WebkitBackdropFilter: "blur(24px) saturate(150%)",
                        }}
                    >
                        {ic.icon}
                    </motion.div>
                </motion.div>
            ))}

            {/* ── Page content ── */}
            <div className="relative z-10 flex flex-col items-center">
                {/* Space for floating nav */}
                <div className={reserveTopNav ? "h-36" : "h-32"} />

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    className="mx-auto max-w-4xl px-6 text-center text-white"
                    style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 700,
                        fontSize: "clamp(2.75rem, 7vw, 5.5rem)",
                        letterSpacing: "-0.035em",
                        lineHeight: 1.04,
                    }}
                >
                    Your AI CMO that{" "}
                    <span style={{
                        background: "linear-gradient(92deg, #10b981 0%, #22d3ee 55%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                    }}>
                        runs growth
                    </span>{" "}
                    while you build
                </motion.h1>

                {/* Subhead */}
                <motion.p
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.7 }}
                    className="mx-auto mt-6 max-w-xl px-6 text-center text-[16px] md:text-[17px] leading-relaxed"
                    style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-sans)" }}
                >
                    KroniQ learns your company once, then runs every growth campaign —
                    outreach, content, leads, follow-up — around the clock, autonomously.
                </motion.p>

                {/* ── Waitlist form & Buttons Container ── */}
                <motion.div
                    id="waitlist"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.52, duration: 0.7 }}
                    className="mt-10 w-full max-w-md px-6 flex flex-col"
                >
                    {/* Waitlist Form */}
                    <HeroWaitlistForm />

                    {/* Social proof + Discord stack */}
                    <div className="mt-5 flex flex-col items-center gap-4 w-full">
                        {/* Social proof (Centered) */}
                        <WaitlistHeroSocialProof initialStats={initialWaitlistStats} />

                        {/* Discord button (Centered) */}
                        <a
                            href="https://discord.gg/CbgH53Fnpz"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group rounded-xl px-7 py-4 text-[13px] md:text-[14px] font-semibold text-white flex items-center justify-center gap-2 transition-all hover:brightness-110 whitespace-nowrap"
                            style={{ background: "#5865F2", boxShadow: "0 4px 24px rgba(88,101,242,0.3)" }}
                        >
                            <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                                <path d="M20.317 4.37a19.792 19.792 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                            </svg>
                            Join Discord
                        </a>
                    </div>
                </motion.div>

                {/* ── Product mockup ── GSAP Parallax */}
                <HeroMockupParallax />
            </div>
        </div>
    );
}
