/**
 * Business Context Service
 * Handles CRUD operations for business contexts in the Business Panel
 */

import { supabase, getCurrentUser } from './supabaseClient';
import { getPlan, hasBusinessPanelAccess, getBusinessContextLimit, hasFullBusinessPanel } from './pricingPlans';
import type { PlanType } from './pricingPlans';

// ===== TYPES =====

export type BusinessStage = 'idea' | 'mvp' | 'growth' | 'scaling';

export interface BusinessContext {
    id: string;
    user_id: string;
    name: string;
    industry: string;
    target_audience: string;
    stage: BusinessStage;
    primary_goals: string[];
    is_active: boolean;
    memory: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface CreateBusinessContextInput {
    name: string;
    industry: string;
    target_audience: string;
    stage: BusinessStage;
    primary_goals: string[];
}

export interface UpdateBusinessContextInput extends Partial<CreateBusinessContextInput> {
    memory?: Record<string, any>;
}

// ===== ACCESS CHECK =====

/**
 * Check if user can access Business Panel based on their plan
 * NOTE: Business Panel is now available to ALL users with different limits:
 * - Free: 1 context
 * - Pro: 3 contexts
 * - Premium: Unlimited contexts (-1)
 */
export async function canAccessBusinessPanel(userId: string): Promise<{
    hasAccess: boolean;
    planType: PlanType;
    contextLimit: number;
    message?: string;
}> {
    try {
        const { data, error } = await supabase
            .from('user_subscriptions')
            .select('plan_type')
            .eq('user_id', userId)
            .single();

        // Default to free plan with 1 context if no subscription found
        if (error || !data) {
            return {
                hasAccess: true, // All users can access
                planType: 'free',
                contextLimit: 1, // Free users get 1 context
                message: undefined,
            };
        }

        const planType = data.plan_type as PlanType;
        const contextLimit = getBusinessContextLimit(planType);

        // All users have access now - just with different limits
        return {
            hasAccess: true,
            planType,
            contextLimit,
            message: undefined,
        };
    } catch (error) {
        console.error('Error checking Business Panel access:', error);
        // Even on error, grant access with limited context
        return {
            hasAccess: true,
            planType: 'free',
            contextLimit: 1,
            message: undefined,
        };
    }
}

// ===== CRUD OPERATIONS =====

/**
 * Get all business contexts for a user
 */
export async function getBusinessContexts(userId: string): Promise<BusinessContext[]> {
    try {
        const { data, error } = await supabase
            .from('business_contexts')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Error fetching business contexts:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Exception fetching business contexts:', error);
        return [];
    }
}

/**
 * Get the active business context for a user
 */
export async function getActiveBusinessContext(userId: string): Promise<BusinessContext | null> {
    try {
        const { data, error } = await supabase
            .from('business_contexts')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .single();

        if (error || !data) {
            return null;
        }

        return data;
    } catch (error) {
        console.error('Exception fetching active context:', error);
        return null;
    }
}

/**
 * Create a new business context
 */
export async function createBusinessContext(
    userId: string,
    input: CreateBusinessContextInput
): Promise<{ success: boolean; context?: BusinessContext; error?: string }> {
    try {
        // Check access and limits
        const access = await canAccessBusinessPanel(userId);
        if (!access.hasAccess) {
            return { success: false, error: access.message };
        }

        // Check context limit (for Pro users)
        if (access.contextLimit !== -1) {
            const existing = await getBusinessContexts(userId);
            if (existing.length >= access.contextLimit) {
                return {
                    success: false,
                    error: `You can only have ${access.contextLimit} business context${access.contextLimit > 1 ? 's' : ''} on the ${access.planType} plan. Upgrade to Premium for unlimited contexts.`,
                };
            }
        }

        // Deactivate all other contexts first
        await supabase
            .from('business_contexts')
            .update({ is_active: false })
            .eq('user_id', userId);

        // Create new context
        const { data, error } = await supabase
            .from('business_contexts')
            .insert({
                user_id: userId,
                name: input.name,
                industry: input.industry,
                target_audience: input.target_audience,
                stage: input.stage,
                primary_goals: input.primary_goals,
                is_active: true,
                memory: {},
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating business context:', error);
            return { success: false, error: 'Failed to create business context' };
        }

        return { success: true, context: data };
    } catch (error) {
        console.error('Exception creating business context:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

/**
 * Update a business context
 */
export async function updateBusinessContext(
    contextId: string,
    userId: string,
    input: UpdateBusinessContextInput
): Promise<{ success: boolean; error?: string }> {
    try {
        const { error } = await supabase
            .from('business_contexts')
            .update({
                ...input,
                updated_at: new Date().toISOString(),
            })
            .eq('id', contextId)
            .eq('user_id', userId);

        if (error) {
            console.error('Error updating business context:', error);
            return { success: false, error: 'Failed to update business context' };
        }

        return { success: true };
    } catch (error) {
        console.error('Exception updating business context:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

/**
 * Delete a business context
 */
export async function deleteBusinessContext(
    contextId: string,
    userId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Check if user has Premium (only Premium can delete)
        const access = await canAccessBusinessPanel(userId);
        if (!hasFullBusinessPanel(access.planType)) {
            return {
                success: false,
                error: 'Only Premium users can delete business contexts',
            };
        }

        const { error } = await supabase
            .from('business_contexts')
            .delete()
            .eq('id', contextId)
            .eq('user_id', userId);

        if (error) {
            console.error('Error deleting business context:', error);
            return { success: false, error: 'Failed to delete business context' };
        }

        return { success: true };
    } catch (error) {
        console.error('Exception deleting business context:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

/**
 * Set a context as active (deactivates others)
 */
export async function setActiveContext(
    contextId: string,
    userId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        // Deactivate all contexts
        await supabase
            .from('business_contexts')
            .update({ is_active: false })
            .eq('user_id', userId);

        // Activate the selected one
        const { error } = await supabase
            .from('business_contexts')
            .update({ is_active: true, updated_at: new Date().toISOString() })
            .eq('id', contextId)
            .eq('user_id', userId);

        if (error) {
            console.error('Error setting active context:', error);
            return { success: false, error: 'Failed to set active context' };
        }

        return { success: true };
    } catch (error) {
        console.error('Exception setting active context:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}

/**
 * Update context memory (Premium only)
 */
export async function updateContextMemory(
    contextId: string,
    userId: string,
    memory: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
    try {
        // Check if user has Premium (only Premium has long-term memory)
        const access = await canAccessBusinessPanel(userId);
        if (!hasFullBusinessPanel(access.planType)) {
            return {
                success: false,
                error: 'Long-term memory is only available on Premium plan',
            };
        }

        const { error } = await supabase
            .from('business_contexts')
            .update({
                memory,
                updated_at: new Date().toISOString(),
            })
            .eq('id', contextId)
            .eq('user_id', userId);

        if (error) {
            console.error('Error updating context memory:', error);
            return { success: false, error: 'Failed to update memory' };
        }

        return { success: true };
    } catch (error) {
        console.error('Exception updating context memory:', error);
        return { success: false, error: 'An unexpected error occurred' };
    }
}
