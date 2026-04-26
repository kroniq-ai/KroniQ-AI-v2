"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, ChevronDown } from "lucide-react";
import { tryParseJSON } from "@/lib/parse-json";
import ResearchCard from "@/components/mvp/renderers/ResearchCard";
import ProductCard from "@/components/mvp/renderers/ProductCard";
import TechCard from "@/components/mvp/renderers/TechCard";
import MarketingCard from "@/components/mvp/renderers/MarketingCard";
import FinanceCard from "@/components/mvp/renderers/FinanceCard";

interface Job {
  id: string;
  agent_name: string;
  prompt?: string | null;
  status: string;
  response_ref?: { raw?: string; error?: string };
  created_at?: string;
}

interface AgentChatPanelProps {
  agent: string;
  agentLabel: string;
  jobs: Job[];
  project: {
    competitors?: Array<{ name: string; url?: string; summary?: string }>;
    mvp_features?: Array<{ title: string; description?: string; priority: number; est_hours?: number }>;
    marketing_assets?: Array<{ type: string; content: string; metadata?: Record<string, unknown> }>;
    financials?: { pricing_options?: unknown[]; unit_economics?: unknown; initial_costs?: unknown[] } | null;
  };
  logoUrl?: string | null;
  onGenerateLogo?: () => Promise<void>;
  onSend: (prompt: string) => Promise<void>;
  disabled?: boolean;
  isRunning?: boolean;
  placeholder?: string;
}

export default function AgentChatPanel({
  agent,
  agentLabel,
  jobs,
  project,
  logoUrl,
  onGenerateLogo,
  onSend,
  disabled = false,
  isRunning = false,
  placeholder,
}: AgentChatPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const busy = sending || isRunning;

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 100);
  }, []);

  // Jobs for this agent: has prompt or response, chronological order (oldest first)
  const agentJobs = jobs
    .filter((j) => j.agent_name === agent && (j.prompt || j.response_ref?.raw || j.response_ref?.error))
    .sort((a, b) => new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime());

  // If we have a job matching our pending prompt, we're showing it from the list — clear optimistic state
  const hasMatchingJob = pendingPrompt && agentJobs.some((j) => j.prompt === pendingPrompt);
  const showPendingBlock = pendingPrompt && !hasMatchingJob;

  const scrollToBottom = useCallback(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, []);

  const scrollKey = `${agentJobs.length}-${showPendingBlock}-${agentJobs.map((j) => `${j.id}:${j.status}`).join(",")}`;
  useEffect(() => {
    scrollToBottom();
  }, [scrollKey, scrollToBottom]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll);
    return () => el.removeEventListener("scroll", checkScroll);
  }, [scrollKey, checkScroll]);

  useEffect(() => {
    if (hasMatchingJob) {
      setPendingPrompt(null);
      setSendError(null);
      return;
    }
    if (!busy && pendingPrompt && !sendError) {
      setPendingPrompt(null);
    }
  }, [busy, pendingPrompt, sendError, hasMatchingJob]);

  const handleSend = async () => {
    if (!input.trim() || disabled || busy) return;
    const text = input.trim();
    setInput("");
    setPendingPrompt(text);
    setSendError(null);
    setSending(true);
    try {
      await onSend(text);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const renderAssistantContent = (job: Job) => {
    if (job.response_ref?.error) {
      return <p className="text-neutral-400 text-sm">{job.response_ref.error}</p>;
    }
    const raw = job.response_ref?.raw;
    if (!raw) {
      if (job.status === "running") {
        return (
          <p className="text-white/50 text-sm flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-white/50 animate-pulse" />
            Thinking…
          </p>
        );
      }
      return <p className="text-zinc-500 text-sm">No response</p>;
    }
    const parsed = tryParseJSON<unknown>(raw);
    if (!parsed) {
      return (
        <div className="space-y-2">
          <p className="text-neutral-400 text-xs">Response could not be parsed as JSON. Raw output:</p>
          <pre className="text-zinc-400 text-xs whitespace-pre-wrap break-words max-h-48 overflow-y-auto font-mono">
            {raw.slice(0, 2000)}{raw.length > 2000 ? "…" : ""}
          </pre>
        </div>
      );
    }

    switch (agent) {
      case "research":
        return (
          <ResearchCard
            data={parsed as Parameters<typeof ResearchCard>[0]["data"]}
            competitors={
              (parsed as { market_research?: { top_competitors?: typeof project.competitors }; top_competitors?: typeof project.competitors })?.market_research?.top_competitors ??
              (parsed as { top_competitors?: typeof project.competitors })?.top_competitors ??
              project.competitors ??
              []
            }
          />
        );
      case "product":
        return (
          <ProductCard
            data={parsed as Parameters<typeof ProductCard>[0]["data"]}
            mvpFeatures={project.mvp_features}
            logoUrl={logoUrl}
            onGenerateLogo={onGenerateLogo}
          />
        );
      case "cto":
        return (
          <TechCard
            data={parsed as Parameters<typeof TechCard>[0]["data"]}
            codeScaffold={
              (parsed as { code_scaffold?: string })?.code_scaffold ??
              project.marketing_assets?.find((a) => a.type === "code_scaffold")?.content
            }
          />
        );
      case "cmo":
        return (
          <MarketingCard
            data={parsed as Parameters<typeof MarketingCard>[0]["data"]}
            assets={project.marketing_assets?.filter((a) => a.type === "social_post" || a.type === "email_template")}
          />
        );
      case "cfo":
        return (
          <FinanceCard
            data={(parsed ?? project.financials) as Parameters<typeof FinanceCard>[0]["data"]}
          />
        );
      default:
        return <pre className="text-xs text-white/60 overflow-auto">{JSON.stringify(parsed, null, 2).slice(0, 500)}…</pre>;
    }
  };

  return (
    <div className="relative flex flex-col flex-1 min-h-0 w-full overflow-hidden bg-zinc-950">
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 basis-0 w-full overflow-y-auto overflow-x-hidden overscroll-contain px-6 py-8 space-y-8"
        style={{ scrollBehavior: "smooth", WebkitOverflowScrolling: "touch", touchAction: "pan-y" } as React.CSSProperties}
      >
        {agentJobs.length === 0 && !showPendingBlock && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-zinc-400 text-sm mb-1">No messages yet</p>
            <p className="text-zinc-500 text-xs">Send a prompt below to get started</p>
          </div>
        )}
        {agentJobs.map((job) => (
          <div key={job.id} className="space-y-6 max-w-3xl mx-auto">
            {job.prompt && (
              <div className="flex justify-end">
                <div className="max-w-[80%] px-5 py-3 rounded-full bg-zinc-800 text-zinc-100 text-sm">
                  {job.prompt}
                </div>
              </div>
            )}
            <div className="flex justify-start w-full">
              <div className="w-full max-w-3xl">
                {renderAssistantContent(job)}
              </div>
            </div>
          </div>
        ))}
        {showPendingBlock && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex justify-end">
              <div className="max-w-[80%] px-5 py-3 rounded-full bg-zinc-800 text-zinc-100 text-sm">
                {pendingPrompt}
              </div>
            </div>
            <div className="flex justify-start w-full">
              <div className="w-full">
                {sendError ? (
                  <p className="text-neutral-400 text-sm">{sendError}</p>
                ) : (
                  <p className="text-zinc-500 text-sm flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-zinc-500 animate-pulse" />
                    Thinking…
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Scroll to bottom */}
      {showScrollBtn && (
        <button
          type="button"
          onClick={scrollToBottom}
          className="absolute bottom-24 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-700 flex items-center justify-center shadow-lg transition z-10"
        >
          <ChevronDown size={18} />
        </button>
      )}

      {/* Input bar - ChatGPT style pill */}
      <div className="flex-shrink-0 px-6 pb-6 pt-2">
        <div className="max-w-3xl mx-auto flex items-end gap-2 rounded-2xl border border-zinc-700 bg-zinc-900/80 px-4 py-2 focus-within:border-zinc-600 focus-within:ring-1 focus-within:ring-zinc-600 transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={placeholder ?? `Ask ${agentLabel} anything…`}
            disabled={disabled || busy}
            rows={1}
            className="flex-1 min-h-[48px] max-h-32 px-2 py-3 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none resize-none disabled:opacity-50 bg-transparent"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={disabled || busy || !input.trim()}
            className="shrink-0 w-10 h-10 rounded-full bg-zinc-700 hover:bg-zinc-600 text-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition mb-1"
          >
            {busy ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
