"use client";
import { cn } from "@/lib/utils";
import type React from "react";

interface ShinyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    highlight?: string;
    highlightSubtle?: string;
}

export function ShinyButton({
    children,
    className = "",
    highlight = "#10b981",
    highlightSubtle = "#6ee7b7",
    style,
    ...rest
}: ShinyButtonProps) {
    return (
        <button
            {...rest}
            className={cn("shiny-cta", className)}
            style={{
                ["--shiny-highlight" as string]: highlight,
                ["--shiny-highlight-subtle" as string]: highlightSubtle,
                ...style,
            }}
        >
            <span>{children}</span>
        </button>
    );
}

