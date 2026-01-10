/**
 * Shared Agent Context
 * Central brain for all agents — shared conversation history and context
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { AgentType, AgentMessage } from '../lib/agents/types';

// ===== TYPES =====

export interface SharedAgentState {
    // Which agents user has active
    activeAgents: AgentType[];

    // Mode: multi-agent (boxes) or single-agent (CEO)
    mode: 'multi' | 'single';

    // Currently open agent (null = dashboard view)
    currentAgent: AgentType | null;

    // Current sidebar section within an agent
    currentSection: string;

    // ALL conversations (shared memory across agents)
    conversationHistory: AgentMessage[];

    // Per-agent metadata
    agentMetadata: Record<AgentType, AgentMetadata>;
}

export interface AgentMetadata {
    messageCount: number;
    lastActive: Date | null;
    tasks: number;
    unread: number;
}

// ===== AGENT DEFINITIONS =====

export interface AgentDefinition {
    type: AgentType;
    name: string;
    shortName: string;
    icon: string;
    description: string;
    color: string;
    commonSections: string[];
    specificSections: AgentSection[];
}

export interface AgentSection {
    id: string;
    label: string;
    icon: string;
    description?: string;
}

// Common sections for ALL agents
export const COMMON_SECTIONS: AgentSection[] = [
    { id: 'today', label: 'Today', icon: 'Sun', description: 'Chat + daily focus' },
    { id: 'tasks', label: 'Tasks', icon: 'CheckSquare', description: 'Agent tasks' },
    { id: 'goals', label: 'Goals', icon: 'Target', description: 'OKRs for this area' },
    { id: 'decisions', label: 'Decisions', icon: 'Scale', description: 'Choices made here' },
    { id: 'assets', label: 'Assets', icon: 'Folder', description: 'Files and docs' },
    { id: 'settings', label: 'Settings', icon: 'Settings', description: 'Agent preferences' },
];

// Agent-specific definitions
export const AGENT_DEFINITIONS: AgentDefinition[] = [
    {
        type: 'ceo',
        name: 'CEO Agent',
        shortName: 'CEO',
        icon: 'Crown',
        description: 'All-in-one strategy brain',
        color: 'emerald',
        commonSections: COMMON_SECTIONS.map(s => s.id),
        specificSections: [
            { id: 'runway', label: 'Runway', icon: 'DollarSign' },
            { id: 'customers', label: 'Customers', icon: 'Users' },
            { id: 'marketing', label: 'Marketing', icon: 'Megaphone' },
            { id: 'branding', label: 'Branding', icon: 'Palette' },
            { id: 'product', label: 'Product', icon: 'Code' },
        ],
    },
    {
        type: 'finance',
        name: 'Finance Agent',
        shortName: 'Finance',
        icon: 'DollarSign',
        description: 'Cash, burn, runway truth',
        color: 'emerald',
        commonSections: COMMON_SECTIONS.map(s => s.id),
        specificSections: [
            { id: 'runway', label: 'Runway', icon: 'TrendingDown' },
            { id: 'income', label: 'Income', icon: 'TrendingUp' },
            { id: 'expenses', label: 'Expenses', icon: 'CreditCard' },
        ],
    },
    {
        type: 'customer',
        name: 'Customer Agent',
        shortName: 'Customer',
        icon: 'Users',
        description: 'User research and insights',
        color: 'emerald',
        commonSections: COMMON_SECTIONS.map(s => s.id),
        specificSections: [
            { id: 'customers', label: 'Customers', icon: 'Users' },
            { id: 'insights', label: 'Insights', icon: 'Lightbulb' },
            { id: 'feedback', label: 'Feedback', icon: 'MessageCircle' },
        ],
    },
    {
        type: 'marketing',
        name: 'Marketing Agent',
        shortName: 'Marketing',
        icon: 'Megaphone',
        description: 'Growth and campaigns',
        color: 'emerald',
        commonSections: COMMON_SECTIONS.map(s => s.id),
        specificSections: [
            { id: 'campaigns', label: 'Campaigns', icon: 'Rocket' },
            { id: 'metrics', label: 'Metrics', icon: 'BarChart2' },
            { id: 'content', label: 'Content', icon: 'FileText' },
        ],
    },
    {
        type: 'branding',
        name: 'Branding Agent',
        shortName: 'Branding',
        icon: 'Palette',
        description: 'Voice and positioning',
        color: 'emerald',
        commonSections: COMMON_SECTIONS.map(s => s.id),
        specificSections: [
            { id: 'brand-kit', label: 'Brand Kit', icon: 'Palette' },
            { id: 'voice', label: 'Voice Guide', icon: 'Volume2' },
            { id: 'brand-assets', label: 'Brand Assets', icon: 'Image' },
        ],
    },
    {
        type: 'product',
        name: 'Product Agent',
        shortName: 'Product',
        icon: 'Code',
        description: 'Dev planning and roadmap',
        color: 'emerald',
        commonSections: COMMON_SECTIONS.map(s => s.id),
        specificSections: [
            { id: 'roadmap', label: 'Roadmap', icon: 'Map' },
            { id: 'bugs', label: 'Bugs', icon: 'Bug' },
            { id: 'specs', label: 'Specs', icon: 'FileCode' },
        ],
    },
    {
        type: 'execution',
        name: 'Execution Agent',
        shortName: 'Execution',
        icon: 'CheckSquare',
        description: 'Tasks and follow-through',
        color: 'emerald',
        commonSections: COMMON_SECTIONS.map(s => s.id),
        specificSections: [
            { id: 'sprint', label: 'Sprint', icon: 'Zap' },
            { id: 'blockers', label: 'Blockers', icon: 'AlertCircle' },
        ],
    },
    {
        type: 'decision',
        name: 'Decision Agent',
        shortName: 'Decisions',
        icon: 'Scale',
        description: 'Memory of choices',
        color: 'emerald',
        commonSections: COMMON_SECTIONS.map(s => s.id),
        specificSections: [
            { id: 'pending', label: 'Pending', icon: 'Clock' },
            { id: 'outcomes', label: 'Outcomes', icon: 'CheckCircle' },
        ],
    },
];

// Get agent definition by type
export function getAgentDefinition(type: AgentType): AgentDefinition | undefined {
    return AGENT_DEFINITIONS.find(a => a.type === type);
}

// Default agents for new users
export const DEFAULT_AGENTS: AgentType[] = ['finance', 'customer', 'marketing', 'branding', 'product'];

// ===== CONTEXT =====

interface SharedAgentContextValue {
    state: SharedAgentState;

    // Agent management
    addAgent: (type: AgentType) => void;
    removeAgent: (type: AgentType) => void;
    setActiveAgents: (agents: AgentType[]) => void;

    // Navigation
    openAgent: (type: AgentType) => void;
    closeAgent: () => void;
    setSection: (section: string) => void;

    // Mode
    setMode: (mode: 'multi' | 'single') => void;

    // Messages
    addMessage: (message: AgentMessage) => void;
    getAgentMessages: (type: AgentType) => AgentMessage[];
}

const SharedAgentContext = createContext<SharedAgentContextValue | undefined>(undefined);

// ===== PROVIDER =====

const initialMetadata = (): Record<AgentType, AgentMetadata> => {
    const metadata: Partial<Record<AgentType, AgentMetadata>> = {};
    const allTypes: AgentType[] = ['ceo', 'execution', 'customer', 'decision', 'finance', 'marketing', 'branding', 'product'];
    allTypes.forEach(type => {
        metadata[type] = { messageCount: 0, lastActive: null, tasks: 0, unread: 0 };
    });
    return metadata as Record<AgentType, AgentMetadata>;
};

export const SharedAgentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<SharedAgentState>({
        activeAgents: DEFAULT_AGENTS,
        mode: 'multi',
        currentAgent: null,
        currentSection: 'today',
        conversationHistory: [],
        agentMetadata: initialMetadata(),
    });

    // Add agent
    const addAgent = useCallback((type: AgentType) => {
        setState(prev => ({
            ...prev,
            activeAgents: prev.activeAgents.includes(type)
                ? prev.activeAgents
                : [...prev.activeAgents, type]
        }));
    }, []);

    // Remove agent
    const removeAgent = useCallback((type: AgentType) => {
        setState(prev => ({
            ...prev,
            activeAgents: prev.activeAgents.filter(a => a !== type)
        }));
    }, []);

    // Set active agents
    const setActiveAgents = useCallback((agents: AgentType[]) => {
        setState(prev => ({ ...prev, activeAgents: agents }));
    }, []);

    // Open agent workspace
    const openAgent = useCallback((type: AgentType) => {
        setState(prev => ({
            ...prev,
            currentAgent: type,
            currentSection: 'today'
        }));
    }, []);

    // Close agent (back to dashboard)
    const closeAgent = useCallback(() => {
        setState(prev => ({
            ...prev,
            currentAgent: null,
            currentSection: 'today'
        }));
    }, []);

    // Set sidebar section
    const setSection = useCallback((section: string) => {
        setState(prev => ({ ...prev, currentSection: section }));
    }, []);

    // Set mode
    const setMode = useCallback((mode: 'multi' | 'single') => {
        setState(prev => ({
            ...prev,
            mode,
            currentAgent: mode === 'single' ? 'ceo' : null
        }));
    }, []);

    // Add message to shared history
    const addMessage = useCallback((message: AgentMessage) => {
        setState(prev => {
            const newHistory = [...prev.conversationHistory, message];
            const newMetadata = { ...prev.agentMetadata };

            if (message.agentType) {
                newMetadata[message.agentType] = {
                    ...newMetadata[message.agentType],
                    messageCount: newMetadata[message.agentType].messageCount + 1,
                    lastActive: new Date()
                };
            }

            return {
                ...prev,
                conversationHistory: newHistory,
                agentMetadata: newMetadata
            };
        });
    }, []);

    // Get messages for a specific agent
    const getAgentMessages = useCallback((type: AgentType): AgentMessage[] => {
        return state.conversationHistory.filter(
            m => m.agentType === type || m.role === 'user'
        );
    }, [state.conversationHistory]);

    const value: SharedAgentContextValue = {
        state,
        addAgent,
        removeAgent,
        setActiveAgents,
        openAgent,
        closeAgent,
        setSection,
        setMode,
        addMessage,
        getAgentMessages,
    };

    return (
        <SharedAgentContext.Provider value={value}>
            {children}
        </SharedAgentContext.Provider>
    );
};

// ===== HOOK =====

export function useSharedAgentContext(): SharedAgentContextValue {
    const context = useContext(SharedAgentContext);
    if (!context) {
        throw new Error('useSharedAgentContext must be used within SharedAgentProvider');
    }
    return context;
}

export default SharedAgentProvider;
