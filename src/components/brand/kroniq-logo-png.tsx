"use client";

import Image from "next/image";
import { useState } from "react";
import { KroniQMark, KroniqWordmark } from "@/components/brand/kroniq-mark";
import { cn } from "@/lib/utils";
import { kroniqAppIconPath, kroniqLogoPaths } from "@/lib/brand/kroniq-assets";

type PngBase = {
  className?: string;
  priority?: boolean;
};

/** Full wordmark for dark UIs (nav, footer title). Falls back to vector wordmark if PNG 404s. */
export function KroniQWordmarkOnDark({ className, priority }: PngBase) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <KroniqWordmark variant="mono" iconSize={22} className={cn("text-white", className)} />;
  }
  return (
    <Image
      src={kroniqLogoPaths.whiteNoBg}
      alt="KroniQ"
      width={140}
      height={36}
      className={cn("h-7 w-auto max-w-[min(46vw,9.5rem)] object-contain object-left md:max-w-[10.5rem]", className)}
      priority={priority}
      onError={() => setFailed(true)}
    />
  );
}

/** Wordmark for light / high-luminance surfaces. */
export function KroniQWordmarkOnLight({ className, priority }: PngBase) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <KroniqWordmark
        variant="mono"
        iconSize={22}
        className={cn("text-zinc-900", className)}
        textClassName="text-zinc-900"
      />
    );
  }
  return (
    <Image
      src={kroniqLogoPaths.blackNoBg}
      alt="KroniQ"
      width={140}
      height={36}
      className={cn("h-7 w-auto max-w-[min(46vw,9.5rem)] object-contain object-left md:max-w-[10.5rem]", className)}
      priority={priority}
      onError={() => setFailed(true)}
    />
  );
}

type BadgeProps = PngBase & { size?: number };

/** Square mark with background — dock, top bar, modem footer card. */
export function KroniQMarkBadgePng({ className, priority, size = 22 }: BadgeProps) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <KroniQMark size={size} variant="mono" className={cn("text-white/90", className)} />;
  }
  return (
    <Image
      src={kroniqLogoPaths.withBg}
      alt="KroniQ"
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", className)}
      priority={priority}
      onError={() => setFailed(true)}
    />
  );
}

/** Favicon / loading — falls back to mono mark. */
export function KroniQAppIconPng({
  className,
  width,
  height,
  priority = false,
}: {
  className?: string;
  width: number;
  height: number;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <KroniQMark size={Math.min(width, height)} variant="mono" className={cn("text-white", className)} />;
  }
  return (
    <Image
      src={kroniqAppIconPath}
      alt="KroniQ"
      width={width}
      height={height}
      className={className}
      priority={priority}
      onError={() => setFailed(true)}
    />
  );
}
