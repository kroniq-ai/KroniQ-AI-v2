"use client";

import React from "react";
import { useReducedMotion } from "framer-motion";

/* ── Exact Flaticon URLs from user — served with referrerPolicy="no-referrer" to bypass hotlink check ── */
const ICONS_ROW1 = [
    { src: "https://cdn-icons-png.flaticon.com/512/5968/5968854.png",  label: "HubSpot" },
    { src: "https://cdn-icons-png.flaticon.com/512/732/732221.png",   label: "Gmail" },
    { src: "https://cdn-icons-png.flaticon.com/512/733/733609.png",   label: "GitHub" },
    { src: "https://cdn-icons-png.flaticon.com/512/732/732084.png",   label: "Slack" },
    { src: "https://cdn-icons-png.flaticon.com/512/733/733585.png",   label: "Twitter" },
    { src: "https://cdn-icons-png.flaticon.com/512/281/281763.png",   label: "Google Drive" },
    { src: "https://cdn-icons-png.flaticon.com/512/888/888879.png",   label: "Notion" },
];

const ICONS_ROW2 = [
    { src: "https://cdn-icons-png.flaticon.com/512/174/174857.png",   label: "LinkedIn" },
    { src: "https://cdn-icons-png.flaticon.com/512/906/906324.png",   label: "Stripe" },
    { src: "https://cdn-icons-png.flaticon.com/512/888/888841.png",   label: "Apple" },
    { src: "https://cdn-icons-png.flaticon.com/512/5968/5968875.png", label: "HubSpot Orange" },
    { src: "https://cdn-icons-png.flaticon.com/512/906/906361.png",   label: "PayPal" },
    { src: "https://cdn-icons-png.flaticon.com/512/732/732190.png",   label: "WhatsApp" },
    { src: "https://cdn-icons-png.flaticon.com/512/888/888847.png",   label: "YouTube" },
];

const repeat = (icons: { src: string; label: string }[], times = 5) =>
    Array.from({ length: times }).flatMap(() => icons);

function IconCircle({ src, label }: { src: string; label: string }) {
    return (
        <div
            className="group h-16 w-16 flex-shrink-0 rounded-2xl flex items-center justify-center relative overflow-hidden transition-all duration-300 hover:-translate-y-1"
            style={{ 
                background: "rgba(255,255,255,0.03)", 
                backdropFilter: "blur(20px) saturate(180%)",
                border: "1px solid rgba(255,255,255,0.06)",
                boxShadow: "0 8px 32px -4px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.15)"
            }}
            title={label}
        >
            {/* Top inner rim light */}
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
            
            {/* Glossy reflection highlight */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />
            
            {/* Glow behind image on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,transparent_60%)] pointer-events-none" />

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={src}
                alt={label}
                className="h-8 w-8 object-contain relative z-10 drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] group-hover:scale-110 transition-transform duration-300"
                loading="lazy"
                referrerPolicy="no-referrer"
            />
        </div>
    );
}

export function IntegrationsSection() {
    const reduce = useReducedMotion();

    if (reduce) {
        return (
            <section className="py-10 text-center" style={{ background: "#000000" }}>
                <p className="text-white/30 text-xs">10+ integrations available</p>
            </section>
        );
    }

    return (
        <section
            id="integrations"
            className="relative overflow-hidden scroll-mt-20"
            style={{ background: "#000000" }}
        >
            {/* Radial dot grid */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                }}
                aria-hidden
            />

            {/* Ambient glow removed to prevent bleeding from the hero section */}

            {/* Heading */}
            <div className="relative z-10 section-container max-w-3xl py-16 md:py-20 text-center">
                {/* Label — rectangle with curved edges */}
                <div
                    className="inline-flex items-center gap-2 rounded-lg px-4 py-2 mx-auto mb-6"
                    style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.09)",
                    }}
                >
                    <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/50">⚡ Integrations</span>
                </div>

                <h2
                    className="font-black text-white leading-[1.05] tracking-tight"
                    style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontFamily: "var(--font-heading)", letterSpacing: "-0.02em" }}
                >
                    Integrate with your{" "}
                    <span style={{
                        background: "linear-gradient(90deg, #10b981 0%, #22d3ee 100%)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                    }}>
                        favourite tools
                    </span>
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed max-w-sm mx-auto" style={{ color: "rgba(255,255,255,0.38)" }}>
                    10+ top apps — connect seamlessly with your existing workflow.
                </p>
            </div>

            {/* Scrolling rows */}
            <div className="relative overflow-hidden pb-20">
                {/* Row 1 — scroll left */}
                <div className="flex gap-5 mb-5 overflow-hidden" aria-label="Integration icons row 1">
                    <div
                        className="flex gap-5"
                        style={{ animation: "integ-left 28s linear infinite", width: "max-content" }}
                    >
                        {repeat(ICONS_ROW1, 5).map((icon, i) => (
                            <IconCircle key={`r1-${i}`} {...icon} />
                        ))}
                    </div>
                </div>

                {/* Row 2 — scroll right */}
                <div className="flex gap-5 overflow-hidden" aria-label="Integration icons row 2">
                    <div
                        className="flex gap-5"
                        style={{
                            animation: "integ-right 28s linear infinite",
                            width: "max-content",
                            transform: "translateX(-14.2857%)",
                        }}
                    >
                        {repeat(ICONS_ROW2, 5).map((icon, i) => (
                            <IconCircle key={`r2-${i}`} {...icon} />
                        ))}
                    </div>
                </div>

                {/* Edge fades */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-36 z-10" style={{ background: "linear-gradient(to right, #000000, transparent)" }} aria-hidden />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-36 z-10" style={{ background: "linear-gradient(to left, #000000, transparent)" }} aria-hidden />
            </div>

            {/* CSS keyframe animations */}
            <style>{`
                @keyframes integ-left {
                    0%   { transform: translateX(0); }
                    100% { transform: translateX(-${(100 / 5).toFixed(4)}%); }
                }
                @keyframes integ-right {
                    0%   { transform: translateX(-${(100 / 5).toFixed(4)}%); }
                    100% { transform: translateX(0); }
                }
            `}</style>
        </section>
    );
}
