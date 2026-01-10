/**
 * Insights Page — Customer Agent
 * User research and learnings
 */

import React, { useState } from 'react';
import {
    Lightbulb,
    Plus,
    Tag,
    TrendingUp,
    Users,
    X,
    Star,
    AlertCircle,
    CheckCircle
} from 'lucide-react';

interface InsightsPageProps {
    isDark: boolean;
}

interface Insight {
    id: string;
    title: string;
    description: string;
    type: 'behavior' | 'pain-point' | 'opportunity' | 'feature-request';
    priority: 'high' | 'medium' | 'low';
    source: string;
    date: Date;
}

const TYPE_CONFIG = {
    'behavior': { label: 'Behavior', color: { dark: 'bg-blue-500/20 text-blue-400', light: 'bg-blue-100 text-blue-700' } },
    'pain-point': { label: 'Pain Point', color: { dark: 'bg-red-500/20 text-red-400', light: 'bg-red-100 text-red-700' } },
    'opportunity': { label: 'Opportunity', color: { dark: 'bg-emerald-500/20 text-emerald-400', light: 'bg-emerald-100 text-emerald-700' } },
    'feature-request': { label: 'Feature Request', color: { dark: 'bg-purple-500/20 text-purple-400', light: 'bg-purple-100 text-purple-700' } },
};

export const InsightsPage: React.FC<InsightsPageProps> = ({ isDark }) => {
    const [insights, setInsights] = useState<Insight[]>([
        { id: '1', title: 'Users prefer quick onboarding', description: 'Most users drop off if onboarding takes more than 2 minutes', type: 'behavior', priority: 'high', source: 'User interviews', date: new Date() },
        { id: '2', title: 'Confusion with pricing tiers', description: 'Users often unsure which plan fits their needs', type: 'pain-point', priority: 'high', source: 'Support tickets', date: new Date(Date.now() - 86400000 * 2) },
        { id: '3', title: 'Mobile app demand', description: '40% of users asked about mobile app availability', type: 'feature-request', priority: 'medium', source: 'Surveys', date: new Date(Date.now() - 86400000 * 5) },
        { id: '4', title: 'Integration with Slack', description: 'Power users want notifications in Slack', type: 'opportunity', priority: 'medium', source: 'Customer calls', date: new Date(Date.now() - 86400000 * 7) },
    ]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [newInsight, setNewInsight] = useState({ title: '', description: '', type: 'behavior' as const, priority: 'medium' as const, source: '' });

    const handleAddInsight = () => {
        if (newInsight.title) {
            setInsights(prev => [{
                id: Date.now().toString(),
                ...newInsight,
                date: new Date()
            }, ...prev]);
            setNewInsight({ title: '', description: '', type: 'behavior', priority: 'medium', source: '' });
            setShowAddModal(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Lightbulb className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-emerald-500/60' : 'text-emerald-600/80'}`}>
                            Customer Agent
                        </span>
                    </div>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Insights</h1>
                </div>
                <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-400">
                    <Plus className="w-4 h-4" /> Add Insight
                </button>
            </div>

            {/* Type Filter Pills */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {Object.entries(TYPE_CONFIG).map(([type, config]) => (
                    <button key={type} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${isDark ? config.color.dark : config.color.light}`}>
                        {config.label}
                    </button>
                ))}
            </div>

            {/* Insights List */}
            <div className="flex-1 space-y-3">
                {insights.map(insight => {
                    const typeConfig = TYPE_CONFIG[insight.type];
                    return (
                        <div key={insight.id} className={`p-5 rounded-2xl ${isDark ? 'bg-[#0c0c0c] border border-white/5 hover:border-emerald-500/30' : 'bg-white border border-gray-200 hover:border-emerald-300'} transition-colors cursor-pointer`}>
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${isDark ? typeConfig.color.dark : typeConfig.color.light}`}>
                                        {typeConfig.label}
                                    </span>
                                    {insight.priority === 'high' && (
                                        <Star className={`w-3.5 h-3.5 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />
                                    )}
                                </div>
                                <span className={`text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                                    {insight.source}
                                </span>
                            </div>
                            <h3 className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{insight.title}</h3>
                            <p className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-600'}`}>{insight.description}</p>
                        </div>
                    );
                })}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
                    <div className={`relative w-full max-w-md p-6 rounded-3xl ${isDark ? 'bg-[#0c0c0c]' : 'bg-white'}`}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>New Insight</h2>
                            <button onClick={() => setShowAddModal(false)} className={`p-2 rounded-xl ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
                                <X className={`w-5 h-5 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
                            </button>
                        </div>
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>Title</label>
                                <input type="text" value={newInsight.title} onChange={(e) => setNewInsight(prev => ({ ...prev, title: e.target.value }))} placeholder="What did you learn?" className={`w-full px-4 py-3 rounded-xl text-sm border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-gray-50 border-gray-200 text-gray-900'}`} />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>Description</label>
                                <textarea value={newInsight.description} onChange={(e) => setNewInsight(prev => ({ ...prev, description: e.target.value }))} placeholder="Details..." rows={2} className={`w-full px-4 py-3 rounded-xl text-sm border outline-none resize-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-gray-50 border-gray-200 text-gray-900'}`} />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {(Object.keys(TYPE_CONFIG) as Array<keyof typeof TYPE_CONFIG>).map(type => (
                                        <button key={type} onClick={() => setNewInsight(prev => ({ ...prev, type }))} className={`py-2 px-3 rounded-xl text-xs font-medium ${newInsight.type === type ? 'bg-emerald-500 text-white' : (isDark ? 'bg-white/5 text-white/50' : 'bg-gray-100 text-gray-500')}`}>
                                            {TYPE_CONFIG[type].label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>Source</label>
                                <input type="text" value={newInsight.source} onChange={(e) => setNewInsight(prev => ({ ...prev, source: e.target.value }))} placeholder="e.g., User interviews, Surveys..." className={`w-full px-4 py-3 rounded-xl text-sm border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-gray-50 border-gray-200 text-gray-900'}`} />
                            </div>
                        </div>
                        <button onClick={handleAddInsight} disabled={!newInsight.title} className={`w-full py-3 rounded-xl text-sm font-semibold ${newInsight.title ? 'bg-emerald-500 text-white hover:bg-emerald-400' : (isDark ? 'bg-white/5 text-white/20' : 'bg-gray-100 text-gray-300')}`}>
                            Add Insight
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InsightsPage;
