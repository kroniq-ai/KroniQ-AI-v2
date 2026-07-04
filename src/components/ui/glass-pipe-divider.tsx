"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

type GlassPipeDividerProps = {
  variant: "dark-to-light" | "light-to-dark";
  className?: string;
};

/**
 * Full-bleed cylindrical glass pipe — straight vertical ends, edge to edge.
 * Same geometry for hero→light and light→dark; only palette inverts.
 */
export function GlassPipeDivider({ variant, className }: GlassPipeDividerProps) {
  const uid = useId().replace(/:/g, "");
  const isDarkToLight = variant === "dark-to-light";
  const top = isDarkToLight ? "#000000" : "#fafafa";
  const bottom = isDarkToLight ? "#fafafa" : "#000000";
  const gap = isDarkToLight ? "h-10 md:h-14" : "h-8 md:h-10";

  const bodyId = `${uid}-body`;
  const crownId = `${uid}-crown`;
  const boreId = `${uid}-bore`;
  const rimId = `${uid}-rim`;

  return (
    <div
      className={cn(
        "relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2",
        className,
      )}
      aria-hidden
    >
      <div className="w-full" style={{ background: top }} />

      <div className="relative w-full">
        <svg
          className="block h-7 w-full md:h-9"
          viewBox="0 0 1440 72"
          preserveAspectRatio="none"
          role="presentation"
        >
          <defs>
            <linearGradient id={bodyId} x1="0%" y1="0%" x2="0%" y2="100%">
              {isDarkToLight ? (
                <>
                  <stop offset="0%" stopColor="#52525c" />
                  <stop offset="18%" stopColor="#2a2a32" />
                  <stop offset="50%" stopColor="#121218" />
                  <stop offset="82%" stopColor="#08080c" />
                  <stop offset="100%" stopColor="#030303" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="20%" stopColor="#ececf2" />
                  <stop offset="52%" stopColor="#c4c4cc" />
                  <stop offset="80%" stopColor="#a8a8b2" />
                  <stop offset="100%" stopColor="#8e8e98" />
                </>
              )}
            </linearGradient>
            <linearGradient id={crownId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isDarkToLight ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.98)"} />
              <stop offset="45%" stopColor={isDarkToLight ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.35)"} />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            <linearGradient id={boreId} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="55%" stopColor={isDarkToLight ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.1)"} />
              <stop offset="100%" stopColor={isDarkToLight ? "rgba(0,0,0,0.65)" : "rgba(0,0,0,0.28)"} />
            </linearGradient>
            <linearGradient id={rimId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={isDarkToLight ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.55)"} />
              <stop offset="50%" stopColor={isDarkToLight ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.95)"} />
              <stop offset="100%" stopColor={isDarkToLight ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.55)"} />
            </linearGradient>
          </defs>

          {/* Tube body — full width, square ends */}
          <rect x="0" y="16" width="1440" height="40" fill={`url(#${bodyId})`} />

          {/* Cylindrical crown highlight along top surface */}
          <ellipse cx="720" cy="22" rx="720" ry="10" fill={`url(#${crownId})`} opacity={isDarkToLight ? 0.92 : 0.88} />

          {/* Inner bore shadow along bottom curve */}
          <ellipse
            cx="720"
            cy="52"
            rx="720"
            ry="9"
            fill={`url(#${boreId})`}
            opacity="0.9"
          />

          {/* Top rim — full-width hairline */}
          <rect x="0" y="16" width="1440" height="1.25" fill={`url(#${rimId})`} opacity={isDarkToLight ? 0.85 : 0.95} />

          {/* Bottom edge occlusion */}
          <rect
            x="0"
            y="54.5"
            width="1440"
            height="1.5"
            fill={isDarkToLight ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0.22)"}
          />
        </svg>
      </div>

      <div className={cn("w-full", gap)} style={{ background: bottom }} />
    </div>
  );
}
