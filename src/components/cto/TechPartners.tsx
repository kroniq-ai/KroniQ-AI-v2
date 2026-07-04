"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const partners = [
    "Next.js", "React", "TypeScript", "PostgreSQL",
    "Prisma", "Docker", "AWS", "Vercel",
    "Supabase", "Stripe", "Tailwind", "Node.js",
];

export default function TechPartners() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.2 });

    return (
        <section className="section-spacing relative" ref={ref}>
            <div className="section-container relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <span className="text-[11px] tracking-[0.3em] uppercase text-white/25 font-medium">
                        Built With
                    </span>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto"
                >
                    {partners.map((name, i) => (
                        <motion.div
                            key={name}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={isInView ? { opacity: 1, scale: 1 } : {}}
                            transition={{ delay: 0.3 + i * 0.04, duration: 0.4 }}
                            className="px-5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[13px] font-medium text-white/30 hover:text-white/50 hover:border-white/[0.12] hover:bg-white/[0.05] transition-all duration-300"
                        >
                            {name}
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
