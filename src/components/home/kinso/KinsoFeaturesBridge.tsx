"use client";

import { glassDark } from "@/components/ui/glass-surface";

/** Dark bridge into sticky scroll — matches Kinso "FEATURES" divider */
export function KinsoFeaturesBridge() {
  return (
    <section className="relative border-t border-white/[0.06] bg-black py-16 md:py-20">
      <div className="section-container mx-auto max-w-3xl px-6 text-center">
        <div className="mb-8 flex items-center justify-center gap-4">
          <span className="h-px w-12 bg-gradient-to-r from-transparent to-white/12 md:w-20" aria-hidden />
          <span className={`${glassDark.pill} text-[10px] font-bold uppercase tracking-[0.2em] text-white/45`}>
            Features
          </span>
          <span className="h-px w-12 bg-gradient-to-l from-transparent to-white/12 md:w-20" aria-hidden />
        </div>
        <p className="text-lg leading-relaxed text-white/50 md:text-xl">
          KroniQ brings together outreach, content, lead sourcing, and daily audits — one autonomous
          CMO that learns your goals and runs in parallel.
        </p>
      </div>
    </section>
  );
}
