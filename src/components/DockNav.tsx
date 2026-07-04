"use client";

import { useState, useEffect, useRef, useCallback, type MouseEvent } from "react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { KroniQMarkBadgePng } from "@/components/brand/kroniq-logo-png";
import { openLeaderboardModal } from "@/lib/waitlist/client-session";
import { cn } from "@/lib/utils";
import { Trophy, ArrowRight, LogIn } from "lucide-react";
import { PilotLoginLink } from "@/components/PilotLoginLink";

const navItems = [
    { label: "Home", href: "/", sectionId: null as string | null },
    { label: "How it works", href: "/#how-it-works", sectionId: "how-it-works" },
    { label: "Integrations", href: "/#integrations", sectionId: "integrations" },
    { label: "FAQ", href: "/#faq", sectionId: "faq" },
];

const APP_ROUTES = ["/dashboard", "/project", "/login", "/dev-access"];

export default function DockNav() {
    const pathname = usePathname();
    const reduceMotion = useReducedMotion();
    const isAppRoute = APP_ROUTES.some((r) => pathname === r || pathname.startsWith(r + "/"));
    const [mounted, setMounted] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [mouseX, setMouseX] = useState(0);
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const navRef = useRef<HTMLDivElement>(null);
    const lastScrollY = useRef(0);
    const { scrollY } = useScroll();

    useMotionValueEvent(scrollY, "change", (latest) => {
        if (latest > 500 && latest > lastScrollY.current) {
            setIsVisible(false);
        } else {
            setIsVisible(true);
        }
        lastScrollY.current = latest;
    });

    const scrollToSection = useCallback((sectionId: string | null) => {
        if (!sectionId) {
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
        }
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, []);

    useEffect(() => {
        setMounted(true);
        const handleMouseMove = (e: globalThis.MouseEvent) => {
            if (e.clientY > window.innerHeight - 88) setIsVisible(true);
            if (navRef.current) {
                const rect = navRef.current.getBoundingClientRect();
                setMouseX(e.clientX - rect.left);
            }
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    useEffect(() => {
        if (pathname !== "/") { setActiveSection(null); return; }
        const sectionIds = navItems.map((n) => n.sectionId).filter(Boolean) as string[];
        const elements = sectionIds.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
        if (elements.length === 0) return;
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
                if (visible[0]?.target.id) setActiveSection(visible[0].target.id);
            },
            { root: null, rootMargin: "-40% 0px -46% 0px", threshold: [0, 0.08, 0.15, 0.25] }
        );
        elements.forEach((el) => observer.observe(el));
        const onScroll = () => { if (window.scrollY < 120) setActiveSection(null); };
        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => { observer.disconnect(); window.removeEventListener("scroll", onScroll); };
    }, [pathname]);

    if (isAppRoute || !mounted) return null;

    const spring = reduceMotion
        ? { duration: 0.2 }
        : { type: "spring" as const, stiffness: 340, damping: 30 };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.nav
                    initial={reduceMotion ? false : { y: 96, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={reduceMotion ? undefined : { y: 96, opacity: 0 }}
                    transition={spring}
                    className="fixed z-[100] left-1/2 w-[calc(100%-18px)] max-w-[min(920px,calc(100vw-18px))] -translate-x-1/2"
                    style={{ bottom: "max(14px, env(safe-area-inset-bottom, 0px))" }}
                    aria-label="Site navigation"
                >
                    <div
                        ref={navRef}
                        className="relative flex min-h-[52px] items-stretch overflow-hidden rounded-[26px] border border-black/[0.07] bg-white/85 shadow-[0_8px_40px_rgba(0,0,0,0.1),0_2px_8px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-2xl"
                    >
                        {/* Mouse spotlight — subtle on light bg */}
                        <div
                            className="pointer-events-none absolute inset-0 opacity-30"
                            style={{
                                background: `radial-gradient(180px circle at ${mouseX}px 50%, rgba(0,0,0,0.04), transparent 65%)`,
                            }}
                            aria-hidden
                        />

                        {/* Logo */}
                        <Link
                            href="/"
                            className="relative z-10 flex shrink-0 items-center justify-center border-r border-black/[0.06] px-3.5 sm:px-4"
                            aria-label="KroniQ home"
                            style={{ filter: "invert(1)" }}
                        >
                            <motion.div
                                whileHover={reduceMotion ? undefined : { scale: 1.06 }}
                                className="text-gray-600 transition-colors hover:text-gray-900"
                            >
                                <KroniQMarkBadgePng size={20} className="opacity-80" />
                            </motion.div>
                        </Link>

                        {/* Nav links */}
                        <div className="relative z-10 flex min-w-0 flex-1 items-center overflow-x-auto overflow-y-hidden [scrollbar-width:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden">
                            {navItems.map((item, i) => {
                                const isHome = item.sectionId === null;
                                const isActive =
                                    pathname === "/"
                                        ? isHome ? activeSection === null : activeSection === item.sectionId
                                        : pathname === item.href.split("#")[0] && !item.href.includes("#");

                                const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
                                    e.preventDefault();
                                    scrollToSection(item.sectionId);
                                };

                                return (
                                    <button
                                        key={item.label}
                                        type="button"
                                        onClick={handleClick}
                                        onMouseEnter={() => setHoveredIndex(i)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                        className="relative shrink-0 snap-center"
                                    >
                                        <span
                                            className={cn(
                                                "relative block whitespace-nowrap px-3 py-3 text-[12px] font-semibold tracking-wide transition-colors duration-200 sm:px-4 sm:text-[13px]",
                                                isActive
                                                    ? "text-gray-900"
                                                    : "text-gray-400 hover:text-gray-700"
                                            )}
                                        >
                                            {isActive && (
                                                <motion.span
                                                    layoutId="dock-nav-active-pill"
                                                    className="absolute inset-x-1.5 inset-y-1.5 -z-10 rounded-full bg-black/[0.05] ring-1 ring-black/[0.06]"
                                                    transition={spring}
                                                />
                                            )}
                                            {hoveredIndex === i && !isActive && (
                                                <motion.span
                                                    layoutId="dock-nav-hover-pill"
                                                    className="absolute inset-x-2 inset-y-1.5 -z-10 rounded-full bg-black/[0.03]"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.12 }}
                                                />
                                            )}
                                            {item.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* CTA — desktop */}
                        <div className="relative z-10 hidden shrink-0 items-center gap-1 border-l border-black/[0.06] pl-1 pr-1 sm:flex">
                            <PilotLoginLink className="inline-flex items-center gap-1 mx-1 my-2 px-3 py-2 text-[11px] font-semibold rounded-full border border-black/[0.08] text-gray-600 hover:text-gray-900 hover:bg-black/[0.03] transition-colors whitespace-nowrap">
                                <LogIn className="size-3" aria-hidden />
                                Sign in
                            </PilotLoginLink>
                            <button
                                type="button"
                                data-waitlist-trigger
                                className="inline-flex items-center gap-1.5 mx-1 my-2 px-4 py-2 text-[12px] font-semibold rounded-full bg-[#0F0F0F] text-white hover:bg-[#1A1A1A] transition-colors whitespace-nowrap"
                            >
                                Join Waitlist
                                <ArrowRight className="size-3" aria-hidden />
                            </button>
                        </div>

                        {/* CTA — mobile */}
                        <div className="relative z-10 flex shrink-0 items-center gap-0.5 border-l border-black/[0.06] pl-1 pr-1 sm:hidden">
                            <button
                                type="button"
                                onClick={() => openLeaderboardModal()}
                                className="mx-0.5 my-2 inline-flex items-center justify-center rounded-full border border-black/[0.07] bg-black/[0.03] p-2 text-gray-600 hover:bg-black/[0.06]"
                                aria-label="Leaderboard"
                            >
                                <Trophy className="size-3.5" aria-hidden />
                            </button>
                            <button
                                type="button"
                                data-waitlist-trigger
                                className="mx-0.5 my-2 inline-flex items-center gap-1 px-3 py-2 text-[10px] font-semibold rounded-full bg-[#0F0F0F] text-white hover:bg-[#1A1A1A] transition-colors"
                            >
                                Waitlist
                                <ArrowRight className="size-3" aria-hidden />
                            </button>
                        </div>
                    </div>
                </motion.nav>
            )}
        </AnimatePresence>
    );
}
