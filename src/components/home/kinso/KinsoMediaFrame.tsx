"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Film, ImageIcon } from "lucide-react";

export type KinsoMediaFrameProps = {
  /** Path under /public, e.g. `/images/showcase/lead-research.mp4` */
  src: string;
  type: "video" | "image";
  poster?: string;
  alt: string;
  /** Shown when asset is missing or fails to load */
  placeholderLabel: string;
  className?: string;
};

/**
 * Kinso-style media well: plays video/image when the file exists,
 * otherwise shows a premium placeholder until you drop assets in /public/images/.
 */
export function KinsoMediaFrame({
  src,
  type,
  poster,
  alt,
  placeholderLabel,
  className,
}: KinsoMediaFrameProps) {
  const [failed, setFailed] = React.useState(false);
  const showPlaceholder = failed;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[28px] border border-black/[0.06] bg-white shadow-[0_24px_80px_-24px_rgba(0,0,0,0.12)]",
        "dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-[0_32px_80px_-20px_rgba(0,0,0,0.65)]",
        className,
      )}
    >
      {/* Soft Kinso mesh behind media */}
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 20% 80%, rgba(251,146,95,0.18) 0%, transparent 55%), radial-gradient(ellipse 70% 60% at 85% 20%, rgba(34,211,238,0.14) 0%, transparent 50%)",
        }}
        aria-hidden
      />

      <div className="relative aspect-[16/10] w-full">
        {!showPlaceholder && type === "video" ? (
          <video
            key={src}
            className="absolute inset-0 h-full w-full object-cover object-top"
            src={src}
            poster={poster}
            autoPlay
            loop
            muted
            playsInline
            onError={() => setFailed(true)}
          />
        ) : !showPlaceholder ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={alt}
            className="absolute inset-0 h-full w-full object-cover object-top"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl border border-dashed border-black/15 bg-white/60 shadow-inner dark:border-white/15 dark:bg-white/[0.06]">
              {type === "video" ? (
                <Film className="size-6 text-black/35 dark:text-white/40" />
              ) : (
                <ImageIcon className="size-6 text-black/35 dark:text-white/40" />
              )}
            </div>
            <p className="max-w-[240px] text-[13px] font-semibold leading-snug text-black/55 dark:text-white/55">
              {placeholderLabel}
            </p>
            <code className="rounded-lg bg-black/[0.04] px-2.5 py-1 text-[10px] text-black/40 dark:bg-white/[0.06] dark:text-white/35">
              public{src}
            </code>
          </div>
        )}
      </div>
    </div>
  );
}
