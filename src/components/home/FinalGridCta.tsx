"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";

const GridAnimation = dynamic(
  () => import("@/components/ui/grid-animation").then((m) => m.GridAnimation),
  { ssr: false },
);

function scrollToWaitlist() {
  document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth", block: "center" });
}

export function FinalGridCta() {
  const ref = useRef<HTMLElement>(null);
  const [showGrid, setShowGrid] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setShowGrid(true);
      },
      { rootMargin: "200px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section ref={ref} className="band-dark relative flex min-h-[60vh] items-center justify-center overflow-hidden pb-10">
      {showGrid && (
        <div className="absolute inset-0 flex items-center justify-center opacity-80">
          <GridAnimation cols={52} rows={26} spacing={26} className="max-h-full max-w-full" />
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#0a0a0b] via-transparent to-[#0a0a0b]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-32 w-full bg-gradient-to-t from-[#0a0a0b] to-transparent" />

      <div className="relative z-10 flex flex-col items-center px-6 py-24 text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-4 text-xs font-medium uppercase tracking-widest text-emerald-400"
        >
          Ready to start?
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="headline-display mb-6 text-3xl text-white sm:text-4xl md:text-6xl"
        >
          Ready for an AI CMO
          <br />
          <span className="text-white/40">that actually runs?</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mb-10 max-w-md text-neutral-400"
        >
          Join the waitlist — pilot users sign in on app.kroniqai.com with an invite.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <LiquidMetalButton label="Join Waitlist" type="button" onClick={scrollToWaitlist} />
        </motion.div>
      </div>
    </section>
  );
}
