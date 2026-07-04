"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { KinsoKicker } from "@/components/ui/kinso-kicker";
import { RevealFade, RevealSlide } from "@/components/ui/scroll-reveal";

export type KinsoFeatureSectionProps = {
  label: string;
  title: React.ReactNode;
  description: string;
  visual: React.ReactNode;
  reversed?: boolean;
  id?: string;
  divider?: boolean;
};

export function KinsoFeatureSection({
  label,
  title,
  description,
  visual,
  reversed = false,
  id,
  divider = true,
}: KinsoFeatureSectionProps) {
  return (
    <section id={id} className="relative scroll-mt-20 overflow-hidden bg-[#fafafa] text-[#0a0a0a]">
      <div className="section-container mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div
          className={cn(
            "grid items-start gap-12 md:gap-16 lg:grid-cols-2",
            reversed && "lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1",
          )}
        >
          <div className="max-w-lg">
            <RevealFade>
              <KinsoKicker label={label} />
            </RevealFade>
            <RevealFade delay={0.08}>
              <h2
                className="text-3xl font-bold tracking-tight text-black sm:text-4xl md:text-[2.65rem] md:leading-[1.08]"
                style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
              >
                {title}
              </h2>
            </RevealFade>
            <RevealFade delay={0.14} className="mt-5 text-base leading-relaxed text-black/55 md:text-[17px]">
              <p>{description}</p>
            </RevealFade>
          </div>
          <RevealSlide
            delay={0.1}
            from={reversed ? "left" : "right"}
            className={cn(
              "relative w-full min-w-0",
              reversed ? "lg:flex lg:justify-start" : "lg:flex lg:justify-end",
            )}
          >
            {visual}
          </RevealSlide>
        </div>
      </div>
      {divider && (
        <div className="mx-auto h-px max-w-4xl bg-gradient-to-r from-transparent via-black/[0.06] to-transparent" />
      )}
    </section>
  );
}
