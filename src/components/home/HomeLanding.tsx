"use client";

import { useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getWaitlistMemberSession } from "@/lib/waitlist/client-session";
import { VoydHeroFromTemplate } from "@/components/ui/hero-section-1";
import { IntegrationsSection } from "@/components/home/IntegrationsSection";
import { ScrollingFeatureShowcase } from "@/components/home/ScrollingFeatureShowcase";
import { FAQSection } from "@/components/home/FAQ";
import { CtaPersonaMarquee } from "@/components/home/CtaPersonaMarquee";
import { CinematicFooterKroniq } from "@/components/home/CinematicFooterKroniq";
import ReferralLeaderboardNotice from "@/components/home/ReferralLeaderboardNotice";
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

    useLayoutEffect(() => {
        if (pathname !== "/" || typeof window === "undefined") return;
        const id = window.location.hash.replace(/^#/, "");
        if (!id) return;
        const go = () => {
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        };
        go();
        const t = setTimeout(go, 80);
        const t2 = setTimeout(go, 250);
        return () => { clearTimeout(t); clearTimeout(t2); };
    }, [pathname]);

    return (
        <main className="relative isolate overflow-x-clip" style={{ background: "#000000" }}>
            <ReferralLeaderboardNotice />

            {/* 1 — HERO */}
            <VoydHeroFromTemplate
                reserveTopNav={reserveTopNav}
                initialWaitlistStats={initialWaitlistStats}
            />

            {/* 2 — INTEGRATIONS: dual scrolling Flaticon badge rows */}
            <IntegrationsSection />

            {/* 3 — HOW IT WORKS: 4-step sticky scroll */}
            <ScrollingFeatureShowcase />

            {/* 4 — FAQ */}
            <FAQSection />

            {/* 5 — CTA + persona marquee */}
            <CtaPersonaMarquee />

            {/* 6 — CINEMATIC FOOTER */}
            <CinematicFooterKroniq />
        </main>
    );
}
