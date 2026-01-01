/**
 * Pricing Plans Configuration
 * Defines Free, Pro, and Premium tiers for KroniQ AI
 * Updated for Super KroniQ with strict free tier limits
 */

// ===== TYPES =====

export type PlanType = 'free' | 'pro' | 'premium';

export interface PlanLimits {
    // Message limits
    messagesPerDay?: number;        // Free: 5/day
    messagesPerWeek?: number;       // Pro: 500/month equivalent

    // Chat model access
    chatModels: 'free' | 'all';

    // Generation limits
    imageGenerationsPerWeek?: number;    // Free: 1/week
    imageGenerationsPerMonth?: number;   // Paid tiers
    videoGenerationsLifetime?: number;   // Free: 1/lifetime
    videoGenerationsPerMonth?: number;   // Paid tiers
    pptGenerations: number;              // Free: 0 (none)
    ttsGenerationsPerWeek?: number;      // Free: 7/week
    ttsGenerationsPerMonth?: number | 'unlimited';

    // Business Panel access
    businessPanel: 'none' | 'limited' | 'full';
    businessContexts: number;       // 0 = none, 1 = single, -1 = unlimited
    longTermMemory: boolean;
}

export interface PricingPlan {
    id: PlanType;
    name: string;
    price: number;
    period: 'month';
    tagline: string;
    description: string;
    limits: PlanLimits;
    features: string[];
    recommended?: boolean;
}

export interface TopUpOption {
    amount: number;
    credits: number;
    popular?: boolean;
}

// ===== PLAN DEFINITIONS =====

export const PRICING_PLANS: Record<PlanType, PricingPlan> = {
    free: {
        id: 'free',
        name: 'Free',
        price: 0,
        period: 'month',
        tagline: 'Experience value quickly',
        description: 'Perfect for exploring KroniQ AI capabilities',
        limits: {
            messagesPerDay: 5,              // 5 messages/day
            chatModels: 'free',             // Free models only
            imageGenerationsPerWeek: 1,     // 1 image/week
            videoGenerationsLifetime: 1,    // 1 video EVER
            pptGenerations: 0,              // NO PPT for free
            ttsGenerationsPerWeek: 7,       // 7 TTS/week
            businessPanel: 'none',
            businessContexts: 0,
            longTermMemory: false,          // Session-only memory
        },
        features: [
            '5 messages per day',
            'Free AI models',
            '1 image per week',
            '7 voice generations per week',
        ],
    },
    pro: {
        id: 'pro',
        name: 'Pro',
        price: 19,
        period: 'month',
        tagline: 'For solo founders & creators',
        description: 'Ideal for serious creators and solo founders',
        limits: {
            messagesPerWeek: 120,           // ~500/month
            chatModels: 'all',
            imageGenerationsPerMonth: 50,
            videoGenerationsPerMonth: 10,
            pptGenerations: 25,
            ttsGenerationsPerMonth: 'unlimited',
            businessPanel: 'limited',
            businessContexts: 1,
            longTermMemory: true,
        },
        features: [
            '500+ messages per month',
            'Access to ALL AI models',
            '50 images per month',
            '10 videos per month',
            '25 PPT per month',
            'Unlimited TTS',
            'Business Panel',
            'Long-term memory',
        ],
        recommended: true,
    },
    premium: {
        id: 'premium',
        name: 'Premium',
        price: 49,
        period: 'month',
        tagline: 'For serious builders',
        description: 'Best for agencies and teams building actively',
        limits: {
            messagesPerWeek: 500,           // ~2000/month
            chatModels: 'all',
            imageGenerationsPerMonth: 200,
            videoGenerationsPerMonth: 50,
            pptGenerations: 100,
            ttsGenerationsPerMonth: 'unlimited',
            businessPanel: 'full',
            businessContexts: -1, // Unlimited
            longTermMemory: true,
        },
        features: [
            'Unlimited messages',
            'All premium AI models',
            '200 images per month',
            '50 videos per month',
            '100 PPT per month',
            'Unlimited TTS',
            'Full Business Panel',
            'Multiple contexts',
            'Priority support',
        ],
    },
};

// ===== TOP-UP OPTIONS =====

export const TOP_UP_OPTIONS: TopUpOption[] = [
    { amount: 20, credits: 200 },
    { amount: 30, credits: 350 },
    { amount: 50, credits: 650, popular: true },
    { amount: 100, credits: 1400 },
    { amount: 200, credits: 3000 },
    { amount: 500, credits: 8000 },
    { amount: 1000, credits: 18000 },
];

// ===== HELPER FUNCTIONS =====

/**
 * Get plan by type
 */
export function getPlan(planType: PlanType): PricingPlan {
    return PRICING_PLANS[planType];
}

/**
 * Check if a plan has access to Business Panel
 */
export function hasBusinessPanelAccess(planType: PlanType): boolean {
    return PRICING_PLANS[planType].limits.businessPanel !== 'none';
}

/**
 * Check if a plan has full Business Panel access
 */
export function hasFullBusinessPanel(planType: PlanType): boolean {
    return PRICING_PLANS[planType].limits.businessPanel === 'full';
}

/**
 * Get message limit based on plan
 */
export function getMessageLimit(planType: PlanType): { limit: number; period: 'day' | 'week' } {
    const plan = PRICING_PLANS[planType];
    if (plan.limits.messagesPerDay) {
        return { limit: plan.limits.messagesPerDay, period: 'day' };
    }
    if (plan.limits.messagesPerWeek) {
        return { limit: plan.limits.messagesPerWeek, period: 'week' };
    }
    return { limit: 0, period: 'day' };
}

/**
 * Check if user can access all models
 */
export function canAccessAllModels(planType: PlanType): boolean {
    return PRICING_PLANS[planType].limits.chatModels === 'all';
}

/**
 * Get the number of business contexts allowed
 * Returns -1 for unlimited
 */
export function getBusinessContextLimit(planType: PlanType): number {
    return PRICING_PLANS[planType].limits.businessContexts;
}

/**
 * Check if long-term memory is available
 */
export function hasLongTermMemory(planType: PlanType): boolean {
    return PRICING_PLANS[planType].limits.longTermMemory;
}

/**
 * Get generation limit for a specific type
 */
export function getGenerationLimit(planType: PlanType, type: 'image' | 'video' | 'ppt' | 'tts'): number | 'unlimited' {
    const plan = PRICING_PLANS[planType];
    switch (type) {
        case 'image':
            return plan.limits.imageGenerations;
        case 'video':
            return plan.limits.videoGenerations;
        case 'ppt':
            return plan.limits.pptGenerations;
        case 'tts':
            return plan.limits.ttsGenerations;
        default:
            return 0;
    }
}

/**
 * Compare two plans and return upgrade benefits
 */
export function getUpgradeBenefits(fromPlan: PlanType, toPlan: PlanType): string[] {
    const from = PRICING_PLANS[fromPlan];
    const to = PRICING_PLANS[toPlan];
    const benefits: string[] = [];

    // Message increase
    const fromMessages = from.limits.messagesPerDay || from.limits.messagesPerWeek || 0;
    const toMessages = to.limits.messagesPerDay || to.limits.messagesPerWeek || 0;
    if (toMessages > fromMessages) {
        const period = to.limits.messagesPerWeek ? 'week' : 'day';
        benefits.push(`${toMessages} messages per ${period}`);
    }

    // Model access
    if (from.limits.chatModels === 'free' && to.limits.chatModels === 'all') {
        benefits.push('Access to ALL AI models');
    }

    // Business Panel
    if (from.limits.businessPanel === 'none' && to.limits.businessPanel !== 'none') {
        benefits.push('Business Panel access');
    }
    if (from.limits.businessPanel === 'limited' && to.limits.businessPanel === 'full') {
        benefits.push('Full Business Panel features');
    }

    // Long-term memory
    if (!from.limits.longTermMemory && to.limits.longTermMemory) {
        benefits.push('Long-term memory');
    }

    return benefits;
}
