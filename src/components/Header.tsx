"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { HashScrollLink } from "@/components/HashScrollLink";
import { KroniQWordmarkOnDark } from "@/components/brand/kroniq-logo-png";
import { ArrowRight } from "lucide-react";

const navLinks = [
    { label: "About", href: "/#platform" },
    { label: "Features", href: "/#how-it-works" },
    { label: "FAQs", href: "/#faq" },
];

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 30);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4"
        >
            {/* Main nav bar — Floating glassmorphic pill */}
            <nav
                className={`w-full max-w-4xl flex items-center justify-between px-5 md:px-8 h-[56px] rounded-full transition-all duration-300 border ${
                    scrolled
                        ? "bg-black/60 backdrop-blur-2xl border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.8)]"
                        : "bg-white/[0.08] backdrop-blur-xl border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.1)]"
                }`}
            >
                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center gap-2.5 hover:opacity-80 transition-opacity shrink-0"
                >
                    <KroniQWordmarkOnDark className="h-5" priority />
                </Link>

                {/* Center nav links */}
                <div className="hidden md:flex items-center gap-6">
                    <div className="w-px h-5 bg-white/10" />
                    {navLinks.map((link) => (
                        <HashScrollLink
                            key={link.label}
                            href={link.href}
                            className="text-[14px] font-medium text-white/55 hover:text-white transition-colors duration-200"
                        >
                            {link.label}
                        </HashScrollLink>
                    ))}
                </div>

                {/* Right CTAs */}
                <div className="hidden md:flex items-center gap-3">
                    <button
                        type="button"
                        data-waitlist-trigger
                        className="text-[13px] font-medium text-white/55 hover:text-white transition-colors"
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        data-waitlist-trigger
                        className="btn-primary !py-2 !px-5 !text-[13px]"
                    >
                        Get Started
                        <ArrowRight className="size-3.5 ml-0.5" aria-hidden />
                    </button>
                </div>

                {/* Mobile hamburger */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="md:hidden w-6 h-5 flex flex-col justify-center gap-[5px]"
                    aria-label="Toggle menu"
                >
                    <motion.span
                        animate={menuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="block w-5 h-[1.5px] bg-white/70 origin-center"
                    />
                    <motion.span
                        animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="block w-5 h-[1.5px] bg-white/70 origin-center"
                    />
                </button>
            </nav>

            {/* Mobile dropdown */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute top-[62px] left-0 right-0 bg-[#0a0a0a] border-b border-white/[0.07] shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
                    >
                        <div className="p-4 flex flex-col gap-1 max-w-sm mx-auto">
                            {navLinks.map((link, i) => (
                                <motion.div
                                    key={link.label}
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.04 * i, duration: 0.2 }}
                                >
                                    <HashScrollLink
                                        href={link.href}
                                        onClick={() => setMenuOpen(false)}
                                        className="block py-3 px-3 text-[15px] font-medium text-white/65 hover:text-white rounded-xl transition-colors hover:bg-white/[0.04]"
                                    >
                                        {link.label}
                                    </HashScrollLink>
                                </motion.div>
                            ))}
                            <div className="pt-3 mt-1 border-t border-white/[0.06]">
                                <button
                                    type="button"
                                    data-waitlist-trigger
                                    onClick={() => setMenuOpen(false)}
                                    className="btn-primary w-full justify-center !text-[14px] !py-3"
                                >
                                    Get Started
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
