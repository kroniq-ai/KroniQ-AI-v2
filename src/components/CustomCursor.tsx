"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { isPlatformRoute } from "@/lib/routes/shell-routes";

export default function CustomCursor() {
  const pathname = usePathname();
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const ringPos = useRef({ x: 0, y: 0 });
  const enabled = useRef(false);

  useEffect(() => {
    const onPlatform = isPlatformRoute(pathname);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouch = "ontouchstart" in window;

    if (onPlatform || reducedMotion || isTouch) {
      document.documentElement.classList.remove("kroniq-custom-cursor");
      enabled.current = false;
      return;
    }

    enabled.current = true;
    document.documentElement.classList.add("kroniq-custom-cursor");

    const ring = ringRef.current;
    const dot = dotRef.current;
    if (!ring || !dot) return;

    ring.style.left = "0";
    ring.style.top = "0";
    dot.style.left = "0";
    dot.style.top = "0";

    let raf = 0;
    const animate = () => {
      ringPos.current.x += (pos.current.x - ringPos.current.x) * 0.18;
      ringPos.current.y += (pos.current.y - ringPos.current.y) * 0.18;
      ring.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;

      const dx = pos.current.x - ringPos.current.x;
      const dy = pos.current.y - ringPos.current.y;
      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        raf = requestAnimationFrame(animate);
      } else {
        raf = 0;
      }
    };

    const onMouse = (e: MouseEvent) => {
      if (!enabled.current) return;
      pos.current = { x: e.clientX, y: e.clientY };
      dot.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      if (!raf) raf = requestAnimationFrame(animate);
    };

    const onEnter = () => {
      ring.style.opacity = "1";
      dot.style.opacity = "1";
    };

    const onLeave = () => {
      ring.style.opacity = "0";
      dot.style.opacity = "0";
    };

    const isInteractive = (el: HTMLElement | null) =>
      !!el?.closest("a, button, [data-cursor-hover], input, textarea, select, label");

    const onOver = (e: MouseEvent) => {
      if (isInteractive(e.target as HTMLElement)) ring.classList.add("hovering");
    };

    const onOut = (e: MouseEvent) => {
      if (isInteractive(e.target as HTMLElement)) ring.classList.remove("hovering");
    };

    window.addEventListener("mousemove", onMouse, { passive: true });
    document.addEventListener("mouseenter", onEnter);
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);

    return () => {
      enabled.current = false;
      document.documentElement.classList.remove("kroniq-custom-cursor");
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouse);
      document.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
    };
  }, [pathname]);

  return (
    <>
      <div ref={ringRef} className="cursor-ring" style={{ opacity: 0 }} aria-hidden />
      <div ref={dotRef} className="cursor-dot" style={{ opacity: 0 }} aria-hidden />
    </>
  );
}
