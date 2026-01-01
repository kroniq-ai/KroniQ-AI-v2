import { supabase } from './supabaseClient';
import { getModelCost, calculateTokensForMessage } from './modelTokenPricing';

const TOKEN_CONVERSION_RATE = 1000000;
const PROFIT_MARGIN_PERCENTAGE = 0.35;

export interface TokenCostEstimate {
  estimatedTokens: number;
  providerCostUSD: number;
  profitMarginUSD: number;
  totalCostUSD: number;
  hasEnoughBalance: boolean;
  currentBalance: number;
}

export interface TokenDeductionResult {
  success: boolean;
  balance: number;
  transactionId?: string;
  error?: string;
}



export async function getUserTokenBalance(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('tokens_used, tokens_limit')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;

    const balance = (data?.tokens_limit || 20000) - (data?.tokens_used || 0);
    return balance;
  } catch (error) {
    console.error('Error fetching token balance:', error);
    return 0;
  }
}

export async function checkAndRefreshDailyTokens(userId: string): Promise<void> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('last_token_refresh, daily_free_tokens, is_token_user')
      .eq('id', userId)
      .maybeSingle();

    if (!profile || !profile.is_token_user) return;

    const lastRefresh = profile.last_token_refresh
      ? new Date(profile.last_token_refresh)
      : new Date(0);

    const now = new Date();
    const hoursSinceRefresh = (now.getTime() - lastRefresh.getTime()) / (1000 * 60 * 60);

    if (hoursSinceRefresh >= 24) {
      const { error } = await supabase.rpc('refresh_daily_tokens');
      if (error) console.error('Error refreshing daily tokens:', error);
    }
  } catch (error) {
    console.error('Error in checkAndRefreshDailyTokens:', error);
  }
}

export function estimateTokenCost(
  modelId: string,
  inputText: string
): { providerCostUSD: number; tokens: number } {
  const modelCost = getModelCost(modelId);
  const tokens = calculateTokensForMessage(inputText, modelId);

  const providerCostUSD = modelCost.costPerMessage;

  return { providerCostUSD, tokens };
}

export async function estimateRequestCost(
  userId: string,
  modelId: string,
  inputText: string
): Promise<TokenCostEstimate> {
  const { providerCostUSD, tokens } = estimateTokenCost(modelId, inputText);
  const currentBalance = await getUserTokenBalance(userId);
  const profitMarginUSD = providerCostUSD * PROFIT_MARGIN_PERCENTAGE;

  return {
    estimatedTokens: tokens,
    providerCostUSD,
    profitMarginUSD,
    totalCostUSD: providerCostUSD * (1 + PROFIT_MARGIN_PERCENTAGE),
    hasEnoughBalance: currentBalance >= tokens,
    currentBalance,
  };
}

export async function deductTokensForRequest(
  userId: string,
  modelId: string,
  provider: string,
  customTokensToDeduct: number,
  requestType: string = 'chat'
): Promise<TokenDeductionResult> {
  console.log('💰 [TokenService] Starting deduction:', { userId, modelId, tokensToDeduct: customTokensToDeduct });

  try {
    const modelCost = getModelCost(modelId);
    const tokensToDeduct = customTokensToDeduct > 0
      ? Math.ceil(customTokensToDeduct)
      : modelCost.tokensPerMessage;

    console.log('💰 [TokenService] Tokens to deduct:', tokensToDeduct);

    // DIRECT UPDATE - No RPC needed
    // Step 1: Get current usage
    const { data: profileData, error: fetchError } = await supabase
      .from('profiles')
      .select('tokens_used, tokens_limit')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('❌ [TokenService] Failed to fetch profile:', fetchError);
      return { success: false, balance: 0, error: 'Failed to fetch profile: ' + fetchError.message };
    }

    if (!profileData) {
      console.error('❌ [TokenService] No profile found for user:', userId);
      return { success: false, balance: 0, error: 'Profile not found' };
    }

    const currentUsed = profileData.tokens_used || 0;
    const limit = profileData.tokens_limit || 20000;
    const newUsed = currentUsed + tokensToDeduct;
    const remaining = Math.max(0, limit - newUsed);

    console.log('💰 [TokenService] Before update:', { currentUsed, limit, newUsed, remaining });

    // Step 2: Update the profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        tokens_used: newUsed,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('❌ [TokenService] Update failed:', updateError);
      return { success: false, balance: limit - currentUsed, error: 'Update failed: ' + updateError.message };
    }

    console.log('✅ [TokenService] Successfully deducted:', { oldUsed: currentUsed, newUsed, remaining });

    // Dispatch event to update UI
    if (typeof window !== 'undefined') {
      console.log('📡 [TokenService] Dispatching tokenBalanceUpdated event');
      window.dispatchEvent(new CustomEvent('tokenBalanceUpdated', {
        detail: { balance: remaining, used: newUsed, limit }
      }));
    }

    return {
      success: true,
      balance: remaining,
    };
  } catch (error: any) {
    console.error('❌ [TokenService] Exception:', error);
    return {
      success: false,
      balance: 0,
      error: error.message || 'Failed to deduct tokens',
    };
  }
}

export async function addTokensToUser(
  userId: string,
  tokens: number,
  packId?: string,
  amountPaid?: number,
  stripePaymentId?: string
): Promise<{ success: boolean; balance?: number; error?: string }> {
  try {
    const { data, error } = await supabase.rpc('add_tokens', {
      p_user_id: userId,
      p_tokens: tokens,
      p_pack_id: packId || null,
      p_amount_paid: amountPaid || 0,
      p_stripe_payment_id: stripePaymentId || null,
    });

    if (error) throw error;

    const result = data as { success: boolean; balance?: number };
    return result;
  } catch (error: any) {
    console.error('Error adding tokens:', error);
    return { success: false, error: error.message };
  }
}

export async function getTokenPacks() {
  try {
    const { data, error } = await supabase
      .from('token_packs')
      .select('*')
      .eq('active', true)
      .order('tokens', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching token packs:', error);
    return [];
  }
}

export async function getTokenTransactions(userId: string, limit: number = 50) {
  try {
    const { data, error } = await supabase
      .from('token_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching token transactions:', error);
    return [];
  }
}

export async function getTokenPurchases(userId: string) {
  try {
    const { data, error } = await supabase
      .from('token_purchases')
      .select('*, token_packs(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching token purchases:', error);
    return [];
  }
}

export function usdToTokens(usd: number): number {
  return Math.ceil(usd * TOKEN_CONVERSION_RATE);
}

export function tokensToUSD(tokens: number): number {
  return tokens / TOKEN_CONVERSION_RATE;
}
