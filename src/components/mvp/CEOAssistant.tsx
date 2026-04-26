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
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-white/15 to-white/[0.06] border border-white/20 flex items-center justify-center hover:from-white/20 hover:to-white/10 transition shadow-lg hover:scale-105"
        aria-label="CEO Assistant"
      >
        <Sparkles size={22} className="text-white/90" />
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[420px] max-w-[calc(100vw-48px)] rounded-2xl bg-black/98 border border-white/[0.12] shadow-2xl overflow-hidden flex flex-col max-h-[75vh]">
          <div className="p-4 border-b border-white/[0.06] bg-gradient-to-r from-white/[0.04] to-transparent">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Sparkles size={16} className="text-white/80" />
              </div>
              <div>
                <h3 className="font-semibold text-white">CEO Assistant</h3>
                <p className="text-xs text-white/50">
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
                  className={`max-w-[90%] px-4 py-2.5 rounded-2xl text-sm ${
                    m.role === "user"
                      ? "bg-white/15 text-white/95 rounded-br-md"
                      : "bg-white/5 text-white/80 rounded-bl-md border border-white/[0.06]"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-white/[0.06] flex gap-2 bg-black/30">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={isRunning ? "Running…" : "e.g. Add a dark mode, focus on B2B..."}
              disabled={isRunning}
              className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/[0.12] text-white placeholder-white/40 focus:outline-none focus:border-white/35 focus:ring-1 focus:ring-white/10 text-sm disabled:opacity-50 transition"
            />
            <button
              onClick={handleSend}
              disabled={isRunning || !input.trim()}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-white/90 to-neutral-200 hover:from-white hover:to-neutral-100 text-black transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isRunning ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} />
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
