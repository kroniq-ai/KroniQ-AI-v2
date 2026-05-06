"use client";

import { Card, CardHeader } from "@/components/ui/card";
import { Database } from "lucide-react";
import React from "react";

export function MemorySlide() {
  return (
    <Card className="group relative w-full h-full shadow-2xl bg-[#0f0f12] border-none overflow-hidden rounded-2xl flex flex-col">
      {/* Decorator */}
      <span className="absolute -left-px -top-px block size-2 border-l-2 border-t-2 border-white/40 z-20"></span>
      <span className="absolute -right-px -top-px block size-2 border-r-2 border-t-2 border-white/40 z-20"></span>
      <span className="absolute -bottom-px -left-px block size-2 border-b-2 border-l-2 border-white/40 z-20"></span>
      <span className="absolute -bottom-px -right-px block size-2 border-b-2 border-r-2 border-white/40 z-20"></span>

      <CardHeader className="pb-4 p-8 flex-shrink-0 z-10">
        <div className="text-white/60 flex items-center gap-2 text-sm font-medium">
          <Database className="size-4 text-white" />
          Global Memory Layer
        </div>
        <p className="mt-4 text-2xl font-bold text-white tracking-tight">
          Unified brain for all campaigns
        </p>
      </CardHeader>

      <div className="relative flex-1 border-t border-dashed border-white/10 overflow-hidden bg-[#050505]">
        <div className="absolute inset-0 [background:radial-gradient(125%_125%_at_50%_0%,transparent_40%,rgba(255,255,255,0.03),rgba(255,255,255,0.05)_125%)] pointer-events-none"></div>
        <div className="w-full h-full p-6 flex flex-col">
          {/* We only use the dark mode image since the landing page is dark */}
          <img
            src="https://tailark.com/_next/image?url=%2Fpayments.png&w=3840&q=75"
            className="w-full h-full object-cover object-top rounded-xl shadow-[0_0_40px_rgba(255,255,255,0.05)] border border-white/10"
            alt="Memory illustration"
            style={{ filter: "brightness(0.9) contrast(1.1)" }}
          />
        </div>
      </div>
    </Card>
  );
}
