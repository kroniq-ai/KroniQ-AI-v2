/**
 * Overview Page - Command Center
 * The default landing page for the Business Operating System
 * Shows situational awareness at a glance
 */

import React from 'react';
import {
    Target,
    TrendingUp,
    Users,
    DollarSign,
    Clock,
    Sparkles,
    ArrowUpRight,
    ArrowDownRight,
    ChevronRight,
    Zap
} from 'lucide-react';

// ===== TYPES =====

interface OverviewPageProps {
    isDark: boolean;
    contextName?: string;
}

// ===== METRIC CARD =====

interface MetricCardProps {
    isDark: boolean;
    icon: React.ElementType;
    label: string;
    value: string;
    change?: number;
    trend?: 'up' | 'down' | 'neutral';
}

const MetricCard: React.FC<MetricCardProps> = ({
    isDark,
    icon: Icon,
    label,
    value,
    change,
    trend = 'neutral',
}) => (
    <div className={`
        p-4 rounded-xl border transition-all duration-200
        hover:translate-y-[-1px]
        ${isDark
            ? 'bg-white/[0.03] border-white/5 hover:border-white/10'
            : 'bg-white border-gray-100 hover:border-gray-200 shadow-sm'}
    `}>
        <div className="flex items-start justify-between mb-3">
            <div className={`
                w-9 h-9 rounded-lg flex items-center justify-center
                ${isDark ? 'bg-white/5' : 'bg-gray-100'}
            `}>
                <Icon className={`w-4 h-4 ${isDark ? 'text-white/50' : 'text-gray-500'}`} />
            </div>
            {change !== undefined && (
                <div className={`
                    flex items-center gap-0.5 text-xs font-medium
                    ${trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-400' : (isDark ? 'text-white/40' : 'text-gray-400')}
                `}>
                    {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : trend === 'down' ? <ArrowDownRight className="w-3 h-3" /> : null}
                    {change}%
                </div>
            )}
        </div>
        <p className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {value}
        </p>
        <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
            {label}
        </p>
    </div>
);

// ===== PRIORITY CARD =====

interface PriorityCardProps {
    isDark: boolean;
    title: string;
    description: string;
    status: 'on-track' | 'at-risk' | 'behind';
    progress: number;
}

const PriorityCard: React.FC<PriorityCardProps> = ({
    isDark,
    title,
    description,
    status,
    progress,
}) => {
    const statusColors = {
        'on-track': 'bg-emerald-500',
        'at-risk': 'bg-amber-500',
        'behind': 'bg-red-500',
    };

    return (
        <div className={`
            p-4 rounded-xl border transition-all duration-200 group cursor-pointer
            hover:translate-y-[-1px]
            ${isDark
                ? 'bg-white/[0.03] border-white/5 hover:border-emerald-500/30'
                : 'bg-white border-gray-100 hover:border-emerald-300 shadow-sm'}
        `}>
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
                        <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {title}
                        </p>
                    </div>
                    <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                        {description}
                    </p>
                </div>
                <ChevronRight className={`
                    w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity
                    ${isDark ? 'text-white/40' : 'text-gray-400'}
                `} />
            </div>
            {/* Progress bar */}
            <div className={`mt-3 h-1 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
                <div
                    className={`h-full rounded-full ${statusColors[status]}`}
                    style={{ width: `${progress}%` }}
                />
            </div>
            <p className={`text-[10px] mt-1 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                {progress}% complete
            </p>
        </div>
    );
};

// ===== AI INSIGHT CARD =====

const AIInsightCard: React.FC<{ isDark: boolean }> = ({ isDark }) => (
    <div className={`
        p-5 rounded-xl border relative overflow-hidden
        ${isDark
            ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/20'
            : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200'}
    `}>
        {/* Subtle glow */}
        <div className={`
            absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl
            ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-200/50'}
        `} />

        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
                <div className={`
                    w-7 h-7 rounded-lg flex items-center justify-center
                    ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}
                `}>
                    <Sparkles className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                </div>
                <span className={`text-xs font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    AI Insight
                </span>
            </div>

            <p className={`text-sm font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Based on your current metrics and goals, you should focus on <strong>improving user retention</strong> this week.
                Your acquisition is strong but churn increased 5%.
            </p>

            <div className="flex items-center gap-3">
                <button className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                    transition-all duration-150
                    ${isDark
                        ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                        : 'bg-emerald-500 text-white hover:bg-emerald-600'}
                `}>
                    <Zap className="w-3 h-3" />
                    Act on this
                </button>
                <button className={`
                    text-xs font-medium transition-all duration-150
                    ${isDark ? 'text-white/50 hover:text-white' : 'text-gray-500 hover:text-gray-700'}
                `}>
                    Dismiss
                </button>
            </div>
        </div>
    </div>
);

// ===== MAIN COMPONENT =====

export const OverviewPage: React.FC<OverviewPageProps> = ({
    isDark,
    contextName,
}) => {
    // Mock data - would come from context/API
    const metrics = [
        { icon: DollarSign, label: 'Monthly Revenue', value: '$12.4k', change: 12, trend: 'up' as const },
        { icon: Users, label: 'Active Users', value: '2,847', change: 8, trend: 'up' as const },
        { icon: TrendingUp, label: 'Growth Rate', value: '24%', change: -3, trend: 'down' as const },
        { icon: Clock, label: 'Avg. Session', value: '4m 32s', change: 5, trend: 'up' as const },
    ];

    const priorities = [
        { title: 'Launch v2.0 Features', description: 'New dashboard and analytics', status: 'on-track' as const, progress: 72 },
        { title: 'Close Enterprise Deal', description: 'Acme Corp - $50k ARR', status: 'at-risk' as const, progress: 45 },
        { title: 'Reduce Churn to <5%', description: 'Implement retention campaigns', status: 'behind' as const, progress: 28 },
    ];

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Good afternoon
                    </h1>
                    <p className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                        Here's what's happening with {contextName || 'your business'} today.
                    </p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                    {metrics.map((metric, idx) => (
                        <MetricCard
                            key={idx}
                            isDark={isDark}
                            icon={metric.icon}
                            label={metric.label}
                            value={metric.value}
                            change={metric.change}
                            trend={metric.trend}
                        />
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Priorities Column */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                <Target className="w-4 h-4 inline mr-2 opacity-50" />
                                This Week's Priorities
                            </h2>
                            <button className={`text-xs ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                View all goals →
                            </button>
                        </div>
                        <div className="space-y-3">
                            {priorities.map((priority, idx) => (
                                <PriorityCard
                                    key={idx}
                                    isDark={isDark}
                                    title={priority.title}
                                    description={priority.description}
                                    status={priority.status}
                                    progress={priority.progress}
                                />
                            ))}
                        </div>
                    </div>

                    {/* AI Insight Column */}
                    <div>
                        <h2 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            <Sparkles className="w-4 h-4 inline mr-2 opacity-50" />
                            AI Recommendation
                        </h2>
                        <AIInsightCard isDark={isDark} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverviewPage;
