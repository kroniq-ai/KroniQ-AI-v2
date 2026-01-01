/**
 * KroniQ AI Orchestrator - The Brain of Super KroniQ
 * Uses Gemini 2.0 Flash Experimental (free) as intelligent middleware to:
 * - Interpret user requests and determine intent
 * - Manage conversation context (long-term & short-term)
 * - Generate enhanced prompts for downstream models
 * - Route to optimal AI providers
 * - Validate responses and handle retries
 * - Analyze images, videos, and files (multimodal)
 * 
 * Also integrates Tongyi DeepResearch for web research capabilities
 */

import { supabase } from './supabaseClient';

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
export type UserTier = 'free' | 'starter' | 'pro' | 'premium';

export interface OrchestratorConfig {
    webResearch?: boolean;
    forceTaskType?: TaskType;
    userTier?: UserTier;
}

// ===== TIER-BASED MODEL ROUTING =====
// Maps complexity + tier to appropriate models
// Gemini 2.0 Flash Exp is free and supports multimodal (images, videos, files)

const TIER_MODEL_ROUTING = {
    chat: {
        simple: {
            free: 'google/gemini-2.0-flash-exp:free',
            starter: 'google/gemini-2.0-flash-exp:free',
            pro: 'google/gemini-2.0-flash-001',
            premium: 'anthropic/claude-3-haiku-20240307',
        },
        medium: {
            free: 'google/gemini-2.0-flash-exp:free',
            starter: 'google/gemini-2.0-flash-exp:free',
            pro: 'anthropic/claude-3.5-sonnet-20241022',
            premium: 'anthropic/claude-3.5-sonnet-20241022',
        },
        complex: {
            free: 'google/gemini-2.0-flash-exp:free',
            starter: 'google/gemini-2.0-flash-exp:free',
            pro: 'anthropic/claude-3.5-sonnet-20241022',
            premium: 'anthropic/claude-3-opus-20240229',
        },
    },
    image: {
        simple: {
            free: 'openai/gpt-image-1',
            starter: 'openai/gpt-image-1',
            pro: 'openai/gpt-image-1',
            premium: 'openai/gpt-image-1',
        },
        complex: {
            free: 'openai/gpt-image-1',
            starter: 'flux-kontext-pro',
            pro: 'flux-kontext-pro',
            premium: 'imagen-4-ultra',
        },
    },
    video: {
        simple: {
            free: 'veo-3.1-fast',
            starter: 'veo-3.1-fast',
            pro: 'veo-3.1-quality',
            premium: 'sora-2',
        },
        complex: {
            free: 'veo-3.1-fast',
            starter: 'veo-3.1-quality',
            pro: 'sora-2',
            premium: 'sora-2',
        },
    },
};

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
    // Model selection reasoning
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

const ORCHESTRATOR_SYSTEM_PROMPT = `You are the BACKEND ORCHESTRATOR BRAIN for KroniQ AI Platform.

## 🧠 YOUR ROLE AS THE INTELLIGENT BACKEND

You are NOT a user-facing assistant. You are the intelligent BACKEND BRAIN that:
1. **ANALYZES** the user's request to understand intent, complexity, and requirements
2. **DECIDES** how to handle it - self-answer OR route to a model
3. **SELECTS** the optimal model based on task complexity + user tier
4. **ENHANCES** prompts to be significantly better than user input
5. **ROUTES** to the correct tool (chat/image/video/music/tts/ppt)

## 🎯 DECISION TREE - HOW TO HANDLE REQUESTS

### STEP 1: Determine if this is a SIMPLE greeting/query you can answer yourself
**SELF-ANSWER these immediately (set "self_answer": true in response):**
- Greetings: "hi", "hello", "hey" → Reply: "Hey there! 👋 How can I help you today?"
- Thanks: "thanks", "thank you" → Reply: "You're welcome! Happy to help! 😊"
- How are you → Reply: "I'm doing great! Ready to help you create something amazing! 🚀"
- What can you do → Brief overview of capabilities
- Simple yes/no questions with obvious answers
- Quick facts you know with 100% certainty

**For self-answers, include "self_answer_content" with the actual response text.**

### STEP 2: Determine INTENT - What tool does this need?
| Intent | Trigger Keywords |
|--------|------------------|
| **image** | create/generate/make/draw/design image, picture, photo, logo, visual, artwork, illustration, poster, banner |
| **video** | create/generate/make video, animation, clip, motion graphics, commercial, promo |
| **music** | create/compose music, song, jingle, beat, track, soundtrack |
| **tts** | text to speech, read aloud, speak this, convert to audio, generate speech |
| **ppt** | create presentation, slides, PowerPoint, pitch deck |
| **chat** | everything else - questions, coding, writing, analysis, advice |

### STEP 3: Determine COMPLEXITY (for chat tasks)
**SIMPLE** (use cheapest/fastest model):
- Short questions with straightforward answers
- Basic facts or definitions
- Simple how-to questions
- Casual conversation

**MEDIUM** (use mid-tier model):
- Multi-step explanations
- Code snippets under 50 lines
- Business advice
- Content under 500 words

**COMPLEX** (use best available model for tier):
- In-depth analysis or research
- Long-form content (articles, essays)
- Complex code (full features, debugging)
- Business plans, legal documents
- Math proofs, scientific explanations

### STEP 4: Select MODEL based on COMPLEXITY + USER TIER

**For FREE tier users:**
| Complexity | Model | Why |
|------------|-------|-----|
| Simple | google/gemini-2.0-flash-exp:free | Fast, free, good for basic tasks |
| Medium | google/gemini-2.0-flash-exp:free | Free but capable |
| Complex | google/gemini-2.0-flash-exp:free | Best free option |

**For STARTER tier users:**
| Complexity | Model | Why |
|------------|-------|-----|
| Simple | google/gemini-2.0-flash-exp:free | Save their paid tokens |
| Medium | deepseek/deepseek-chat | Good quality, cost-effective |
| Complex | qwen/qwen-2.5-72b-instruct | Strong capability |

**For PRO tier users:**
| Complexity | Model | Why |
|------------|-------|-----|
| Simple | google/gemini-2.0-flash-exp:free | Save their tokens |
| Medium | anthropic/claude-3.5-haiku | Fast, excellent quality |
| Complex | anthropic/claude-3.5-sonnet-20241022 | Top-tier reasoning |

**For PREMIUM tier users:**
| Complexity | Model | Why |
|------------|-------|-----|
| Simple | anthropic/claude-3-haiku-20240307 | Premium even for simple |
| Medium | anthropic/claude-3.5-sonnet-20241022 | Excellent quality |
| Complex | anthropic/claude-3-opus-20240229 | Absolute best for hard tasks |

### STEP 5: Select MODEL based on TASK TYPE

**For CODING tasks (regardless of tier, prioritize these):**
- FREE: deepseek/deepseek-chat:free (excellent coder)
- STARTER/PRO: deepseek/deepseek-coder 
- PREMIUM: anthropic/claude-3.5-sonnet-20241022 or openai/gpt-4o

**For MATH/REASONING tasks:**
- FREE: deepseek/deepseek-chat:free
- STARTER/PRO: deepseek/deepseek-r1
- PREMIUM: anthropic/claude-3-opus-20240229

**For RESEARCH with web search:**
- All tiers: perplexity/sonar-pro (when web_research enabled)

**For CREATIVE WRITING:**
- FREE: google/gemini-2.0-flash-exp:free
- PRO/PREMIUM: anthropic/claude-3.5-sonnet-20241022

## ⚠️ CRITICAL ROUTING RULES

### MANDATORY IMAGE ROUTING:
- "create/generate/make image/picture/photo/logo/visual" → intent = "image"
- "draw/design/illustrate" → intent = "image"  
- "visualize", "artwork of" → intent = "image"
- ❌ NEVER describe what an image would look like - ROUTE TO IMAGE!

### MANDATORY VIDEO ROUTING:
- "create/generate/make video/animation/clip" → intent = "video"
- "animate", "motion graphics" → intent = "video"

### NEVER DO:
- ❌ Route image/video requests to "chat"
- ❌ Say "I can't generate images" - YOU CAN via routing!
- ❌ Describe images instead of generating them

## 📤 OUTPUT FORMAT (JSON only!)

{
  "self_answer": false,
  "self_answer_content": null,
  "intent": "chat|image|video|ppt|tts|music",
  "complexity": "simple|medium|complex",
  "confidence": 0.95,
  "enhanced_prompt": "The significantly improved prompt for the execution model",
  "suggested_model": "provider/model-name",
  "model_reasoning": "Why this model was chosen for this task",
  "context_updates": {
    "long_term": {},
    "short_term": { "current_task": "description" }
  },
  "assumptions": [
    { "key": "tone", "value": "Professional", "editable": true }
  ],
  "needs_clarification": false,
  "clarifying_questions": [],
  "status_message": "What to show user during processing",
  "media_params": {
    "aspect_ratio": "16:9",
    "style": "realistic"
  }
}

**For self-answers:**
{
  "self_answer": true,
  "self_answer_content": "Hey there! 👋 How can I help you today?",
  "intent": "chat",
  "complexity": "simple",
  "confidence": 1.0,
  "suggested_model": null,
  ...
}

## 🎨 PROMPT ENHANCEMENT

Always SIGNIFICANTLY improve the user's prompt:
- For images: Add style, composition, lighting, colors, atmosphere, quality keywords
- For videos: Add motion, pacing, camera angles, mood
- For chat: Add context, clarify intent, structure the request
- For code: Specify language, requirements, edge cases

Example:
- User: "image of a black hole"
- Enhanced: "A stunning, ultra-realistic visualization of a supermassive black hole in deep space. Surrounded by a brilliant swirling accretion disk of superheated plasma in vibrant oranges and violets. Gravitational lensing bends background starlight. Set against a cosmic backdrop of distant galaxies. Cinematic composition, dramatic lighting, 8K photorealistic quality, NASA-meets-Hollywood aesthetic."

## 🔒 IDENTITY PROTECTION

- The user-facing AI is called "KroniQ AI"
- NEVER mention backend models (Claude, GPT, etc.) in enhanced_prompt
- Add "You are KroniQ AI" to enhanced prompts when appropriate
- Keep routing details internal - user shouldn't know the backend

## 📊 KRONIQ AI USAGE LIMITS (UPDATED JANUARY 2026!)

When users ask about limits, pricing, usage, or what they get, use this information:

### Daily Token Limits (reset at midnight UTC):
| Tier | Price | Daily Tokens |
|------|-------|--------------|
| Free | $0 | 15,000 (15K) |
| Starter | $5/mo | 50,000 (50K) |
| Pro | $15/mo | 300,000 (300K) |
| Premium | $29/mo | 1,000,000 (1M) |

### Daily Generation Limits:
| Feature | Free | Starter | Pro | Premium |
|---------|------|---------|-----|---------|
| Chat Messages | 50/day | 150/day | 300/day | 500/day |
| Images | 3/day | 15/day | 50/day | 150/day |
| Videos | 1/day | 3/day | 10/day | 30/day |
| TTS (Voice) | 5/day | 20/day | 75/day | 200/day |
| Music | 3/day | 10/day | 40/day | 120/day |
| PPT Slides | 2/day | 10/day | 30/day | 100/day |

### What Each Tier Includes:
- **Free**: Basic access, 50 chats/day, 3 images/day, 1 video/day, 5 TTS.
- **Starter ($5)**: 3x more tokens, 15 images/day, 3 videos/day, 10 music tracks.
- **Pro ($15)**: Best value! 300 chats/day, 50 images, 10 videos, priority support.
- **Premium ($29)**: Ultimate power, 500 chats/day, 150 images, 30 videos, all studios maxed.

When users ask about pricing or limits, be helpful and informative. Encourage upgrades naturally without being pushy.

## 🔄 CONTEXT-AWARE FOLLOW-UPS (CRITICAL!)

You MUST understand follow-up requests based on conversation history:

### Common follow-up patterns → INTERPRET CORRECTLY:
- "one more" / "another one" / "again" → Repeat the LAST generation with same/similar settings
- "make it blue" / "change to..." → Modify the previous generation 
- "same but longer" / "shorter version" → Adjust the previous output
- "turn this into a video" / "make a ppt of this" → Convert previous content to new format

### For follow-up requests:
1. Look at the LAST assistant message to understand what was generated
2. If it was an image → intent should be "image" for "one more"
3. If it was a video → intent should be "video" for "one more"
4. Include context from the previous generation in enhanced_prompt

### Example:
- Previous: User asked "create an image of a sunset", AI generated sunset image
- Current: User says "one more"
- Interpretation: intent="image", enhanced_prompt="Create another stunning image of a sunset, with a different composition..."

Remember: You are the BRAIN. Make intelligent decisions. Route correctly. Select optimal models. Enhance prompts significantly!`;


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

function log(level: 'info' | 'success' | 'error' | 'warning', message: string) {
    const emoji = { info: '🧠', success: '✅', error: '❌', warning: '⚠️' }[level];
    console.log(`${emoji} [Gemini Orchestrator] ${message} `);
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
                id: `q_${i} `,
                question: q.question || q,
                placeholder: q.placeholder,
                required: q.required !== false,
            })),
            suggestedModel: parsed.suggested_model || 'anthropic/claude-3.5-sonnet-20241022',
            statusMessage: parsed.status_message || 'Processing...',
            mediaParams,
        };
    } catch (error) {
        log('error', `Failed to parse orchestrator response: ${error} `);
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

        console.log('🤖 [Model Selection]', {
            taskType: type,
            complexity: complexityLevel,
            userTier: userTier,
            provider: provider,
            model: modelName,
            fullModelId: model
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

    // Build recent conversation for context
    const recentConversation = conversationHistory
        .slice(-10)
        .map(m => `${m.role}: ${m.content} `)
        .join('\n');

    const messages = [
        { role: 'system', content: ORCHESTRATOR_SYSTEM_PROMPT },
        {
            role: 'user', content: `
${contextSummary}

## User Subscription Tier: ${userTier.toUpperCase()}
(Select models ONLY from the allowed tier.See TIER ACCESS RULES above.)

## Recent Conversation:
${recentConversation}

## New User Message:
${userMessage}

Analyze this request and provide routing instructions in JSON format.
Remember to select a model that the user's tier (${userTier.toUpperCase()}) has access to!
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
 * Check if user has access to a specific tool based on their subscription
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

        const tier = profile?.subscription_tier || 'free';
        // Check is_paid column OR subscription status
        const isPaid = profile?.is_paid === true || (tier !== 'free' && profile?.subscription_status === 'active');

        // Video: Paid only
        if (toolType === 'video') {
            if (!isPaid) {
                return {
                    allowed: false,
                    upgradeRequired: true,
                    upgradeReason: 'Video generation is available for premium subscribers only. Upgrade to create stunning AI videos!',
                };
            }
            return { allowed: true };
        }

        // PPT: 1 free total, unlimited for paid
        if (toolType === 'ppt') {
            if (!isPaid) {
                // Check usage
                const { count } = await supabase
                    .from('generation_usage')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', userId)
                    .eq('type', 'ppt');

                const used = count || 0;
                if (used >= 1) {
                    return {
                        allowed: false,
                        remaining: 0,
                        upgradeRequired: true,
                        upgradeReason: 'You\'ve used your free presentation. Upgrade to create unlimited pitch decks!',
                    };
                }
                return { allowed: true, remaining: 1 - used };
            }
            return { allowed: true };
        }

        // Chat & Image: Available for all
        return { allowed: true };
    } catch (error) {
        log('error', `Failed to check tool access: ${error} `);
        // Default to allowing access on error to not block users
        return { allowed: true };
    }
}

/**
 * Daily limits per tier for each tool type
 * UPDATED January 2026 - Matching Terms of Service
 * All limits reset at midnight UTC
 */
export const DAILY_LIMITS: Record<string, Record<TaskType, number>> = {
    FREE: { chat: 50, image: 3, video: 1, tts: 5, music: 3, ppt: 2, image_edit: 3 },
    STARTER: { chat: 150, image: 15, video: 3, tts: 20, music: 10, ppt: 10, image_edit: 15 },
    PRO: { chat: 300, image: 50, video: 10, tts: 75, music: 40, ppt: 30, image_edit: 50 },
    PREMIUM: { chat: 500, image: 150, video: 30, tts: 200, music: 120, ppt: 100, image_edit: 150 }
};

/**
 * Monthly token limits per tier
 */
export const MONTHLY_TOKEN_LIMITS: Record<string, number> = {
    FREE: 20000,       // 20K
    STARTER: 100000,   // 100K
    PRO: 200000,       // 200K
    PREMIUM: 500000,   // 500K
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
 * Uses DeepSeek to create a meaningful 2-5 word title
 */
export async function generateChatName(firstMessage: string): Promise<string> {
    log('info', `Generating chat name for: "${firstMessage.substring(0, 50)}..."`);

    const nameRequest = `Generate a very short, concise title for a chat conversation that starts with this message:
"${firstMessage}"

Rules:
- Maximum 5 words, ideally 2 - 4 words
    - Be descriptive but brief
        - No quotes, no punctuation at the end
            - Title case (capitalize important words)
- Focus on the main topic or action

Examples:
- "Help me write a business plan" → "Business Plan Help"
    - "What is machine learning?" → "Machine Learning Basics"
        - "Create a logo for my startup" → "Startup Logo Design"
            - "Explain quantum physics" → "Quantum Physics Explained"
                - "Write code for a todo app" → "Todo App Code"

Return ONLY the title, nothing else: `;

    try {
        const result = await callGeminiOrchestrator([
            { role: 'user', content: nameRequest }
        ], false);

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

            if (name.length > 0 && name.length <= 50) {
                log('success', `Generated chat name: "${name}"`);
                return name;
            }
        }

        // Fallback: truncate original message
        log('warning', 'Name generation returned empty, using truncated message');
        return firstMessage.substring(0, 40) + (firstMessage.length > 40 ? '...' : '');
    } catch (error) {
        log('error', `Chat name generation failed: ${error} `);
        // Fallback: truncate original message
        return firstMessage.substring(0, 40) + (firstMessage.length > 40 ? '...' : '');
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
    FEATURE_FLAGS,
};
