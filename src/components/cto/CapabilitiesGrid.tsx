"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const capabilities = [
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="12" cy="12" r="3" />
                <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
            </svg>
        ),
        title: "System Architecture",
        description: "Auto-generates your database schemas, API routes, microservice topology, and infrastructure — from a single description.",
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
            </svg>
        ),
        title: "Full-Stack Code",
        description: "Writes production-grade frontend, backend, and infrastructure code. Complete features with tests, not snippets.",
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
        ),
        title: "Automated Testing",
        description: "Generates unit, integration, and E2E tests. Runs them, catches regressions, and ensures quality before deployment.",
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
        ),
        title: "Security Audit",
        description: "Scans for vulnerabilities, implements auth flows, applies encryption, and ensures compliance with security standards.",
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
        ),
        title: "CI/CD Pipeline",
        description: "Sets up continuous integration, deployment pipelines, containerization, and infrastructure-as-code automatically.",
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
        ),
        title: "Real-Time Iteration",
        description: "Instant feedback loops. Describe changes in natural language, see them implemented and deployed in real-time.",
    },
];

export default function CapabilitiesGrid() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.15 });

    return (
        <section className="section-spacing relative section-bg-dots" ref={ref}>
            {/* Background — flowing ribbons (darkened) */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: "url('/command-bg.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    opacity: 0.3,
                }}
            />
            <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black via-black/60 to-black pointer-events-none" />

            <div className="section-container relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-16 md:mb-20"
                >
                    <span className="block text-[11px] tracking-[0.3em] uppercase text-white/30 mb-5 font-medium">
                        What KroniQ Does
                    </span>
                    <h2 className="font-semibold">
                        A full technical team,<br className="hidden sm:block" /> powered by AI
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                    {capabilities.map((cap, i) => (
                        <motion.div
                            key={cap.title}
                            initial={{ opacity: 0, y: 25 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{
                                delay: 0.1 + i * 0.08,
                                duration: 0.5,
                                ease: [0.25, 0.46, 0.45, 0.94],
                            }}
                            className="glass-card group"
                        >
                            <div className="icon-container mb-5">
                                {cap.icon}
                            </div>
                            <h3 className="text-[17px] font-semibold mb-3 group-hover:text-white transition-colors">
                                {cap.title}
                            </h3>
                            <p className="text-[13px] text-white/30 leading-[1.7] group-hover:text-white/40 transition-colors">
                                {cap.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
