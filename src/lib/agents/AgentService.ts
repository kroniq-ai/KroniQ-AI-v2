/**
 * Agent Service - Enhanced with Context-Aware Responses & Intent Execution
 * Integrates: Agent Prompts, Business Context, Intent Detection
 * Uses OpenRouter for AI responses
 */

import { AGENT_PERSONALITIES, getAgentSystemPrompt as getEnhancedPrompt } from './AgentPrompts';
import { detectIntent, executeIntent, formatActionConfirmation, type DetectedIntent, type ExecutionResult } from './IntentExecutor';
import type { AgentType, AgentResponse } from './types';
import type { AgentContext } from './AgentIntelligence';

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
    // New: Full business context for intelligent responses
    businessContext?: AgentContext;
}

export interface EnhancedAgentResponse extends AgentResponse {
    detectedIntent?: DetectedIntent;
    executedAction?: ExecutionResult;
}

// ===== CONTEXT FORMATTER =====

/**
 * Format business context into a string for the AI prompt
 */
function formatContextForPrompt(ctx: AgentContext): string {
    const sections: string[] = [];

    sections.push(`Current Date: ${new Date().toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    })}`);

    sections.push(`Company: ${ctx.companyInfo.name}`);
    sections.push(`Industry: ${ctx.companyInfo.industry}`);
    sections.push(`Stage: ${ctx.companyInfo.stage}`);
    sections.push(`Team Size: ${ctx.companyInfo.teamSize}`);

    // Add metrics based on agent type
    if (Object.keys(ctx.metrics).length > 0) {
        sections.push('\nKEY METRICS:');
        for (const [key, value] of Object.entries(ctx.metrics)) {
            if (value !== undefined && value !== null) {
                const formattedKey = key.replace(/([A-Z])/g, ' $1').trim();
                const formattedValue = typeof value === 'number'
                    ? (key.toLowerCase().includes('rate') || key.toLowerCase().includes('roi')
                        ? `${value.toFixed(1)}%`
                        : key.toLowerCase().includes('mrr') || key.toLowerCase().includes('spend') || key.toLowerCase().includes('burn')
                            ? `$${value.toLocaleString()}`
                            : value.toFixed(1))
                    : value;
                sections.push(`- ${formattedKey}: ${formattedValue}`);
            }
        }
    }

    // Add relevant data summaries
    if (ctx.relevantData) {
        if (ctx.relevantData.tasks && ctx.relevantData.tasks.length > 0) {
            sections.push(`\nOPEN TASKS (${ctx.relevantData.tasks.length}):`);
            ctx.relevantData.tasks.slice(0, 5).forEach((task: any) => {
                sections.push(`- [${task.priority}] ${task.title}${task.dueDate ? ` (due ${task.dueDate})` : ''}`);
            });
        }

        if (ctx.relevantData.atRiskCustomers && ctx.relevantData.atRiskCustomers.length > 0) {
            sections.push(`\nAT-RISK CUSTOMERS (${ctx.relevantData.atRiskCustomers.length}):`);
            ctx.relevantData.atRiskCustomers.slice(0, 3).forEach((customer: any) => {
                sections.push(`- ${customer.name} at ${customer.company} (Health: ${customer.healthScore}, MRR: $${customer.mrr})`);
            });
        }

        if (ctx.relevantData.campaigns && ctx.relevantData.campaigns.length > 0) {
            sections.push(`\nACTIVE CAMPAIGNS (${ctx.relevantData.campaigns.length}):`);
            ctx.relevantData.campaigns.filter((c: any) => c.status === 'active').slice(0, 3).forEach((campaign: any) => {
                const roi = campaign.spent > 0 ? ((campaign.revenue - campaign.spent) / campaign.spent * 100).toFixed(0) : 0;
                sections.push(`- ${campaign.name} (${campaign.channel}): ${roi}% ROI`);
            });
        }

        if (ctx.relevantData.finances) {
            const f = ctx.relevantData.finances;
            sections.push(`\nFINANCIAL SNAPSHOT:`);
            sections.push(`- Cash Balance: $${f.balance?.toLocaleString() || 'N/A'}`);
            sections.push(`- Monthly Burn: $${f.monthlyBurn?.toLocaleString() || 'N/A'}`);
            sections.push(`- Monthly Revenue: $${f.monthlyRevenue?.toLocaleString() || 'N/A'}`);
            sections.push(`- Runway: ${f.runway?.toFixed(1) || 'N/A'} months`);
        }
    }

    // Add recent history if available
    if (ctx.recentHistory && ctx.recentHistory.length > 0) {
        sections.push(`\nRECENT CONVERSATION SUMMARIES:`);
        ctx.recentHistory.slice(0, 3).forEach((conv) => {
            sections.push(`- ${conv.summary}`);
        });
    }

    // Add user preferences
    if (ctx.userPreferences) {
        sections.push(`\nUSER PREFERENCES:`);
        sections.push(`- Verbosity: ${ctx.userPreferences.verbosity}`);
        sections.push(`- Proactive Insights: ${ctx.userPreferences.proactiveInsights ? 'Yes' : 'No'}`);
    }

    return sections.join('\n');
}

// ===== BUILD ENHANCED SYSTEM PROMPT =====

function buildEnhancedSystemPrompt(
    agentType: AgentType,
    businessContext?: AgentContext
): string {
    const personality = AGENT_PERSONALITIES[agentType];

    let prompt = personality.systemPrompt;

    // Add business context
    if (businessContext) {
        prompt += `\n\n========== CURRENT BUSINESS CONTEXT ==========\n`;
        prompt += formatContextForPrompt(businessContext);
    }

    // Add action capabilities instruction
    prompt += `\n\n========== ACTION CAPABILITIES ==========
When the user wants to take an action, help them and confirm it. You can understand actions like:
- Creating tasks: "create a task to...", "remind me to...", "add task..."
- Adding customers: "new customer...", "just signed..."
- Setting goals: "set goal to...", "we want to achieve..."
- Updating finances: "our MRR is...", "we spent..."
- Logging decisions: "we decided to...", "let's go with..."

When you detect such an intent, acknowledge it naturally in your response.
The system will automatically execute the action and add a confirmation.`;

    // Add output style reminder
    prompt += `\n\n========== OUTPUT STYLE ==========
${personality.outputStyle}

Key metrics you should reference: ${personality.keyMetrics.join(', ')}
Decision framework: ${personality.decisionFramework}`;

    return prompt;
}

// ===== AGENT SERVICE =====

/**
 * Get a response from the specified agent with full context awareness
 */
export async function getAgentResponse(
    request: AgentRequest,
    _userTier: string = 'pro',
    onStream?: (chunk: string) => void,
    executionContext?: any // For intent execution
): Promise<EnhancedAgentResponse> {

    // Step 1: Detect intent from user message
    const detectedIntent = detectIntent(request.message);
    let executedAction: ExecutionResult | undefined;

    // Step 2: Execute action if high confidence and context available
    if (detectedIntent.confidence >= 0.7 && executionContext) {
        executedAction = executeIntent(detectedIntent, {
            ...executionContext,
            agentType: request.agentType
        });
    }

    // Step 3: Build enhanced system prompt with context
    const systemPrompt = buildEnhancedSystemPrompt(
        request.agentType,
        request.businessContext
    );

    // Step 4: Build messages for AI
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

    // Add current message with action context if detected
    let userMessage = request.message;
    if (executedAction?.success) {
        userMessage += `\n\n[System Note: Action executed - ${executedAction.message}. Acknowledge this in your response.]`;
    }
    messages.push({ role: 'user', content: userMessage });

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
                max_tokens: 1200,
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

        // Add action confirmation to response if executed
        let finalMessage = fullResponse || getDefaultResponse(request.agentType);
        if (executedAction?.success) {
            finalMessage += formatActionConfirmation(executedAction);
        }

        return {
            message: finalMessage,
            agentType: request.agentType,
            detectedIntent,
            executedAction
        };
    } catch (error) {
        console.error(`[AgentService] Error:`, error);

        let fallbackMessage = getDefaultResponse(request.agentType);
        if (executedAction?.success) {
            fallbackMessage += formatActionConfirmation(executedAction);
        }

        return {
            message: fallbackMessage,
            agentType: request.agentType,
            detectedIntent,
            executedAction
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
