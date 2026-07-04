"use client";

import Link from "next/link";
import { glassDark } from "@/components/ui/glass-surface";
import { cn } from "@/lib/utils";

type AppPlatformHeaderProps = {
  title?: string;
  trailing?: React.ReactNode;
  className?: string;
};

/** Shared glass nav for dashboard / project — matches auth shell. */
export function AppPlatformHeader({ title, trailing, className }: AppPlatformHeaderProps) {
  return (
    <header className={cn("relative z-20 flex items-center justify-between px-5 py-5 md:px-8", className)}>
      <Link href="/" className={cn(glassDark.navPill, "inline-flex items-center gap-2.5 px-2.5 py-2")}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logos/kroniqlogowithbg.png"
          alt="KroniQ"
          width={32}
          height={32}
          className="h-8 w-8 rounded-full object-contain"
        />
        <span className="text-[15px] font-semibold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
          KroniQ
        </span>
      </Link>
      <div className="flex items-center gap-4">
        {title ? (
          <span className="hidden text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35 sm:inline">
            {title}
          </span>
        ) : null}
        {trailing}
      </div>
    </header>
  );
}
