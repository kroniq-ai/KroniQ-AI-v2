/**
 * Goals Page - OKRs & Strategic Direction
 * Premium green-only design with glow effects and Inter typography
 */

import React from 'react';
import { Target, Sparkles, CheckCircle, Clock, TrendingUp, Plus } from 'lucide-react';

interface GoalsPageProps {
    isDark: boolean;
}

// Goal status badge - ALL GREEN SHADES
const StatusBadge: React.FC<{ status: 'on-track' | 'needs-attention' | 'behind'; isDark: boolean }> = ({ status, isDark }) => {
    // Green intensity indicates status: bright = good, dim = needs attention
    const config = {
        'on-track': { icon: CheckCircle, label: 'On Track', intensity: 'high' },
        'needs-attention': { icon: Clock, label: 'Needs Focus', intensity: 'medium' },
        'behind': { icon: TrendingUp, label: 'Push Harder', intensity: 'low' },
    };
    const { icon: Icon, label, intensity } = config[status];

    const intensityStyles = {
        high: isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700',
        medium: isDark ? 'bg-emerald-500/15 text-emerald-400/70' : 'bg-emerald-50 text-emerald-600',
        low: isDark ? 'bg-emerald-500/10 text-emerald-500/50' : 'bg-emerald-50/50 text-emerald-500',
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${intensityStyles[intensity]}`}
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
        >
            <Icon className="w-3 h-3" />
            {label}
        </span>
    );
};

// Goal Card
const GoalCard: React.FC<{
    isDark: boolean;
    title: string;
    description: string;
    progress: number;
    status: 'on-track' | 'needs-attention' | 'behind';
    keyResults: { label: string; progress: number }[];
}> = ({ isDark, title, description, progress, status, keyResults }) => {
    // Progress bar color based on intensity
    const getProgressColor = (p: number) => {
        if (p >= 70) return 'bg-emerald-500';
        if (p >= 40) return 'bg-emerald-400';
        return 'bg-emerald-300';
    };

    return (
        <div
            className={`
                relative p-6 rounded-2xl border overflow-hidden
                transition-all duration-300 group cursor-pointer
                hover:translate-y-[-2px]
                ${isDark
                    ? 'bg-[#0d0d0d] border-emerald-500/10 hover:border-emerald-500/30'
                    : 'bg-white border-gray-100 hover:border-emerald-300 shadow-sm hover:shadow-lg'}
            `}
            style={{
                boxShadow: isDark ? 'inset 0 0 30px rgba(16, 185, 129, 0.02)' : undefined
            }}
        >
            {/* Grid pattern on hover */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                    backgroundImage: isDark
                        ? `linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px)`
                        : 'none',
                    backgroundSize: '20px 20px'
                }}
            />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                            <Target className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                            <h3
                                className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                            >
                                {title}
                            </h3>
                        </div>
                        <p className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                            {description}
                        </p>
                    </div>
                    <StatusBadge status={status} isDark={isDark} />
                </div>

                {/* Progress bar with glow */}
                <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-medium ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                            Overall Progress
                        </span>
                        <span
                            className={`text-sm font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}
                            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                        >
                            {progress}%
                        </span>
                    </div>
                    <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-100'}`}>
                        <div
                            className={`h-full rounded-full transition-all duration-700 ${getProgressColor(progress)}`}
                            style={{
                                width: `${progress}%`,
                                boxShadow: isDark ? '0 0 10px rgba(16, 185, 129, 0.5)' : 'none'
                            }}
                        />
                    </div>
                </div>

                {/* Key Results */}
                <div className="space-y-3">
                    <p
                        className={`text-[10px] uppercase tracking-widest font-semibold ${isDark ? 'text-emerald-500/30' : 'text-emerald-400'}`}
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                    >
                        Key Results
                    </p>
                    {keyResults.map((kr, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                            <div className={`flex-1 h-1 rounded-full overflow-hidden ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-100'}`}>
                                <div
                                    className="h-full rounded-full bg-emerald-500/60"
                                    style={{ width: `${kr.progress}%` }}
                                />
                            </div>
                            <span className={`text-xs font-medium min-w-[120px] ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                                {kr.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* AI Actions */}
                <div className={`mt-5 pt-4 border-t flex items-center gap-2 ${isDark ? 'border-emerald-500/10' : 'border-gray-100'}`}>
                    <button className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                        transition-all duration-200
                        ${isDark
                            ? 'bg-emerald-500/10 text-emerald-400/70 hover:text-emerald-400 hover:bg-emerald-500/15'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}
                    `}
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        <Sparkles className="w-3 h-3" />
                        Break into tasks
                    </button>
                    <button className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                        transition-all duration-200
                        ${isDark
                            ? 'bg-emerald-500/10 text-emerald-400/70 hover:text-emerald-400 hover:bg-emerald-500/15'
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}
                    `}
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        Is this realistic?
                    </button>
                </div>
            </div>
        </div>
    );
};

export const GoalsPage: React.FC<GoalsPageProps> = ({ isDark }) => {
    const goals = [
        {
            title: 'Reach $50k MRR',
            description: 'Q1 2026 Revenue Target',
            progress: 65,
            status: 'on-track' as const,
            keyResults: [
                { label: 'New customers: 50', progress: 72 },
                { label: 'Reduce churn to 3%', progress: 45 },
                { label: 'Increase ARPU by 20%', progress: 80 },
            ],
        },
        {
            title: 'Launch V2 Platform',
            description: 'Complete platform redesign',
            progress: 42,
            status: 'needs-attention' as const,
            keyResults: [
                { label: 'Core features complete', progress: 60 },
                { label: 'Beta testing done', progress: 30 },
                { label: 'Documentation ready', progress: 15 },
            ],
        },
        {
            title: 'Build Content Machine',
            description: 'Marketing & SEO infrastructure',
            progress: 28,
            status: 'behind' as const,
            keyResults: [
                { label: '20 blog posts published', progress: 35 },
                { label: 'YouTube channel active', progress: 20 },
                { label: 'Newsletter 5k subs', progress: 50 },
            ],
        },
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
                absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] rounded-full blur-3xl pointer-events-none
                ${isDark ? 'bg-emerald-500/5' : 'bg-emerald-100/30'}
            `} />

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1
                            className={`text-2xl font-bold mb-1 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}
                            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                        >
                            Goals & OKRs
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-emerald-500/50' : 'text-emerald-600/70'}`}>
                            Q1 2026 objectives and key results
                        </p>
                    </div>
                    <button
                        className={`
                            flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                            bg-emerald-500 text-white hover:bg-emerald-400
                            transition-all duration-200
                        `}
                        style={{
                            fontFamily: 'Inter, system-ui, sans-serif',
                            boxShadow: isDark ? '0 0 20px rgba(16, 185, 129, 0.3)' : '0 4px 12px rgba(16, 185, 129, 0.3)'
                        }}
                    >
                        <Plus className="w-4 h-4" />
                        New Goal
                    </button>
                </div>

                {/* Goals List */}
                <div className="space-y-5">
                    {goals.map((goal, idx) => (
                        <GoalCard key={idx} isDark={isDark} {...goal} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GoalsPage;
