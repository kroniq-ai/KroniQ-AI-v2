/**
 * Unified Premium Access Service
 * Uses Supabase for premium status checks
 */

import { supabase, getCurrentUser, getUserProfile } from './supabaseClient';

export interface UnifiedPremiumStatus {
  isPremium: boolean;
  userId: string;
  paidTokens: number;
  totalTokens: number;
  tier: string;
  source: string;
  timestamp: number;
}

const CACHE_DURATION = 1000; // Reduced to 1 second for faster updates
const cache = new Map<string, UnifiedPremiumStatus>();
const profileSubscriptions = new Map<string, any>();
const statusChangeCallbacks = new Map<string, Set<(status: UnifiedPremiumStatus) => void>>();

// Expose debug functions to window
if (typeof window !== 'undefined') {
  (window as any).debugPremium = {
    checkStatus: async (userId?: string) => {
      const status = await getUnifiedPremiumStatus(userId);
      console.log('🔍 Premium Status:', status);
      return status;
    },
    clearCache: (userId?: string) => {
      clearUnifiedCache(userId);
      console.log('🗑️ Cache cleared');
    },
    forceRefresh: async (userId?: string) => {
      const status = await forceRefreshPremiumStatus(userId);
      console.log('🔄 Force refreshed:', status);
      return status;
    }
  };
}

async function waitForAuth(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id || null;
}

export async function getUnifiedPremiumStatus(userIdOverride?: string): Promise<UnifiedPremiumStatus> {
  let userId = userIdOverride;

  if (!userId) {
    userId = await waitForAuth();
  }

  if (!userId) {
    return createFreeStatus('no_user');
  }

  const cached = cache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached;
  }

  try {
    const profile = await getUserProfile(userId);

    if (!profile) {
      console.warn('⚠️ No profile found for user:', userId);
      return createFreeStatus('no_profile');
    }

    const paidTokens = profile.paid_tokens_balance || 0;
    const tokensLimit = profile.tokens_limit || 0;
    const tokensUsed = profile.tokens_used || 0;
    const totalTokens = tokensLimit - tokensUsed;
    const plan = profile.plan || 'free';

    // Premium status: check plan
    const isPremium = (plan === 'pro' || plan === 'enterprise');

    const status: UnifiedPremiumStatus = {
      isPremium,
      userId,
      paidTokens,
      totalTokens,
      tier: plan,
      source: 'unified_check',
      timestamp: Date.now()
    };

    cache.set(userId, status);
    return status;

  } catch (error) {
    console.error('❌ Error fetching premium status:', error);
    return createFreeStatus('exception');
  }
}

function createFreeStatus(reason: string): UnifiedPremiumStatus {
  return {
    isPremium: false,
    userId: '',
    paidTokens: 0,
    totalTokens: 0,
    tier: 'free',
    source: reason,
    timestamp: Date.now()
  };
}

export function clearUnifiedCache(userId?: string): void {
  if (userId) {
    cache.delete(userId);
  } else {
    cache.clear();
  }
}

export async function forceRefreshPremiumStatus(userId?: string): Promise<UnifiedPremiumStatus> {
  if (!userId) {
    userId = await waitForAuth();
  }
  if (userId) {
    clearUnifiedCache(userId);
  }
  return getUnifiedPremiumStatus(userId || undefined);
}

/**
 * Subscribe to real-time premium status changes for a user
 */
export function subscribeToProfileChanges(
  userId: string,
  callback: (status: UnifiedPremiumStatus) => void
): () => void {
  // Add callback to the set
  if (!statusChangeCallbacks.has(userId)) {
    statusChangeCallbacks.set(userId, new Set());
  }
  statusChangeCallbacks.get(userId)!.add(callback);

  // Set up subscription if not already subscribed
  if (!profileSubscriptions.has(userId)) {
    const channel = supabase
      .channel(`profile_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        async () => {
          // Clear cache and fetch fresh status
          clearUnifiedCache(userId);
          const newStatus = await getUnifiedPremiumStatus(userId);

          // Notify all callbacks
          const callbacks = statusChangeCallbacks.get(userId);
          if (callbacks) {
            callbacks.forEach(cb => cb(newStatus));
          }
        }
      )
      .subscribe();

    profileSubscriptions.set(userId, channel);
  }

  // Return unsubscribe function
  return () => {
    const callbacks = statusChangeCallbacks.get(userId);
    if (callbacks) {
      callbacks.delete(callback);

      // If no more callbacks, unsubscribe from Supabase
      if (callbacks.size === 0) {
        const channel = profileSubscriptions.get(userId);
        if (channel) {
          supabase.removeChannel(channel);
          profileSubscriptions.delete(userId);
        }
        statusChangeCallbacks.delete(userId);
      }
    }
  };
}
