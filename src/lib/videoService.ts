/**
 * Video Generation Service
 * Uses Kie AI for video generation with tier-based access
 * 
 * TIER RESTRICTIONS:
 * - FREE: Video generation DISABLED
 * - PRO: veo3_fast, veo2, wan, kling-2.6, runway-turbo, pika (6 models)
 * - PREMIUM: All models including veo3, sora, kling-3.0, grok, runway, luma (14 models)
 */

import { generateKieVideo, KIE_MODELS } from './kieAIService';

export type UserTier = 'FREE' | 'PRO' | 'PREMIUM';

export interface VideoGenerationOptions {
  prompt: string;
  model?: string;
  duration?: number;
  resolution?: string;
}

export interface GeneratedVideo {
  url: string;
  prompt: string;
  timestamp: Date;
  model: string;
}

// ===== TIER CHECKS =====

export function isVideoAllowedForTier(tier: UserTier): boolean {
  return tier !== 'FREE';
}

export function getVideoModelsForTier(tier: UserTier) {
  if (tier === 'FREE') return [];

  return KIE_MODELS.video.filter(model => {
    if (tier === 'PREMIUM') return true;
    return model.tier === 'PRO';
  });
}

export function getDefaultVideoModelForTier(tier: UserTier): string {
  if (tier === 'FREE') return '';
  if (tier === 'PRO') return 'veo3_fast';
  return 'veo3'; // Premium default
}

export function isVideoModelAllowedForTier(modelId: string, tier: UserTier): boolean {
  if (tier === 'FREE') return false;

  const model = KIE_MODELS.video.find(m => m.id === modelId);
  if (!model) return false;

  if (tier === 'PREMIUM') return true;
  return model.tier === 'PRO';
}

// ===== VIDEO GENERATION =====

export async function generateVideo(options: VideoGenerationOptions): Promise<GeneratedVideo> {
  const {
    prompt,
    model = 'veo3_fast',
    duration = 5,
    resolution = '1280x720'
  } = options;

  try {
    const videoUrl = await generateKieVideo(prompt, model);

    return {
      url: videoUrl,
      prompt: prompt,
      timestamp: new Date(),
      model: model
    };

  } catch (error: any) {
    throw new Error(error.message || 'Failed to generate video');
  }
}

// ===== TIER-BASED VIDEO GENERATION =====

export async function generateVideoForTier(
  prompt: string,
  userTier: UserTier,
  selectedModel?: string
): Promise<GeneratedVideo> {
  if (!isVideoAllowedForTier(userTier)) {
    throw new Error('UPGRADE_REQUIRED: Video generation requires Pro or Premium subscription');
  }

  // Check if selected model is allowed
  let model = selectedModel;
  if (model && !isVideoModelAllowedForTier(model, userTier)) {
    model = getDefaultVideoModelForTier(userTier);
  }

  if (!model) {
    model = getDefaultVideoModelForTier(userTier);
  }

  return await generateVideo({ prompt, model });
}

// ===== HELPERS =====

export function isVideoGenerationAvailable(): boolean {
  return true;
}

export function getAvailableVideoModels() {
  return KIE_MODELS.video;
}

export async function generateVideoWithModel(
  prompt: string,
  model: string = 'veo3_fast'
): Promise<GeneratedVideo> {
  return generateVideo({ prompt, model });
}
