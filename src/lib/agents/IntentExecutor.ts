/**
 * IntentExecutor.ts - Natural Language Intent Detection & Execution
 * Detects user intent from chat messages and executes actions automatically
 */

import type { AgentType } from './types';

// ===== INTENT TYPES =====

export type IntentType =
    | 'CREATE_TASK'
    | 'CREATE_GOAL'
    | 'ADD_CUSTOMER'
    | 'UPDATE_FINANCES'
    | 'LOG_DECISION'
    | 'UPDATE_TASK'
    | 'SCHEDULE_MEETING'
    | 'CREATE_CAMPAIGN'
    | 'ADD_EXPENSE'
    | 'UNKNOWN';

export interface DetectedIntent {
    type: IntentType;
    confidence: number;
    parameters: Record<string, any>;
    originalText: string;
}

export interface ExecutionResult {
    success: boolean;
    intent: IntentType;
    message: string;
    createdItem?: any;
    error?: string;
}

// ===== INTENT PATTERNS =====

interface IntentPattern {
    type: IntentType;
    patterns: RegExp[];
    keywords: string[];
    extractors: {
        [key: string]: (text: string) => any;
    };
}

const INTENT_PATTERNS: IntentPattern[] = [
    {
        type: 'CREATE_TASK',
        patterns: [
            /(?:create|add|make)\s+(?:a\s+)?task\s+(?:to\s+)?(.+)/i,
            /remind\s+me\s+to\s+(.+)/i,
            /i\s+need\s+to\s+(.+)/i,
            /(?:can\s+you\s+)?(?:add|create)\s+(?:a\s+)?(?:task|reminder|todo)\s*[:\s]+(.+)/i,
            /task:\s*(.+)/i,
            /(?:let's|i'll|we\s+need\s+to)\s+(.+?)(?:\s+by\s+|\s+before\s+|$)/i,
        ],
        keywords: ['task', 'remind', 'todo', 'add task', 'create task', 'need to'],
        extractors: {
            title: extractTitle,
            priority: extractPriority,
            dueDate: extractDueDate,
            owner: extractOwner,
        }
    },
    {
        type: 'CREATE_GOAL',
        patterns: [
            /(?:set|create)\s+(?:a\s+)?goal\s+(?:to\s+)?(.+)/i,
            /(?:our|my)\s+goal\s+is\s+(?:to\s+)?(.+)/i,
            /(?:we\s+)?want\s+to\s+(?:achieve|reach|hit)\s+(.+)/i,
            /target:\s*(.+)/i,
        ],
        keywords: ['goal', 'target', 'achieve', 'reach', 'hit'],
        extractors: {
            title: extractTitle,
            target: extractTarget,
            deadline: extractDueDate,
        }
    },
    {
        type: 'ADD_CUSTOMER',
        patterns: [
            /(?:new|add)\s+customer[:\s]+(.+)/i,
            /(?:just\s+)?signed\s+(.+)/i,
            /onboard(?:ed|ing)?\s+(.+)/i,
            /(?:we\s+)?got\s+(?:a\s+)?new\s+(?:customer|client|user)[:\s]+(.+)/i,
        ],
        keywords: ['customer', 'client', 'signed', 'onboard', 'new user'],
        extractors: {
            name: extractCustomerName,
            company: extractCompany,
            email: extractEmail,
            mrr: extractMoney,
        }
    },
    {
        type: 'UPDATE_FINANCES',
        patterns: [
            /(?:our\s+)?(?:mrr|revenue|income)\s+(?:is\s+)?(?:now\s+)?\$?([\d,]+)/i,
            /(?:we\s+)?(?:spent|expense(?:d)?)\s+\$?([\d,]+)/i,
            /(?:update|set)\s+(?:our\s+)?(?:balance|runway|burn)\s+(?:to\s+)?\$?([\d,]+)/i,
            /(?:raised|got\s+)?(?:funding|investment)\s+(?:of\s+)?\$?([\d,]+)/i,
        ],
        keywords: ['mrr', 'revenue', 'spent', 'expense', 'balance', 'burn', 'funding'],
        extractors: {
            amount: extractMoney,
            type: extractFinanceType,
            category: extractCategory,
        }
    },
    {
        type: 'LOG_DECISION',
        patterns: [
            /(?:we\s+)?decided\s+(?:to\s+)?(.+)/i,
            /(?:let's|we'll)\s+go\s+with\s+(.+)/i,
            /decision[:\s]+(.+)/i,
            /(?:choosing|chose)\s+(?:to\s+)?(.+)/i,
        ],
        keywords: ['decided', 'decision', 'go with', 'chose', 'choosing'],
        extractors: {
            title: extractTitle,
            context: extractContext,
            outcome: extractOutcome,
        }
    },
    {
        type: 'ADD_EXPENSE',
        patterns: [
            /(?:add|log)\s+(?:an?\s+)?expense[:\s]+(.+)/i,
            /(?:we\s+)?spent\s+\$?([\d,]+)\s+on\s+(.+)/i,
            /(?:new\s+)?expense:\s*(.+)/i,
            /(?:paid|paying)\s+\$?([\d,]+)\s+(?:for|to)\s+(.+)/i,
        ],
        keywords: ['expense', 'spent', 'paid', 'paying', 'cost'],
        extractors: {
            name: extractTitle,
            amount: extractMoney,
            category: extractCategory,
            vendor: extractVendor,
        }
    },
    {
        type: 'CREATE_CAMPAIGN',
        patterns: [
            /(?:launch|create|start)\s+(?:a\s+)?campaign\s+(.+)/i,
            /(?:run|start)\s+ads\s+(?:for|on)\s+(.+)/i,
            /campaign:\s*(.+)/i,
        ],
        keywords: ['campaign', 'ads', 'launch', 'marketing'],
        extractors: {
            name: extractTitle,
            channel: extractChannel,
            budget: extractMoney,
        }
    },
];

// ===== EXTRACTION FUNCTIONS =====

function extractTitle(text: string): string {
    // Remove common prefixes
    let title = text
        .replace(/^(to|that|about|for|the)\s+/i, '')
        .replace(/\s+(by|before|due|from|with)\s+.+$/i, '')
        .trim();

    // Limit length
    if (title.length > 100) {
        title = title.substring(0, 97) + '...';
    }

    return title;
}

function extractPriority(text: string): 'high' | 'medium' | 'low' {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('urgent') || lowerText.includes('high priority') ||
        lowerText.includes('asap') || lowerText.includes('critical')) {
        return 'high';
    }
    if (lowerText.includes('low priority') || lowerText.includes('when you can') ||
        lowerText.includes('not urgent')) {
        return 'low';
    }
    return 'medium';
}

function extractDueDate(text: string): string | undefined {
    const lowerText = text.toLowerCase();
    const today = new Date();

    // Specific patterns
    if (lowerText.includes('today')) {
        return today.toISOString().split('T')[0];
    }
    if (lowerText.includes('tomorrow')) {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    }

    // Day of week
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (let i = 0; i < days.length; i++) {
        if (lowerText.includes(days[i])) {
            const target = new Date(today);
            const currentDay = today.getDay();
            let daysUntil = i - currentDay;
            if (daysUntil <= 0) daysUntil += 7;
            target.setDate(target.getDate() + daysUntil);
            return target.toISOString().split('T')[0];
        }
    }

    // "in X days"
    const inDaysMatch = lowerText.match(/in\s+(\d+)\s+day/);
    if (inDaysMatch) {
        const target = new Date(today);
        target.setDate(target.getDate() + parseInt(inDaysMatch[1]));
        return target.toISOString().split('T')[0];
    }

    // "next week"
    if (lowerText.includes('next week')) {
        const target = new Date(today);
        target.setDate(target.getDate() + 7);
        return target.toISOString().split('T')[0];
    }

    // "end of month"
    if (lowerText.includes('end of month') || lowerText.includes('month end')) {
        const target = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return target.toISOString().split('T')[0];
    }

    return undefined;
}

function extractOwner(text: string): 'you' | 'ai' | 'team' {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('kroniq') || lowerText.includes('ai') || lowerText.includes('you do')) {
        return 'ai';
    }
    if (lowerText.includes('team') || lowerText.includes('someone') || lowerText.includes('delegate')) {
        return 'team';
    }
    return 'you';
}

function extractTarget(text: string): string {
    const moneyMatch = text.match(/\$?([\d,]+)k?/);
    if (moneyMatch) {
        return moneyMatch[0];
    }
    return text;
}

function extractCustomerName(text: string): string {
    // Try to extract name before @ or company
    const beforeAt = text.split('@')[0];
    const nameMatch = beforeAt.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
    return nameMatch ? nameMatch[1] : 'New Customer';
}

function extractCompany(text: string): string {
    // Look for common patterns
    const patterns = [
        /(?:at|from|with)\s+([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)*)/,
        /([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)*(?:\s+Inc\.?|\s+LLC|\s+Ltd\.?)?)/,
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) return match[1];
    }

    return 'Unknown Company';
}

function extractEmail(text: string): string | undefined {
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    return emailMatch ? emailMatch[0] : undefined;
}

function extractMoney(text: string): number {
    // Extract $ amounts
    const match = text.match(/\$?([\d,]+\.?\d*)k?/i);
    if (match) {
        let amount = parseFloat(match[1].replace(/,/g, ''));
        if (match[0].toLowerCase().includes('k')) {
            amount *= 1000;
        }
        return amount;
    }
    return 0;
}

function extractFinanceType(text: string): 'income' | 'expense' | 'balance' {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('spent') || lowerText.includes('expense') || lowerText.includes('paid')) {
        return 'expense';
    }
    if (lowerText.includes('revenue') || lowerText.includes('mrr') || lowerText.includes('income')) {
        return 'income';
    }
    return 'balance';
}

function extractCategory(text: string): string {
    const lowerText = text.toLowerCase();
    const categories = ['payroll', 'software', 'marketing', 'office', 'hosting', 'travel', 'legal'];
    for (const cat of categories) {
        if (lowerText.includes(cat)) return cat;
    }
    return 'other';
}

function extractVendor(text: string): string {
    // Try to extract vendor/company name
    const patterns = [
        /(?:to|from|for)\s+([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)*)/,
    ];
    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) return match[1];
    }
    return 'Unknown Vendor';
}

function extractChannel(text: string): string {
    const lowerText = text.toLowerCase();
    const channels = ['google', 'facebook', 'linkedin', 'twitter', 'instagram', 'email', 'content'];
    for (const channel of channels) {
        if (lowerText.includes(channel)) return channel;
    }
    return 'google';
}

function extractContext(text: string): string {
    return text.substring(0, 200);
}

function extractOutcome(text: string): string {
    return text.substring(0, 100);
}

// ===== MAIN DETECTION FUNCTION =====

export function detectIntent(message: string): DetectedIntent {
    const lowerMessage = message.toLowerCase();
    let bestMatch: DetectedIntent = {
        type: 'UNKNOWN',
        confidence: 0,
        parameters: {},
        originalText: message
    };

    for (const intentPattern of INTENT_PATTERNS) {
        // Check pattern matches
        for (const pattern of intentPattern.patterns) {
            const match = message.match(pattern);
            if (match) {
                const confidence = 0.9; // High confidence for regex match
                if (confidence > bestMatch.confidence) {
                    const parameters: Record<string, any> = {};

                    // Extract parameters using extractors
                    for (const [key, extractor] of Object.entries(intentPattern.extractors)) {
                        const extracted = extractor(message);
                        if (extracted !== undefined && extracted !== '') {
                            parameters[key] = extracted;
                        }
                    }

                    bestMatch = {
                        type: intentPattern.type,
                        confidence,
                        parameters,
                        originalText: message
                    };
                }
                break;
            }
        }

        // Check keyword matches (lower confidence)
        if (bestMatch.confidence < 0.7) {
            const keywordMatches = intentPattern.keywords.filter(kw =>
                lowerMessage.includes(kw)
            ).length;

            if (keywordMatches > 0) {
                const confidence = Math.min(0.5 + (keywordMatches * 0.15), 0.75);
                if (confidence > bestMatch.confidence) {
                    const parameters: Record<string, any> = {};
                    for (const [key, extractor] of Object.entries(intentPattern.extractors)) {
                        const extracted = extractor(message);
                        if (extracted !== undefined && extracted !== '') {
                            parameters[key] = extracted;
                        }
                    }

                    bestMatch = {
                        type: intentPattern.type,
                        confidence,
                        parameters,
                        originalText: message
                    };
                }
            }
        }
    }

    return bestMatch;
}

// ===== EXECUTION FUNCTION =====

export interface ExecutionContext {
    addTask: (task: any) => any;
    addCustomer: (customer: any) => any;
    updateFinances: (updates: any) => void;
    addDecision: (decision: any) => any;
    addGoal: (goal: any) => any;
    agentType: AgentType;
}

export function executeIntent(
    intent: DetectedIntent,
    context: ExecutionContext
): ExecutionResult {
    if (intent.confidence < 0.7) {
        return {
            success: false,
            intent: intent.type,
            message: 'Confidence too low to execute automatically',
        };
    }

    try {
        switch (intent.type) {
            case 'CREATE_TASK': {
                const task = context.addTask({
                    title: intent.parameters.title || 'New Task',
                    priority: intent.parameters.priority || 'medium',
                    status: 'todo',
                    owner: intent.parameters.owner || 'you',
                    dueDate: intent.parameters.dueDate,
                    agentType: context.agentType,
                });
                return {
                    success: true,
                    intent: 'CREATE_TASK',
                    message: `✅ Created task: "${task.title}"${task.dueDate ? ` (due ${task.dueDate})` : ''}`,
                    createdItem: task,
                };
            }

            case 'CREATE_GOAL': {
                const goal = context.addGoal({
                    title: intent.parameters.title || 'New Goal',
                    target: intent.parameters.target || '',
                    current: 0,
                    targetValue: intent.parameters.targetValue || 100,
                    deadline: intent.parameters.deadline || '',
                    status: 'on-track',
                });
                return {
                    success: true,
                    intent: 'CREATE_GOAL',
                    message: `🎯 Set goal: "${goal.title}"`,
                    createdItem: goal,
                };
            }

            case 'ADD_CUSTOMER': {
                const customer = context.addCustomer({
                    name: intent.parameters.name || 'New Customer',
                    company: intent.parameters.company || 'Unknown',
                    email: intent.parameters.email || '',
                    mrr: intent.parameters.mrr || 0,
                    healthScore: 80,
                    stage: 'active',
                    lastContact: 'Today',
                    joinDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                });
                return {
                    success: true,
                    intent: 'ADD_CUSTOMER',
                    message: `👤 Added customer: ${customer.name} at ${customer.company}${customer.mrr > 0 ? ` ($${customer.mrr}/mo)` : ''}`,
                    createdItem: customer,
                };
            }

            case 'UPDATE_FINANCES': {
                const updates: any = {};
                const type = intent.parameters.type || 'balance';
                const amount = intent.parameters.amount || 0;

                if (type === 'expense') {
                    updates.monthlyBurn = amount;
                } else if (type === 'income') {
                    updates.monthlyRevenue = amount;
                    updates.mrr = amount;
                } else {
                    updates.balance = amount;
                }

                context.updateFinances(updates);
                return {
                    success: true,
                    intent: 'UPDATE_FINANCES',
                    message: `💰 Updated ${type}: $${amount.toLocaleString()}`,
                };
            }

            case 'LOG_DECISION': {
                const decision = context.addDecision({
                    title: intent.parameters.title || 'New Decision',
                    context: intent.parameters.context || '',
                    outcome: intent.parameters.outcome || '',
                    agentType: context.agentType,
                });
                return {
                    success: true,
                    intent: 'LOG_DECISION',
                    message: `📝 Logged decision: "${decision.title}"`,
                    createdItem: decision,
                };
            }

            default:
                return {
                    success: false,
                    intent: intent.type,
                    message: 'Intent type not yet supported for automatic execution',
                };
        }
    } catch (error) {
        return {
            success: false,
            intent: intent.type,
            message: 'Failed to execute action',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// ===== FORMAT ACTION FOR AI RESPONSE =====

export function formatActionConfirmation(result: ExecutionResult): string {
    if (result.success) {
        return `\n\n---\n**Action Executed:** ${result.message}`;
    }
    return '';
}

export default { detectIntent, executeIntent, formatActionConfirmation };
