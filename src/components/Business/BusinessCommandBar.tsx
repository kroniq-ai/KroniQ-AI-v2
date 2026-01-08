/**
 * Business Command Bar
 * Context-aware AI input for the Business Operating System
 */

import React, { useState } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import type { BusinessPage } from './BusinessNav';

// ===== TYPES =====

interface BusinessCommandBarProps {
    isDark: boolean;
    currentPage: BusinessPage;
    contextName?: string;
    onCommand: (command: string) => void;
    isProcessing?: boolean;
}

// ===== PLACEHOLDER PROMPTS BY PAGE =====

const PAGE_PLACEHOLDERS: Record<BusinessPage, string> = {
    overview: 'Ask KroniQ what to focus on today...',
    goals: 'Ask about goal progress or create new objectives...',
    tasks: 'Create tasks, get daily plan, or check priorities...',
    assets: 'Search knowledge, summarize documents...',
    decisions: 'Review past decisions or log a new one...',
    analytics: 'Ask why metrics changed or what matters most...',
    competitors: 'Get competitive insights or positioning advice...',
    market: 'Research market trends or opportunities...',
    reports: 'Generate investor update or weekly recap...',
    updates: 'Draft stakeholder communications...',
    context: 'Update business context or settings...',
    team: 'Manage team permissions...',
};

// ===== QUICK ACTIONS BY PAGE =====

const PAGE_QUICK_ACTIONS: Record<BusinessPage, string[]> = {
    overview: ['What should I focus on?', 'Summarize this week', 'Top priorities'],
    goals: ['Break into tasks', 'Is this realistic?', 'What blocks this?'],
    tasks: ['Generate daily plan', 'What\'s overdue?', 'Prioritize for me'],
    assets: ['Summarize latest', 'Find relevant docs', 'Turn into pitch'],
    decisions: ['Review Q4 decisions', 'Pattern analysis', 'What did we learn?'],
    analytics: ['Why did this change?', 'What matters most?', 'Forecast next month'],
    competitors: ['Where do we win?', 'What to copy?', 'Pricing analysis'],
    market: ['Industry trends', 'New opportunities', 'Threat analysis'],
    reports: ['Investor update', 'Weekly recap', 'Board summary'],
    updates: ['Draft team update', 'Client newsletter', 'Launch announcement'],
    context: ['Update goals', 'Change stage', 'Edit audience'],
    team: ['Add member', 'Review permissions', 'Activity log'],
};

// ===== COMPONENT =====

export const BusinessCommandBar: React.FC<BusinessCommandBarProps> = ({
    isDark,
    currentPage,
    contextName,
    onCommand,
    isProcessing = false,
}) => {
    const [inputValue, setInputValue] = useState('');
    const [showQuickActions, setShowQuickActions] = useState(false);

    const handleSubmit = () => {
        if (inputValue.trim() && !isProcessing) {
            onCommand(inputValue.trim());
            setInputValue('');
        }
    };

    const handleQuickAction = (action: string) => {
        onCommand(action);
        setShowQuickActions(false);
    };

    const quickActions = PAGE_QUICK_ACTIONS[currentPage] || [];

    return (
        <div className={`
            relative border-t
            ${isDark ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-gray-100'}
        `}>
            {/* Quick Actions Popup */}
            {showQuickActions && quickActions.length > 0 && (
                <div className={`
                    absolute bottom-full left-4 right-4 mb-2 p-2 rounded-xl
                    backdrop-blur-xl border
                    ${isDark
                        ? 'bg-[#151515]/95 border-white/10'
                        : 'bg-white/95 border-gray-200'}
                `}>
                    <p className={`text-[10px] uppercase tracking-wider px-2 mb-2 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                        Quick Actions
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {quickActions.map((action, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleQuickAction(action)}
                                className={`
                                    px-3 py-1.5 rounded-lg text-xs font-medium
                                    transition-all duration-150
                                    ${isDark
                                        ? 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900'}
                                `}
                            >
                                {action}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="px-4 py-3">
                <div className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl
                    transition-all duration-200
                    ${isDark
                        ? 'bg-white/5 border border-white/10 focus-within:border-emerald-500/50 focus-within:bg-white/[0.07]'
                        : 'bg-gray-50 border border-gray-200 focus-within:border-emerald-400 focus-within:bg-white'}
                `}>
                    {/* Sparkle Button */}
                    <button
                        onClick={() => setShowQuickActions(!showQuickActions)}
                        className={`
                            p-1.5 rounded-lg transition-all duration-150
                            ${showQuickActions
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : (isDark
                                    ? 'text-white/40 hover:text-emerald-400 hover:bg-white/5'
                                    : 'text-gray-400 hover:text-emerald-600 hover:bg-gray-100')}
                        `}
                    >
                        <Sparkles className="w-4 h-4" />
                    </button>

                    {/* Input */}
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit();
                            }
                        }}
                        onFocus={() => setShowQuickActions(false)}
                        placeholder={PAGE_PLACEHOLDERS[currentPage]}
                        disabled={isProcessing}
                        className={`
                            flex-1 bg-transparent border-none outline-none text-sm
                            ${isDark
                                ? 'text-white placeholder-white/30'
                                : 'text-gray-900 placeholder-gray-400'}
                            ${isProcessing ? 'opacity-50' : ''}
                        `}
                    />

                    {/* Context indicator */}
                    {contextName && (
                        <span className={`
                            hidden sm:block text-[10px] px-2 py-0.5 rounded-full
                            ${isDark ? 'bg-white/5 text-white/40' : 'bg-gray-100 text-gray-500'}
                        `}>
                            {contextName}
                        </span>
                    )}

                    {/* Send Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={!inputValue.trim() || isProcessing}
                        className={`
                            p-2 rounded-lg transition-all duration-150
                            ${inputValue.trim() && !isProcessing
                                ? 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'
                                : (isDark
                                    ? 'bg-white/5 text-white/20'
                                    : 'bg-gray-100 text-gray-300')}
                        `}
                    >
                        {isProcessing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </button>
                </div>

                {/* Hint */}
                <p className={`text-center text-[10px] mt-2 ${isDark ? 'text-white/20' : 'text-gray-300'}`}>
                    AI understands your business context and current page
                </p>
            </div>
        </div>
    );
};

export default BusinessCommandBar;
