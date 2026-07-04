"use client";

import Link from "next/link";
import { GrainGradient, grainGradientPresets } from "@paper-design/shaders-react";
import { KinsoKicker } from "@/components/ui/kinso-kicker";
import { glassDark } from "@/components/ui/glass-surface";
import { cn } from "@/lib/utils";

type AuthPageShellProps = {
  children: React.ReactNode;
  kicker?: string;
  title: string;
  subtitle: string;
  className?: string;
};

export function AuthPageShell({
  children,
  kicker = "Pilot access",
  title,
  subtitle,
  className,
}: AuthPageShellProps) {
  return (
    <div className={cn("relative min-h-screen overflow-hidden bg-black text-white", className)}>
      <GrainGradient
        {...grainGradientPresets[0]}
        colors={["hsl(160, 84%, 39%)", "hsl(188, 86%, 53%)", "hsl(255, 71%, 54%)"]}
        style={{ position: "absolute", inset: 0, zIndex: 0, opacity: 0.55, pointerEvents: "none" }}
      />
      <div className="bg-noise pointer-events-none absolute inset-0 z-[1] opacity-[0.35]" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 z-[1] opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(16,185,129,0.18) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 100% 80%, rgba(34,211,238,0.1) 0%, transparent 60%)",
        }}
        aria-hidden
      />

      <header className="relative z-20 flex items-center justify-between px-5 py-5 md:px-8">
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
        <Link href="/" className={cn(glassDark.navLink, "text-[13px]")}>
          Back to site
        </Link>
      </header>

      <main className="relative z-10 mx-auto grid min-h-[calc(100vh-88px)] max-w-6xl items-center gap-12 px-5 pb-12 md:px-8 lg:grid-cols-[1fr_420px] lg:gap-16">
        <div className="hidden max-w-lg lg:block">
          <KinsoKicker label={kicker} variant="dark" className="mb-6" />
          <h1
            className="text-4xl font-bold leading-[1.06] tracking-tight text-white xl:text-5xl"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
          >
            Same brain as the landing page.{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #10b981 0%, #22d3ee 55%, #a78bfa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Your growth workspace.
            </span>
          </h1>
          <p className="mt-5 text-base leading-relaxed text-white/50">
            Brief once on your company, ICP, and goals. Outreach, content, and lead research run from one place after you
            sign in.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-white/45">
            <li className={cn(glassDark.pillCompact, "w-fit normal-case tracking-normal text-white/55")}>
              Company memory every agent reads
            </li>
            <li className={cn(glassDark.pillCompact, "w-fit normal-case tracking-normal text-white/55")}>
              Action queue with approval modes
            </li>
            <li className={cn(glassDark.pillCompact, "w-fit normal-case tracking-normal text-white/55")}>
              Gmail, LinkedIn, HubSpot in pilot
            </li>
          </ul>
        </div>

        <div className="w-full max-w-md justify-self-center lg:justify-self-end">
          <div className="mb-6 lg:hidden">
            <KinsoKicker label={kicker} variant="dark" className="mb-4" />
            <h2
              className="text-3xl font-bold tracking-tight text-white"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
            >
              {title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/45">{subtitle}</p>
          </div>

          <div
            className={cn(
              "rounded-[28px] border border-white/[0.12] bg-gradient-to-b from-white/[0.09] to-white/[0.02]",
              "p-7 shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_40px_100px_-32px_rgba(0,0,0,0.75)] backdrop-blur-2xl backdrop-saturate-150 md:p-8",
            )}
          >
            <div className="mb-6 hidden lg:block">
              <h2
                className="text-2xl font-bold tracking-tight text-white"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
              >
                {title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/45">{subtitle}</p>
            </div>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
