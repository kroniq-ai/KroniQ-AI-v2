"use client";

import { useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getWaitlistMemberSession } from "@/lib/waitlist/client-session";
import Footer from "@/components/Footer";
import FAQ from "@/components/home/FAQ";
import FinalCTA from "@/components/home/FinalCTA";
import LandingFeaturesSection from "@/components/home/LandingFeaturesSection";
import { PlatformOverviewSection } from "@/components/home/PlatformOverviewSection";
import { VoydHeroFromTemplate } from "@/components/ui/hero-section-1";
import ReferralLeaderboardNotice from "@/components/home/ReferralLeaderboardNotice";
import { LazySection } from "@/components/ui/lazy-section";
import type { WaitlistHeroInitialStats } from "@/lib/waitlist/hero-initial-stats";

function useWaitlistTopNavReserve() {
    const [active, setActive] = useState(() =>
        typeof window !== "undefined" ? getWaitlistMemberSession() != null : false
    );
    useLayoutEffect(() => {
        const sync = () => setActive(getWaitlistMemberSession() != null);
        sync();
        window.addEventListener("kroniq-waitlist-member-change", sync);
        return () => window.removeEventListener("kroniq-waitlist-member-change", sync);
    }, []);
    return active;
}

type HomeLandingProps = { initialWaitlistStats?: WaitlistHeroInitialStats | null };

export default function HomeLanding({ initialWaitlistStats = null }: HomeLandingProps) {
    const reserveTopNav = useWaitlistTopNavReserve();
    const pathname = usePathname();

    // Hash from URL (e.g. /#faq) after client nav — scroll after layout + lazy anchor ids exist
    useLayoutEffect(() => {
        if (pathname !== "/" || typeof window === "undefined") return;
        const id = window.location.hash.replace(/^#/, "");
        if (!id) return;
        const go = () => {
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        };
        go();
        const t = setTimeout(go, 60);
        const t2 = setTimeout(go, 200);
        return () => {
            clearTimeout(t);
            clearTimeout(t2);
        };
    }, [pathname]);

    return (
        <main className="relative isolate min-h-screen overflow-x-hidden bg-background text-foreground">
            <div className="pointer-events-none fixed inset-0 z-0 bg-background" aria-hidden />

            <ReferralLeaderboardNotice />

            <div className="relative z-[1]">
                {/* Hero always mounts first — no lazy wrapper */}
                <VoydHeroFromTemplate
                    reserveTopNav={reserveTopNav}
                    initialWaitlistStats={initialWaitlistStats}
                />

                {/* Everything below mounts only as the user scrolls toward it */}
                <LazySection
                    placeholderHeight="900px"
                    rootMargin="2000px 0px"
                    anchorId="platform"
                    anchorClassName="scroll-mt-24"
                >
                    <PlatformOverviewSection />
                </LazySection>

                <LazySection
                    placeholderHeight="720px"
                    rootMargin="1400px 0px"
                    anchorId="how-it-works"
                    anchorClassName="scroll-mt-[max(5rem,env(safe-area-inset-top))]"
                >
                    <LandingFeaturesSection />
                </LazySection>

                <LazySection placeholderHeight="48px" rootMargin="300px 0px">
                    <div
                        className="pointer-events-none h-12 bg-background md:h-20"
                        aria-hidden
                    />
                </LazySection>

                <LazySection
                    placeholderHeight="800px"
                    rootMargin="2000px 0px"
                    anchorId="faq"
                    anchorClassName="scroll-mt-[max(5rem,env(safe-area-inset-top))]"
                >
                    <FAQ />
                </LazySection>
            </div>

            {/* Footer region — lazy too */}
            <LazySection
                placeholderHeight="600px"
                rootMargin="1500px 0px"
                className="relative z-[2] border-t border-white/[0.06] bg-background pb-[max(6.5rem,env(safe-area-inset-bottom)+5.25rem)]"
            >
                <div id="landing-footer-region">
                    <FinalCTA />
                    <Footer />
                </div>
            </LazySection>
        </main>
    );
}
