"use client";

import { Moon, Sparkles } from "lucide-react";
import {
  KinsoAvatar,
  KinsoGlassWindow,
  KinsoInnerCard,
  KinsoTopicPill,
} from "@/components/ui/kinso-showcase";

const OVERNIGHT_LEADS = [
  {
    initials: "RW",
    name: "Ryan Withers",
    role: "VP Growth · Series A",
    tag: "High intent",
    variant: "cyan" as const,
    preview: "Posted about outbound automation yesterday…",
    ring: "cyan" as const,
    offset: "translate-y-0 z-30",
  },
  {
    initials: "NC",
    name: "Natasha Corwin",
    role: "Founder · B2B SaaS",
    tag: "ICP match",
    variant: "coral" as const,
    preview: "Hiring first marketing lead — perfect timing",
    ring: "coral" as const,
    offset: "translate-y-[-6px] z-20 scale-[0.98] opacity-90",
  },
  {
    initials: "EB",
    name: "Ethan Brooks",
    role: "CMO · Dev tools",
    tag: "Warm signal",
    variant: "green" as const,
    preview: "Engaged with your LinkedIn post last week",
    ring: "emerald" as const,
    offset: "translate-y-[-12px] z-10 scale-[0.96] opacity-75",
  },
];

export function GridSlide() {
  return (
    <KinsoGlassWindow
      glow="cyan"
      eyebrow={
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[12px] font-medium text-white/50">
            <Moon className="size-3.5 text-cyan-400" />
            Overnight lead sourcing
          </div>
          <KinsoTopicPill label="12 new" variant="green" />
        </div>
      }
      title="ICP matches ready at 8am"
      subtitle="Surfaced while you slept — review, approve, or auto-sequence."
      density="compact"
    >
      <div className="relative mx-auto max-w-[340px] pt-1">
        {OVERNIGHT_LEADS.map((lead) => (
          <KinsoInnerCard
            key={lead.name}
            className={`relative mb-0 flex items-start gap-3 transition-transform ${lead.offset}`}
            glow={lead.ring === "coral" ? "left" : "none"}
          >
            <KinsoAvatar initials={lead.initials} ring={lead.ring} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[13px] font-semibold text-white">{lead.name}</span>
                <KinsoTopicPill label={lead.tag} variant={lead.variant} />
              </div>
              <p className="mt-0.5 text-[10px] text-white/40">{lead.role}</p>
              <p className="mt-1.5 truncate text-[11px] text-white/55">{lead.preview}</p>
            </div>
          </KinsoInnerCard>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-500/[0.08] px-3 py-2.5">
        <Sparkles className="size-3.5 shrink-0 text-emerald-400" />
        <p className="text-[11px] leading-snug text-emerald-200/90">
          Review, approve outreach, or auto-sequence from your rules
        </p>
      </div>
    </KinsoGlassWindow>
  );
}
