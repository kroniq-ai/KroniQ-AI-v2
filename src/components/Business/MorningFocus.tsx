/**
 * Morning Focus Component
 * AI-generated daily priorities using Gemini backend
 * Premium green design
 */

import React, { useState, useEffect } from 'react';
import {
    Sparkles,
    Sun,
    CheckCircle,
    RefreshCw,
    Zap,
    Clock
} from 'lucide-react';
import { useBusinessContext } from '../../contexts/BusinessContext';

interface MorningFocusProps {
    isDark: boolean;
    onTaskCreate?: (title: string) => void;
}

interface FocusItem {
    id: string;
    title: string;
    reason: string;
    priority: 'urgent' | 'high' | 'medium';
    estimatedTime: string;
}

// Simulated AI-generated focus items (will connect to Gemini later)
const generateMockFocus = (): FocusItem[] => [
    {
        id: '1',
        title: 'Talk to 3 potential customers',
        reason: 'Customer development is the #1 priority at your stage',
        priority: 'urgent',
        estimatedTime: '2 hours',
    },
    {
        id: '2',
        title: 'Ship the landing page update',
        reason: 'Been in progress for 3 days - time to finish',
        priority: 'high',
        estimatedTime: '1.5 hours',
    },
    {
        id: '3',
        title: 'Review yesterday\'s user feedback',
        reason: 'Fresh insights before they go stale',
        priority: 'medium',
        estimatedTime: '30 mins',
    },
];

export const MorningFocus: React.FC<MorningFocusProps> = ({ isDark }) => {
    const { activeContext } = useBusinessContext();
    const [focusItems, setFocusItems] = useState<FocusItem[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

    // Generate focus on mount
    useEffect(() => {
        generateFocus();
    }, []);

    const generateFocus = async () => {
        setIsGenerating(true);
        // Simulate AI generation delay
        await new Promise(resolve => setTimeout(resolve, 1200));
        setFocusItems(generateMockFocus());
        setIsGenerating(false);
    };

    const toggleComplete = (id: string) => {
        setCompletedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const getPriorityStyle = (priority: FocusItem['priority']) => {
        switch (priority) {
            case 'urgent':
                return isDark
                    ? 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30'
                    : 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'high':
                return isDark
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                    : 'bg-emerald-50 text-emerald-600 border-emerald-100';
            default:
                return isDark
                    ? 'bg-emerald-500/10 text-emerald-500/60 border-emerald-500/10'
                    : 'bg-emerald-50/50 text-emerald-500 border-emerald-50';
        }
    };

    return (
        <div
            className={`
                rounded-2xl overflow-hidden
                ${isDark
                    ? 'bg-gradient-to-br from-emerald-500/10 via-[#0d0d0d] to-[#0d0d0d] border border-emerald-500/20'
                    : 'bg-white border border-emerald-100 shadow-lg shadow-emerald-100/50'}
            `}
            style={{
                boxShadow: isDark ? '0 0 40px rgba(16, 185, 129, 0.1), inset 0 0 20px rgba(16, 185, 129, 0.05)' : undefined
            }}
        >
            {/* Header */}
            <div className={`
                px-5 py-4 border-b flex items-center justify-between
                ${isDark ? 'border-emerald-500/10' : 'border-emerald-50'}
            `}>
                <div className="flex items-center gap-3">
                    <div
                        className={`
                            w-10 h-10 rounded-xl flex items-center justify-center
                            ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}
                        `}
                        style={{ boxShadow: isDark ? '0 0 15px rgba(16, 185, 129, 0.3)' : 'none' }}
                    >
                        <Sun className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    </div>
                    <div>
                        <h3
                            className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                        >
                            Morning Focus
                        </h3>
                        <p className={`text-xs ${isDark ? 'text-emerald-500/50' : 'text-emerald-600/70'}`}>
                            AI-picked priorities for today
                        </p>
                    </div>
                </div>
                <button
                    onClick={generateFocus}
                    disabled={isGenerating}
                    className={`
                        p-2 rounded-lg transition-all duration-200
                        ${isDark
                            ? 'hover:bg-emerald-500/10 text-emerald-400/50 hover:text-emerald-400'
                            : 'hover:bg-emerald-50 text-emerald-400 hover:text-emerald-600'}
                        ${isGenerating ? 'animate-spin' : ''}
                    `}
                >
                    <RefreshCw className="w-4 h-4" />
                </button>
            </div>

            {/* Focus Items */}
            <div className="p-4 space-y-3">
                {isGenerating ? (
                    <div className="py-8 text-center">
                        <Sparkles className={`w-6 h-6 mx-auto mb-3 animate-pulse ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
                        <p className={`text-sm ${isDark ? 'text-emerald-400/50' : 'text-emerald-600'}`}>
                            Analyzing your priorities...
                        </p>
                    </div>
                ) : (
                    focusItems.map((item, index) => (
                        <div
                            key={item.id}
                            className={`
                                p-4 rounded-xl border transition-all duration-200
                                ${completedIds.has(item.id) ? 'opacity-40' : ''}
                                ${isDark
                                    ? 'bg-emerald-500/[0.03] border-emerald-500/10 hover:border-emerald-500/20'
                                    : 'bg-white border-emerald-50 hover:border-emerald-100'}
                            `}
                        >
                            <div className="flex items-start gap-3">
                                {/* Number/Check */}
                                <button
                                    onClick={() => toggleComplete(item.id)}
                                    className={`
                                        w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
                                        transition-all duration-200 border
                                        ${completedIds.has(item.id)
                                            ? 'bg-emerald-500 border-emerald-500 text-white'
                                            : getPriorityStyle(item.priority)}
                                    `}
                                    style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                                >
                                    {completedIds.has(item.id) ? (
                                        <CheckCircle className="w-4 h-4" />
                                    ) : (
                                        <span className="text-xs font-bold">{index + 1}</span>
                                    )}
                                </button>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <h4
                                        className={`
                                            text-sm font-semibold mb-1
                                            ${completedIds.has(item.id) ? 'line-through' : ''}
                                            ${isDark ? 'text-white' : 'text-gray-900'}
                                        `}
                                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                                    >
                                        {item.title}
                                    </h4>
                                    <p className={`text-xs ${isDark ? 'text-emerald-500/40' : 'text-emerald-600/60'}`}>
                                        <Sparkles className="w-3 h-3 inline mr-1" />
                                        {item.reason}
                                    </p>
                                </div>

                                {/* Time estimate */}
                                <div className={`
                                    flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg
                                    ${isDark ? 'bg-emerald-500/10 text-emerald-400/60' : 'bg-emerald-50 text-emerald-600'}
                                `}>
                                    <Clock className="w-3 h-3" />
                                    {item.estimatedTime}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer */}
            <div className={`
                px-5 py-3 border-t
                ${isDark ? 'border-emerald-500/10' : 'border-emerald-50'}
            `}>
                <p className={`text-xs text-center ${isDark ? 'text-emerald-500/30' : 'text-emerald-400'}`}>
                    <Zap className="w-3 h-3 inline mr-1" />
                    Complete these 3 things and today is a win
                </p>
            </div>
        </div>
    );
};

export default MorningFocus;
