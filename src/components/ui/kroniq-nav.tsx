"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";

const NAV_LINKS = [
    { label: "Product", href: "/#how-it-works" },
    { label: "Integrations", href: "/#integrations" },
    { label: "Docs", href: "/blog" },
    { label: "FAQ", href: "/#faq" },
];

/** Liquid-glass button base */
const liquidGlassBase: React.CSSProperties = {
    background: "linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: "0 1px 0 rgba(255,255,255,0.08) inset, 0 8px 24px -8px rgba(0,0,0,0.5)",
    backdropFilter: "blur(16px) saturate(160%)",
    WebkitBackdropFilter: "blur(16px) saturate(160%)",
};

export function KroniQNav() {
    const [scrolled, setScrolled] = React.useState(false);
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

    return (
        <>
            {/* ── Floating bar ── */}
            <motion.div
                initial={{ y: -80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
                className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-5"
            >
                <header
                    className="w-full max-w-3xl rounded-xl transition-all duration-500"
                    style={{
                        background: scrolled
                            ? "linear-gradient(145deg, rgba(20,20,22,0.7) 0%, rgba(10,10,12,0.8) 100%)"
                            : "linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 100%)",
                        border: scrolled
                            ? "1px solid rgba(255,255,255,0.08)"
                            : "1px solid rgba(255,255,255,0.12)",
                        boxShadow: scrolled
                            ? "0 0 0 1px rgba(255,255,255,0.04) inset, 0 16px 48px -16px rgba(0,0,0,0.7), 0 4px 16px rgba(0,0,0,0.4)"
                            : "0 1px 0 rgba(255,255,255,0.08) inset, 0 8px 24px -8px rgba(0,0,0,0.5)",
                        backdropFilter: "blur(16px) saturate(160%)",
                        WebkitBackdropFilter: "blur(16px) saturate(160%)",
                    }}
                >
                    <nav className="flex items-center justify-between px-3 py-2">

                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
                            <div className="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/logos/kroniqlogowithbg.png"
                                    alt="KroniQ logo"
                                    width={32}
                                    height={32}
                                    className="object-contain h-8 w-8"
                                />
                            </div>
                            <span
                                className="font-semibold text-[15px] text-white tracking-tight"
                                style={{ fontFamily: "var(--font-display)" }}
                            >
                                KroniQ
                            </span>
                        </Link>

                        {/* Center links — desktop */}
                        <div className="hidden lg:flex items-center gap-0.5">
                            {NAV_LINKS.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className="relative px-3.5 py-2 text-[13px] font-medium text-white/48 hover:text-white/90 rounded-lg hover:bg-white/[0.05] transition-all duration-200"
                                >
                                    {link.label}
                                </a>
                            ))}
                        </div>

                        {/* Right actions */}
                        <div className="flex items-center gap-2">
                            {/* Book a Demo — liquid metal */}
                            <div className="hidden sm:block">
                                <LiquidMetalButton 
                                    label="Book a Demo" 
                                    onClick={() => window.open("https://calendly.com/atirek-sd11/kroniq-demo-atirek", "_blank", "noopener,noreferrer")}
                                />
                            </div>

                            {/* Mobile hamburger */}
                            <button
                                onClick={() => setMobileOpen(true)}
                                className="lg:hidden h-9 w-9 rounded-lg flex items-center justify-center text-white/60 hover:text-white transition-colors"
                                style={liquidGlassBase}
                                aria-label="Open menu"
                            >
                                <Menu className="h-4 w-4" />
                            </button>
                        </div>
                    </nav>
                </header>
            </motion.div>

            {/* ── Mobile drawer ── */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="fixed inset-0 z-[55]"
                            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
                            onClick={() => setMobileOpen(false)}
                        />

                        {/* Full-screen glassmorphic menu */}
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="fixed inset-0 z-[60] flex flex-col items-center justify-center p-6"
                            style={{
                                background: "radial-gradient(circle at top, rgba(30,40,50,0.8) 0%, rgba(4,4,6,0.98) 100%)",
                                backdropFilter: "blur(40px) saturate(200%)",
                                WebkitBackdropFilter: "blur(40px) saturate(200%)",
                            }}
                        >
                            {/* Close button */}
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="absolute top-6 right-6 h-12 w-12 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors border border-white/10 bg-white/[0.03]"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            {/* Links */}
                            <nav className="flex flex-col items-center gap-8 w-full mb-16">
                                {NAV_LINKS.map((link) => (
                                    <a
                                        key={link.label}
                                        href={link.href}
                                        onClick={() => setMobileOpen(false)}
                                        className="text-3xl font-bold text-white/60 hover:text-white transition-all hover:scale-105"
                                        style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}
                                    >
                                        {link.label}
                                    </a>
                                ))}
                            </nav>

                            {/* CTAs */}
                            <div className="w-full max-w-[280px] space-y-4">
                                <a
                                    href="https://calendly.com/atirek-sd11/kroniq-demo-atirek"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center justify-center gap-2 w-full rounded-2xl px-6 py-4 text-[16px] font-bold text-black"
                                    style={{ background: "linear-gradient(135deg, #10B981 0%, #22D3EE 100%)", boxShadow: "0 0 30px -5px rgba(16,185,129,0.5)" }}
                                >
                                    Book a Demo
                                    <ArrowRight className="w-5 h-5" />
                                </a>
                                <a
                                    href="https://discord.gg/CbgH53Fnpz"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center justify-center gap-2 w-full rounded-2xl px-6 py-4 text-[15px] font-semibold text-white transition-all hover:brightness-110"
                                    style={{ background: "#5865F2", boxShadow: "0 8px 24px rgba(88,101,242,0.3)" }}
                                >
                                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.792 19.792 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg>
                                    Discord community
                                </a>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
