"use client";

import * as React from "react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SHOWCASE_VIDEO_CLASS } from "./showcase-clip-styles";

type Bleed = "left" | "right";

type ClipFrameProps = {
  children: ReactNode;
  bleed: Bleed;
  inView: boolean;
  reduceMotion: boolean;
};

const ShowcaseClipFrame = React.forwardRef<HTMLDivElement, ClipFrameProps>(
  function ShowcaseClipFrame({ children, bleed, inView, reduceMotion }, ref) {
    return (
      <motion.div
        ref={ref}
        className={cn(
          "relative w-full select-none",
          bleed === "right" && "lg:translate-x-2",
          bleed === "left" && "lg:-translate-x-2",
        )}
        initial={false}
        animate={
          reduceMotion
            ? { opacity: 1, x: 0, y: 0 }
            : inView
              ? { opacity: 1, x: 0, y: 0 }
              : {
                  opacity: 0.6,
                  x: bleed === "right" ? 24 : -24,
                  y: 16,
                }
        }
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className={cn(
            "relative w-full overflow-hidden",
            bleed === "right" && "rounded-l-[28px] md:rounded-l-[36px]",
            bleed === "left" && "rounded-r-[28px] md:rounded-r-[36px]",
          )}
        >
          <div
            className={cn(
              "relative w-[118%] max-w-none",
              bleed === "right" ? "left-0" : "right-0 ml-auto",
            )}
          >
            {children}
          </div>
        </div>
      </motion.div>
    );
  },
);

export type ShowcaseVideoProps = {
  src: string;
  poster?: string;
  fallback: ReactNode;
  bleed?: Bleed;
  /** Skip MP4 — use animated mock (AI video can't render UI text) */
  mockOnly?: boolean;
};

export function ShowcaseVideo({
  src,
  poster,
  fallback,
  bleed = "right",
  mockOnly = false,
}: ShowcaseVideoProps) {
  const [useFallback, setUseFallback] = useState(mockOnly);
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();
  const inView = useInView(frameRef, { amount: 0.45, margin: "0px 0px -8% 0px" });

  useEffect(() => {
    const video = videoRef.current;
    if (!video || useFallback) return;

    if (inView) {
      void video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [inView, useFallback]);

  return (
    <ShowcaseClipFrame
      ref={frameRef}
      bleed={bleed}
      inView={inView}
      reduceMotion={!!reduceMotion}
    >
      {useFallback ? (
        fallback
      ) : (
        <video
          ref={videoRef}
          className={SHOWCASE_VIDEO_CLASS}
          src={src}
          poster={poster}
          loop
          muted
          playsInline
          preload="metadata"
          onError={() => setUseFallback(true)}
        />
      )}
    </ShowcaseClipFrame>
  );
}
