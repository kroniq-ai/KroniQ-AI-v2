"use client";

import { motion, useInView } from "framer-motion";
import { useRef, type ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Props = {
    kicker: string;
    title: ReactNode;
    subtitle?: ReactNode;
    className?: string;
    subtitleClassName?: string;
    /** `bright` = high-contrast glass-era typography; `legacy` = older muted caps line */
    variant?: "bright" | "legacy";
};

export function LandingSectionHeader({
    kicker,
    title,
    subtitle,
    className,
    subtitleClassName,
    variant = "bright",
}: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, amount: 0.35 });

    if (variant === "legacy") {
        return (
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 22 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className={cn("mb-12 text-center md:mb-16", className)}
            >
                <span className="mb-4 block text-[11px] font-medium uppercase tracking-[0.28em] text-white/35">
                    {kicker}
                </span>
                <h2
                    className="mb-4 text-balance text-[clamp(1.65rem,3.5vw,2.35rem)] font-semibold leading-[1.12] tracking-[-0.03em] text-white/92"
                    style={{ fontFamily: "var(--font-heading)" }}
                >
                    {title}
                </h2>
                {subtitle ? (
                    <p
                        className={cn(
                            "mx-auto max-w-xl text-[15px] font-light leading-relaxed text-white/38 md:text-[16px]",
                            subtitleClassName
                        )}
                    >
                        {subtitle}
                    </p>
                ) : null}
            </motion.div>
        );
    }

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 18 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className={cn("mx-auto mb-12 max-w-3xl text-center md:mb-16", className)}
        >
            <Badge
                variant="outline"
                className="mb-4 inline-flex items-center gap-2 rounded-full border-border/50 bg-background/55 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-foreground/75 backdrop-blur-md"
            >
                {kicker}
            </Badge>
            <h2
                className="text-balance text-3xl font-semibold tracking-tight text-foreground md:text-5xl md:leading-[1.08]"
                style={{ fontFamily: "var(--font-heading)" }}
            >
                {title}
            </h2>
            {subtitle ? (
                <p
                    className={cn(
                        "mt-5 text-base font-light leading-relaxed text-foreground/70 md:text-lg",
                        subtitleClassName
                    )}
                >
                    {subtitle}
                </p>
            ) : null}
        </motion.div>
    );
}
