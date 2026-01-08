/**
 * Placeholder Pages
 * Quick placeholders for remaining Business OS pages
 */

import React from 'react';
import { FolderOpen, Scale, BarChart3, Radar, Globe, FileText, Send, Building2, Users, Construction } from 'lucide-react';

interface PlaceholderPageProps {
    isDark: boolean;
    icon: React.ElementType;
    title: string;
    description: string;
    features: string[];
}

const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ isDark, icon: Icon, title, description, features }) => (
    <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
            <div className={`
                w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center
                ${isDark ? 'bg-white/5' : 'bg-gray-100'}
            `}>
                <Icon className={`w-8 h-8 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
            </div>
            <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {title}
            </h1>
            <p className={`text-sm mb-8 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                {description}
            </p>
            <div className={`
                inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm
                ${isDark ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600'}
            `}>
                <Construction className="w-4 h-4" />
                Coming Soon
            </div>
            <div className="mt-8">
                <p className={`text-xs uppercase tracking-wider mb-3 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                    Planned Features
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                    {features.map((feature, idx) => (
                        <span
                            key={idx}
                            className={`px-3 py-1.5 rounded-lg text-xs ${isDark ? 'bg-white/5 text-white/60' : 'bg-gray-100 text-gray-600'}`}
                        >
                            {feature}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

// Assets Page
export const AssetsPage: React.FC<{ isDark: boolean }> = ({ isDark }) => (
    <PlaceholderPage
        isDark={isDark}
        icon={FolderOpen}
        title="Assets & Knowledge"
        description="Your business memory and knowledge base"
        features={['File uploads', 'AI summarization', 'Version history', 'Smart search']}
    />
);

// Decisions Page
export const DecisionsPage: React.FC<{ isDark: boolean }> = ({ isDark }) => (
    <PlaceholderPage
        isDark={isDark}
        icon={Scale}
        title="Decisions Log"
        description="Track and learn from past decisions"
        features={['Decision cards', 'Reasoning capture', 'Pattern detection', 'Retrospectives']}
    />
);

// Analytics Page
export const AnalyticsPage: React.FC<{ isDark: boolean }> = ({ isDark }) => (
    <PlaceholderPage
        isDark={isDark}
        icon={BarChart3}
        title="Analytics"
        description="Metrics and trends for your business"
        features={['Metric cards', 'Trend charts', 'AI insights', 'Forecasting']}
    />
);

// Competitors Page
export const CompetitorsPage: React.FC<{ isDark: boolean }> = ({ isDark }) => (
    <PlaceholderPage
        isDark={isDark}
        icon={Radar}
        title="Competitors"
        description="Market intelligence and competitive analysis"
        features={['Competitor profiles', 'Feature matrix', 'Pricing comparison', 'Positioning advice']}
    />
);

// Market Page
export const MarketPage: React.FC<{ isDark: boolean }> = ({ isDark }) => (
    <PlaceholderPage
        isDark={isDark}
        icon={Globe}
        title="Market Research"
        description="Industry trends and opportunities"
        features={['Trend tracking', 'Opportunity detection', 'Threat analysis', 'Market sizing']}
    />
);

// Reports Page
export const ReportsPage: React.FC<{ isDark: boolean }> = ({ isDark }) => (
    <PlaceholderPage
        isDark={isDark}
        icon={FileText}
        title="Reports"
        description="AI-generated business reports"
        features={['Investor updates', 'Weekly recaps', 'Board summaries', 'One-click generation']}
    />
);

// Updates Page
export const UpdatesPage: React.FC<{ isDark: boolean }> = ({ isDark }) => (
    <PlaceholderPage
        isDark={isDark}
        icon={Send}
        title="Updates"
        description="Stakeholder communications"
        features={['Team updates', 'Client newsletters', 'Launch announcements', 'Email drafts']}
    />
);

// Context Settings Page
export const ContextPage: React.FC<{ isDark: boolean }> = ({ isDark }) => (
    <PlaceholderPage
        isDark={isDark}
        icon={Building2}
        title="Business Context"
        description="Configure your business profile"
        features={['Company info', 'Goals & strategy', 'Industry settings', 'AI training data']}
    />
);

// Team Page
export const TeamPage: React.FC<{ isDark: boolean }> = ({ isDark }) => (
    <PlaceholderPage
        isDark={isDark}
        icon={Users}
        title="Team & Permissions"
        description="Manage team access"
        features={['Invite members', 'Role management', 'Activity logs', 'Access controls']}
    />
);
