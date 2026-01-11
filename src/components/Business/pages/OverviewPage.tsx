/**
 * OverviewPage - CEO Dashboard Command Center
 * Morning Focus, Quick Actions, Business Health, AI Insights
 * Premium green glowing design
 */

import React, { useState, useEffect } from 'react';
import {
    Sparkles,
    Zap,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Users,
    Target,
    CheckCircle,
    Clock,
    AlertTriangle,
    Calendar,
    Phone,
    Plus,
    ArrowRight,
    ArrowUpRight,
    ArrowDownRight,
    Lightbulb,
    Activity,
    MessageSquare,
    Crown,
    Rocket,
    Star,
    Brain,
    ChevronRight,
    BarChart3
} from 'lucide-react';

interface OverviewPageProps {
    isDark: boolean;
}

interface Priority {
    id: string;
    title: string;
    action: string;
    urgency: 'high' | 'medium' | 'low';
    completed: boolean;
    category: string;
}

// ===== GREETING HERO =====
const GreetingHero: React.FC<{ isDark: boolean }> = ({ isDark }) => {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const getDate = () => {
        return new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className={`
            relative p-6 rounded-3xl border overflow-hidden mb-6
            ${isDark
                ? 'bg-gradient-to-br from-emerald-900/40 via-[#0d0d0d] to-[#0a0a0a] border-emerald-500/30'
                : 'bg-gradient-to-br from-emerald-50 via-white to-white border-emerald-200'
            }
        `}
            style={{ boxShadow: isDark ? '0 0 60px rgba(16, 185, 129, 0.15)' : '0 10px 40px rgba(16, 185, 129, 0.1)' }}
        >
            {/* Glow effects */}
            {isDark && (
                <>
                    <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full blur-3xl bg-emerald-500/20" />
                    <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full blur-3xl bg-emerald-600/10" />
                </>
            )}

            {/* Grid pattern */}
            <div
                className="absolute inset-0 opacity-5 pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(rgba(16, 185, 129, 1) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(16, 185, 129, 1) 1px, transparent 1px)`,
                    backgroundSize: '30px 30px'
                }}
            />

            <div className="relative z-10 flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Crown className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-emerald-500/60' : 'text-emerald-600/80'}`}>
                            CEO Dashboard
                        </span>
                    </div>
                    <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        {getGreeting()}, Founder 👋
                    </h1>
                    <p className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                        {getDate()} • Your business is looking healthy
                    </p>
                </div>

                <div className={`hidden md:flex items-center gap-3 px-5 py-3 rounded-2xl ${isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50'}`}>
                    <Activity className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <div>
                        <p className={`text-xs ${isDark ? 'text-emerald-400/60' : 'text-emerald-600/80'}`}>Business Health</p>
                        <p className={`text-xl font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>85<span className="text-sm">/100</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ===== MORNING FOCUS SECTION =====
const MorningFocus: React.FC<{ isDark: boolean }> = ({ isDark }) => {
    const [priorities, setPriorities] = useState<Priority[]>([
        { id: '1', title: 'Follow up with at-risk customer', action: 'Call Sarah at TechStart', urgency: 'high', completed: false, category: 'Customer' },
        { id: '2', title: 'Review Q1 marketing spend', action: 'Check ROI on Google Ads', urgency: 'medium', completed: false, category: 'Finance' },
        { id: '3', title: 'Approve new feature spec', action: 'Review roadmap item', urgency: 'low', completed: true, category: 'Product' },
    ]);

    const togglePriority = (id: string) => {
        setPriorities(prev => prev.map(p => p.id === id ? { ...p, completed: !p.completed } : p));
    };

    const urgencyColors = {
        high: isDark ? 'text-red-400 bg-red-500/10' : 'text-red-600 bg-red-50',
        medium: isDark ? 'text-yellow-400 bg-yellow-500/10' : 'text-yellow-600 bg-yellow-50',
        low: isDark ? 'text-emerald-400 bg-emerald-500/10' : 'text-emerald-600 bg-emerald-50'
    };

    return (
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#0d0d0d] border-emerald-500/10' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-emerald-500/30 to-emerald-600/20`}
                        style={{ boxShadow: isDark ? '0 0 15px rgba(16, 185, 129, 0.2)' : 'none' }}>
                        <Brain className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    </div>
                    <div>
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Morning Focus</h3>
                        <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>AI-prioritized for today</p>
                    </div>
                </div>
                <button className={`text-xs font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    Regenerate
                </button>
            </div>

            <div className="space-y-3">
                {priorities.map((priority, index) => (
                    <button
                        key={priority.id}
                        onClick={() => togglePriority(priority.id)}
                        className={`
                            w-full p-4 rounded-xl border text-left transition-all duration-300
                            ${priority.completed
                                ? (isDark ? 'bg-white/[0.02] border-white/5 opacity-50' : 'bg-gray-50 border-gray-100 opacity-50')
                                : (isDark ? 'bg-white/[0.02] border-white/5 hover:border-emerald-500/30' : 'bg-gray-50 border-gray-100 hover:border-emerald-200')
                            }
                        `}
                    >
                        <div className="flex items-start gap-3">
                            <div className={`
                                w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5
                                transition-all duration-300
                                ${priority.completed
                                    ? 'border-emerald-500 bg-emerald-500'
                                    : (isDark ? 'border-white/20' : 'border-gray-300')
                                }
                            `}>
                                {priority.completed && <CheckCircle className="w-4 h-4 text-white" />}
                                {!priority.completed && (
                                    <span className={`text-xs font-bold ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                                        {index + 1}
                                    </span>
                                )}
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className={`font-medium ${priority.completed ? 'line-through' : ''} ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {priority.title}
                                    </p>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${urgencyColors[priority.urgency]}`}>
                                        {priority.urgency}
                                    </span>
                                </div>
                                <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                                    <span className="font-medium">{priority.action}</span> • {priority.category}
                                </p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

// ===== QUICK ACTIONS =====
const QuickActions: React.FC<{ isDark: boolean }> = ({ isDark }) => {
    const actions = [
        { icon: Phone, label: 'Log a Call', color: 'from-emerald-500 to-emerald-600', featured: true },
        { icon: Plus, label: 'Add Task', color: 'from-blue-500 to-blue-600' },
        { icon: Target, label: 'Set Goal', color: 'from-purple-500 to-purple-600' },
        { icon: MessageSquare, label: 'Talk to AI', color: 'from-orange-500 to-orange-600' },
    ];

    return (
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#0d0d0d] border-emerald-500/10' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center gap-2 mb-4">
                <Zap className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {actions.map((action, i) => (
                    <button
                        key={i}
                        className={`
                            p-4 rounded-xl border flex items-center gap-3
                            transition-all duration-300 hover:translate-y-[-2px]
                            ${action.featured
                                ? (isDark
                                    ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50'
                                    : 'bg-emerald-50 border-emerald-200 hover:border-emerald-300')
                                : (isDark
                                    ? 'bg-white/[0.02] border-white/5 hover:border-emerald-500/30'
                                    : 'bg-gray-50 border-gray-100 hover:border-emerald-200')
                            }
                        `}
                        style={{ boxShadow: action.featured && isDark ? '0 0 20px rgba(16, 185, 129, 0.1)' : 'none' }}
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${action.color}`}>
                            <action.icon className="w-5 h-5 text-white" />
                        </div>
                        <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {action.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

// ===== BUSINESS METRICS =====
const BusinessMetrics: React.FC<{ isDark: boolean }> = ({ isDark }) => {
    const metrics = [
        { label: 'MRR', value: '$14.2k', change: 12, icon: DollarSign },
        { label: 'Customers', value: '47', change: 8, icon: Users },
        { label: 'Runway', value: '7.6 mo', change: -5, icon: Clock, warning: true },
        { label: 'NPS', value: '72', change: 3, icon: Star },
    ];

    return (
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#0d0d0d] border-emerald-500/10' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <BarChart3 className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Key Metrics</h3>
                </div>
                <button className={`text-xs font-medium flex items-center gap-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    View All <ChevronRight className="w-3 h-3" />
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {metrics.map((metric, i) => (
                    <div
                        key={i}
                        className={`p-3 rounded-xl ${metric.warning
                                ? (isDark ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-200')
                                : (isDark ? 'bg-white/[0.02]' : 'bg-gray-50')
                            }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${metric.warning ? (isDark ? 'bg-yellow-500/20' : 'bg-yellow-100') : (isDark ? 'bg-emerald-500/10' : 'bg-gray-100')
                                }`}>
                                <metric.icon className={`w-4 h-4 ${metric.warning ? 'text-yellow-400' : (isDark ? 'text-emerald-400' : 'text-emerald-600')
                                    }`} />
                            </div>
                            <div className={`flex items-center gap-0.5 text-[10px] font-medium ${metric.change >= 0 ? 'text-emerald-500' : 'text-red-500'
                                }`}>
                                {metric.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                {Math.abs(metric.change)}%
                            </div>
                        </div>
                        <p className={`text-lg font-bold ${metric.warning ? 'text-yellow-400' : (isDark ? 'text-white' : 'text-gray-900')}`}>
                            {metric.value}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{metric.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ===== AI INSIGHTS =====
const AIInsights: React.FC<{ isDark: boolean }> = ({ isDark }) => {
    const insights = [
        { type: 'alert', message: '2 customers need attention — dropping health scores', action: 'View customers' },
        { type: 'tip', message: 'LinkedIn ads have 3x better ROI than Google — consider reallocation', action: 'See breakdown' },
        { type: 'win', message: 'Revenue up 12% MoM — you\'re on track for $200k ARR', action: 'Celebrate 🎉' },
    ];

    const typeConfig = {
        alert: { icon: AlertTriangle, color: isDark ? 'text-yellow-400' : 'text-yellow-600' },
        tip: { icon: Lightbulb, color: isDark ? 'text-blue-400' : 'text-blue-600' },
        win: { icon: Star, color: isDark ? 'text-emerald-400' : 'text-emerald-600' }
    };

    return (
        <div className={`
            p-5 rounded-2xl border
            ${isDark
                ? 'bg-gradient-to-br from-emerald-500/10 to-[#0d0d0d] border-emerald-500/20'
                : 'bg-gradient-to-br from-emerald-50 to-white border-emerald-200'
            }
        `}>
            <div className="flex items-center gap-2 mb-4">
                <Sparkles className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>AI Insights</h3>
            </div>

            <div className="space-y-3">
                {insights.map((insight, i) => {
                    const config = typeConfig[insight.type as keyof typeof typeConfig];
                    return (
                        <div key={i} className={`p-3 rounded-xl ${isDark ? 'bg-white/[0.03]' : 'bg-white'}`}>
                            <div className="flex items-start gap-3">
                                <config.icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${config.color}`} />
                                <div className="flex-1">
                                    <p className={`text-sm mb-1 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                                        {insight.message}
                                    </p>
                                    <button className={`text-xs font-medium flex items-center gap-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                        {insight.action} <ArrowRight className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// ===== MAIN COMPONENT =====
export const OverviewPage: React.FC<OverviewPageProps> = ({ isDark }) => {
    return (
        <div className="flex-1 overflow-y-auto p-6">
            {/* Greeting Hero */}
            <GreetingHero isDark={isDark} />

            {/* Main Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    <MorningFocus isDark={isDark} />
                    <QuickActions isDark={isDark} />
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <BusinessMetrics isDark={isDark} />
                    <AIInsights isDark={isDark} />
                </div>
            </div>
        </div>
    );
};

export default OverviewPage;
