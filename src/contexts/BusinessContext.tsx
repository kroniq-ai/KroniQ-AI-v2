/**
 * Business Context Provider
 * React context for managing business contexts in the Business Panel
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
    BusinessContext,
    CreateBusinessContextInput,
    UpdateBusinessContextInput,
    getBusinessContexts,
    getActiveBusinessContext,
    createBusinessContext,
    updateBusinessContext,
    deleteBusinessContext,
    setActiveContext,
    canAccessBusinessPanel,
} from '../lib/businessContextService';
import type { PlanType } from '../lib/pricingPlans';

// ===== TYPES =====

interface BusinessPanelAccess {
    hasAccess: boolean;
    planType: PlanType;
    contextLimit: number;
    message?: string;
}

interface BusinessContextValue {
    // State
    contexts: BusinessContext[];
    activeContext: BusinessContext | null;
    access: BusinessPanelAccess;
    isLoading: boolean;
    error: string | null;

    // Actions
    createContext: (input: CreateBusinessContextInput) => Promise<{ success: boolean; error?: string }>;
    updateContext: (contextId: string, input: UpdateBusinessContextInput) => Promise<{ success: boolean; error?: string }>;
    deleteContext: (contextId: string) => Promise<{ success: boolean; error?: string }>;
    switchContext: (contextId: string) => Promise<{ success: boolean; error?: string }>;
    refreshContexts: () => Promise<void>;
}

// ===== CONTEXT =====

const BusinessContextContext = createContext<BusinessContextValue | undefined>(undefined);

// ===== PROVIDER =====

export const BusinessContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();

    const [contexts, setContexts] = useState<BusinessContext[]>([]);
    const [activeContext, setActiveContextState] = useState<BusinessContext | null>(null);
    const [access, setAccess] = useState<BusinessPanelAccess>({
        hasAccess: false,
        planType: 'free',
        contextLimit: 0,
        message: 'Loading...',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load contexts and check access
    const refreshContexts = useCallback(async () => {
        if (!currentUser?.id) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            // Check access
            const accessResult = await canAccessBusinessPanel(currentUser.id);

            // Admin email override - grant full access to specific email
            const adminEmails = ['atirek.sd11@gmail.com'];
            const isAdminUser = currentUser.email && adminEmails.includes(currentUser.email.toLowerCase());

            if (isAdminUser) {
                // Override: grant full premium access for admin users
                setAccess({
                    hasAccess: true,
                    planType: 'premium',
                    contextLimit: 999,
                    message: 'Admin access granted',
                });
            } else {
                setAccess(accessResult);
            }

            if (accessResult.hasAccess || isAdminUser) {
                // Load contexts
                const contextList = await getBusinessContexts(currentUser.id);
                setContexts(contextList);

                // Get active context
                const active = await getActiveBusinessContext(currentUser.id);
                setActiveContextState(active);
            } else {
                setContexts([]);
                setActiveContextState(null);
            }
        } catch (err) {
            console.error('Error loading business contexts:', err);
            setError('Failed to load business contexts');
        } finally {
            setIsLoading(false);
        }
    }, [currentUser?.id]);

    // Initial load
    useEffect(() => {
        refreshContexts();
    }, [refreshContexts]);

    // Create context
    const handleCreateContext = useCallback(async (input: CreateBusinessContextInput) => {
        if (!currentUser?.id) {
            return { success: false, error: 'Not authenticated' };
        }

        try {
            const result = await createBusinessContext(currentUser.id, input);
            if (result.success && result.context) {
                setContexts(prev => [result.context!, ...prev]);
                setActiveContextState(result.context);
                return { success: true };
            }

            // If Supabase fails, create local-only context
            if (result.error) {
                console.warn('[BusinessContext] Supabase failed, using local context:', result.error);
                const localContext: BusinessContext = {
                    id: `local-${Date.now()}`,
                    user_id: currentUser.id,
                    name: input.name,
                    industry: input.industry || '',
                    target_audience: input.target_audience || '',
                    stage: input.stage,
                    primary_goals: input.primary_goals || [],
                    is_active: true,
                    memory: {},
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                setContexts([localContext]);
                setActiveContextState(localContext);
                return { success: true };
            }

            return { success: result.success, error: result.error };
        } catch (error) {
            console.error('[BusinessContext] Error creating context:', error);
            // Fallback: create local-only context
            const localContext: BusinessContext = {
                id: `local-${Date.now()}`,
                user_id: currentUser.id,
                name: input.name,
                industry: input.industry || '',
                target_audience: input.target_audience || '',
                stage: input.stage,
                primary_goals: input.primary_goals || [],
                is_active: true,
                memory: {},
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            setContexts([localContext]);
            setActiveContextState(localContext);
            return { success: true };
        }
    }, [currentUser?.id]);

    // Update context
    const handleUpdateContext = useCallback(async (contextId: string, input: UpdateBusinessContextInput) => {
        if (!currentUser?.id) {
            return { success: false, error: 'Not authenticated' };
        }

        const result = await updateBusinessContext(contextId, currentUser.id, input);
        if (result.success) {
            setContexts(prev => prev.map(ctx =>
                ctx.id === contextId
                    ? { ...ctx, ...input, updated_at: new Date().toISOString() }
                    : ctx
            ));
            if (activeContext?.id === contextId) {
                setActiveContextState(prev => prev ? { ...prev, ...input } : null);
            }
        }
        return result;
    }, [currentUser?.id, activeContext?.id]);

    // Delete context
    const handleDeleteContext = useCallback(async (contextId: string) => {
        if (!currentUser?.id) {
            return { success: false, error: 'Not authenticated' };
        }

        const result = await deleteBusinessContext(contextId, currentUser.id);
        if (result.success) {
            setContexts(prev => prev.filter(ctx => ctx.id !== contextId));
            if (activeContext?.id === contextId) {
                setActiveContextState(null);
            }
        }
        return result;
    }, [currentUser?.id, activeContext?.id]);

    // Switch context
    const handleSwitchContext = useCallback(async (contextId: string) => {
        if (!currentUser?.id) {
            return { success: false, error: 'Not authenticated' };
        }

        const result = await setActiveContext(contextId, currentUser.id);
        if (result.success) {
            const newActive = contexts.find(ctx => ctx.id === contextId) || null;
            setActiveContextState(newActive);
            setContexts(prev => prev.map(ctx => ({
                ...ctx,
                is_active: ctx.id === contextId,
            })));
        }
        return result;
    }, [currentUser?.id, contexts]);

    const value: BusinessContextValue = {
        contexts,
        activeContext,
        access,
        isLoading,
        error,
        createContext: handleCreateContext,
        updateContext: handleUpdateContext,
        deleteContext: handleDeleteContext,
        switchContext: handleSwitchContext,
        refreshContexts,
    };

    return (
        <BusinessContextContext.Provider value={value}>
            {children}
        </BusinessContextContext.Provider>
    );
};

// ===== HOOK =====

export function useBusinessContext(): BusinessContextValue {
    const context = useContext(BusinessContextContext);
    if (!context) {
        throw new Error('useBusinessContext must be used within a BusinessContextProvider');
    }
    return context;
}

export default BusinessContextProvider;
