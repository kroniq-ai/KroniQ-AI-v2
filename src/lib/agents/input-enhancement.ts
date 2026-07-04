/**
 * Input enhancement - interprets and enhances user prompts before sending to the model
 * Expands shorthand, adds clarity, structures vague requests
 */

export interface EnhancedInput {
  enhanced: string;
  intent: "question" | "plan_change" | "general";
}

const SHORTHAND_MAP: Record<string, string> = {
  "is it good": "Is this idea viable and worth pursuing? I'd like your honest assessment.",
  "good idea": "Is this a good idea? Please share your thoughts on viability and potential.",
  "thoughts": "What are your thoughts on this? I'd like your feedback and perspective.",
  "feedback": "I'd like your feedback on this. What works, what doesn't, and what would you improve?",
  "opinion": "What's your opinion on this? I value your perspective.",
  "worth it": "Is this worth pursuing? I'd like to know if the effort would pay off.",
  "make sense": "Does this make sense? I'd like your take on whether the approach is sound.",
  "viable": "Is this viable? Please assess feasibility and potential challenges.",
  "feasible": "Is this technically and commercially feasible? Share your assessment.",
};

const PLAN_PREFIXES = [
  "add ", "include ", "prioritize ", "focus on ", "change ", "update ",
  "remove ", "replace ", "make ", "create ", "generate ", "build ",
];

export function enhanceUserInput(
  rawPrompt: string,
  agent: string
): EnhancedInput {
  const trimmed = rawPrompt.trim();
  if (!trimmed) return { enhanced: trimmed, intent: "general" };

  const lower = trimmed.toLowerCase();

  // Detect intent
  const isPlanChange = PLAN_PREFIXES.some((p) => lower.startsWith(p)) ||
    /\b(add|include|prioritize|change|update|remove|replace)\b/i.test(trimmed);
  const isQuestion = lower.endsWith("?") ||
    /(what do you think|do you think|is my idea|tell me if|give me feedback|your opinion|your thoughts|should i|is it good|worth it|make sense|feedback|thoughts|opinion|advice|evaluate|assess|rate)/i.test(trimmed);

  let intent: EnhancedInput["intent"] = "general";
  if (isQuestion && !isPlanChange) intent = "question";
  else if (isPlanChange) intent = "plan_change";

  // Expand shorthand for very short prompts
  let enhanced = trimmed;
  if (trimmed.length < 30) {
    for (const [key, expansion] of Object.entries(SHORTHAND_MAP)) {
      if (lower === key || lower === key + "?" || lower === key + " ?") {
        enhanced = expansion;
        break;
      }
      if (lower.includes(key) && trimmed.length < 20) {
        enhanced = expansion;
        break;
      }
    }
  }

  // Add agent-specific context for vague prompts
  if (enhanced.length < 50 && intent === "question") {
    const agentContext: Record<string, string> = {
      research: "Consider market size, competition, and trends in your response.",
      product: "Consider product-market fit, user needs, and MVP scope in your response.",
      cto: "Consider technical feasibility, stack choices, and build complexity in your response.",
      cmo: "Consider go-to-market, positioning, and marketing channels in your response.",
      cfo: "Consider unit economics, pricing, and financial viability in your response.",
    };
    const hint = agentContext[agent];
    if (hint) {
      enhanced = `${enhanced}\n\n(Please address this in the context of the project idea. ${hint})`;
    }
  }

  return { enhanced, intent };
}
