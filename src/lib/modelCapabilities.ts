/**
 * KroniQ AI Model Capabilities Database
 * 
 * ⚠️ INTERNAL ONLY - Never expose model names to users!
 * All output should be branded as "KroniQ AI"
 * 
 * This database tells the Gemini orchestrator what each model can do,
 * including constraints like max video duration, image sizes, etc.
 */

// ===== TIER DEFINITIONS =====

export type UserTier = 'FREE' | 'STARTER_2' | 'STARTER' | 'PRO' | 'PREMIUM';

// ===== WARNING THRESHOLDS =====

export const WARNING_THRESHOLD = 0.05; // Warn users at 5% remaining
export const CRITICAL_THRESHOLD = 0.02; // Critical warning at 2%

// ===== TIER LIMITS =====

export const TIER_LIMITS = {
    FREE: {
        chatMessages: 50,
        images: 2,
        videos: 0,
        music: 0,
        tts: 4,
        ppt: 0,
        budgetChat: 0.15,
        budgetImages: 0.05,
        budgetVideos: 0,
        budgetMusic: 0,
        budgetPpt: 0,
    },
    STARTER_2: {
        // Hidden referral tier - FREE models only
        chatMessages: 25,
        images: 10,
        videos: 3,
        music: 0,
        tts: 25,
        ppt: 0,
        budgetChat: 0,
        budgetImages: 0,
        budgetVideos: 0,
        budgetMusic: 0,
        budgetPpt: 0,
    },
    STARTER: {
        chatMessages: 45,
        images: 14,
        videos: 9,
        music: 9,
        tts: 5,
        ppt: 5,
        budgetChat: 0.70,
        budgetImages: 0.55,
        budgetVideos: 0.70,
        budgetMusic: 0.43,
        budgetPpt: 0.25,
    },
    PRO: {
        chatMessages: 110,
        images: 33,
        videos: 21,
        music: 20,
        tts: 12,
        ppt: 12,
        budgetChat: 1.68,
        budgetImages: 1.32,
        budgetVideos: 1.68,
        budgetMusic: 1.02,
        budgetPpt: 0.60,
    },
    PREMIUM: {
        chatMessages: 220,
        images: 66,
        videos: 42,
        music: 41,
        tts: 25,
        ppt: 20,
        budgetChat: 3.36,
        budgetImages: 2.64,
        budgetVideos: 3.36,
        budgetMusic: 2.04,
        budgetPpt: 1.20,
    },
} as const;

// ===== VIDEO MODEL CAPABILITIES =====

export interface VideoCapability {
    id: string;
    maxDuration: number; // seconds
    resolution: '720p' | '1080p' | '4k';
    styles: string[];
    supportsImageToVideo: boolean;
    supportsAudio: boolean;
    minTier: UserTier;
}

export const VIDEO_MODELS: Record<string, VideoCapability> = {
    // FREE tier video (when videos are enabled for starter+)
    'veo3_fast': {
        id: 'veo3_fast',
        maxDuration: 8,
        resolution: '720p',
        styles: ['realistic', 'cinematic', 'artistic'],
        supportsImageToVideo: false,
        supportsAudio: false,
        minTier: 'STARTER',
    },
    'veo3': {
        id: 'veo3',
        maxDuration: 10,
        resolution: '1080p',
        styles: ['realistic', 'cinematic', 'artistic', 'anime', 'vintage'],
        supportsImageToVideo: true,
        supportsAudio: true,
        minTier: 'PRO',
    },
    'kling-2.6': {
        id: 'kling-2.6',
        maxDuration: 5,
        resolution: '720p',
        styles: ['realistic', 'artistic'],
        supportsImageToVideo: true,
        supportsAudio: false,
        minTier: 'PRO',
    },
    'runway-gen3': {
        id: 'runway-gen3',
        maxDuration: 10,
        resolution: '1080p',
        styles: ['cinematic', 'realistic', 'stylized'],
        supportsImageToVideo: true,
        supportsAudio: false,
        minTier: 'PREMIUM',
    },
    'sora-2': {
        id: 'sora-2',
        maxDuration: 20,
        resolution: '1080p',
        styles: ['all'],
        supportsImageToVideo: true,
        supportsAudio: true,
        minTier: 'PREMIUM',
    },
    'wan-2.5': {
        id: 'wan-2.5',
        maxDuration: 5,
        resolution: '1080p',
        styles: ['cinematic', 'realistic'],
        supportsImageToVideo: false,
        supportsAudio: false,
        minTier: 'PRO',
    },
};

// ===== IMAGE MODEL CAPABILITIES =====

export interface ImageCapability {
    id: string;
    maxSize: string;
    aspectRatios: string[];
    styles: string[];
    supportsEdit: boolean;
    supportsInpainting: boolean;
    minTier: UserTier;
}

export const IMAGE_MODELS: Record<string, ImageCapability> = {
    'gpt-image-1': {
        id: 'gpt-image-1',
        maxSize: '1024x1024',
        aspectRatios: ['1:1', '16:9', '9:16'],
        styles: ['realistic', 'artistic', 'cartoon'],
        supportsEdit: false,
        supportsInpainting: false,
        minTier: 'FREE',
    },
    'flux-kontext-pro': {
        id: 'flux-kontext-pro',
        maxSize: '1536x1536',
        aspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:4', '21:9'],
        styles: ['realistic', 'artistic', 'photorealistic', 'illustration', 'anime'],
        supportsEdit: true,
        supportsInpainting: true,
        minTier: 'STARTER',
    },
    'flux-kontext-max': {
        id: 'flux-kontext-max',
        maxSize: '2048x2048',
        aspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:4', '21:9'],
        styles: ['all'],
        supportsEdit: true,
        supportsInpainting: true,
        minTier: 'PRO',
    },
    'imagen-4-ultra': {
        id: 'imagen-4-ultra',
        maxSize: '2048x2048',
        aspectRatios: ['1:1', '16:9', '9:16', '4:3', '3:2'],
        styles: ['photorealistic', 'artistic', 'conceptual'],
        supportsEdit: true,
        supportsInpainting: true,
        minTier: 'PREMIUM',
    },
};

// ===== CHAT MODEL CAPABILITIES =====

export interface ChatCapability {
    id: string;
    contextWindow: number;
    strengths: string[];
    weaknesses: string[];
    bestFor: string[];
    minTier: UserTier;
    isFree: boolean;
}

export const CHAT_MODELS: Record<string, ChatCapability> = {
    'google/gemini-2.0-flash-exp:free': {
        id: 'google/gemini-2.0-flash-exp:free',
        contextWindow: 32000,
        strengths: ['fast', 'multimodal', 'free', 'good reasoning'],
        weaknesses: ['occasional rate limits'],
        bestFor: ['general chat', 'image analysis', 'quick questions'],
        minTier: 'FREE',
        isFree: true,
    },
    'deepseek/deepseek-chat:free': {
        id: 'deepseek/deepseek-chat:free',
        contextWindow: 32000,
        strengths: ['excellent coding', 'free', 'strong reasoning'],
        weaknesses: ['slower'],
        bestFor: ['coding', 'math', 'technical'],
        minTier: 'FREE',
        isFree: true,
    },
    'deepseek/deepseek-coder': {
        id: 'deepseek/deepseek-coder',
        contextWindow: 64000,
        strengths: ['best coding', 'debugging', 'code review'],
        weaknesses: ['less creative'],
        bestFor: ['coding', 'debugging', 'code generation'],
        minTier: 'STARTER',
        isFree: false,
    },
    'qwen/qwen-2.5-72b-instruct': {
        id: 'qwen/qwen-2.5-72b-instruct',
        contextWindow: 128000,
        strengths: ['large context', 'multilingual', 'strong reasoning'],
        weaknesses: ['can be verbose'],
        bestFor: ['long documents', 'research', 'analysis'],
        minTier: 'STARTER',
        isFree: false,
    },
    'anthropic/claude-3-haiku-20240307': {
        id: 'anthropic/claude-3-haiku-20240307',
        contextWindow: 200000,
        strengths: ['fast', 'accurate', 'good for simple tasks'],
        weaknesses: ['less capable than sonnet'],
        bestFor: ['quick answers', 'summarization', 'simple tasks'],
        minTier: 'PRO',
        isFree: false,
    },
    'anthropic/claude-3.5-sonnet-20241022': {
        id: 'anthropic/claude-3.5-sonnet-20241022',
        contextWindow: 200000,
        strengths: ['excellent reasoning', 'coding', 'writing', 'analysis'],
        weaknesses: ['more expensive'],
        bestFor: ['complex tasks', 'coding', 'writing', 'analysis'],
        minTier: 'PRO',
        isFree: false,
    },
    'anthropic/claude-3-opus-20240229': {
        id: 'anthropic/claude-3-opus-20240229',
        contextWindow: 200000,
        strengths: ['best reasoning', 'nuanced understanding', 'complex analysis'],
        weaknesses: ['slowest', 'most expensive'],
        bestFor: ['hardest problems', 'research', 'complex reasoning'],
        minTier: 'PREMIUM',
        isFree: false,
    },
};

// ===== MUSIC MODEL CAPABILITIES =====

export interface MusicCapability {
    id: string;
    maxDuration: number; // seconds
    styles: string[];
    supportsLyrics: boolean;
    supportsInstrumental: boolean;
    minTier: UserTier;
}

export const MUSIC_MODELS: Record<string, MusicCapability> = {
    'suno-v5': {
        id: 'suno-v5',
        maxDuration: 240, // 4 minutes
        styles: ['pop', 'rock', 'electronic', 'hip-hop', 'classical', 'jazz', 'country', 'r&b'],
        supportsLyrics: true,
        supportsInstrumental: true,
        minTier: 'STARTER',
    },
    'lyria': {
        id: 'lyria',
        maxDuration: 120, // 2 minutes
        styles: ['ambient', 'cinematic', 'electronic', 'experimental'],
        supportsLyrics: false,
        supportsInstrumental: true,
        minTier: 'PRO',
    },
};

// ===== TTS MODEL CAPABILITIES =====

export interface TTSCapability {
    id: string;
    maxCharacters: number;
    voiceCount: number;
    languageCount: number;
    supportsCloning: boolean;
    minTier: UserTier;
}

export const TTS_MODELS: Record<string, TTSCapability> = {
    'gemini-tts': {
        id: 'gemini-tts',
        maxCharacters: 1000,
        voiceCount: 4,
        languageCount: 5,
        supportsCloning: false,
        minTier: 'FREE',
    },
    'elevenlabs': {
        id: 'elevenlabs',
        maxCharacters: 5000,
        voiceCount: 50,
        languageCount: 29,
        supportsCloning: true,
        minTier: 'STARTER',
    },
};

// ===== PPT MODEL CAPABILITIES =====

export interface PPTCapability {
    id: string;
    maxSlides: number;
    themeCount: number;
    supportsAnimations: boolean;
    supportsImages: boolean;
    minTier: UserTier;
}

export const PPT_MODELS: Record<string, PPTCapability> = {
    'kroniq-ppt': {
        id: 'kroniq-ppt',
        maxSlides: 20,
        themeCount: 15,
        supportsAnimations: true,
        supportsImages: true,
        minTier: 'STARTER',
    },
};

// ===== SMART MODEL SELECTION =====

export type TaskComplexity = 'simple' | 'medium' | 'complex';
export type TaskType = 'chat' | 'coding' | 'creative' | 'research' | 'math';

/**
 * Get the best chat model for a given tier and task complexity
 * Returns model ID (internal use only - never expose to user)
 */
export function getBestChatModel(
    tier: UserTier,
    complexity: TaskComplexity,
    taskType: TaskType = 'chat'
): string {
    // Coding tasks prioritize DeepSeek
    if (taskType === 'coding') {
        switch (tier) {
            case 'FREE':
                return 'deepseek/deepseek-chat:free';
            case 'STARTER':
                return 'deepseek/deepseek-coder';
            case 'PRO':
            case 'PREMIUM':
                return 'anthropic/claude-3.5-sonnet-20241022';
        }
    }

    // Math/reasoning tasks
    if (taskType === 'math') {
        switch (tier) {
            case 'FREE':
                return 'deepseek/deepseek-chat:free';
            case 'STARTER':
                return 'qwen/qwen-2.5-72b-instruct';
            case 'PRO':
                return 'anthropic/claude-3.5-sonnet-20241022';
            case 'PREMIUM':
                return 'anthropic/claude-3-opus-20240229';
        }
    }

    // General chat/creative/research based on complexity
    const modelMatrix: Record<UserTier, Record<TaskComplexity, string>> = {
        FREE: {
            simple: 'google/gemini-2.0-flash-exp:free',
            medium: 'google/gemini-2.0-flash-exp:free',
            complex: 'google/gemini-2.0-flash-exp:free',
        },
        STARTER_2: {
            simple: 'deepseek/deepseek-chat:free',
            medium: 'deepseek/deepseek-chat:free',
            complex: 'deepseek/deepseek-chat:free',
        },
        STARTER: {
            simple: 'google/gemini-2.0-flash-exp:free',
            medium: 'deepseek/deepseek-chat:free',
            complex: 'qwen/qwen-2.5-72b-instruct',
        },
        PRO: {
            simple: 'google/gemini-2.0-flash-exp:free',
            medium: 'anthropic/claude-3-haiku-20240307',
            complex: 'anthropic/claude-3.5-sonnet-20241022',
        },
        PREMIUM: {
            simple: 'anthropic/claude-3-haiku-20240307',
            medium: 'anthropic/claude-3.5-sonnet-20241022',
            complex: 'anthropic/claude-3-opus-20240229',
        },
    };

    return modelMatrix[tier][complexity];
}

/**
 * Get the best video model for a tier with smart routing
 * Simple prompts use faster/cheaper models, complex prompts use premium models
 */
export function getBestVideoModel(
    tier: UserTier,
    complexity: TaskComplexity = 'medium'
): VideoCapability | null {
    if (tier === 'FREE') return null; // No video for free

    // Smart routing: use cheaper models for simple requests
    const videoMatrix: Record<UserTier, Record<TaskComplexity, string | null>> = {
        FREE: { simple: null, medium: null, complex: null },
        STARTER_2: { simple: null, medium: null, complex: null }, // No video for referral tier
        STARTER: {
            simple: 'veo3_fast',
            medium: 'veo3_fast',
            complex: 'veo3_fast',
        },
        PRO: {
            simple: 'veo3_fast',
            medium: 'veo3',
            complex: 'kling-2.6',
        },
        PREMIUM: {
            simple: 'veo3',
            medium: 'kling-2.6',
            complex: 'sora-2',
        },
    };

    const modelId = videoMatrix[tier]?.[complexity];
    return modelId ? VIDEO_MODELS[modelId] : null;
}

/**
 * Get the best image model for a tier with smart routing
 */
export function getBestImageModel(
    tier: UserTier,
    complexity: TaskComplexity = 'medium'
): ImageCapability {
    // Smart routing for images
    const imageMatrix: Record<UserTier, Record<TaskComplexity, string>> = {
        FREE: {
            simple: 'gpt-image-1',
            medium: 'gpt-image-1',
            complex: 'gpt-image-1',
        },
        STARTER_2: {
            simple: 'gpt-image-1',
            medium: 'gpt-image-1',
            complex: 'gpt-image-1',
        },
        STARTER: {
            simple: 'gpt-image-1',
            medium: 'flux-kontext-pro',
            complex: 'flux-kontext-pro',
        },
        PRO: {
            simple: 'gpt-image-1',
            medium: 'flux-kontext-pro',
            complex: 'flux-kontext-max',
        },
        PREMIUM: {
            simple: 'flux-kontext-pro',
            medium: 'flux-kontext-max',
            complex: 'imagen-4-ultra',
        },
    };

    const modelId = imageMatrix[tier]?.[complexity] || 'gpt-image-1';
    return IMAGE_MODELS[modelId] || IMAGE_MODELS['gpt-image-1'];
}

/**
 * Determine task complexity from prompt
 */
export function analyzePromptComplexity(prompt: string): TaskComplexity {
    const lowercasePrompt = prompt.toLowerCase();

    // Complex indicators
    const complexKeywords = [
        'detailed', 'realistic', 'professional', 'high quality', 'cinematic',
        'photorealistic', '4k', 'hdr', 'intricate', 'complex', 'elaborate',
        'specific style', 'exact', 'precise', 'advanced', 'creative'
    ];

    // Simple indicators
    const simpleKeywords = [
        'simple', 'basic', 'quick', 'fast', 'rough', 'sketch', 'draft',
        'just', 'only', 'small', 'tiny', 'brief', 'short'
    ];

    const hasComplex = complexKeywords.some(kw => lowercasePrompt.includes(kw));
    const hasSimple = simpleKeywords.some(kw => lowercasePrompt.includes(kw));

    // Length also indicates complexity
    const isLongPrompt = prompt.length > 200;
    const isShortPrompt = prompt.length < 50;

    if (hasComplex || isLongPrompt) return 'complex';
    if (hasSimple || isShortPrompt) return 'simple';
    return 'medium';
}

// ===== LIMIT CHECKING =====

export interface UsageStatus {
    allowed: boolean;
    remaining: number;
    total: number;
    percentRemaining: number;
    warningLevel: 'none' | 'warning' | 'critical' | 'exhausted';
    message?: string;
}

export function checkUsageStatus(
    used: number,
    total: number,
    type: string
): UsageStatus {
    const remaining = Math.max(0, total - used);
    const percentRemaining = total > 0 ? remaining / total : 0;

    let warningLevel: UsageStatus['warningLevel'] = 'none';
    let message: string | undefined;

    if (remaining === 0) {
        warningLevel = 'exhausted';
        message = `You've used all your ${type} for this month. Upgrade for more!`;
    } else if (percentRemaining <= CRITICAL_THRESHOLD) {
        warningLevel = 'critical';
        message = `⚠️ Only ${remaining} ${type} remaining!`;
    } else if (percentRemaining <= WARNING_THRESHOLD) {
        warningLevel = 'warning';
        message = `⚠️ ${remaining} ${type} remaining this month`;
    }

    return {
        allowed: remaining > 0,
        remaining,
        total,
        percentRemaining,
        warningLevel,
        message,
    };
}

// ===== CONSTRAINT GENERATOR FOR PROMPTS =====

/**
 * Generate constraint text to add to prompts based on model capabilities
 */
export function getVideoConstraints(tier: UserTier): string {
    const model = getBestVideoModel(tier);
    if (!model) return 'Video generation is not available for free tier.';

    return `Maximum duration: ${model.maxDuration} seconds. Resolution: ${model.resolution}. ` +
        `Available styles: ${model.styles.join(', ')}.`;
}

export function getImageConstraints(tier: UserTier): string {
    const model = getBestImageModel(tier);
    return `Maximum size: ${model.maxSize}. ` +
        `Available aspect ratios: ${model.aspectRatios.join(', ')}. ` +
        `Image editing: ${model.supportsEdit ? 'supported' : 'not supported for this tier'}.`;
}

// ===== PROMPT FOR GEMINI ORCHESTRATOR =====

export function getModelCapabilitiesPrompt(tier: UserTier): string {
    const videoModel = getBestVideoModel(tier);
    const imageModel = getBestImageModel(tier);
    const limits = TIER_LIMITS[tier];

    const tierPricing: Record<UserTier, string> = {
        FREE: '$0/month',
        STARTER_2: '$0/month (referral)',
        STARTER: '$5/month',
        PRO: '$12/month',
        PREMIUM: '$24/month',
    };

    return `
## USER'S TIER: ${tier} (${tierPricing[tier]})

### Available Subscription Plans:
- FREE ($0): 50 chat, 2 images, 0 videos, 0 music, 4 TTS, 0 PPT
- STARTER ($5): 45 chat, 14 images, 9 videos, 9 music, 5 TTS, 5 PPT
- PRO ($12, MOST POPULAR): 110 chat, 33 images, 21 videos, 20 music, 12 TTS, 12 PPT
- PREMIUM ($24): 220 chat, 66 images, 42 videos, 41 music, 25 TTS, 20 PPT

### User's Current Monthly Limits:
- Chat Messages: ${limits.chatMessages}
- Images: ${limits.images}
- Videos: ${limits.videos}
- Music: ${limits.music}
- TTS: ${limits.tts}
- PPT: ${limits.ppt}

### Video Generation Rules:
${videoModel ? `
- Maximum duration: ${videoModel.maxDuration} seconds
- Resolution: ${videoModel.resolution}
- If user requests longer video, inform them of the limit
- Image-to-video: ${videoModel.supportsImageToVideo ? 'supported' : 'not supported'}
` : '- Not available for this tier. Suggest upgrading to STARTER or higher.'}

### Image Generation Rules:
- Maximum size: ${imageModel.maxSize}
- Aspect ratios: ${imageModel.aspectRatios.join(', ')}
- Editing/inpainting: ${imageModel.supportsEdit ? 'supported' : 'not supported'}

### Smart Model Routing:
- KroniQ uses smart routing to optimize model selection based on task complexity
- Simple tasks use faster/cheaper models, complex tasks use premium models
- This maximizes user value within their budget allocation

### Warning Thresholds:
- Show warning when user has <5% of any limit remaining
- Block generation when user has 0 remaining
- Suggest upgrade naturally without being pushy
`.trim();
}
