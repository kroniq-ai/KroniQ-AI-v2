"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { kinsoGridStyle } from "@/components/ui/kinso-showcase";
import { KinsoAccentWords } from "@/components/ui/kinso-accent-words";
import { glassDark } from "@/components/ui/glass-surface";
import { smoothScrollTo, smoothScrollToId } from "@/lib/scroll/smooth-scroll-to";
import { cn } from "@/lib/utils";

const FEATURE_IMAGES = [
  {
    src: "/images/features/step-01-brief.png",
    alt: "KroniQ CMO brief — type your goal and the agent breaks it into outreach tasks",
  },
  {
    src: "/images/features/step-02-memory.png",
    alt: "Company memory — one source of truth for ICP, voice, and goals across every agent",
  },
  {
    src: "/images/features/step-03-parallel.png",
    alt: "Parallel execution — research, outreach, and content agents run together",
  },
  {
    src: "/images/features/step-04-leads.png",
    alt: "Overnight lead sourcing — ICP matches ready at 8am",
  },
] as const;

const slidesData = [
  {
    step: "01",
    lead: "Brief once,",
    accent: "run forever.",
    description:
      "Type your company, ICP, and growth goal in plain English — like talking to a CMO. KroniQ turns that brief into channels, sequences, and messaging aligned to your voice.",
  },
  {
    step: "02",
    lead: "One memory.",
    accent: "Every campaign.",
    description:
      "Your context, outcomes, and contact history stay in one place. Every agent reads the same source of truth — no re-explaining yourself to every tool.",
  },
  {
    step: "03",
    lead: "Parallel execution.",
    accent: "Your rules.",
    description:
      "Research, outreach, and content run at the same time. Agents cross-check before anything sends. You choose full auto or approval on every action.",
  },
  {
    step: "04",
    lead: "Leads",
    accent: "while you sleep.",
    description:
      "Signals from LinkedIn and the web surface ICP matches overnight. You wake up choosing who to contact — not building lists from scratch.",
  },
];

export function ScrollingFeatureShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(0);

  const updateIndexFromScroll = useCallback(() => {
    const section = sectionRef.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const scrollable = rect.height - window.innerHeight;
    if (scrollable <= 0) return;

    const progress = Math.min(1, Math.max(0, -rect.top / scrollable));
    const idx = Math.min(
      slidesData.length - 1,
      Math.max(0, Math.floor(progress * slidesData.length)),
    );

    if (idx !== activeIndexRef.current) {
      activeIndexRef.current = idx;
      setActiveIndex(idx);
    }
  }, []);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        updateIndexFromScroll();
        raf = 0;
      });
    };

    updateIndexFromScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [updateIndexFromScroll]);

  const scrollToStep = (index: number) => {
    if (!sectionRef.current) return;
    const rect = sectionRef.current.getBoundingClientRect();
    const sectionTop = window.scrollY + rect.top;
    const sectionHeight = sectionRef.current.offsetHeight;
    const stepOffset = (index / slidesData.length) * (sectionHeight - window.innerHeight);
    smoothScrollTo(sectionTop + stepOffset);
  };

  const slideText = (slide: (typeof slidesData)[0], index: number) => (
    <div
      key={index}
      className={cn(
        "absolute inset-0 flex flex-col justify-start transition-[opacity,transform] duration-500 ease-out",
        index === activeIndex ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
      )}
      aria-hidden={index !== activeIndex}
    >
      <span className={cn(glassDark.pillCompact, "mb-4 w-fit")}>
        Step {slide.step}
      </span>
      <h2
        className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl"
        style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
      >
        {slide.lead}{" "}
        <KinsoAccentWords>{slide.accent}</KinsoAccentWords>
      </h2>
      <p className="mt-4 max-w-md text-base leading-relaxed text-white/60 sm:text-lg md:mt-6 md:text-xl">
        {slide.description}
      </p>
    </div>
  );

  const slideVisual = (
    <div className="feature-step-visual relative aspect-[4/5] w-full max-w-[480px] min-w-[280px] shrink-0">
      {FEATURE_IMAGES.map((image, index) => (
        <div
          key={image.src}
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-opacity duration-500 ease-out",
            index === activeIndex ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0",
          )}
          aria-hidden={index !== activeIndex}
        >
          {index === activeIndex || index === activeIndex + 1 || index === activeIndex - 1 ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={image.src}
              alt={image.alt}
              decoding="async"
              loading={index === 0 ? "eager" : "lazy"}
              className="feature-step-image block h-full w-full object-contain object-center"
              style={{ filter: "drop-shadow(0 32px 64px rgba(0,0,0,0.45))" }}
            />
          ) : null}
        </div>
      ))}
    </div>
  );

  return (
    <div
      id="how-it-works"
      ref={sectionRef}
      className="relative w-full bg-black"
      style={{ height: `${slidesData.length * 100}vh`, contain: "layout style" }}
    >
      <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-black text-white [contain:paint]">
        <div className="absolute top-20 left-1/2 z-10 -translate-x-1/2 md:top-24">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-white/35">
            How it works
          </p>
        </div>

        <div className="absolute top-28 left-1/2 z-10 flex -translate-x-1/2 space-x-2 md:top-32 md:left-auto md:translate-x-0 md:left-[max(1.5rem,calc(50%-640px+4rem))]">
          {slidesData.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => scrollToStep(index)}
              className={cn(
                "h-0.5 rounded-full transition-[width,background-color] duration-400 ease-out",
                index === activeIndex
                  ? "w-8 bg-gradient-to-r from-orange-400 to-emerald-400 md:w-10"
                  : "w-3 bg-white/20 md:w-4",
              )}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>

        <div className="flex w-full flex-col gap-5 px-6 pt-24 md:hidden">
          <div className="relative flex h-[min(380px,52vh)] w-full items-center justify-center px-2">
            {slideVisual}
          </div>
          <div className="relative h-44">{slidesData.map((slide, i) => slideText(slide, i))}</div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-white/35">
              {String(activeIndex + 1).padStart(2, "0")} / {String(slidesData.length).padStart(2, "0")}
            </span>
            <button
              type="button"
              onClick={() => smoothScrollToId("waitlist", -80)}
              className={cn(glassDark.button, "px-5 py-2.5 text-sm")}
            >
              Join Waitlist
            </button>
          </div>
        </div>

        <div className="mx-auto hidden h-full w-full max-w-7xl grid-cols-2 md:grid">
          <div className="relative z-20 flex flex-col justify-center border-r border-white/5 p-8 md:p-16">
            <div className="relative mt-8 h-[280px] w-full md:h-[320px]">
              {slidesData.map((slide, i) => slideText(slide, i))}
            </div>
            <div className="absolute bottom-12 left-8 z-30 flex items-center gap-4 md:left-16">
              <span className="mr-2 text-xs font-medium text-white/35">
                {String(activeIndex + 1).padStart(2, "0")} / {String(slidesData.length).padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={() => smoothScrollToId("waitlist", -80)}
                className={cn(glassDark.button, "px-5 py-2.5 text-sm")}
              >
                Join Waitlist
              </button>
            </div>
          </div>

          <div
            className="relative flex h-full min-h-0 w-full min-w-0 items-center justify-center border-t border-white/[0.06] p-6 md:border-t-0 md:p-10"
            style={kinsoGridStyle}
          >
            <div className="relative z-10 flex w-full justify-center">{slideVisual}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
