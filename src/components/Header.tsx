"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { HashScrollLink } from "@/components/HashScrollLink";
import { KroniQWordmarkOnDark } from "@/components/brand/kroniq-logo-png";

const navLinks = [
    { label: "Product", href: "/#platform" },
    { label: "How it works", href: "/#how-it-works" },
    { label: "FAQ", href: "/#faq" },
];

export default function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4"
        >
            {/* Pill-shaped nav container */}
            <nav
                className={`
                    flex items-center justify-between gap-6
                    px-6 md:px-8 h-14
                    rounded-full border
                    transition-all duration-500
                    w-full max-w-[720px]
                    ${scrolled
                        ? "bg-black/60 backdrop-blur-2xl border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
                        : "bg-white/[0.02] backdrop-blur-xl border-white/[0.06]"
                    }
                `}
            >
                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-300 shrink-0"
                >
                    <KroniQWordmarkOnDark className="h-6" priority />
                </Link>

                {/* Desktop links — centered */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <HashScrollLink
                            key={link.label}
                            href={link.href}
                            className="text-[13px] font-medium text-white/35 transition-colors duration-300 hover:text-white"
                        >
                            {link.label}
                        </HashScrollLink>
                    ))}
                </div>

                {/* CTA — matching null0's white pill "Get Started" */}
                <div className="hidden md:block shrink-0">
                    <a
                        href="#"
                        className="inline-flex items-center px-5 py-2 text-[12px] font-semibold tracking-wide bg-white text-black rounded-full hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all duration-300"
                    >
                        Get Started
                    </a>
                </div>

                {/* Mobile hamburger */}
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="md:hidden relative w-6 h-5 flex flex-col justify-center gap-[6px]"
                    aria-label="Toggle menu"
                >
                    <motion.span
                        animate={menuOpen ? { rotate: 45, y: 4 } : { rotate: 0, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="block w-5 h-[1.5px] bg-white/60 origin-center"
                    />
                    <motion.span
                        animate={menuOpen ? { rotate: -45, y: -4 } : { rotate: 0, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="block w-5 h-[1.5px] bg-white/60 origin-center"
                    />
                </button>
            </nav>

            {/* Mobile dropdown */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="absolute top-[72px] left-4 right-4 bg-black/80 backdrop-blur-2xl border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
                    >
                        <div className="p-6 flex flex-col gap-1">
                            {navLinks.map((link, i) => (
                                <motion.div
                                    key={link.label}
                                    initial={{ opacity: 0, x: -12 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.05 * i, duration: 0.3 }}
                                >
                                    <HashScrollLink
                                        href={link.href}
                                        onClick={() => setMenuOpen(false)}
                                        className="block py-3 text-[14px] font-medium text-white/50 transition-colors hover:text-white"
                                    >
                                        {link.label}
                                    </HashScrollLink>
                                </motion.div>
                            ))}
                            <div className="pt-4 border-t border-white/[0.06]">
                                <a
                                    href="#"
                                    className="block text-center text-[13px] font-semibold bg-white text-black rounded-full py-3 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all"
                                >
                                    Get Started
                                </a>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
