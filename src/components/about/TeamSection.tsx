"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function TeamSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.3 });

    return (
        <section className="section-spacing relative" ref={ref}>
            <div className="section-container max-w-xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16 md:mb-20 px-4"
                >
                    <span className="block text-[11px] tracking-[0.3em] uppercase text-[var(--accent)] mb-6">
                        Team
                    </span>
                    <h2>The people behind KroniQ.</h2>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="bento-card text-center max-w-[300px] mx-auto"
                >
                    <div className="w-20 h-20 rounded-full bg-white/[0.03] border border-white/[0.06] mx-auto mb-6 flex items-center justify-center text-2xl font-semibold text-white/20">
                        A
                    </div>
                    <h3 className="text-[16px] font-semibold mb-1 text-white/90">Atire</h3>
                    <span className="text-[10px] tracking-[0.15em] uppercase text-white/20 block mb-3 font-medium">
                        Founder & CEO
                    </span>
                    <p className="text-[14px] text-[var(--fg-subtle)] leading-[1.7]">
                        Building the future of autonomous software development.
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
