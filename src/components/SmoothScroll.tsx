"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isAppShellRoute } from "@/lib/routes/shell-routes";

export type KroniqLenis = {
  on: (event: string, fn: () => void) => void;
  off: (event: string, fn: () => void) => void;
  raf: (time: number) => void;
  scrollTo: (
    target: number | Element | string,
    options?: { offset?: number; immediate?: boolean },
  ) => void;
  destroy: () => void;
  resize: () => void;
  scroll: number;
};

declare global {
  interface Window {
    __kroniqLenis?: KroniqLenis | null;
  }
}

/**
 * Lenis + GSAP on one gsap.ticker loop. ScrollTrigger.update runs every scroll tick.
 * Resize only on window resize — never chain refresh inside refresh listeners.
 */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const onApp = isAppShellRoute(pathname);

    if (reducedMotion || onApp) {
      window.__kroniqLenis = null;
      root.classList.remove("lenis", "lenis-smooth");
      root.style.scrollBehavior = onApp ? "auto" : "smooth";
      return () => {
        root.style.scrollBehavior = "";
      };
    }

    root.style.scrollBehavior = "auto";

    let lenis: KroniqLenis | null = null;
    let cancelled = false;
    let onAnchorClick: ((e: MouseEvent) => void) | null = null;
    let tickerFn: ((time: number) => void) | null = null;
    let onScrollSync: (() => void) | null = null;
    let onResize: (() => void) | null = null;

    void (async () => {
      const [{ default: Lenis }, { default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("@studio-freight/lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.config({ ignoreMobileResize: true });

      lenis = new Lenis({
        lerp: 0.1,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1,
        autoResize: true,
      }) as KroniqLenis;

      window.__kroniqLenis = lenis;

      onScrollSync = () => ScrollTrigger.update();
      lenis.on("scroll", onScrollSync);

      tickerFn = (time: number) => {
        lenis?.raf(time * 1000);
      };
      gsap.ticker.add(tickerFn);
      gsap.ticker.lagSmoothing(0);

      onResize = () => {
        lenis?.resize();
        ScrollTrigger.refresh();
      };
      window.addEventListener("resize", onResize, { passive: true });

      requestAnimationFrame(() => {
        if (!cancelled) ScrollTrigger.refresh();
      });

      onAnchorClick = (e: MouseEvent) => {
        const target = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[href^='#']");
        if (!target?.hash || !lenis) return;
        const el = document.getElementById(target.hash.slice(1));
        if (!el) return;
        e.preventDefault();
        lenis.scrollTo(el, { offset: -80 });
      };
      document.addEventListener("click", onAnchorClick, { passive: false });
    })();

    return () => {
      cancelled = true;
      window.__kroniqLenis = null;

      if (onAnchorClick) document.removeEventListener("click", onAnchorClick);
      if (onScrollSync && lenis) lenis.off("scroll", onScrollSync);
      if (onResize) window.removeEventListener("resize", onResize);

      void import("gsap").then(({ default: gsap }) => {
        if (tickerFn) gsap.ticker.remove(tickerFn);
        gsap.ticker.lagSmoothing(500);
      });

      lenis?.destroy();
      lenis = null;
      root.style.scrollBehavior = "";
      root.classList.remove("lenis", "lenis-smooth", "lenis-scrolling", "lenis-stopped");
    };
  }, [pathname]);

  return <>{children}</>;
}
