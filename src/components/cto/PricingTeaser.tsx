"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const plans = [
    {
        name: "Starter",
        price: "Free",
        period: "",
        description: "Try KroniQ with basic features",
        features: ["1 project", "Basic architecture", "Community support", "5 deployments/mo"],
        cta: "Get Started",
        highlighted: false,
    },
    {
        name: "Pro",
        price: "$49",
        period: "/mo",
        description: "For serious builders shipping fast",
        features: ["Unlimited projects", "Full agent pipeline", "Priority support", "Unlimited deployments", "Custom domains", "Team collaboration"],
        cta: "Start Building",
        highlighted: true,
    },
    {
        name: "Enterprise",
        price: "Custom",
        period: "",
        description: "Dedicated infrastructure & support",
        features: ["Everything in Pro", "Dedicated agents", "SLA guarantee", "Custom integrations", "On-premise option", "24/7 support"],
        cta: "Contact Sales",
        highlighted: false,
    },
];

export default function PricingTeaser() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.15 });

    return (
        <section className="section-spacing relative section-bg-radial" ref={ref}>
            {/* Background — CTA singularity */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: "url('/cta-bg.png')",
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
                        Pricing
                    </span>
                    <h2 className="font-semibold gradient-heading">
                        Simple, transparent pricing
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                    {plans.map((plan, i) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 30 }}
                            animate={isInView ? { opacity: 1, y: 0 } : {}}
                            transition={{
                                delay: 0.15 + i * 0.1,
                                duration: 0.6,
                                ease: [0.25, 0.46, 0.45, 0.94],
                            }}
                            className={`glass-card flex flex-col ${plan.highlighted
                                    ? "border-white/[0.15] bg-white/[0.04]"
                                    : ""
                                }`}
                        >
                            {plan.highlighted && (
                                <span className="badge-pill self-start mb-4 text-[10px]">Most Popular</span>
                            )}
                            <h3 className="text-[15px] font-semibold text-white/70 mb-2">
                                {plan.name}
                            </h3>
                            <div className="flex items-baseline gap-1 mb-3">
                                <span className="text-[32px] font-bold text-white">
                                    {plan.price}
                                </span>
                                {plan.period && (
                                    <span className="text-[14px] text-white/30">{plan.period}</span>
                                )}
                            </div>
                            <p className="text-[13px] text-white/30 mb-6">
                                {plan.description}
                            </p>

                            <ul className="space-y-2.5 mb-8 flex-1">
                                {plan.features.map((f) => (
                                    <li key={f} className="flex items-center gap-2.5 text-[13px] text-white/40">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/25 shrink-0">
                                            <path d="M20 6L9 17l-5-5" />
                                        </svg>
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            <a
                                href="#"
                                className={`w-full text-center py-3 rounded-xl text-[13px] font-medium transition-all duration-300 ${plan.highlighted
                                        ? "bg-white text-black hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                                        : "bg-white/[0.06] text-white/60 border border-white/[0.08] hover:bg-white/[0.1] hover:text-white/80"
                                    }`}
                            >
                                {plan.cta}
                            </a>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
