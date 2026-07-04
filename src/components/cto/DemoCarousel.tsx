"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const steps = [
    {
        step: "01",
        title: "Describe your product",
        description: "Tell KroniQ what you want to build in plain English. No technical specs needed — just your vision.",
        visual: "→  \"Build a SaaS analytics dashboard with auth, billing, and real-time charts\"",
    },
    {
        step: "02",
        title: "AI architects the system",
        description: "KroniQ generates your full system architecture — database schemas, API routes, component trees, and deployment config.",
        visual: "→  schema.prisma · routes/ · components/ · docker-compose.yml",
    },
    {
        step: "03",
        title: "Code is generated & tested",
        description: "Production-grade code across your stack. Every function tested. Every edge case handled. Docs auto-generated.",
        visual: "→  147 files · 12,400 lines · 94 tests passing · 100% coverage",
    },
    {
        step: "04",
        title: "Deploy & iterate",
        description: "One-click deployment to your infrastructure. Then iterate in real-time — describe changes, see them live.",
        visual: "→  Deployed to production · CI/CD configured · Monitoring active",
    },
];

export default function DemoCarousel() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.15 });

    return (
        <section className="section-spacing relative section-bg-radial" ref={ref}>
            <div className="section-container relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16 md:mb-20"
                >
                    <span className="block text-[11px] tracking-[0.3em] uppercase text-white/30 mb-5 font-medium">
                        How It Works
                    </span>
                    <h2 className="font-semibold">
                        From idea to production<br className="hidden sm:block" /> in four steps
                    </h2>
                </motion.div>

                <div className="max-w-3xl mx-auto space-y-4">
                    {steps.map((item, i) => (
                        <motion.div
                            key={item.step}
                            initial={{ opacity: 0, x: -30 }}
                            animate={isInView ? { opacity: 1, x: 0 } : {}}
                            transition={{
                                delay: 0.15 + i * 0.12,
                                duration: 0.6,
                                ease: [0.25, 0.46, 0.45, 0.94],
                            }}
                            className="glass-card group"
                        >
                            <div className="flex items-start gap-5">
                                {/* Step number */}
                                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                                    <span className="text-[13px] font-mono font-semibold text-white/50">{item.step}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-[17px] font-semibold mb-2 group-hover:text-white transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="text-[13px] text-white/30 leading-[1.7] mb-3">
                                        {item.description}
                                    </p>
                                    <div className="text-[12px] font-mono text-white/20 bg-white/[0.02] border border-white/[0.04] rounded-lg px-3 py-2">
                                        {item.visual}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
