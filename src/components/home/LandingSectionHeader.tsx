"use client";

import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
    kicker: string;
    title: ReactNode;
    subtitle?: ReactNode;
    className?: string;
    subtitleClassName?: string;
    /** "light" = dark text on light bg (default); "dark" = light text on dark section */
    variant?: "light" | "dark" | "bright" | "legacy";
};

export function LandingSectionHeader({
    kicker,
    title,
    subtitle,
    className,
    subtitleClassName,
    variant = "light",
}: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, amount: 0.3 });

    const isDark = variant === "dark" || variant === "bright";

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 18 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={cn("mx-auto mb-12 max-w-3xl text-center md:mb-16", className)}
        >
            {/* Kicker pill */}
            <span
                className={cn(
                    "mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em]",
                    isDark
                        ? "border-white/[0.1] bg-white/[0.06] text-white/55"
                        : "border-black/[0.07] bg-white text-gray-500"
                )}
            >
                {kicker}
            </span>

            {/* Title */}
            <h2
                className={cn(
                    "text-balance font-bold leading-[1.08] tracking-[-0.03em]",
                    isDark ? "text-white" : "text-gray-900"
                )}
                style={{ fontFamily: "var(--font-heading)" }}
            >
                {title}
            </h2>

            {/* Subtitle */}
            {subtitle ? (
                <p
                    className={cn(
                        "mt-4 text-[15px] leading-relaxed md:text-base",
                        isDark ? "text-white/50" : "text-gray-500",
                        subtitleClassName
                    )}
                >
                    {subtitle}
                </p>
            ) : null}
        </motion.div>
    );
}
