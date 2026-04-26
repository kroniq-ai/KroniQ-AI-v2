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
          className="block text-sm font-medium text-white/80 mb-2"
        >
          Your idea (one sentence)
        </label>
        <input
          id="idea"
          type="text"
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="e.g. A SaaS that helps freelancers track time and invoice clients automatically"
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/25 focus:ring-1 focus:ring-white/20 transition"
          required
          disabled={isLoading}
        />
      </div>
      <div>
        <label
          htmlFor="context"
          className="block text-sm font-medium text-white/60 mb-2"
        >
          Optional context
        </label>
        <textarea
          id="context"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Target market, region, constraints..."
          rows={3}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/25 focus:ring-1 focus:ring-white/20 transition resize-none"
          disabled={isLoading}
        />
      </div>
      <div className="flex gap-3 justify-end">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-white/70 hover:text-white transition"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading || !idea.trim()}
          className="btn-gradient px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Creating…" : "Create Project"}
        </button>
      </div>
    </form>
  );
}
