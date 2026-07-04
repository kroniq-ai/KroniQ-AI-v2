"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";
import { SiGmail, SiMeta } from "react-icons/si";
import { HeroProductFrame } from "@/components/home/kinso/mocks/HeroDashboardMock";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const FLANK_ICONS: {
  label: string;
  side: "left" | "right";
  top: string;
  delay: number;
  icon: React.ReactNode;
}[] = [
  {
    label: "LinkedIn",
    side: "left",
    top: "12%",
    delay: 0.6,
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="#0A66C2">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "Meta",
    side: "left",
    top: "58%",
    delay: 0.8,
    icon: <SiMeta className="h-6 w-6" color="#0668E1" />,
  },
  {
    label: "X",
    side: "right",
    top: "22%",
    delay: 0.15,
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="white">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.26 5.633L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
      </svg>
    ),
  },
  {
    label: "Gmail",
    side: "right",
    top: "62%",
    delay: 0.4,
    icon: <SiGmail className="h-6 w-6" color="#EA4335" />,
  },
];

function FlankIcon({
  label,
  side,
  top,
  delay,
  icon,
  index,
}: (typeof FLANK_ICONS)[number] & { index: number }) {
  return (
    <motion.div
      className={`pointer-events-none absolute z-30 hidden lg:flex ${side === "left" ? "-left-2 xl:-left-14" : "-right-2 xl:-right-14"}`}
      style={{ top }}
      initial={{ opacity: 0, scale: 0.75, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.8, delay: delay + 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3.8 + index * 0.4, repeat: Infinity, ease: "easeInOut", delay: index * 0.3 }}
        title={label}
        className="flex h-[52px] w-[52px] items-center justify-center rounded-full"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.16)",
          boxShadow: "0 4px 28px -4px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04) inset",
          backdropFilter: "blur(24px) saturate(150%)",
          WebkitBackdropFilter: "blur(24px) saturate(150%)",
        }}
      >
        {icon}
      </motion.div>
    </motion.div>
  );
}

export function HeroMockupParallax() {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const mockupContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const triggerElement = parallaxRef.current;
    const mockupElement = mockupContainerRef.current;
    if (!triggerElement || !mockupElement) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        mockupElement,
        { y: 120 },
        {
          y: -320,
          ease: "none",
          scrollTrigger: {
            trigger: triggerElement,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    }, triggerElement);

    return () => ctx.revert();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.65, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      ref={parallaxRef}
      className="relative z-20 mt-12 flex w-full justify-center px-3 md:mt-14 md:px-4"
    >
      {/* Soft fade into bridge — no white bleed (bridge handles the transition) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20"
        style={{
          height: "38%",
          background: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.65) 100%)",
        }}
      />

      <div ref={mockupContainerRef} className="relative w-full max-w-[min(96vw,1320px)] lg:max-w-7xl">
        {FLANK_ICONS.map((ic, i) => (
          <FlankIcon key={ic.label} {...ic} index={i} />
        ))}

        <div
          className="pointer-events-none absolute inset-0 z-0 scale-[1.02]"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(16,185,129,0.2) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 60%, rgba(251,146,95,0.14) 0%, transparent 50%)",
          }}
        />
        <div className="relative z-10 origin-top scale-[1.02] md:scale-[1.06] lg:scale-[1.08]">
          <HeroProductFrame />
        </div>
      </div>
    </motion.div>
  );
}
