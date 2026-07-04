import type { Metadata } from "next";
import Header from "@/components/Header";
import { Footer } from "@/components/Footer";
import MissionSection from "@/components/about/MissionSection";
import RoadmapTimeline from "@/components/about/RoadmapTimeline";
import TeamSection from "@/components/about/TeamSection";
import InvestorContact from "@/components/about/InvestorContact";
import { openGraphImage, siteName } from "@/lib/seo/site";

const title = "About KroniQ";
const description =
  "The mission, team, and roadmap behind KroniQ: autonomous AI CMO and growth for startups and enterprises.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/about" },
  openGraph: {
    title: `${title} | ${siteName}`,
    description,
    url: "/about",
    type: "website",
    siteName,
    images: [openGraphImage],
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} | ${siteName}`,
    description,
    images: [openGraphImage.url],
  },
};

import { CinematicFooterKroniq } from "@/components/home/CinematicFooterKroniq";

export default function AboutPage() {
    return (
        <div className="bg-black text-white min-h-screen">
            <main className="pt-32 pb-20">
                <MissionSection />
                <RoadmapTimeline />
                <TeamSection />
                <InvestorContact />
            </main>
            <CinematicFooterKroniq />
        </div>
    );
}
