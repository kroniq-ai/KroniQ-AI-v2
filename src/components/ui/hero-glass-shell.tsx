"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = {
    children: ReactNode;
    className?: string;
    /** Padding inside the frosted layer */
    paddingClassName?: string;
};

/**
 * Same chrome as {@link HeroWaitlistForm}: gradient stroke + frosted inner panel.
 */
export function HeroGlassShell({ children, className, paddingClassName = "p-5 md:p-8" }: Props) {
    return (
        <div
            className={cn(
                "relative overflow-hidden rounded-[1.35rem] p-[1px] shadow-[0_0_0_1px_rgba(255,255,255,0.06)]",
                className
            )}
            style={{
                background:
                    "linear-gradient(145deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.07) 40%, rgba(255,255,255,0.03) 100%)",
            }}
        >
            <div
                className={cn(
                    "overflow-hidden rounded-[1.3rem] backdrop-blur-2xl",
                    paddingClassName
                )}
                style={{
                    background:
                        "linear-gradient(180deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.03) 100%)",
                    boxShadow:
                        "inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.45), 0 18px 60px -24px rgba(0,0,0,0.85)",
                }}
            >
                {children}
            </div>
        </div>
    );
}
