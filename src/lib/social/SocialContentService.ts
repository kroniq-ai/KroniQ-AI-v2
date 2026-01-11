/**
 * SocialContentService.ts - AI Service for Social Content Generation
 * Connects to existing AI infrastructure for text and image generation
 */

// ===== TYPES =====

export type Platform = 'linkedin' | 'instagram' | 'x';
export type Tone = 'professional' | 'casual' | 'bold' | 'minimal';
export type Audience = 'founders' | 'creators' | 'general';

export interface GenerationRequest {
    intent: string;
    platform: Platform;
    tone: Tone;
    audience: Audience;
}

export interface GeneratedContent {
    copy: string;
    imagePrompt: string;
    hooks: string[];
    hashtags: string[];
}

export interface EditRequest {
    currentContent: string;
    instruction: string;
    platform: Platform;
}

// ===== CONFIG =====

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const MODEL = 'google/gemini-2.0-flash-exp:free';

// ===== PLATFORM CONFIGS =====

const PLATFORM_CONFIGS = {
    linkedin: {
        charLimit: 3000,
        hashtagCount: 5,
        style: 'professional, insightful, paragraph-based with line breaks',
        audience: 'professionals, founders, business leaders',
        features: 'thought leadership, storytelling, professional insights'
    },
    instagram: {
        charLimit: 2200,
        hashtagCount: 15,
        style: 'engaging, emoji-friendly, visually descriptive',
        audience: 'creators, lifestyle enthusiasts, visual learners',
        features: 'stories, visual content, lifestyle, inspiration'
    },
    x: {
        charLimit: 280,
        hashtagCount: 2,
        style: 'punchy, concise, hook-driven, thread-ready',
        audience: 'tech community, builders, thought leaders',
        features: 'threads, hot takes, quick insights, engagement'
    }
};

const TONE_DESCRIPTIONS = {
    professional: 'polished, authoritative, data-driven, credible',
    casual: 'friendly, conversational, approachable, relatable',
    bold: 'provocative, confident, contrarian, attention-grabbing',
    minimal: 'simple, clean, focused, minimal words maximum impact'
};

const AUDIENCE_DESCRIPTIONS = {
    founders: 'startup founders, entrepreneurs, people building things',
    creators: 'content creators, influencers, creative professionals',
    general: 'general audience, broad appeal, accessible language'
};

// ===== PROMPTS =====

function buildGenerationPrompt(request: GenerationRequest): string {
    const platformConfig = PLATFORM_CONFIGS[request.platform];
    const toneDesc = TONE_DESCRIPTIONS[request.tone];
    const audienceDesc = AUDIENCE_DESCRIPTIONS[request.audience];

    return `You are a social media content expert. Generate a complete post for ${request.platform.toUpperCase()}.

USER INTENT: ${request.intent}

PLATFORM CONSTRAINTS:
- Platform: ${request.platform}
- Character limit: ${platformConfig.charLimit}
- Style: ${platformConfig.style}
- Best for: ${platformConfig.features}

CONTENT REQUIREMENTS:
- Tone: ${toneDesc}
- Target audience: ${audienceDesc}

OUTPUT FORMAT (respond with valid JSON only):
{
    "copy": "The full post text optimized for ${request.platform}. Must be under ${platformConfig.charLimit} characters.",
    "imagePrompt": "A detailed prompt for generating a visual that complements this post. Modern, clean style.",
    "hooks": [
        "Alternative opening line 1",
        "Alternative opening line 2",
        "Alternative opening line 3"
    ],
    "hashtags": ["tag1", "tag2", "tag3"]
}

IMPORTANT:
- Make the copy ${request.platform}-native (not generic)
- The hook should stop the scroll
- Include exactly ${platformConfig.hashtagCount} relevant hashtags (without #)
- Image prompt should be specific and visual
- Keep copy under character limit`;
}

function buildEditPrompt(request: EditRequest): string {
    return `You are a social media content editor. Edit the following post based on the user's instruction.

CURRENT POST:
${request.currentContent}

USER INSTRUCTION: "${request.instruction}"

PLATFORM: ${request.platform} (character limit: ${PLATFORM_CONFIGS[request.platform].charLimit})

Respond with ONLY the edited post text, nothing else. Keep it within the character limit.`;
}

// ===== API CALLS =====

async function callOpenRouter(prompt: string): Promise<string> {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': window.location.origin,
            'X-Title': 'KroniQ Social'
        },
        body: JSON.stringify({
            model: MODEL,
            messages: [
                { role: 'user', content: prompt }
            ],
            max_tokens: 1500,
            temperature: 0.8
        })
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
}

// ===== SERVICE FUNCTIONS =====

/**
 * Generate complete social media content from user intent
 */
export async function generateContent(request: GenerationRequest): Promise<GeneratedContent> {
    try {
        const prompt = buildGenerationPrompt(request);
        const rawResponse = await callOpenRouter(prompt);

        // Parse JSON response
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to parse response');
        }

        const parsed = JSON.parse(jsonMatch[0]) as GeneratedContent;

        // Validate and clean
        return {
            copy: parsed.copy?.slice(0, PLATFORM_CONFIGS[request.platform].charLimit) || '',
            imagePrompt: parsed.imagePrompt || `Professional visual for: ${request.intent}`,
            hooks: Array.isArray(parsed.hooks) ? parsed.hooks.slice(0, 3) : [],
            hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags.slice(0, PLATFORM_CONFIGS[request.platform].hashtagCount) : []
        };
    } catch (error) {
        console.error('[SocialContentService] Generation error:', error);

        // Return fallback content
        return getFallbackContent(request);
    }
}

/**
 * Edit existing content based on user instruction
 */
export async function editContent(request: EditRequest): Promise<string> {
    try {
        const prompt = buildEditPrompt(request);
        const response = await callOpenRouter(prompt);
        return response.slice(0, PLATFORM_CONFIGS[request.platform].charLimit);
    } catch (error) {
        console.error('[SocialContentService] Edit error:', error);
        return request.currentContent;
    }
}

/**
 * Regenerate just the post copy
 */
export async function regenerateCopy(
    currentCopy: string,
    platform: Platform,
    tone: Tone
): Promise<string> {
    try {
        const prompt = `You are a social media content expert. Rewrite this ${platform} post in a fresh way.

CURRENT POST:
${currentCopy}

REQUIREMENTS:
- Platform: ${platform}
- Tone: ${TONE_DESCRIPTIONS[tone]}
- Character limit: ${PLATFORM_CONFIGS[platform].charLimit}
- Keep the same core message but make it fresh

Respond with ONLY the rewritten post text, nothing else.`;

        const response = await callOpenRouter(prompt);
        return response.slice(0, PLATFORM_CONFIGS[platform].charLimit);
    } catch (error) {
        console.error('[SocialContentService] Regenerate error:', error);
        return currentCopy;
    }
}

/**
 * Generate image prompt for visual content
 */
export async function generateImagePrompt(
    intent: string,
    platform: Platform
): Promise<string> {
    try {
        const prompt = `Create a detailed image generation prompt for a ${platform} post about: "${intent}"

The image should be:
- Modern and clean design
- Professional and high quality
- Suitable for ${platform}'s visual style
- Eye-catching in a social feed

Respond with ONLY the image prompt, nothing else. Keep it under 200 characters.`;

        const response = await callOpenRouter(prompt);
        return response.slice(0, 200);
    } catch (error) {
        console.error('[SocialContentService] Image prompt error:', error);
        return `Professional visual about: ${intent}`;
    }
}

// ===== FALLBACK =====

function getFallbackContent(request: GenerationRequest): GeneratedContent {
    const platforms = {
        linkedin: {
            copy: `I wanted to share something today.\n\n${request.intent}\n\nHere's what I've learned on this journey:\n\n1️⃣ Start before you're ready\n2️⃣ Share your progress openly\n3️⃣ Connect with others on the same path\n\nWhat's been your experience with this?\n\n#buildinpublic`,
            hashtags: ['startup', 'entrepreneurship', 'buildinpublic', 'founder', 'growth']
        },
        instagram: {
            copy: `✨ ${request.intent}\n\nDrop a 🔥 if this resonates!\n\n.\n.\n.`,
            hashtags: ['instagood', 'startup', 'entrepreneur', 'motivation', 'success', 'business', 'growth', 'inspiration', 'mindset', 'goals']
        },
        x: {
            copy: `${request.intent}\n\nThread 🧵`,
            hashtags: ['buildinpublic', 'startup']
        }
    };

    const fallback = platforms[request.platform];

    return {
        copy: fallback.copy,
        imagePrompt: `Professional ${request.platform} visual about: ${request.intent}. Modern, clean design.`,
        hooks: [
            "Here's what nobody tells you about this...",
            "I spent months learning this the hard way.",
            "Stop scrolling. This changed everything for me."
        ],
        hashtags: fallback.hashtags
    };
}

export default {
    generateContent,
    editContent,
    regenerateCopy,
    generateImagePrompt
};
