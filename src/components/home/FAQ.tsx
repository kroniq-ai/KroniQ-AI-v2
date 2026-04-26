"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { GradientFlowWord } from "@/components/home/GradientFlowWord";
import { FaqMonochromeSection } from "@/components/ui/faq-monocrhome";
import { KRONIQ_FAQ_BY_CATEGORY, KRONIQ_FAQ_CATEGORIES } from "@/lib/voyd-faq-tabs-data";

export default function FAQ() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.08 });

    return (
        <section
            id="faq"
            className="relative scroll-mt-[max(5rem,env(safe-area-inset-top))] bg-black"
            ref={ref}
        >
            <motion.div
                className="relative z-[2]"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
                <FaqMonochromeSection
                    categories={KRONIQ_FAQ_CATEGORIES}
                    faqData={KRONIQ_FAQ_BY_CATEGORY}
                    introLabel="KroniQ FAQ"
                    kicker="FAQ"
                    title={
                        <>
                            Quick <GradientFlowWord className="font-semibold">answers</GradientFlowWord>
                        </>
                    }
                    subtitle={
                        <>
                            Joined already? Open <span className="font-medium text-white/80">Leaderboard</span> in the
                            top bar for referral rules and rankings.
                        </>
                    }
                />
            </motion.div>
        </section>
    );
}
