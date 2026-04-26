"use client";

import { cn } from "@/lib/utils";

/** Shared neutral depth — soft white/gray blurs only (no chroma). */
export function BrightSectionBackdrop({ className }: { className?: string }) {
    return (
        <div
            aria-hidden
            className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}
        >
            <div className="absolute -left-[8%] top-0 h-[min(440px,58vw)] w-[min(440px,58vw)] rounded-full bg-white/[0.07] blur-[110px]" />
            <div className="absolute right-0 top-1/4 h-[min(380px,52vw)] w-[min(380px,52vw)] translate-x-1/4 rounded-full bg-neutral-400/[0.06] blur-[118px]" />
            <div className="absolute bottom-0 left-1/4 h-[min(400px,50vw)] w-[min(400px,50vw)] rounded-full bg-white/[0.045] blur-[105px]" />
        </div>
    );
}
