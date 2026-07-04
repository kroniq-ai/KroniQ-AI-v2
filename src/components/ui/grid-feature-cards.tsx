"use client";

import { cn } from "@/lib/utils";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import * as React from "react";

export type GridFeature = {
    title: string;
    description: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    /** Optional visual (e.g. product mock) above the text — marketing sections. */
    prepend?: React.ReactNode;
};

/** Deterministic grid highlight positions (avoids SSR hydration mismatch). */
const DEFAULT_PATTERN: number[][] = [
    [8, 2],
    [9, 4],
    [7, 3],
    [10, 2],
    [8, 5],
    [9, 3],
];

function GridPattern({
    width,
    height,
    x,
    y,
    squares,
    className,
    ...props
}: React.ComponentProps<"svg"> & {
    width: number;
    height: number;
    x: string;
    y: string;
    squares?: number[][];
}) {
    const patternId = React.useId();

    return (
        <svg aria-hidden className={cn(className)} {...props}>
            <defs>
                <pattern id={patternId} width={width} height={height} patternUnits="userSpaceOnUse" x={x} y={y}>
                    <path d={`M.5 ${height}V.5H${width}`} fill="none" className="stroke-white/12" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${patternId})`} />
            {squares ? (
                <svg x={x} y={y} className="overflow-visible">
                    {squares.map(([sx, sy], index) => (
                        <rect
                            strokeWidth="0"
                            key={index}
                            width={width + 1}
                            height={height + 1}
                            x={sx * width}
                            y={sy * height}
                            className="fill-white/[0.035]"
                        />
                    ))}
                </svg>
            ) : null}
        </svg>
    );
}

export type PlatformFeatureCardProps = React.ComponentProps<"div"> & {
    feature: GridFeature;
    pattern?: number[][];
    /** No mouse-driven grid parallax — cheaper for dense marketing grids. */
    disableParallax?: boolean;
};

export function PlatformFeatureCard({
    feature,
    className,
    pattern = DEFAULT_PATTERN,
    disableParallax = false,
    ...props
}: PlatformFeatureCardProps) {
    const Icon = feature.icon;
    const p = pattern;
    const reduceMotion = useReducedMotion();
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const sx = useSpring(mx, { stiffness: 320, damping: 32, mass: 0.4 });
    const sy = useSpring(my, { stiffness: 320, damping: 32, mass: 0.4 });

    const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (reduceMotion || disableParallax) return;
        const r = e.currentTarget.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        mx.set(px * 14);
        my.set(py * 14);
    };

    const onLeave = () => {
        mx.set(0);
        my.set(0);
    };

    const sheen = (
        <div className="absolute inset-0 bg-gradient-to-r from-white/[0.07] to-transparent opacity-90 [mask-image:radial-gradient(farthest-side_at_top,white,transparent)]">
            <GridPattern
                width={20}
                height={20}
                x="-12"
                y="4"
                squares={p}
                className="absolute inset-0 h-full w-full fill-white/[0.02] stroke-white/18 mix-blend-overlay"
            />
        </div>
    );

    return (
        <div
            className={cn(
                "group relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.015] p-4 transition-[border-color,background-color,box-shadow] duration-500 md:p-5",
                "hover:border-white/[0.18] hover:bg-white/[0.04] hover:shadow-[0_0_0_1px_rgba(255,255,255,0.06)]",
                className
            )}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            {...props}
        >
            {disableParallax ? (
                <div className="pointer-events-none absolute left-0 top-0 h-[80%] w-full [mask-image:linear-gradient(white,transparent)]">
                    {sheen}
                </div>
            ) : (
                <motion.div
                    className="pointer-events-none absolute left-1/2 top-0 -ml-28 -mt-3 h-[125%] w-[150%] [mask-image:linear-gradient(white,transparent)] will-change-transform"
                    style={{ x: sx, y: sy }}
                >
                    {sheen}
                </motion.div>
            )}
            {feature.prepend ? <div className="relative z-10 mb-3 w-full min-w-0 shrink-0">{feature.prepend}</div> : null}
            <Icon
                className="relative z-10 size-5 text-white/75 transition-transform duration-500 group-hover:scale-[1.04] group-hover:text-white/90"
                strokeWidth={1.25}
                aria-hidden
            />
            <h3 className="relative z-10 mt-3 shrink-0 text-sm font-semibold tracking-tight text-white md:mt-3.5 md:text-base">
                {feature.title}
            </h3>
            <p className="relative z-10 mt-1.5 min-h-0 flex-1 text-xs font-light leading-snug text-white/42 md:mt-2 md:text-[13px] md:leading-relaxed">
                {feature.description}
            </p>
        </div>
    );
}
