/**
 * Generation Limits Service
 * Tracks daily usage limits for ALL tiers (even paid users have daily caps)
 * Uses Supabase for data storage
 */

import { supabase, getCurrentUser } from './supabaseClient';
import { getUserTier } from './userTierService';

export type GenerationType = 'image' | 'video' | 'song' | 'tts' | 'ppt';
export type TierType = 'FREE' | 'STARTER_2' | 'STARTER' | 'PRO' | 'PREMIUM';

export interface GenerationLimitInfo {
  canGenerate: boolean;
  current: number;
  limit: number;
  isPaid: boolean;
  tier: TierType;
  message: string;
}

// MONTHLY limits for PREMIUM generation (images/videos)
// Chat and TTS are UNLIMITED (use free models) - tracked elsewhere
// These are the PREMIUM model quotas before switching to free fallback
// HIDDEN TIER: STARTER_2 = Free models only (referral tier)
export const TIER_MONTHLY_LIMITS: Record<TierType, Record<GenerationType, number>> = {
  FREE: {
    image: 20,
    video: 0,
    song: 0,
    tts: 40,
    ppt: 0
  },
  STARTER_2: {
    image: 150,  // Lower limits - free referral tier
    video: 40,
    song: 0,
    tts: 400,
    ppt: 0   // No PPT for free tier
  },
  STARTER: {
    image: 400,
    video: 96,
    song: 0,
    tts: 1200,
    ppt: 32
  },
  PRO: {
    image: 560,
    video: 144,
    song: 0,
    tts: 2000,
    ppt: 64
  },
  PREMIUM: {
    image: 800,
    video: 200,
    song: 0,
    tts: 3200,
    ppt: 96
  }
};

// Token limits per month
export const TIER_TOKEN_LIMITS: Record<TierType, number> = {
  FREE: 15000,      // 15K/month
  STARTER_2: 50000, // 50K/month (referral tier)
  STARTER: 100000,  // 100K/month
  PRO: 220000,      // 220K/month
  PREMIUM: 560000   // 560K/month
};

// Keep daily limits for backwards compatibility (divide monthly by 30)
export const TIER_DAILY_LIMITS: Record<TierType, Record<GenerationType, number>> = {
  FREE: {
    image: 1,
    video: 0,
    song: 0,
    tts: 1,
    ppt: 0
  },
  STARTER_2: {
    image: 5,  // Free referral tier
    video: 1,
    song: 0,
    tts: 13,
    ppt: 0
  },
  STARTER: {
    image: 13,
    video: 3,
    song: 0,
    tts: 40,
    ppt: 1
  },
  PRO: {
    image: 18,
    video: 5,
    song: 0,
    tts: 66,
    ppt: 2
  },
  PREMIUM: {
    image: 26,
    video: 6,
    song: 0,
    tts: 106,
    ppt: 3
  }
};

/**
 * Get tier from user tier string
 */
function normalizeTier(tierString: string | undefined): TierType {
  if (!tierString) return 'FREE';
  const upper = tierString.toUpperCase();
  if (upper === 'STARTER_2') return 'STARTER_2';
  if (upper === 'STARTER') return 'STARTER';
  if (upper === 'PRO') return 'PRO';
  if (upper === 'PREMIUM') return 'PREMIUM';
  return 'FREE';
}

/**
 * Check if user can generate content of a specific type
 * Uses MONTHLY limits
 */
export async function checkGenerationLimit(
  userId: string,
  generationType: GenerationType
): Promise<GenerationLimitInfo> {
  try {
    const tierInfo = await getUserTier(userId);
    const tier = normalizeTier(tierInfo.tier);
    const isPaid = tier !== 'FREE';
    const monthlyLimit = TIER_MONTHLY_LIMITS[tier][generationType];

    // Get current month's usage from Supabase
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    // Sum up all usage for this month
    const { data, error } = await supabase
      .from('daily_usage')
      .select('*')
      .eq('user_id', userId)
      .gte('date', monthStart)
      .lte('date', monthEnd);

    let current = 0;
    if (data && !error) {
      const fieldMap: Record<GenerationType, string> = {
        image: 'images_generated',
        video: 'videos_generated',
        song: 'music_generated',
        tts: 'tts_generated',
        ppt: 'ppt_generated'
      };
      const fieldName = fieldMap[generationType];
      // Sum all days in the month
      current = data.reduce((sum, day) => sum + (day[fieldName] || 0), 0);
    }

    const canGenerate = current < monthlyLimit;
    const remaining = monthlyLimit - current;

    let message = '';
    if (monthlyLimit === 0) {
      message = `${generationType} not available on ${tier} plan. Upgrade for access!`;
    } else if (canGenerate) {
      message = `${remaining}/${monthlyLimit} remaining this month`;
    } else {
      message = `Monthly limit reached (${monthlyLimit}/month). Upgrade or wait until next month!`;
    }

    return {
      canGenerate: monthlyLimit > 0 && canGenerate,
      current,
      limit: monthlyLimit,
      isPaid,
      tier,
      message
    };
  } catch (error) {
    console.error('❌ Exception checking generation limit:', error);
    const fallbackLimit = TIER_MONTHLY_LIMITS.FREE[generationType];
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
  const monthlyLimit = TIER_MONTHLY_LIMITS[tier][type];

  if (monthlyLimit === 0) {
    return 'Not available';
  }

  return `${monthlyLimit}/month`;
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
