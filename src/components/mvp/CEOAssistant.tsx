"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Loader2 } from "lucide-react";

interface CEOAssistantProps {
  projectId?: string;
  onCommand?: (command: string) => void;
  isRunning?: boolean;
}

const QUICK_BUTTONS = [
  "Generate full plan",
  "Add more competitors",
  "Create landing page",
  "Make social posts",
  "Refine MVP features",
  "Add pricing options",
];

export default function CEOAssistant({
  onCommand,
  isRunning = false,
}: CEOAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    Array<{ role: "user" | "assistant"; text: string }>
  >([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const addAssistantReply = (text: string) => {
    setMessages((m) => [...m, { role: "assistant", text }]);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    if (onCommand) {
      onCommand(text);
      addAssistantReply(
        "Got it. Running KroniQ with your request — usually 1–2 minutes. Watch the tabs above for updates."
      );
    } else {
      addAssistantReply(
        "Click Run KroniQ above to generate outputs."
      );
    }
  };

  const handleQuickButton = (cmd: string) => {
    setMessages((m) => [...m, { role: "user", text: cmd }]);
    if (onCommand) {
      onCommand(cmd);
      addAssistantReply(
        "Got it. Running KroniQ — watch the tabs above for updates."
      );
    } else {
      addAssistantReply("Click Run KroniQ above to execute.");
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-black/60 backdrop-blur-2xl border border-white/10 flex items-center justify-center hover:bg-black/80 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.6)] group hover:scale-105"
        aria-label="CEO Assistant"
      >
        <Sparkles size={22} className="text-white/80 group-hover:text-emerald-400 transition-colors" />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[420px] max-w-[calc(100vw-48px)] rounded-3xl bg-black/80 backdrop-blur-3xl border border-white/[0.08] shadow-[0_16px_64px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.1)] overflow-hidden flex flex-col max-h-[75vh]">
          <div className="p-5 border-b border-white/[0.08] bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[14px] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                <Sparkles size={18} className="text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              </div>
              <div>
                <h3 className="font-semibold text-white tracking-tight">CEO Assistant</h3>
                <p className="text-[12px] font-medium text-white/50 tracking-wide">
                  Orchestrates all agents — ask for anything
                </p>
              </div>
            </div>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[140px]"
          >
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-white/70">
                  Quick actions or type your own:
                </p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_BUTTONS.map((btn) => (
                    <button
                      key={btn}
                      onClick={() => handleQuickButton(btn)}
                      disabled={isRunning}
                      className="text-xs px-3 py-2 rounded-xl bg-white/5 border border-white/[0.12] hover:bg-white/10 hover:border-white/[0.18] transition disabled:opacity-50 disabled:cursor-not-allowed text-white/90"
                    >
                      {btn}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-5 py-3 rounded-2xl text-[13px] font-medium leading-relaxed shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_4px_16px_rgba(0,0,0,0.3)] border ${
                    m.role === "user"
                      ? "bg-white/10 backdrop-blur-md text-white rounded-tr-sm border-white/[0.08]"
                      : "bg-white/[0.03] text-white/80 rounded-tl-sm border-white/[0.04]"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 border-t border-white/[0.08] bg-black/40">
            <div className="flex items-end gap-2 rounded-[20px] border border-white/[0.08] bg-black/60 px-2 py-2 focus-within:border-white/20 focus-within:shadow-[0_0_20px_rgba(255,255,255,0.05),inset_0_1px_0_rgba(255,255,255,0.1)] transition-all duration-300">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={isRunning ? "Running…" : "e.g. Add a dark mode..."}
                disabled={isRunning}
                className="flex-1 min-h-[40px] px-3 bg-transparent text-white placeholder-white/40 focus:outline-none text-[13px] font-medium disabled:opacity-50 tracking-wide"
              />
              <button
                onClick={handleSend}
                disabled={isRunning || !input.trim()}
                className="shrink-0 w-10 h-10 rounded-[14px] bg-white/10 hover:bg-emerald-500/20 text-white hover:text-emerald-400 hover:border hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300"
              >
                {isRunning ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
