"use client";

import { cn } from "@/lib/utils";

type Glow = "peach" | "cyan" | "violet" | "amber";

const MESH: Record<Glow, string> = {
  peach:
    "radial-gradient(ellipse 70% 60% at 25% 75%, rgba(251,146,95,0.4) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 80% 25%, rgba(34,211,238,0.25) 0%, transparent 50%)",
  cyan:
    "radial-gradient(ellipse 65% 55% at 75% 70%, rgba(34,211,238,0.38) 0%, transparent 55%), radial-gradient(ellipse 55% 45% at 20% 30%, rgba(251,146,95,0.25) 0%, transparent 50%)",
  violet:
    "radial-gradient(ellipse 68% 58% at 50% 40%, rgba(167,139,250,0.32) 0%, transparent 55%), radial-gradient(ellipse 50% 45% at 85% 80%, rgba(244,114,182,0.22) 0%, transparent 50%)",
  amber:
    "radial-gradient(ellipse 62% 52% at 30% 50%, rgba(245,158,11,0.28) 0%, transparent 55%), radial-gradient(ellipse 55% 48% at 70% 35%, rgba(16,185,129,0.2) 0%, transparent 50%)",
};

/** Kinso-style mesh + grid panel behind feature clips — no extra glass frame */
export function FeatureVisualWell({
  children,
  glow = "peach",
  className,
}: {
  children: React.ReactNode;
  glow?: Glow;
  className?: string;
}) {
  return (
    <div className={cn("relative mx-auto w-full max-w-[min(100%,520px)]", className)}>
      <div
        className="pointer-events-none absolute -inset-6 rounded-[36px] opacity-90 blur-3xl"
        style={{ background: MESH[glow] }}
        aria-hidden
      />
      <div
        className="relative overflow-hidden rounded-[24px] shadow-[0_32px_64px_-20px_rgba(0,0,0,0.14),0_0_0_1px_rgba(0,0,0,0.04)]"
        style={{ background: MESH[glow] }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
          aria-hidden
        />
        <div className="relative">{children}</div>
      </div>
    </div>
  );
}
