import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Dark hero / nav glass */
export const glassDark = {
  navPill:
    "rounded-full border border-white/[0.12] bg-gradient-to-b from-white/[0.09] to-white/[0.02] shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_24px_56px_-24px_rgba(0,0,0,0.75)] backdrop-blur-2xl backdrop-saturate-150",
  navLink:
    "rounded-full px-3.5 py-2 text-[13px] font-medium text-white/50 transition-all duration-200 hover:bg-white/[0.08] hover:text-white/95",
  navLinkActive: "bg-white/[0.08] text-white/90",
  button:
    "inline-flex items-center justify-center gap-2 rounded-full border border-white/[0.14] bg-gradient-to-b from-white/[0.1] to-white/[0.03] px-4 py-2.5 text-[13px] font-semibold text-white/80 shadow-[0_1px_0_rgba(255,255,255,0.14)_inset,0_16px_40px_-20px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-all duration-200 hover:border-white/20 hover:bg-white/[0.12] hover:text-white",
  pill:
    "inline-flex items-center gap-2.5 rounded-full border border-white/[0.16] bg-gradient-to-b from-white/[0.11] to-white/[0.03] px-5 py-2.5 shadow-[0_1px_0_rgba(255,255,255,0.18)_inset,0_16px_40px_-20px_rgba(0,0,0,0.65)] backdrop-blur-xl backdrop-saturate-150",
  pillCompact:
    "inline-flex items-center rounded-full border border-white/[0.14] bg-gradient-to-b from-white/[0.09] to-white/[0.02] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white/45 shadow-[0_1px_0_rgba(255,255,255,0.14)_inset,0_12px_32px_-16px_rgba(0,0,0,0.55)] backdrop-blur-xl",
  inputShell:
    "flex flex-col gap-2 rounded-full border border-white/[0.14] bg-gradient-to-b from-white/[0.08] to-black/50 p-1.5 shadow-[0_28px_64px_-28px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-2xl backdrop-saturate-150 sm:flex-row sm:items-center",
  input:
    "min-h-[3rem] min-w-0 flex-1 rounded-full border border-transparent bg-black/35 px-5 py-3 text-[15px] text-white shadow-[inset_0_2px_10px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.07)] outline-none transition-all placeholder:text-white/35 focus:border-white/15 focus:bg-black/50 focus:shadow-[inset_0_2px_12px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.08)]",
} as const;

/** Light marketing zone glass */
export const glassLight = {
  navPill:
    "rounded-full border border-black/[0.08] bg-gradient-to-b from-white/72 to-white/42 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_24px_56px_-20px_rgba(0,0,0,0.14)] backdrop-blur-2xl backdrop-saturate-150",
  navLink:
    "rounded-full px-3.5 py-2 text-[13px] font-medium text-black/50 transition-all duration-200 hover:bg-black/[0.05] hover:text-black/90",
  navLinkActive: "bg-black/[0.06] text-black/85",
  card:
    "rounded-[28px] border border-white/60 bg-white/38 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_1px_0_rgba(0,0,0,0.04),0_40px_100px_-28px_rgba(0,0,0,0.14)] backdrop-blur-2xl backdrop-saturate-150",
  pill:
    "inline-flex items-center rounded-full border border-white/70 bg-gradient-to-b from-white/55 to-white/28 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-black/55 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_8px_32px_-10px_rgba(0,0,0,0.12)] backdrop-blur-xl backdrop-saturate-150",
  buttonPrimary:
    "inline-flex items-center justify-center rounded-full bg-black px-5 py-2.5 text-sm font-semibold text-white shadow-[0_16px_40px_-16px_rgba(0,0,0,0.45)] transition hover:bg-black/90",
  buttonGhost:
    "inline-flex items-center justify-center rounded-full border border-black/[0.1] bg-white/60 px-5 py-2.5 text-sm font-semibold text-black/70 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_8px_24px_-12px_rgba(0,0,0,0.08)] backdrop-blur-md transition hover:border-black/15 hover:bg-white hover:text-black",
  iconTile:
    "relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/65 bg-gradient-to-b from-white/55 to-white/25 p-2 shadow-[0_1px_0_rgba(255,255,255,0.95)_inset,0_12px_32px_-12px_rgba(0,0,0,0.1)] backdrop-blur-lg backdrop-saturate-150 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/80 sm:h-12 sm:w-12",
} as const;

type GlassButtonProps = ComponentProps<"a"> & {
  variant?: "dark" | "light-ghost";
};

export function GlassButton({ variant = "dark", className, children, ...props }: GlassButtonProps) {
  return (
    <a
      className={cn(variant === "dark" ? glassDark.button : glassLight.buttonGhost, className)}
      {...props}
    >
      {children}
    </a>
  );
}
