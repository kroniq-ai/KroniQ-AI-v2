/**
 * Memory Persistence Service
 * Persists chat context and memory across browser sessions using localStorage
 */

// ===== TYPES =====

export interface ChatMemory {
    conversationId: string;
    messages: Array<{
        role: 'user' | 'assistant' | 'system';
        content: string;
        timestamp: string;
    }>;
    context: ContextMemory;
    lastUpdated: string;
    title?: string;
}

export interface ContextMemory {
    longTerm: Record<string, string>;  // Key facts remembered about user
    shortTerm: Record<string, string>; // Recent context for current session
    version: number;
    lastUpdated: string;
}

export interface UsageTracking {
    userId: string;
    totalTokens: number;
    totalCost: number;
    requests: Array<{
        timestamp: string;
        feature: string;
        tokens?: number;
        cost?: number;
        model?: string;
    }>;
    lastUpdated: string;
}

// ===== STORAGE KEYS =====

const STORAGE_KEYS = {
    CONVERSATIONS: 'kroniq_conversations',
    CONTEXT: 'kroniq_context_memory',
    USAGE: 'kroniq_usage_tracking',
    ACTIVE_CONVERSATION: 'kroniq_active_conversation',
};

// ===== CONVERSATION MEMORY =====

/**
 * Save a conversation to localStorage
 */
export function saveConversation(conversation: ChatMemory): void {
    try {
        const conversations = getAllConversations();
        const existingIndex = conversations.findIndex(c => c.conversationId === conversation.conversationId);

        if (existingIndex >= 0) {
            conversations[existingIndex] = { ...conversation, lastUpdated: new Date().toISOString() };
        } else {
            conversations.unshift({ ...conversation, lastUpdated: new Date().toISOString() });
        }

        // Keep only the last 50 conversations
        const trimmedConversations = conversations.slice(0, 50);
        localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(trimmedConversations));
    } catch (error) {
        // Silent fail - localStorage might be full or disabled
    }
}

/**
 * Get all saved conversations
 */
export function getAllConversations(): ChatMemory[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

/**
 * Get a specific conversation by ID
 */
export function getConversation(conversationId: string): ChatMemory | null {
    try {
        const conversations = getAllConversations();
        return conversations.find(c => c.conversationId === conversationId) || null;
    } catch {
        return null;
    }
}

/**
 * Delete a conversation
 */
export function deleteConversation(conversationId: string): void {
    try {
        const conversations = getAllConversations();
        const filtered = conversations.filter(c => c.conversationId !== conversationId);
        localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(filtered));
    } catch {
        // Silent fail
    }
}

/**
 * Set the active conversation ID
 */
export function setActiveConversation(conversationId: string): void {
    try {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_CONVERSATION, conversationId);
    } catch {
        // Silent fail
    }
}

/**
 * Get the active conversation ID
 */
export function getActiveConversation(): string | null {
    try {
        return localStorage.getItem(STORAGE_KEYS.ACTIVE_CONVERSATION);
    } catch {
        return null;
    }
}

// ===== CONTEXT MEMORY =====

/**
 * Save context memory (long-term facts about user)
 */
export function saveContextMemory(context: ContextMemory): void {
    try {
        localStorage.setItem(STORAGE_KEYS.CONTEXT, JSON.stringify({
            ...context,
            lastUpdated: new Date().toISOString()
        }));
    } catch {
        // Silent fail
    }
}

/**
 * Get context memory
 */
export function getContextMemory(): ContextMemory {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.CONTEXT);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch {
        // Fall through to default
    }

    return {
        longTerm: {},
        shortTerm: {},
        version: 1,
        lastUpdated: new Date().toISOString()
    };
}

/**
 * Update a specific long-term memory item
 */
export function updateLongTermMemory(key: string, value: string): void {
    const context = getContextMemory();
    context.longTerm[key] = value;
    saveContextMemory(context);
}

/**
 * Update short-term memory (clears on new session)
 */
export function updateShortTermMemory(key: string, value: string): void {
    const context = getContextMemory();
    context.shortTerm[key] = value;
    saveContextMemory(context);
}

/**
 * Clear short-term memory (call on new session)
 */
export function clearShortTermMemory(): void {
    const context = getContextMemory();
    context.shortTerm = {};
    saveContextMemory(context);
}

// ===== USAGE TRACKING =====

/**
 * Get usage tracking data
 */
export function getUsageTracking(userId: string): UsageTracking {
    try {
        const key = `${STORAGE_KEYS.USAGE}_${userId}`;
        const stored = localStorage.getItem(key);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch {
        // Fall through to default
    }

    return {
        userId,
        totalTokens: 0,
        totalCost: 0,
        requests: [],
        lastUpdated: new Date().toISOString()
    };
}

/**
 * Record a usage entry with cost data
 */
export function recordUsageWithCost(
    userId: string,
    feature: string,
    tokens?: number,
    cost?: number,
    model?: string
): void {
    try {
        const tracking = getUsageTracking(userId);

        // Add to totals
        tracking.totalTokens += tokens || 0;
        tracking.totalCost += cost || 0;

        // Add to requests log (keep last 100)
        tracking.requests.unshift({
            timestamp: new Date().toISOString(),
            feature,
            tokens,
            cost,
            model
        });
        tracking.requests = tracking.requests.slice(0, 100);

        tracking.lastUpdated = new Date().toISOString();

        const key = `${STORAGE_KEYS.USAGE}_${userId}`;
        localStorage.setItem(key, JSON.stringify(tracking));
    } catch {
        // Silent fail
    }
}

/**
 * Get usage statistics for display
 */
export function getUsageStats(userId: string): {
    totalTokens: number;
    totalCost: number;
    requestsToday: number;
    requestsThisWeek: number;
} {
    const tracking = getUsageTracking(userId);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay()).getTime();

    let requestsToday = 0;
    let requestsThisWeek = 0;

    for (const req of tracking.requests) {
        const reqTime = new Date(req.timestamp).getTime();
        if (reqTime >= todayStart) requestsToday++;
        if (reqTime >= weekStart) requestsThisWeek++;
    }

    return {
        totalTokens: tracking.totalTokens,
        totalCost: tracking.totalCost,
        requestsToday,
        requestsThisWeek
    };
}

/**
 * Export all data (for backup)
 */
export function exportAllData(): string {
    const data = {
        conversations: getAllConversations(),
        context: getContextMemory(),
        exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
}

/**
 * Import data from backup
 */
export function importData(jsonString: string): boolean {
    try {
        const data = JSON.parse(jsonString);
        if (data.conversations) {
            localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(data.conversations));
        }
        if (data.context) {
            localStorage.setItem(STORAGE_KEYS.CONTEXT, JSON.stringify(data.context));
        }
        return true;
    } catch {
        return false;
    }
}

/**
 * Clear all persisted data
 */
export function clearAllData(): void {
    try {
        localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
        localStorage.removeItem(STORAGE_KEYS.CONTEXT);
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_CONVERSATION);
        // Don't clear usage tracking as that should persist
    } catch {
        // Silent fail
    }
}

export default {
    // Conversations
    saveConversation,
    getAllConversations,
    getConversation,
    deleteConversation,
    setActiveConversation,
    getActiveConversation,

    // Context
    saveContextMemory,
    getContextMemory,
    updateLongTermMemory,
    updateShortTermMemory,
    clearShortTermMemory,

    // Usage
    getUsageTracking,
    recordUsageWithCost,
    getUsageStats,

    // Export/Import
    exportAllData,
    importData,
    clearAllData,
};
