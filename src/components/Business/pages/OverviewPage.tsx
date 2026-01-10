/**
 * Overview Page - Action Hub (No Fake Metrics)
 * Focus on DOING things, not tracking analytics
 */

import React from 'react';
import {
    Target,
    Sparkles,
    CheckSquare,
    MessageSquare,
    Zap,
    Plus,
    ArrowRight
} from 'lucide-react';
import { MorningFocus } from '../MorningFocus';

// ===== TYPES =====

interface OverviewPageProps {
    isDark: boolean;
    contextName?: string;
}

// ===== QUICK ACTION CARD =====

interface QuickActionProps {
    isDark: boolean;
    icon: React.ElementType;
    title: string;
    description: string;
    onClick?: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({ isDark, icon: Icon, title, description, onClick }) => (
    <button
        onClick={onClick}
        className={`
            w-full p-5 rounded-2xl border text-left
            transition-all duration-300 group
            hover:translate-y-[-2px]
            ${isDark
                ? 'bg-[#0d0d0d] border-emerald-500/10 hover:border-emerald-500/30'
                : 'bg-white border-gray-100 hover:border-emerald-300 shadow-sm hover:shadow-lg'}
        `}
    >
        <div className="flex items-center gap-4">
            <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                transition-all duration-300
                ${isDark
                    ? 'bg-emerald-500/10 group-hover:bg-emerald-500/20'
                    : 'bg-emerald-50 group-hover:bg-emerald-100'}
            `}
                style={{
                    boxShadow: isDark ? '0 0 15px rgba(16, 185, 129, 0.1)' : 'none'
                }}>
                <Icon className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>
            <div className="flex-1 min-w-0">
                <h3
                    className={`font-semibold mb-0.5 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                >
                    {title}
                </h3>
                <p className={`text-sm ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                    {description}
                </p>
            </div>
            <ArrowRight className={`
                w-5 h-5 opacity-0 group-hover:opacity-100 transition-all duration-300
                ${isDark ? 'text-emerald-400' : 'text-emerald-600'}
            `} />
        </div>
    </button>
);

// ===== AI INSIGHT CARD =====

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
                    AI Suggestion
                </span>
            </div>

            <p className={`text-sm leading-relaxed mb-4 ${isDark ? 'text-white/80' : 'text-gray-700'}`}
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                Ask me anything about your business. I can help with <strong className="text-emerald-400">daily priorities</strong>,{' '}
                <strong className="text-emerald-400">decision-making</strong>, or <strong className="text-emerald-400">staying focused</strong>.
            </p>

            <div className="flex items-center gap-3">
                <button className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                    transition-all duration-300 ease-out
                    bg-emerald-500 text-white hover:bg-emerald-400
                    hover:shadow-lg hover:shadow-emerald-500/30
                `}
                    style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    <MessageSquare className="w-4 h-4" />
                    Ask KroniQ
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
    // Get time-based greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

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

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className={`text-3xl font-bold mb-2 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        {getGreeting()}
                    </h1>
                    <p className={`text-sm ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                        What would you like to work on{contextName ? ` for ${contextName}` : ''} today?
                    </p>
                </div>

                {/* Main Grid */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Left Column - Quick Actions */}
                    <div className="space-y-4">
                        <h2 className={`text-xs font-semibold uppercase tracking-widest mb-4 ${isDark ? 'text-emerald-500/40' : 'text-emerald-600'}`}
                            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                            <Zap className="w-3 h-3 inline mr-2" />
                            Quick Actions
                        </h2>

                        <QuickAction
                            isDark={isDark}
                            icon={Plus}
                            title="Add a Task"
                            description="Create something to work on today"
                        />
                        <QuickAction
                            isDark={isDark}
                            icon={Target}
                            title="Set a Goal"
                            description="Define an objective to chase"
                        />
                        <QuickAction
                            isDark={isDark}
                            icon={CheckSquare}
                            title="Log a Decision"
                            description="Record a choice you made"
                        />
                        <QuickAction
                            isDark={isDark}
                            icon={MessageSquare}
                            title="Talk to AI"
                            description="Get advice or brainstorm ideas"
                        />
                    </div>

                    {/* Right Column - AI Features */}
                    <div className="space-y-6">
                        {/* Morning Focus */}
                        <MorningFocus isDark={isDark} />

                        {/* AI Insight */}
                        <AIInsightCard isDark={isDark} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverviewPage;
