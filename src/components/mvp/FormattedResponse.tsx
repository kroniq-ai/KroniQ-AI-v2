"use client";

/**
 * Renders agent direct_response with ChatGPT/Perplexity-style polish:
 * - Content blocks with rounded backgrounds and copy buttons
 * - Headers with emojis and bold
 * - Horizontal dividers
 * - Bullet lists with proper spacing
 * - Bold key terms
 */

import CopyableBlock from "./CopyableBlock";

interface Props {
  content: string;
  className?: string;
  showCopyButton?: boolean;
}

// Simple **bold** parser
function renderWithBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold text-zinc-100">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export default function FormattedResponse({ content, className = "", showCopyButton = true }: Props) {
  if (!content) return null;

  const blocks = content.split(/\n\n+/);

  return (
    <div className={`space-y-6 text-[15px] leading-[1.65] text-zinc-200 ${className}`}>
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // Horizontal divider
        if (/^[-_]{3,}$/.test(trimmed)) {
          return <hr key={i} className="border-zinc-700/60 my-6" />;
        }

        const lines = trimmed.split("\n");

        // Header: ## Section, or **Bold title**, or emoji-prefixed short line
        const isHeader = lines.length === 1 && (
          /^##\s/.test(trimmed) ||
          /^\*\*[^*]+\*\*/.test(trimmed) ||
          (/^[^\w\s]/.test(trimmed.slice(0, 2)) && trimmed.length < 80)
        );
        if (isHeader && lines.length === 1) {
          return (
            <h3 key={i} className="text-zinc-100 font-semibold text-base flex items-center gap-2">
              {renderWithBold(trimmed)}
            </h3>
          );
        }

        // Numbered list (1️⃣, 2., etc.)
        const isNumberedList = lines.length > 1 && lines.every((l) => /^(\d+[.)]\s|[•\-*]\s)/.test(l.trim()));
        const isBulletList = lines.length > 1 && lines.some((l) => /^[•▪\-*]\s/.test(l.trim()) || /^[^\w\s]/.test(l.trim().slice(0, 2)));

        if ((isNumberedList || isBulletList) && lines.length > 1) {
          const listContent = (
            <ul className="space-y-3 pl-0 list-none">
              {lines.map((line, j) => {
                const lineTrimmed = line.trim();
                if (!lineTrimmed) return null;
                const hasLeading = /^[•▪\-*]\s/.test(lineTrimmed) || /^[^\w\s]/.test(lineTrimmed);
                return (
                  <li key={j} className="flex gap-3 text-zinc-200">
                    {!hasLeading && <span className="text-zinc-500 shrink-0">•</span>}
                    <span>{renderWithBold(lineTrimmed)}</span>
                  </li>
                );
              })}
            </ul>
          );
          return showCopyButton ? (
            <CopyableBlock key={i} content={trimmed}>
              {listContent}
            </CopyableBlock>
          ) : (
            <div key={i} className="rounded-2xl bg-zinc-800/60 border border-zinc-700/40 p-5">
              {listContent}
            </div>
          );
        }

        // Callout: starts with emoji (e.g. "🔥 If someone...")
        const calloutMatch = trimmed.match(/^([^\w\s]{1,4})\s+([\s\S]+)$/);
        if (calloutMatch && calloutMatch[2].length > 20) {
          const calloutContent = (
            <p className="text-zinc-200 leading-relaxed">
              <span className="mr-2">{calloutMatch[1]}</span>
              {renderWithBold(calloutMatch[2])}
            </p>
          );
          return showCopyButton ? (
            <CopyableBlock key={i} content={trimmed} className="border-l-4 border-l-neutral-500/50">
              {calloutContent}
            </CopyableBlock>
          ) : (
            <div key={i} className="rounded-2xl bg-zinc-800/60 border border-zinc-700/40 border-l-4 border-l-neutral-500/50 p-5">
              {calloutContent}
            </div>
          );
        }

        // Regular paragraph(s)
        const paraContent = (
          <div className="space-y-3">
            {lines.map((line, j) => {
              const lineTrimmed = line.trim();
              if (!lineTrimmed) return null;
              return (
                <p key={j} className="text-zinc-200 leading-relaxed">
                  {renderWithBold(lineTrimmed)}
                </p>
              );
            })}
          </div>
        );

        return showCopyButton ? (
          <CopyableBlock key={i} content={trimmed}>
            {paraContent}
          </CopyableBlock>
        ) : (
          <div key={i} className="rounded-2xl bg-zinc-800/60 border border-zinc-700/40 p-5">
            {paraContent}
          </div>
        );
      })}
    </div>
  );
}
