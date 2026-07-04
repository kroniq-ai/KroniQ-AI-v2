"use client";

import { motion } from "framer-motion";
import { HeroGrainBackground } from "@/components/ui/hero-grain-background";
import { HeroWaitlistForm } from "@/components/HeroWaitlistForm";
import { HeroMockupParallax } from "@/components/ui/hero-mockup-parallax";
import { PilotLoginLink } from "@/components/PilotLoginLink";
import { GlassButton, glassDark } from "@/components/ui/glass-surface";

/* ─── Floating brand icons — scattered across full hero ─────────── */
const ICONS: {
    label: string;
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
    delay: number;
    icon: React.ReactNode;
}[] = [
        {
            label: "YouTube", top: "11%", left: "2.5%", delay: 0,
            icon: <svg viewBox="0 0 24 24" className="h-6 w-6" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>,
        },
        {
            label: "Instagram", top: "34%", right: "2%", delay: 0.3,
            icon: (
                <svg viewBox="0 0 24 24" className="h-6 w-6">
                    <defs><linearGradient id="ig-hero" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#FD5949" /><stop offset="50%" stopColor="#D6249F" /><stop offset="100%" stopColor="#285AEB" /></linearGradient></defs>
                    <path fill="url(#ig-hero)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
            ),
        },
        {
            label: "HubSpot", bottom: "28%", right: "2.5%", delay: 0.5,
            icon: <svg viewBox="0 0 24 24" className="h-6 w-6" fill="#FF7A59"><path d="M18.164 7.93V5.084a2.198 2.198 0 0 0 1.266-1.978V3.08a2.199 2.199 0 0 0-2.196-2.196h-.022a2.199 2.199 0 0 0-2.197 2.196v.026a2.198 2.198 0 0 0 1.266 1.978V7.93a6.232 6.232 0 0 0-2.962 1.314L5.765 4.556a2.434 2.434 0 0 0 .071-.536 2.44 2.44 0 1 0-2.44 2.44c.433 0 .84-.115 1.19-.315l9.577 5.577a6.24 6.24 0 0 0 0 3.508L5.586 20.88a2.43 2.43 0 0 0-1.19-.315 2.44 2.44 0 1 0 2.44 2.44 2.434 2.434 0 0 0-.071-.537l8.305-4.839a6.242 6.242 0 0 0 4.587 2.02A6.254 6.254 0 0 0 24 13.405c0-2.97-2.07-5.455-4.836-6.476zM17.212 17.65a3.246 3.246 0 1 1 0-6.492 3.246 3.246 0 0 1 0 6.492z" /></svg>,
        },
        {
            label: "TikTok", top: "52%", left: "3%", delay: 0.9,
            icon: <svg viewBox="0 0 24 24" className="h-6 w-6" fill="white"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg>,
        },
        {
            label: "Google Ads", top: "8%", right: "5%", delay: 0.2,
            icon: <img src="https://upload.wikimedia.org/wikipedia/commons/c/c7/Google_Ads_logo.svg" alt="Google Ads" className="h-6 w-6 object-contain" />,
        },
    ];

type Props = {
    reserveTopNav?: boolean;
};

export function VoydHeroFromTemplate({ reserveTopNav = false }: Props) {
    return (
        <div id="hero" className="relative overflow-hidden" style={{ minHeight: "100svh" }}>
            <HeroGrainBackground />

            {/* ── Floating brand icons — full hero scatter ── */}
            <div className="pointer-events-none absolute inset-0 z-[12] hidden md:block">
            {ICONS.map((ic, i) => (
                <motion.div
                    key={ic.label}
                    className="absolute flex"
                    style={{ top: ic.top, bottom: ic.bottom, left: ic.left, right: ic.right }}
                    initial={{ opacity: 0, scale: 0.75, y: 14 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: ic.delay + 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                    <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 3.8 + i * 0.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                        title={ic.label}
                        className="flex h-[52px] w-[52px] items-center justify-center rounded-full"
                        style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.16)",
                            boxShadow: "0 4px 28px -4px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04) inset",
                            backdropFilter: "blur(24px) saturate(150%)",
                            WebkitBackdropFilter: "blur(24px) saturate(150%)",
                        }}
                    >
                        {ic.icon}
                    </motion.div>
                </motion.div>
            ))}
            </div>

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
                    Stop babysitting{" "}
                    <span style={{
                        background: "linear-gradient(92deg, #fb923c 0%, #f472b6 45%, #22d3ee 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                    }}>
                        marketing.
                    </span>
                </motion.h1>

                {/* Subhead */}
                <motion.p
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.7 }}
                    className="mx-auto mt-6 max-w-2xl px-6 text-center text-[16px] md:text-[18px] leading-relaxed"
                    style={{ color: "rgba(255,255,255,0.42)", fontFamily: "var(--font-sans)" }}
                >
                    Brief KroniQ once on your company, ICP, and goals. It runs outbound, content, lead
                    sourcing, and daily CMO audits in parallel — you approve what matters.
                </motion.p>

                {/* ── Waitlist form ── */}
                <motion.div
                    id="waitlist"
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.52, duration: 0.7 }}
                    className="mt-10 w-full max-w-md px-6 flex flex-col"
                >
                    <HeroWaitlistForm />

                    <div className="mt-5 flex w-full flex-col items-center gap-4">
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            <PilotLoginLink className={glassDark.button}>
                                Already invited? Sign in
                            </PilotLoginLink>
                            <GlassButton
                                href="https://discord.gg/CbgH53Fnpz"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-[#b8c4ff]"
                            >
                                Join Discord
                            </GlassButton>
                        </div>
                    </div>
                </motion.div>

                {/* ── Product mockup ── GSAP Parallax */}
                <HeroMockupParallax />
            </div>
        </div>
    );
}
