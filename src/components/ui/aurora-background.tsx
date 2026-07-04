"use client";

import { cn } from "@/lib/utils";

/** Subtle aurora mesh for dark hero — static fallback when reduced motion. */
export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden
    >
      <div
        className="absolute -left-1/4 top-0 h-[70%] w-[70%] rounded-full opacity-40 blur-[100px] motion-reduce:opacity-25"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.35) 0%, transparent 70%)" }}
      />
      <div
        className="absolute -right-1/4 top-1/4 h-[60%] w-[60%] rounded-full opacity-30 blur-[90px] motion-reduce:opacity-15"
        style={{ background: "radial-gradient(circle, rgba(34,211,238,0.3) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-[50%] w-[50%] rounded-full opacity-20 blur-[80px]"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)" }}
      />
    </div>
  );
}
