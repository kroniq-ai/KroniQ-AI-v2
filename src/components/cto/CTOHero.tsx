"use client";

import { motion } from "framer-motion";

export default function CTOHero() {
    return (
        <section className="relative min-h-[80dvh] flex items-start justify-center pt-[20vh] overflow-hidden">
            {/* Background — reuse hero sphere image, positioned differently */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: "url('/hero-bg.png')",
                    backgroundSize: "cover",
                    backgroundPosition: "center 60%",
                    backgroundRepeat: "no-repeat",
                    opacity: 0.5,
                    transform: "scaleX(-1)",
                }}
            />
            <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/80 via-transparent to-black pointer-events-none" />

            <div className="section-container relative z-10 text-center">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: {},
                        visible: { transition: { staggerChildren: 0.2, delayChildren: 0.5 } },
                    }}
                >
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 15 },
                            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
                        }}
                        className="flex justify-center mb-8"
                    >
                        <span className="badge-pill">AI-Powered CTO</span>
                    </motion.div>

                    <motion.h1
                        variants={{
                            hidden: { opacity: 0, y: 30 },
                            visible: {
                                opacity: 1, y: 0,
                                transition: { duration: 1, ease: [0.25, 0.46, 0.45, 0.94] },
                            },
                        }}
                        className="mb-8 gradient-heading"
                    >
                        Meet Your AI CTO
                    </motion.h1>

                    <motion.p
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: {
                                opacity: 1, y: 0,
                                transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
                            },
                        }}
                        className="text-[16px] md:text-[18px] text-white/50 max-w-lg mx-auto leading-relaxed font-light"
                    >
                        Architecture, code, tests, security, deployment — handled by specialized AI agents.
                    </motion.p>

                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 20 },
                            visible: { opacity: 1, y: 0, transition: { duration: 0.7 } },
                        }}
                        className="mt-12 flex items-center justify-center"
                    >
                        <a
                            href="#"
                            className="inline-flex items-center gap-3 px-8 py-3.5 text-[14px] font-medium bg-white text-black rounded-full hover:shadow-[0_0_30px_rgba(255,255,255,0.12)] transition-all duration-300"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                            Book a Demo
                        </a>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
