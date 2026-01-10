/**
 * Overview Page - Command Center
 * Premium visual design with green glow, grid patterns, and smooth animations
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

// ===== METRIC CARD (Premium Design) =====

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
        relative p-5 rounded-2xl border overflow-hidden
        transition-all duration-300 ease-out
        hover:translate-y-[-2px] hover:shadow-xl group
        ${isDark
            ? 'bg-[#0d0d0d] border-emerald-500/10 hover:border-emerald-500/30 hover:shadow-emerald-500/5'
            : 'bg-white border-gray-100 hover:border-emerald-300 shadow-sm hover:shadow-emerald-100'}
    `}>
        {/* Subtle glow on hover */}
        <div className={`
            absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
            ${isDark ? 'bg-gradient-to-br from-emerald-500/5 to-transparent' : ''}
        `} />

        <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
                <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center
                    ${isDark
                        ? 'bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors duration-300'
                        : 'bg-emerald-50 group-hover:bg-emerald-100'}
                `}>
                    <Icon className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                </div>
                {change !== undefined && (
                    <div className={`
                        flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full
                        ${trend === 'up'
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : trend === 'down'
                                ? 'text-emerald-300 bg-emerald-500/5'
                                : (isDark ? 'text-white/40 bg-white/5' : 'text-gray-400 bg-gray-100')}
                    `}>
                        {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : trend === 'down' ? <ArrowDownRight className="w-3 h-3" /> : null}
                        {change}%
                    </div>
                )}
            </div>
            <p className={`text-3xl font-bold mb-1 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                {value}
            </p>
            <p className={`text-sm font-medium ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                {label}
            </p>
        </div>
    </div>
);

// ===== PRIORITY CARD (Premium Design) =====

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
    // All green shades for status
    const statusColors = {
        'on-track': 'bg-emerald-500',
        'at-risk': 'bg-emerald-400',
        'behind': 'bg-emerald-300',
    };

    const statusLabels = {
        'on-track': 'On Track',
        'at-risk': 'Needs Attention',
        'behind': 'Behind',
    };

    return (
        <div className={`
            relative p-5 rounded-2xl border overflow-hidden
            transition-all duration-300 ease-out group cursor-pointer
            hover:translate-y-[-2px]
            ${isDark
                ? 'bg-[#0d0d0d] border-emerald-500/10 hover:border-emerald-500/30'
                : 'bg-white border-gray-100 hover:border-emerald-300 shadow-sm'}
        `}>
            {/* Grid pattern overlay */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                    backgroundImage: isDark
                        ? `linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px)`
                        : 'none',
                    backgroundSize: '20px 20px'
                }}
            />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <div className={`w-2 h-2 rounded-full ${statusColors[status]} animate-pulse`} />
                            <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                {title}
                            </p>
                        </div>
                        <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                            {description}
                        </p>
                    </div>
                    <span className={`
                        text-[10px] font-medium px-2 py-1 rounded-full
                        ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}
                    `}>
                        {statusLabels[status]}
                    </span>
                </div>

                {/* Progress bar with glow */}
                <div className="relative mt-4">
                    <div className={`h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-100'}`}>
                        <div
                            className={`h-full rounded-full ${statusColors[status]} transition-all duration-700 ease-out`}
                            style={{
                                width: `${progress}%`,
                                boxShadow: isDark ? '0 0 10px rgba(16, 185, 129, 0.5)' : 'none'
                            }}
                        />
                    </div>
                    <p className={`text-[10px] mt-2 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                        {progress}% complete
                    </p>
                </div>
            </div>
        </div>
    );
};

// ===== AI INSIGHT CARD (Premium Design) =====

const AIInsightCard: React.FC<{ isDark: boolean }> = ({ isDark }) => (
    <div className={`
        relative p-6 rounded-2xl border overflow-hidden
        ${isDark
            ? 'bg-gradient-to-br from-emerald-500/10 via-[#0d0d0d] to-[#0d0d0d] border-emerald-500/20'
            : 'bg-gradient-to-br from-emerald-50 to-white border-emerald-200'}
    `}>
        {/* Grid pattern */}
        <div
            className="absolute inset-0 pointer-events-none"
            style={{
                backgroundImage: isDark
                    ? `linear-gradient(rgba(16, 185, 129, 0.05) 1px, transparent 1px),
                       linear-gradient(90deg, rgba(16, 185, 129, 0.05) 1px, transparent 1px)`
                    : 'none',
                backgroundSize: '30px 30px',
                maskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, black 0%, transparent 70%)',
                WebkitMaskImage: 'radial-gradient(ellipse 80% 50% at 50% 0%, black 0%, transparent 70%)'
            }}
        />

        {/* Glow effect */}
        <div className={`
            absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl
            ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-200/50'}
        `} />

        <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
                <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center
                    ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}
                `}
                    style={{
                        boxShadow: isDark ? '0 0 20px rgba(16, 185, 129, 0.3)' : 'none'
                    }}>
                    <Sparkles className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                </div>
                <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                    AI Insight
                </span>
            </div>

            <p className={`text-sm leading-relaxed mb-4 ${isDark ? 'text-white/80' : 'text-gray-700'}`}
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                Based on your current metrics, you should focus on <strong className="text-emerald-400">improving user retention</strong> this week.
                Your acquisition is strong but churn increased 5%.
            </p>

            <div className="flex items-center gap-3">
                <button className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                    transition-all duration-300 ease-out
                    bg-emerald-500 text-white hover:bg-emerald-400
                    hover:shadow-lg hover:shadow-emerald-500/30
                `}
                    style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    <Zap className="w-4 h-4" />
                    Act on this
                </button>
                <button className={`
                    text-sm font-medium transition-colors duration-200
                    ${isDark ? 'text-white/40 hover:text-white/70' : 'text-gray-400 hover:text-gray-600'}
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
    // Mock data
    const metrics = [
        { icon: DollarSign, label: 'Monthly Revenue', value: '$12.4k', change: 12, trend: 'up' as const },
        { icon: Users, label: 'Active Users', value: '2,847', change: 8, trend: 'up' as const },
        { icon: TrendingUp, label: 'Growth Rate', value: '24%', change: 3, trend: 'down' as const },
        { icon: Clock, label: 'Avg. Session', value: '4m 32s', change: 5, trend: 'up' as const },
    ];

    const priorities = [
        { title: 'Launch v2.0 Features', description: 'New dashboard and analytics', status: 'on-track' as const, progress: 72 },
        { title: 'Close Enterprise Deal', description: 'Acme Corp - $50k ARR', status: 'at-risk' as const, progress: 45 },
        { title: 'Reduce Churn to <5%', description: 'Implement retention campaigns', status: 'behind' as const, progress: 28 },
    ];

    return (
        <div className="flex-1 overflow-y-auto relative">
            {/* Background grid pattern */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: isDark
                        ? `linear-gradient(rgba(16, 185, 129, 0.02) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(16, 185, 129, 0.02) 1px, transparent 1px)`
                        : 'none',
                    backgroundSize: '50px 50px',
                    maskImage: 'radial-gradient(ellipse 100% 60% at 50% 0%, black 0%, transparent 70%)',
                    WebkitMaskImage: 'radial-gradient(ellipse 100% 60% at 50% 0%, black 0%, transparent 70%)'
                }}
            />

            {/* Subtle top glow */}
            <div className={`
                absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-3xl pointer-events-none
                ${isDark ? 'bg-emerald-500/5' : 'bg-emerald-100/30'}
            `} />

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className={`text-3xl font-bold mb-2 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        Good afternoon
                    </h1>
                    <p className={`text-sm ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                        Here's what's happening with {contextName || 'your business'} today.
                    </p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
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
                        <div className="flex items-center justify-between mb-5">
                            <h2 className={`text-sm font-semibold uppercase tracking-wider ${isDark ? 'text-white/60' : 'text-gray-600'}`}
                                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                <Target className="w-4 h-4 inline mr-2 text-emerald-500" />
                                This Week's Priorities
                            </h2>
                            <button className={`
                                text-xs font-medium transition-colors duration-200
                                ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'}
                            `}>
                                View all goals →
                            </button>
                        </div>
                        <div className="space-y-4">
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
                        <h2 className={`text-sm font-semibold uppercase tracking-wider mb-5 ${isDark ? 'text-white/60' : 'text-gray-600'}`}
                            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                            <Sparkles className="w-4 h-4 inline mr-2 text-emerald-500" />
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
