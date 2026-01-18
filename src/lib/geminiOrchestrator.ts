/**
 * ==================================================================================
 * KroniQ AI ORCHESTRATOR - The Brain of Super KroniQ
 * ==================================================================================
 * 
 * OVERVIEW:
 * Uses Gemini 2.0 Flash Experimental (free) as intelligent middleware to:
 * - Interpret user requests and determine intent
 * - Manage conversation context (long-term & short-term)
 * - Generate enhanced prompts for downstream models
 * - Route to optimal AI providers (cost-aware!)
 * - Validate responses and handle retries
 * - Analyze images, videos, and files (multimodal)
 * 
 * ==================================================================================
 * COST-AWARE SMART ROUTING SYSTEM
 * ==================================================================================
 * 
 * PRICING (Monthly Subscription):
 * - FREE:    $0/mo
 * - STARTER: $5/mo  → Budget: $4.99
 * - PRO:     $12/mo → Budget: $11.99
 * - PREMIUM: $24/mo → Budget: $23.99
 * 
 * ROUTING LOGIC:
 * 1. User makes a request (chat/image/video/TTS)
 * 2. Orchestrator checks user's current month spend vs tier budget
 * 3. If (remainingBudget >= modelCost) → Use premium model
 * 4. If (remainingBudget < modelCost) → Switch to FREE fallback (silently!)
 * 5. User sees "unlimited" usage - just quality may vary
 * 
 * FREE FALLBACK MODELS (100% Free - No Cost):
 * - Chat:  google/gemini-2.0-flash-exp:free, deepseek/deepseek-chat:free
 * - Image: pixazo-flux-schnell (Pixazo API - completely free)
 * - Video: hunyuan-video (HuggingFace - free tier)
 * - TTS:   Deepgram ($200 free credits - essentially unlimited)
 * 
 * PREMIUM MODELS (Cost Money - Use When Budget Available):
 * - Chat:  Claude, GPT-4o, Sonnet ($0.005 - $0.30/msg)
 * - Image: KIE API - Flux, Seedream, Imagen ($0.10 - $0.75/img)
 * - Video: KIE API - Sora, Wan, Kling ($0.50 - $1.50/vid)
 * - Music: KIE API - Suno ($0.50 - $0.75/song)
 * 
 * MAXIMUM PREMIUM USAGE (Before Switching to Free):
 * 
 * STARTER ($5/mo = $4.99 budget):
 * - ~50 premium images @ $0.10 OR
 * - ~10 premium videos @ $0.50 OR
 * - ~25 images + 5 videos
 * - Unlimited: chat, TTS (free)
 * 
 * PRO ($12/mo = $11.99 budget):
 * - ~60 premium images @ $0.20 OR
 * - ~15 premium videos @ $0.75 OR
 * - ~40 images + 8 videos
 * - Unlimited: chat, TTS (free)
 * 
 * PREMIUM ($24/mo = $23.99 budget):
 * - ~50 premium images @ $0.50 OR
 * - ~16 premium videos @ $1.50 OR
 * - ~30 images + 10 videos
 * - Unlimited: chat, TTS (free)
 * 
 * KEY FUNCTIONS:
 * - getModelCostUSD(modelId) → Returns cost per request
 * - getTierBudget(tier) → Returns monthly budget for tier
 * - selectModelWithinBudget(preferredModel, remainingBudget, taskType) → Smart selection
 * 
 * ==================================================================================
 */


import { supabase } from './supabaseClient';
import {
    TIER_LIMITS,
    WARNING_THRESHOLD,
    getModelCapabilitiesPrompt,
    type UserTier as CapabilityUserTier
} from './modelCapabilities';

// ===== CONFIGURATION =====

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Main orchestration model - Gemini 2.0 Flash (free, multimodal)
const ORCHESTRATOR_MODEL = 'google/gemini-2.0-flash-exp:free';
const TONGYI_RESEARCH_MODEL = 'alibaba/tongyi-deepresearch-30b-a3b:free';

// Feature flags (for future enabling without refactoring)
const FEATURE_FLAGS = {
    web_research: true, // Enabled for Web Search and Deep Research
    response_validation: true, // Enable response quality checking
    auto_retry: true, // Enable automatic retry on poor responses
    context_summarization: true, // Enable auto-summarization of old messages
};

// ===== TYPES =====

export type TaskType = 'chat' | 'image' | 'image_edit' | 'video' | 'ppt' | 'tts' | 'music';
export type UserTier = 'free' | 'starter_2' | 'starter' | 'pro' | 'premium';

export interface OrchestratorConfig {
    webResearch?: boolean;
    forceTaskType?: TaskType;
    userTier?: UserTier;
}

// ===== TIER-BASED MODEL ROUTING =====
// Maps complexity + tier to appropriate models
// Comprehensive model selection based on task type, complexity, and user tier
// 
// AVAILABLE MODELS:
// ================
// CHAT (70+ models via OpenRouter):
//   - OpenAI: GPT-5.2 Pro, GPT-5 Nano, GPT-4o, GPT-4o Mini, ChatGPT-4o Latest, GPT Codex 5.1
//   - Anthropic: Claude 4.5 Opus, Claude 4 Sonnet, Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus, Claude 3 Haiku
//   - Google: Gemini 3, Gemini 3 Pro Preview, Gemini 2.5 Flash Lite, Gemini 2.0 Flash, Gemma 3 27B
//   - Meta: Llama 4 Maverick, Llama 4 Scout, Llama 3.3 70B, Llama 3.2 90B Vision
//   - xAI: Grok 4.1 Fast, Grok 4, Grok 3, Grok 3 Mini
//   - DeepSeek: DeepSeek V3.2, DeepSeek V3.1, DeepSeek R1, DeepSeek Chat, DeepSeek Coder
//   - Perplexity: Sonar Deep Research, Sonar Pro Search, Sonar Reasoning Pro, Sonar Reasoning
//   - Mistral: Ministral 3 14B, Ministral 3 8B, Mistral 7B, Devstral
//   - Qwen: Qwen 2.5 72B, Qwen3 VL 8B, Qwen3 Coder Plus, Qwen Plus, Qwen Turbo
//   - MiniMax: MiniMax M1, MiniMax-01
//   - MoonshotAI: Kimi K2 Thinking, Kimi K2
//   - NVIDIA: Nemotron Super 49B, Nemotron Nano 9B V2
//   - Amazon: Nova Premier, Nova 2 Lite
//   - Cohere: Command A, Command R+, Command R
//
// IMAGE (18+ models via KIE API):
//   - Flux: Kontext Pro, Kontext Max, Pro, Dev, Max, SDXL
//   - OpenAI: GPT-4o Image, GPT Image 1
//   - Google: Imagen 4 Ultra, Imagen 3, Nano Banana
//   - ByteDance: Seedream V4, Seedream 4.5, Seedream 5
//   - xAI: Grok Imagine
//   - Other: Nano Banana Pro, Midjourney V6, DALL-E 3, DALL-E 2
//
// VIDEO (16+ models via KIE API):
//   - Google: Veo 3.1 Fast, Veo 3.1 Quality, Veo 2
//   - OpenAI: Sora 2, Sora 1
//   - ByteDance: Seedance 1.5 Pro, Wan 2.6, Wan 2.5
//   - Kling: Kling 2.6, Kling 2.5 Turbo Pro, Kling 3.0
//   - xAI: Grok Video
//   - Runway: Gen-3, Gen-3 Turbo
//   - Other: Pika 2.1, Luma Dream Machine
//
// MUSIC (3 models via KIE API):
//   - Suno V5, Suno V4, Udio V1
//
// TTS (8 voices via Deepgram):
//   - Thalia, Arcas, Luna, Orion, Stella, Helios, Athena, Zeus

const TIER_MODEL_ROUTING = {
    chat: {
        simple: {
            free: 'google/gemini-2.0-flash-exp:free',
            starter: 'deepseek/deepseek-chat:free',
            pro: 'anthropic/claude-3.5-haiku',
            premium: 'openai/gpt-4o-mini',
        },
        medium: {
            free: 'google/gemini-2.0-flash-exp:free',
            starter: 'deepseek/deepseek-chat-v3.1',
            pro: 'anthropic/claude-3.5-sonnet',
            premium: 'openai/gpt-4o',
        },
        complex: {
            free: 'google/gemini-2.0-flash-exp:free',
            starter: 'qwen/qwen-2.5-72b-instruct',
            pro: 'anthropic/claude-3.5-sonnet',
            premium: 'anthropic/claude-opus-4.1',
        },
        reasoning: {
            free: 'google/gemini-2.0-flash-exp:free',
            starter: 'deepseek/deepseek-r1',
            pro: 'perplexity/sonar-reasoning-pro',
            premium: 'perplexity/sonar-deep-research',
        },
    },
    code: {
        simple: {
            free: 'deepseek/deepseek-chat:free',
            starter: 'deepseek/deepseek-coder',
            pro: 'qwen/qwen3-coder-plus',
            premium: 'openai/gpt-5.1-codex-max',
        },
        complex: {
            free: 'deepseek/deepseek-chat:free',
            starter: 'deepseek/deepseek-coder',
            pro: 'anthropic/claude-3.5-sonnet',
            premium: 'openai/gpt-5.1-codex-max',
        },
    },
    image: {
        simple: {
            free: 'flux-dev',
            starter: 'flux-kontext-pro',
            pro: '4o-image',
            premium: 'nano-banana-pro',
        },
        complex: {
            free: 'flux-dev',
            starter: 'seedream/4.5-text-to-image',
            pro: 'bytedance/seedream-v4-text-to-image',
            premium: 'google/imagen4-ultra',
        },
        artistic: {
            free: 'flux-dev',
            starter: 'flux-kontext-pro',
            pro: 'grok-imagine/text-to-image',
            premium: 'midjourney/v6',
        },
    },
    video: {
        simple: {
            free: 'veo3_fast',
            starter: 'veo3_fast',
            pro: 'wan/2-5-text-to-video',
            premium: 'wan/2-6-text-to-video',
        },
        complex: {
            free: 'veo3_fast',
            starter: 'kling-2.6/text-to-video',
            pro: 'sora-2-text-to-video',
            premium: 'sora-2-text-to-video',
        },
        cinematic: {
            free: 'veo3_fast',
            starter: 'runway-gen3-turbo',
            pro: 'bytedance/seedance-1.5-pro',
            premium: 'sora-2-text-to-video',
        },
    },
    music: {
        simple: {
            free: 'suno-v4',
            starter: 'suno-v4',
            pro: 'suno-v5',
            premium: 'suno-v5',
        },
        complex: {
            free: 'suno-v4',
            starter: 'udio-v1',
            pro: 'suno-v5',
            premium: 'suno-v5',
        },
    },
    tts: {
        default: {
            free: 'aura-2-thalia-en',
            starter: 'aura-2-thalia-en',
            pro: 'aura-2-orion-en',
            premium: 'aura-2-zeus-en',
        },
    },
};

// ===== COST-AWARE SMART ROUTING =====
// API costs per request (in USD) - Updated January 2026
// The orchestrator uses these to pick the most cost-effective model while meeting quality needs

const MODEL_COSTS: Record<string, number> = {
    // CHAT MODELS (cost per message, estimated at ~1000 tokens)
    'google/gemini-2.0-flash-exp:free': 0.00,
    'deepseek/deepseek-chat:free': 0.00,
    'deepseek/deepseek-chat-v3.1': 0.001,
    'deepseek/deepseek-r1': 0.002,
    'deepseek/deepseek-coder': 0.001,
    'qwen/qwen-2.5-72b-instruct': 0.003,
    'qwen/qwen3-coder-plus': 0.004,
    'anthropic/claude-3.5-haiku': 0.005,
    'anthropic/claude-3.5-sonnet': 0.03,
    'anthropic/claude-opus-4.1': 0.30,
    'openai/gpt-4o-mini': 0.005,
    'openai/gpt-4o': 0.05,
    'openai/gpt-5.1-codex-max': 0.08,
    'perplexity/sonar-reasoning-pro': 0.05,
    'perplexity/sonar-deep-research': 0.15,

    // IMAGE MODELS (cost per image)
    'flux-dev': 0.10,
    'flux-kontext-pro': 0.20,
    'flux-kontext-max': 0.35,
    'seedream/4.5-text-to-image': 0.20,
    'bytedance/seedream-v4-text-to-image': 0.50,
    '4o-image': 0.40,
    'nano-banana-pro': 0.50,
    'google/imagen4-ultra': 0.75,
    'grok-imagine/text-to-image': 0.60,
    'midjourney/v6': 1.00,

    // VIDEO MODELS (cost per 5-second video)
    'veo3_fast': 0.50,
    'veo3': 0.80,
    'wan/2-5-text-to-video': 0.75,
    'wan/2-6-text-to-video': 1.00,
    'kling-2.6/text-to-video': 0.90,
    'kling/v2-5-turbo-text-to-video-pro': 1.10,
    'runway-gen3-turbo': 1.00,
    'runway-gen3': 1.75,
    'bytedance/seedance-1.5-pro': 1.40,
    'sora-2-text-to-video': 1.50,

    // MUSIC MODELS (cost per song)
    'suno-v4': 0.50,
    'suno-v5': 0.75,
    'udio-v1': 0.60,

    // TTS MODELS - FREE! (Deepgram gives $200 free credits)
    'aura-2-thalia-en': 0.00,
    'aura-2-orion-en': 0.00,
    'aura-2-zeus-en': 0.00,

    // FREE FALLBACK MODELS (for unlimited usage when budget exhausted)
    // Image: Pixazo Flux Schnell - 100% FREE
    'pixazo-flux-schnell': 0.00,
    // Video: HuggingFace HunyuanVideo (via free tier) - FREE
    'hunyuan-video': 0.00,
};

// Tier monthly budgets (what we're willing to spend per user per month)
// Goal: Break even. Even $0.01 profit is acceptable. Maximize user value!
// TTS is FREE (Deepgram $200 free credits). Focus budget on images/videos.
// Current pricing: STARTER=$5, PRO=$12, PREMIUM=$24
const TIER_MONTHLY_BUDGETS: Record<UserTier, number> = {
    free: 0.50,       // Limited free usage
    starter_2: 0.00,  // Hidden referral tier - FREE models ONLY, no budget
    starter: 4.99,    // $5 price - $4.99 budget = $0.01 profit
    pro: 11.99,       // $12 price - $11.99 budget = $0.01 profit  
    premium: 23.99,   // $24 price - $23.99 budget = $0.01 profit
};

// Cost-aware model alternatives (cheaper options for each model)
const CHEAPER_ALTERNATIVES: Record<string, string[]> = {
    // Chat - from expensive to cheap
    'anthropic/claude-opus-4.1': ['anthropic/claude-3.5-sonnet', 'openai/gpt-4o', 'anthropic/claude-3.5-haiku', 'deepseek/deepseek-chat-v3.1', 'google/gemini-2.0-flash-exp:free'],
    'anthropic/claude-3.5-sonnet': ['openai/gpt-4o-mini', 'anthropic/claude-3.5-haiku', 'deepseek/deepseek-chat-v3.1', 'google/gemini-2.0-flash-exp:free'],
    'openai/gpt-4o': ['openai/gpt-4o-mini', 'anthropic/claude-3.5-haiku', 'deepseek/deepseek-chat-v3.1', 'google/gemini-2.0-flash-exp:free'],

    // Image - from expensive to cheap
    'google/imagen4-ultra': ['nano-banana-pro', 'bytedance/seedream-v4-text-to-image', '4o-image', 'flux-kontext-pro', 'seedream/4.5-text-to-image', 'flux-dev'],
    'midjourney/v6': ['grok-imagine/text-to-image', 'google/imagen4-ultra', 'nano-banana-pro', 'flux-kontext-pro', 'flux-dev'],
    'nano-banana-pro': ['bytedance/seedream-v4-text-to-image', '4o-image', 'flux-kontext-pro', 'flux-dev'],

    // Video - from expensive to cheap
    'sora-2-text-to-video': ['bytedance/seedance-1.5-pro', 'runway-gen3-turbo', 'kling/v2-5-turbo-text-to-video-pro', 'wan/2-6-text-to-video', 'kling-2.6/text-to-video', 'wan/2-5-text-to-video', 'veo3_fast'],
    'runway-gen3': ['bytedance/seedance-1.5-pro', 'runway-gen3-turbo', 'wan/2-6-text-to-video', 'kling-2.6/text-to-video', 'veo3_fast'],

    // Music - from expensive to cheap
    'suno-v5': ['udio-v1', 'suno-v4'],
};

/**
 * Get the cost of a model
 */
export function getModelCostUSD(modelId: string): number {
    return MODEL_COSTS[modelId] ?? 0.05; // Default to $0.05 if unknown
}

/**
 * Get the monthly budget for a tier
 */
export function getTierBudget(tier: UserTier): number {
    return TIER_MONTHLY_BUDGETS[tier] ?? TIER_MONTHLY_BUDGETS.free;
}

/**
 * Smart model selection - picks the best model within budget
 * @param preferredModel - The model we'd ideally use
 * @param remainingBudget - How much budget is left for the month (USD)
 * @param taskType - Type of task (chat, image, video, etc.)
 * @param userTier - User's subscription tier (affects free fallback quality)
 * @returns The model to use (may be cheaper than preferred if budget is low)
 */
export function selectModelWithinBudget(
    preferredModel: string,
    remainingBudget: number,
    taskType: TaskType,
    userTier: UserTier = 'free'
): { model: string; cost: number; downgraded: boolean; reason?: string } {
    const preferredCost = getModelCostUSD(preferredModel);

    // If we have enough budget for preferred model, use it
    if (remainingBudget >= preferredCost) {
        return { model: preferredModel, cost: preferredCost, downgraded: false };
    }

    // Try to find a cheaper alternative
    const alternatives = CHEAPER_ALTERNATIVES[preferredModel] || [];

    for (const altModel of alternatives) {
        const altCost = getModelCostUSD(altModel);
        if (remainingBudget >= altCost) {
            return {
                model: altModel,
                cost: altCost,
                downgraded: true,
                reason: `Using ${altModel} instead of ${preferredModel} to stay within budget`
            };
        }
    }

    // Use TIER-BASED free fallback models
    // Higher tiers get better quality free models
    const tierFreeModels: Record<UserTier | 'starter_2', Record<TaskType, string>> = {
        // STARTER_2: Hidden referral tier - uses basic free models only
        starter_2: {
            chat: 'deepseek/deepseek-chat:free',
            image: 'pixazo-flux-schnell',
            image_edit: 'pixazo-flux-schnell',
            video: 'hunyuan-video',
            tts: 'aura-2-thalia-en',
            music: 'suno-v4',
            ppt: 'deepseek/deepseek-chat:free',
        },
        // FREE: Basic free models
        free: {
            chat: 'deepseek/deepseek-chat:free',
            image: 'pixazo-flux-schnell',
            image_edit: 'pixazo-flux-schnell',
            video: 'hunyuan-video',
            tts: 'aura-2-thalia-en',
            music: 'suno-v4',
            ppt: 'deepseek/deepseek-chat:free',
        },
        // STARTER: Slightly better free models
        starter: {
            chat: 'deepseek/deepseek-r1:free',  // DeepSeek R1 reasoning
            image: 'pixazo-flux-schnell',
            image_edit: 'pixazo-flux-schnell',
            video: 'hunyuan-video',
            tts: 'aura-2-thalia-en',
            music: 'suno-v4',
            ppt: 'deepseek/deepseek-r1:free',
        },
        // PRO: Better free models
        pro: {
            chat: 'google/gemini-2.0-flash-exp:free',  // Gemini 2.0 Flash
            image: 'pixazo-flux-schnell',
            image_edit: 'pixazo-flux-schnell',
            video: 'hunyuan-video',
            tts: 'aura-2-orion-en',
            music: 'suno-v4',
            ppt: 'google/gemini-2.0-flash-exp:free',
        },
        // PREMIUM: Best free models available
        premium: {
            chat: 'google/gemini-2.0-flash-exp:free',  // Best free chat
            image: 'pixazo-flux-schnell',
            image_edit: 'pixazo-flux-schnell',
            video: 'hunyuan-video',
            tts: 'aura-2-zeus-en',  // Best voice
            music: 'suno-v4',
            ppt: 'google/gemini-2.0-flash-exp:free',
        },
    };

    const tierModels = tierFreeModels[userTier] || tierFreeModels.free;
    const freeModel = tierModels[taskType] || 'google/gemini-2.0-flash-exp:free';

    return {
        model: freeModel,
        cost: 0.00,  // These are truly FREE
        downgraded: true,
        reason: `Switched to free tier model: ${freeModel}`
    };
}

/**
 * Calculate estimated monthly spend based on current usage rate
 */
export function estimateMonthlySpend(
    currentSpend: number,
    dayOfMonth: number
): number {
    if (dayOfMonth <= 0) return currentSpend;
    const daysInMonth = 30;
    return (currentSpend / dayOfMonth) * daysInMonth;
}

export interface Assumption {
    key: string;
    value: string;
    editable: boolean;
}

export interface ClarifyingQuestion {
    id: string;
    question: string;
    placeholder?: string;
    required: boolean;
}

export interface InterpretationResult {
    intent: TaskType;
    confidence: number;
    enhancedPrompt: string;
    // Self-answer: orchestrator can directly answer simple queries
    selfAnswer?: boolean;
    selfAnswerContent?: string | null;
    // Complexity level determined by orchestrator
    complexity?: 'simple' | 'medium' | 'complex';
    // Model selection reasoning (internal only - never shown to user)
    modelReasoning?: string;
    contextUpdates: {
        longTerm: Record<string, any>;
        shortTerm: Record<string, any>;
    };
    assumptions: Assumption[];
    needsClarification: boolean;
    clarifyingQuestions: ClarifyingQuestion[];
    suggestedModel: string;
    statusMessage: string;
    // Media generation parameters parsed from natural language
    mediaParams?: {
        aspectRatio?: '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '21:9';
        duration?: number; // seconds for video
        quality?: 'standard' | 'hd' | '4k';
        style?: string;
    };
    // NEW: Source media for editing operations (from conversation history)
    sourceMediaUrl?: string | null;
    sourceMediaDescription?: string | null;
    // NEW: Usage warnings (shown when <5% remaining)
    warningMessage?: string | null;
    // NEW: Show assumptions before generation
    showAssumptionsFirst?: boolean;
    // NEW: Upgrade required (when limits exhausted)
    upgradeRequired?: boolean;
    upgradeReason?: string;
    upgradeTier?: string;
    upgradeBenefit?: string;
}

export interface OrchestrationResult {
    success: boolean;
    response?: string | { url: string; type: string };
    taskType: TaskType;
    assumptions: Assumption[];
    error?: string;
    upgradeRequired?: boolean;
    upgradeReason?: string;
    needsClarification?: boolean;
    clarifyingQuestions?: ClarifyingQuestion[];
    statusHistory: string[];
}

export interface ConversationContext {
    longTerm: {
        businessName?: string;
        industry?: string;
        targetAudience?: string;
        brandTone?: string;
        primaryGoals?: string[];
        assets?: { name: string; type: string; url?: string }[];
        customData?: Record<string, any>;
    };
    shortTerm: {
        currentTask?: string;
        recentTopics?: string[];
        pendingActions?: string[];
        userPreferences?: Record<string, any>;
    };
    version: number;
    lastUpdated: string;
}

// ===== SYSTEM PROMPTS =====

const ORCHESTRATOR_SYSTEM_PROMPT = `You are the INTERNAL BRAIN of KroniQ AI - an all-in-one AI platform.

## 🔒 CRITICAL IDENTITY RULES (NEVER BREAK!)
- You ARE KroniQ AI. Never mention other AI names (GPT, Claude, Gemini, OpenAI, Anthropic, etc.)
- Never tell users which "model" is being used - this is internal only
- Never say "I'm powered by..." or "I use..." - just BE KroniQ AI
- When referencing yourself, say "I" or "KroniQ AI"
- All capabilities come from "KroniQ AI" - not any underlying models

## 🧠 YOUR ROLE AS THE INTELLIGENT BRAIN

You analyze EVERY user request and make intelligent decisions:
1. **UNDERSTAND** - Parse request using all available context (90-95% current chat, 5-10% cross-project)
2. **CHECK LIMITS** - Verify user has enough remaining limits BEFORE routing
3. **DETERMINE** - If assumptions need user approval first
4. **SELECT** - The best internal route (completely hidden from user)
5. **ENHANCE** - Improve the prompt with constraints, quality keywords, style
6. **EXECUTE** - Return structured routing instructions

## 📊 CONTEXT ANALYSIS (CRITICAL!)

### Context Priority Weighting:
- **Current chat messages: 90-95%** - Primary context source
- **Cross-project memory: 5-10%** - Light reference only
- **Project settings**: System prompt, preferences
- **Global memory**: User's stored preferences

### Media History Analysis:
When user references previous content ("edit the video", "make it blue", "one more"):
1. **FIND** the media URL in conversation history (look for mediaUrl field)
2. **EXTRACT** the original prompt/description
3. **INCLUDE** source_media_url in your response for editing operations

Example history message with media:
{
  "role": "assistant",
  "content": "Image Generated!",
  "mediaUrl": "https://example.com/image.jpg",
  "mediaType": "image"
}

## ⚠️ USAGE LIMITS & WARNINGS

### When to Show Warnings:
- If user has **<5% of any limit** remaining → Add warning_message to response
- If user has **0 remaining** → Set upgrade_required: true, skip generation

### Warning Format:
"⚠️ 2 images remaining this month" or "⚠️ 500 tokens remaining"

### Limit Categories:
- tokens: For chat, coding, analysis
- images: For image generation
- videos: For video generation (0 for FREE tier)
- music: For music generation (0 for FREE tier)
- tts: For text-to-speech
- ppt: For presentations (0 for FREE tier)

## 🎬 GENERATION CONSTRAINTS (ALWAYS APPLY!)

### Video Generation:
| Tier | Max Duration | Resolution |
|------|--------------|------------|
| FREE | Not allowed | N/A |
| STARTER | 8 seconds | 720p |
| PRO | 10 seconds | 1080p |
| PREMIUM | 20 seconds | 1080p |

If user requests longer video (e.g., "1 minute video"):
→ Inform them of the limit in assumptions: { "key": "Duration", "value": "8 seconds (max for your plan)", "editable": false }

### Image Generation:
- Always add quality keywords: "8K, ultra-detailed, professional quality, stunning"
- Default aspect ratio: 1:1 unless specified
- For edits: Must include source_media_url from history

### PPT Generation:
- Maximum 20 slides per generation
- Parse slide count from prompt or default to 10
- Include theme preference in assumptions

### Music Generation:
- Maximum 4 minutes per song
- Include style/genre in assumptions

## 🎯 INTENT DETECTION

| Intent | Keywords/Triggers |
|--------|------------------|
| **image** | create/generate/make/draw/design image, picture, photo, logo, visual, artwork, illustration, poster, banner |
| **video** | create/generate/make video, animation, clip, footage, turn into video, animate |
| **music** | create/compose/make music, song, beat, track, soundtrack, melody |
| **tts** | read aloud, speak this, say this, text to speech, voice this, narrate |
| **ppt** | create presentation, slides, PowerPoint, pitch deck, slideshow |
| **image_edit** | edit image, change colors, modify, update the image, make it blue |
| **chat** | everything else - questions, coding, writing, analysis |

## 🔄 FOLLOW-UP UNDERSTANDING (CRITICAL!)

| User Says | Your Interpretation |
|-----------|---------------------|
| "one more" | Repeat LAST generation type with similar prompt but variation |
| "again" | Same as above |
| "make it blue/red/etc" | Edit last image/video with color change → include source URL |
| "longer version" | If video: explain limit. If text: expand content |
| "shorter" | Condense/trim the content |
| "turn this into X" | Convert last output to new format - MUST find source |
| "edit the video" | Find video URL from history, apply described changes |
| "another like that" | Generate similar to previous with variations |

### How to Find Previous Media:
1. Scan assistant messages in conversation history
2. Look for messages with mediaUrl and mediaType fields
3. Extract the most recent one matching the context
4. Pass it as source_media_url in your response

## 🎨 PROMPT ENHANCEMENT (ALWAYS DO THIS!)

Transform simple user prompts into detailed, high-quality prompts:

### ⚠️ CRITICAL: NEVER include model names in enhanced prompts!
- DO NOT write "using Flux Kontext Pro model" or "using DALL-E 3" etc.
- Model selection is handled internally by API routing, NOT by mentioning models in prompts
- The enhanced prompt should ONLY contain the creative description, quality keywords, and style details
- WRONG: "Create a sunset image using Flux Kontext Pro model"
- RIGHT: "Breathtaking ocean sunset, vibrant gradient sky, 8K resolution, photorealistic"

### Image Examples:
- User: "logo for my bakery"
- Enhanced: "Professional bakery logo design, modern minimalist style, warm brown and cream color palette, clean elegant typography, artisan bread or wheat motif subtly integrated, scalable vector-quality rendering, pure white background, suitable for signage and packaging, 8K ultra-detailed"

- User: "sunset"
- Enhanced: "Breathtaking ocean sunset panorama, vibrant gradient sky transitioning from deep orange through pink to purple, golden hour lighting reflecting on calm waters, silhouetted palm trees framing the composition, photorealistic quality, stunning color grading, 8K resolution, National Geographic style photography"

### Video Examples:
- User: "video of a rose"
- Enhanced: "Cinematic close-up shot of a deep red rose slowly blooming, soft morning dew droplets on petals, gentle camera dolly movement revealing intricate petal layers, warm golden lighting, shallow depth of field with bokeh background, 8 seconds duration, smooth motion, professional color grading"

### Code Examples:
- User: "python sort function"
- Enhanced: "Write a Python function with: comprehensive type hints, detailed docstring explaining parameters and return value, handle edge cases (empty list, single element, already sorted), include 3 usage examples with expected output, follow PEP8 style guidelines, add performance complexity comment"

## 📤 OUTPUT FORMAT (JSON ONLY!)

### Standard Generation Response:
\`\`\`json
{
  "self_answer": false,
  "intent": "image",
  "complexity": "medium",
  "confidence": 0.95,
  "enhanced_prompt": "Your significantly improved prompt here...",
  "assumptions": [
    { "key": "Style", "value": "Modern minimalist", "editable": true },
    { "key": "Colors", "value": "Warm earth tones", "editable": true },
    { "key": "Aspect Ratio", "value": "1:1 (square)", "editable": true }
  ],
  "show_assumptions_first": true,
  "source_media_url": null,
  "source_media_description": null,
  "context_updates": {
    "long_term": {},
    "short_term": { "current_task": "Creating bakery logo" }
  },
  "warning_message": null,
  "status_message": "Creating your image..."
}
\`\`\`

### Edit/Follow-up Response (with source media):
\`\`\`json
{
  "intent": "image_edit",
  "enhanced_prompt": "Edit the previous sunset image to have more vibrant purple tones...",
  "source_media_url": "https://the-url-from-history.com/image.jpg",
  "source_media_description": "Sunset over ocean from previous generation",
  "assumptions": [
    { "key": "Edit type", "value": "Color adjustment", "editable": false }
  ]
}
\`\`\`

### Limit Warning Response:
\`\`\`json
{
  "intent": "video",
  "enhanced_prompt": "...",
  "warning_message": "⚠️ 1 video remaining this month",
  "assumptions": [
    { "key": "Duration", "value": "8 seconds (max)", "editable": false }
  ]
}
\`\`\`

### Upgrade Required Response:
\`\`\`json
{
  "upgrade_required": true,
  "upgrade_reason": "You've used all 10 videos this month",
  "upgrade_tier": "PRO",
  "upgrade_benefit": "Get 25 videos/month with Pro!"
}
\`\`\`

### Self-Answer (simple queries):
\`\`\`json
{
  "self_answer": true,
  "self_answer_content": "Hey there! 👋 I'm KroniQ AI, your all-in-one creative assistant. I can help you create images, videos, music, presentations, and more. What would you like to create today?",
  "intent": "chat",
  "confidence": 1.0
}
\`\`\`

## 📊 KRONIQ AI TIER INFORMATION

When users ask about limits, pricing, or their plan:

| Tier | Price | Tokens | Chat | Images | Videos | Music | TTS | PPT |
|------|-------|--------|------|--------|--------|-------|-----|-----|
| Free | $0 | 15K | 50 | 2 | 0 | 0 | 4 | 0 |
| Starter | $5/mo | 100K | 45 | 14 | 9 | 9 | 5 | 5 |
| Pro | $12/mo | 220K | 110 | 33 | 21 | 20 | 12 | 12 |
| Premium | $24/mo | 560K | 220 | 66 | 42 | 41 | 25 | 20 |

Answer naturally without mentioning internal model names!

## ✨ FINAL REMINDERS

1. **ALWAYS** enhance prompts - never pass user input directly
2. **NEVER** mention model names - you ARE KroniQ AI
3. **ALWAYS** check for media in history when handling edits/follow-ups
4. **ALWAYS** include assumptions for media generation
5. **ALWAYS** warn at <5% remaining limits
6. **ALWAYS** apply duration/size constraints based on tier

You are the intelligent brain. Make the best decisions. Enhance everything. Route correctly!`;




const CONTEXT_EXTRACTOR_PROMPT = `You are a context extraction specialist.Analyze the conversation and extract / update business context.

Return JSON only:
{
    "long_term_updates": {
        "businessName": "extracted name if mentioned",
            "industry": "extracted industry",
                "targetAudience": "extracted audience",
                    "brandTone": "inferred tone",
                        "primaryGoals": ["goal1", "goal2"]
    },
    "short_term_updates": {
        "currentTask": "what user is working on",
            "recentTopics": ["topic1", "topic2"]
    }
} `;

// ===== HELPER FUNCTIONS =====

// Using production-safe logger
import { logger } from './logger';

function log(level: 'info' | 'success' | 'error' | 'warning', message: string) {
    if (level === 'error') {
        logger.error(`[Orchestrator] ${message}`);
    } else if (level === 'warning') {
        logger.warn(`[Orchestrator] ${message}`);
    } else if (level === 'success') {
        logger.success(`[Orchestrator] ${message}`);
    } else {
        logger.info(`[Orchestrator] ${message}`);
    }
}

async function callGeminiOrchestrator(
    messages: Array<{ role: string; content: string }>,
    stream: boolean = false
): Promise<string> {
    if (!OPENROUTER_API_KEY) {
        throw new Error('OpenRouter API key not configured');
    }

    log('info', `Calling Gemini Orchestrator (stream: ${stream})`);

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://kroniq.ai',
            'X-Title': 'KroniQ AI Platform',
        },
        body: JSON.stringify({
            model: ORCHESTRATOR_MODEL,
            messages,
            stream,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        log('error', `Gemini Orchestrator API error: ${error}`);
        throw new Error(`Orchestrator API error: ${response.status}`);
    }

    if (stream) {
        // Handle streaming response
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        if (reader) {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

                for (const line of lines) {
                    const data = line.slice(6);
                    if (data === '[DONE]') continue;

                    try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices?.[0]?.delta?.content;
                        if (content) {
                            fullContent += content;
                        }
                    } catch {
                        // Skip parse errors
                    }
                }
            }
        }

        return fullContent;
    } else {
        const data = await response.json();
        return data.choices?.[0]?.message?.content || '';
    }
}

async function callTongyiDeepResearch(query: string): Promise<string> {
    if (!FEATURE_FLAGS.web_research) {
        log('warning', 'Web research is disabled in feature flags');
        return '';
    }

    log('info', 'Calling Tongyi DeepResearch for web research');

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://kroniq.ai',
            'X-Title': 'KroniQ AI Platform',
        },
        body: JSON.stringify({
            model: TONGYI_RESEARCH_MODEL,
            messages: [
                {
                    role: 'user',
                    content: query,
                },
            ],
            stream: true,
            streamOptions: { includeUsage: true },
        }),
    });

    if (!response.ok) {
        log('error', 'Tongyi DeepResearch API error');
        return '';
    }

    // Handle streaming response
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    if (reader) {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

            for (const line of lines) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices?.[0]?.delta?.content;
                    if (content) {
                        fullContent += content;
                    }
                } catch {
                    // Skip parse errors
                }
            }
        }
    }

    log('success', `DeepResearch returned ${fullContent.length} chars`);
    return fullContent;
}

function parseOrchestratorResponse(response: string): InterpretationResult | null {
    try {
        // Try to extract JSON from the response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            log('error', 'No JSON found in orchestrator response');
            return null;
        }

        const parsed = JSON.parse(jsonMatch[0]);

        // Check if this is an upgrade required response
        if (parsed.upgrade_required) {
            return {
                intent: parsed.intent || 'chat',
                confidence: 1.0,
                enhancedPrompt: '',
                contextUpdates: { longTerm: {}, shortTerm: {} },
                assumptions: [],
                needsClarification: false,
                clarifyingQuestions: [],
                suggestedModel: '',
                statusMessage: 'Upgrade required',
                upgradeRequired: true,
                upgradeReason: parsed.upgrade_reason || 'You have reached your limit',
                upgradeTier: parsed.upgrade_tier || 'PRO',
                upgradeBenefit: parsed.upgrade_benefit || 'Get more generations!',
            };
        }

        // Parse media parameters if present
        const mediaParams = parsed.media_params ? {
            aspectRatio: parsed.media_params.aspect_ratio as '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '21:9' | undefined,
            duration: parsed.media_params.duration as number | undefined,
            quality: parsed.media_params.quality as 'standard' | 'hd' | '4k' | undefined,
            style: parsed.media_params.style as string | undefined,
        } : undefined;

        return {
            intent: parsed.intent || 'chat',
            confidence: parsed.confidence || 0.8,
            enhancedPrompt: parsed.enhanced_prompt || '',
            // Self-answer support: orchestrator can handle simple queries directly
            selfAnswer: parsed.self_answer || false,
            selfAnswerContent: parsed.self_answer_content || null,
            complexity: parsed.complexity || 'medium',
            modelReasoning: parsed.model_reasoning || '',
            contextUpdates: {
                longTerm: parsed.context_updates?.long_term || {},
                shortTerm: parsed.context_updates?.short_term || {},
            },
            assumptions: (parsed.assumptions || []).map((a: any) => ({
                key: a.key,
                value: a.value,
                editable: a.editable !== false,
            })),
            needsClarification: parsed.needs_clarification || false,
            clarifyingQuestions: (parsed.clarifying_questions || []).map((q: any, i: number) => ({
                id: `q_${i}`,
                question: q.question || q,
                placeholder: q.placeholder,
                required: q.required !== false,
            })),
            suggestedModel: parsed.suggested_model || 'anthropic/claude-3.5-sonnet-20241022',
            statusMessage: parsed.status_message || 'Processing...',
            mediaParams,
            // NEW: Source media for editing operations
            sourceMediaUrl: parsed.source_media_url || null,
            sourceMediaDescription: parsed.source_media_description || null,
            // NEW: Warning message for low limits (<5% remaining)
            warningMessage: parsed.warning_message || null,
            // NEW: Show assumptions before generation
            showAssumptionsFirst: parsed.show_assumptions_first || false,
            // Upgrade fields (may not be present if not upgrade scenario)
            upgradeRequired: parsed.upgrade_required || false,
            upgradeReason: parsed.upgrade_reason || undefined,
            upgradeTier: parsed.upgrade_tier || undefined,
            upgradeBenefit: parsed.upgrade_benefit || undefined,
        };
    } catch (error) {
        log('error', `Failed to parse orchestrator response: ${error}`);
        return null;
    }
}

// ===== MAIN ORCHESTRATION FUNCTIONS =====

/**
 * Interpret a user's request using DeepSeek R1
 * This is the first step in the orchestration pipeline
 */
export async function interpretRequest(
    userMessage: string,
    conversationHistory: Array<{ role: string; content: string }>,
    currentContext: ConversationContext,
    config: OrchestratorConfig = {}
): Promise<InterpretationResult> {
    const messageLower = userMessage.toLowerCase().trim();
    const wordCount = userMessage.split(/\s+/).length;
    const userTier = config.userTier || 'free';

    // ===== COMPLEXITY DETECTION =====
    // Detect if message is simple, medium, or complex

    const simplePatterns = [
        /^(hi|hello|hey|howdy|sup|yo|hola|namaste|hy|hii|hiii)[\s!?.]*$/i,
        /^(what('?s| is) my name|who am i|my name|do you know me|remember me)\??$/i,
        /^(my name is|i('?m| am)|call me)\s+\w+\.?$/i,
        /^(thanks|thank you|thx|ty|ok|okay|cool|great|nice|awesome)[\s!.]*$/i,
        /^(how are you|what('?s| is) up|wassup|what can you do|help)\??$/i,
    ];

    const complexPatterns = [
        /business plan|marketing strategy|legal|analysis|code review/i,
        /create.*flyer|design.*logo|professional.*design/i,
        /write.*article|essay|report|documentation/i,
        /explain.*detail|in-depth|comprehensive/i,
        /compare|analyze|evaluate|research/i,
    ];

    const imageComplexPatterns = [
        /flyer|poster|banner|branding|logo|professional|marketing/i,
        /infographic|business card|letterhead|presentation/i,
        /high quality|detailed|realistic|4k|hd/i,
    ];

    const videoComplexPatterns = [
        /commercial|ad|advertisement|promo|professional/i,
        /cinematic|high quality|4k|hd/i,
        /longer|extended|full|complete/i,
    ];

    const isSimpleMessage = simplePatterns.some(p => p.test(messageLower)) || wordCount <= 5;
    const isComplexMessage = complexPatterns.some(p => p.test(messageLower)) || wordCount > 50;
    const isComplexImage = imageComplexPatterns.some(p => p.test(messageLower));
    const isComplexVideo = videoComplexPatterns.some(p => p.test(messageLower));

    // Determine complexity level
    const getComplexity = (type: 'chat' | 'image' | 'video'): 'simple' | 'medium' | 'complex' => {
        if (type === 'image') return isComplexImage ? 'complex' : 'simple';
        if (type === 'video') return isComplexVideo ? 'complex' : 'simple';
        if (isSimpleMessage) return 'simple';
        if (isComplexMessage) return 'complex';
        return 'medium';
    };

    // Get model based on tier and complexity
    const getModelForTask = (type: 'chat' | 'image' | 'video', complexity: 'simple' | 'medium' | 'complex'): string => {
        const routing = TIER_MODEL_ROUTING[type];
        if (!routing) return 'google/gemini-2.0-flash-exp:free';

        const complexityLevel = type === 'chat' ? complexity : (complexity === 'medium' ? 'simple' : complexity);
        const models = routing[complexityLevel as keyof typeof routing] || routing.simple;
        const model = models[userTier as keyof typeof models] || models.free;

        // Extract provider from model ID
        const provider = model.split('/')[0] || 'unknown';
        const modelName = model.split('/')[1] || model;

        logger.debug('[Model Selection]', {
            taskType: type,
            complexity: complexityLevel,
            userTier: userTier,
            provider: provider,
            model: modelName
        });

        return model;
    };

    // ===== FAST PATH: Simple messages skip orchestration for speed =====
    if (isSimpleMessage && !config.forceTaskType) {
        const complexity = getComplexity('chat');
        const model = getModelForTask('chat', complexity);

        log('info', `⚡ Fast path: Simple message → ${model} (${userTier} tier)`);

        return {
            intent: 'chat',
            confidence: 1.0,
            enhancedPrompt: userMessage,
            contextUpdates: { longTerm: {}, shortTerm: {} },
            assumptions: [],
            needsClarification: false,
            clarifyingQuestions: [],
            suggestedModel: model,
            statusMessage: 'Thinking...',
        };
    }

    log('info', `Interpreting request: "${userMessage.substring(0, 50)}..."`);

    // Build context summary for the orchestrator
    const contextSummary = `
## Current Context:
- Business: ${currentContext.longTerm.businessName || 'Not specified'}
- Industry: ${currentContext.longTerm.industry || 'Not specified'}
- Target Audience: ${currentContext.longTerm.targetAudience || 'Not specified'}
- Brand Tone: ${currentContext.longTerm.brandTone || 'Not specified'}
- Current Task: ${currentContext.shortTerm.currentTask || 'None'}
- Recent Topics: ${currentContext.shortTerm.recentTopics?.join(', ') || 'None'}
`.trim();

    // Extract media history from conversation (for "edit the video", "one more" type requests)
    const mediaHistory = conversationHistory
        .filter((m: any) => m.mediaUrl || m.mediaType)
        .slice(-5)
        .map((m: any) => ({
            role: m.role,
            mediaUrl: m.mediaUrl,
            mediaType: m.mediaType,
            content: (m.content || '').substring(0, 100)
        }));

    const mediaHistoryContext = mediaHistory.length > 0
        ? `## Recent Media Generated:\n${mediaHistory.map((m: any) =>
            `- [${m.mediaType?.toUpperCase() || 'UNKNOWN'}] ${m.content}... (URL: ${m.mediaUrl})`
        ).join('\n')}`
        : '## Recent Media Generated:\nNone';

    // Build recent conversation for context (90-95% weight from current chat)
    const recentConversation = conversationHistory
        .slice(-10)
        .map((m: any) => {
            let msgContent = `${m.role}: ${m.content}`;
            if (m.mediaUrl) {
                msgContent += ` [HAS_MEDIA: ${m.mediaType}, URL: ${m.mediaUrl}]`;
            }
            return msgContent;
        })
        .join('\n');

    // Get model capabilities for this tier
    const tierUpperCase = userTier.toUpperCase() as CapabilityUserTier;
    const modelCapabilities = getModelCapabilitiesPrompt(tierUpperCase);

    const messages = [
        { role: 'system', content: ORCHESTRATOR_SYSTEM_PROMPT },
        {
            role: 'user', content: `
${contextSummary}

${modelCapabilities}

${mediaHistoryContext}

## Recent Conversation (90-95% context weight):
${recentConversation}

## New User Message:
${userMessage}

Analyze this request and provide routing instructions in JSON format.
IMPORTANT: If user references previous media ("edit the video", "make it blue", "one more"):
- Find the relevant mediaUrl from the history above
- Include it as "source_media_url" in your response
${config.forceTaskType ? `Note: User explicitly selected task type: ${config.forceTaskType}` : ''}
`.trim()
        },
    ];

    try {
        const response = await callGeminiOrchestrator(messages);
        const interpretation = parseOrchestratorResponse(response);

        if (interpretation) {
            // Override task type if user explicitly selected one
            if (config.forceTaskType) {
                interpretation.intent = config.forceTaskType;
            }

            log('success', `Interpreted as ${interpretation.intent} (confidence: ${interpretation.confidence})`);
            return interpretation;
        }
    } catch (error) {
        log('error', `Interpretation failed: ${error} `);
    }

    // Fallback interpretation
    return {
        intent: config.forceTaskType || 'chat',
        confidence: 0.7,
        enhancedPrompt: userMessage,
        contextUpdates: { longTerm: {}, shortTerm: { currentTask: userMessage.substring(0, 100) } },
        assumptions: [],
        needsClarification: false,
        clarifyingQuestions: [],
        suggestedModel: 'anthropic/claude-3.5-sonnet-20241022',
        statusMessage: 'Generating response...',
    };
}

/**
 * Update conversation context with new information
 */
export async function updateContext(
    projectId: string,
    userId: string,
    updates: {
        longTerm?: Partial<ConversationContext['longTerm']>;
        shortTerm?: Partial<ConversationContext['shortTerm']>;
    },
    currentContext: ConversationContext
): Promise<ConversationContext> {
    log('info', 'Updating conversation context');

    const newContext: ConversationContext = {
        longTerm: {
            ...currentContext.longTerm,
            ...updates.longTerm,
        },
        shortTerm: {
            ...currentContext.shortTerm,
            ...updates.shortTerm,
        },
        version: currentContext.version + 1,
        lastUpdated: new Date().toISOString(),
    };

    try {
        // Check if context exists
        const { data: existing } = await supabase
            .from('conversation_context')
            .select('id, context_versions')
            .eq('project_id', projectId)
            .eq('user_id', userId)
            .maybeSingle();

        // Store previous version in history
        const versions = existing?.context_versions || [];
        versions.push({
            version: currentContext.version,
            longTerm: currentContext.longTerm,
            shortTerm: currentContext.shortTerm,
            savedAt: new Date().toISOString(),
        });

        // Keep only last 10 versions
        const trimmedVersions = versions.slice(-10);

        if (existing) {
            await supabase
                .from('conversation_context')
                .update({
                    long_term_context: newContext.longTerm,
                    short_term_context: newContext.shortTerm,
                    context_versions: trimmedVersions,
                    current_version: newContext.version,
                    updated_at: newContext.lastUpdated,
                })
                .eq('id', existing.id);
        } else {
            await supabase
                .from('conversation_context')
                .insert({
                    project_id: projectId,
                    user_id: userId,
                    long_term_context: newContext.longTerm,
                    short_term_context: newContext.shortTerm,
                    context_versions: trimmedVersions,
                    current_version: newContext.version,
                });
        }

        log('success', `Context updated to version ${newContext.version} `);
    } catch (error) {
        log('error', `Failed to persist context: ${error} `);
        // Continue with in-memory context even if persistence fails
    }

    return newContext;
}

/**
 * Get conversation context for a project
 */
export async function getContext(
    projectId: string,
    userId: string
): Promise<ConversationContext> {
    try {
        const { data } = await supabase
            .from('conversation_context')
            .select('*')
            .eq('project_id', projectId)
            .eq('user_id', userId)
            .maybeSingle();

        if (data) {
            return {
                longTerm: data.long_term_context || {},
                shortTerm: data.short_term_context || {},
                version: data.current_version || 1,
                lastUpdated: data.updated_at,
            };
        }
    } catch (error) {
        log('warning', 'No existing context found, using defaults');
    }

    // Return default context
    return {
        longTerm: {},
        shortTerm: {},
        version: 1,
        lastUpdated: new Date().toISOString(),
    };
}

/**
 * Get context version history for manual editing/reset
 */
export async function getContextVersions(
    projectId: string,
    userId: string
): Promise<Array<{ version: number; savedAt: string; longTerm: any; shortTerm: any }>> {
    try {
        const { data } = await supabase
            .from('conversation_context')
            .select('context_versions')
            .eq('project_id', projectId)
            .eq('user_id', userId)
            .maybeSingle();

        return data?.context_versions || [];
    } catch {
        return [];
    }
}

/**
 * Reset context to a specific version
 */
export async function resetToVersion(
    projectId: string,
    userId: string,
    targetVersion: number
): Promise<ConversationContext | null> {
    const versions = await getContextVersions(projectId, userId);
    const target = versions.find(v => v.version === targetVersion);

    if (!target) {
        log('error', `Version ${targetVersion} not found`);
        return null;
    }

    return updateContext(projectId, userId, {
        longTerm: target.longTerm,
        shortTerm: target.shortTerm,
    }, {
        longTerm: {},
        shortTerm: {},
        version: targetVersion,
        lastUpdated: new Date().toISOString(),
    });
}

/**
 * Check if user has access to a specific tool based on their subscription and daily limits
 */
export async function checkToolAccess(
    userId: string,
    toolType: TaskType
): Promise<{ allowed: boolean; remaining?: number; upgradeRequired?: boolean; upgradeReason?: string }> {
    try {
        // Get user's subscription info
        const { data: profile } = await supabase
            .from('profiles')
            .select('subscription_tier, subscription_status, is_paid')
            .eq('id', userId)
            .maybeSingle();

        const tierRaw = (profile?.subscription_tier || 'free').toUpperCase();
        const tier = tierRaw === 'STARTER_2' || tierRaw === 'STARTER2' ? 'STARTER_2' : tierRaw;
        const isPaid = profile?.is_paid === true || (tier !== 'FREE' && profile?.subscription_status === 'active');

        // Get daily limit for this tier and tool type
        const tierLimits = DAILY_LIMITS[tier] || DAILY_LIMITS['FREE'];
        const dailyLimit = tierLimits[toolType] || 0;

        // If limit is 0 for this tier, deny access
        if (dailyLimit === 0) {
            const upgradeMessages: Record<TaskType, string> = {
                chat: 'Chat is limited on this plan. Upgrade for more!',
                image: 'Image generation is limited on this plan. Upgrade for more!',
                image_edit: 'Image editing is limited on this plan. Upgrade for more!',
                video: 'Video generation requires a paid plan. Upgrade to create stunning AI videos!',
                music: 'Music generation requires a paid plan. Upgrade to create AI music!',
                ppt: 'PPT generation requires a paid plan. Upgrade to create unlimited presentations!',
                tts: 'Text-to-speech is limited on this plan. Upgrade for more!',
            };
            return {
                allowed: false,
                remaining: 0,
                upgradeRequired: true,
                upgradeReason: upgradeMessages[toolType] || 'Upgrade for access to this feature!',
            };
        }

        // Check daily usage from database
        const today = new Date().toISOString().split('T')[0];
        const { data: usage } = await supabase
            .from('daily_usage')
            .select('*')
            .eq('user_id', userId)
            .eq('date', today)
            .maybeSingle();

        // Map task type to usage field
        const usageFieldMap: Record<TaskType, string> = {
            chat: 'chat_count',
            image: 'images_generated',
            image_edit: 'images_generated',
            video: 'videos_generated',
            music: 'music_generated',
            ppt: 'ppt_generated',
            tts: 'tts_generated',
        };

        const usedToday = (usage as any)?.[usageFieldMap[toolType]] || 0;
        const remaining = Math.max(0, dailyLimit - usedToday);

        if (remaining <= 0) {
            return {
                allowed: false,
                remaining: 0,
                upgradeRequired: !isPaid,
                upgradeReason: `Daily limit reached (${dailyLimit}/${toolType}). ${isPaid ? 'Try again tomorrow!' : 'Upgrade for higher limits!'}`,
            };
        }

        return { allowed: true, remaining };
    } catch (error) {
        log('error', `Failed to check tool access: ${error}`);
        // SECURITY: Fail closed - deny access on error instead of allowing
        return {
            allowed: false,
            remaining: 0,
            upgradeRequired: false,
            upgradeReason: 'Unable to verify access. Please try again.',
        };
    }
}


/**
 * Daily limits per tier for each tool type
 * UPDATED January 2026 - HIGH BUT CAPPED USAGE MODEL
 * Shows high numbers but not "unlimited" - actual caps exist
 * All limits reset at midnight UTC
 * 
 * HIDDEN TIERS:
 * - STARTER_2: Referral tier - Free models only, no premium
 */
export const DAILY_LIMITS: Record<string, Record<TaskType, number>> = {
    FREE: { chat: 15, image: 2, video: 0, tts: 4, music: 0, ppt: 0, image_edit: 2 },
    // STARTER_2: Hidden referral tier - FREE MODELS ONLY, no premium features
    STARTER_2: { chat: 25, image: 10, video: 3, tts: 25, music: 0, ppt: 0, image_edit: 10 },
    STARTER: { chat: 60, image: 25, video: 6, tts: 60, music: 0, ppt: 2, image_edit: 25 },
    PRO: { chat: 80, image: 32, video: 10, tts: 80, music: 0, ppt: 4, image_edit: 32 },
    PREMIUM: { chat: 120, image: 40, video: 12, tts: 120, music: 0, ppt: 6, image_edit: 40 }
};

/**
 * Weekly limits per tier (prevents abuse while allowing high daily usage)
 */
export const WEEKLY_LIMITS: Record<string, Record<TaskType, number>> = {
    FREE: { chat: 80, image: 8, video: 0, tts: 15, music: 0, ppt: 0, image_edit: 8 },
    STARTER_2: { chat: 120, image: 50, video: 15, tts: 120, music: 0, ppt: 0, image_edit: 50 },
    STARTER: { chat: 320, image: 120, video: 32, tts: 320, music: 0, ppt: 12, image_edit: 120 },
    PRO: { chat: 480, image: 160, video: 48, tts: 480, music: 0, ppt: 20, image_edit: 160 },
    PREMIUM: { chat: 640, image: 200, video: 64, tts: 640, music: 0, ppt: 32, image_edit: 200 }
};

/**
 * Monthly limits per tier (absolute cap)
 */
export const MONTHLY_LIMITS: Record<string, Record<TaskType, number>> = {
    FREE: { chat: 240, image: 20, video: 0, tts: 40, music: 0, ppt: 0, image_edit: 20 },
    // STARTER_2: Lower limits since it's FREE (referral tier), no PPT
    STARTER_2: { chat: 400, image: 150, video: 40, tts: 400, music: 0, ppt: 0, image_edit: 150 },
    STARTER: { chat: 1200, image: 400, video: 96, tts: 1200, music: 0, ppt: 32, image_edit: 400 },
    PRO: { chat: 2000, image: 560, video: 144, tts: 2000, music: 0, ppt: 64, image_edit: 560 },
    PREMIUM: { chat: 3200, image: 800, video: 200, tts: 3200, music: 0, ppt: 96, image_edit: 800 }
};

/**
 * Monthly token limits per tier
 */
export const MONTHLY_TOKEN_LIMITS: Record<string, number> = {
    FREE: 15000,       // 15K
    STARTER_2: 100000, // 100K (referral tier)
    STARTER: 100000,   // 100K
    PRO: 220000,       // 220K
    PREMIUM: 560000,   // 560K
};

/**
 * Check if user has exceeded their daily limit for a tool type
 * Returns { allowed: boolean, used: number, limit: number, remaining: number }
 */
export async function checkUsageLimits(
    userId: string,
    toolType: TaskType,
    userTier: string = 'FREE'
): Promise<{ allowed: boolean; used: number; limit: number; remaining: number }> {
    try {
        if (!userId) {
            log('warning', 'No userId provided for limit check');
            return { allowed: true, used: 0, limit: 999, remaining: 999 };
        }

        // Get tier limits
        const tierLimits = DAILY_LIMITS[userTier.toUpperCase()] || DAILY_LIMITS.FREE;
        const limit = tierLimits[toolType] || 0;

        // If limit is 0, this feature is not available for this tier
        if (limit === 0) {
            log('info', `${toolType} not available for ${userTier} tier`);
            return { allowed: false, used: 0, limit: 0, remaining: 0 };
        }

        // Get today's date range
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Query today's usage count
        const { data, error, count } = await supabase
            .from('generation_usage')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('type', toolType)
            .gte('created_at', today.toISOString())
            .lt('created_at', tomorrow.toISOString());

        if (error) {
            log('error', `Failed to check usage: ${error.message}`);
            // On error, allow but log it
            return { allowed: true, used: 0, limit, remaining: limit };
        }

        const used = count || 0;
        const remaining = Math.max(0, limit - used);
        const allowed = used < limit;

        log('info', `[Limits] ${userTier} tier - ${toolType}: ${used}/${limit} used, ${remaining} remaining, allowed: ${allowed}`);

        return { allowed, used, limit, remaining };
    } catch (error) {
        log('error', `checkUsageLimits error: ${error}`);
        return { allowed: true, used: 0, limit: 999, remaining: 999 };
    }
}

/**
 * Record tool usage for tracking limits
 */
export async function recordToolUsage(
    userId: string,
    toolType: TaskType,
    metadata?: Record<string, any>
): Promise<void> {
    try {
        await supabase.from('generation_usage').insert({
            user_id: userId,
            type: toolType,
            metadata,
            created_at: new Date().toISOString(),
        });
        log('info', `Recorded ${toolType} usage for user`);
    } catch (error) {
        log('error', `Failed to record usage: ${error} `);
    }
}

/**
 * Summarize older messages to maintain context within limits
 */
export async function summarizeOldMessages(
    messages: Array<{ role: string; content: string }>,
    maxMessages: number = 35
): Promise<{
    recentMessages: Array<{ role: string; content: string }>;
    summary?: string;
}> {
    if (messages.length <= maxMessages || !FEATURE_FLAGS.context_summarization) {
        return { recentMessages: messages };
    }

    const oldMessages = messages.slice(0, messages.length - maxMessages);
    const recentMessages = messages.slice(-maxMessages);

    log('info', `Summarizing ${oldMessages.length} old messages`);

    try {
        const summaryPrompt = `Summarize the following conversation, focusing on:
1. Key business information mentioned
2. User's goals and preferences
3. Important decisions made
4. Any assets or content created

Conversation:
${oldMessages.map(m => `${m.role}: ${m.content.substring(0, 500)}`).join('\n')}

Provide a concise summary in 2 - 3 paragraphs.`;

        const summary = await callGeminiOrchestrator([
            { role: 'user', content: summaryPrompt },
        ]);

        log('success', 'Messages summarized successfully');
        return { recentMessages, summary };
    } catch (error) {
        log('error', `Summarization failed: ${error} `);
        return { recentMessages };
    }
}

/**
 * Modify response (make shorter/longer)
 */
export async function modifyResponse(
    originalResponse: string,
    modification: 'shorter' | 'longer',
    context: string
): Promise<string> {
    log('info', `Modifying response: make ${modification} `);

    const prompt = modification === 'shorter'
        ? `Make this response more concise while keeping the key points: \n\n${originalResponse} `
        : `Expand this response with more details and examples: \n\n${originalResponse} \n\nContext: ${context} `;

    try {
        return await callGeminiOrchestrator([
            { role: 'user', content: prompt },
        ]);
    } catch (error) {
        log('error', `Modification failed: ${error} `);
        return originalResponse;
    }
}

/**
 * Perform a web search using Tongyi DeepResearch
 */
export async function performWebSearch(query: string): Promise<string> {
    log('info', `Performing web search: "${query.substring(0, 50)}..."`);

    const searchPrompt = `Search the web and provide current, accurate information about: ${query}
    
Please provide:
1. Key facts and information
2. Recent developments(if applicable)
    3. Source references where possible
4. A clear, well - organized summary`;

    try {
        const result = await callTongyiDeepResearch(searchPrompt);
        if (result) {
            log('success', 'Web search completed');
            return result;
        }
        throw new Error('No results from web search');
    } catch (error) {
        log('error', `Web search failed: ${error} `);
        throw error;
    }
}

/**
 * Perform deep research using Tongyi DeepResearch
 */
export async function performDeepResearch(query: string): Promise<string> {
    log('info', `Performing deep research: "${query.substring(0, 50)}..."`);

    const researchPrompt = `Conduct comprehensive, in -depth research on: ${query}

Please provide a thorough analysis including:
1. Background and context
2. Key findings and insights
3. Multiple perspectives on the topic
4. Data and statistics where available
5. Expert opinions and sources
6. Recent developments and trends
7. Practical implications and recommendations

Be thorough and detailed in your research.`;

    try {
        const result = await callTongyiDeepResearch(researchPrompt);
        if (result) {
            log('success', 'Deep research completed');
            return result;
        }
        throw new Error('No results from deep research');
    } catch (error) {
        log('error', `Deep research failed: ${error} `);
        throw error;
    }
}

/**
 * Think longer - uses DeepSeek R1's extended reasoning
 */
export async function performThinkLonger(
    query: string,
    conversationHistory: Array<{ role: string; content: string }> = []
): Promise<string> {
    log('info', `Think longer mode: "${query.substring(0, 50)}..."`);

    const thinkPrompt = `Take your time and think deeply about this request.Consider multiple angles and provide a comprehensive, well - reasoned response.

    User's request: ${query}

Please:
1. Analyze the problem from multiple perspectives
2. Consider potential edge cases and nuances
3. Provide detailed reasoning for your conclusions
4. Give a thorough, complete answer`;

    const messages = [
        ...conversationHistory.slice(-5),
        { role: 'user', content: thinkPrompt }
    ];

    try {
        const result = await callGeminiOrchestrator(messages, false);
        log('success', 'Think longer completed');
        return result;
    } catch (error) {
        log('error', `Think longer failed: ${error} `);
        throw error;
    }
}

/**
 * Fast mode - uses DeepSeek directly for quick answers without routing overhead
 */
export async function performFast(
    query: string,
    conversationHistory: Array<{ role: string; content: string }> = []
): Promise<string> {
    log('info', `Fast mode: "${query.substring(0, 50)}..."`);

    const messages = [
        { role: 'system', content: 'You are a helpful AI assistant. Respond quickly and concisely while still being accurate and helpful.' },
        ...conversationHistory.slice(-5),
        { role: 'user', content: query }
    ];

    try {
        const result = await callGeminiOrchestrator(messages, false);
        log('success', 'Fast mode completed');
        return result;
    } catch (error) {
        log('error', `Fast mode failed: ${error} `);
        throw error;
    }
}

/**
 * Enhance a user's prompt using DeepSeek R1
 * Makes prompts clearer, more specific, and optimized for AI
 */
export async function enhancePrompt(prompt: string): Promise<string> {
    log('info', `Enhancing prompt: "${prompt.substring(0, 50)}..."`);

    const enhanceRequest = `You are a prompt enhancement expert.Improve the following prompt to be:
1. Clearer and more specific
2. Better structured for AI understanding
3. More likely to get high - quality results
4. Keep the original intent but make it more effective

Original prompt: "${prompt}"

Return ONLY the enhanced prompt, nothing else. Do not include explanations or prefixes like "Enhanced prompt:".Just the improved prompt text itself.`;

    try {
        const result = await callGeminiOrchestrator([
            { role: 'user', content: enhanceRequest }
        ], false);

        if (result && result.trim()) {
            log('success', 'Prompt enhanced successfully');
            // Clean up any quotes or prefixes that might be in the response
            let enhanced = result.trim();
            if (enhanced.startsWith('"') && enhanced.endsWith('"')) {
                enhanced = enhanced.slice(1, -1);
            }
            return enhanced;
        }
        log('warning', 'Enhancement returned empty, using original');
        return prompt;
    } catch (error) {
        log('error', `Prompt enhancement failed: ${error} `);
        return prompt; // Return original on failure
    }
}

/**
 * Generate a concise chat name based on the user's first message
 * Uses Gemini 2.0 Flash (free) to create a meaningful 2-5 word title
 */
export async function generateChatName(firstMessage: string): Promise<string> {
    console.log('🏷️ [generateChatName] Called with:', firstMessage);
    log('info', `Generating chat name for: "${firstMessage.substring(0, 50)}..."`);

    // For empty messages, return default
    if (!firstMessage || firstMessage.trim().length === 0) {
        console.log('🏷️ [generateChatName] Empty message - returning default');
        return 'New Chat';
    }

    // For single character messages only, use a default
    if (firstMessage.trim().length <= 1) {
        console.log('🏷️ [generateChatName] Single char message - using default');
        return 'Quick Chat';
    }

    const nameRequest = `Generate a very short, concise title for a chat conversation that starts with this message:
"${firstMessage}"

Rules:
- Maximum 4 words, ideally 2-3 words
- Be descriptive but brief
- No quotes, no punctuation at the end
- Title case (capitalize important words)
- Focus on the main topic, intent, or context
- For greetings, use friendly descriptive titles

Examples:
- "hey" → "Friendly Chat"
- "hello" → "Hello There"
- "hi" → "Quick Hello"
- "hi there" → "Casual Greeting"
- "what's up" → "Casual Check-In"
- "good morning" → "Morning Chat"
- "Help me write a business plan" → "Business Plan Help"
- "What is machine learning?" → "Machine Learning Basics"
- "Create a logo for my startup" → "Startup Logo Design"
- "Explain quantum physics" → "Quantum Physics Explained"
- "Write code for a todo app" → "Todo App Code"

Return ONLY the title, nothing else:`;

    try {
        const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';
        console.log('🏷️ [generateChatName] API Key present:', !!apiKey, 'Length:', apiKey.length);

        if (!apiKey) {
            console.log('🏷️ [generateChatName] ❌ No API key - using fallback');
            log('warning', 'No API key for chat name generation');
            return firstMessage.substring(0, 40) + (firstMessage.length > 40 ? '...' : '');
        }

        console.log('🏷️ [generateChatName] Making API request to OpenRouter...');
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'HTTP-Referer': 'https://kroniq.ai',
                'X-Title': 'KroniQ AI Platform',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: ORCHESTRATOR_MODEL, // google/gemini-2.0-flash-exp:free
                messages: [{ role: 'user', content: nameRequest }],
                max_tokens: 50,
            }),
        });

        console.log('🏷️ [generateChatName] Response status:', response.status, response.statusText);

        if (!response.ok) {
            console.log('🏷️ [generateChatName] ❌ API error - using fallback');
            log('error', `Chat name API error: ${response.status}`);
            return firstMessage.substring(0, 40) + (firstMessage.length > 40 ? '...' : '');
        }

        const data = await response.json();
        console.log('🏷️ [generateChatName] API response data:', JSON.stringify(data, null, 2));

        const result = data.choices?.[0]?.message?.content;
        console.log('🏷️ [generateChatName] Raw result:', result);

        if (result && result.trim()) {
            // Clean up the result
            let name = result.trim();
            // Remove quotes if present
            if ((name.startsWith('"') && name.endsWith('"')) || (name.startsWith("'") && name.endsWith("'"))) {
                name = name.slice(1, -1);
            }
            // Remove any trailing punctuation
            name = name.replace(/[.!?:;,]+$/, '');
            // Limit to reasonable length
            const words = name.split(/\s+/).slice(0, 5);
            name = words.join(' ');

            console.log('🏷️ [generateChatName] ✅ Cleaned name:', name);

            if (name.length > 0 && name.length <= 50) {
                log('success', `Generated chat name: "${name}"`);
                return name;
            }
        }

        // Fallback: For short messages, use context-aware defaults rather than raw message
        console.log('🏷️ [generateChatName] ⚠️ Empty result - using smart fallback');
        log('warning', 'Name generation returned empty, using smart fallback');

        // Smart fallback based on message content
        const msg = firstMessage.toLowerCase().trim();
        if (['hey', 'hi', 'hello', 'yo', 'sup'].some(g => msg.startsWith(g))) {
            return 'Friendly Chat';
        }
        if (msg.includes('morning') || msg.includes('evening') || msg.includes('night')) {
            return 'Greeting Chat';
        }
        if (firstMessage.length <= 10) {
            return 'Quick Chat';
        }
        return firstMessage.substring(0, 40) + (firstMessage.length > 40 ? '...' : '');
    } catch (error) {
        console.log('🏷️ [generateChatName] ❌ Exception:', error);
        log('error', `Chat name generation failed: ${error}`);

        // Smart fallback for errors too
        const msg = firstMessage.toLowerCase().trim();
        if (['hey', 'hi', 'hello', 'yo', 'sup'].some(g => msg.startsWith(g))) {
            return 'Friendly Chat';
        }
        if (firstMessage.length <= 10) {
            return 'Quick Chat';
        }
        return firstMessage.substring(0, 40) + (firstMessage.length > 40 ? '...' : '');
    }
}

// ===== PHASE 2: UNIFIED PROCESSING FLOW =====

/**
 * Fetch current usage limits for a user from Supabase
 */
export async function fetchUserLimits(userId: string): Promise<{
    tokensUsed: number;
    tokensLimit: number;
    imagesUsed: number;
    imagesLimit: number;
    videosUsed: number;
    videosLimit: number;
    musicUsed: number;
    musicLimit: number;
    ttsUsed: number;
    ttsLimit: number;
    pptUsed: number;
    pptLimit: number;
}> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('tokens_used, tokens_limit, images_used, images_limit, videos_used, videos_limit, music_used, music_limit, tts_used, tts_limit, ppt_used, ppt_limit')
            .eq('id', userId)
            .single();

        if (error || !data) {
            log('warning', `Failed to fetch user limits: ${error?.message}`);
            // Return default limits based on free tier
            return {
                tokensUsed: 0, tokensLimit: TIER_LIMITS.FREE.chatMessages,
                imagesUsed: 0, imagesLimit: TIER_LIMITS.FREE.images,
                videosUsed: 0, videosLimit: TIER_LIMITS.FREE.videos,
                musicUsed: 0, musicLimit: TIER_LIMITS.FREE.music,
                ttsUsed: 0, ttsLimit: TIER_LIMITS.FREE.tts,
                pptUsed: 0, pptLimit: TIER_LIMITS.FREE.ppt,
            };
        }

        return {
            tokensUsed: data.tokens_used || 0,
            tokensLimit: data.tokens_limit || TIER_LIMITS.FREE.chatMessages,
            imagesUsed: data.images_used || 0,
            imagesLimit: data.images_limit || TIER_LIMITS.FREE.images,
            videosUsed: data.videos_used || 0,
            videosLimit: data.videos_limit || TIER_LIMITS.FREE.videos,
            musicUsed: data.music_used || 0,
            musicLimit: data.music_limit || TIER_LIMITS.FREE.music,
            ttsUsed: data.tts_used || 0,
            ttsLimit: data.tts_limit || TIER_LIMITS.FREE.tts,
            pptUsed: data.ppt_used || 0,
            pptLimit: data.ppt_limit || TIER_LIMITS.FREE.ppt,
        };
    } catch (error) {
        log('error', `Error fetching user limits: ${error}`);
        return {
            tokensUsed: 0, tokensLimit: TIER_LIMITS.FREE.chatMessages,
            imagesUsed: 0, imagesLimit: TIER_LIMITS.FREE.images,
            videosUsed: 0, videosLimit: TIER_LIMITS.FREE.videos,
            musicUsed: 0, musicLimit: TIER_LIMITS.FREE.music,
            ttsUsed: 0, ttsLimit: TIER_LIMITS.FREE.tts,
            pptUsed: 0, pptLimit: TIER_LIMITS.FREE.ppt,
        };
    }
}

/**
 * Check if a specific generation type is allowed based on current limits
 */
export function checkGenerationAllowed(
    intent: TaskType,
    limits: Awaited<ReturnType<typeof fetchUserLimits>>
): {
    allowed: boolean;
    remaining: number;
    total: number;
    warningMessage: string | null;
    upgradeReason?: string;
} {
    let used: number;
    let limit: number;
    let type: string;

    switch (intent) {
        case 'image':
        case 'image_edit':
            used = limits.imagesUsed;
            limit = limits.imagesLimit;
            type = 'images';
            break;
        case 'video':
            used = limits.videosUsed;
            limit = limits.videosLimit;
            type = 'videos';
            break;
        case 'music':
            used = limits.musicUsed;
            limit = limits.musicLimit;
            type = 'music generations';
            break;
        case 'tts':
            used = limits.ttsUsed;
            limit = limits.ttsLimit;
            type = 'text-to-speech';
            break;
        case 'ppt':
            used = limits.pptUsed;
            limit = limits.pptLimit;
            type = 'presentations';
            break;
        case 'chat':
        default:
            used = limits.tokensUsed;
            limit = limits.tokensLimit;
            type = 'tokens';
            break;
    }

    const remaining = Math.max(0, limit - used);
    const percentRemaining = limit > 0 ? remaining / limit : 0;

    // Check if exhausted
    if (remaining <= 0) {
        return {
            allowed: false,
            remaining: 0,
            total: limit,
            warningMessage: null,
            upgradeReason: `You've used all ${limit} ${type} this month. Upgrade for more!`,
        };
    }

    // Check if warning threshold
    let warningMessage: string | null = null;
    if (percentRemaining <= WARNING_THRESHOLD) {
        warningMessage = `⚠️ ${remaining} ${type} remaining this month`;
    }

    return {
        allowed: true,
        remaining,
        total: limit,
        warningMessage,
    };
}

/**
 * Unified request interface for all KroniQ AI operations
 */
export interface UnifiedKroniqRequest {
    userMessage: string;
    conversationHistory: Array<{ role: string; content: string; mediaUrl?: string; mediaType?: string }>;
    projectId: string;
    projectSettings?: {
        name?: string;
        systemPrompt?: string;
        stylePreferences?: string;
    };
    userId: string;
    userTier: UserTier;
    forceTaskType?: TaskType;
}

/**
 * Unified response from the KroniQ AI orchestrator
 */
export interface UnifiedKroniqResponse {
    // Core result
    success: boolean;
    interpretation: InterpretationResult;

    // Usage information
    usageSummary: {
        type: string;
        used: number;
        remaining: number;
        total: number;
        warningShown: boolean;
    };

    // Pre-flight checks
    generationAllowed: boolean;
    upgradeRequired: boolean;
    upgradeReason?: string;
}

/**
 * UNIFIED PROCESSING FUNCTION
 * This is the main entry point for all KroniQ AI requests.
 * It handles: interpretation, limit checking, warning generation, and usage tracking.
 */
export async function processKroniqRequest(
    request: UnifiedKroniqRequest
): Promise<UnifiedKroniqResponse> {
    log('info', `[UnifiedProcess] Processing request for user ${request.userId.substring(0, 8)}...`);

    // Step 1: Fetch current user limits
    const limits = await fetchUserLimits(request.userId);
    log('info', `[UnifiedProcess] User limits fetched: ${limits.tokensUsed}/${limits.tokensLimit} tokens`);

    // Step 2: Get conversation context (or create empty)
    let context: ConversationContext;
    try {
        context = await getContext(request.projectId, request.userId);
    } catch {
        context = {
            longTerm: {},
            shortTerm: {},
            version: 1,
            lastUpdated: new Date().toISOString(),
        };
    }

    // Step 3: Interpret the request through Gemini
    const interpretation = await interpretRequest(
        request.userMessage,
        request.conversationHistory,
        context,
        {
            userTier: request.userTier,
            forceTaskType: request.forceTaskType,
        }
    );

    // Step 4: Check if upgrade is required (from Gemini's response)
    if (interpretation.upgradeRequired) {
        return {
            success: false,
            interpretation,
            usageSummary: {
                type: 'unknown',
                used: 0,
                remaining: 0,
                total: 0,
                warningShown: false,
            },
            generationAllowed: false,
            upgradeRequired: true,
            upgradeReason: interpretation.upgradeReason || 'Limit reached',
        };
    }

    // Step 5: Check limits for the detected intent
    const limitCheck = checkGenerationAllowed(interpretation.intent, limits);

    if (!limitCheck.allowed) {
        log('warning', `[UnifiedProcess] Generation blocked: ${limitCheck.upgradeReason}`);
        return {
            success: false,
            interpretation: {
                ...interpretation,
                upgradeRequired: true,
                upgradeReason: limitCheck.upgradeReason,
            },
            usageSummary: {
                type: interpretation.intent,
                used: limitCheck.total - limitCheck.remaining,
                remaining: 0,
                total: limitCheck.total,
                warningShown: false,
            },
            generationAllowed: false,
            upgradeRequired: true,
            upgradeReason: limitCheck.upgradeReason,
        };
    }

    // Step 6: Add warning message if near limit
    if (limitCheck.warningMessage && !interpretation.warningMessage) {
        interpretation.warningMessage = limitCheck.warningMessage;
    }

    log('success', `[UnifiedProcess] Request processed: intent=${interpretation.intent}, confidence=${interpretation.confidence}`);

    // Step 7: Return success with full context
    return {
        success: true,
        interpretation,
        usageSummary: {
            type: interpretation.intent,
            used: limitCheck.total - limitCheck.remaining,
            remaining: limitCheck.remaining,
            total: limitCheck.total,
            warningShown: limitCheck.warningMessage !== null,
        },
        generationAllowed: true,
        upgradeRequired: false,
    };
}

/**
 * Update usage after a successful generation
 */
export async function recordUsage(
    userId: string,
    intent: TaskType,
    tokensUsed: number = 0
): Promise<void> {
    try {
        const updateField = (() => {
            switch (intent) {
                case 'image':
                case 'image_edit':
                    return { images_used: tokensUsed > 0 ? tokensUsed : 1 };
                case 'video':
                    return { videos_used: tokensUsed > 0 ? tokensUsed : 1 };
                case 'music':
                    return { music_used: tokensUsed > 0 ? tokensUsed : 1 };
                case 'tts':
                    return { tts_used: tokensUsed > 0 ? tokensUsed : 1 };
                case 'ppt':
                    return { ppt_used: tokensUsed > 0 ? tokensUsed : 1 };
                case 'chat':
                default:
                    return { tokens_used: tokensUsed };
            }
        })();

        // For increment operations, we need to fetch current value first
        const { data: currentData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (currentData) {
            const fieldName = Object.keys(updateField)[0];
            const incrementValue = Object.values(updateField)[0] as number;
            const currentValue = (currentData as any)[fieldName] || 0;

            const { error } = await supabase
                .from('profiles')
                .update({ [fieldName]: currentValue + incrementValue })
                .eq('id', userId);

            if (error) {
                log('error', `Failed to record usage: ${error.message}`);
            } else {
                log('info', `[UnifiedProcess] Recorded usage: ${fieldName} += ${incrementValue}`);
            }
        }
    } catch (error) {
        log('error', `Error recording usage: ${error}`);
    }
}

// ===== EXPORTS =====

export default {
    interpretRequest,
    updateContext,
    getContext,
    getContextVersions,
    resetToVersion,
    checkToolAccess,
    recordToolUsage,
    summarizeOldMessages,
    modifyResponse,
    callTongyiDeepResearch,
    performWebSearch,
    performDeepResearch,
    performThinkLonger,
    enhancePrompt,
    generateChatName,
    // Phase 2: Unified processing
    processKroniqRequest,
    fetchUserLimits,
    checkGenerationAllowed,
    recordUsage,
    FEATURE_FLAGS,
};
