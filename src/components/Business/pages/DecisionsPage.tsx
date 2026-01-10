/**
 * Decisions Page — Decision Agent Interface  
 * Log decisions, track outcomes, learn from patterns
 * Premium green design
 */

import React, { useState } from 'react';
import {
    Scale,
    Plus,
    Calendar,
    CheckCircle,
    Clock,
    AlertTriangle,
    Search,
    Sparkles,
    TrendingUp,
    TrendingDown
} from 'lucide-react';

// ===== TYPES =====

interface DecisionsPageProps {
    isDark: boolean;
}

interface Decision {
    id: string;
    title: string;
    context: string;
    reasoning: string;
    outcome?: 'good' | 'bad' | 'neutral' | 'pending';
    outcomeNotes?: string;
    category: string;
    createdAt: Date;
}

// ===== MOCK DATA =====

const MOCK_DECISIONS: Decision[] = [
    {
        id: '1',
        title: 'Pivoted from B2C to B2B',
        context: 'B2C users loved the product but had no budget',
        reasoning: 'B2B has better unit economics, easier sales cycle with decision makers',
        outcome: 'good',
        outcomeNotes: 'Revenue 3x in 2 months',
        category: 'strategy',
        createdAt: new Date(Date.now() - 2592000000)
    },
    {
        id: '2',
        title: 'Hired contractor instead of FTE',
        context: 'Needed dev help but unsure about runway',
        reasoning: 'Lower commitment, can scale up/down based on cash',
        outcome: 'neutral',
        outcomeNotes: 'Worked for now, may revisit',
        category: 'hiring',
        createdAt: new Date(Date.now() - 604800000)
    },
    {
        id: '3',
        title: 'Launched free tier',
        context: 'Wanted to lower barrier to entry',
        reasoning: 'Get users in the door, convert later',
        outcome: 'pending',
        category: 'pricing',
        createdAt: new Date(Date.now() - 86400000)
    }
];

// ===== COMPONENTS =====

interface DecisionCardProps {
    decision: Decision;
    isDark: boolean;
}

const DecisionCard: React.FC<DecisionCardProps> = ({ decision, isDark }) => {
    const daysAgo = Math.floor((Date.now() - decision.createdAt.getTime()) / 86400000);
    const timeLabel = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`;

    const outcomeConfig = {
        good: { icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Good outcome' },
        bad: { icon: TrendingDown, color: 'text-emerald-300', bg: 'bg-emerald-400/10', label: 'Needs revision' },
        neutral: { icon: Scale, color: 'text-emerald-500/60', bg: 'bg-emerald-500/5', label: 'Neutral' },
        pending: { icon: Clock, color: 'text-emerald-500/40', bg: 'bg-emerald-500/5', label: 'Pending' }
    };

    const outcome = decision.outcome || 'pending';
    const { icon: OutcomeIcon, color, bg, label } = outcomeConfig[outcome];

    return (
        <div className={`
            p-5 rounded-2xl border transition-all duration-300
            hover:translate-y-[-2px]
            ${isDark
                ? 'bg-[#0d0d0d] border-emerald-500/10 hover:border-emerald-500/30'
                : 'bg-white border-gray-100 hover:shadow-lg'}
        `}>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`
                            text-xs px-2 py-0.5 rounded-full font-medium
                            ${isDark ? 'bg-emerald-500/10 text-emerald-500/70' : 'bg-emerald-50 text-emerald-600'}
                        `}>
                            {decision.category}
                        </span>
                        <span className={`text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                            {timeLabel}
                        </span>
                    </div>
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        {decision.title}
                    </h3>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${bg}`}>
                    <OutcomeIcon className={`w-3.5 h-3.5 ${color}`} />
                    <span className={`text-xs font-medium ${color}`}>{label}</span>
                </div>
            </div>

            {/* Context */}
            <p className={`text-sm mb-3 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                <strong>Context:</strong> {decision.context}
            </p>

            {/* Reasoning */}
            <div className={`
                flex items-start gap-2 p-3 rounded-xl mb-3
                ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}
            `}>
                <Sparkles className={`w-4 h-4 mt-0.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <div>
                    <p className={`text-xs font-medium mb-0.5 ${isDark ? 'text-emerald-500/60' : 'text-emerald-600'}`}>
                        Reasoning
                    </p>
                    <p className={`text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                        {decision.reasoning}
                    </p>
                </div>
            </div>

            {/* Outcome Notes */}
            {decision.outcomeNotes && (
                <div className="flex items-center gap-2">
                    <CheckCircle className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-500/50' : 'text-emerald-500'}`} />
                    <span className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-600'}`}>
                        {decision.outcomeNotes}
                    </span>
                </div>
            )}
        </div>
    );
};

// ===== MAIN COMPONENT =====

export const DecisionsPage: React.FC<DecisionsPageProps> = ({ isDark }) => {
    const [decisions] = useState<Decision[]>(MOCK_DECISIONS);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredDecisions = decisions.filter(d =>
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.reasoning.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: decisions.length,
        good: decisions.filter(d => d.outcome === 'good').length,
        pending: decisions.filter(d => d.outcome === 'pending').length
    };

    return (
        <div className="flex-1 overflow-y-auto relative">
            {/* Background grid */}
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

            <div className="relative z-10 max-w-3xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1
                            className={`text-2xl font-bold mb-1 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}
                            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                        >
                            Decision Memory
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-emerald-500/50' : 'text-emerald-600/70'}`}>
                            Remember what you decided and why
                        </p>
                    </div>
                    <button
                        className={`
                            flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                            bg-emerald-500 text-white hover:bg-emerald-400
                            transition-all duration-200
                        `}
                        style={{
                            boxShadow: isDark ? '0 0 20px rgba(16, 185, 129, 0.3)' : 'none'
                        }}
                    >
                        <Plus className="w-4 h-4" />
                        Log Decision
                    </button>
                </div>

                {/* Search */}
                <div className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl mb-6
                    ${isDark
                        ? 'bg-emerald-500/5 border border-emerald-500/10'
                        : 'bg-gray-50 border border-gray-100'}
                `}>
                    <Search className={`w-4 h-4 ${isDark ? 'text-emerald-500/40' : 'text-gray-400'}`} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search decisions..."
                        className={`
                            flex-1 bg-transparent border-none outline-none text-sm
                            ${isDark ? 'text-white placeholder-emerald-500/30' : 'text-gray-900 placeholder-gray-400'}
                        `}
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                    />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { icon: Scale, label: 'Total Decisions', value: stats.total },
                        { icon: CheckCircle, label: 'Good Outcomes', value: stats.good },
                        { icon: Clock, label: 'Awaiting Outcome', value: stats.pending }
                    ].map((stat, idx) => (
                        <div
                            key={idx}
                            className={`
                                p-4 rounded-xl border text-center
                                ${isDark ? 'bg-[#0d0d0d] border-emerald-500/10' : 'bg-white border-gray-100'}
                            `}
                        >
                            <stat.icon className={`w-5 h-5 mx-auto mb-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                {stat.value}
                            </p>
                            <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Decisions */}
                <div className="space-y-4">
                    {filteredDecisions.length > 0 ? (
                        filteredDecisions.map(decision => (
                            <DecisionCard key={decision.id} decision={decision} isDark={isDark} />
                        ))
                    ) : (
                        <div className={`text-center py-12 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                            <Scale className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No decisions logged yet</p>
                            <p className="text-sm mt-1">Start logging important choices</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DecisionsPage;
