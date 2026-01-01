/**
 * KroniQ AI Smart Router Service
 * 
 * Uses DeepSeek to intelligently classify user prompts and route to optimal AI models.
 * Users always see "KroniQ AI" - the actual model selection happens transparently.
 * 
 * Daily token limits (reset at midnight UTC):
 * - FREE: 15,000 tokens/day
 * - STARTER: 50,000 tokens/day
 * - PRO: 300,000 tokens/day
 * - PREMIUM: 1,000,000 tokens/day
 */

// ========== MODEL CONFIGURATION ==========

export const MODEL_TIERS = {
    // Free models - no token cost
    FREE: [
        'deepseek/deepseek-chat',
        'meta-llama/llama-4-maverick:free',
        'google/gemini-2.5-flash-preview-05-20:free'
    ],

    // Budget models - 5-10 tokens per message
    BUDGET: [
        'deepseek/deepseek-chat-v3-0324',
        'minimax/minimax-01',
        'moonshotai/kimi-k2'
    ],

    // Mid-tier models - 15-30 tokens per message
    MID: [
        'anthropic/claude-3.5-haiku',
        'openai/gpt-4o-mini',
        'perplexity/sonar'
    ],

    // Premium models - 50-100 tokens per message
    PREMIUM: [
        'openai/gpt-4o',
        'anthropic/claude-sonnet-4',
        'x-ai/grok-3'
    ],

    // Ultra models - 150+ tokens per message
    ULTRA: [
        'anthropic/claude-opus-4',
        'openai/o1-pro'
    ]
};

// Token costs per tier (per message average)
export const TOKEN_COSTS = {
    FREE: 0,
    BUDGET: 8,
    MID: 25,
    PREMIUM: 75,
    ULTRA: 200
};

// ========== DEEPSEEK CLASSIFICATION SYSTEM ==========

// System prompt for DeepSeek to classify prompts
export const DEEPSEEK_CLASSIFIER_PROMPT = `You are KroniQ's Smart Router. Your job is to classify user messages into categories to route them to the optimal AI model.

CATEGORIES:
1. SIMPLE - Greetings, acknowledgments, short replies (hi, thanks, ok, bye, yes, no)
2. GENERAL - Facts, definitions, explanations, how-to questions
3. CODE_BASIC - Simple code snippets, syntax help, basic debugging
4. CODE_ADVANCED - Architecture, multi-file projects, complex systems
5. CREATIVE - Stories, poems, marketing copy, blog posts, creative writing
6. ANALYSIS - Data analysis, comparisons, evaluations, reasoning
7. RESEARCH - Current events, real-time info, web searches needed
8. MATH - Calculations, equations, mathematical proofs

RESPONSE FORMAT:
Return ONLY the category name in uppercase. Nothing else.

EXAMPLES:
User: "hi" → SIMPLE
User: "What is Python?" → GENERAL
User: "Write a function to sort an array" → CODE_BASIC
User: "Design a microservices architecture for an e-commerce app" → CODE_ADVANCED
User: "Write a poem about love" → CREATIVE
User: "Compare React vs Vue for a new project" → ANALYSIS
User: "What's the latest news about AI?" → RESEARCH
User: "Calculate the derivative of x^2 + 3x" → MATH`;

// Prompt categories
export type PromptCategory =
    | 'SIMPLE'
    | 'GENERAL'
    | 'CODE_BASIC'
    | 'CODE_ADVANCED'
    | 'CREATIVE'
    | 'ANALYSIS'
    | 'RESEARCH'
    | 'MATH';

// ========== FAST LOCAL CLASSIFIER ==========

/**
 * Fast local classification using regex patterns
 * Used as fallback or for quick classification
 */
export function classifyPromptLocal(prompt: string): PromptCategory {
    const lower = prompt.toLowerCase().trim();
    const len = prompt.length;

    // SIMPLE: Short greetings and acknowledgments
    if (len < 30 || /^(hi|hello|hey|thanks?|thank you|ok|okay|yes|no|sure|bye|goodbye|great|cool|nice|got it|understood)[!?.\s]*$/i.test(lower)) {
        return 'SIMPLE';
    }

    // MATH: Mathematical expressions and calculations
    if (/\b(calculate|compute|solve|derivative|integral|equation|formula|\d+\s*[\+\-\*\/\^]\s*\d+|x\^|sin|cos|tan|log|sqrt)\b/i.test(prompt)) {
        return 'MATH';
    }

    // CODE patterns
    const codePatterns = /\b(code|function|class|const|let|var|import|export|def |async|await|return|if\s*\(|for\s*\(|while\s*\(|try\s*{|catch|api|database|sql|react|vue|angular|node|python|javascript|typescript)\b/i;
    if (codePatterns.test(prompt)) {
        // Advanced code: longer prompts with architecture keywords
        if (len > 400 || /\b(architecture|design|system|microservice|full\s*stack|complete|entire|refactor|migrate|scale)\b/i.test(prompt)) {
            return 'CODE_ADVANCED';
        }
        return 'CODE_BASIC';
    }

    // RESEARCH: Current events, real-time info
    if (/\b(latest|current|today|news|2024|2025|happening|recent|update|real.?time|search|find\s+info)\b/i.test(prompt)) {
        return 'RESEARCH';
    }

    // CREATIVE: Writing tasks
    if (/\b(write|create|compose|story|poem|essay|blog|article|script|creative|fiction|narrative|imagine|describe imaginatively)\b/i.test(prompt)) {
        return 'CREATIVE';
    }

    // ANALYSIS: Comparisons, evaluations
    if (/\b(analyze|analysis|compare|vs|versus|evaluate|assess|review|pros\s+and\s+cons|trade.?offs|which\s+is\s+better)\b/i.test(prompt)) {
        return 'ANALYSIS';
    }

    return 'GENERAL';
}

// ========== MODEL SELECTION ==========

interface ModelSelection {
    model: string;
    tier: keyof typeof MODEL_TIERS;
    tokenCost: number;
    category: PromptCategory;
}

/**
 * Select the optimal model based on category and user tier
 */
export function selectModel(
    category: PromptCategory,
    userTier: 'FREE' | 'PRO' | 'PREMIUM',
    tokensRemaining: number
): ModelSelection {

    // Map categories to required model tiers
    const categoryToTier: Record<PromptCategory, keyof typeof MODEL_TIERS> = {
        'SIMPLE': 'FREE',
        'GENERAL': 'BUDGET',
        'CODE_BASIC': 'MID',
        'CODE_ADVANCED': 'PREMIUM',
        'CREATIVE': 'MID',
        'ANALYSIS': 'MID',
        'RESEARCH': 'MID', // Perplexity for research
        'MATH': 'BUDGET'
    };

    let targetTier = categoryToTier[category];

    // Downgrade based on user tier and tokens
    if (userTier === 'FREE') {
        targetTier = 'FREE';
    } else if (userTier === 'PRO') {
        // Pro can access up to MID tier
        if (targetTier === 'PREMIUM' || targetTier === 'ULTRA') {
            targetTier = 'MID';
        }
    }
    // PREMIUM users can access all tiers

    // Check if user has enough tokens
    const cost = TOKEN_COSTS[targetTier];
    if (tokensRemaining < cost && targetTier !== 'FREE') {
        // Downgrade to free if not enough tokens
        targetTier = 'FREE';
    }

    // Select specific model from tier
    let model: string;
    switch (category) {
        case 'RESEARCH':
            model = 'perplexity/sonar';
            break;
        case 'CREATIVE':
            model = targetTier === 'PREMIUM'
                ? 'anthropic/claude-sonnet-4'
                : MODEL_TIERS[targetTier][0];
            break;
        case 'CODE_ADVANCED':
            model = targetTier === 'PREMIUM'
                ? 'openai/gpt-4o'
                : MODEL_TIERS[targetTier][0];
            break;
        default:
            model = MODEL_TIERS[targetTier][0];
    }

    return {
        model,
        tier: targetTier,
        tokenCost: TOKEN_COSTS[targetTier],
        category
    };
}

// ========== MAIN ROUTER FUNCTION ==========

/**
 * Route a user prompt to the optimal model
 * Returns everything needed for the backend, but user sees "KroniQ AI"
 */
export async function routePrompt(
    prompt: string,
    userTier: 'FREE' | 'PRO' | 'PREMIUM',
    tokensRemaining: number
): Promise<ModelSelection> {

    // Use local classifier (fast)
    // In production, could use DeepSeek API for more accurate classification
    const category = classifyPromptLocal(prompt);

    return selectModel(category, userTier, tokensRemaining);
}

/**
 * Check if user can afford a message with their current tokens
 */
export function canAffordMessage(
    tokensRemaining: number,
    estimatedCost: number = TOKEN_COSTS.MID
): boolean {
    return tokensRemaining >= estimatedCost;
}

/**
 * Get the display name for the user (always "KroniQ AI")
 */
export function getDisplayName(): string {
    return 'KroniQ AI';
}

// ========== USAGE LIMITS ==========

export const USAGE_LIMITS = {
    // Daily limits that reset at midnight UTC (matching Terms of Service)
    FREE: {
        tokens: 15000,    // 15K per day
        images: 3,        // per day
        videos: 1,        // per day
        music: 3,         // per day
        ppt: 2,           // per day
        tts: 5            // per day
    },
    STARTER: {
        tokens: 50000,    // 50K per day
        images: 15,       // per day
        videos: 3,        // per day
        music: 10,        // per day
        ppt: 10,          // per day
        tts: 20           // per day
    },
    PRO: {
        tokens: 300000,   // 300K per day
        images: 50,       // per day
        videos: 10,       // per day
        music: 40,        // per day
        ppt: 30,          // per day
        tts: 75           // per day
    },
    PREMIUM: {
        tokens: 1000000,  // 1M per day
        images: 150,      // per day
        videos: 30,       // per day
        music: 120,       // per day
        ppt: 100,         // per day
        tts: 200          // per day
    }
};
