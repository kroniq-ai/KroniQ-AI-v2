/**
 * Agent Service
 * Connects agents to AI for real responses
 * Uses OpenRouter directly for simplicity
 */

import { getAgentSystemPrompt, AGENT_NAMES } from './AgentRouter';
import type { AgentType, AgentResponse } from './types';

// ===== CONFIG =====

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

// Default model for agents (free, good quality)
const AGENT_MODEL = 'google/gemini-2.0-flash-exp:free';

// ===== TYPES =====

export interface AgentRequest {
    message: string;
    agentType: AgentType;
    context?: {
        name?: string;
        stage?: string;
        industry?: string;
        targetCustomer?: string;
        mainChallenge?: string;
    };
    conversationHistory?: Array<{ role: 'user' | 'agent'; content: string }>;
}

// ===== AGENT SERVICE =====

/**
 * Get a response from the specified agent
 */
export async function getAgentResponse(
    request: AgentRequest,
    _userTier: string = 'pro',
    onStream?: (chunk: string) => void
): Promise<AgentResponse> {
    const systemPrompt = getAgentSystemPrompt(request.agentType, {
        businessName: request.context?.name,
        stage: request.context?.stage,
        priorities: []
    });

    // Build messages
    const messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [
        { role: 'system', content: systemPrompt }
    ];

    // Add conversation history
    if (request.conversationHistory && request.conversationHistory.length > 0) {
        const recentHistory = request.conversationHistory.slice(-6);
        for (const msg of recentHistory) {
            messages.push({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            });
        }
    }

    // Add current message
    messages.push({ role: 'user', content: request.message });

    try {
        const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': window.location.origin,
                'X-Title': 'KroniQ Business Agent'
            },
            body: JSON.stringify({
                model: AGENT_MODEL,
                messages,
                stream: true,
                max_tokens: 1000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        // Handle streaming
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        if (reader) {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') continue;

                        try {
                            const parsed = JSON.parse(data);
                            const content = parsed.choices?.[0]?.delta?.content || '';
                            if (content) {
                                fullResponse += content;
                                if (onStream) onStream(content);
                            }
                        } catch {
                            // Skip invalid JSON
                        }
                    }
                }
            }
        }

        return {
            message: fullResponse || getDefaultResponse(request.agentType),
            agentType: request.agentType
        };
    } catch (error) {
        console.error(`[AgentService] Error from ${AGENT_NAMES[request.agentType]}:`, error);
        return {
            message: getDefaultResponse(request.agentType),
            agentType: request.agentType
        };
    }
}

/**
 * Default responses when AI fails
 */
function getDefaultResponse(agentType: AgentType): string {
    const defaults: Record<AgentType, string> = {
        ceo: "I'm here to help you prioritize. What's your biggest challenge right now?",
        execution: "Let's turn this into action. What specific task do you want to create?",
        customer: "Tell me about your last customer conversation. What did you learn?",
        decision: "I'll help you think through this decision. What are your options?",
        finance: "Let's look at your runway. Do you know your current monthly burn rate?",
        marketing: "What's your main growth challenge? I can suggest tactics for your stage.",
        branding: "Let's define your voice. Who's your ideal customer?",
        product: "What are you trying to build? Let's scope it down to the essential MVP."
    };
    return defaults[agentType];
}

export default getAgentResponse;
