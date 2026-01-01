/**
 * Image Generation Service
 * Uses Kie AI for ALL tiers with tier-based model access
 * 
 * Tier Model Access:
 * - FREE: flux-dev, google/nano-banana (2 models)
 * - PRO: + flux-pro, sdxl, imagen3, seedream 4.5, dalle-2 (7 models)
 * - PREMIUM: All models including 4o-image, imagen4-ultra, grok, midjourney, dalle-3 (18 models)
 */

import { generateKieImage, KIE_MODELS } from './kieAIService';

export type UserTier = 'FREE' | 'PRO' | 'PREMIUM';

export interface ImageGenerationOptions {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  guidanceScale?: number;
  model?: string;
}

export interface GeneratedImage {
  url: string;
  seed: number;
  prompt: string;
  timestamp: Date;
  model?: string;
}

// ===== TIER-BASED MODEL ACCESS =====

export function getImageModelsForTier(tier: UserTier) {
  // Get models based on tier property
  return KIE_MODELS.image.filter(model => {
    if (tier === 'PREMIUM') return true; // Premium gets all
    if (tier === 'PRO') return model.tier === 'FREE' || model.tier === 'PRO';
    return model.tier === 'FREE'; // Free tier only
  });
}

export function getDefaultImageModelForTier(tier: UserTier): string {
  switch (tier) {
    case 'PREMIUM': return 'flux-pro';
    case 'PRO': return 'flux-pro';
    case 'FREE':
    default: return 'flux-dev'; // Cheapest model
  }
}

export function isModelAllowedForTier(modelId: string, tier: UserTier): boolean {
  const model = KIE_MODELS.image.find(m => m.id === modelId);
  if (!model) return false;

  if (tier === 'PREMIUM') return true;
  if (tier === 'PRO') return model.tier === 'FREE' || model.tier === 'PRO';
  return model.tier === 'FREE';
}

// ===== MAIN: Tier-Based Image Generation =====

export async function generateImageForTier(
  prompt: string,
  userTier: UserTier,
  selectedModel?: string
): Promise<GeneratedImage> {
  console.log(`🎨 Generating image for ${userTier} tier...`);

  // Check if selected model is allowed for this tier
  let model = selectedModel;
  if (model && !isModelAllowedForTier(model, userTier)) {
    console.log(`⚠️ Model ${model} not allowed for ${userTier} tier, using default`);
    model = getDefaultImageModelForTier(userTier);
  }

  if (!model) {
    model = getDefaultImageModelForTier(userTier);
  }

  console.log(`📌 Using Kie AI model: ${model}`);

  try {
    const imageUrl = await generateKieImage(prompt, model);

    console.log('✅ Image generated successfully');

    return {
      url: imageUrl,
      seed: Date.now(),
      prompt: prompt,
      timestamp: new Date(),
      model: model
    };

  } catch (error: any) {
    console.error('❌ Image generation error:', error);
    throw new Error(error.message || 'Failed to generate image');
  }
}

// ===== LEGACY FUNCTIONS (for backward compatibility) =====

export async function generateImage(options: ImageGenerationOptions): Promise<GeneratedImage> {
  const { prompt, model = 'flux-pro' } = options;
  return generateImageForTier(prompt, 'PREMIUM', model);
}

export function isImageGenerationAvailable(): boolean {
  return true;
}

export async function generateImageSmart(
  prompt: string,
  selectedModel?: string
): Promise<GeneratedImage> {
  return generateImageForTier(prompt, 'PREMIUM', selectedModel);
}

export async function generateImageFree(
  prompt: string,
  model: string = 'flux-pro'
): Promise<GeneratedImage> {
  return generateImageForTier(prompt, 'PREMIUM', model);
}

export function getAvailableImageModels() {
  return KIE_MODELS.image;
}
