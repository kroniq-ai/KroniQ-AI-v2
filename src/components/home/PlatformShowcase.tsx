"use client";

import { motion } from "framer-motion";
import { LiquidGlassCard } from "@/components/ui/liquid-glass-card";
import {
  KroniqBrowserFrame,
  MockActionQueue,
  MockLeads,
  MockMissionCommand,
  MockOneMemory,
} from "@/components/home/product-ui-mocks";

const pillars = [
  {
    title: "Mission command",
    description: "Set one growth goal. KroniQ breaks it into campaigns, channels, and daily priorities.",
    label: "app.kroniqai.com — Home",
    mock: <MockMissionCommand />,
    accent: "from-amber-500/20 to-transparent",
  },
  {
    title: "Action queue",
    description: "Review outreach, copy, and sends in one place. Approve, edit, or auto-run within your rules.",
    label: "Inbox & approvals",
    mock: <MockActionQueue />,
    accent: "from-emerald-500/20 to-transparent",
  },
  {
    title: "Company memory",
    description: "ICP, tone, outcomes, and contact history — one source of truth every agent reads from.",
    label: "Memory / Context",
    mock: <MockOneMemory />,
    accent: "from-violet-500/20 to-transparent",
  },
  {
    title: "Lead pipeline",
    description: "Overnight sourcing surfaces ICP matches. You pick who to contact — not build lists from scratch.",
    label: "Leads",
    mock: <MockLeads />,
    accent: "from-cyan-500/20 to-transparent",
  },
];

export function PlatformShowcase() {
  return (
    <section id="platform" className="relative scroll-mt-24 bg-black py-20 md:py-28">
      <div className="section-divider" />

      <div className="section-container mx-auto max-w-6xl px-6">
        <motion.div
          className="mx-auto mb-14 max-w-2xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-emerald-400/80">
            The product
          </p>
          <h2
            className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}
          >
            One workspace.{" "}
            <span
              style={{
                background: "linear-gradient(90deg, #10b981 0%, #22d3ee 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Full CMO stack.
            </span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/40">
            Mission planning, approvals, memory, and lead sourcing — the same system pilot users run on{" "}
            <span className="text-white/60">app.kroniqai.com</span>. Waitlist gets you in first.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {pillars.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
            >
              <LiquidGlassCard className="h-full p-0">
                <div className={`absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${pillar.accent} opacity-60`} />
                <div className="relative p-6 md:p-8">
                  <h3
                    className="text-xl font-bold text-white md:text-2xl"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {pillar.title}
                  </h3>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/45">{pillar.description}</p>
                  <div className="mt-6">
                    <KroniqBrowserFrame label={pillar.label} density="compact">
                      {pillar.mock}
                    </KroniqBrowserFrame>
                  </div>
                </div>
              </LiquidGlassCard>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="section-divider mt-20" />
    </section>
  );
}
