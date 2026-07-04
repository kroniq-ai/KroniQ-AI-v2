/**
 * Output enhancement - beautifies agent responses for ChatGPT-style polish
 * Adds emojis, improves spacing, formats for readability
 */

import { callOpenRouter } from "@/lib/openrouter";

export type AgentType = "research" | "product" | "cto" | "cmo" | "cfo";

const BEAUTIFY_PROMPT = `You are a response formatter. Rewrite the following text to be more readable and engaging.

Rules:
- Add relevant emojis (🔍 for insights, ✅ for pros, ❌ for cons, 💡 for ideas, 📊 for data, etc.)
- Use clear paragraph breaks (double newline between paragraphs)
- Use bullet points (•) for lists
- Keep the same meaning and key information
- Make it scannable - short paragraphs, clear structure
- Do NOT add markdown, code fences, or JSON - output plain text only

Output ONLY the rewritten text, nothing else.`;

// Emoji mapping for common patterns (order matters - more specific first)
const EMOJI_PATTERNS: Array<{ pattern: RegExp; emoji: string }> = [
  { pattern: /^(key finding|key findings|main finding)/i, emoji: "🔍" },
  { pattern: /^(important|critical|crucial)/i, emoji: "⚠️" },
  { pattern: /^(pros?|advantages?|strengths?)/i, emoji: "✅" },
  { pattern: /^(cons?|disadvantages?|weaknesses?|risks?)/i, emoji: "❌" },
  { pattern: /^(summary|in summary|to summarize|bottom line)/i, emoji: "📋" },
  { pattern: /^(conclusion|in conclusion|overall)/i, emoji: "🎯" },
  { pattern: /^(recommendation|i recommend|suggest)/i, emoji: "💡" },
  { pattern: /^(note|keep in mind|remember)/i, emoji: "📌" },
  { pattern: /^(next step|next steps|action items?)/i, emoji: "▶️" },
  { pattern: /^(market|tam|opportunity)/i, emoji: "📊" },
  { pattern: /^(competition|competitors?)/i, emoji: "🏆" },
  { pattern: /^(customer|user|target)/i, emoji: "👤" },
  { pattern: /^(first|1\.|1\))/, emoji: "1️⃣" },
  { pattern: /^(second|2\.|2\))/, emoji: "2️⃣" },
  { pattern: /^(third|3\.|3\))/, emoji: "3️⃣" },
];

// Agent-specific emoji for opening (adds personality)
const AGENT_EMOJI: Record<AgentType, string> = {
  research: "🔬",
  product: "📦",
  cto: "⚙️",
  cmo: "📢",
  cfo: "💰",
};

function addEmojiToLine(line: string, agent: AgentType): string {
  const trimmed = line.trim();
  if (!trimmed) return line;

  // Skip if line already starts with emoji or bullet
  if (/^[\p{Emoji}\p{Emoji_Presentation}\u2600-\u26FF\u2700-\u27BF•▪️▪▪-]/u.test(trimmed)) {
    return line;
  }

  for (const { pattern, emoji } of EMOJI_PATTERNS) {
    if (pattern.test(trimmed)) {
      const indent = line.match(/^\s*/)?.[0] ?? "";
      return `${indent}${emoji} ${trimmed}`;
    }
  }

  // Convert plain bullets to emoji bullets
  const bulletMatch = trimmed.match(/^[-*•]\s+(.+)$/);
  if (bulletMatch) {
    const indent = line.match(/^\s*/)?.[0] ?? "";
    return `${indent}• ${bulletMatch[1]}`;
  }

  return line;
}

function normalizeSpacing(text: string): string {
  // Collapse 3+ newlines to 2 (paragraph break)
  const out = text.replace(/\n{3,}/g, "\n\n");
  // Ensure consistent spacing after sentences (optional - can make it feel robotic)
  // out = out.replace(/\.\s+/g, ".  "); // double space after period - maybe skip
  return out.trim();
}

function formatParagraphs(text: string, agent: AgentType): string {
  const lines = text.split("\n");
  const enhanced: string[] = [];
  for (const line of lines) {
    enhanced.push(addEmojiToLine(line, agent));
  }
  return enhanced.join("\n");
}

/**
 * Enhance direct_response text for display
 * - Improves paragraph spacing
 * - Adds contextual emojis
 * - Formats bullet lists
 */
export function enhanceDirectResponse(
  text: string,
  agent: AgentType
): string {
  if (!text || typeof text !== "string") return text;

  let out = normalizeSpacing(text);
  out = formatParagraphs(out, agent);

  return out;
}

/**
 * Enhance full JSON response - processes direct_response field
 */
export function enhanceAgentResponse(
  rawResponse: string,
  agent: AgentType
): string {
  try {
    const parsed = JSON.parse(rawResponse) as Record<string, unknown>;
    const directResponse = parsed.direct_response;
    if (typeof directResponse === "string") {
      parsed.direct_response = enhanceDirectResponse(directResponse, agent);
      return JSON.stringify(parsed);
    }
  } catch {
    // Not JSON or invalid - return as-is
  }
  return rawResponse;
}

/**
 * Optional LLM pass to beautify response - adds emojis, improves flow
 * Enable with ENABLE_LLM_BEAUTIFY=true for ChatGPT-style polish
 */
export async function beautifyWithLLM(
  text: string,
  apiKey?: string
): Promise<string> {
  if (!text || text.length < 50) return text;
  try {
    const result = await callOpenRouter({
      task_type: "copy",
      systemPrompt: BEAUTIFY_PROMPT,
      userPrompt: text,
      apiKey,
    });
    return result.trim().slice(0, 4000); // Cap length
  } catch {
    return text;
  }
}
