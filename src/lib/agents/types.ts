/**
 * Agent Types & Interfaces
 * Shared types for the KroniQ multi-agent system
 */

// ===== AGENT TYPES =====

export type AgentType =
    | 'ceo'          // Strategy brain (default)
    | 'execution'    // Tasks & follow-through
    | 'customer'     // User research
    | 'decision'     // Memory of choices
    | 'finance'      // Runway truth
    | 'marketing'    // Growth specialist
    | 'branding'     // Voice & positioning
    | 'product';     // Dev planning

// ===== BUSINESS CONTEXT (Shared Memory) =====

export interface BusinessContext {
    id: string;
    name: string;
    stage: 'idea' | 'mvp' | 'growth' | 'scale';
    industry: string;
    targetCustomer: string;
    mainChallenge: string;
    businessModel?: string;
    constraints?: {
        time?: string;
        money?: string;
        team?: string;
    };
    currentPriorities?: string[];
}

// ===== AGENT MESSAGE =====

export interface AgentMessage {
    id: string;
    role: 'user' | 'agent';
    content: string;
    agentType?: AgentType;
    timestamp: Date;
    actions?: AgentAction[];
}

// ===== AGENT ACTION =====

export interface AgentAction {
    type: 'create_task' | 'create_goal' | 'log_decision' | 'set_priority' | 'update_context';
    label: string;
    data?: Record<string, unknown>;
}

// ===== AGENT RESPONSE =====

export interface AgentResponse {
    message: string;
    agentType: AgentType;
    actions?: AgentAction[];
    followUp?: string; // Suggested follow-up question
}

// ===== INTENT DETECTION =====

export interface DetectedIntent {
    primaryAgent: AgentType;
    secondaryAgents?: AgentType[];
    confidence: number;
    keywords: string[];
}

export default AgentType;
