"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const agents = [
    {
        name: "Architect Agent",
        role: "System Design",
        description: "Designs your database schemas, API architecture, and infrastructure topology from a single requirement.",
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <path d="M3 9h18M9 3v18" />
            </svg>
        ),
    },
    {
        name: "Code Agent",
        role: "Full-Stack Development",
        description: "Writes production-grade frontend and backend code. Complete features with proper error handling and documentation.",
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
            </svg>
        ),
    },
    {
        name: "Test Agent",
        role: "Quality Assurance",
        description: "Generates unit, integration, and E2E test suites. Catches regressions before they reach production.",
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
        ),
    },
    {
        name: "Security Agent",
        role: "Vulnerability Scanning",
        description: "Scans for vulnerabilities, implements authentication flows, and ensures compliance with security standards.",
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
    },
    {
        name: "Deploy Agent",
        role: "CI/CD & Infrastructure",
        description: "Sets up deployment pipelines, containerization, and monitoring. Your code goes from commit to production automatically.",
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
        ),
    },
    {
        name: "Docs Agent",
        role: "Documentation",
        description: "Auto-generates API documentation, READMEs, inline comments, and developer onboarding guides.",
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
            </svg>
        ),
    },
];

export default function AgentsList() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.1 });

    return (
        <section className="section-spacing relative section-bg-dots" ref={ref}>
            {/* Background image — diagonal ridges */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: "url('/vision-bg.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    opacity: 0.4,
                }}
            />
            <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black via-black/50 to-black pointer-events-none" />

            <div className="section-container relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16 md:mb-20"
                >
                    <span className="block text-[11px] tracking-[0.3em] uppercase text-white/30 mb-5 font-medium">
                        The Team
                    </span>
                    <h2 className="font-semibold">
                        Six specialized agents,<br className="hidden sm:block" /> one unified pipeline
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                    {agents.map((agent, i) => (
                        <motion.div
                            key={agent.name}
                            initial={{ opacity: 0, y: 25 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{
                                delay: 0.1 + i * 0.08,
                                duration: 0.5,
                                ease: [0.25, 0.46, 0.45, 0.94],
                            }}
                            className="glass-card group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="icon-container w-11 h-11">
                                    {agent.icon}
                                </div>
                                <span className="text-[10px] tracking-[0.15em] uppercase text-white/20 font-medium">
                                    {agent.role}
                                </span>
                            </div>
                            <h3 className="text-[17px] font-semibold mb-2 group-hover:text-white transition-colors">
                                {agent.name}
                            </h3>
                            <p className="text-[13px] text-white/30 leading-[1.7] group-hover:text-white/40 transition-colors">
                                {agent.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
