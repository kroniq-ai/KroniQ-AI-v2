"use client";

import { useRef } from "react";
import ScrollSection from "./ScrollSection";
import { FinalCtaAtmosphere } from "@/components/home/section-atmospheres";
import { HeroGlassShell } from "@/components/ui/hero-glass-shell";
import { CountdownCta } from "@/components/ui/the-future-arrives-soon-cta";

export default function FinalCTA() {
    const sectionRef = useRef<HTMLElement>(null);

    return (
        <ScrollSection
            id="final-cta"
            ref={sectionRef}
            className="relative min-h-[min(100dvh,920px)] overflow-hidden bg-black py-28 md:py-40"
        >
            <FinalCtaAtmosphere />
            <div className="relative z-10 mx-auto flex max-w-4xl justify-center px-6">
                <HeroGlassShell
                    className="w-full max-w-3xl shadow-[0_40px_120px_-60px_rgba(0,0,0,0.95)] ring-1 ring-white/[0.07]"
                    paddingClassName="px-5 py-10 md:px-10 md:py-12"
                >
                    <CountdownCta
                        embedded
                        showCountdown={false}
                        badgeText="Early access"
                        title={
                            <>
                                <span className="text-foreground">Your autonomous AI CMO that </span>
                                <span className="gradient-heading">runs growth while you build</span>
                            </>
                        }
                        description="KroniQ learns your company once, then runs every growth campaign from that context — around the clock."
                        className="text-foreground"
                    />
                </HeroGlassShell>
            </div>
        </ScrollSection>
    );
}
