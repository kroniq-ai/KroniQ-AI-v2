"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/** Fine Kinso-style grid overlay */
export const kinsoGridStyle: React.CSSProperties = {
  backgroundImage: `
    linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)
  `,
  backgroundSize: "28px 28px",
};

type GlowTone = "peach" | "cyan" | "violet" | "emerald" | "amber";

const GLOW: Record<GlowTone, string> = {
  peach: "radial-gradient(ellipse 70% 60% at 55% 40%, rgba(251,146,95,0.22) 0%, transparent 70%)",
  cyan: "radial-gradient(ellipse 65% 55% at 45% 35%, rgba(34,211,238,0.18) 0%, transparent 72%)",
  violet: "radial-gradient(ellipse 60% 50% at 50% 45%, rgba(139,92,246,0.2) 0%, transparent 70%)",
  emerald: "radial-gradient(ellipse 68% 58% at 48% 38%, rgba(16,185,129,0.2) 0%, transparent 72%)",
  amber: "radial-gradient(ellipse 62% 52% at 52% 42%, rgba(245,158,11,0.16) 0%, transparent 70%)",
};

export function KinsoAmbientGlow({
  tone = "peach",
  className,
}: {
  tone?: GlowTone;
  className?: string;
}) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{ background: GLOW[tone] }}
      aria-hidden
    />
  );
}

type KinsoGlassWindowProps = {
  children: React.ReactNode;
  className?: string;
  /** Optional eyebrow above title */
  eyebrow?: React.ReactNode;
  title?: string;
  subtitle?: string;
  glow?: GlowTone;
  density?: "default" | "compact";
};

/** macOS-chrome glass panel — Kinso dark hero cards */
export function KinsoGlassWindow({
  children,
  className,
  eyebrow,
  title,
  subtitle,
  glow = "peach",
  density = "default",
}: KinsoGlassWindowProps) {
  return (
    <div className={cn("relative h-full w-full", className)}>
      <KinsoAmbientGlow tone={glow} className="scale-110 opacity-90" />
      <div
        className={cn(
          "relative flex h-full flex-col overflow-hidden rounded-[22px]",
          "border border-white/[0.12] bg-white/[0.04]",
          "shadow-[0_32px_80px_-16px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.12)]",
          "backdrop-blur-[28px] backdrop-saturate-150",
        )}
      >
        {/* Rim highlight */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent" />

        {/* Traffic lights */}
        <div className="flex shrink-0 items-center gap-2 border-b border-white/[0.06] bg-white/[0.02] px-4 py-3">
          <span className="size-2.5 rounded-full bg-[#FF5F57]/90 shadow-[0_0_6px_rgba(255,95,87,0.4)]" />
          <span className="size-2.5 rounded-full bg-[#FEBC2E]/90 shadow-[0_0_6px_rgba(254,188,46,0.35)]" />
          <span className="size-2.5 rounded-full bg-[#28C840]/85 shadow-[0_0_6px_rgba(40,200,64,0.35)]" />
          <div className="ml-1 min-w-0 flex-1 truncate text-center text-[10px] font-medium tracking-wide text-white/25">
            kroniq.ai
          </div>
        </div>

        {(eyebrow || title) && (
          <div className={cn("shrink-0 px-5 pt-4", density === "compact" && "px-4 pt-3")}>
            {eyebrow}
            {title && (
              <h3
                className={cn(
                  "font-semibold tracking-tight text-white",
                  density === "compact" ? "text-base" : "text-lg md:text-xl",
                )}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-1 text-[12px] leading-relaxed text-white/45 md:text-[13px]">{subtitle}</p>
            )}
          </div>
        )}

        <div className={cn("relative flex-1", density === "compact" ? "p-4 pt-3" : "p-5 pt-4")}>
          {children}
        </div>
      </div>
    </div>
  );
}

const PILL_STYLES = {
  cyan: "border-cyan-400/35 bg-cyan-400/12 text-cyan-200 shadow-[0_0_20px_rgba(34,211,238,0.12)]",
  coral: "border-orange-400/35 bg-orange-400/12 text-orange-200 shadow-[0_0_20px_rgba(251,146,60,0.12)]",
  green: "border-emerald-400/35 bg-emerald-400/12 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.12)]",
  violet: "border-violet-400/35 bg-violet-400/12 text-violet-200 shadow-[0_0_20px_rgba(139,92,246,0.12)]",
  gold: "border-amber-400/35 bg-amber-400/12 text-amber-100 shadow-[0_0_20px_rgba(245,158,11,0.12)]",
  rose: "border-rose-400/35 bg-rose-400/12 text-rose-200 shadow-[0_0_20px_rgba(251,113,133,0.12)]",
} as const;

export type KinsoPillVariant = keyof typeof PILL_STYLES;

export function KinsoTopicPill({
  label,
  variant = "cyan",
  className,
}: {
  label: string;
  variant?: KinsoPillVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-wide",
        PILL_STYLES[variant],
        className,
      )}
    >
      {label}
    </span>
  );
}

export function KinsoInnerCard({
  children,
  className,
  glow,
}: {
  children: React.ReactNode;
  className?: string;
  glow?: "left" | "right" | "none";
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/[0.1] bg-black/30 p-3.5",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_32px_rgba(0,0,0,0.35)]",
        "backdrop-blur-xl",
        className,
      )}
    >
      {glow === "left" && (
        <div
          className="pointer-events-none absolute -left-8 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full opacity-60 blur-2xl"
          style={{ background: "radial-gradient(circle, rgba(251,146,95,0.45) 0%, transparent 70%)" }}
        />
      )}
      {glow === "right" && (
        <div
          className="pointer-events-none absolute -right-6 top-0 h-20 w-20 rounded-full opacity-50 blur-2xl"
          style={{ background: "radial-gradient(circle, rgba(34,211,238,0.4) 0%, transparent 70%)" }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function KinsoAvatar({
  initials,
  ring = "emerald",
  className,
}: {
  initials: string;
  ring?: "emerald" | "cyan" | "coral" | "violet";
  className?: string;
}) {
  const ringColor = {
    emerald: "ring-emerald-400/50 shadow-[0_0_16px_rgba(16,185,129,0.25)]",
    cyan: "ring-cyan-400/50 shadow-[0_0_16px_rgba(34,211,238,0.25)]",
    coral: "ring-orange-400/50 shadow-[0_0_16px_rgba(251,146,60,0.25)]",
    violet: "ring-violet-400/50 shadow-[0_0_16px_rgba(139,92,246,0.25)]",
  }[ring];

  return (
    <div
      className={cn(
        "flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-white/15 to-white/5 text-[11px] font-bold text-white ring-2",
        ringColor,
        className,
      )}
    >
      {initials}
    </div>
  );
}
