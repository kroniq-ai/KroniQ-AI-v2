/**
 * AgentIntelligence.tsx - Central Agent Intelligence Provider
 * Provides full business data to AI agents for context-aware responses
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { AgentType } from './types';

// ===== DATA TYPES =====

export interface Task {
    id: string;
    title: string;
    description?: string;
    outcome?: string;
    priority: 'high' | 'medium' | 'low';
    status: 'todo' | 'in-progress' | 'done';
    owner: 'you' | 'ai' | 'team';
    ownerName?: string;
    dueDate?: string;
    agentType?: AgentType;
    createdAt: string;
}

export interface Customer {
    id: string;
    name: string;
    company: string;
    email: string;
    mrr: number;
    healthScore: number;
    stage: 'lead' | 'trial' | 'active' | 'at-risk' | 'churned';
    lastContact: string;
    joinDate: string;
    notes?: string;
}

export interface FinancialMetrics {
    balance: number;
    monthlyBurn: number;
    monthlyRevenue: number;
    mrr: number;
    arr: number;
    runway: number; // in months
    expenses: Expense[];
    revenueStreams: RevenueStream[];
}

export interface Expense {
    id: string;
    name: string;
    vendor: string;
    amount: number;
    category: string;
    type: 'recurring' | 'one-time';
    date: string;
}

export interface RevenueStream {
    id: string;
    name: string;
    customer: string;
    amount: number;
    type: 'recurring' | 'one-time';
    status: 'active' | 'churned';
}

export interface Campaign {
    id: string;
    name: string;
    channel: string;
    status: 'active' | 'paused' | 'completed';
    budget: number;
    spent: number;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
}

export interface RoadmapItem {
    id: string;
    title: string;
    description: string;
    status: 'now' | 'next' | 'later' | 'done';
    priority: 'high' | 'medium' | 'low';
    category: 'feature' | 'improvement' | 'bug' | 'infrastructure';
}

export interface Decision {
    id: string;
    title: string;
    context: string;
    outcome: string;
    date: string;
    agentType?: AgentType;
}

export interface Goal {
    id: string;
    title: string;
    target: string;
    current: number;
    targetValue: number;
    deadline: string;
    status: 'on-track' | 'at-risk' | 'behind';
}

// ===== FULL BUSINESS CONTEXT =====

export interface BusinessContext {
    // Company info
    companyName: string;
    industry: string;
    stage: string;
    teamSize: number;

    // Core data
    tasks: Task[];
    customers: Customer[];
    finances: FinancialMetrics;
    campaigns: Campaign[];
    roadmap: RoadmapItem[];
    decisions: Decision[];
    goals: Goal[];

    // Memory
    recentConversations: ConversationMemory[];
    userPreferences: UserPreferences;

    // Computed metrics
    metrics: ComputedMetrics;
}

export interface ConversationMemory {
    id: string;
    agentType: AgentType;
    summary: string;
    timestamp: string;
    keyInsights?: string[];
}

export interface UserPreferences {
    verbosity: 'concise' | 'balanced' | 'detailed';
    proactiveInsights: boolean;
    preferredCommunicationStyle: string;
    corrections: CorrectionMemory[];
}

export interface CorrectionMemory {
    id: string;
    originalOutput: string;
    correction: string;
    agentType: AgentType;
    timestamp: string;
}

export interface ComputedMetrics {
    // Finance
    runway: number;
    burnRate: number;
    mrrGrowth: number;

    // Customer
    totalCustomers: number;
    activeCustomers: number;
    atRiskCount: number;
    avgHealthScore: number;
    churnRate: number;
    totalMRR: number;

    // Tasks
    openTasks: number;
    overdueTasks: number;
    aiOwnedTasks: number;

    // Marketing
    activeCampaigns: number;
    totalAdSpend: number;
    overallROI: number;

    // Product
    nowItems: number;
    totalRoadmapItems: number;
}

// ===== CONTEXT PROVIDER =====

interface BusinessContextValue {
    context: BusinessContext;

    // Data mutators
    addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Task;
    updateTask: (id: string, updates: Partial<Task>) => void;
    addCustomer: (customer: Omit<Customer, 'id'>) => Customer;
    updateCustomer: (id: string, updates: Partial<Customer>) => void;
    updateFinances: (updates: Partial<FinancialMetrics>) => void;
    addDecision: (decision: Omit<Decision, 'id' | 'date'>) => Decision;
    addGoal: (goal: Omit<Goal, 'id'>) => Goal;

    // Memory
    saveConversation: (agentType: AgentType, summary: string, insights?: string[]) => void;
    addCorrection: (agentType: AgentType, original: string, correction: string) => void;
    updatePreferences: (prefs: Partial<UserPreferences>) => void;

    // Context retrieval
    getAgentContext: (agentType: AgentType) => AgentContext;
}

export interface AgentContext {
    agentType: AgentType;
    currentDate: string;
    companyInfo: {
        name: string;
        industry: string;
        stage: string;
        teamSize: number;
    };
    relevantData: Record<string, any>;
    metrics: Record<string, any>;
    recentHistory: ConversationMemory[];
    userPreferences: UserPreferences;
}

const BusinessContextContext = createContext<BusinessContextValue | null>(null);

// ===== DEFAULT DATA =====

const DEFAULT_CONTEXT: BusinessContext = {
    companyName: 'My Startup',
    industry: 'SaaS',
    stage: 'Seed',
    teamSize: 5,

    tasks: [],
    customers: [],
    finances: {
        balance: 150000,
        monthlyBurn: 25000,
        monthlyRevenue: 12000,
        mrr: 12000,
        arr: 144000,
        runway: 6,
        expenses: [],
        revenueStreams: []
    },
    campaigns: [],
    roadmap: [],
    decisions: [],
    goals: [],

    recentConversations: [],
    userPreferences: {
        verbosity: 'balanced',
        proactiveInsights: true,
        preferredCommunicationStyle: 'professional',
        corrections: []
    },

    metrics: {
        runway: 6,
        burnRate: 25000,
        mrrGrowth: 8,
        totalCustomers: 0,
        activeCustomers: 0,
        atRiskCount: 0,
        avgHealthScore: 0,
        churnRate: 0,
        totalMRR: 12000,
        openTasks: 0,
        overdueTasks: 0,
        aiOwnedTasks: 0,
        activeCampaigns: 0,
        totalAdSpend: 0,
        overallROI: 0,
        nowItems: 0,
        totalRoadmapItems: 0
    }
};

// ===== PROVIDER COMPONENT =====

export const AgentIntelligenceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [context, setContext] = useState<BusinessContext>(() => {
        // Try to load from localStorage
        const saved = localStorage.getItem('kroniq_business_context');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return DEFAULT_CONTEXT;
            }
        }
        return DEFAULT_CONTEXT;
    });

    // Save to localStorage whenever context changes
    const saveContext = useCallback((newContext: BusinessContext) => {
        localStorage.setItem('kroniq_business_context', JSON.stringify(newContext));
        setContext(newContext);
    }, []);

    // Recompute metrics
    const recomputeMetrics = useCallback((ctx: BusinessContext): ComputedMetrics => {
        const activeCustomers = ctx.customers.filter(c => c.stage === 'active');
        const atRiskCustomers = ctx.customers.filter(c => c.stage === 'at-risk');
        const openTasks = ctx.tasks.filter(t => t.status !== 'done');
        const overdueTasks = ctx.tasks.filter(t =>
            t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done'
        );
        const activeCampaigns = ctx.campaigns.filter(c => c.status === 'active');

        return {
            runway: ctx.finances.monthlyRevenue > ctx.finances.monthlyBurn
                ? Infinity
                : ctx.finances.balance / (ctx.finances.monthlyBurn - ctx.finances.monthlyRevenue),
            burnRate: ctx.finances.monthlyBurn,
            mrrGrowth: 8, // Would need historical data
            totalCustomers: ctx.customers.length,
            activeCustomers: activeCustomers.length,
            atRiskCount: atRiskCustomers.length,
            avgHealthScore: activeCustomers.length > 0
                ? activeCustomers.reduce((sum, c) => sum + c.healthScore, 0) / activeCustomers.length
                : 0,
            churnRate: ctx.customers.length > 0
                ? (ctx.customers.filter(c => c.stage === 'churned').length / ctx.customers.length) * 100
                : 0,
            totalMRR: activeCustomers.reduce((sum, c) => sum + c.mrr, 0),
            openTasks: openTasks.length,
            overdueTasks: overdueTasks.length,
            aiOwnedTasks: ctx.tasks.filter(t => t.owner === 'ai' && t.status !== 'done').length,
            activeCampaigns: activeCampaigns.length,
            totalAdSpend: activeCampaigns.reduce((sum, c) => sum + c.spent, 0),
            overallROI: activeCampaigns.length > 0
                ? ((activeCampaigns.reduce((sum, c) => sum + c.revenue, 0) -
                    activeCampaigns.reduce((sum, c) => sum + c.spent, 0)) /
                    activeCampaigns.reduce((sum, c) => sum + c.spent, 0)) * 100
                : 0,
            nowItems: ctx.roadmap.filter(r => r.status === 'now').length,
            totalRoadmapItems: ctx.roadmap.filter(r => r.status !== 'done').length
        };
    }, []);

    // Mutators
    const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt'>): Task => {
        const newTask: Task = {
            ...task,
            id: Date.now().toString(),
            createdAt: new Date().toISOString()
        };
        const newContext = { ...context, tasks: [newTask, ...context.tasks] };
        newContext.metrics = recomputeMetrics(newContext);
        saveContext(newContext);
        return newTask;
    }, [context, saveContext, recomputeMetrics]);

    const updateTask = useCallback((id: string, updates: Partial<Task>) => {
        const newContext = {
            ...context,
            tasks: context.tasks.map(t => t.id === id ? { ...t, ...updates } : t)
        };
        newContext.metrics = recomputeMetrics(newContext);
        saveContext(newContext);
    }, [context, saveContext, recomputeMetrics]);

    const addCustomer = useCallback((customer: Omit<Customer, 'id'>): Customer => {
        const newCustomer: Customer = { ...customer, id: Date.now().toString() };
        const newContext = { ...context, customers: [newCustomer, ...context.customers] };
        newContext.metrics = recomputeMetrics(newContext);
        saveContext(newContext);
        return newCustomer;
    }, [context, saveContext, recomputeMetrics]);

    const updateCustomer = useCallback((id: string, updates: Partial<Customer>) => {
        const newContext = {
            ...context,
            customers: context.customers.map(c => c.id === id ? { ...c, ...updates } : c)
        };
        newContext.metrics = recomputeMetrics(newContext);
        saveContext(newContext);
    }, [context, saveContext, recomputeMetrics]);

    const updateFinances = useCallback((updates: Partial<FinancialMetrics>) => {
        const newContext = {
            ...context,
            finances: { ...context.finances, ...updates }
        };
        newContext.metrics = recomputeMetrics(newContext);
        saveContext(newContext);
    }, [context, saveContext, recomputeMetrics]);

    const addDecision = useCallback((decision: Omit<Decision, 'id' | 'date'>): Decision => {
        const newDecision: Decision = {
            ...decision,
            id: Date.now().toString(),
            date: new Date().toISOString()
        };
        const newContext = { ...context, decisions: [newDecision, ...context.decisions] };
        saveContext(newContext);
        return newDecision;
    }, [context, saveContext]);

    const addGoal = useCallback((goal: Omit<Goal, 'id'>): Goal => {
        const newGoal: Goal = { ...goal, id: Date.now().toString() };
        const newContext = { ...context, goals: [newGoal, ...context.goals] };
        saveContext(newContext);
        return newGoal;
    }, [context, saveContext]);

    // Memory functions
    const saveConversation = useCallback((agentType: AgentType, summary: string, insights?: string[]) => {
        const newConversation: ConversationMemory = {
            id: Date.now().toString(),
            agentType,
            summary,
            timestamp: new Date().toISOString(),
            keyInsights: insights
        };
        const newContext = {
            ...context,
            recentConversations: [newConversation, ...context.recentConversations].slice(0, 50)
        };
        saveContext(newContext);
    }, [context, saveContext]);

    const addCorrection = useCallback((agentType: AgentType, original: string, correction: string) => {
        const newCorrection: CorrectionMemory = {
            id: Date.now().toString(),
            originalOutput: original,
            correction,
            agentType,
            timestamp: new Date().toISOString()
        };
        const newContext = {
            ...context,
            userPreferences: {
                ...context.userPreferences,
                corrections: [newCorrection, ...context.userPreferences.corrections].slice(0, 20)
            }
        };
        saveContext(newContext);
    }, [context, saveContext]);

    const updatePreferences = useCallback((prefs: Partial<UserPreferences>) => {
        const newContext = {
            ...context,
            userPreferences: { ...context.userPreferences, ...prefs }
        };
        saveContext(newContext);
    }, [context, saveContext]);

    // Get agent-specific context
    const getAgentContext = useCallback((agentType: AgentType): AgentContext => {
        const base = {
            agentType,
            currentDate: new Date().toISOString(),
            companyInfo: {
                name: context.companyName,
                industry: context.industry,
                stage: context.stage,
                teamSize: context.teamSize
            },
            recentHistory: context.recentConversations
                .filter(c => c.agentType === agentType)
                .slice(0, 5),
            userPreferences: context.userPreferences
        };

        // Agent-specific data injection
        const relevantData: Record<string, any> = {};
        const metrics: Record<string, any> = {};

        switch (agentType) {
            case 'finance':
                relevantData.finances = context.finances;
                relevantData.recentExpenses = context.finances.expenses.slice(0, 10);
                relevantData.revenueStreams = context.finances.revenueStreams.slice(0, 10);
                metrics.runway = context.metrics.runway;
                metrics.burnRate = context.metrics.burnRate;
                metrics.mrr = context.finances.mrr;
                metrics.arr = context.finances.arr;
                metrics.balance = context.finances.balance;
                break;

            case 'customer':
                relevantData.customers = context.customers.slice(0, 20);
                relevantData.atRiskCustomers = context.customers.filter(c => c.stage === 'at-risk');
                metrics.totalCustomers = context.metrics.totalCustomers;
                metrics.activeCustomers = context.metrics.activeCustomers;
                metrics.atRiskCount = context.metrics.atRiskCount;
                metrics.avgHealthScore = context.metrics.avgHealthScore;
                metrics.churnRate = context.metrics.churnRate;
                metrics.totalMRR = context.metrics.totalMRR;
                break;

            case 'marketing':
                relevantData.campaigns = context.campaigns;
                metrics.activeCampaigns = context.metrics.activeCampaigns;
                metrics.totalAdSpend = context.metrics.totalAdSpend;
                metrics.overallROI = context.metrics.overallROI;
                break;

            case 'product':
                relevantData.roadmap = context.roadmap;
                relevantData.nowItems = context.roadmap.filter(r => r.status === 'now');
                metrics.nowItems = context.metrics.nowItems;
                metrics.totalRoadmapItems = context.metrics.totalRoadmapItems;
                break;

            case 'ceo':
                // CEO gets everything
                relevantData.finances = context.finances;
                relevantData.customers = context.customers.slice(0, 10);
                relevantData.campaigns = context.campaigns.slice(0, 5);
                relevantData.roadmap = context.roadmap.filter(r => r.status === 'now');
                relevantData.goals = context.goals;
                relevantData.recentDecisions = context.decisions.slice(0, 5);
                Object.assign(metrics, context.metrics);
                break;

            default:
                relevantData.tasks = context.tasks.filter(t =>
                    t.agentType === agentType || !t.agentType
                ).slice(0, 10);
        }

        // Always include tasks relevant to this agent
        relevantData.tasks = context.tasks.filter(t =>
            t.agentType === agentType || !t.agentType
        ).slice(0, 10);

        return { ...base, relevantData, metrics };
    }, [context]);

    const value: BusinessContextValue = {
        context,
        addTask,
        updateTask,
        addCustomer,
        updateCustomer,
        updateFinances,
        addDecision,
        addGoal,
        saveConversation,
        addCorrection,
        updatePreferences,
        getAgentContext
    };

    return (
        <BusinessContextContext.Provider value={value}>
            {children}
        </BusinessContextContext.Provider>
    );
};

// ===== HOOK =====

export const useAgentIntelligence = (): BusinessContextValue => {
    const context = useContext(BusinessContextContext);
    if (!context) {
        throw new Error('useAgentIntelligence must be used within AgentIntelligenceProvider');
    }
    return context;
};

export default AgentIntelligenceProvider;
