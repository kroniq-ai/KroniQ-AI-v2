"use client";

import Link from "next/link";
import { KroniQWordmarkOnDark } from "@/components/brand/kroniq-logo-png";
import { ArrowUpRight } from "lucide-react";

const SOCIAL_LINKS = [
    { label: "Instagram", href: "https://instagram.com", icon: "📷" },
    { label: "TikTok",    href: "https://tiktok.com",    icon: "🎵" },
    { label: "Discord",   href: "https://discord.gg/CbgH53Fnpz", icon: "💬" },
];

const NAV_COLS = [
    {
        heading: "Product",
        links: [
            { label: "Features",   href: "/#how-it-works" },
            { label: "FAQs",       href: "/#faq" },
        ],
    },
    {
        heading: "Legal",
        links: [
            { label: "Terms of Use",    href: "/terms" },
            { label: "Privacy Policy",  href: "/privacy" },
        ],
    },
    {
        heading: "About",
        links: [
            { label: "Discord Community", href: "https://discord.gg/CbgH53Fnpz" },
            { label: "Email us",          href: "mailto:hello@kroniq.io" },
        ],
    },
];

export function Footer() {
    return (
        <footer style={{ background: "#080808" }} className="relative">
            <div className="section-divider" />

            {/* Main content */}
            <div className="section-container pt-16 pb-0 md:pt-20">
                <div className="flex flex-col gap-12 md:flex-row md:gap-16">
                    {/* Brand column */}
                    <div className="flex-shrink-0 md:w-56 lg:w-64">
                        <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
                            <KroniQWordmarkOnDark className="h-6" priority />
                        </Link>
                        <p className="mt-4 text-[14px] leading-relaxed max-w-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                            Your autonomous AI CMO for founder-led growth. Brief once, run forever.
                        </p>
                    </div>

                    {/* Nav columns */}
                    <div className="flex flex-1 flex-wrap gap-10 md:justify-end">
                        {NAV_COLS.map((col) => (
                            <div key={col.heading} className="min-w-[110px]">
                                <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.1em] text-white/40">
                                    {col.heading}
                                </p>
                                <ul className="space-y-3">
                                    {col.links.map((link) => (
                                        <li key={link.label}>
                                            <Link
                                                href={link.href}
                                                className="text-[14px] hover:text-white transition-colors"
                                                style={{ color: "rgba(255,255,255,0.5)" }}
                                                target={link.href.startsWith("http") ? "_blank" : undefined}
                                                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Social link boxes — Kinso exact pattern */}
                <div className="mt-16 grid grid-cols-3 divide-x divide-white/[0.06] border-t border-white/[0.06]">
                    {SOCIAL_LINKS.map((social) => (
                        <a
                            key={social.label}
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-3 px-4 py-5 transition-colors hover:bg-white/[0.03] md:px-8"
                            style={{ color: "rgba(255,255,255,0.55)" }}
                        >
                            <span className="text-lg" aria-hidden>{social.icon}</span>
                            <span className="text-[14px] font-medium group-hover:text-white transition-colors">
                                {social.label}
                            </span>
                            <ArrowUpRight className="size-3.5 ml-auto opacity-0 group-hover:opacity-60 transition-opacity" />
                        </a>
                    ))}
                </div>

                {/* Copyright */}
                <div className="border-t border-white/[0.06] py-6 text-center">
                    <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.25)" }}>
                        © 2026 KroniQ Tech Inc. All rights reserved. · Built with ♥ for founders.
                    </p>
                </div>
            </div>
        </footer>
    );
}
