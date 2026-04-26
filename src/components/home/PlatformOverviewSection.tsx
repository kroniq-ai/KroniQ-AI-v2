"use client";

import { LandingSectionHeader } from "@/components/home/LandingSectionHeader";
import { PlatformSectionAtmosphere } from "@/components/home/section-atmospheres";
import { PlatformFeatureCard, type GridFeature } from "@/components/ui/grid-feature-cards";
import { motion } from "framer-motion";
import { Compass, ListChecks, RefreshCw, Search } from "lucide-react";

const LANES: GridFeature[] = [
    {
        title: "Mission command",
        description: "Describe a growth goal in one sentence — KroniQ turns it into a plan you can review.",
        icon: Compass,
    },
    {
        title: "Action queue",
        description: "Approve or reject every outreach before it sends. Nothing goes out without you.",
        icon: ListChecks,
    },
    {
        title: "Lead sourcing",
        description: "Bright Data + LinkedIn — no manual prospecting. Your ICP, surfaced continuously.",
        icon: Search,
    },
    {
        title: "Memory loop",
        description: "Every outcome feeds back into the next mission so campaigns compound instead of reset.",
        icon: RefreshCw,
    },
];

const container = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.07, delayChildren: 0.05 },
    },
};

const item = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] as const },
    },
};

export function PlatformOverviewSection() {
    return (
        <section id="platform" className="relative scroll-mt-24 overflow-hidden bg-black py-20 text-foreground md:py-32">
            <PlatformSectionAtmosphere />
            <div className="relative z-10 mx-auto max-w-6xl px-6">
                <LandingSectionHeader
                    kicker="The KroniQ workspace"
                    title="A mission-driven command center — not a chatbot."
                    subtitle="Give KroniQ a growth goal, review the actions it proposes, and let it execute."
                />

                <div className="relative mt-12 md:mt-14">
                    <div className="relative rounded-[30px] border border-white/[0.1] bg-black p-2.5 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.9)] sm:p-3">
                        <motion.div
                            className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-2.5"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                            variants={container}
                        >
                            {LANES.map((lane) => (
                                <motion.div key={lane.title} className="flex min-h-0" variants={item}>
                                    <PlatformFeatureCard feature={lane} className="h-full min-h-0 flex-1" />
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
