/** Scroll helpers — route through Lenis when SmoothScroll is active */

import type { KroniqLenis } from "@/components/SmoothScroll";

function getLenis(): KroniqLenis | null {
  if (typeof window === "undefined") return null;
  return window.__kroniqLenis ?? null;
}

export function smoothScrollTo(
  target: number | Element | string,
  options?: { offset?: number; behavior?: ScrollBehavior },
) {
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(target, { offset: options?.offset ?? 0 });
    return;
  }

  if (typeof target === "number") {
    window.scrollTo({ top: target, behavior: options?.behavior ?? "smooth" });
    return;
  }

  const el = typeof target === "string" ? document.querySelector(target) : target;
  el?.scrollIntoView({ behavior: options?.behavior ?? "smooth", block: "start" });
}

export function smoothScrollToId(id: string, offset = 0) {
  const el = document.getElementById(id);
  if (!el) return;
  smoothScrollTo(el, { offset });
}
