/**
 * Business AI Service
 * Connects to Gemini orchestrator for AI responses in Business Panel
 */

import { streamChat, type UserTier } from '../lib/geminiOrchestrator';

// ===== TYPES =====

export interface BusinessAIRequest {
    command: string;
    page: string;
    context?: {
        businessName?: string;
        stage?: string;
        industry?: string;
        targetCustomer?: string;
        mainChallenge?: string;
    };
}

export interface BusinessAIResponse {
    success: boolean;
    message: string;
    action?: 'create_task' | 'create_goal' | 'log_decision' | 'show_info' | 'navigate';
    data?: Record<string, unknown>;
}

// ===== SYSTEM PROMPT =====

const BUSINESS_AI_SYSTEM_PROMPT = `You are KroniQ Business AI - an AI COO assistant for early-stage founders.

Your role is to help founders:
1. Stay focused on what matters (build + talk to users)
2. Make faster decisions
3. Track their runway and business health
4. Avoid common founder mistakes

Keep responses SHORT and ACTIONABLE. Founders are busy.

When responding:
- Be direct and concise (2-3 sentences max unless asked for more)
- Give specific advice, not generic platitudes
- If they ask about focus, give them max 3 priorities
- If they ask about decisions, help them think through tradeoffs
- If they ask about runway, remind them to track cash carefully

Current page context will be provided. Tailor your response to what they're working on.`;

// ===== AI RESPONSE HANDLER =====

export async function getBusinessAIResponse(
    request: BusinessAIRequest,
    userTier: UserTier = 'pro',
    onStream?: (chunk: string) => void
): Promise<BusinessAIResponse> {
    const contextInfo = request.context
        ? `\n\nBusiness Context:
- Business: ${request.context.businessName || 'Unknown'}
- Stage: ${request.context.stage || 'Unknown'}
- Industry: ${request.context.industry || 'Unknown'}
- Target Customer: ${request.context.targetCustomer || 'Unknown'}
- Main Challenge: ${request.context.mainChallenge || 'Unknown'}`
        : '';

    const pageContext = `\n\nCurrent Page: ${request.page}`;
    const userMessage = request.command;

    const messages = [
        {
            role: 'user' as const,
            content: BUSINESS_AI_SYSTEM_PROMPT + contextInfo + pageContext + '\n\nUser: ' + userMessage,
        },
    ];

    try {
        let fullResponse = '';

        // Use streaming from Gemini orchestrator
        await streamChat({
            messages,
            userTier,
            onStream: (chunk) => {
                fullResponse += chunk;
                if (onStream) {
                    onStream(chunk);
                }
            },
        });

        // Parse for any actions
        const action = parseActionFromResponse(fullResponse, request.command);

        return {
            success: true,
            message: fullResponse,
            action: action?.type,
            data: action?.data,
        };
    } catch (error) {
        console.error('Business AI error:', error);
        return {
            success: false,
            message: 'Sorry, I encountered an error. Please try again.',
        };
    }
}

// ===== ACTION PARSER =====

interface ParsedAction {
    type: 'create_task' | 'create_goal' | 'log_decision' | 'show_info' | 'navigate';
    data?: Record<string, unknown>;
}

function parseActionFromResponse(response: string, command: string): ParsedAction | null {
    const lowerCommand = command.toLowerCase();

    // Task creation patterns
    if (
        lowerCommand.includes('create task') ||
        lowerCommand.includes('add task') ||
        lowerCommand.includes('new task')
    ) {
        return { type: 'create_task' };
    }

    // Goal creation patterns
    if (
        lowerCommand.includes('create goal') ||
        lowerCommand.includes('add goal') ||
        lowerCommand.includes('new goal') ||
        lowerCommand.includes('set goal')
    ) {
        return { type: 'create_goal' };
    }

    // Decision logging patterns
    if (
        lowerCommand.includes('log decision') ||
        lowerCommand.includes('we decided') ||
        lowerCommand.includes('decision:')
    ) {
        return { type: 'log_decision' };
    }

    // Default to showing info
    return { type: 'show_info' };
}

// ===== QUICK RESPONSE GENERATORS =====

export function getMorningFocusPrompt(context?: BusinessAIRequest['context']): string {
    const contextStr = context
        ? ` for ${context.businessName} (${context.stage} stage, ${context.industry})`
        : '';
    return `What are the 3 most important things I should focus on today${contextStr}? Be specific and actionable.`;
}

export function getDecisionHelpPrompt(decision: string): string {
    return `I need to decide: ${decision}. What are the key tradeoffs I should consider? Keep it to 3 bullet points.`;
}

export function getRunwayAdvicePrompt(months: number): string {
    if (months <= 3) {
        return 'My runway is critical (3 months or less). What are my immediate options?';
    } else if (months <= 6) {
        return 'My runway is getting low (6 months or less). What should I prioritize?';
    } else {
        return 'I have good runway. How should I think about spending vs saving?';
    }
}

export default getBusinessAIResponse;
