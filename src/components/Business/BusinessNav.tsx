/**
 * Business Navigation Sidebar
 * Premium navigation for the AI COO Business Operating System
 */

import React from 'react';
import {
    LayoutDashboard,
    Target,
    CheckSquare,
    FolderOpen,
    Scale,
    BarChart3,
    Radar,
    Globe,
    FileText,
    Send,
    Building2,
    Users,
    ChevronRight,
    Sparkles,
    ArrowLeft
} from 'lucide-react';

// ===== TYPES =====

export type BusinessPage =
    | 'overview'
    | 'goals'
    | 'tasks'
    | 'assets'
    | 'decisions'
    | 'analytics'
    | 'competitors'
    | 'market'
    | 'reports'
    | 'updates'
    | 'context'
    | 'team';

interface NavItem {
    id: BusinessPage;
    label: string;
    icon: React.ElementType;
    description?: string;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

interface BusinessNavProps {
    isDark: boolean;
    activePage: BusinessPage;
    onPageChange: (page: BusinessPage) => void;
    contextName?: string;
    onBack?: () => void;
}

// ===== NAVIGATION STRUCTURE =====

const NAV_SECTIONS: NavSection[] = [
    {
        title: 'Workspace',
        items: [
            { id: 'overview', label: 'Overview', icon: LayoutDashboard, description: 'Command center' },
            { id: 'goals', label: 'Goals', icon: Target, description: 'OKRs & targets' },
            { id: 'tasks', label: 'Tasks', icon: CheckSquare, description: 'Execution' },
            { id: 'assets', label: 'Assets', icon: FolderOpen, description: 'Knowledge base' },
            { id: 'decisions', label: 'Decisions', icon: Scale, description: 'Decision log' },
        ],
    },
    {
        title: 'Intelligence',
        items: [
            { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Metrics & trends' },
            { id: 'competitors', label: 'Competitors', icon: Radar, description: 'Market intel' },
            { id: 'market', label: 'Market', icon: Globe, description: 'Research' },
        ],
    },
    {
        title: 'Output',
        items: [
            { id: 'reports', label: 'Reports', icon: FileText, description: 'Generate reports' },
            { id: 'updates', label: 'Updates', icon: Send, description: 'Stakeholder comms' },
        ],
    },
    {
        title: 'Settings',
        items: [
            { id: 'context', label: 'Business', icon: Building2, description: 'Context settings' },
            { id: 'team', label: 'Team', icon: Users, description: 'Permissions' },
        ],
    },
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
            w-56 flex-shrink-0 flex flex-col h-full
            border-r transition-colors duration-200
            ${isDark ? 'bg-[#0c0c0c] border-white/5' : 'bg-white border-gray-100'}
        `}>
            {/* Context Header - pt-12 leaves room for main sidebar expand button */}
            <div className={`
                px-4 pt-12 pb-4 border-b
                ${isDark ? 'border-white/5' : 'border-gray-100'}
            `}>
                {/* Back Button */}
                {onBack && (
                    <button
                        onClick={onBack}
                        className={`
                            flex items-center gap-1.5 text-xs mb-3
                            ${isDark ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-700'}
                        `}
                    >
                        <ArrowLeft className="w-3 h-3" />
                        Super KroniQ
                    </button>
                )}
                <div className="flex items-center gap-3">
                    <div className={`
                        w-9 h-9 rounded-xl flex items-center justify-center
                        bg-gradient-to-br from-emerald-500/20 to-teal-500/10
                    `}>
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {contextName || 'No Context'}
                        </p>
                        <p className={`text-[10px] ${isDark ? 'text-emerald-400/70' : 'text-emerald-600'}`}>
                            AI COO Active
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-3 px-2">
                {NAV_SECTIONS.map((section, sectionIdx) => (
                    <div key={section.title} className={sectionIdx > 0 ? 'mt-5' : ''}>
                        {/* Section Title */}
                        <p className={`
                            px-3 mb-1.5 text-[10px] font-medium uppercase tracking-wider
                            ${isDark ? 'text-white/25' : 'text-gray-400'}
                        `}>
                            {section.title}
                        </p>

                        {/* Section Items */}
                        <div className="space-y-0.5">
                            {section.items.map((item) => {
                                const isActive = activePage === item.id;
                                const Icon = item.icon;

                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => onPageChange(item.id)}
                                        title={item.description}
                                        className={`
                                            w-full flex items-center gap-2.5 px-3 py-2 rounded-lg
                                            text-left transition-all duration-150 group relative
                                            ${isActive
                                                ? (isDark
                                                    ? 'bg-emerald-500/15 text-emerald-400'
                                                    : 'bg-emerald-50 text-emerald-700')
                                                : (isDark
                                                    ? 'text-white/60 hover:text-white hover:bg-white/5'
                                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50')}
                                        `}
                                    >
                                        {/* Active glow */}
                                        {isActive && (
                                            <div className={`
                                                absolute inset-0 rounded-lg opacity-50
                                                ${isDark ? 'shadow-[inset_0_0_20px_rgba(16,185,129,0.15)]' : ''}
                                            `} />
                                        )}

                                        {/* Icon */}
                                        <Icon className={`
                                            w-4 h-4 flex-shrink-0 relative z-10
                                            ${isActive ? '' : 'opacity-70 group-hover:opacity-100'}
                                        `} />

                                        {/* Label */}
                                        <span className="text-sm font-medium relative z-10 flex-1">
                                            {item.label}
                                        </span>

                                        {/* Arrow for active */}
                                        {isActive && (
                                            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            {/* Bottom Badge */}
            <div className={`
                px-3 py-3 border-t
                ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-gray-100 bg-gray-50/50'}
            `}>
                <div className="flex items-center justify-between">
                    <span className={`text-[10px] ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                        Business OS
                    </span>
                    <span className={`
                        text-[10px] font-medium px-2 py-0.5 rounded-full
                        ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}
                    `}>
                        Beta
                    </span>
                </div>
            </div>
        </div>
    );
};

export default BusinessNav;
