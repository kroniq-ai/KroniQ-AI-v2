"use client";

import { Database } from "lucide-react";
import {
  KinsoGlassWindow,
  KinsoInnerCard,
  KinsoTopicPill,
} from "@/components/ui/kinso-showcase";

const MEMORY_FIELDS = [
  { label: "ICP", value: "B2B SaaS founders · 10–50 employees", variant: "cyan" as const },
  { label: "Voice", value: "Direct, technical, no fluff", variant: "coral" as const },
  { label: "Goal", value: "10 high-intent pilots / month", variant: "green" as const },
];

const OUTCOME_CHIPS = [
  { label: "ICP", variant: "cyan" as const },
  { label: "Voice", variant: "coral" as const },
  { label: "Outcomes", variant: "green" as const },
];

export function MemorySlide() {
  return (
    <KinsoGlassWindow
      glow="emerald"
      eyebrow={
        <div className="mb-2 flex items-center gap-2 text-[12px] font-medium text-white/50">
          <Database className="size-3.5 text-emerald-400" />
          Company memory
        </div>
      }
      title="One source of truth for every agent"
      subtitle="Every campaign reads the same context — no re-briefing."
    >
      <KinsoInnerCard glow="left" className="space-y-3">
        {MEMORY_FIELDS.map((field) => (
          <div
            key={field.label}
            className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5"
          >
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
                {field.label}
              </span>
              <KinsoTopicPill label="Synced" variant={field.variant} />
            </div>
            <p className="text-[12px] font-medium leading-snug text-white/80">{field.value}</p>
          </div>
        ))}
      </KinsoInnerCard>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="h-14 rounded-xl border border-violet-400/20 bg-gradient-to-br from-violet-500/15 to-transparent" />
        <div className="h-14 rounded-xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/15 to-transparent" />
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {OUTCOME_CHIPS.map((chip) => (
          <KinsoTopicPill key={chip.label} label={chip.label} variant={chip.variant} />
        ))}
      </div>
    </KinsoGlassWindow>
  );
}
