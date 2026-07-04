"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GradientColors {
    start: string;
    middle: string;
    end: string;
}

interface BeamPath {
    path: string;
    gradientConfig: {
        initial: { x1: string; x2: string; y1: string; y2: string };
        animate: { x1: string | string[]; x2: string | string[]; y1: string | string[]; y2: string | string[] };
        transition?: { duration?: number; repeat?: number; ease?: string; delay?: number; repeatDelay?: number };
    };
    connectionPoints?: Array<{ cx: number; cy: number; r: number }>;
}

interface PulseBeamsProps {
    children?: React.ReactNode;
    className?: string;
    beams: BeamPath[];
    width?: number;
    height?: number;
    baseColor?: string;
    accentColor?: string;
    gradientColors?: GradientColors;
}

const DEFAULT_COLORS: GradientColors = {
    start: "#10b981",
    middle: "#6366f1",
    end: "#a78bfa",
};

function GradientColors({ colors = DEFAULT_COLORS }: { colors?: GradientColors }) {
    return (
        <>
            <stop offset="0%"   stopColor={colors.start}  stopOpacity="0" />
            <stop offset="20%"  stopColor={colors.start}  stopOpacity="1" />
            <stop offset="50%"  stopColor={colors.middle} stopOpacity="1" />
            <stop offset="100%" stopColor={colors.end}    stopOpacity="0" />
        </>
    );
}

export function PulseBeams({
    children,
    className,
    beams,
    width = 600,
    height = 340,
    baseColor = "rgba(255,255,255,0.06)",
    accentColor = "rgba(255,255,255,0.12)",
    gradientColors,
}: PulseBeamsProps) {
    return (
        <div className={cn("relative", className)}>
            {/* SVG beam layer */}
            <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
                <svg
                    width={width}
                    height={height}
                    viewBox={`0 0 ${width} ${height}`}
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full max-w-full"
                    preserveAspectRatio="xMidYMid slice"
                >
                    {beams.map((beam, i) => (
                        <React.Fragment key={i}>
                            {/* Static base path */}
                            <path d={beam.path} stroke={baseColor} strokeWidth="1" />
                            {/* Animated gradient path */}
                            <path
                                d={beam.path}
                                stroke={`url(#pb-grad-${i})`}
                                strokeWidth="2"
                                strokeLinecap="round"
                            />
                            {beam.connectionPoints?.map((pt, j) => (
                                <circle key={j} cx={pt.cx} cy={pt.cy} r={pt.r} fill={baseColor} stroke={accentColor} />
                            ))}
                        </React.Fragment>
                    ))}
                    <defs>
                        {beams.map((beam, i) => (
                            <motion.linearGradient
                                key={i}
                                id={`pb-grad-${i}`}
                                gradientUnits="userSpaceOnUse"
                                initial={beam.gradientConfig.initial}
                                animate={beam.gradientConfig.animate}
                                transition={beam.gradientConfig.transition}
                            >
                                <GradientColors colors={gradientColors} />
                            </motion.linearGradient>
                        ))}
                    </defs>
                </svg>
            </div>
            {/* Content */}
            <div className="relative z-10">{children}</div>
        </div>
    );
}
