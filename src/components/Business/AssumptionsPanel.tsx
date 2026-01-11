/**
 * AssumptionsPanel - Shows AI transparency & accountability
 * Displays what assumptions the AI made and how confident it is
 * Part of the "Assumption → Evidence Loop" system
 */

import React, { useState } from 'react';
import {
    AlertCircle,
    ChevronDown,
    ChevronUp,
    Lightbulb,
    HelpCircle,
    ThumbsUp,
    ThumbsDown,
    ExternalLink,
    Shield
} from 'lucide-react';

interface Assumption {
    id: string;
    text: string;
    confidence: 'high' | 'medium' | 'low';
    source?: string;
    isValidated?: boolean;
}

interface AssumptionsPanelProps {
    isDark: boolean;
    assumptions: Assumption[];
    overallConfidence?: number; // 0-100
    onFeedback?: (assumptionId: string, isCorrect: boolean) => void;
    onRequestValidation?: (assumptionId: string) => void;
    compact?: boolean;
}

const CONFIDENCE_CONFIG = {
    high: {
        label: 'High confidence',
        color: { dark: 'text-emerald-400 bg-emerald-500/20', light: 'text-emerald-700 bg-emerald-100' },
        description: 'Based on recent data'
    },
    medium: {
        label: 'Medium confidence',
        color: { dark: 'text-yellow-400 bg-yellow-500/20', light: 'text-yellow-700 bg-yellow-100' },
        description: 'Some uncertainty'
    },
    low: {
        label: 'Low confidence',
        color: { dark: 'text-orange-400 bg-orange-500/20', light: 'text-orange-700 bg-orange-100' },
        description: 'Needs validation'
    }
};

export const AssumptionsPanel: React.FC<AssumptionsPanelProps> = ({
    isDark,
    assumptions,
    overallConfidence = 75,
    onFeedback,
    onRequestValidation,
    compact = false
}) => {
    const [isExpanded, setIsExpanded] = useState(!compact);
    const [feedbackGiven, setFeedbackGiven] = useState<Record<string, 'correct' | 'incorrect'>>({});

    const handleFeedback = (id: string, isCorrect: boolean) => {
        setFeedbackGiven(prev => ({ ...prev, [id]: isCorrect ? 'correct' : 'incorrect' }));
        onFeedback?.(id, isCorrect);
    };

    // Calculate confidence color
    const getConfidenceColor = (value: number) => {
        if (value >= 80) return isDark ? 'text-emerald-400' : 'text-emerald-600';
        if (value >= 50) return isDark ? 'text-yellow-400' : 'text-yellow-600';
        return isDark ? 'text-orange-400' : 'text-orange-600';
    };

    const getConfidenceBarColor = (value: number) => {
        if (value >= 80) return 'bg-emerald-500';
        if (value >= 50) return 'bg-yellow-500';
        return 'bg-orange-500';
    };

    if (assumptions.length === 0) return null;

    return (
        <div className={`rounded-xl border transition-all duration-300 ${isDark
                ? 'bg-[#0d0d0d]/50 border-white/5'
                : 'bg-gray-50/50 border-gray-100'
            }`}>
            {/* Header - Always visible */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`w-full px-4 py-3 flex items-center justify-between ${isExpanded ? 'border-b' : ''
                    } ${isDark ? 'border-white/5' : 'border-gray-100'}`}
            >
                <div className="flex items-center gap-2">
                    <Shield className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                    <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-purple-400/70' : 'text-purple-700'
                        }`}>
                        AI Transparency
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-white/5 text-white/40' : 'bg-gray-100 text-gray-500'
                        }`}>
                        {assumptions.length} assumption{assumptions.length > 1 ? 's' : ''}
                    </span>
                </div>
                <div className="flex items-center gap-3">
                    {/* Confidence meter */}
                    <div className="flex items-center gap-2">
                        <span className={`text-xs ${getConfidenceColor(overallConfidence)}`}>
                            {overallConfidence}%
                        </span>
                        <div className={`w-16 h-1.5 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${getConfidenceBarColor(overallConfidence)}`}
                                style={{ width: `${overallConfidence}%` }}
                            />
                        </div>
                    </div>
                    {isExpanded ? (
                        <ChevronUp className={`w-4 h-4 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
                    ) : (
                        <ChevronDown className={`w-4 h-4 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
                    )}
                </div>
            </button>

            {/* Expanded content */}
            {isExpanded && (
                <div className="p-4 space-y-3">
                    <p className={`text-xs mb-3 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                        <Lightbulb className="w-3 h-3 inline mr-1" />
                        These assumptions were made to generate this output. Help improve accuracy by validating them.
                    </p>

                    {assumptions.map(assumption => {
                        const config = CONFIDENCE_CONFIG[assumption.confidence];
                        const feedback = feedbackGiven[assumption.id];

                        return (
                            <div
                                key={assumption.id}
                                className={`p-3 rounded-xl ${feedback === 'correct'
                                        ? (isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-200')
                                        : feedback === 'incorrect'
                                            ? (isDark ? 'bg-red-500/10 border border-red-500/20' : 'bg-red-50 border border-red-200')
                                            : (isDark ? 'bg-white/5 border border-white/5' : 'bg-white border border-gray-100')
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${assumption.confidence === 'high'
                                            ? (isDark ? 'text-emerald-400' : 'text-emerald-600')
                                            : assumption.confidence === 'medium'
                                                ? (isDark ? 'text-yellow-400' : 'text-yellow-600')
                                                : (isDark ? 'text-orange-400' : 'text-orange-600')
                                        }`} />
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                                            {assumption.text}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isDark ? config.color.dark : config.color.light}`}>
                                                {config.label}
                                            </span>
                                            {assumption.source && (
                                                <button className={`text-[10px] flex items-center gap-1 ${isDark ? 'text-white/30 hover:text-white/50' : 'text-gray-400 hover:text-gray-600'
                                                    }`}>
                                                    <ExternalLink className="w-3 h-3" />
                                                    {assumption.source}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Feedback buttons */}
                                    {!feedback && (
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleFeedback(assumption.id, true)}
                                                className={`p-1.5 rounded-lg transition-colors ${isDark
                                                        ? 'hover:bg-emerald-500/20 text-white/30 hover:text-emerald-400'
                                                        : 'hover:bg-emerald-100 text-gray-400 hover:text-emerald-600'
                                                    }`}
                                                title="This is correct"
                                            >
                                                <ThumbsUp className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleFeedback(assumption.id, false)}
                                                className={`p-1.5 rounded-lg transition-colors ${isDark
                                                        ? 'hover:bg-red-500/20 text-white/30 hover:text-red-400'
                                                        : 'hover:bg-red-100 text-gray-400 hover:text-red-600'
                                                    }`}
                                                title="This is incorrect"
                                            >
                                                <ThumbsDown className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    )}
                                    {feedback && (
                                        <span className={`text-xs ${feedback === 'correct'
                                                ? (isDark ? 'text-emerald-400' : 'text-emerald-600')
                                                : (isDark ? 'text-red-400' : 'text-red-600')
                                            }`}>
                                            {feedback === 'correct' ? '✓ Confirmed' : '✗ Incorrect'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Help improve */}
                    <div className={`flex items-center justify-center gap-2 pt-2 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                        <HelpCircle className="w-3 h-3" />
                        <span className="text-xs">Your feedback improves future suggestions</span>
                    </div>
                </div>
            )}
        </div>
    );
};

// ===== WRAPPER FOR AI OUTPUTS =====

interface AIOutputWithAssumptionsProps {
    isDark: boolean;
    children: React.ReactNode;
    assumptions?: Assumption[];
    confidence?: number;
    title?: string;
}

export const AIOutputWithAssumptions: React.FC<AIOutputWithAssumptionsProps> = ({
    isDark,
    children,
    assumptions = [],
    confidence = 75,
    title
}) => {
    return (
        <div className="space-y-3">
            {title && (
                <p className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-emerald-500/50' : 'text-emerald-600/70'
                    }`}>
                    {title}
                </p>
            )}
            {children}
            {assumptions.length > 0 && (
                <AssumptionsPanel
                    isDark={isDark}
                    assumptions={assumptions}
                    overallConfidence={confidence}
                    compact
                />
            )}
        </div>
    );
};

export default AssumptionsPanel;
