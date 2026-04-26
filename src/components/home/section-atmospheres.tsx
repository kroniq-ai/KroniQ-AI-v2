"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { ThermodynamicGrid } from "@/components/ui/interactive-thermodynamic-grid";
import { cn } from "@/lib/utils";

const EtherealBeamsBackground = dynamic(
    () => import("@/components/ui/ethereal-beams-background").then((m) => m.EtherealBeamsBackground),
    { ssr: false, loading: () => null }
);

const RadialShaderBackdrop = dynamic(
    () => import("@/components/ui/radial-shader").then((m) => m.RadialShaderBackdrop),
    { ssr: false, loading: () => null }
);

const WebGLShader = dynamic(
    () => import("@/components/ui/web-gl-shader").then((m) => m.WebGLShader),
    { ssr: false, loading: () => null }
);

/**
 * Product / KroniQ workspace — **Ethereal light beams** (the look you want), on pure black.
 * No emerald wash. Beams mount when the section is near the viewport (desktop); no intro timer
 * so you don’t sit on a wrong color before the “good” state.
 */
export function PlatformSectionAtmosphere() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [beamsVisible, setBeamsVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(true);

    useEffect(() => {
        setIsMobile(typeof window !== "undefined" && window.innerWidth < 768);
    }, []);

    useEffect(() => {
        if (isMobile) return;
        const el = sectionRef.current;
        if (!el || typeof IntersectionObserver === "undefined") return;
        const io = new IntersectionObserver(
            ([e]) => setBeamsVisible(e?.isIntersecting ?? false),
            { rootMargin: "800px 0px", threshold: 0 }
        );
        io.observe(el);
        return () => io.disconnect();
    }, [isMobile]);

    return (
        <div
            ref={sectionRef}
            className="pointer-events-none absolute inset-0 z-0 min-h-full overflow-hidden"
            aria-hidden
        >
            <div className="absolute inset-0 z-0 bg-[#000]" />
            {beamsVisible && !isMobile ? (
                <div className="absolute inset-0 z-[1]">
                    <EtherealBeamsBackground />
                </div>
            ) : null}
            <div
                className="absolute inset-x-0 top-0 z-[2] h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent opacity-50"
                aria-hidden
            />
        </div>
    );
}

/** How it works — WebGL “LED” ribbons only; no slant lines or top glow. */
export function HowItWorksAtmosphere() {
    const [introDone, setIntroDone] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const inView = useInView(rootRef, { once: true, amount: 0.12 });

    useEffect(() => {
        const onDone = () => setIntroDone(true);
        window.addEventListener("voyd-intro-done", onDone);
        const t = window.setTimeout(onDone, 5000);
        return () => {
            window.removeEventListener("voyd-intro-done", onDone);
            window.clearTimeout(t);
        };
    }, []);

    return (
        <div
            ref={rootRef}
            className="pointer-events-none absolute inset-0 z-0 min-h-full overflow-hidden"
            aria-hidden
        >
            <div className="absolute inset-0 z-0 bg-[#000]" />
            {introDone && inView ? (
                <div className="absolute inset-0 z-[1] overflow-hidden opacity-[0.32]">
                    <WebGLShader className="pointer-events-none h-full w-full" fixed={false} />
                </div>
            ) : null}
        </div>
    );
}

/** Final CTA — radial WebGL2 shader + “thermal” static micro-grid; different palette class than the hero. */
export function FinalCtaAtmosphere() {
    const reduce = useReducedMotion();
    return (
        <div className="pointer-events-none absolute inset-0 z-0 min-h-full overflow-hidden" aria-hidden>
            {reduce ? (
                <div className="absolute inset-0 bg-[#000]" />
            ) : (
                <RadialShaderBackdrop className="z-0" pixelRatio={1} maxFps={24} />
            )}
            <ThermodynamicGrid
                interactive={false}
                palette="thermal"
                resolution={36}
                className={cn("absolute inset-0 z-[1] opacity-50", reduce && "opacity-30")}
            />
            <div
                className="absolute inset-x-0 top-0 z-[2] h-32 bg-gradient-to-b from-black/80 to-transparent"
                aria-hidden
            />
        </div>
    );
}
