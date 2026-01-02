/**
 * Global Memory Service
 * Stores user-level facts/preferences that persist across all chats
 * Uses DeepSeek to automatically extract personal info from conversations
 */

import { supabase } from './supabase';

// ===== TYPES =====

export interface UserMemory {
    name?: string;
    age?: number;
    location?: string;
    occupation?: string;
    interests?: string[];
    preferences?: Record<string, string>;
    facts?: string[]; // General facts like "I have a dog named Max"
    updatedAt?: string;
}

// ===== CORE FUNCTIONS =====

/**
 * Get user's global memory
 */
export async function getUserMemory(userId: string): Promise<UserMemory> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('memory_data')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching user memory:', error);
            return {};
        }

        return (data?.memory_data as UserMemory) || {};
    } catch (error) {
        console.error('Error in getUserMemory:', error);
        return {};
    }
}

/**
 * Update user's global memory
 */
export async function updateUserMemory(
    userId: string,
    updates: Partial<UserMemory>
): Promise<boolean> {
    try {
        // Get existing memory
        const existingMemory = await getUserMemory(userId);

        // Merge updates
        const newMemory: UserMemory = {
            ...existingMemory,
            ...updates,
            // Merge arrays instead of replacing
            interests: [...(existingMemory.interests || []), ...(updates.interests || [])].filter(
                (v, i, a) => a.indexOf(v) === i // Remove duplicates
            ),
            facts: [...(existingMemory.facts || []), ...(updates.facts || [])].filter(
                (v, i, a) => a.indexOf(v) === i
            ),
            preferences: { ...existingMemory.preferences, ...updates.preferences },
            updatedAt: new Date().toISOString(),
        };

        const { error } = await supabase
            .from('profiles')
            .update({ memory_data: newMemory })
            .eq('id', userId);

        if (error) {
            console.error('Error updating user memory:', error);
            return false;
        }

        console.log('✅ [GlobalMemory] Updated user memory:', Object.keys(updates));
        return true;
    } catch (error) {
        console.error('Error in updateUserMemory:', error);
        return false;
    }
}

/**
 * Extract personal info from a message using AI (DeepSeek)
 * Returns structured data to store in memory
 */
export async function extractPersonalInfo(
    userMessage: string
): Promise<Partial<UserMemory> | null> {
    // Quick check - if message is too short or doesn't seem personal, skip
    if (userMessage.length < 10) return null;

    const personalIndicators = [
        'my name', "i'm", 'i am', 'years old', 'i live', 'i work', 'i like', 'i love',
        'my age', 'call me', 'i prefer', 'my favorite', 'i have', 'my job'
    ];

    const hasPersonalInfo = personalIndicators.some(indicator =>
        userMessage.toLowerCase().includes(indicator)
    );

    if (!hasPersonalInfo) return null;

    try {
        // Use DeepSeek to extract structured info
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://kroniq.ai',
                'X-Title': 'KroniQ AI'
            },
            body: JSON.stringify({
                model: 'deepseek/deepseek-chat',
                messages: [
                    {
                        role: 'system',
                        content: `You are an info extractor. Extract any personal information from the user message.
Return ONLY valid JSON with these optional fields:
{
  "name": "string or null",
  "age": "number or null",
  "location": "string or null",
  "occupation": "string or null",
  "interests": ["array of strings"] or null,
  "facts": ["array of notable facts"] or null
}
If no personal info is found, return {}. No explanation, just JSON.`
                    },
                    {
                        role: 'user',
                        content: userMessage
                    }
                ],
                temperature: 0.1,
                max_tokens: 200
            })
        });

        if (!response.ok) {
            console.error('DeepSeek extraction failed:', response.status);
            return null;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '{}';

        // Parse JSON response
        const extracted = JSON.parse(content.trim());

        // Remove null values
        Object.keys(extracted).forEach(key => {
            if (extracted[key] === null || extracted[key] === undefined) {
                delete extracted[key];
            }
        });

        if (Object.keys(extracted).length > 0) {
            console.log('🧠 [GlobalMemory] Extracted personal info:', extracted);
            return extracted;
        }

        return null;
    } catch (error) {
        console.error('Error extracting personal info:', error);
        return null;
    }
}

/**
 * Build system prompt addition from user memory
 */
export function buildMemoryContext(memory: UserMemory): string {
    if (!memory || Object.keys(memory).length === 0) return '';

    const parts: string[] = [];

    if (memory.name) parts.push(`User's name is ${memory.name}`);
    if (memory.age) parts.push(`User is ${memory.age} years old`);
    if (memory.location) parts.push(`User lives in ${memory.location}`);
    if (memory.occupation) parts.push(`User works as ${memory.occupation}`);
    if (memory.interests?.length) parts.push(`User's interests: ${memory.interests.join(', ')}`);
    if (memory.facts?.length) parts.push(`Known facts: ${memory.facts.join('; ')}`);

    if (parts.length === 0) return '';

    return `\n\n**ABOUT THIS USER (remember this across all chats):**\n${parts.join('\n')}`;
}

/**
 * Process a message and extract/store any personal info
 */
export async function processMessageForMemory(
    userId: string,
    userMessage: string
): Promise<void> {
    // Don't block on this - run asynchronously
    extractPersonalInfo(userMessage).then(async (extracted) => {
        if (extracted && Object.keys(extracted).length > 0) {
            await updateUserMemory(userId, extracted);
        }
    }).catch(console.error);
}

/**
 * Get cross-project context for the orchestrator (5-10% weight)
 * Fetches summaries from user's other projects to provide light context
 */
export async function getCrossProjectContext(
    userId: string,
    currentProjectId: string
): Promise<string> {
    try {
        // Fetch recent chats from OTHER projects (not current)
        const { data: otherChats, error } = await supabase
            .from('chats')
            .select('id, name, messages, updated_at')
            .eq('user_id', userId)
            .neq('id', currentProjectId)
            .order('updated_at', { ascending: false })
            .limit(3);

        if (error || !otherChats || otherChats.length === 0) {
            return '';
        }

        // Extract key context from each project
        const summaries = otherChats.map(chat => {
            const messages = chat.messages || [];

            // Find recent media generated
            const recentMedia = messages
                .filter((m: any) => m.mediaUrl)
                .slice(-2)
                .map((m: any) => `[${m.mediaType?.toUpperCase() || 'MEDIA'}] ${(m.content || '').substring(0, 40)}...`);

            // Get last topic discussed
            const lastUserMessage = messages
                .filter((m: any) => m.role === 'user')
                .slice(-1)[0];
            const lastTopic = lastUserMessage?.content?.substring(0, 50) || 'Unknown topic';

            return `• "${chat.name || 'Untitled'}": ${recentMedia.length > 0 ? recentMedia.join(', ') : `Discussion about "${lastTopic}..."`}`;
        });

        if (summaries.length === 0) return '';

        return `## Cross-Project Context (5-10% weight)\n${summaries.join('\n')}`;
    } catch (error) {
        console.error('Error fetching cross-project context:', error);
        return '';
    }
}

export default {
    getUserMemory,
    updateUserMemory,
    extractPersonalInfo,
    buildMemoryContext,
    processMessageForMemory,
    getCrossProjectContext,
};
