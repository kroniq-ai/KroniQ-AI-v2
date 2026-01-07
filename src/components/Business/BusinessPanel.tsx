/**
 * Business Panel - Main Workspace Component
 * A dedicated, business-only AI workspace focused on decision-making, planning, and execution.
 * Clean, professional design with no glowing effects.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useBusinessContext } from '../../contexts/BusinessContext';
import { BusinessContextList } from './BusinessContextList';
import { BusinessContextForm } from './BusinessContextForm';
import {
    Briefcase,
    Send,
    Plus,
    Settings,
    Target,
    TrendingUp,
    Users,
    BarChart3,
    Lightbulb,
} from 'lucide-react';

// ===== TYPES =====

interface BusinessMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

// ===== UPGRADE PROMPT COMPONENT - Premium "Coming Soon" Design =====

const UpgradePromptBusiness: React.FC<{ isDark: boolean }> = ({ isDark }) => (
    <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 relative overflow-hidden">
        {/* Multiple layered glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[150px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-teal-500/15 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[180px] pointer-events-none" />

        {/* Animated grid pattern */}
        <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, ${isDark ? 'rgba(16,185,129,0.3)' : 'rgba(16,185,129,0.15)'} 1px, transparent 0)`,
                backgroundSize: '30px 30px'
            }}
        />

        {/* Glassmorphic container */}
        <div
            className={`
                relative z-10 max-w-lg w-full text-center p-6 sm:p-8 md:p-10 rounded-3xl
                backdrop-blur-2xl border mx-4
                ${isDark
                    ? 'bg-gradient-to-br from-white/10 via-white/5 to-transparent border-emerald-500/30'
                    : 'bg-gradient-to-br from-white/95 via-white/90 to-white/80 border-emerald-200/50'}
            `}
            style={{
                boxShadow: isDark
                    ? '0 25px 100px rgba(16,185,129,0.3), 0 10px 40px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1), 0 0 80px rgba(16,185,129,0.2)'
                    : '0 25px 80px rgba(16,185,129,0.15), 0 10px 40px rgba(0,0,0,0.05), inset 0 1px 2px rgba(255,255,255,0.9)',
            }}
        >
            {/* Glowing top border */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent rounded-full" />

            {/* Icon with intense glow */}
            <div className="relative mx-auto mb-6 sm:mb-8 w-18 h-18 sm:w-24 sm:h-24">
                <div
                    className="absolute inset-0 rounded-full blur-3xl animate-pulse"
                    style={{
                        background: 'radial-gradient(circle, rgba(16, 185, 129, 0.8) 0%, rgba(20, 184, 166, 0.4) 50%, transparent 70%)'
                    }}
                />
                <div
                    className="absolute inset-2 rounded-full blur-xl"
                    style={{
                        background: 'radial-gradient(circle, rgba(52, 211, 153, 0.6) 0%, transparent 70%)'
                    }}
                />
                <div className={`
                    relative w-18 h-18 sm:w-24 sm:h-24 mx-auto rounded-2xl flex items-center justify-center
                    bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600
                    shadow-2xl shadow-emerald-500/50
                    transform hover:scale-105 transition-transform duration-300
                `}>
                    <Briefcase className="w-10 h-10 sm:w-12 sm:h-12 text-white drop-shadow-lg" />
                </div>
            </div>

            {/* Title with gradient */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3 sm:mb-4">
                <span className={isDark ? 'text-white' : 'text-gray-900'}>
                    Business{' '}
                </span>
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                    Panel
                </span>
            </h2>

            {/* Coming Soon Badge with glow */}
            <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 mb-4 sm:mb-6 rounded-full bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 border border-emerald-500/40">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
                <span className="text-emerald-400 font-bold text-xs sm:text-sm tracking-wider uppercase">
                    Coming Soon
                </span>
            </div>

            <p className={`text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                We're building a powerful AI workspace for strategic planning, market analysis, and business growth.
            </p>

            {/* Feature preview cards with hover glow and teasers */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-6 sm:mb-8">
                {[
                    { icon: Target, label: 'Strategic Planning', glow: 'emerald', teaser: 'AI breaks down your vision into OKRs' },
                    { icon: BarChart3, label: 'Market Analysis', glow: 'teal', teaser: 'Auto-track 10 competitors in real-time' },
                    { icon: TrendingUp, label: 'Growth Strategy', glow: 'cyan', teaser: 'Get weekly AI growth recommendations' },
                ].map((item, idx) => (
                    <div
                        key={idx}
                        className={`
                            relative p-4 rounded-2xl text-center group cursor-default
                            backdrop-blur-xl border transition-all duration-300
                            ${isDark
                                ? 'bg-white/5 border-white/10 hover:border-emerald-500/50'
                                : 'bg-white/70 border-gray-200/60 hover:border-emerald-300'}
                            hover:scale-105
                        `}
                    >
                        {/* Hover glow effect */}
                        <div className={`
                            absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
                            bg-gradient-to-br from-${item.glow}-500/20 to-transparent blur-xl
                        `} />

                        <div className={`
                            relative w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center
                            bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20
                            group-hover:shadow-lg group-hover:shadow-emerald-500/30 transition-all duration-300
                        `}>
                            <item.icon className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        </div>
                        <div className={`font-semibold text-xs ${isDark ? 'text-white/90' : 'text-gray-800'}`}>
                            {item.label}
                        </div>
                        {/* Teaser on hover */}
                        <div className={`
                            mt-2 text-[10px] leading-tight opacity-0 group-hover:opacity-100 transition-opacity duration-300
                            ${isDark ? 'text-emerald-400/80' : 'text-emerald-600'}
                        `}>
                            {item.teaser}
                        </div>
                    </div>
                ))}
            </div>

            {/* Outcome metric - Founders buy time, not features */}
            <div className={`
                p-4 rounded-2xl mb-4 border
                ${isDark
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-emerald-50 border-emerald-200'}
            `}>
                <div className={`text-lg font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    ⏱️ Save 10+ hours/week with AI execution
                </div>
            </div>

            {/* Timeline + Waitlist CTA */}
            <div className={`
                p-4 rounded-2xl border text-xs sm:text-sm
                ${isDark
                    ? 'bg-white/5 border-white/10'
                    : 'bg-gray-50/80 border-gray-200'}
            `}>
                <div className={`font-medium mb-3 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                    🗓️ Early access rolling out Q1 2026
                </div>
                <button className={`
                    w-full py-3 px-4 rounded-xl font-semibold text-sm
                    bg-gradient-to-r from-emerald-500 to-teal-500 text-white
                    hover:from-emerald-400 hover:to-teal-400 transition-all
                    hover:scale-[1.02] active:scale-[0.98]
                    shadow-lg shadow-emerald-500/30
                `}>
                    Founders Get Early Access — 3 Months Free
                </button>
            </div>
        </div>
    </div>
);


// ===== EMPTY STATE COMPONENT =====

const EmptyBusinessState: React.FC<{
    isDark: boolean;
    onCreateNew: () => void;
}> = ({ isDark, onCreateNew }) => (
    <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-lg w-full text-center">
            <div className={`
        w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center
        ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}
      `}>
                <Briefcase className={`w-10 h-10 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>

            <h2 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Your Business Command Center
            </h2>

            <p className={`text-base mb-8 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                Set up your business context to get personalized AI-powered insights,
                strategic planning, and actionable recommendations.
            </p>

            <button
                onClick={onCreateNew}
                className="inline-flex items-center gap-2 py-3 px-6 rounded-xl font-semibold text-white bg-emerald-500 hover:bg-emerald-600 transition-all"
            >
                <Plus className="w-5 h-5" />
                Create Business Context
            </button>
        </div>
    </div>
);

// ===== QUICK ACTION CHIPS =====

const QuickActions: React.FC<{ isDark: boolean; onAction: (action: string) => void }> = ({ isDark, onAction }) => {
    const actions = [
        { id: 'roadmap', label: 'Create roadmap', icon: Target },
        { id: 'competitor', label: 'Analyze competitors', icon: Users },
        { id: 'growth', label: 'Growth strategy', icon: TrendingUp },
        { id: 'pricing', label: 'Pricing advice', icon: BarChart3 },
    ];

    return (
        <div className="flex flex-wrap gap-2 mb-4">
            {actions.map((action) => (
                <button
                    key={action.id}
                    onClick={() => onAction(action.id)}
                    className={`
            flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
            transition-all hover:scale-105
            ${isDark
                            ? 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'}
          `}
                >
                    <action.icon className="w-4 h-4" />
                    {action.label}
                </button>
            ))}
        </div>
    );
};

// ===== MAIN BUSINESS PANEL COMPONENT =====

export const BusinessPanel: React.FC = () => {
    const { currentTheme } = useTheme();
    const { activeContext, access, isLoading } = useBusinessContext();

    const isDark = currentTheme === 'cosmic-dark';

    const [messages, setMessages] = useState<BusinessMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [showContextForm, setShowContextForm] = useState(false);
    const [isSidebarOpen] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Loading state
    if (isLoading) {
        return (
            <div className={`flex-1 flex items-center justify-center ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <span className={isDark ? 'text-white/60' : 'text-gray-500'}>Loading Business Panel...</span>
                </div>
            </div>
        );
    }

    // No access - show upgrade prompt
    if (!access.hasAccess) {
        return (
            <div className={`flex-1 flex ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
                <UpgradePromptBusiness isDark={isDark} />
            </div>
        );
    }

    // Handle sending a message
    const handleSendMessage = async () => {
        if (!inputValue.trim() || !activeContext) return;

        const userMessage: BusinessMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');

        // Simulate AI response (replace with actual API call)
        setTimeout(() => {
            const assistantMessage: BusinessMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `I understand you're working on **${activeContext.name}** in the ${activeContext.industry} industry. Let me analyze your request and provide actionable insights...\n\nBased on your ${activeContext.stage} stage and target audience of "${activeContext.target_audience}", here's my recommendation:\n\n1. **First Priority**: Focus on validating your core value proposition\n2. **Quick Win**: Identify 3-5 early adopters in your target market\n3. **Next Step**: Create a focused landing page to test messaging\n\nWould you like me to dive deeper into any of these areas?`,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, assistantMessage]);
        }, 1500);
    };

    // Handle quick action
    const handleQuickAction = (actionId: string) => {
        const prompts: Record<string, string> = {
            roadmap: 'Create a 90-day roadmap for my business',
            competitor: 'Analyze my top 3 competitors and identify gaps',
            growth: 'Suggest 5 growth strategies for my current stage',
            pricing: 'Help me develop a pricing strategy',
        };
        setInputValue(prompts[actionId] || '');
    };

    return (
        <div className={`flex-1 flex h-full ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
            {/* Sidebar - Business Contexts */}
            {isSidebarOpen && (
                <div className={`
          w-72 border-r flex-shrink-0 flex flex-col
          ${isDark ? 'bg-[#0d0d0d] border-white/10' : 'bg-white border-gray-200'}
        `}>
                    <div className={`
            p-4 border-b flex items-center justify-between
            ${isDark ? 'border-white/10' : 'border-gray-200'}
          `}>
                        <h2 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Business Contexts
                        </h2>
                        <button
                            onClick={() => setShowContextForm(true)}
                            className={`
                p-2 rounded-lg transition-all
                ${isDark ? 'hover:bg-white/10 text-white/70' : 'hover:bg-gray-100 text-gray-600'}
              `}
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    <BusinessContextList
                        isDark={isDark}
                        onCreateNew={() => setShowContextForm(true)}
                    />
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header with active context */}
                {activeContext && (
                    <div className={`
            px-6 py-4 border-b flex items-center justify-between
            ${isDark ? 'border-white/10 bg-[#0d0d0d]' : 'border-gray-200 bg-white'}
          `}>
                        <div className="flex items-center gap-3">
                            <div className={`
                w-10 h-10 rounded-xl flex items-center justify-center
                ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}
              `}>
                                <Briefcase className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                            </div>
                            <div>
                                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {activeContext.name}
                                </h3>
                                <p className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                                    {activeContext.industry} · {activeContext.stage.charAt(0).toUpperCase() + activeContext.stage.slice(1)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className={`
                px-3 py-1 rounded-full text-xs font-medium
                ${access.planType === 'premium'
                                    ? (isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700')
                                    : (isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700')
                                }
              `}>
                                {access.planType.charAt(0).toUpperCase() + access.planType.slice(1)}
                            </span>
                            <button
                                className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10 text-white/60' : 'hover:bg-gray-100 text-gray-500'}`}
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Messages or Empty State */}
                {!activeContext ? (
                    <EmptyBusinessState isDark={isDark} onCreateNew={() => setShowContextForm(true)} />
                ) : (
                    <>
                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center">
                                    <div className={`
                    w-16 h-16 mb-4 rounded-2xl flex items-center justify-center
                    ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}
                  `}>
                                        <Lightbulb className={`w-8 h-8 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                    </div>
                                    <p className={`text-center max-w-md ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                                        Ready to help with {activeContext.name}. Ask about planning, strategy,
                                        or use a quick action below.
                                    </p>
                                    <div className="mt-6">
                                        <QuickActions isDark={isDark} onAction={handleQuickAction} />
                                    </div>
                                </div>
                            ) : (
                                messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`
                      max-w-2xl px-5 py-4 rounded-2xl
                      ${message.role === 'user'
                                                ? 'bg-emerald-500 text-white'
                                                : (isDark ? 'bg-white/5 text-white/90' : 'bg-white text-gray-800 shadow-sm')}
                    `}>
                                            <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className={`
              p-4 border-t
              ${isDark ? 'border-white/10 bg-[#0d0d0d]' : 'border-gray-200 bg-white'}
            `}>
                            {messages.length === 0 && (
                                <QuickActions isDark={isDark} onAction={handleQuickAction} />
                            )}

                            <div className={`
                flex items-center gap-3 p-3 rounded-2xl
                ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-100 border border-gray-200'}
              `}>
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                                    placeholder="Ask about strategy, planning, or growth..."
                                    className={`
                    flex-1 bg-transparent outline-none text-sm
                    ${isDark ? 'text-white placeholder:text-white/40' : 'text-gray-900 placeholder:text-gray-400'}
                  `}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputValue.trim()}
                                    className={`
                    p-2 rounded-xl transition-all
                    ${inputValue.trim()
                                            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                            : (isDark ? 'bg-white/5 text-white/30' : 'bg-gray-200 text-gray-400')}
                  `}
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Context Form Modal */}
            {showContextForm && (
                <BusinessContextForm
                    isDark={isDark}
                    onClose={() => setShowContextForm(false)}
                />
            )}
        </div>
    );
};

export default BusinessPanel;
