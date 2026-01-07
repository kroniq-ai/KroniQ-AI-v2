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
    Compass,
    Radar,
    CheckSquare,
    Brain,
    FileText,
    Sparkles,
    Building2,
    Clock,
    Lock,
    Zap,
} from 'lucide-react';

// ===== TYPES =====

interface BusinessMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

// ===== BUSINESS COMMAND CENTER (Coming Soon State) =====

const UpgradePromptBusiness: React.FC<{ isDark: boolean; onCreateContext?: () => void }> = ({ isDark, onCreateContext }) => {
    const [typingText, setTypingText] = useState('');
    const fullText = 'Based on your current traction and pricing, here\'s a realistic weekly breakdown...';

    // Typing animation for AI preview
    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            if (index < fullText.length) {
                setTypingText(fullText.slice(0, index + 1));
                index++;
            } else {
                clearInterval(interval);
            }
        }, 30);
        return () => clearInterval(interval);
    }, []);

    const coreModules = [
        {
            icon: Compass,
            title: 'Strategic Planning',
            desc: 'Turn vision into goals, OKRs, and weekly execution plans.'
        },
        {
            icon: Radar,
            title: 'Market & Competitor Intelligence',
            desc: 'Track competitors, pricing, trends, and market shifts automatically.'
        },
        {
            icon: CheckSquare,
            title: 'Task & Execution System',
            desc: 'Break goals into tasks, assign owners, and track progress with AI support.'
        },
        {
            icon: BarChart3,
            title: 'Business Analysis & Decisions',
            desc: 'Understand why metrics change and log decisions with reasoning.'
        },
        {
            icon: FileText,
            title: 'Communication & Updates',
            desc: 'Generate investor updates, team recaps, and founder summaries in one click.'
        },
    ];

    const contextItems = [
        { icon: Building2, label: 'Company basics' },
        { icon: Target, label: 'Goals & priorities' },
        { icon: Users, label: 'Competitors & market' },
        { icon: BarChart3, label: 'Metrics that matter' },
        { icon: Clock, label: 'Your decision history' },
    ];

    return (
        <div className={`flex-1 overflow-y-auto ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
            {/* Subtle grid pattern */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'} 1px, transparent 1px),
                                      linear-gradient(90deg, ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'} 1px, transparent 1px)`,
                    backgroundSize: '60px 60px'
                }}
            />

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 lg:py-16">
                {/* Main Headline */}
                <div className="text-center mb-12">
                    <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Your Business Command Center
                    </h1>
                    <p className={`text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                        Plan, analyze, and execute your business with an AI that understands your context.
                    </p>
                </div>

                {/* Primary CTA */}
                <div className="text-center mb-16">
                    <button
                        onClick={onCreateContext}
                        className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-white text-base
                                   bg-emerald-500 hover:bg-emerald-400 
                                   shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50
                                   transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        <Plus className="w-5 h-5" />
                        Create Business Context
                    </button>
                    <p className={`mt-4 text-sm ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                        Takes less than 2 minutes. You can edit everything later.
                    </p>
                </div>

                {/* Context Engine Preview */}
                <div className="mb-12">
                    <h3 className={`text-xs font-medium uppercase tracking-wider mb-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                        What KroniQ learns about your business
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {contextItems.map((item, idx) => (
                            <div
                                key={idx}
                                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200
                                           ${isDark
                                        ? 'bg-white/5 border-white/10 hover:border-white/20'
                                        : 'bg-white border-gray-200 hover:border-gray-300'}`}
                            >
                                <item.icon className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                <span className={`text-xs text-center ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                    <p className={`mt-4 text-xs text-center ${isDark ? 'text-white/20' : 'text-gray-300'}`}>
                        <Lock className="w-3 h-3 inline mr-1" />
                        Your data stays private and editable at all times.
                    </p>
                </div>

                {/* Core Modules Grid */}
                <div className="mb-12">
                    <h3 className={`text-xs font-medium uppercase tracking-wider mb-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                        What you can do inside the Business Panel
                    </h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {coreModules.map((module, idx) => (
                            <div
                                key={idx}
                                className={`group p-6 rounded-2xl border transition-all duration-200
                                           hover:translate-y-[-2px]
                                           ${isDark
                                        ? 'bg-white/5 border-white/10 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10'
                                        : 'bg-white border-gray-200 hover:border-emerald-300 hover:shadow-lg'}`}
                            >
                                <div className={`w-12 h-12 mb-4 rounded-xl flex items-center justify-center
                                               bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border
                                               ${isDark ? 'border-emerald-500/20' : 'border-emerald-200'}
                                               group-hover:shadow-md group-hover:shadow-emerald-500/20 transition-all duration-200`}>
                                    <module.icon className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                </div>
                                <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {module.title}
                                </h4>
                                <p className={`text-sm leading-relaxed ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                                    {module.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Preview Card */}
                <div className={`mb-8 p-6 rounded-2xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={`text-sm font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                            KroniQ is ready
                        </span>
                    </div>

                    {/* User message */}
                    <div className="mb-4">
                        <span className={`text-xs font-medium ${isDark ? 'text-white/40' : 'text-gray-400'}`}>You:</span>
                        <p className={`mt-1 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                            "Set a Q1 revenue goal of $50k and break it into weekly actions."
                        </p>
                    </div>

                    {/* AI response */}
                    <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <span className={`text-xs font-medium ${isDark ? 'text-emerald-400/60' : 'text-emerald-600'}`}>AI:</span>
                        <p className={`mt-1 font-mono text-sm ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                            {typingText}<span className="animate-pulse">▌</span>
                        </p>
                    </div>
                </div>

                {/* Outcome Signal */}
                <div className="text-center">
                    <p className={`text-lg ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                        <Clock className="w-5 h-5 inline mr-2" />
                        Save 10+ hours per week by planning and executing with AI.
                    </p>
                </div>

                {/* Early Access CTA */}
                <div className="mt-12 text-center">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm
                                   ${isDark ? 'bg-white/5 text-white/50' : 'bg-gray-100 text-gray-500'}`}>
                        <Zap className="w-4 h-4 text-emerald-400" />
                        Early access rolling out Q1 2026
                    </div>
                </div>
            </div>
        </div>
    );
};


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
