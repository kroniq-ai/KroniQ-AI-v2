"use client";

import { useState } from "react";

interface IdeaInputProps {
  onSubmit: (idea: string, context?: string) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export default function IdeaInput({
  onSubmit,
  onCancel,
  isLoading = false,
}: IdeaInputProps) {
  const [idea, setIdea] = useState("");
  const [context, setContext] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim()) return;
    onSubmit(idea.trim(), context.trim() || undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="idea"
          className="block text-sm font-semibold text-white/90 mb-2.5 tracking-tight"
        >
          Your idea (one sentence)
        </label>
        <input
          id="idea"
          type="text"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="e.g. A SaaS that helps freelancers track time and invoice clients automatically"
          className="w-full px-5 py-4 bg-black/40 backdrop-blur-md border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.5)] rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.03] transition-all duration-300"
          required
          disabled={isLoading}
        />
      </div>
      <div>
        <label
          htmlFor="context"
          className="block text-sm font-semibold text-white/60 mb-2.5 tracking-tight"
        >
          Optional context
        </label>
        <textarea
          id="context"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Target market, region, constraints..."
          rows={3}
          className="w-full px-5 py-4 bg-black/40 backdrop-blur-md border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.5)] rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-white/20 focus:bg-white/[0.03] transition-all duration-300 resize-none"
          disabled={isLoading}
        />
      </div>
      <div className="flex gap-4 justify-end pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-full text-sm font-semibold text-white/50 hover:text-white transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading || !idea.trim()}
          className="px-8 py-3 rounded-full bg-white text-black font-bold text-sm shadow-[0_4px_16px_rgba(255,255,255,0.2)] hover:bg-white/90 hover:shadow-[0_8px_24px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {isLoading ? "Creating…" : "Create Project"}
        </button>
      </div>
    </form>
  );
}
