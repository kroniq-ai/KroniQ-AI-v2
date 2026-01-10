/**
 * Business Navigation Sidebar (Simplified)
 * Based on research: Only 6 core pages founders actually need
 * Premium green design
 */

import React from 'react';
import {
    LayoutDashboard,
    Target,
    CheckSquare,
    Scale,
    DollarSign,
    Settings,
    ChevronRight,
    Sparkles,
    ArrowLeft
} from 'lucide-react';

// ===== TYPES =====

export type BusinessPage =
    | 'overview'
    | 'goals'
    | 'tasks'
    | 'decisions'
    | 'runway'
    | 'settings';

interface NavItem {
    id: BusinessPage;
    label: string;
    icon: React.ElementType;
    description?: string;
}

interface BusinessNavProps {
    isDark: boolean;
    activePage: BusinessPage;
    onPageChange: (page: BusinessPage) => void;
    contextName?: string;
    onBack?: () => void;
}

// ===== SIMPLIFIED NAVIGATION (6 Core Pages) =====
// Removed: Assets, Analytics, Competitors, Market, Reports, Updates, Team

const NAV_ITEMS: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, description: 'Morning focus' },
    { id: 'goals', label: 'Goals', icon: Target, description: 'OKRs (max 3)' },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare, description: 'Execution' },
    { id: 'decisions', label: 'Decisions', icon: Scale, description: 'Decision log' },
    { id: 'runway', label: 'Runway', icon: DollarSign, description: 'Cash + Burn' },
    { id: 'settings', label: 'Settings', icon: Settings, description: 'Business context' },
];

// ===== COMPONENT =====

export const BusinessNav: React.FC<BusinessNavProps> = ({
    isDark,
    activePage,
    onPageChange,
    contextName,
    onBack,
}) => {
    return (
        <div className={`
            w-56 flex-shrink-0 flex flex-col h-full relative overflow-hidden
            border-r transition-colors duration-300
            ${isDark ? 'bg-[#080808] border-emerald-500/10' : 'bg-white border-gray-100'}
        `}>
            {/* Subtle side glow */}
            <div className={`
                absolute top-0 right-0 w-px h-full pointer-events-none
                ${isDark ? 'bg-gradient-to-b from-emerald-500/20 via-emerald-500/5 to-transparent' : ''}
            `} />

            {/* Context Header */}
            <div className={`
                px-4 pt-4 pb-4 border-b
                ${isDark ? 'border-emerald-500/10' : 'border-gray-100'}
            `}>
                {/* Back Button */}
                {onBack && (
                    <button
                        onClick={onBack}
                        className={`
                            flex items-center gap-1.5 text-xs mb-3 font-medium
                            transition-all duration-200
                            ${isDark ? 'text-emerald-500/60 hover:text-emerald-400' : 'text-gray-400 hover:text-gray-700'}
                        `}
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                    >
                        <ArrowLeft className="w-3 h-3" />
                        Super KroniQ
                    </button>
                )}

                <div className="flex items-center gap-3">
                    <div
                        className={`
                            w-10 h-10 rounded-xl flex items-center justify-center
                            bg-gradient-to-br from-emerald-500/20 to-emerald-600/10
                            transition-all duration-300
                        `}
                        style={{
                            boxShadow: isDark ? '0 0 20px rgba(16, 185, 129, 0.2)' : 'none'
                        }}
                    >
                        <Sparkles className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}
                            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                            {contextName || 'No Context'}
                        </p>
                        <p className="text-[10px] text-emerald-500 font-medium">
                            AI COO Active
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation - Simplified Single List */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
                <p className={`
                    px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest
                    ${isDark ? 'text-emerald-500/30' : 'text-gray-400'}
                `}
                    style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    Core
                </p>

                <div className="space-y-1">
                    {NAV_ITEMS.map((item) => {
                        const isActive = activePage === item.id;
                        const Icon = item.icon;
                        const isSettings = item.id === 'settings';

                        return (
                            <button
                                key={item.id}
                                onClick={() => onPageChange(item.id)}
                                title={item.description}
                                className={`
                                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                                    text-left transition-all duration-200 group relative
                                    ${isSettings ? 'mt-4 pt-4 border-t ' + (isDark ? 'border-emerald-500/10' : 'border-gray-100') : ''}
                                    ${isActive
                                        ? 'bg-emerald-500/15 text-emerald-400'
                                        : (isDark
                                            ? 'text-white/50 hover:text-emerald-400 hover:bg-emerald-500/5'
                                            : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50')}
                                `}
                                style={{
                                    boxShadow: isActive && isDark
                                        ? 'inset 0 0 20px rgba(16, 185, 129, 0.1), 0 0 10px rgba(16, 185, 129, 0.05)'
                                        : 'none'
                                }}
                            >
                                {/* Icon */}
                                <Icon className={`
                                    w-4 h-4 flex-shrink-0 transition-colors duration-200
                                    ${isActive ? 'text-emerald-400' : 'group-hover:text-emerald-400'}
                                `} />

                                {/* Label */}
                                <span className="text-sm font-medium flex-1"
                                    style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                    {item.label}
                                </span>

                                {/* Arrow for active */}
                                {isActive && (
                                    <ChevronRight className="w-3.5 h-3.5 text-emerald-500/50" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* Bottom Badge */}
            <div className={`
                px-4 py-3 border-t
                ${isDark ? 'border-emerald-500/10 bg-emerald-500/[0.02]' : 'border-gray-100 bg-gray-50/50'}
            `}>
                <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-medium ${isDark ? 'text-white/20' : 'text-gray-400'}`}
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        Business OS
                    </span>
                    <span
                        className="text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-400"
                        style={{
                            boxShadow: isDark ? '0 0 10px rgba(16, 185, 129, 0.2)' : 'none'
                        }}
                    >
                        v1.0
                    </span>
                </div>
            </div>
        </div>
    );
};

export default BusinessNav;
