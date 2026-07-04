"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type Glow = "peach" | "cyan" | "violet" | "amber";

const MESH: Record<Glow, string> = {
  peach:
    "radial-gradient(ellipse 70% 60% at 25% 75%, rgba(251,146,95,0.35) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 80% 25%, rgba(34,211,238,0.2) 0%, transparent 50%)",
  cyan:
    "radial-gradient(ellipse 65% 55% at 75% 70%, rgba(34,211,238,0.32) 0%, transparent 55%), radial-gradient(ellipse 55% 45% at 20% 30%, rgba(251,146,95,0.22) 0%, transparent 50%)",
  violet:
    "radial-gradient(ellipse 68% 58% at 50% 40%, rgba(167,139,250,0.28) 0%, transparent 55%), radial-gradient(ellipse 50% 45% at 85% 80%, rgba(244,114,182,0.2) 0%, transparent 50%)",
  amber:
    "radial-gradient(ellipse 62% 52% at 30% 50%, rgba(245,158,11,0.25) 0%, transparent 55%), radial-gradient(ellipse 55% 48% at 70% 35%, rgba(16,185,129,0.18) 0%, transparent 50%)",
};

/** Premium 3D glass panel for light-zone feature visuals */
export function LightGlassShell({
  children,
  className,
  glow = "peach",
  tilt = true,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: Glow;
  tilt?: boolean;
}) {
  return (
    <div className={cn("relative mx-auto w-full max-w-[520px]", className)}>
      <div
        className="pointer-events-none absolute -inset-6 rounded-[40px] opacity-80 blur-3xl"
        style={{ background: MESH[glow] }}
        aria-hidden
      />
      <div
        className={cn(
          "relative overflow-hidden rounded-[28px] border border-white/90",
          "bg-gradient-to-br from-white/95 via-white/80 to-white/70",
          "shadow-[0_40px_80px_-20px_rgba(0,0,0,0.14),0_0_0_1px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,1)]",
          "backdrop-blur-2xl backdrop-saturate-150",
          tilt && "[transform:perspective(1200px)_rotateX(2deg)_rotateY(-3deg)]",
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-90" />
        {children}
      </div>
    </div>
  );
}
