/**
 * User Tier Service
 * Returns actual subscription tier: free, starter_2, starter, pro, premium
 */

import { getUserProfile } from './supabaseClient';

export type UserTierType = 'free' | 'starter_2' | 'starter' | 'pro' | 'premium';

export interface UserTierInfo {
  tier: UserTierType;
  isPaid: boolean;
  isHiddenTier: boolean; // starter_2 is hidden referral tier
  tokenBalance: number;
  totalTokens: number;
}

/**
 * Get user tier information from Supabase
 * Returns actual tier: free, starter_2, starter, pro, premium
 */
export async function getUserTier(userId: string): Promise<UserTierInfo> {
  try {
    const profile = await getUserProfile(userId);

    if (!profile) {
      return getDefaultTierInfo();
    }

    // Get subscription tier from database - this is the source of truth
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const p = profile as any;
    const dbTier = (p.subscription_tier || p.plan || 'free').toLowerCase();
    const subscriptionStatus = p.subscription_status;
    const isPaidColumn = p.is_paid === true;

    // Normalize tier name
    let tier: UserTierType = 'free';
    if (dbTier === 'starter_2' || dbTier === 'starter2') {
      tier = 'starter_2';
    } else if (dbTier === 'starter') {
      tier = 'starter';
    } else if (dbTier === 'pro') {
      tier = 'pro';
    } else if (dbTier === 'premium' || dbTier === 'enterprise') {
      tier = 'premium';
    }

    // Override free if subscription is active
    if (tier === 'free' && (isPaidColumn || subscriptionStatus === 'active')) {
      tier = 'starter'; // Default to starter if paid but tier unknown
    }

    const tokensLimit = profile.tokens_limit || 0;
    const tokensUsed = profile.tokens_used || 0;
    const tokenBalance = Math.max(0, tokensLimit - tokensUsed);

    return {
      tier,
      isPaid: tier !== 'free',
      isHiddenTier: tier === 'starter_2',
      tokenBalance,
      totalTokens: tokensLimit
    };
  } catch (err) {
    console.error('❌ [TierService] Exception getting user tier:', err);
    return getDefaultTierInfo();
  }
}

function getDefaultTierInfo(): UserTierInfo {
  return {
    tier: 'free',
    isPaid: false,
    isHiddenTier: false,
    tokenBalance: 0,
    totalTokens: 0
  };
}

export async function isUserPaid(userId: string): Promise<boolean> {
  const tierInfo = await getUserTier(userId);
  return tierInfo.isPaid;
}

export async function getUserTokenBalance(userId: string): Promise<number> {
  const tierInfo = await getUserTier(userId);
  return tierInfo.tokenBalance;
}

/**
 * Check if user has specific tier or higher
 */
export function isTierAtLeast(userTier: UserTierType, requiredTier: UserTierType): boolean {
  const tierOrder: UserTierType[] = ['free', 'starter_2', 'starter', 'pro', 'premium'];
  return tierOrder.indexOf(userTier) >= tierOrder.indexOf(requiredTier);
}
