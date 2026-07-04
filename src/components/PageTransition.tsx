"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { isAppShellRoute } from "@/lib/routes/shell-routes";
import { KroniqWordmark } from "@/components/brand/kroniq-mark";
import { ShaderAnimation } from "@/components/ui/shader-lines";

/** Enabled by default to show on every page load. */
const introEnabled = true;

/** Main shader + logo visible before crossfade to black. */
const INTRO_MIN_MS = 3200;

/** Crossfade shader layer out while black veil comes in. */
const CROSSFADE_TO_BLACK_MS = 420;

/** Hold pure black before landing blur-reveal. */
const BLACK_HOLD_MS = 360;

/** Hard safety fuse: dismiss overlay no matter what. */
const SAFETY_FUSE_MS = 1000;

const easeOutSoft: [number, number, number, number] = [0.22, 1, 0.36, 1];
const easeInOutSmooth: [number, number, number, number] = [0.45, 0, 0.55, 1];
const linearEase: [number, number, number, number] = [0, 0, 1, 1];

type OverlayMode = "shader" | "black" | null;

function dispatchIntroDone() {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new Event("voyd-intro-done"));
    window.requestAnimationFrame(() => window.dispatchEvent(new Event("voyd-intro-done")));
}

export default function PageTransition({ children }: { children: React.ReactNode }) {
    const reduceMotion = useReducedMotion();
    const pathname = usePathname();
    const skipIntro = isAppShellRoute(pathname);
    const [overlayMode, setOverlayMode] = useState<OverlayMode>(() =>
        introEnabled && !skipIntro ? "shader" : null,
    );

    const introMs = reduceMotion ? 1000 : INTRO_MIN_MS;
    const crossfadeMs = reduceMotion ? 200 : CROSSFADE_TO_BLACK_MS;
    const holdMs = reduceMotion ? 100 : BLACK_HOLD_MS;

    // Re-trigger intro when pathname changes (marketing pages only)
    useEffect(() => {
        if (!introEnabled || reduceMotion || skipIntro) return;
        setOverlayMode("shader");
    }, [pathname, reduceMotion, skipIntro]);

    useLayoutEffect(() => {
        if (reduceMotion || skipIntro) {
            setOverlayMode(null);
            return;
        }
        if (introEnabled) {
            setOverlayMode("shader");
        } else {
            setOverlayMode(null);
        }
    }, [reduceMotion, skipIntro]);

    useEffect(() => {
        if (reduceMotion) {
            dispatchIntroDone();
        }
    }, [reduceMotion]);

    useEffect(() => {
        if (overlayMode !== null) return;
        dispatchIntroDone();
    }, [overlayMode]);

    useEffect(() => {
        if (!introEnabled || reduceMotion || skipIntro) return;
        const fuse = window.setTimeout(() => setOverlayMode(null), SAFETY_FUSE_MS);
        const onVisible = () => {
            if (document.visibilityState === "visible") setOverlayMode(null);
        };
        document.addEventListener("visibilitychange", onVisible);
        return () => {
            window.clearTimeout(fuse);
            document.removeEventListener("visibilitychange", onVisible);
        };
    }, [reduceMotion, skipIntro]);

    useEffect(() => {
        if (!introEnabled || reduceMotion || skipIntro) return;
        if (overlayMode !== "shader") return;
        const toBlack = window.setTimeout(() => setOverlayMode("black"), introMs);
        return () => window.clearTimeout(toBlack);
    }, [overlayMode, introMs, reduceMotion, skipIntro]);

    useEffect(() => {
        if (!introEnabled) return;
        if (overlayMode !== "black") return;
        const done = window.setTimeout(() => setOverlayMode(null), crossfadeMs + holdMs);
        return () => window.clearTimeout(done);
    }, [overlayMode, crossfadeMs, holdMs]);

    const showHeavyOverlay = overlayMode === "shader" || overlayMode === "black";
    const isBlackPhase = overlayMode === "black";

    const logoVariants = reduceMotion
        ? {
              show: { opacity: 1 },
              shaderHidden: { opacity: 0, transition: { duration: 0.35, ease: easeInOutSmooth } },
          }
        : {
              show: {
                  opacity: 1,
                  scale: 1,
                  transition: { duration: 0.45, ease: easeOutSoft },
              },
              shaderHidden: {
                  opacity: 0,
                  scale: 1.02,
                  transition: { duration: crossfadeMs / 1000, ease: easeInOutSmooth },
              },
          };

    return (
        <>
            {introEnabled && !skipIntro && showHeavyOverlay ? (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black">
                    <motion.div
                        className="absolute inset-0 z-0 bg-black"
                        initial={false}
                        animate={{ opacity: isBlackPhase ? 0 : 1 }}
                        transition={{ duration: crossfadeMs / 1000, ease: easeInOutSmooth }}
                    />

                    <motion.div
                        variants={logoVariants}
                        initial={false}
                        animate={isBlackPhase ? "shaderHidden" : "show"}
                        className="relative z-10 flex flex-col items-center justify-center px-6 gap-8"
                    >
                        <div className="h-28 w-28 flex items-center justify-center shrink-0 rounded-2xl">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/logos/kroniqlogowithbg.png" alt="KroniQ" className="object-contain h-28 w-28 rounded-2xl" />
                        </div>
                        
                        {/* Loading Bar */}
                        <div className="w-40 h-[2px] bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-white rounded-full"
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: introMs / 1000, ease: "linear" }}
                            />
                        </div>
                    </motion.div>
                </div>
            ) : null}

            {/* Do not set opacity-0 on children — a stuck intro left the app invisible. The fixed overlay blocks interaction until it unmounts. */}
            {children}
        </>
    );
}
