/**
 * Super KroniQ Orchestrator
 * The brain of Super KroniQ - routes user messages to the best model/tool
 * Users NEVER see model names, tokens, or costs - it just works.
 */

import { classifyIntent, type IntentResult } from './intentClassifier';
import { PRICING_PLANS, type PlanType } from './pricingPlans';
import { supabase } from './supabaseClient';

// ===== TYPES =====

export type ToolType = 'chat' | 'image' | 'video' | 'tts' | 'ppt' | 'code' | 'website';
export type ComplexityLevel = 'low' | 'medium' | 'high';

export interface OrchestrationResult {
    success: boolean;
    tool: ToolType;
    response?: string | { url: string; type: string };
    error?: string;
    upgradeRequired?: boolean;
    upgradeReason?: string;
    // Never exposed to user:
    _internal?: {
        model: string;
        tokens?: number;
        cost?: number;
        complexity: ComplexityLevel;
    };
}

export interface UsageStatus {
    allowed: boolean;
    remaining?: number;
    resetAt?: Date;
    upgradeReason?: string;
}

// ===== FREE TIER MODELS (Cost-optimized) =====

const FREE_TIER_MODELS: Record<string, string> = {
    chat: 'google/gemini-2.0-flash-exp',           // FREE
    code: 'deepseek/deepseek-chat',                 // Very cheap
    thinking: 'meta-llama/llama-3.3-70b-instruct', // Cheap
    image: 'flux-schnell',                          // Cheapest image
    tts: 'gemini-tts',                              // Free
};

const PRO_TIER_MODELS: Record<string, string> = {
    chat: 'anthropic/claude-3.5-sonnet-20241022',
    code: 'openai/gpt-4o',
    thinking: 'openai/o1-mini',
    image: 'dall-e-3',
    video: 'kling-v1',
    tts: 'elevenlabs-multilingual-v2',
    ppt: 'anthropic/claude-3.5-sonnet-20241022',
};

const PREMIUM_TIER_MODELS: Record<string, string> = {
    chat: 'anthropic/claude-3.5-sonnet-20241022',
    code: 'anthropic/claude-3.5-sonnet-20241022',
    thinking: 'openai/o1',
    image: 'dall-e-3',
    video: 'sora',
    tts: 'elevenlabs-turbo-v2',
    ppt: 'anthropic/claude-3.5-sonnet-20241022',
};

// ===== USAGE TRACKING =====

/**
 * Check if user can use a feature based on their tier and usage
 */
export async function checkUsage(
    userId: string,
    feature: ToolType,
    tier: PlanType
): Promise<UsageStatus> {
    const plan = PRICING_PLANS[tier];

    // Premium tier = no limits (except video which is generous)
    if (tier === 'premium') {
        return { allowed: true };
    }

    try {
        // Get current usage from Supabase
        const now = new Date();
        const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString();

        // For free tier, check specific limits
        if (tier === 'free') {
            switch (feature) {
                case 'chat':
                case 'code': {
                    // 5 messages per day
                    const { data } = await supabase
                        .from('usage_tracking')
                        .select('count')
                        .eq('user_id', userId)
                        .eq('feature', 'chat')
                        .gte('period_start', dayStart)
                        .maybeSingle();

                    const used = data?.count || 0;
                    const limit = plan.limits.messagesPerDay || 5;

                    if (used >= limit) {
                        return {
                            allowed: false,
                            remaining: 0,
                            resetAt: new Date(new Date().setHours(24, 0, 0, 0)),
                            upgradeReason: `You've used all ${limit} daily messages. Upgrade for unlimited.`
                        };
                    }
                    return { allowed: true, remaining: limit - used };
                }

                case 'image': {
                    // 1 image per week
                    const { data } = await supabase
                        .from('usage_tracking')
                        .select('count')
                        .eq('user_id', userId)
                        .eq('feature', 'image')
                        .gte('period_start', weekStart)
                        .maybeSingle();

                    const used = data?.count || 0;
                    const limit = plan.limits.imageGenerationsPerWeek || 1;

                    if (used >= limit) {
                        return {
                            allowed: false,
                            remaining: 0,
                            upgradeReason: 'Upgrade to Pro for 50 images per month.'
                        };
                    }
                    return { allowed: true, remaining: limit - used };
                }

                case 'video': {
                    // 1 video LIFETIME for free tier
                    const { data } = await supabase
                        .from('usage_tracking')
                        .select('lifetime_video_used')
                        .eq('user_id', userId)
                        .eq('feature', 'video')
                        .maybeSingle();

                    if (data?.lifetime_video_used) {
                        return {
                            allowed: false,
                            remaining: 0,
                            upgradeReason: 'Upgrade to Pro for 10 videos per month.'
                        };
                    }
                    return { allowed: true, remaining: 1 };
                }

                case 'tts': {
                    // 7 TTS per week
                    const { data } = await supabase
                        .from('usage_tracking')
                        .select('count')
                        .eq('user_id', userId)
                        .eq('feature', 'tts')
                        .gte('period_start', weekStart)
                        .maybeSingle();

                    const used = data?.count || 0;
                    const limit = plan.limits.ttsGenerationsPerWeek || 7;

                    if (used >= limit) {
                        return {
                            allowed: false,
                            remaining: 0,
                            upgradeReason: 'Upgrade to Pro for unlimited voice generation.'
                        };
                    }
                    return { allowed: true, remaining: limit - used };
                }

                case 'ppt': {
                    // NO PPT for free tier
                    return {
                        allowed: false,
                        remaining: 0,
                        upgradeReason: 'PPT generation is a Pro feature. Upgrade to create presentations.'
                    };
                }

                default:
                    return { allowed: true };
            }
        }

        // Pro tier - monthly limits
        // (Implementation similar but with monthly periods)
        return { allowed: true };

    } catch (error) {
        console.error('Error checking usage:', error);
        // On error, allow but log
        return { allowed: true };
    }
}

/**
 * Record usage after successful generation
 */
export async function recordUsage(
    userId: string,
    feature: ToolType,
    tier: PlanType
): Promise<void> {
    try {
        const now = new Date();
        const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).toISOString();

        // Determine period based on tier and feature
        let periodStart = dayStart;
        if (feature === 'image' || feature === 'tts') {
            periodStart = tier === 'free' ? weekStart : new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        }

        // Upsert usage record
        const { error } = await supabase
            .from('usage_tracking')
            .upsert({
                user_id: userId,
                feature,
                count: 1,
                period_start: periodStart,
                lifetime_video_used: feature === 'video' && tier === 'free',
                updated_at: now.toISOString()
            }, {
                onConflict: 'user_id,feature,period_start',
                ignoreDuplicates: false
            });

        if (error) {
            console.error('Error recording usage:', error);
        }
    } catch (error) {
        console.error('Error in recordUsage:', error);
    }
}

// ===== COMPLEXITY SCORING =====

/**
 * Score the complexity of a message to determine model tier
 */
export function scoreComplexity(message: string, intent: IntentResult): ComplexityLevel {
    const length = message.length;
    const wordCount = message.split(/\s+/).length;

    // Simple heuristics
    let score = 0;

    // Length-based
    if (length > 500) score += 2;
    else if (length > 200) score += 1;

    // Word count
    if (wordCount > 100) score += 2;
    else if (wordCount > 50) score += 1;

    // Intent-based complexity
    if (intent.intent === 'code') score += 1;
    if (intent.intent === 'video') score += 2;

    // Keywords that suggest complexity
    const complexKeywords = ['analyze', 'complex', 'detailed', 'comprehensive', 'architecture', 'strategy', 'plan'];
    if (complexKeywords.some(k => message.toLowerCase().includes(k))) score += 1;

    // Map score to level
    if (score >= 4) return 'high';
    if (score >= 2) return 'medium';
    return 'low';
}

// ===== MODEL SELECTION =====

/**
 * Select the best model based on intent, complexity, and user tier
 */
export function selectModel(
    intent: IntentResult,
    complexity: ComplexityLevel,
    tier: PlanType
): string {
    // Map intent to tool type
    const toolType = mapIntentToTool(intent.intent);

    // Get tier-appropriate model pool
    const modelPool = tier === 'free'
        ? FREE_TIER_MODELS
        : tier === 'pro'
            ? PRO_TIER_MODELS
            : PREMIUM_TIER_MODELS;

    // Select based on intent
    let modelKey: string = toolType;

    // Special handling for thinking/reasoning
    if (complexity === 'high' && (toolType === 'chat' || toolType === 'code')) {
        modelKey = 'thinking';
    }

    return modelPool[modelKey] || modelPool['chat'] || FREE_TIER_MODELS['chat'];
}

/**
 * Map intent classification to tool type
 */
export function mapIntentToTool(intent: string): ToolType {
    switch (intent) {
        case 'code':
            return 'code';
        case 'image':
        case 'design':
            return 'image';
        case 'video':
        case 'video-edit':
            return 'video';
        case 'voice':
            return 'tts';
        case 'music':
            return 'tts'; // Falls back to TTS
        default:
            return 'chat';
    }
}

// ===== MAIN ORCHESTRATION =====

/**
 * Main entry point - processes any user message
 * ALL prompts go through Gemini orchestrator first for:
 * 1. Better intent understanding (handles poor English)
 * 2. Auto-enhancement of prompts
 * This is the ONLY function the UI should call
 */
export async function processMessage(
    message: string,
    userId?: string,
    conversationHistory: Array<{ role: string; content: string }> = []
): Promise<OrchestrationResult> {
    try {
        // 1. Get user tier
        const tier = await getUserTier(userId);

        // 2. FIRST: Send to Gemini orchestrator for interpretation and enhancement
        // This handles poor English, typos, and auto-enhances prompts
        const geminiOrchestrator = await import('./geminiOrchestrator');

        const emptyContext = {
            longTerm: {},
            shortTerm: {},
            version: 1,
            lastUpdated: new Date().toISOString()
        };

        const interpretation = await geminiOrchestrator.interpretRequest(
            message,
            conversationHistory,
            emptyContext,
            { userTier: tier as 'free' | 'starter' | 'pro' | 'premium' }
        );

        console.log('🧠 [Gemini Orchestrator] Intent:', interpretation.intent, 'Confidence:', interpretation.confidence);
        console.log('✨ [Gemini Orchestrator] Enhanced prompt:', interpretation.enhancedPrompt?.substring(0, 100) + '...');

        // 3. Check if orchestrator can self-answer (simple greetings, etc.)
        if (interpretation.selfAnswer && interpretation.selfAnswerContent) {
            return {
                success: true,
                tool: 'chat',
                response: interpretation.selfAnswerContent,
                _internal: {
                    model: 'self-answer',
                    complexity: 'low'
                }
            };
        }

        // 4. Map Gemini intent to our tool type
        const tool = mapIntentToTool(interpretation.intent);

        // 5. Check usage limits
        if (userId) {
            const usageStatus = await checkUsage(userId, tool, tier);
            if (!usageStatus.allowed) {
                return {
                    success: false,
                    tool,
                    upgradeRequired: true,
                    upgradeReason: usageStatus.upgradeReason,
                    error: usageStatus.upgradeReason
                };
            }
        }

        // 6. Use ENHANCED prompt from Gemini (this is the magic!)
        const enhancedPrompt = interpretation.enhancedPrompt || message;

        // 7. Select model based on complexity and tier
        // Map Gemini complexity ('simple'|'medium'|'complex') to our levels ('low'|'medium'|'high')
        const geminiComplexity = interpretation.complexity || 'medium';
        const complexity: ComplexityLevel = geminiComplexity === 'simple' ? 'low' : geminiComplexity === 'complex' ? 'high' : 'medium';

        const model = interpretation.suggestedModel || selectModel(
            { intent: tool as any, confidence: interpretation.confidence, suggestedStudio: 'Chat Studio', reasoning: '' },
            complexity,
            tier
        );

        // 8. Execute based on tool type WITH ENHANCED PROMPT
        let response: string | { url: string; type: string };

        switch (tool) {
            case 'chat':
            case 'code':
                response = await executeChatRequest(enhancedPrompt, model, tier);
                break;
            case 'image':
                response = await executeImageRequest(enhancedPrompt, model, tier);
                break;
            case 'video':
                response = await executeVideoRequest(enhancedPrompt, model, tier);
                break;
            case 'tts':
                response = await executeTTSRequest(enhancedPrompt, model, tier);
                break;
            case 'ppt':
                response = await executePPTRequest(enhancedPrompt, model, tier);
                break;
            default:
                response = await executeChatRequest(enhancedPrompt, model, tier);
        }

        // 9. Record usage
        if (userId) {
            await recordUsage(userId, tool, tier);
        }

        // 10. Return result (never expose internals)
        return {
            success: true,
            tool,
            response,
            _internal: {
                model,
                complexity
            }
        };

    } catch (error) {
        console.error('Orchestration error:', error);
        return {
            success: false,
            tool: 'chat',
            error: 'Something went wrong. Please try again.'
        };
    }
}

// ===== EXECUTION HELPERS =====

async function getUserTier(userId?: string): Promise<PlanType> {
    if (!userId) return 'free';

    try {
        const { data } = await supabase
            .from('profiles')
            .select('subscription_tier')
            .eq('id', userId)
            .maybeSingle();

        return (data?.subscription_tier as PlanType) || 'free';
    } catch {
        return 'free';
    }
}

async function executeChatRequest(
    message: string,
    model: string,
    _tier: PlanType
): Promise<string> {
    // Dynamic import to avoid circular dependencies
    const { getOpenRouterResponse } = await import('./openRouterService');
    return await getOpenRouterResponse(message, [], undefined, model);
}

async function executeImageRequest(
    message: string,
    model: string,
    _tier: PlanType
): Promise<{ url: string; type: string }> {
    // Use image service with correct options format
    const { generateImage } = await import('./imageService');
    const result = await generateImage({ prompt: message, model });
    return { url: result.url, type: 'image' };
}

async function executeVideoRequest(
    message: string,
    _model: string,
    _tier: PlanType
): Promise<{ url: string; type: string }> {
    // Video generation - use Kie AI video service
    try {
        const { generateKieVideo } = await import('./kieAIService');
        const result = await generateKieVideo(message);
        return { url: result, type: 'video' };
    } catch (error) {
        console.error('Video generation failed:', error);
        throw new Error('Video generation is currently unavailable');
    }
}

async function executeTTSRequest(
    message: string,
    _model: string,
    _tier: PlanType
): Promise<{ url: string; type: string }> {
    // Use ElevenLabs TTS service
    try {
        const { generateWithElevenLabs } = await import('./elevenlabsTTSService');
        const audioUrl = await generateWithElevenLabs({ text: message });
        return { url: audioUrl, type: 'audio' };
    } catch (error) {
        console.error('TTS generation failed:', error);
        throw new Error('Voice generation is currently unavailable');
    }
}

async function executePPTRequest(
    message: string,
    _model: string,
    _tier: PlanType
): Promise<{ url: string; type: string }> {
    // Use PPT AI service to generate presentation
    try {
        const { generateCompletePPT } = await import('./pptAIService');
        const result = await generateCompletePPT({ topic: message });
        return { url: result.downloadUrl || '', type: 'ppt' };
    } catch (error) {
        console.error('PPT generation failed:', error);
        throw new Error('Presentation generation is currently unavailable');
    }
}

export default {
    processMessage,
    checkUsage,
    classifyIntent,
    selectModel
};
