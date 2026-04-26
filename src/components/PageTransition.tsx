"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useLayoutEffect, useState } from "react";
import { KroniqWordmark } from "@/components/brand/kroniq-mark";
import { ShaderAnimation } from "@/components/ui/shader-lines";

/** Set `NEXT_PUBLIC_KRONIQ_INTRO=1` in .env to enable. Default: off (avoids blank + broken PNGs). */
const introEnabled = process.env.NEXT_PUBLIC_KRONIQ_INTRO === "1";

/** Main shader + logo visible before crossfade to black. */
const INTRO_MIN_MS = 3200;

/** Crossfade shader layer out while black veil comes in. */
const CROSSFADE_TO_BLACK_MS = 420;

/** Hold pure black before landing blur-reveal. */
const BLACK_HOLD_MS = 360;

/** Hard safety fuse: dismiss overlay no matter what. */
const SAFETY_FUSE_MS = 6000;

const easeOutSoft: [number, number, number, number] = [0.22, 1, 0.36, 1];
const easeInOutSmooth: [number, number, number, number] = [0.45, 0, 0.55, 1];

type OverlayMode = "shader" | "black" | null;

function dispatchIntroDone() {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new Event("voyd-intro-done"));
    window.requestAnimationFrame(() => window.dispatchEvent(new Event("voyd-intro-done")));
}

export default function PageTransition({ children }: { children: React.ReactNode }) {
    const reduceMotion = useReducedMotion();
    const [overlayMode, setOverlayMode] = useState<OverlayMode>(() => (introEnabled ? "shader" : null));

    const introMs = reduceMotion ? 1000 : INTRO_MIN_MS;
    const crossfadeMs = reduceMotion ? 200 : CROSSFADE_TO_BLACK_MS;
    const holdMs = reduceMotion ? 100 : BLACK_HOLD_MS;

    useLayoutEffect(() => {
        if (reduceMotion) {
            setOverlayMode(null);
            return;
        }
        if (introEnabled) {
            setOverlayMode("shader");
        } else {
            setOverlayMode(null);
        }
    }, [reduceMotion]);

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
        if (!introEnabled || reduceMotion) return;
        const fuse = window.setTimeout(() => setOverlayMode(null), SAFETY_FUSE_MS);
        const onVisible = () => {
            if (document.visibilityState === "visible") setOverlayMode(null);
        };
        document.addEventListener("visibilitychange", onVisible);
        return () => {
            window.clearTimeout(fuse);
            document.removeEventListener("visibilitychange", onVisible);
        };
    }, [reduceMotion]);

    useEffect(() => {
        if (!introEnabled || reduceMotion) return;
        if (overlayMode !== "shader") return;
        const toBlack = window.setTimeout(() => setOverlayMode("black"), introMs);
        return () => window.clearTimeout(toBlack);
    }, [overlayMode, introMs, reduceMotion]);

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
            {introEnabled && showHeavyOverlay ? (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-black">
                    <motion.div
                        className="absolute inset-0 z-0"
                        initial={false}
                        animate={{ opacity: isBlackPhase ? 0 : 1 }}
                        transition={{ duration: crossfadeMs / 1000, ease: easeInOutSmooth }}
                    >
                        <div aria-hidden className="pointer-events-none absolute inset-0 z-0 bg-black" />
                        <div className="absolute inset-0 z-[1] flex items-stretch justify-stretch">
                            <ShaderAnimation
                                variant="loading"
                                monochrome
                                maxDpr={1}
                                renderScale={0.25}
                                className="h-full min-h-[100dvh] w-full min-w-full flex-1 opacity-[0.88]"
                            />
                        </div>
                    </motion.div>

                    <motion.div
                        className="absolute inset-0 z-[2] bg-black"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isBlackPhase ? 1 : 0 }}
                        transition={{ duration: crossfadeMs / 1000, ease: easeInOutSmooth }}
                    />

                    <motion.div
                        variants={logoVariants}
                        initial={false}
                        animate={isBlackPhase ? "shaderHidden" : "show"}
                        className="relative z-10 flex items-center justify-center px-6"
                    >
                        <KroniqWordmark
                            iconSize={36}
                            variant="mono"
                            className="scale-110 text-white drop-shadow-[0_0_48px_rgba(255,255,255,0.12)] sm:scale-125"
                        />
                    </motion.div>
                </div>
            ) : null}

            {/* Do not set opacity-0 on children — a stuck intro left the app invisible. The fixed overlay blocks interaction until it unmounts. */}
            {children}
        </>
    );
}
