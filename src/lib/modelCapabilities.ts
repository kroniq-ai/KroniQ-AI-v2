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

export type UserTier = 'FREE' | 'STARTER' | 'PRO' | 'PREMIUM';

// ===== WARNING THRESHOLDS =====

export const WARNING_THRESHOLD = 0.05; // Warn users at 5% remaining
export const CRITICAL_THRESHOLD = 0.02; // Critical warning at 2%

// ===== TIER LIMITS =====

export const TIER_LIMITS = {
    FREE: {
        tokens: 15000,
        images: 2,
        videos: 0,
        music: 0,
        tts: 10,
        ppt: 0,
        tokensPerDay: 15000,
    },
    STARTER: {
        tokens: 100000,
        images: 30,
        videos: 4,
        music: 10,
        tts: 50,
        ppt: 10,
        tokensPerDay: 100000,
    },
    PRO: {
        tokens: 220000,
        images: 50,
        videos: 10,
        music: 25,
        tts: 120,
        ppt: 25,
        tokensPerDay: 220000,
    },
    PREMIUM: {
        tokens: 560000,
        images: 80,
        videos: 15,
        music: 35,
        tts: 200,
        ppt: 35,
        tokensPerDay: 560000,
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
 * Get the best video model for a tier
 */
export function getBestVideoModel(tier: UserTier): VideoCapability | null {
    if (tier === 'FREE') return null; // No video for free

    switch (tier) {
        case 'STARTER':
            return VIDEO_MODELS['veo3_fast'];
        case 'PRO':
            return VIDEO_MODELS['veo3'];
        case 'PREMIUM':
            return VIDEO_MODELS['sora-2'];
        default:
            return null;
    }
}

/**
 * Get the best image model for a tier
 */
export function getBestImageModel(tier: UserTier): ImageCapability {
    switch (tier) {
        case 'FREE':
            return IMAGE_MODELS['gpt-image-1'];
        case 'STARTER':
            return IMAGE_MODELS['flux-kontext-pro'];
        case 'PRO':
            return IMAGE_MODELS['flux-kontext-max'];
        case 'PREMIUM':
            return IMAGE_MODELS['imagen-4-ultra'];
        default:
            return IMAGE_MODELS['gpt-image-1'];
    }
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

    return `
## USER'S TIER: ${tier}

### Available Limits (Monthly):
- Tokens: ${limits.tokens.toLocaleString()}
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
` : '- Not available for this tier'}

### Image Generation Rules:
- Maximum size: ${imageModel.maxSize}
- Aspect ratios: ${imageModel.aspectRatios.join(', ')}
- Editing/inpainting: ${imageModel.supportsEdit ? 'supported' : 'not supported'}

### Warning Thresholds:
- Show warning when user has <5% of any limit remaining
- Block generation when user has 0 remaining
- Suggest upgrade naturally without being pushy
`.trim();
}
