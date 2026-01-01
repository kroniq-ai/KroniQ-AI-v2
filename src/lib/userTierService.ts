/**
 * User Tier Service
 * Uses Supabase for user tier/premium status
 */

import { supabase, getUserProfile } from './supabaseClient';

export interface UserTierInfo {
  tier: 'free' | 'premium';
  isPremium: boolean;
  hasPaidTokens: boolean;
  tokenBalance: number;
  totalTokens: number;
  freeTokens: number;
  paidTokens: number;
}

/**
 * Get user tier information from Supabase
 */
export async function getUserTier(userId: string): Promise<UserTierInfo> {
  try {
    const profile = await getUserProfile(userId);

    if (!profile) {
      return getDefaultTierInfo();
    }

    const tokensLimit = profile.tokens_limit || 0;
    const tokensUsed = profile.tokens_used || 0;
    const tokenBalance = tokensLimit - tokensUsed;
    const plan = profile.plan || 'free';
    const isPremium = plan === 'pro' || plan === 'enterprise' || tokenBalance > 500000;

    const tierInfo: UserTierInfo = {
      tier: isPremium ? 'premium' : 'free',
      isPremium,
      hasPaidTokens: tokenBalance > 100000,
      tokenBalance,
      totalTokens: tokenBalance,
      freeTokens: isPremium ? 0 : tokenBalance,
      paidTokens: isPremium ? tokenBalance : 0
    };

    return tierInfo;
  } catch (err) {
    console.error('❌ [TierService] Exception getting user tier:', err);
    return getDefaultTierInfo();
  }
}

function getDefaultTierInfo(): UserTierInfo {
  return {
    tier: 'free',
    isPremium: false,
    hasPaidTokens: false,
    tokenBalance: 0,
    totalTokens: 0,
    freeTokens: 0,
    paidTokens: 0
  };
}

export async function isUserPremium(userId: string): Promise<boolean> {
  const tierInfo = await getUserTier(userId);
  return tierInfo.isPremium;
}

export async function getUserTokenBalance(userId: string): Promise<number> {
  const tierInfo = await getUserTier(userId);
  return tierInfo.tokenBalance;
}
