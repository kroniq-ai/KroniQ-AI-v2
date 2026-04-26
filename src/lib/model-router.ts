/**
 * Model Router - selects OpenRouter model by task type and context
 * Primary: Hunter Alpha (1T params, 1M context, free) - agentic, long-horizon reasoning
 */

export type TaskType =
  | "research"
  | "product"
  | "strategy"
  | "marketing"
  | "code"
  | "copy"
  | "fallback";

export interface RouterInput {
  task_type: TaskType;
  prompt: string;
  token_estimate?: number;
  budget_hint?: "low" | "normal" | "high";
}

// Primary: Hunter Alpha - 1T params, 1M context, $0, built for agentic workflows
// Fallback: smaller free models if Hunter is unavailable
const HUNTER_ALPHA = "openrouter/hunter-alpha";
const MODELS = {
  strategy: HUNTER_ALPHA,
  research: HUNTER_ALPHA,
  product: HUNTER_ALPHA,
  marketing: HUNTER_ALPHA,
  copy: HUNTER_ALPHA,
  code: HUNTER_ALPHA,
  tiny: HUNTER_ALPHA,
  fallback: HUNTER_ALPHA,
} as const;

export function selectModel(input: RouterInput): string {
  const { task_type, token_estimate = 0, budget_hint } = input;

  // If prompt requires >1500 tokens context or multi-step planning → strategy
  if (token_estimate > 1500) {
    return MODELS.strategy;
  }

  // Budget override
  if (budget_hint === "low") return MODELS.tiny;
  if (budget_hint === "high") return MODELS.strategy;

  // Task-based routing
  switch (task_type) {
    case "research":
    case "strategy":
      return MODELS.strategy;
    case "product":
      return MODELS.research;
    case "marketing":
    case "copy":
      return MODELS.marketing;
    case "code":
      return MODELS.code;
    default:
      return MODELS.tiny;
  }
}

export function estimateTokens(text: string): number {
  // Rough: ~4 chars per token for English
  return Math.ceil(text.length / 4);
}
