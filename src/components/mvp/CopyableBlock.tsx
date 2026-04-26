"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface Props {
  children: React.ReactNode;
  content?: string;
  className?: string;
}

export default function CopyableBlock({ children, content, className = "" }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = content ?? (typeof children === "string" ? children : "");
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`group relative rounded-2xl bg-zinc-800/80 border border-zinc-700/50 overflow-hidden ${className}`}>
      <div className="p-5 pr-12">{children}</div>
      <button
        type="button"
        onClick={handleCopy}
        className="absolute top-3 right-3 p-2 rounded-lg bg-zinc-700/50 hover:bg-zinc-600/50 text-zinc-400 hover:text-zinc-200 transition opacity-0 group-hover:opacity-100"
        title="Copy"
      >
        {copied ? <Check size={14} className="text-neutral-200" /> : <Copy size={14} />}
      </button>
    </div>
  );
}
