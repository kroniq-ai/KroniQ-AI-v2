/**
 * Unified Premium Access Service
 * CONSOLIDATED: Now delegates to userTierService for tier determination
 */

import { supabase, getCurrentUser } from './supabaseClient';
import { getUserTier, type UserTierType } from './userTierService';

export interface UnifiedPremiumStatus {
  isPremium: boolean;
  userId: string;
  paidTokens: number;
  totalTokens: number;
  tier: UserTierType;
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
    const authId = await waitForAuth();
    userId = authId ?? undefined;
  }

  if (!userId) {
    return createFreeStatus('no_user');
  }

  const cached = cache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached;
  }

  try {
    // CONSOLIDATED: Use userTierService as single source of truth
    const tierInfo = await getUserTier(userId);

    const status: UnifiedPremiumStatus = {
      isPremium: tierInfo.isPaid, // isPaid = tier !== 'free'
      userId,
      paidTokens: 0, // Not tracked in new system
      totalTokens: tierInfo.tokenBalance,
      tier: tierInfo.tier,
      source: 'userTierService',
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
  let id = userId;
  if (!id) {
    const authId = await waitForAuth();
    id = authId ?? undefined;
  }
  if (id) {
    clearUnifiedCache(id);
  }
  return getUnifiedPremiumStatus(id);
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
