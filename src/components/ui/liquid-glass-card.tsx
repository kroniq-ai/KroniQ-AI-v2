import * as React from "react";
import { cn } from "@/lib/utils";

interface LiquidGlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/** Frosted glass panel — adapted from Leadz design system. */
export function LiquidGlassCard({ children, className, ...props }: LiquidGlassCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.35)]",
        className,
      )}
      {...props}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 mix-blend-overlay" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
