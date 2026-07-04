"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";
import { glassDark, glassLight } from "@/components/ui/glass-surface";

type KinsoKickerProps = {
  label: string;
  variant?: "light" | "dark";
  className?: string;
  /** Show animated meter line (FAQ-style) */
  animated?: boolean;
};

function GlassKickerPipe({ variant, animated }: { variant: "light" | "dark"; animated?: boolean }) {
  const uid = useId().replace(/:/g, "");
  const isDark = variant === "dark";
  const bodyId = `${uid}-pipe-body`;
  const hlId = `${uid}-pipe-hl`;

  return (
    <span
      className={cn(
        "relative h-[10px] min-w-[3.5rem] flex-1 max-w-[9rem] overflow-hidden md:max-w-[11rem]",
        animated && "origin-left",
      )}
      aria-hidden
    >
      <svg className="h-full w-full" viewBox="0 0 120 10" preserveAspectRatio="none" role="presentation">
        <defs>
          <linearGradient id={bodyId} x1="0%" y1="0%" x2="0%" y2="100%">
            {isDark ? (
              <>
                <stop offset="0%" stopColor="#3a3a42" />
                <stop offset="50%" stopColor="#141418" />
                <stop offset="100%" stopColor="#08080a" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="45%" stopColor="#d8d8de" />
                <stop offset="100%" stopColor="#b0b0b8" />
              </>
            )}
          </linearGradient>
          <linearGradient id={hlId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isDark ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.95)"} />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <rect x="0" y="2" width="120" height="6" rx="3" fill={`url(#${bodyId})`} />
        <ellipse cx="60" cy="3.5" rx="56" ry="1.8" fill={`url(#${hlId})`} opacity={isDark ? 0.85 : 0.9} />
        <ellipse cx="60" cy="7.5" rx="54" ry="1.2" fill={isDark ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.08)"} />
      </svg>
      {animated && (
        <span
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[faq1-meter_2.4s_ease-in-out_infinite]"
        />
      )}
    </span>
  );
}

export function KinsoKicker({ label, variant = "light", className, animated = false }: KinsoKickerProps) {
  const isDark = variant === "dark";
  const pillClass = isDark ? glassDark.pillCompact : glassLight.pill;

  return (
    <div className={cn("mb-5 flex items-center gap-3 md:gap-4", className)}>
      <span
        className={cn(pillClass, "shrink-0")}
        style={{ fontFamily: "var(--font-display)" }}
      >
        {label}
      </span>
      <GlassKickerPipe variant={variant} animated={animated} />
    </div>
  );
}
