"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const milestones = [
    { quarter: "Q3 2025", title: "Foundation", description: "Core agent framework, architecture engine, initial code generation." },
    { quarter: "Q4 2025", title: "Multi-Agent System", description: "Security, DevOps, and Testing agents. Full pipeline integration.", active: true },
    { quarter: "Q1 2026", title: "Public Beta", description: "Open access, template marketplace, community feedback." },
    { quarter: "Q2 2026", title: "Enterprise Launch", description: "SSO, RBAC, custom agent training, private deployment." },
    { quarter: "Q3 2026", title: "Agent Marketplace", description: "Third-party agents, plugin ecosystem, API platform." },
];

export default function RoadmapTimeline() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.15 });

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
                        Roadmap
                    </span>
                    <h2>Where we&apos;re headed.</h2>
                </motion.div>

                <div className="relative">
                    {/* Timeline line */}
                    <motion.div
                        initial={{ scaleY: 0 }}
                        animate={isInView ? { scaleY: 1 } : {}}
                        transition={{ duration: 1.2, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                        style={{ transformOrigin: "top" }}
                        className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-white/[0.05]"
                    />

                    <div className="space-y-10">
                        {milestones.map((m, i) => (
                            <motion.div
                                key={m.quarter}
                                initial={{ opacity: 0, x: -12 }}
                                animate={isInView ? { opacity: 1, x: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.15 + i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
                                className="flex gap-6 relative"
                            >
                                <div className={`w-[15px] h-[15px] rounded-full border-2 mt-[2px] shrink-0 transition-colors ${m.active
                                        ? "border-[var(--accent)]/50 bg-[var(--accent)]/15"
                                        : "border-white/[0.08] bg-transparent"
                                    }`} />

                                <div>
                                    <span className={`text-[11px] tracking-[0.15em] uppercase font-medium ${m.active ? "text-[var(--accent)]/50" : "text-white/15"
                                        }`}>
                                        {m.quarter}
                                    </span>
                                    <h3 className="text-[16px] font-semibold mt-1 mb-1.5 text-white/90">{m.title}</h3>
                                    <p className="text-[14px] leading-[1.7] text-[var(--fg-subtle)]">{m.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
