"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type Props = {
    children: ReactNode;
    className?: string;
};

/** Animated gradient sweep clipped to text — subtle “fluid” headline accent */
export function GradientFlowWord({ children, className }: Props) {
    return (
        <span
            className={cn(
                "voyd-gradient-flow-text bg-clip-text font-semibold text-transparent",
                className
            )}
        >
            {children}
        </span>
    );
}
