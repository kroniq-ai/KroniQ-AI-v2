"use client";

import { useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getWaitlistMemberSession } from "@/lib/waitlist/client-session";
import { VoydHeroFromTemplate } from "@/components/ui/hero-section-1";
import { IntegrationsSection } from "@/components/home/IntegrationsSection";
import { HeroLightBridge } from "@/components/home/kinso/HeroLightBridge";
import { KinsoProductFeatures } from "@/components/home/kinso/KinsoProductFeatures";
import { LightToDarkBridge } from "@/components/home/kinso/LightToDarkBridge";
import { KinsoFeaturesBridge } from "@/components/home/kinso/KinsoFeaturesBridge";
import { ScrollingFeatureShowcase } from "@/components/home/ScrollingFeatureShowcase";
import { FAQSection } from "@/components/home/FAQ";
import { KroniqTestimonialSection } from "@/components/home/KroniqTestimonialSection";
import { CtaPersonaMarquee } from "@/components/home/CtaPersonaMarquee";
import { GridCtaBand } from "@/components/home/GridCtaBand";
import { CinematicFooterKroniq } from "@/components/home/CinematicFooterKroniq";

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

export default function HomeLanding() {
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
        <main className="relative isolate overflow-x-clip bg-black">

            <VoydHeroFromTemplate
                reserveTopNav={reserveTopNav}
            />

            <HeroLightBridge />

            <IntegrationsSection theme="light" />

            <KinsoProductFeatures />

            <LightToDarkBridge />

            <KinsoFeaturesBridge />

            <ScrollingFeatureShowcase />

            <KroniqTestimonialSection />

            <FAQSection />

            <CtaPersonaMarquee />

            <GridCtaBand />

            <CinematicFooterKroniq />
        </main>
    );
}
