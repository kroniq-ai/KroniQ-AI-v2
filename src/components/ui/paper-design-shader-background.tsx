"use client";

import { GrainGradient } from "@paper-design/shaders-react";

import { cn } from "@/lib/utils";

export type GradientBackgroundProps = {
    className?: string;
};

/** FAQ ambient — keep stops dark; high intensity + light grays + scrims = blown-out white on black. */
export function GradientBackground({ className }: GradientBackgroundProps) {
    return (
        <div className={cn("pointer-events-none absolute inset-0 z-0", className)} aria-hidden>
            <GrainGradient
                style={{ height: "100%", width: "100%" }}
                colorBack="hsl(0, 0%, 0%)"
                softness={0.9}
                intensity={0.085}
                noise={0.1}
                shape="blob"
                offsetX={0}
                offsetY={0.06}
                scale={1.12}
                rotation={0}
                speed={0.4}
                colors={[
                    "hsl(220, 6%, 18%)",
                    "hsl(220, 8%, 12%)",
                    "hsl(0, 0%, 8%)",
                    "hsl(0, 0%, 4%)",
                ]}
            />
        </div>
    );
}
