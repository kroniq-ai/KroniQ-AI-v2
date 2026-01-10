/**
 * Business Command Bar
 * Premium context-aware AI input with green glow and animations
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
            ${isDark ? 'bg-[#080808] border-emerald-500/10' : 'bg-white border-gray-100'}
        `}>
            {/* Quick Actions Popup */}
            {showQuickActions && quickActions.length > 0 && (
                <div
                    className={`
                        absolute bottom-full left-4 right-4 mb-3 p-3 rounded-2xl
                        border backdrop-blur-xl
                        ${isDark
                            ? 'bg-[#0d0d0d]/95 border-emerald-500/20'
                            : 'bg-white/95 border-gray-200'}
                    `}
                    style={{
                        boxShadow: isDark
                            ? '0 -10px 40px rgba(16, 185, 129, 0.1)'
                            : '0 -10px 30px rgba(0,0,0,0.05)'
                    }}
                >
                    <p className={`text-[10px] uppercase tracking-widest font-semibold px-2 mb-2 ${isDark ? 'text-emerald-500/40' : 'text-gray-400'}`}
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        Quick Actions
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {quickActions.map((action, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleQuickAction(action)}
                                className={`
                                    px-3 py-2 rounded-xl text-xs font-medium
                                    transition-all duration-200
                                    ${isDark
                                        ? 'bg-emerald-500/10 text-emerald-400/70 hover:bg-emerald-500/20 hover:text-emerald-400'
                                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}
                                `}
                                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                            >
                                {action}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="px-4 py-4">
                <div
                    className={`
                        flex items-center gap-3 px-4 py-3.5 rounded-2xl
                        transition-all duration-300
                        ${isDark
                            ? 'bg-emerald-500/5 border border-emerald-500/15 focus-within:border-emerald-500/40 focus-within:bg-emerald-500/10'
                            : 'bg-gray-50 border border-gray-200 focus-within:border-emerald-400 focus-within:bg-white'}
                    `}
                    style={{
                        boxShadow: isDark
                            ? 'inset 0 0 30px rgba(16, 185, 129, 0.03)'
                            : 'none'
                    }}
                >
                    {/* Sparkle Button */}
                    <button
                        onClick={() => setShowQuickActions(!showQuickActions)}
                        className={`
                            p-2 rounded-xl transition-all duration-200
                            ${showQuickActions
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : (isDark
                                    ? 'text-emerald-500/40 hover:text-emerald-400 hover:bg-emerald-500/10'
                                    : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50')}
                        `}
                        style={{
                            boxShadow: showQuickActions && isDark
                                ? '0 0 15px rgba(16, 185, 129, 0.2)'
                                : 'none'
                        }}
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
                            flex-1 bg-transparent border-none outline-none text-sm font-medium
                            ${isDark
                                ? 'text-white placeholder-emerald-500/30'
                                : 'text-gray-900 placeholder-gray-400'}
                            ${isProcessing ? 'opacity-50' : ''}
                        `}
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                    />

                    {/* Context indicator */}
                    {contextName && (
                        <span className={`
                            hidden sm:block text-[10px] font-medium px-2.5 py-1 rounded-full
                            ${isDark ? 'bg-emerald-500/10 text-emerald-500/50' : 'bg-gray-100 text-gray-500'}
                        `}
                            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                            {contextName}
                        </span>
                    )}

                    {/* Send Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={!inputValue.trim() || isProcessing}
                        className={`
                            p-2.5 rounded-xl transition-all duration-300
                            ${inputValue.trim() && !isProcessing
                                ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                                : (isDark
                                    ? 'bg-emerald-500/10 text-emerald-500/30'
                                    : 'bg-gray-100 text-gray-300')}
                        `}
                        style={{
                            boxShadow: inputValue.trim() && !isProcessing && isDark
                                ? '0 0 20px rgba(16, 185, 129, 0.4)'
                                : 'none'
                        }}
                    >
                        {isProcessing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </button>
                </div>

                {/* Hint */}
                <p className={`text-center text-[10px] mt-2.5 font-medium ${isDark ? 'text-emerald-500/20' : 'text-gray-300'}`}
                    style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    AI understands your business context and current page
                </p>
            </div>
        </div>
    );
};

export default BusinessCommandBar;
