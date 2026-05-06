"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { HeroWaitlistForm } from "@/components/HeroWaitlistForm";
import { ArrowRight } from "lucide-react";

export function FinalCTA() {
    const ref = useRef<HTMLElement>(null);
    const inView = useInView(ref, { once: true, amount: 0.2 });

    return (
        <section
            ref={ref}
            className="relative overflow-hidden"
            style={{ background: "#080808" }}
        >
            {/* Emerald radial glow */}
            <div
                aria-hidden
                className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-[700px] h-[500px] opacity-60"
                style={{
                    background: "radial-gradient(ellipse 50% 60% at 50% 50%, rgba(16,185,129,0.14) 0%, transparent 70%)",
                    filter: "blur(60px)",
                }}
            />

            <div className="section-container relative z-10 py-28 md:py-36 lg:py-44">
                <motion.div
                    className="mx-auto max-w-2xl text-center"
                    initial={{ opacity: 0, y: 24 }}
                    animate={inView ? { opacity: 1, y: 0 } : undefined}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                    <span className="pill-label mb-6 mx-auto">
                        <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Private beta — join now
                    </span>

                    <h2
                        className="text-white mt-4"
                        style={{
                            fontFamily: "var(--font-heading)",
                            fontWeight: 800,
                            fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
                            letterSpacing: "-0.03em",
                            lineHeight: 1.08,
                        }}
                    >
                        Your AI CMO is{" "}
                        <span className="gradient-heading">waiting for a brief.</span>
                    </h2>

                    <p className="mt-5 text-[16px] md:text-[17px] leading-relaxed max-w-lg mx-auto"
                       style={{ color: "rgba(255,255,255,0.45)" }}>
                        Join the waitlist. Top 5 on the referral leaderboard get free Pro access at launch.
                    </p>

                    <div className="mt-10 max-w-md mx-auto">
                        <HeroWaitlistForm />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
