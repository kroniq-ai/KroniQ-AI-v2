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

// MONTHLY limits for each tier - matching Terms of Service (January 2026)
// All limits reset at the start of each billing month
export const TIER_MONTHLY_LIMITS: Record<TierType, Record<GenerationType, number>> = {
  FREE: {
    image: 2,      // 2 images/month (loss leader)
    video: 0,      // No video for free
    song: 0,       // No music for free
    tts: 10,       // 10 TTS/month
    ppt: 0         // No PPT for free
  },
  STARTER: {
    image: 30,     // 30/month
    video: 4,      // 4/month
    song: 10,      // 10/month
    tts: 50,       // 50/month
    ppt: 10        // 10/month
  },
  PRO: {
    image: 50,     // 50/month
    video: 10,     // 10/month
    song: 25,      // 25/month
    tts: 120,      // 120/month
    ppt: 25        // 25/month
  },
  PREMIUM: {
    image: 80,     // 80/month
    video: 15,     // 15/month
    song: 35,      // 35/month
    tts: 200,      // 200/month
    ppt: 35        // 35/month
  }
};

// Token limits per month
export const TIER_TOKEN_LIMITS: Record<TierType, number> = {
  FREE: 15000,      // 15K/month
  STARTER: 100000,  // 100K/month
  PRO: 220000,      // 220K/month
  PREMIUM: 560000   // 560K/month
};

// Keep daily limits for backwards compatibility (divide monthly by 30)
export const TIER_DAILY_LIMITS: Record<TierType, Record<GenerationType, number>> = {
  FREE: {
    image: 1,     // ~2/month
    video: 0,
    song: 0,
    tts: 1,
    ppt: 0
  },
  STARTER: {
    image: 1,
    video: 1,
    song: 1,
    tts: 2,
    ppt: 1
  },
  PRO: {
    image: 2,
    video: 1,
    song: 1,
    tts: 4,
    ppt: 1
  },
  PREMIUM: {
    image: 3,
    video: 1,
    song: 2,
    tts: 7,
    ppt: 2
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
