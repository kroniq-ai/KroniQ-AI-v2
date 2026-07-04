"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { ShowcaseClipScene } from "../ShowcaseClipScene";

function GmailMark() {
  return (
    <svg className="h-[15px] w-[15px] shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#EA4335"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#4285F4"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function OutlineAvatar({ initials }: { initials: string }) {
  return (
    <div className="relative size-10 shrink-0 md:size-11">
      <div className="absolute inset-0 rounded-full border-[2.5px] border-sky-400/75 bg-white/80 shadow-[inset_0_0_0_1px_rgba(56,189,248,0.15)]" />
      <div className="absolute inset-[3px] flex items-center justify-center rounded-full bg-gradient-to-br from-sky-50 to-white text-[11px] font-semibold text-sky-600/90 md:text-[12px]">
        {initials}
      </div>
    </div>
  );
}

function AiOrb() {
  return (
    <div className="relative size-10 shrink-0 md:size-11">
      <motion.div
        className="absolute -inset-1 rounded-full bg-gradient-to-br from-emerald-400/50 via-teal-300/40 to-orange-400/50 blur-md"
        animate={{ opacity: [0.55, 0.85, 0.55], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-300/90 via-teal-200/70 to-orange-300/85 blur-[1px]" />
      <div className="absolute inset-[3px] rounded-full bg-gradient-to-br from-white/40 via-teal-100/30 to-orange-100/40 backdrop-blur-[2px]" />
    </div>
  );
}

function BlurredInboxGhost() {
  const rows = ["Luke Rankin", "Ben Monroe", "Ethan Rivers", "Sarah Chen"];

  return (
    <div
      className="pointer-events-none absolute left-1/2 top-[6%] w-[min(92%,520px)] -translate-x-1/2 select-none"
      aria-hidden
    >
      <div className="overflow-hidden rounded-[20px] bg-white/55 shadow-[0_32px_80px_-28px_rgba(0,0,0,0.12)]">
        <div className="blur-[7px] opacity-[0.52] saturate-[0.85]">
          <div className="flex gap-1.5 px-5 pt-4">
            <span className="size-2 rounded-full bg-[#FF5F57]/70" />
            <span className="size-2 rounded-full bg-[#FEBC2E]/70" />
            <span className="size-2 rounded-full bg-[#28C840]/70" />
          </div>
          <div className="mx-5 mt-4 h-10 rounded-full bg-black/[0.05]" />
          <div className="space-y-3.5 px-5 py-5 pb-8">
            {rows.map((name) => (
              <div key={name} className="flex items-center gap-3">
                <div className="size-9 rounded-full bg-black/[0.06]" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="h-2 w-[38%] rounded bg-black/[0.07]" />
                  <div className="h-1.5 w-[72%] rounded bg-black/[0.04]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const pillClass =
  "rounded-[20px] border border-black/[0.04] bg-white/[0.97] px-4 py-3.5 shadow-[0_18px_52px_-14px_rgba(0,0,0,0.14),0_0_0_1px_rgba(255,255,255,0.8)_inset] backdrop-blur-xl md:rounded-[22px] md:px-5 md:py-4";

export function MockCmoAudit() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4, once: true });
  const reduce = useReducedMotion();

  const enter = (delay: number) =>
    reduce
      ? { opacity: 1, y: 0 }
      : inView
        ? { opacity: 1, y: 0 }
        : { opacity: 0, y: 18 };

  return (
    <ShowcaseClipScene ref={ref} warmGlow>
      <BlurredInboxGhost />

      <div className="absolute inset-0 z-10 flex flex-col justify-center gap-3 px-[7%] pb-[4%] pt-[14%] md:gap-3.5 md:px-[9%]">
        <motion.div
          className="w-full"
          initial={false}
          animate={enter(0)}
          transition={{ duration: 0.65, delay: reduce ? 0 : 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className={pillClass}
            animate={reduce ? undefined : { y: [0, -4, 0] }}
            transition={reduce ? undefined : { duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="flex items-start gap-3 md:gap-3.5">
              <OutlineAvatar initials="MW" />
              <div className="min-w-0 flex-1 pt-0.5">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <p className="text-[13px] font-semibold tracking-[-0.01em] text-black/90 md:text-[14px]">
                    Marcus Webb
                  </p>
                  <GmailMark />
                </div>
                <p className="mt-1.5 text-[12px] leading-snug text-black/45 md:text-[13px]">
                  Reply rate dipped 12% on Sequence B
                </p>
                <p className="mt-0.5 text-[12px] font-semibold leading-snug text-black/78 md:text-[13px]">
                  Should we refresh hooks before tomorrow&apos;s send?
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="relative w-full"
          initial={false}
          animate={enter(0.15)}
          transition={{ duration: 0.65, delay: reduce ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="pointer-events-none absolute -inset-3 rounded-[28px] bg-orange-400/25 blur-2xl"
            animate={reduce ? undefined : { opacity: [0.35, 0.65, 0.35] }}
            transition={reduce ? undefined : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          />
          <motion.div
            className={`relative ${pillClass} border-orange-100/60 shadow-[0_22px_58px_-16px_rgba(251,146,60,0.32),0_0_0_1px_rgba(255,255,255,0.85)_inset]`}
            animate={reduce ? undefined : { y: [0, 5, 0] }}
            transition={
              reduce ? undefined : { duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }
            }
          >
            <div className="flex items-start gap-3 md:gap-3.5">
              <AiOrb />
              <p className="pt-0.5 text-[12px] leading-relaxed text-black/52 md:text-[13px]">
                <span className="font-medium text-black/75">Cross-domain:</span> yesterday&apos;s outreach win
                {" → "}
                proof content draft. Queued for 9am —{" "}
                <span className="font-semibold text-orange-600">publish</span>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </ShowcaseClipScene>
  );
}
