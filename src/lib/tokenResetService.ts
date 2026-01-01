/**
 * Token Reset Service
 * Handles monthly token reset logic for free users
 * 
 * Logic:
 * - Free users: Tokens reset to 20k after 1 month, no rollover
 * - Paid users: Tokens rollover if subscription is active
 * - Early adopter bonus (300k) is one-time, next month becomes 20k
 */

import { supabase, getUserProfile, updateUserProfile } from './supabaseClient';

// Constants - Token limits per tier (monthly)
export const MONTHLY_FREE_TOKENS = 20000; // 20k tokens per month for free users
export const TOKEN_RESET_PERIOD_MS = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

// Token limits by plan
export const PLAN_TOKEN_LIMITS = {
    free: 20000,       // 20K
    starter: 100000,   // 100K
    pro: 200000,       // 200K  
    premium: 500000,   // 500K
} as const;

export interface TokenResetResult {
    wasReset: boolean;
    previousBalance: number;
    newBalance: number;
    nextResetDate: Date;
    isPaidUser: boolean;
}

/**
 * Check if a user's tokens should be reset based on their account age
 * and perform the reset if necessary
 */
export const checkAndResetTokens = async (userId: string): Promise<TokenResetResult | null> => {
    try {
        const profile = await getUserProfile(userId);

        if (!profile) {
            return null;
        }

        const now = new Date();

        // Get user's creation date and last reset date
        const createdAt = new Date(profile.created_at);
        const lastTokenResetAt = profile.last_token_reset_at
            ? new Date(profile.last_token_reset_at)
            : createdAt;

        // Calculate next reset date (1 month from last reset)
        const nextResetDate = new Date(lastTokenResetAt.getTime() + TOKEN_RESET_PERIOD_MS);

        // Get current token balance and plan
        const tokensLimit = profile.tokens_limit || 0;
        const tokensUsed = profile.tokens_used || 0;
        const currentBalance = tokensLimit - tokensUsed;
        const plan = profile.plan || 'free';
        const isPaidUser = plan === 'pro' || plan === 'enterprise';

        // Check if reset is due
        if (now < nextResetDate) {
            return {
                wasReset: false,
                previousBalance: currentBalance,
                newBalance: currentBalance,
                nextResetDate,
                isPaidUser
            };
        }

        // Token reset is due!
        if (isPaidUser) {
            // Paid users: tokens rollover, just update the reset date
            await updateUserProfile(userId, {
                last_token_reset_at: now.toISOString()
            });

            const updatedNextResetDate = new Date(now.getTime() + TOKEN_RESET_PERIOD_MS);

            return {
                wasReset: true,
                previousBalance: currentBalance,
                newBalance: currentBalance, // No change for paid users
                nextResetDate: updatedNextResetDate,
                isPaidUser
            };
        } else {
            // Free users: reset tokens to 100k
            await updateUserProfile(userId, {
                tokens_limit: MONTHLY_FREE_TOKENS,
                tokens_used: 0,
                last_token_reset_at: now.toISOString()
            });

            const updatedNextResetDate = new Date(now.getTime() + TOKEN_RESET_PERIOD_MS);

            return {
                wasReset: true,
                previousBalance: currentBalance,
                newBalance: MONTHLY_FREE_TOKENS,
                nextResetDate: updatedNextResetDate,
                isPaidUser
            };
        }
    } catch (error) {
        console.error('❌ [TokenReset] Error checking/resetting tokens:', error);
        return null;
    }
};

/**
 * Get the next token reset date for a user
 */
export const getNextResetDate = async (userId: string): Promise<Date | null> => {
    try {
        const profile = await getUserProfile(userId);

        if (!profile) {
            return null;
        }

        const createdAt = new Date(profile.created_at);
        const lastTokenResetAt = profile.last_token_reset_at
            ? new Date(profile.last_token_reset_at)
            : createdAt;

        return new Date(lastTokenResetAt.getTime() + TOKEN_RESET_PERIOD_MS);
    } catch (error) {
        console.error('❌ [TokenReset] Error getting next reset date:', error);
        return null;
    }
};

/**
 * Calculate days until next token reset
 */
export const getDaysUntilReset = async (userId: string): Promise<number | null> => {
    const nextResetDate = await getNextResetDate(userId);
    if (!nextResetDate) return null;

    const now = new Date();
    const diffMs = nextResetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
};

/**
 * Force reset tokens for a user (admin function)
 */
export const forceResetTokens = async (
    userId: string,
    newTokenLimit: number = MONTHLY_FREE_TOKENS
): Promise<boolean> => {
    try {
        await updateUserProfile(userId, {
            tokens_limit: newTokenLimit,
            tokens_used: 0,
            last_token_reset_at: new Date().toISOString()
        });

        return true;
    } catch (error) {
        console.error('❌ [TokenReset] Force reset failed:', error);
        return false;
    }
};

export default {
    checkAndResetTokens,
    getNextResetDate,
    getDaysUntilReset,
    forceResetTokens,
    MONTHLY_FREE_TOKENS,
    TOKEN_RESET_PERIOD_MS
};
