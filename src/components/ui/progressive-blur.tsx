"use client";
import { cn } from "@/lib/utils";

interface ProgressiveBlurProps {
    className?: string;
    direction?: "left" | "right" | "top" | "bottom";
    blurIntensity?: number;
}

export function ProgressiveBlur({
    className,
    direction = "left",
    blurIntensity = 1,
}: ProgressiveBlurProps) {
    const gradMap = {
        left: "to right",
        right: "to left",
        top: "to bottom",
        bottom: "to top",
    };
    const grad = `linear-gradient(${gradMap[direction]}, black 0%, transparent 100%)`;

    return (
        <div
            className={cn("pointer-events-none absolute", className)}
            style={{
                backdropFilter: `blur(${blurIntensity * 6}px)`,
                WebkitBackdropFilter: `blur(${blurIntensity * 6}px)`,
                maskImage: grad,
                WebkitMaskImage: grad,
            }}
            aria-hidden
        />
    );
}
