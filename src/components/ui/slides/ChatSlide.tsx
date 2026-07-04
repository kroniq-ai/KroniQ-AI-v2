"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, Loader2, Send, User } from "lucide-react";
import { useState, useEffect } from "react";
import { KroniQMarkBadgePng } from "@/components/brand/kroniq-logo-png";
import { KinsoGlassWindow } from "@/components/ui/kinso-showcase";

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

  const tasks = [
    {
      title: "Research 30 target ICPs",
      sub: "Analyzing LinkedIn profiles & recent activity",
      done: step > 0,
      loading: step === 0,
      active: step >= 0,
    },
    {
      title: "Generate personalized hooks",
      sub: "Drafting messaging based on profile data",
      done: step > 1,
      loading: step === 1,
      active: step >= 1,
    },
    {
      title: "Execute multi-touch outreach",
      sub: "Scheduling connections & initial messages",
      done: step > 2,
      loading: step === 2,
      active: step >= 2,
    },
  ];

  return (
    <KinsoGlassWindow
      glow="peach"
      className="h-full"
      density="compact"
      eyebrow={
        <div className="flex items-center gap-3 pb-1">
          <div className="flex size-9 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-black/40 shadow-lg">
            <KroniQMarkBadgePng size={22} className="grayscale brightness-110" />
          </div>
          <div>
            <p className="text-[14px] font-semibold tracking-tight text-white">{currentAgent.name}</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
              {currentAgent.role}
            </p>
          </div>
        </div>
      }
    >
      <div className="relative flex h-full min-h-[280px] flex-col pb-14">
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          <div className="flex flex-row-reverse gap-2.5 self-end">
            <Avatar className="size-7 shrink-0 border border-white/[0.12] bg-white/[0.05] shadow-lg">
              <AvatarFallback className="bg-transparent text-white">
                <User size={12} />
              </AvatarFallback>
            </Avatar>
            <div className="max-w-[260px] rounded-2xl rounded-tr-md border border-white/[0.12] bg-white/[0.08] px-3.5 py-2.5 text-[12px] font-medium leading-relaxed text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_8px_24px_rgba(0,0,0,0.4)] backdrop-blur-xl">
              Get me 10 high-intent users from LinkedIn outreach.
            </div>
          </div>

          <div className="flex gap-2.5">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-white/[0.12] bg-gradient-to-b from-white/[0.1] to-transparent shadow-inner">
              <KroniQMarkBadgePng size={16} className="grayscale" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="mb-1.5 ml-0.5 block text-[9px] font-bold uppercase tracking-[0.16em] text-white/35">
                {currentAgent.name} · Task breakdown
              </span>
              <div className="relative overflow-hidden rounded-2xl rounded-tl-md border border-white/[0.1] bg-black/40 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_32px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-400/40 to-transparent" />
                <div className="relative flex flex-col gap-4">
                  <div className="absolute bottom-3 left-[11px] top-3 w-px bg-gradient-to-b from-orange-400/30 via-white/[0.08] to-transparent" />
                  {tasks.map((task) => (
                    <div key={task.title} className="relative z-10 flex items-start gap-3">
                      <div
                        className={`flex size-6 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                          task.done
                            ? "border-emerald-400/40 bg-emerald-500/15 shadow-[0_0_14px_rgba(16,185,129,0.2)]"
                            : task.loading
                              ? "border-white/20 bg-black/60"
                              : "border-white/[0.06] bg-black/40"
                        }`}
                      >
                        {task.done ? (
                          <CheckCircle2 className="size-3.5 text-emerald-400" />
                        ) : task.loading ? (
                          <Loader2 className="size-3.5 animate-spin text-orange-300/90" />
                        ) : (
                          <Circle className="size-3.5 text-white/15" />
                        )}
                      </div>
                      <div className="pt-0.5">
                        <span
                          className={`text-[12px] font-semibold tracking-tight transition-colors ${
                            task.active ? "text-white" : "text-white/30"
                          }`}
                        >
                          {task.title}
                        </span>
                        <p className="mt-0.5 text-[10px] font-medium text-white/40">{task.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-x-0 bottom-0 flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your brief…"
            className="flex-1 rounded-full border border-white/[0.12] bg-white/[0.05] px-4 py-2.5 text-[12px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] outline-none transition-all placeholder:text-white/30 focus:border-orange-400/35 focus:bg-white/[0.07] focus:shadow-[0_0_20px_rgba(251,146,60,0.12)]"
          />
          <Button
            size="icon"
            className="size-10 shrink-0 rounded-full bg-white text-black shadow-[0_4px_16px_rgba(255,255,255,0.2)] transition-transform hover:scale-105 active:scale-95"
            disabled={!message.trim()}
          >
            <Send className="ml-0.5 size-3.5" />
          </Button>
        </div>
      </div>
    </KinsoGlassWindow>
  );
}
