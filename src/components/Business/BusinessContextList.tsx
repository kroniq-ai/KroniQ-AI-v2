/**
 * Business Context List
 * Premium redesigned sidebar - clean, minimal, not cramped
 */

import React from 'react';
import { Briefcase, Plus, ChevronRight, Sparkles } from 'lucide-react';
import { useBusinessContext } from '../../contexts/BusinessContext';

// ===== TYPES =====

interface BusinessContextListProps {
    isDark: boolean;
    onCreateNew: () => void;
}

// ===== COMPONENT =====

export const BusinessContextList: React.FC<BusinessContextListProps> = ({
    isDark,
    onCreateNew,
}) => {
    const { contexts, activeContext, access, switchContext } = useBusinessContext();

    const canAddMore = access.contextLimit === -1 || contexts.length < access.contextLimit;

    // Handle context switch
    const handleSwitchContext = async (contextId: string) => {
        if (contextId !== activeContext?.id) {
            await switchContext(contextId);
        }
    };

    // Get stage color
    const getStageColor = (stage: string) => {
        switch (stage) {
            case 'idea': return isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600';
            case 'mvp': return isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-600';
            case 'growth': return isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600';
            case 'scaling': return isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600';
            default: return isDark ? 'bg-white/10 text-white/60' : 'bg-gray-100 text-gray-600';
        }
    };

    // Empty state - minimal and clean
    if (contexts.length === 0) {
        return (
            <div className="flex-1 flex flex-col p-4">
                {/* Empty Illustration */}
                <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
                    <div className={`
                        w-12 h-12 mb-4 rounded-2xl flex items-center justify-center
                        ${isDark ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/10' : 'bg-emerald-50'}
                    `}>
                        <Sparkles className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    </div>
                    <p className={`text-sm font-medium mb-1 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                        No contexts yet
                    </p>
                    <p className={`text-xs mb-5 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                        Create one to get started
                    </p>
                    <button
                        onClick={onCreateNew}
                        className={`
                            flex items-center gap-2 px-4 py-2.5 rounded-xl 
                            text-sm font-medium transition-all duration-200
                            bg-emerald-500 text-white 
                            hover:bg-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20
                        `}
                    >
                        <Plus className="w-4 h-4" />
                        New Context
                    </button>
                </div>

                {/* Plan indicator at bottom */}
                <div className={`
                    mt-auto pt-4 border-t
                    ${isDark ? 'border-white/5' : 'border-gray-100'}
                `}>
                    <div className="flex items-center justify-between">
                        <span className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                            Plan
                        </span>
                        <span className={`
                            text-[10px] font-medium px-2 py-0.5 rounded-full
                            ${access.planType === 'premium'
                                ? (isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600')
                                : access.planType === 'pro'
                                    ? (isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600')
                                    : (isDark ? 'bg-white/10 text-white/50' : 'bg-gray-100 text-gray-500')}
                        `}>
                            {access.planType.charAt(0).toUpperCase() + access.planType.slice(1)}
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // With contexts - clean list
    return (
        <div className="flex-1 flex flex-col overflow-hidden">
            {/* Context List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {contexts.map((context) => {
                    const isActive = context.id === activeContext?.id;

                    return (
                        <button
                            key={context.id}
                            onClick={() => handleSwitchContext(context.id)}
                            className={`
                                w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left 
                                transition-all duration-200 group
                                ${isActive
                                    ? (isDark
                                        ? 'bg-emerald-500/15 border border-emerald-500/30'
                                        : 'bg-emerald-50 border border-emerald-200')
                                    : (isDark
                                        ? 'hover:bg-white/5 border border-transparent'
                                        : 'hover:bg-gray-50 border border-transparent')}
                            `}
                        >
                            {/* Icon */}
                            <div className={`
                                w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0
                                ${isActive
                                    ? (isDark ? 'bg-emerald-500/30' : 'bg-emerald-100')
                                    : (isDark ? 'bg-white/5' : 'bg-gray-100')}
                            `}>
                                <Briefcase className={`w-4 h-4 ${isActive ? 'text-emerald-500' : (isDark ? 'text-white/50' : 'text-gray-500')}`} />
                            </div>

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {context.name}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${getStageColor(context.stage)}`}>
                                        {context.stage.charAt(0).toUpperCase() + context.stage.slice(1)}
                                    </span>
                                </div>
                            </div>

                            {/* Arrow */}
                            <ChevronRight className={`
                                w-4 h-4 flex-shrink-0 transition-all duration-200
                                ${isActive
                                    ? 'text-emerald-500 opacity-100'
                                    : (isDark ? 'text-white/20 group-hover:text-white/40' : 'text-gray-300 group-hover:text-gray-400')}
                            `} />
                        </button>
                    );
                })}
            </div>

            {/* Add Button - always visible */}
            {canAddMore && (
                <div className="p-3 pt-0">
                    <button
                        onClick={onCreateNew}
                        className={`
                            w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl
                            text-sm font-medium transition-all duration-200
                            ${isDark
                                ? 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10 border-dashed'
                                : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-gray-200 border-dashed'}
                        `}
                    >
                        <Plus className="w-4 h-4" />
                        Add Context
                    </button>
                </div>
            )}

            {/* Plan indicator */}
            <div className={`
                px-4 py-3 border-t
                ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-gray-100 bg-gray-50/50'}
            `}>
                <div className="flex items-center justify-between">
                    <span className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                        {access.contextLimit !== -1
                            ? `${contexts.length}/${access.contextLimit} contexts`
                            : 'Unlimited'
                        }
                    </span>
                    <span className={`
                        text-[10px] font-medium px-2 py-0.5 rounded-full
                        ${access.planType === 'premium'
                            ? (isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600')
                            : access.planType === 'pro'
                                ? (isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600')
                                : (isDark ? 'bg-white/10 text-white/50' : 'bg-gray-100 text-gray-500')}
                    `}>
                        {access.planType.charAt(0).toUpperCase() + access.planType.slice(1)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default BusinessContextList;
