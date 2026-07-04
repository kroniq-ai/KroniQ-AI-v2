"use client";

import { liquidMetalFragmentShader, ShaderMount } from "@paper-design/shaders";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
    children: ReactNode;
    className?: string;
    /** Slightly slower animation for ambient badge chrome */
    speed?: number;
};

/**
 * Non-interactive pill: liquid-metal shader behind content (not a button).
 * Fully hardware-optimized: pauses offscreen, defers execution during intro, and uses no CSS blurs.
 */
export function LiquidMetalBadgeShell({ children, className, speed = 0.42 }: Props) {
    const shaderRef = useRef<HTMLDivElement>(null);
    const mountRef = useRef<ShaderMount | null>(null);

    // Determines if the Intro has passed and if Badge is On-Screen
    const [active, setActive] = useState(false);

    useEffect(() => {
        let isIntroDone = false;
        let isVisible = false;

        const checkActive = () => {
            if (isIntroDone && isVisible) {
                setActive(true);
            } else {
                setActive(false);
            }
        };

        // Defer WebGL compilation until Page Intro is completely finished.
        const onDone = () => {
            isIntroDone = true;
            checkActive();
        };

        window.addEventListener("voyd-intro-done", onDone);
        
        // Failsafe in case component mounts strictly after the event fired
        const fuse = window.setTimeout(onDone, 5500);

        // Discard GPU rendering immediately when user scrolls past the Hero
        const io = new IntersectionObserver((entries) => {
            isVisible = entries[0]?.isIntersecting ?? false;
            checkActive();
        });

        if (shaderRef.current) io.observe(shaderRef.current);

        return () => {
            window.removeEventListener("voyd-intro-done", onDone);
            window.clearTimeout(fuse);
            io.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!active) {
            if (mountRef.current) {
                mountRef.current.dispose();
                mountRef.current = null;
            }
            return;
        }

        const styleId = "shader-canvas-style-liquid-badge";
        if (!document.getElementById(styleId)) {
            const style = document.createElement("style");
            style.id = styleId;
            style.textContent = `
        .shader-container-liquid-badge canvas {
          width: 100% !important;
          height: 100% !important;
          display: block !important;
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          border-radius: 9999px !important;
        }
      `;
            document.head.appendChild(style);
        }

        const el = shaderRef.current;
        if (!el) return;

        mountRef.current = new ShaderMount(
            el,
            liquidMetalFragmentShader,
            {
                u_repetition: 4,
                u_softness: 0.5,
                u_shiftRed: 0.28,
                u_shiftBlue: 0.32,
                u_distortion: 0,
                u_contour: 0,
                u_angle: 45,
                u_scale: 8,
                u_shape: 1,
                u_offsetX: 0.1,
                u_offsetY: -0.1,
            },
            undefined,
            speed
        );

        return () => {
            mountRef.current?.dispose();
            mountRef.current = null;
        };
    }, [active, speed]);

    return (
        <div
            className={cn(
                "relative inline-flex min-h-10 max-w-full items-stretch overflow-hidden rounded-full",
                className
            )}
        >
            <div
                className="pointer-events-none absolute inset-0 z-[1] rounded-full"
                style={{
                    boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.1)",
                }}
            />
            <div
                ref={shaderRef}
                className="shader-container-liquid-badge pointer-events-none absolute inset-0 z-0 min-h-[40px] w-full bg-black/80"
                style={{ borderRadius: 9999 }}
            />
            <div
                className="relative z-[2] flex min-h-10 w-full items-center gap-1.5 px-3.5 py-2 md:gap-2 md:px-4 md:py-2.5 transition-colors duration-500"
                style={{
                    // Completely removed backdrop-filter GPU destruction. Replaced with solid gradient.
                    // This visually masks the shader identically without requiring a live 60fps frame-readout.
                    background: "linear-gradient(180deg, rgba(20,20,24,0.95) 0%, rgba(6,6,10,0.98) 100%)",
                }}
            >
                {children}
            </div>
        </div>
    );
}
