"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Brain, Shield, Zap } from "lucide-react";
import { PilotLoginLink } from "@/components/PilotLoginLink";

const values = [
  {
    icon: <Brain className="h-5 w-5 text-emerald-400" />,
    title: "CMO brain, not a chatbot",
    description:
      "KroniQ remembers your ICP, voice, and campaign history. Every agent reads the same memory — outreach, content, and research stay aligned without re-prompting.",
  },
  {
    icon: <Zap className="h-5 w-5 text-cyan-400" />,
    title: "Parallel execution",
    description:
      "Research, outbound, and content run at the same time. Agents cross-check each other before anything sends — you set guardrails, not micromanagement.",
  },
  {
    icon: <Shield className="h-5 w-5 text-violet-400" />,
    title: "You stay in control",
    description:
      "Full auto within rules, or approval on every send. The action queue surfaces what needs a human yes — nothing goes out without meeting your criteria.",
  },
];

export function WhyKroniQ() {
  return (
    <section
      id="why"
      className="relative scroll-mt-24 overflow-hidden border-t border-white/[0.06] bg-black py-24 md:py-32"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 50%, rgba(16,185,129,0.08) 0%, transparent 45%), radial-gradient(circle at 80% 20%, rgba(34,211,238,0.06) 0%, transparent 40%)",
        }}
        aria-hidden
      />

      <div className="section-container relative z-10 mx-auto max-w-5xl px-6">
        <div className="flex flex-col items-start gap-16 md:flex-row">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="shrink-0 md:w-72"
          >
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-emerald-400/80">
              Why KroniQ
            </p>
            <h2
              className="text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl"
              style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
            >
              Built to run
              <br />
              <span className="text-white/35">growth for you.</span>
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-white/40">
              Founders shouldn&apos;t stitch together ChatGPT, spreadsheets, and five SaaS tools just to
              get one campaign out the door.
            </p>
            <div className="mt-8">
              <a
                href="#waitlist"
                className="group inline-flex items-center gap-2 text-sm font-medium text-white/50 transition-colors hover:text-white"
              >
                Join the waitlist
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
              <span className="mx-3 text-white/20">·</span>
              <PilotLoginLink className="text-sm font-medium text-white/50 hover:text-white transition-colors">
                Pilot sign in
              </PilotLoginLink>
            </div>
          </motion.div>

          <div className="flex flex-1 flex-col">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group flex items-start gap-5 border-b border-white/[0.06] py-8 last:border-0"
              >
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] shadow-sm transition-colors group-hover:border-emerald-500/30 group-hover:bg-emerald-500/[0.06]">
                  {v.icon}
                </div>
                <div>
                  <h3 className="mb-1.5 text-base font-semibold text-white">{v.title}</h3>
                  <p className="text-sm leading-relaxed text-white/45">{v.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
