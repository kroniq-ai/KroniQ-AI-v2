"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Loader2, Send, User } from "lucide-react";
import { useState, useEffect } from "react";
import { KroniQMarkBadgePng } from "@/components/brand/kroniq-logo-png";

export function ChatSlide() {
  const [message, setMessage] = useState("");
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => (s < 3 ? s + 1 : s));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const currentAgent = {
    name: "KroniQ CMO",
    role: "Autonomous Agent",
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-black/40 shadow-[0_24px_80px_-12px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-3xl border border-white/[0.08] rounded-3xl relative">
      
      {/* Header */}
      <div className="relative border-b border-white/[0.08] bg-white/[0.02] p-4 flex-shrink-0 backdrop-blur-xl">
        <div className="relative flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex items-center justify-center rounded-full border border-white/20 bg-black shadow-lg overflow-hidden">
              <KroniQMarkBadgePng size={24} className="opacity-100 grayscale" />
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-white tracking-tight">
                {currentAgent.name}
              </h3>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-white/50 font-medium uppercase tracking-wider">
                  {currentAgent.role}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex flex-1 flex-col gap-4 md:gap-6 p-4 md:p-6 bg-transparent overflow-y-auto" style={{ scrollbarWidth: "none" }}>
        
        {/* User Prompt */}
        <div className="flex flex-row-reverse gap-3 self-end">
          <Avatar className="h-8 w-8 border border-white/[0.12] shadow-lg flex-shrink-0 bg-white/[0.05]">
            <AvatarFallback className="bg-transparent text-white">
              <User size={14} />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-end gap-1.5">
            <div className="rounded-2xl rounded-tr-sm bg-gradient-to-br from-white/[0.12] to-white/[0.04] text-white px-4 py-3 text-[13px] shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_4px_12px_rgba(0,0,0,0.5)] font-medium leading-relaxed max-w-[280px] border border-white/[0.08] backdrop-blur-xl">
              <p>Get me 10 high-intent users from LinkedIn outreach.</p>
            </div>
          </div>
        </div>

        {/* AI Task Breakdown */}
        <div className="flex gap-3 mt-2">
          <div className="h-8 w-8 rounded-full border border-white/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] flex-shrink-0 bg-gradient-to-b from-white/[0.08] to-transparent flex items-center justify-center">
             <KroniQMarkBadgePng size={18} className="grayscale" />
          </div>
          <div className="flex flex-col gap-1.5 w-full max-w-[300px]">
            <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-white/40 ml-1">
              {currentAgent.name} • Task Breakdown
            </span>
            <div className="rounded-2xl rounded-tl-sm bg-gradient-to-b from-white/[0.05] to-black/80 backdrop-blur-2xl p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_8px_24px_rgba(0,0,0,0.6)] border border-white/[0.08] text-white/90 w-full relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
              
              <div className="flex flex-col gap-5 relative">
                {/* Vertical connecting line */}
                <div className="absolute left-[11px] top-4 bottom-4 w-px bg-gradient-to-b from-emerald-500/30 via-white/[0.08] to-transparent" />

                {/* Task 1 */}
                <div className="flex items-start gap-4 relative z-10">
                  <div className={`shrink-0 flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-300 ${step > 0 ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]' : 'bg-black border-white/[0.15]'}`}>
                    {step > 0 ? (
                      <CheckCircle2 className="size-3.5 text-emerald-400" />
                    ) : (
                      <Loader2 className="size-3.5 text-emerald-400/80 animate-spin" />
                    )}
                  </div>
                  <div className="flex flex-col pt-0.5">
                    <span className={`text-[13px] font-semibold tracking-tight transition-colors duration-300 ${step > 0 ? 'text-white' : 'text-emerald-50'}`}>Research 30 target ICPs</span>
                    <span className="text-[11px] font-medium text-white/40 mt-0.5">Analyzing LinkedIn profiles & recent activity</span>
                  </div>
                </div>

                {/* Task 2 */}
                <div className="flex items-start gap-4 relative z-10">
                  <div className={`shrink-0 flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-300 ${step > 1 ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]' : step === 1 ? 'bg-black border-white/[0.15]' : 'bg-black border-white/[0.05]'}`}>
                    {step > 1 ? (
                      <CheckCircle2 className="size-3.5 text-emerald-400" />
                    ) : step === 1 ? (
                      <Loader2 className="size-3.5 text-emerald-400/80 animate-spin" />
                    ) : (
                      <Circle className="size-3.5 text-white/10" />
                    )}
                  </div>
                  <div className="flex flex-col pt-0.5">
                    <span className={`text-[13px] font-semibold tracking-tight transition-colors duration-300 ${step > 1 ? 'text-white' : step === 1 ? 'text-emerald-50' : 'text-white/30'}`}>Generate personalized hooks</span>
                    <span className="text-[11px] font-medium text-white/40 mt-0.5">Drafting messaging based on profile data</span>
                  </div>
                </div>

                {/* Task 3 */}
                <div className="flex items-start gap-4 relative z-10">
                  <div className={`shrink-0 flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-300 ${step > 2 ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]' : step === 2 ? 'bg-black border-white/[0.15]' : 'bg-black border-white/[0.05]'}`}>
                    {step > 2 ? (
                      <CheckCircle2 className="size-3.5 text-emerald-400" />
                    ) : step === 2 ? (
                      <Loader2 className="size-3.5 text-emerald-400/80 animate-spin" />
                    ) : (
                      <Circle className="size-3.5 text-white/10" />
                    )}
                  </div>
                  <div className="flex flex-col pt-0.5">
                    <span className={`text-[13px] font-semibold tracking-tight transition-colors duration-300 ${step > 2 ? 'text-white' : step === 2 ? 'text-emerald-50' : 'text-white/30'}`}>Execute multi-touch outreach</span>
                    <span className="text-[11px] font-medium text-white/40 mt-0.5">Scheduling connections & initial messages</span>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>

      {/* Input Area */}
      <div className="border-t border-white/[0.08] bg-black/20 p-4 flex-shrink-0 backdrop-blur-2xl">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your brief..."
            className="flex-1 rounded-full border border-white/[0.1] bg-white/[0.03] px-5 py-3 text-[13px] outline-none transition-all placeholder:text-white/30 text-white focus:border-emerald-500/40 focus:bg-white/[0.05] focus:shadow-[0_0_20px_rgba(16,185,129,0.15)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
          />
          <Button
            size="icon"
            className="h-[44px] w-[44px] rounded-full bg-white text-black shadow-[0_4px_16px_rgba(255,255,255,0.2)] transition-all hover:scale-105 active:scale-95 flex-shrink-0"
            disabled={!message.trim()}
          >
            <Send className="h-4 w-4 ml-0.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
