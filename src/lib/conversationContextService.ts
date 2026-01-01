/**
 * Conversation Context Service
 * Manages persistent conversation context with versioning
 * Separates long-term (business info) from short-term (current task) context
 */

import { supabase, getCurrentUser } from './supabaseClient';

// ===== TYPES =====

export interface LongTermContext {
    businessName?: string;
    industry?: string;
    targetAudience?: string;
    brandTone?: string;
    primaryGoals?: string[];
    competitorAnalysis?: string;
    uniqueSellingPoints?: string[];
    assets?: Array<{
        name: string;
        type: 'logo' | 'image' | 'video' | 'document' | 'other';
        url?: string;
        createdAt: string;
    }>;
    customData?: Record<string, any>;
}

export interface ShortTermContext {
    currentTask?: string;
    taskType?: 'chat' | 'image' | 'video' | 'ppt';
    recentTopics?: string[];
    pendingActions?: string[];
    conversationSummary?: string;
    userPreferences?: {
        preferredTone?: string;
        outputLength?: 'short' | 'medium' | 'long';
        style?: string;
    };
}

export interface ContextVersion {
    version: number;
    longTerm: LongTermContext;
    shortTerm: ShortTermContext;
    savedAt: string;
    changeReason?: string;
}

export interface ConversationContextRecord {
    id: string;
    projectId: string;
    userId: string;
    longTermContext: LongTermContext;
    shortTermContext: ShortTermContext;
    contextVersions: ContextVersion[];
    currentVersion: number;
    createdAt: string;
    updatedAt: string;
}

// ===== HELPER FUNCTIONS =====

function log(level: 'info' | 'success' | 'error' | 'warning', message: string) {
    const emoji = { info: '📝', success: '✅', error: '❌', warning: '⚠️' }[level];
    console.log(`${emoji} [ContextService] ${message}`);
}

// ===== CRUD OPERATIONS =====

/**
 * Get or create conversation context for a project
 */
export async function getOrCreateContext(
    projectId: string
): Promise<ConversationContextRecord | null> {
    try {
        const user = await getCurrentUser();
        if (!user) {
            log('error', 'No authenticated user');
            return null;
        }

        // Try to get existing context
        const { data: existing, error: fetchError } = await supabase
            .from('conversation_context')
            .select('*')
            .eq('project_id', projectId)
            .eq('user_id', user.id)
            .maybeSingle();

        if (existing && !fetchError) {
            return {
                id: existing.id,
                projectId: existing.project_id,
                userId: existing.user_id,
                longTermContext: existing.long_term_context || {},
                shortTermContext: existing.short_term_context || {},
                contextVersions: existing.context_versions || [],
                currentVersion: existing.current_version || 1,
                createdAt: existing.created_at,
                updatedAt: existing.updated_at,
            };
        }

        // Create new context
        const { data: created, error: createError } = await supabase
            .from('conversation_context')
            .insert({
                project_id: projectId,
                user_id: user.id,
                long_term_context: {},
                short_term_context: {},
                context_versions: [],
                current_version: 1,
            })
            .select()
            .single();

        if (createError) {
            log('error', `Failed to create context: ${createError.message}`);
            return null;
        }

        log('success', `Created new context for project ${projectId}`);
        return {
            id: created.id,
            projectId: created.project_id,
            userId: created.user_id,
            longTermContext: {},
            shortTermContext: {},
            contextVersions: [],
            currentVersion: 1,
            createdAt: created.created_at,
            updatedAt: created.updated_at,
        };
    } catch (error) {
        log('error', `getOrCreateContext failed: ${error}`);
        return null;
    }
}

/**
 * Update long-term context (business info that persists)
 */
export async function updateLongTermContext(
    projectId: string,
    updates: Partial<LongTermContext>,
    changeReason?: string
): Promise<boolean> {
    try {
        const user = await getCurrentUser();
        if (!user) return false;

        const context = await getOrCreateContext(projectId);
        if (!context) return false;

        // Merge with existing
        const newLongTerm: LongTermContext = {
            ...context.longTermContext,
            ...updates,
        };

        // Handle array merges specially
        if (updates.primaryGoals && context.longTermContext.primaryGoals) {
            newLongTerm.primaryGoals = [
                ...new Set([...context.longTermContext.primaryGoals, ...updates.primaryGoals]),
            ];
        }
        if (updates.uniqueSellingPoints && context.longTermContext.uniqueSellingPoints) {
            newLongTerm.uniqueSellingPoints = [
                ...new Set([...context.longTermContext.uniqueSellingPoints, ...updates.uniqueSellingPoints]),
            ];
        }
        if (updates.assets && context.longTermContext.assets) {
            newLongTerm.assets = [...context.longTermContext.assets, ...updates.assets];
        }

        // Save version before updating
        const newVersion: ContextVersion = {
            version: context.currentVersion,
            longTerm: context.longTermContext,
            shortTerm: context.shortTermContext,
            savedAt: new Date().toISOString(),
            changeReason,
        };

        const versions = [...context.contextVersions, newVersion].slice(-10); // Keep last 10

        const { error } = await supabase
            .from('conversation_context')
            .update({
                long_term_context: newLongTerm,
                context_versions: versions,
                current_version: context.currentVersion + 1,
                updated_at: new Date().toISOString(),
            })
            .eq('id', context.id);

        if (error) {
            log('error', `Update failed: ${error.message}`);
            return false;
        }

        log('success', `Updated long-term context (v${context.currentVersion + 1})`);
        return true;
    } catch (error) {
        log('error', `updateLongTermContext failed: ${error}`);
        return false;
    }
}

/**
 * Update short-term context (current task state)
 */
export async function updateShortTermContext(
    projectId: string,
    updates: Partial<ShortTermContext>
): Promise<boolean> {
    try {
        const user = await getCurrentUser();
        if (!user) return false;

        const context = await getOrCreateContext(projectId);
        if (!context) return false;

        // Merge with existing
        const newShortTerm: ShortTermContext = {
            ...context.shortTermContext,
            ...updates,
        };

        // Handle topics array - keep last 10
        if (updates.recentTopics) {
            const existingTopics = context.shortTermContext.recentTopics || [];
            newShortTerm.recentTopics = [...new Set([...updates.recentTopics, ...existingTopics])].slice(0, 10);
        }

        const { error } = await supabase
            .from('conversation_context')
            .update({
                short_term_context: newShortTerm,
                updated_at: new Date().toISOString(),
            })
            .eq('id', context.id);

        if (error) {
            log('error', `Update failed: ${error.message}`);
            return false;
        }

        log('info', 'Updated short-term context');
        return true;
    } catch (error) {
        log('error', `updateShortTermContext failed: ${error}`);
        return false;
    }
}

/**
 * Get all context versions for a project
 */
export async function getContextVersions(
    projectId: string
): Promise<ContextVersion[]> {
    try {
        const user = await getCurrentUser();
        if (!user) return [];

        const { data } = await supabase
            .from('conversation_context')
            .select('context_versions, long_term_context, short_term_context, current_version')
            .eq('project_id', projectId)
            .eq('user_id', user.id)
            .maybeSingle();

        if (!data) return [];

        // Include current version in the list
        const versions = data.context_versions || [];
        versions.push({
            version: data.current_version,
            longTerm: data.long_term_context,
            shortTerm: data.short_term_context,
            savedAt: new Date().toISOString(),
            changeReason: 'Current',
        });

        return versions;
    } catch (error) {
        log('error', `getContextVersions failed: ${error}`);
        return [];
    }
}

/**
 * Reset context to a specific version
 */
export async function resetToVersion(
    projectId: string,
    targetVersion: number
): Promise<boolean> {
    try {
        const user = await getCurrentUser();
        if (!user) return false;

        const versions = await getContextVersions(projectId);
        const target = versions.find(v => v.version === targetVersion);

        if (!target) {
            log('error', `Version ${targetVersion} not found`);
            return false;
        }

        const context = await getOrCreateContext(projectId);
        if (!context) return false;

        // Save current as a version before resetting
        const newVersion: ContextVersion = {
            version: context.currentVersion,
            longTerm: context.longTermContext,
            shortTerm: context.shortTermContext,
            savedAt: new Date().toISOString(),
            changeReason: `Reset to v${targetVersion}`,
        };

        const updatedVersions = [...context.contextVersions.filter(v => v.version !== context.currentVersion), newVersion].slice(-10);

        const { error } = await supabase
            .from('conversation_context')
            .update({
                long_term_context: target.longTerm,
                short_term_context: target.shortTerm,
                context_versions: updatedVersions,
                current_version: context.currentVersion + 1,
                updated_at: new Date().toISOString(),
            })
            .eq('id', context.id);

        if (error) {
            log('error', `Reset failed: ${error.message}`);
            return false;
        }

        log('success', `Reset context to version ${targetVersion}`);
        return true;
    } catch (error) {
        log('error', `resetToVersion failed: ${error}`);
        return false;
    }
}

/**
 * Clear all context for a project (keep version history)
 */
export async function clearContext(projectId: string): Promise<boolean> {
    try {
        const user = await getCurrentUser();
        if (!user) return false;

        const context = await getOrCreateContext(projectId);
        if (!context) return false;

        // Save current as final version
        const finalVersion: ContextVersion = {
            version: context.currentVersion,
            longTerm: context.longTermContext,
            shortTerm: context.shortTermContext,
            savedAt: new Date().toISOString(),
            changeReason: 'Cleared',
        };

        const { error } = await supabase
            .from('conversation_context')
            .update({
                long_term_context: {},
                short_term_context: {},
                context_versions: [...context.contextVersions, finalVersion].slice(-10),
                current_version: context.currentVersion + 1,
                updated_at: new Date().toISOString(),
            })
            .eq('id', context.id);

        if (error) {
            log('error', `Clear failed: ${error.message}`);
            return false;
        }

        log('success', 'Context cleared');
        return true;
    } catch (error) {
        log('error', `clearContext failed: ${error}`);
        return false;
    }
}

/**
 * Update a specific assumption (called when user edits an assumption)
 */
export async function updateAssumption(
    projectId: string,
    key: string,
    value: string
): Promise<boolean> {
    // Map assumption keys to context fields
    const keyMapping: Record<string, { type: 'long' | 'short'; field: keyof LongTermContext | keyof ShortTermContext }> = {
        target_audience: { type: 'long', field: 'targetAudience' },
        brand_tone: { type: 'long', field: 'brandTone' },
        tone: { type: 'long', field: 'brandTone' },
        industry: { type: 'long', field: 'industry' },
        business_name: { type: 'long', field: 'businessName' },
        current_task: { type: 'short', field: 'currentTask' },
        output_style: { type: 'short', field: 'userPreferences' },
    };

    const mapping = keyMapping[key];
    if (!mapping) {
        log('warning', `Unknown assumption key: ${key}, storing in customData`);
        return updateLongTermContext(projectId, {
            customData: { [key]: value },
        }, `Updated assumption: ${key}`);
    }

    if (mapping.type === 'long') {
        return updateLongTermContext(projectId, {
            [mapping.field]: value,
        } as Partial<LongTermContext>, `Updated ${key}`);
    } else {
        return updateShortTermContext(projectId, {
            [mapping.field]: value,
        } as Partial<ShortTermContext>);
    }
}

/**
 * Add an asset to the context (when user generates an image, video, etc.)
 */
export async function addAsset(
    projectId: string,
    asset: {
        name: string;
        type: 'logo' | 'image' | 'video' | 'document' | 'other';
        url?: string;
    }
): Promise<boolean> {
    return updateLongTermContext(projectId, {
        assets: [{
            ...asset,
            createdAt: new Date().toISOString(),
        }],
    }, `Added asset: ${asset.name}`);
}

// ===== EXPORTS =====

export default {
    getOrCreateContext,
    updateLongTermContext,
    updateShortTermContext,
    getContextVersions,
    resetToVersion,
    clearContext,
    updateAssumption,
    addAsset,
};
