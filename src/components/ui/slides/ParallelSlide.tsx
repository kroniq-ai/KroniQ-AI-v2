"use client";

import { KinsoGlassWindow } from "@/components/ui/kinso-showcase";
import { RadialOrbitalTimeline } from "@/components/ui/slides/RadialOrbitalTimeline";

/** Step 03 — parallel agents inside Kinso glass shell */
export function ParallelSlide() {
  return (
    <KinsoGlassWindow
      glow="violet"
      eyebrow={
        <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-violet-300/70">
          Parallel execution
        </p>
      }
      title="Agents run together"
      subtitle="Research, outreach, and content — cross-checked before send."
      density="compact"
    >
      <div className="flex h-[min(340px,100%)] items-center justify-center overflow-hidden py-1">
        <div className="scale-[0.5] sm:scale-[0.65] md:scale-[0.85] lg:scale-100">
          <RadialOrbitalTimeline />
        </div>
      </div>
    </KinsoGlassWindow>
  );
}
