/**
 * Generation Limits Service
 * Tracks daily usage limits for ALL tiers (even paid users have daily caps)
 * Uses Supabase for data storage
 */

import { supabase, getCurrentUser } from './supabaseClient';
import { getUserTier } from './userTierService';

export type GenerationType = 'image' | 'video' | 'song' | 'tts' | 'ppt';
export type TierType = 'FREE' | 'STARTER' | 'PRO' | 'PREMIUM';

export interface GenerationLimitInfo {
  canGenerate: boolean;
  current: number;
  limit: number;
  isPaid: boolean;
  tier: TierType;
  message: string;
}

// Daily limits for each tier - matching Terms of Service (January 2026)
// All limits reset at midnight UTC
export const TIER_DAILY_LIMITS: Record<TierType, Record<GenerationType, number>> = {
  FREE: {
    image: 3,     // 3 images/day
    video: 1,     // 1 video/day
    song: 3,      // 3 music/day
    tts: 5,       // 5 TTS/day
    ppt: 2        // 2 PPT/day
  },
  STARTER: {
    image: 15,    // 15/day
    video: 3,     // 3/day
    song: 10,     // 10/day
    tts: 20,      // 20/day
    ppt: 10       // 10/day
  },
  PRO: {
    image: 50,    // 50/day
    video: 10,    // 10/day
    song: 40,     // 40/day
    tts: 75,      // 75/day
    ppt: 30       // 30/day
  },
  PREMIUM: {
    image: 150,   // 150/day
    video: 30,    // 30/day
    song: 120,    // 120/day
    tts: 200,     // 200/day
    ppt: 100      // 100/day
  }
};

// Monthly limits for reference (daily * 30, approximate)
export const TIER_MONTHLY_LIMITS: Record<TierType, Record<GenerationType, number>> = {
  FREE: {
    image: 90,    // ~3/day * 30
    video: 30,    // ~1/day * 30
    song: 90,     // ~3/day * 30
    tts: 150,     // ~5/day * 30
    ppt: 60       // ~2/day * 30
  },
  STARTER: {
    image: 450,   // ~15/day * 30
    video: 90,    // ~3/day * 30
    song: 300,    // ~10/day * 30
    tts: 600,     // ~20/day * 30
    ppt: 300      // ~10/day * 30
  },
  PRO: {
    image: 1500,  // ~50/day * 30
    video: 300,   // ~10/day * 30
    song: 1200,   // ~40/day * 30
    tts: 2250,    // ~75/day * 30
    ppt: 900      // ~30/day * 30
  },
  PREMIUM: {
    image: 4500,  // ~150/day * 30
    video: 900,   // ~30/day * 30
    song: 3600,   // ~120/day * 30
    tts: 6000,    // ~200/day * 30
    ppt: 3000     // ~100/day * 30
  }
};

/**
 * Get tier from user tier string
 */
function normalizeTier(tierString: string | undefined): TierType {
  if (!tierString) return 'FREE';
  const upper = tierString.toUpperCase();
  if (upper === 'STARTER') return 'STARTER';
  if (upper === 'PRO') return 'PRO';
  if (upper === 'PREMIUM') return 'PREMIUM';
  return 'FREE';
}

/**
 * Check if user can generate content of a specific type
 */
export async function checkGenerationLimit(
  userId: string,
  generationType: GenerationType
): Promise<GenerationLimitInfo> {
  try {
    const tierInfo = await getUserTier(userId);
    const tier = normalizeTier(tierInfo.tier);
    const isPaid = tier !== 'FREE';
    const dailyLimit = TIER_DAILY_LIMITS[tier][generationType];

    // Get current generation count from Supabase
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    let current = 0;
    if (data && !error) {
      // Map GenerationType to field names
      const fieldMap: Record<GenerationType, string> = {
        image: 'images_generated',
        video: 'videos_generated',
        song: 'music_generated',
        tts: 'tts_generated',
        ppt: 'ppt_generated'
      };

      const fieldName = fieldMap[generationType];
      current = data[fieldName] || 0;
    }

    const canGenerate = current < dailyLimit;
    const remaining = dailyLimit - current;

    let message = '';
    if (dailyLimit === 0) {
      message = `${generationType} not available on ${tier} plan. Upgrade for access!`;
    } else if (canGenerate) {
      message = `${remaining}/${dailyLimit} remaining today`;
    } else {
      message = `Daily limit reached (${dailyLimit}/day). Try again tomorrow!`;
    }

    return {
      canGenerate: dailyLimit > 0 && canGenerate,
      current,
      limit: dailyLimit,
      isPaid,
      tier,
      message
    };
  } catch (error) {
    console.error('❌ Exception checking generation limit:', error);
    // On error, check with conservative free tier limits
    const fallbackLimit = TIER_DAILY_LIMITS.FREE[generationType];
    return {
      canGenerate: fallbackLimit > 0,
      current: 0,
      limit: fallbackLimit,
      isPaid: false,
      tier: 'FREE',
      message: 'Unable to check limit, using free tier limits'
    };
  }
}

/**
 * Increment the generation count for a user
 */
export async function incrementGenerationCount(
  userId: string,
  generationType: GenerationType
): Promise<boolean> {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Map GenerationType to field names
    const fieldMap: Record<GenerationType, string> = {
      image: 'images_generated',
      video: 'videos_generated',
      song: 'music_generated',
      tts: 'tts_generated',
      ppt: 'ppt_generated'
    };

    const fieldName = fieldMap[generationType];

    // Try to get existing record
    const { data: existing } = await supabase
      .from('daily_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    if (existing) {
      // Update existing record
      const currentCount = existing[fieldName] || 0;
      await supabase
        .from('daily_usage')
        .update({ [fieldName]: currentCount + 1 })
        .eq('user_id', userId)
        .eq('date', today);
    } else {
      // Create new record for today
      await supabase
        .from('daily_usage')
        .insert({
          user_id: userId,
          date: today,
          [fieldName]: 1
        });
    }

    return true;
  } catch (error) {
    console.error('❌ Exception incrementing generation count:', error);
    return false;
  }
}

export function getGenerationLimitText(type: GenerationType, tier: TierType): string {
  const dailyLimit = TIER_DAILY_LIMITS[tier][type];

  if (dailyLimit === 0) {
    return 'Not available';
  }

  return `${dailyLimit}/day`;
}

/**
 * Get all generation limits for a user
 */
export async function getAllGenerationLimits(userId: string): Promise<Record<GenerationType, GenerationLimitInfo>> {
  const types: GenerationType[] = ['image', 'video', 'song', 'tts', 'ppt'];
  const result: Record<GenerationType, GenerationLimitInfo> = {} as any;

  for (const type of types) {
    result[type] = await checkGenerationLimit(userId, type);
  }

  return result;
}
