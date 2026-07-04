"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

const EMERALD = "#10B981";
const TEAL = "#22D3EE";

type MarkProps = {
    size?: number;
    className?: string;
    /** `mono` = single-color via currentColor (black & white UI). `brand` = emerald → teal gradient. */
    variant?: "brand" | "mono";
};

const K_PATH = "M8 5h4.2v9.2L20.2 5H26l-8.4 9.2L27.2 27h-4.6l-6.1-8.2L12.2 20v7H8V5Z";

/**
 * KroniQ mark — geometric "K". Brand variant uses emerald → teal; mono uses currentColor.
 */
export function KroniQMark({ size = 24, className = "", variant = "brand" }: MarkProps) {
    const raw = useId();
    const gradId = `kroniq-grad-${raw.replace(/:/g, "")}`;

    if (variant === "mono") {
        return (
            <svg
                width={size}
                height={size}
                viewBox="0 0 32 32"
                fill="none"
                className={className}
                role="img"
                aria-label="KroniQ"
            >
                <path d={K_PATH} fill="currentColor" />
            </svg>
        );
    }

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 32 32"
            fill="none"
            className={className}
            role="img"
            aria-label="KroniQ"
        >
            <defs>
                <linearGradient id={gradId} x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                    <stop stopColor={EMERALD} />
                    <stop offset="1" stopColor={TEAL} />
                </linearGradient>
            </defs>
            <path d={K_PATH} fill={`url(#${gradId})`} />
        </svg>
    );
}

type WordmarkProps = {
    className?: string;
    /** Icon size in px */
    iconSize?: number;
    /** When false, only the logomark (no "KroniQ" text) */
    withText?: boolean;
    textClassName?: string;
    variant?: "brand" | "mono";
};

/**
 * Wordmark: mark + "KroniQ" for nav and headers.
 */
export function KroniqWordmark({
    className,
    iconSize = 20,
    withText = true,
    textClassName,
    variant = "brand",
}: WordmarkProps) {
    return (
        <span className={cn("inline-flex items-center gap-2", className)}>
            <KroniQMark size={iconSize} variant={variant} className="shrink-0" />
            {withText ? (
                <span
                    className={cn(
                        "text-[15px] font-bold tracking-[-0.02em]",
                        variant === "mono" ? "text-white" : "text-[#F5F7FA]",
                        textClassName
                    )}
                >
                    KroniQ
                </span>
            ) : null}
        </span>
    );
}
