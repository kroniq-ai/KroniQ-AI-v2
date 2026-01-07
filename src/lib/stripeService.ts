/**
 * Stripe Service
 * Uses Stripe Payment Links for checkout and handles tier updates after payment
 */

import { supabase } from './supabaseClient';

// Price IDs from Stripe Dashboard (for Checkout Sessions)
export const STRIPE_PRICE_IDS = {
    starter: 'price_1Skd0CFBTh5tg3ftUqapwbFS',
    pro: 'price_1Skd4YFBTh5tg3ftMYD6xjBg',
    premium: 'price_1Skd3LFBTh5tg3ftCYnDFxwb',
};

// Legacy Payment Link URLs (for backwards compatibility)
const PAYMENT_LINKS = {
    starter: 'https://buy.stripe.com/eVqfZhb9m4sPfCW1SB3VC02',
    pro: 'https://buy.stripe.com/aFa4gz6T6aRd2Qacxf3VC03',
    premium: 'https://buy.stripe.com/fZuaEX2CQ6AX76qcxf3VC05',
};

export type SubscriptionTier = 'FREE' | 'STARTER' | 'PRO' | 'PREMIUM';

export interface CheckoutOptions {
    priceId: string;
    tier: 'starter' | 'pro' | 'premium';
    email?: string;
}

/**
 * Redirect to Stripe Payment Link
 * Includes tier in success URL for tier update after payment
 */
export function redirectToCheckout(options: CheckoutOptions): void {
    const { tier, email } = options;

    // Build success URL with tier parameter
    const successUrl = `${window.location.origin}/dashboard?payment_success=true&tier=${tier.toUpperCase()}`;

    let url = PAYMENT_LINKS[tier];

    // Add parameters - Stripe Payment Links support client_reference_id for the tier
    const params = new URLSearchParams();
    if (email) params.append('prefilled_email', email);
    params.append('success_url', successUrl);

    // Append params if any
    if (params.toString()) {
        url += (url.includes('?') ? '&' : '?') + params.toString();
    }

    window.location.href = url;
}

/**
 * Open Stripe Customer Portal for subscription management
 * Users can cancel, update payment method, view invoices
 */
export function openBillingPortal(): void {
    const portalUrl = 'https://billing.stripe.com/p/login/28E8wPb9m6AXfCW8gZ3VC00';
    window.open(portalUrl, '_blank');
}

/**
 * Check URL for payment success and update user tier
 * Call this on app load or dashboard mount
 */
export async function handlePaymentSuccess(userId?: string): Promise<{
    success: boolean;
    tier?: SubscriptionTier;
    error?: string;
}> {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get('payment_success');
    const tierParam = urlParams.get('tier');

    if (paymentSuccess !== 'true' || !tierParam) {
        return { success: false };
    }

    const tier = tierParam as SubscriptionTier;

    // Validate tier
    if (tier !== 'STARTER' && tier !== 'PRO' && tier !== 'PREMIUM') {
        return { success: false, error: 'Invalid tier' };
    }

    console.log(`💳 Payment success detected! Tier: ${tier}, UserId: ${userId || 'waiting for session...'}`);

    // Store tier in localStorage for immediate UI update
    localStorage.setItem('kroniq_user_tier', tier);

    // Also set a pending sync flag so AuthContext can sync it to DB on next login
    localStorage.setItem('kroniq_pending_tier_sync', tier);
    console.log(`📦 Set pending tier sync: ${tier}`);

    // Try to update Supabase if userId is available
    if (userId) {
        try {
            console.log(`📝 Updating Supabase profile for user ${userId}...`);

            // Use upsert to create profile if it doesn't exist
            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: userId,
                    plan: tier.toLowerCase(),  // Use 'plan' column, not 'subscription_tier'
                }, {
                    onConflict: 'id'
                });

            if (error) {
                console.error('❌ Failed to update Supabase profile:', error.message);
                console.error('   Error details:', error);
                // Try a simpler update as fallback
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({
                        plan: tier.toLowerCase(),  // Use 'plan' column
                    })
                    .eq('id', userId);

                if (updateError) {
                    console.error('❌ Fallback update also failed:', updateError.message);
                    console.log('💾 Tier preserved in localStorage and pending sync for next login');
                } else {
                    console.log('✅ Fallback update succeeded!');
                    localStorage.removeItem('kroniq_pending_tier_sync'); // Clear pending flag
                }
            } else {
                console.log('✅ Supabase profile updated successfully!');
                localStorage.removeItem('kroniq_pending_tier_sync'); // Clear pending flag
            }
        } catch (err) {
            console.error('❌ Exception updating Supabase:', err);
            console.log('💾 Tier preserved in localStorage and pending sync for next login');
        }

        // ONLY clear URL params AFTER we've tried to update DB
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
        console.log('🔗 URL params cleared after DB update');
    } else {
        // NO userId - don't clear URL params yet! Let the next effect run handle it
        console.warn('⚠️ No userId yet - keeping URL params for retry when session loads');
        // DON'T clear URL - let the useEffect run again when currentUser is available
    }

    return { success: true, tier };
}

/**
 * Get user's current tier from localStorage (for quick UI) or Supabase (for accuracy)
 */
export function getUserTierFromStorage(): SubscriptionTier {
    const tier = localStorage.getItem('kroniq_user_tier');
    if (tier === 'STARTER' || tier === 'PRO' || tier === 'PREMIUM') return tier;
    return 'FREE';
}

/**
 * Fetch user's tier from Supabase, but trust localStorage if it has a paid tier
 * (in case DB update failed but localStorage was set)
 */
export async function getUserTierFromDB(userId: string): Promise<SubscriptionTier> {
    // First check localStorage - if it has a paid tier, trust it
    const storedTier = localStorage.getItem('kroniq_user_tier');
    if (storedTier === 'STARTER' || storedTier === 'PRO' || storedTier === 'PREMIUM') {
        console.log(`📦 Using localStorage tier: ${storedTier}`);
        return storedTier;
    }

    try {
        const { data } = await supabase
            .from('profiles')
            .select('plan')  // Use 'plan' column instead of subscription_tier
            .eq('id', userId)
            .maybeSingle();

        if (data?.plan) {
            const tier = data.plan.toUpperCase();
            if (tier === 'STARTER' || tier === 'PRO' || tier === 'PREMIUM') {
                localStorage.setItem('kroniq_user_tier', tier);
                console.log(`🗄️ Got tier from DB (plan column): ${tier}`);
                return tier;
            }
        }

        // Only return FREE if localStorage also doesn't have a paid tier
        return 'FREE';
    } catch {
        return storedTier as SubscriptionTier || 'FREE';
    }
}
