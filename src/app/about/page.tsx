import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MissionSection from "@/components/about/MissionSection";
import RoadmapTimeline from "@/components/about/RoadmapTimeline";
import TeamSection from "@/components/about/TeamSection";
import InvestorContact from "@/components/about/InvestorContact";

export const metadata: Metadata = {
    title: "About",
    description:
        "The mission, team, and roadmap behind KroniQ - AI intelligence for startups and enterprises.",
};

export default function AboutPage() {
    return (
        <>
            <Header />
            <main className="pt-[var(--header-height)]">
                <MissionSection />
                <RoadmapTimeline />
                <TeamSection />
                <InvestorContact />
            </main>
            <Footer />
        </>
    );
}
