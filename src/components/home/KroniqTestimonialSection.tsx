"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { KinsoKicker } from "@/components/ui/kinso-kicker";
import { glassDark } from "@/components/ui/glass-surface";
import { RevealFade, RevealSplitText } from "@/components/ui/scroll-reveal";
import { KRONIQ_TESTIMONIALS } from "@/lib/landing/testimonials";

function SplitText({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <span>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.35, delay: i * 0.025, ease: [0.22, 1, 0.36, 1] }}
          className="mr-[0.25em] inline-block"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

/** Leadz-style click-through reviews — KroniQ pilot quotes */
export function KroniqTestimonialSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const testimonials = KRONIQ_TESTIMONIALS;
  const current = testimonials[activeIndex];

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  return (
    <section
      id="reviews"
      className="relative scroll-mt-20 border-t border-white/[0.06] bg-black py-20 md:py-28"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 20% 0%, rgba(16,185,129,0.08) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 90% 80%, rgba(34,211,238,0.06) 0%, transparent 60%)",
        }}
        aria-hidden
      />

      <div className="section-container relative mx-auto max-w-4xl px-6">
        <div className="mb-10 flex flex-col items-start md:mb-14">
          <RevealFade>
            <KinsoKicker label="Pilot feedback" variant="dark" />
          </RevealFade>
          <RevealSplitText
            as="h2"
            text="Don't just take our word for it."
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl"
            delay={0.06}
          />
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="group w-full cursor-pointer text-left"
          aria-label="Show next review"
        >
          <div className="mb-6 flex items-center justify-between font-mono text-xs text-white/35">
            <span className={glassDark.pillCompact}>
              {String(activeIndex + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
            </span>
            <span className="text-white/25 transition group-hover:text-white/50">Click to advance →</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.blockquote
              key={activeIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              className="min-h-[120px] text-2xl font-light leading-relaxed tracking-tight text-white/90 md:min-h-[140px] md:text-3xl lg:text-4xl"
            >
              <SplitText text={current.quote} />
            </motion.blockquote>
          </AnimatePresence>

          <div className="mt-10 flex items-center gap-4">
            <div className="relative h-14 w-14 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.avatar}
                alt={current.author}
                className="h-14 w-14 rounded-full object-cover ring-2 ring-white/10 grayscale transition duration-500 group-hover:grayscale-0"
              />
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeIndex}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.25 }}
                className="relative border-l-2 border-white/15 pl-4"
              >
                <span className="block text-lg font-medium text-white">{current.author}</span>
                <span className="mt-0.5 block text-sm font-medium text-white/70">{current.company}</span>
                <span className="mt-0.5 block text-xs text-white/40">{current.role}</span>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative mt-12 h-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-emerald-400/80 to-cyan-400/70"
              animate={{ width: `${((activeIndex + 1) / testimonials.length) * 100}%` }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </button>
      </div>
    </section>
  );
}
