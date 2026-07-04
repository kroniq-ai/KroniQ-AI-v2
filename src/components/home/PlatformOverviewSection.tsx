"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { OrbitingCircles } from "@/components/ui/orbiting-circles";
import { KroniQWordmarkOnDark } from "@/components/brand/kroniq-logo-png";

/* ── SVG logo components ─── */
function SlackIcon() {
    return (
        <svg viewBox="0 0 54 54" className="h-full w-full">
            <path d="M19.712.133a5.381 5.381 0 0 0-5.376 5.387 5.381 5.381 0 0 0 5.376 5.386h5.376V5.52A5.381 5.381 0 0 0 19.712.133m0 14.365H5.376A5.381 5.381 0 0 0 0 19.884a5.381 5.381 0 0 0 5.376 5.387h14.336a5.381 5.381 0 0 0 5.376-5.387 5.381 5.381 0 0 0-5.376-5.386" fill="#36C5F0"/>
            <path d="M53.76 19.884a5.381 5.381 0 0 0-5.376-5.386 5.381 5.381 0 0 0-5.376 5.386v5.387h5.376a5.381 5.381 0 0 0 5.376-5.387m-14.336 0V5.52A5.381 5.381 0 0 0 34.048.133a5.381 5.381 0 0 0-5.376 5.387v14.364a5.381 5.381 0 0 0 5.376 5.387 5.381 5.381 0 0 0 5.376-5.387" fill="#2EB67D"/>
            <path d="M34.048 54a5.381 5.381 0 0 0 5.376-5.387 5.381 5.381 0 0 0-5.376-5.386h-5.376v5.386A5.381 5.381 0 0 0 34.048 54m0-14.365h14.336a5.381 5.381 0 0 0 5.376-5.386 5.381 5.381 0 0 0-5.376-5.387H34.048a5.381 5.381 0 0 0-5.376 5.387 5.381 5.381 0 0 0 5.376 5.386" fill="#ECB22E"/>
            <path d="M0 34.249a5.381 5.381 0 0 0 5.376 5.386 5.381 5.381 0 0 0 5.376-5.386v-5.387H5.376A5.381 5.381 0 0 0 0 34.249m14.336 0v14.364A5.381 5.381 0 0 0 19.712 54a5.381 5.381 0 0 0 5.376-5.387V34.249a5.381 5.381 0 0 0-5.376-5.387 5.381 5.381 0 0 0-5.376 5.387" fill="#E01E5A"/>
        </svg>
    );
}

function LinkedInIcon() {
    return (
        <svg viewBox="0 0 34 34" className="h-full w-full">
            <path d="M34 2.5v29A2.5 2.5 0 0 1 31.5 34h-29A2.5 2.5 0 0 1 0 31.5v-29A2.5 2.5 0 0 1 2.5 0h29A2.5 2.5 0 0 1 34 2.5z" fill="#0077B5"/>
            <path d="M8 13h4v13H8zm2-6.4a2.3 2.3 0 1 1 0 4.6 2.3 2.3 0 0 1 0-4.6zM14.5 13H18v1.8c.5-1 2-2 4.2-2 4.5 0 5.3 3 5.3 6.8V26h-4v-5.7c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1V26h-4.7V13z" fill="#fff"/>
        </svg>
    );
}

function GmailIcon() {
    return (
        <svg viewBox="0 0 32 24" className="h-full w-full">
            <path d="M2 0h28c1.1 0 2 .9 2 2v20a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2C0 .9.9 0 2 0z" fill="#F6F6F6"/>
            <path d="M2 2l14 10L30 2" fill="none" stroke="#EA4335" strokeWidth="2"/>
            <path fill="#4285F4" d="M0 4v18l9-9z"/>
            <path fill="#34A853" d="M32 4v18l-9-9z"/>
            <path fill="#FBBC04" d="M0 22l9-9h14l9 9z"/>
            <path fill="#EA4335" d="M0 4l9 9h14L9 4 0 4z"/>
        </svg>
    );
}

function TwitterXIcon() {
    return (
        <svg viewBox="0 0 32 32" className="h-full w-full">
            <rect width="32" height="32" rx="16" fill="#000"/>
            <path d="M17.8 14.8L24.3 7h-1.5l-5.6 6.5L12.7 7H7l6.8 9.9L7 25h1.5l6-7 4.8 7H25L17.8 14.8zm-2.1 2.4l-.7-1L9 8.2h2.4l4.5 6.4.7 1 5.9 8.4h-2.4l-4.4-6.2-.1.2z" fill="#fff"/>
        </svg>
    );
}

function OpenAIIcon() {
    return (
        <svg viewBox="0 0 32 32" className="h-full w-full" fill="none">
            <rect width="32" height="32" rx="8" fill="#000"/>
            <path d="M26.5 13.6a5.7 5.7 0 0 0-.5-4.7 5.8 5.8 0 0 0-6.3-2.8 5.7 5.7 0 0 0-4.3-2A5.8 5.8 0 0 0 9.8 7.8a5.7 5.7 0 0 0-3.8 2.8 5.8 5.8 0 0 0 .7 6.8 5.7 5.7 0 0 0 .5 4.7 5.8 5.8 0 0 0 6.3 2.8 5.7 5.7 0 0 0 4.3 2 5.8 5.8 0 0 0 5.5-4A5.7 5.7 0 0 0 27 19a5.8 5.8 0 0 0-.5-5.4zM17.4 23a4.3 4.3 0 0 1-2.8-1l.1-.1 4.6-2.7a.8.8 0 0 0 .4-.7V14l2 1.1v5.5A4.3 4.3 0 0 1 17.4 23zm-9.2-4a4.3 4.3 0 0 1-.5-3 3 3 0 0 0 .1.1l4.7 2.7a.8.8 0 0 0 .8 0l5.6-3.3v2.2l-4.7 2.7a4.3 4.3 0 0 1-6-.4zM7.3 11.6a4.3 4.3 0 0 1 2.2-1.9v5.5a.8.8 0 0 0 .4.7L15.6 19l-2 1.1-4.7-2.7a4.3 4.3 0 0 1-1.6-5.8zM23.5 18l-4.7-2.7 2-1.1L25.5 17a4.3 4.3 0 0 1-.6 6.9v-5.5a.8.8 0 0 0-.4-.4zm2-3.1l-.1-.1-4.7-2.7a.8.8 0 0 0-.8 0l-5.6 3.3v-2.2l4.7-2.7a4.3 4.3 0 0 1 6.5 3.4v.3zm-12.1-.9L11.2 13v-2.2l4.7-2.7a4.3 4.3 0 0 1 6.4 3.3v.3h-.1l-4.7-2.7a.8.8 0 0 0-.8 0l-3.3 1.9z" fill="white"/>
        </svg>
    );
}

function HubSpotIcon() {
    return (
        <svg viewBox="0 0 32 32" className="h-full w-full" fill="none">
            <rect width="32" height="32" rx="8" fill="#FF7A59"/>
            <circle cx="21" cy="11" r="3.5" fill="white"/>
            <path d="M18.5 11H8v2h10.5v-2z" fill="white"/>
            <circle cx="21" cy="21" r="3.5" fill="white"/>
            <path d="M18.5 20H8v2h10.5v-2z" fill="white"/>
        </svg>
    );
}

function NotionIcon() {
    return (
        <svg viewBox="0 0 32 32" className="h-full w-full">
            <rect width="32" height="32" rx="4" fill="#fff" stroke="#e5e5e5" strokeWidth="1"/>
            <text x="9" y="23" fontFamily="serif" fontSize="14" fontWeight="900" fill="#000">N</text>
        </svg>
    );
}

function IconWrapper({ children, glow }: { children: React.ReactNode; glow?: string }) {
    return (
        <div
            className="flex items-center justify-center rounded-2xl border border-white/[0.1] overflow-hidden"
            style={{
                background: "rgba(20,20,22,0.95)",
                boxShadow: glow
                    ? `0 0 20px ${glow}, 0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)`
                    : "0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)",
                width: "100%",
                height: "100%",
                padding: "22%",
            }}
        >
            {children}
        </div>
    );
}

import React from "react";

export function PlatformOverviewSection() {
    const ref = useRef<HTMLElement>(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });

    return (
        <section id="platform" className="relative overflow-hidden" style={{ background: "#0A0A0A" }} ref={ref}>
            <div className="section-divider" />

            <div className="section-container py-24 md:py-32 lg:py-40">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">

                    {/* Left: text */}
                    <motion.div
                        initial={{ opacity: 0, x: -28 }}
                        animate={isInView ? { opacity: 1, x: 0 } : undefined}
                        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <span className="pill-label mb-6">Integrations</span>
                        <h2
                            className="text-white mt-4"
                            style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.03em", lineHeight: 1.1 }}
                        >
                            Connects to everything{" "}
                            <span className="gradient-teal">you already use.</span>
                        </h2>
                        <p className="mt-5 text-[16px] leading-relaxed max-w-md" style={{ color: "rgba(255,255,255,0.45)" }}>
                            KroniQ integrates with LinkedIn, Gmail, Slack, HubSpot, Twitter/X, Notion, and more.
                            Your existing stack, now fully autonomous.
                        </p>

                        {/* Integration name pills */}
                        <div className="mt-8 flex flex-wrap gap-2">
                            {["LinkedIn", "Gmail", "Slack", "HubSpot", "Twitter/X", "Notion", "OpenAI"].map((name) => (
                                <span
                                    key={name}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[12px] font-medium text-white/55 hover:border-white/[0.16] hover:text-white/80 transition-all"
                                >
                                    {name}
                                </span>
                            ))}
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-[12px] font-medium text-white/35">
                                +more soon
                            </span>
                        </div>
                    </motion.div>

                    {/* Right: Orbiting circles visualization */}
                    <motion.div
                        className="relative flex items-center justify-center"
                        initial={{ opacity: 0, scale: 0.92 }}
                        animate={isInView ? { opacity: 1, scale: 1 } : undefined}
                        transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {/* Container for orbiting circles */}
                        <div className="relative flex items-center justify-center" style={{ width: "380px", height: "380px" }}>

                            {/* Center glow */}
                            <div
                                className="absolute"
                                style={{
                                    width: "160px",
                                    height: "160px",
                                    borderRadius: "9999px",
                                    background: "radial-gradient(ellipse, rgba(16,185,129,0.2) 0%, transparent 70%)",
                                    filter: "blur(20px)",
                                }}
                                aria-hidden
                            />

                            {/* KroniQ logo center */}
                            <div
                                className="relative z-10 flex items-center justify-center rounded-2xl border border-white/[0.12]"
                                style={{
                                    width: "72px",
                                    height: "72px",
                                    background: "rgba(16,16,18,0.95)",
                                    boxShadow: "0 0 40px rgba(16,185,129,0.25), 0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
                                }}
                            >
                                <KroniQWordmarkOnDark className="h-5 w-auto" priority />
                            </div>

                            {/* Inner orbit — 4 icons, faster */}
                            <OrbitingCircles
                                duration={18}
                                radius={110}
                                iconSize={46}
                                pathClassName="stroke-white/[0.06]"
                            >
                                <IconWrapper glow="rgba(0,119,181,0.3)"><LinkedInIcon /></IconWrapper>
                                <IconWrapper glow="rgba(234,67,53,0.25)"><GmailIcon /></IconWrapper>
                                <IconWrapper glow="rgba(0,0,0,0.3)"><TwitterXIcon /></IconWrapper>
                                <IconWrapper glow="rgba(36,197,94,0.25)"><SlackIcon /></IconWrapper>
                            </OrbitingCircles>

                            {/* Outer orbit — 3 icons, slower, reverse */}
                            <OrbitingCircles
                                duration={28}
                                radius={168}
                                iconSize={42}
                                reverse
                                pathClassName="stroke-white/[0.04]"
                            >
                                <IconWrapper glow="rgba(255,122,0,0.3)"><HubSpotIcon /></IconWrapper>
                                <IconWrapper glow="rgba(255,255,255,0.1)"><OpenAIIcon /></IconWrapper>
                                <IconWrapper><NotionIcon /></IconWrapper>
                            </OrbitingCircles>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="section-divider" />
        </section>
    );
}
