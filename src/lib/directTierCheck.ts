import { getUserTier } from './userTierService';

export interface DirectTierResult {
  isPremium: boolean;
  tierSource: 'paid_tier_users' | 'free_tier_users' | 'profiles' | 'unknown' | 'userTierService';
  userId: string;
  details: any;
}

/**
 * CONSOLIDATED: Now delegates to userTierService
 * Kept for backwards compatibility - consider using getUserTier directly
 */
export async function checkUserTierDirect(userId: string): Promise<DirectTierResult> {
  console.log('═══════════════════════════════════════════════════');
  console.log('🔍 DIRECT TIER CHECK - STARTING');
  console.log('═══════════════════════════════════════════════════');
  console.log('User ID:', userId);

  if (!userId) {
    console.error('❌ No user ID provided!');
    console.log('═══════════════════════════════════════════════════');
    return {
      isPremium: false,
      tierSource: 'unknown',
      userId: '',
      details: null
    };
  }

  try {
    // CONSOLIDATED: Use userTierService as single source of truth
    const tierInfo = await getUserTier(userId);

    const isPremium = tierInfo.isPaid;
    const tier = tierInfo.tier;

    if (isPremium) {
      console.log('\n🎉🎉🎉 USER IS PREMIUM! 🎉🎉🎉');
      console.log('   Tier:', tier);
      console.log('   Token Balance:', tierInfo.tokenBalance);
      console.log('   PREMIUM ACCESS: ✅ GRANTED');
    } else {
      console.log('\n🔒 USER IS FREE');
      console.log('   Tier:', tier);
      console.log('   PREMIUM ACCESS: ❌ DENIED');
    }
    console.log('═══════════════════════════════════════════════════\n');

    return {
      isPremium,
      tierSource: 'userTierService',
      userId,
      details: {
        tier,
        tokenBalance: tierInfo.tokenBalance,
        isPaid: tierInfo.isPaid
      }
    };

  } catch (error) {
    console.error('\n❌❌❌ EXCEPTION IN DIRECT TIER CHECK ❌❌❌');
    console.error('Error:', error);
    console.error('═══════════════════════════════════════════════════\n');
    return {
      isPremium: false,
      tierSource: 'unknown',
      userId,
      details: null
    };
  }
}

