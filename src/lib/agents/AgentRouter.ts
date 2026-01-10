/**
 * Agent Router
 * Detects user intent and activates the right agents
 */

import type { AgentType, DetectedIntent } from './types';

// ===== INTENT PATTERNS =====

const INTENT_PATTERNS: Record<AgentType, string[]> = {
    ceo: [
        'focus', 'priority', 'prioritize', 'what should i', 'what matters',
        'today', 'this week', 'strategy', 'direction', 'decide', 'tradeoff',
        'important', 'urgent', 'help me think', 'pivot', 'stop doing'
    ],
    execution: [
        'task', 'todo', 'create', 'add', 'deadline', 'overdue', 'stuck',
        'blocker', 'ship', 'done', 'complete', 'progress', 'work on',
        'action', 'execute', 'plan', 'schedule'
    ],
    customer: [
        'user', 'customer', 'feedback', 'conversation', 'call', 'meeting',
        'pain point', 'problem', 'promise', 'follow up', 'interview',
        'validate', 'pmf', 'product market fit', 'churn', 'retention'
    ],
    decision: [
        'decision', 'decided', 'choice', 'chose', 'option', 'alternative',
        'why did we', 'remember when', 'last time', 'learned', 'mistake',
        'regret', 'outcome', 'result', 'evaluate'
    ],
    finance: [
        'runway', 'cash', 'burn', 'money', 'revenue', 'cost', 'expense',
        'fundraise', 'investor', 'survive', 'months left', 'budget',
        'pricing', 'profit', 'loss', 'financial'
    ],
    marketing: [
        'marketing', 'growth', 'launch', 'campaign', 'content', 'social',
        'distribution', 'channel', 'acquisition', 'funnel', 'conversion',
        'traffic', 'seo', 'ads', 'viral', 'promote'
    ],
    branding: [
        'brand', 'branding', 'voice', 'tone', 'positioning', 'message',
        'tagline', 'slogan', 'identity', 'logo', 'value proposition',
        'differentiate', 'unique', 'story', 'narrative'
    ],
    product: [
        'build', 'feature', 'product', 'develop', 'code', 'architecture',
        'tech', 'stack', 'mvp', 'scope', 'roadmap', 'engineering',
        'design', 'ux', 'ui', 'prototype', 'ship'
    ]
};

// ===== AGENT NAMES =====

export const AGENT_NAMES: Record<AgentType, string> = {
    ceo: 'Strategy Agent',
    execution: 'Execution Agent',
    customer: 'Customer Agent',
    decision: 'Decision Agent',
    finance: 'Finance Agent',
    marketing: 'Marketing Agent',
    branding: 'Branding Agent',
    product: 'Product Agent'
};

// ===== AGENT DESCRIPTIONS =====

export const AGENT_DESCRIPTIONS: Record<AgentType, string> = {
    ceo: 'Helps you decide what matters most',
    execution: 'Turns your ideas into actionable tasks',
    customer: 'Keeps you close to your users',
    decision: 'Remembers your choices and their outcomes',
    finance: 'Tracks your runway and financial health',
    marketing: 'Helps you grow and reach customers',
    branding: 'Crafts your voice and positioning',
    product: 'Plans what to build and how'
};

// ===== DETECT INTENT =====

export function detectIntent(message: string): DetectedIntent {
    const lowerMessage = message.toLowerCase();
    const scores: Record<AgentType, number> = {
        ceo: 0,
        execution: 0,
        customer: 0,
        decision: 0,
        finance: 0,
        marketing: 0,
        branding: 0,
        product: 0
    };
    const matchedKeywords: string[] = [];

    // Score each agent based on keyword matches
    for (const [agent, patterns] of Object.entries(INTENT_PATTERNS)) {
        for (const pattern of patterns) {
            if (lowerMessage.includes(pattern)) {
                scores[agent as AgentType] += 1;
                matchedKeywords.push(pattern);
            }
        }
    }

    // Find primary agent (highest score)
    let primaryAgent: AgentType = 'ceo'; // Default
    let maxScore = 0;

    for (const [agent, score] of Object.entries(scores)) {
        if (score > maxScore) {
            maxScore = score;
            primaryAgent = agent as AgentType;
        }
    }

    // Find secondary agents (any with score > 0, excluding primary)
    const secondaryAgents: AgentType[] = [];
    for (const [agent, score] of Object.entries(scores)) {
        if (score > 0 && agent !== primaryAgent) {
            secondaryAgents.push(agent as AgentType);
        }
    }

    // Calculate confidence
    const confidence = maxScore > 0 ? Math.min(maxScore / 3, 1) : 0.5;

    return {
        primaryAgent,
        secondaryAgents: secondaryAgents.length > 0 ? secondaryAgents : undefined,
        confidence,
        keywords: matchedKeywords
    };
}

// ===== GET SYSTEM PROMPT FOR AGENT =====

export function getAgentSystemPrompt(
    agentType: AgentType,
    context?: { businessName?: string; stage?: string; priorities?: string[] }
): string {
    const basePrompt = `You are KroniQ's ${AGENT_NAMES[agentType]} — ${AGENT_DESCRIPTIONS[agentType]}.

RULES:
1. Be CONCISE — max 2-3 sentences unless asked for more
2. Be ACTIONABLE — give specific advice, not platitudes
3. Be DIRECT — founders are busy, get to the point
4. Reference the business context when relevant`;

    const contextInfo = context ? `

BUSINESS CONTEXT:
- Company: ${context.businessName || 'Unknown'}
- Stage: ${context.stage || 'Unknown'}
${context.priorities ? `- Priorities: ${context.priorities.join(', ')}` : ''}` : '';

    const agentSpecific: Record<AgentType, string> = {
        ceo: `
        
YOUR ROLE:
- Help decide what matters most
- Give Top 3 priorities when asked
- Identify what to STOP doing
- Make tradeoff decisions clear`,

        execution: `

YOUR ROLE:
- Turn ideas into tasks
- Prioritize ruthlessly (P1/P2/P3)
- Flag stuck or overdue work
- Keep things shipping`,

        customer: `

YOUR ROLE:
- Track customer conversations
- Spot patterns in feedback
- Remember promises made
- Protect product-market fit`,

        decision: `

YOUR ROLE:
- Remember past decisions
- Reference why choices were made
- Warn about repeated patterns
- Help evaluate outcomes`,

        finance: `

YOUR ROLE:
- Calculate runway clearly
- Warn about low cash
- No fancy charts, just truth
- Help with burn rate decisions`,

        marketing: `

YOUR ROLE:
- Suggest growth tactics
- Plan content and campaigns
- Focus on what works for the stage
- Keep it scrappy and effective`,

        branding: `

YOUR ROLE:
- Define voice and tone
- Craft value propositions
- Keep messaging clear
- Build brand consistency`,

        product: `

YOUR ROLE:
- Scope MVPs ruthlessly
- Make build vs buy decisions
- Keep product simple
- Focus on what ships`
    };

    return basePrompt + contextInfo + agentSpecific[agentType];
}

export default detectIntent;
