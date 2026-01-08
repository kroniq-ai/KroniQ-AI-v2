/**
 * Goals Page - OKRs & Strategic Direction
 */

import React from 'react';
import { Target, ChevronRight, Sparkles, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface GoalsPageProps {
    isDark: boolean;
}

// Goal status badge
const StatusBadge: React.FC<{ status: 'on-track' | 'at-risk' | 'behind'; isDark: boolean }> = ({ status, isDark }) => {
    const config = {
        'on-track': { icon: CheckCircle, color: 'emerald', label: 'On Track' },
        'at-risk': { icon: AlertTriangle, color: 'amber', label: 'At Risk' },
        'behind': { icon: Clock, color: 'red', label: 'Behind' },
    };
    const { icon: Icon, color, label } = config[status];

    return (
        <span className={`
            inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
            ${isDark
                ? `bg-${color}-500/20 text-${color}-400`
                : `bg-${color}-100 text-${color}-700`}
        `}>
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
    status: 'on-track' | 'at-risk' | 'behind';
    keyResults: { label: string; progress: number }[];
}> = ({ isDark, title, description, progress, status, keyResults }) => (
    <div className={`
        p-5 rounded-xl border transition-all duration-200 group cursor-pointer
        hover:translate-y-[-1px]
        ${isDark
            ? 'bg-white/[0.03] border-white/5 hover:border-emerald-500/30'
            : 'bg-white border-gray-100 hover:border-emerald-300 shadow-sm'}
    `}>
        <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <Target className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {title}
                    </h3>
                </div>
                <p className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                    {description}
                </p>
            </div>
            <StatusBadge status={status} isDark={isDark} />
        </div>

        {/* Progress bar */}
        <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
                <span className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Overall Progress</span>
                <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{progress}%</span>
            </div>
            <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
                <div
                    className={`h-full rounded-full transition-all duration-500 ${status === 'on-track' ? 'bg-emerald-500' :
                            status === 'at-risk' ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>

        {/* Key Results */}
        <div className="space-y-2">
            <p className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                Key Results
            </p>
            {keyResults.map((kr, idx) => (
                <div key={idx} className="flex items-center gap-3">
                    <div className={`flex-1 h-1 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
                        <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${kr.progress}%` }}
                        />
                    </div>
                    <span className={`text-xs ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                        {kr.label}
                    </span>
                </div>
            ))}
        </div>

        {/* AI Actions */}
        <div className={`mt-4 pt-4 border-t flex items-center gap-2 ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
            <button className={`
                flex items-center gap-1 px-2 py-1 rounded-lg text-xs
                ${isDark ? 'bg-white/5 text-white/60 hover:text-white' : 'bg-gray-100 text-gray-600 hover:text-gray-900'}
            `}>
                <Sparkles className="w-3 h-3" />
                Break into tasks
            </button>
            <button className={`
                flex items-center gap-1 px-2 py-1 rounded-lg text-xs
                ${isDark ? 'bg-white/5 text-white/60 hover:text-white' : 'bg-gray-100 text-gray-600 hover:text-gray-900'}
            `}>
                Is this realistic?
            </button>
        </div>
    </div>
);

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
            status: 'at-risk' as const,
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
        <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Goals & OKRs
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                            Q1 2026 objectives and key results
                        </p>
                    </div>
                    <button className={`
                        flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                        bg-emerald-500 text-white hover:bg-emerald-400
                        shadow-lg shadow-emerald-500/20 transition-all duration-200
                    `}>
                        + New Goal
                    </button>
                </div>

                {/* Goals List */}
                <div className="space-y-4">
                    {goals.map((goal, idx) => (
                        <GoalCard key={idx} isDark={isDark} {...goal} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GoalsPage;
