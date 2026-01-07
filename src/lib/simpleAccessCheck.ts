import { getUserTier } from './userTierService';

/**
 * CONSOLIDATED: Now delegates to userTierService
 * @deprecated Use getUserTier from userTierService instead
 */
export async function isPremiumUser(userId: string): Promise<boolean> {
  if (!userId) return false;

  try {
    const tierInfo = await getUserTier(userId);
    return tierInfo.isPaid; // isPaid = tier !== 'free'
  } catch (err) {
    console.error('Exception checking premium:', err);
    return false;
  }
}

