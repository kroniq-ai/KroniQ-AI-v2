"use client";

import { Footer } from "@/components/Footer";
import CTOHero from "@/components/cto/CTOHero";
import CapabilitiesGrid from "@/components/cto/CapabilitiesGrid";
import DemoCarousel from "@/components/cto/DemoCarousel";
import AgentsList from "@/components/cto/AgentsList";
import TechPartners from "@/components/cto/TechPartners";
import PricingTeaser from "@/components/cto/PricingTeaser";

export default function CTOPageClient() {
    return (
        <>
            <main>
                <CTOHero />
                <CapabilitiesGrid />
                <DemoCarousel />
                <AgentsList />
                <TechPartners />
                <PricingTeaser />
            </main>
            <Footer />
        </>
    );
}
