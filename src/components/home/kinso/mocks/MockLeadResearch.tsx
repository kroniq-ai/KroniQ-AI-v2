"use client";

import { motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";

import { SHOWCASE_FALLBACK_CLASS } from "../showcase-clip-styles";

export function MockLeadResearch() {
  return (
    <div className={SHOWCASE_FALLBACK_CLASS}>
        <div className="mb-4 flex items-center gap-2 rounded-2xl border border-black/[0.06] bg-white/60 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
          <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-300 via-pink-300 to-cyan-300 shadow-[0_0_16px_rgba(251,146,95,0.35)]">
            <Sparkles className="size-3.5 text-white" />
          </div>
          <span className="flex-1 text-[13px] text-black/45">Research Ryan Withers · VP Growth</span>
          <Search className="size-4 text-black/25" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-black/[0.06] bg-white/80 p-4 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.1)]"
        >
          <div className="mb-2 flex items-center gap-2">
            <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <p className="text-[12px] font-semibold text-black/85">Found angle for Ryan Withers</p>
          </div>
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-black/35">Summary</p>
          <p className="text-[13px] leading-relaxed text-black/65">
            Posted about outbound automation yesterday. Hiring first marketing lead —{" "}
            <span className="font-semibold text-orange-600">lead with ops angle, not generic pitch</span>.
          </p>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-black/[0.05] bg-black/[0.02] p-2.5">
            <div className="size-8 rounded-full bg-gradient-to-br from-sky-400 to-blue-600" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold text-black/80">LinkedIn activity · 2d ago</p>
              <p className="truncate text-[10px] text-black/40">“Looking for help finding…”</p>
            </div>
            <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[9px] font-bold text-cyan-700">
              94 fit
            </span>
          </div>
        </motion.div>
    </div>
  );
}
