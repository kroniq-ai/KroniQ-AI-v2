"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import { PilotLoginLink } from "@/components/PilotLoginLink";
import { glassDark, glassLight } from "@/components/ui/glass-surface";
import { smoothScrollToId } from "@/lib/scroll/smooth-scroll-to";
import { isAppShellRoute } from "@/lib/routes/shell-routes";

const NAV_LINKS = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Integrations", href: "/#integrations" },
  { label: "FAQ", href: "/#faq" },
];

const NAV_PROBE_Y = 52;

function scrollToWaitlist() {
  smoothScrollToId("waitlist", -80);
}

function isOverLightZone() {
  if (typeof document === "undefined") return false;
  const zones = document.querySelectorAll("[data-nav-theme='light']");
  for (const el of zones) {
    const r = el.getBoundingClientRect();
    if (r.top <= NAV_PROBE_Y + 16 && r.bottom >= NAV_PROBE_Y - 8) return true;
  }
  return false;
}

export function KroniQNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [lightNav, setLightNav] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    let raf = 0;
    let lastScrolled = false;
    let lastLight = false;

    const sync = () => {
      const y = window.scrollY;
      const nextScrolled = y > 24;
      const nextLight = isOverLightZone();

      if (nextScrolled !== lastScrolled) {
        lastScrolled = nextScrolled;
        setScrolled(nextScrolled);
      }
      if (nextLight !== lastLight) {
        lastLight = nextLight;
        setLightNav(nextLight);
      }
      raf = 0;
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(sync);
    };

    sync();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (isAppShellRoute(pathname)) {
    return null;
  }

  const navPill = lightNav ? glassLight.navPill : glassDark.navPill;
  const navLink = lightNav ? glassLight.navLink : glassDark.navLink;

  return (
    <>
      <motion.div
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-5"
      >
        <header
          className={cn(
            navPill,
            "w-full max-w-3xl transition-all duration-500",
            scrolled &&
              (lightNav
                ? "shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_28px_64px_-20px_rgba(0,0,0,0.16)]"
                : "shadow-[0_1px_0_rgba(255,255,255,0.1)_inset,0_28px_64px_-20px_rgba(0,0,0,0.85)]"),
          )}
        >
          <nav className="flex items-center justify-between gap-2 px-2.5 py-2 md:px-3">
            <Link
              href="/"
              className={cn(
                "group flex shrink-0 items-center gap-2 rounded-full py-1 pl-1 pr-2.5 transition-colors",
                lightNav ? "hover:bg-black/[0.04]" : "hover:bg-white/[0.05]",
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1",
                  lightNav ? "ring-black/10" : "ring-white/10",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/logos/kroniqlogowithbg.png"
                  alt="KroniQ logo"
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
              </div>
              <span
                className={cn(
                  "text-[15px] font-semibold tracking-tight",
                  lightNav ? "text-black" : "text-white",
                )}
                style={{ fontFamily: "var(--font-display)" }}
              >
                KroniQ
              </span>
            </Link>

            <div className="hidden items-center gap-0.5 lg:flex">
              {NAV_LINKS.map((link) => (
                <a key={link.label} href={link.href} className={navLink}>
                  {link.label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <PilotLoginLink className={cn(navLink, "hidden sm:inline-flex")}>
                Sign in
              </PilotLoginLink>
              <div className="hidden sm:block">
                <LiquidMetalButton label="Join Waitlist" type="button" onClick={scrollToWaitlist} />
              </div>
              <button
                onClick={() => setMobileOpen(true)}
                className={cn(navLink, "flex h-9 w-9 items-center justify-center p-0 lg:hidden")}
                aria-label="Open menu"
              >
                <Menu className="h-4 w-4" />
              </button>
            </div>
          </nav>
        </header>
      </motion.div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-0 z-[60] flex flex-col items-center justify-center p-6"
              style={{
                background: "radial-gradient(circle at top, rgba(30,40,50,0.8) 0%, rgba(4,4,6,0.98) 100%)",
                backdropFilter: "blur(40px) saturate(200%)",
              }}
            >
              <button
                onClick={() => setMobileOpen(false)}
                className={cn(glassDark.button, "absolute top-6 right-6 h-12 w-12 p-0")}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>

              <nav className="mb-16 flex w-full flex-col items-center gap-4">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(glassDark.button, "w-full max-w-xs justify-center px-8 py-4 text-base")}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>

              <div className="w-full max-w-[280px] space-y-3">
                <div className="flex w-full items-center justify-center">
                  <LiquidMetalButton
                    label="Join Waitlist"
                    type="button"
                    onClick={() => {
                      setMobileOpen(false);
                      scrollToWaitlist();
                    }}
                  />
                </div>
                <PilotLoginLink
                  onClick={() => setMobileOpen(false)}
                  className={cn(glassDark.button, "w-full justify-center px-6 py-4")}
                >
                  Already invited? Sign in
                </PilotLoginLink>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
