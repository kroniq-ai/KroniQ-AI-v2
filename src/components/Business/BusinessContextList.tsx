/**
 * Business Context List
 * Sidebar component showing all business contexts
 */

import React from 'react';
import { Briefcase, MoreVertical, Check, Plus, Trash2, Edit, Lock } from 'lucide-react';
import { useBusinessContext } from '../../contexts/BusinessContext';
import { hasFullBusinessPanel } from '../../lib/pricingPlans';

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
    const { contexts, activeContext, access, switchContext, deleteContext } = useBusinessContext();
    const [menuOpen, setMenuOpen] = React.useState<string | null>(null);

    const canDelete = hasFullBusinessPanel(access.planType);
    const canAddMore = access.contextLimit === -1 || contexts.length < access.contextLimit;

    // Handle context switch
    const handleSwitchContext = async (contextId: string) => {
        if (contextId !== activeContext?.id) {
            await switchContext(contextId);
        }
    };

    // Handle delete
    const handleDelete = async (contextId: string) => {
        if (!canDelete) return;
        setMenuOpen(null);
        await deleteContext(contextId);
    };

    if (contexts.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className={`
          w-14 h-14 mb-4 rounded-xl flex items-center justify-center
          ${isDark ? 'bg-white/5' : 'bg-gray-100'}
        `}>
                    <Briefcase className={`w-7 h-7 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
                </div>
                <p className={`text-sm mb-4 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                    No business contexts yet.
                    <br />Create one to get started.
                </p>
                <button
                    onClick={onCreateNew}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Create Context
                </button>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto p-2">
            {/* Context List */}
            <div className="space-y-1">
                {contexts.map((context) => {
                    const isActive = context.id === activeContext?.id;

                    return (
                        <div
                            key={context.id}
                            className="relative"
                        >
                            <button
                                onClick={() => handleSwitchContext(context.id)}
                                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all
                  ${isActive
                                        ? (isDark
                                            ? 'bg-emerald-500/20 border border-emerald-500/30'
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
                                    <p className={`text-xs truncate ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                                        {context.industry || 'No industry set'}
                                    </p>
                                </div>

                                {/* Active Indicator */}
                                {isActive && (
                                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                                        <Check className="w-3 h-3 text-white" />
                                    </div>
                                )}

                                {/* Menu Button */}
                                {!isActive && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setMenuOpen(menuOpen === context.id ? null : context.id);
                                        }}
                                        className={`p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity
                      ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-200'}
                    `}
                                        style={{ opacity: menuOpen === context.id ? 1 : undefined }}
                                    >
                                        <MoreVertical className={`w-4 h-4 ${isDark ? 'text-white/50' : 'text-gray-500'}`} />
                                    </button>
                                )}
                            </button>

                            {/* Dropdown Menu */}
                            {menuOpen === context.id && (
                                <div className={`
                  absolute right-0 top-full mt-1 w-40 rounded-xl overflow-hidden shadow-xl z-10
                  ${isDark ? 'bg-[#1a1a1a] border border-white/10' : 'bg-white border border-gray-200'}
                `}>
                                    <button
                                        onClick={() => {
                                            setMenuOpen(null);
                                            // Open edit modal - would need to pass context to parent
                                        }}
                                        className={`
                      w-full flex items-center gap-2 px-4 py-3 text-sm
                      ${isDark ? 'text-white/80 hover:bg-white/5' : 'text-gray-700 hover:bg-gray-50'}
                    `}
                                    >
                                        <Edit className="w-4 h-4" />
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => handleDelete(context.id)}
                                        disabled={!canDelete}
                                        className={`
                      w-full flex items-center gap-2 px-4 py-3 text-sm
                      ${canDelete
                                                ? 'text-red-400 hover:bg-red-500/10'
                                                : (isDark ? 'text-white/30 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed')}
                    `}
                                    >
                                        {canDelete ? (
                                            <>
                                                <Trash2 className="w-4 h-4" />
                                                Delete
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="w-4 h-4" />
                                                Premium only
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Add More Button */}
            {canAddMore ? (
                <button
                    onClick={onCreateNew}
                    className={`
            w-full mt-3 flex items-center justify-center gap-2 px-4 py-3 rounded-xl
            text-sm font-medium transition-all
            ${isDark
                            ? 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10 border-dashed'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 border-dashed'}
          `}
                >
                    <Plus className="w-4 h-4" />
                    Add Business
                </button>
            ) : (
                <div className={`
          mt-3 p-3 rounded-xl text-center
          ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}
        `}>
                    <Lock className={`w-4 h-4 mx-auto mb-1 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
                    <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                        Upgrade to Premium for
                        <br />multiple business contexts
                    </p>
                </div>
            )}

            {/* Plan Badge */}
            <div className={`
        mt-4 mx-2 p-3 rounded-xl
        ${isDark ? 'bg-white/5' : 'bg-gray-50'}
      `}>
                <div className="flex items-center justify-between">
                    <span className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Current Plan</span>
                    <span className={`
            text-xs font-medium px-2 py-0.5 rounded-full
            ${access.planType === 'premium'
                            ? (isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700')
                            : (isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700')}
          `}>
                        {access.planType.charAt(0).toUpperCase() + access.planType.slice(1)}
                    </span>
                </div>
                {access.contextLimit !== -1 && (
                    <p className={`text-xs mt-1 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                        {contexts.length} / {access.contextLimit} contexts used
                    </p>
                )}
            </div>
        </div>
    );
};

export default BusinessContextList;
