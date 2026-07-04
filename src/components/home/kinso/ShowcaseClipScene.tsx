"use client";

import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SHOWCASE_MOCK_SCENE_CLASS } from "./showcase-clip-styles";

/** Peach + cyan mesh used by Kinso v2v clips (outreach, lead research, CMO audit) */
export const SHOWCASE_MESH_STYLE: React.CSSProperties = {
  background: [
    "radial-gradient(ellipse 72% 58% at 18% 88%, rgba(251,146,95,0.38) 0%, transparent 58%)",
    "radial-gradient(ellipse 64% 52% at 88% 12%, rgba(34,211,238,0.32) 0%, transparent 52%)",
    "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(255,255,255,0.9) 0%, transparent 70%)",
    "#f4f4f5",
  ].join(", "),
};

export const SHOWCASE_GRID_STYLE: React.CSSProperties = {
  backgroundImage: [
    "linear-gradient(to right, rgba(0,0,0,0.035) 1px, transparent 1px)",
    "linear-gradient(to bottom, rgba(0,0,0,0.035) 1px, transparent 1px)",
  ].join(", "),
  backgroundSize: "24px 24px",
};

type ShowcaseClipSceneProps = {
  children: ReactNode;
  className?: string;
  /** Extra warm glow behind foreground cards (CMO audit bottom pill) */
  warmGlow?: boolean;
};

export const ShowcaseClipScene = forwardRef<HTMLDivElement, ShowcaseClipSceneProps>(
  function ShowcaseClipScene({ children, className, warmGlow }, ref) {
  return (
    <div ref={ref} className={cn(SHOWCASE_MOCK_SCENE_CLASS, className)}>
      <div className="absolute inset-0" style={SHOWCASE_MESH_STYLE} aria-hidden />
      <div className="pointer-events-none absolute inset-0 opacity-[0.55]" style={SHOWCASE_GRID_STYLE} aria-hidden />

      {warmGlow && (
        <div
          className="pointer-events-none absolute bottom-[8%] left-[6%] h-[45%] w-[55%] rounded-full opacity-70 blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse at 30% 70%, rgba(251,146,95,0.42) 0%, rgba(251,146,95,0.08) 45%, transparent 72%)",
          }}
          aria-hidden
        />
      )}

      {children}
    </div>
  );
},
);
