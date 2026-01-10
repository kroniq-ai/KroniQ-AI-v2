/**
 * Roadmap Page — Product Agent
 * Feature roadmap with kanban-style view
 */

import React, { useState } from 'react';
import {
    Map,
    Plus,
    X,
    Clock,
    Play,
    CheckCircle,
    Calendar
} from 'lucide-react';

interface RoadmapPageProps {
    isDark: boolean;
}

interface Feature {
    id: string;
    title: string;
    description: string;
    status: 'planned' | 'in-progress' | 'completed';
    priority: 'high' | 'medium' | 'low';
    eta?: string;
}

const STATUS_CONFIG = {
    planned: { label: 'Planned', icon: Clock, color: { dark: 'border-yellow-500/30', light: 'border-yellow-200' } },
    'in-progress': { label: 'In Progress', icon: Play, color: { dark: 'border-blue-500/30', light: 'border-blue-200' } },
    completed: { label: 'Completed', icon: CheckCircle, color: { dark: 'border-emerald-500/30', light: 'border-emerald-200' } }
};

const PRIORITY_COLORS = {
    high: { dark: 'bg-red-500/20 text-red-400', light: 'bg-red-100 text-red-700' },
    medium: { dark: 'bg-yellow-500/20 text-yellow-400', light: 'bg-yellow-100 text-yellow-700' },
    low: { dark: 'bg-gray-500/20 text-gray-400', light: 'bg-gray-100 text-gray-600' }
};

export const RoadmapPage: React.FC<RoadmapPageProps> = ({ isDark }) => {
    const [features, setFeatures] = useState<Feature[]>([
        { id: '1', title: 'AI Chat Improvements', description: 'Better context awareness and response quality', status: 'in-progress', priority: 'high', eta: 'Jan 2026' },
        { id: '2', title: 'Team Collaboration', description: 'Invite team members and share workspaces', status: 'in-progress', priority: 'high', eta: 'Feb 2026' },
        { id: '3', title: 'Mobile App', description: 'iOS and Android native apps', status: 'planned', priority: 'high', eta: 'Q2 2026' },
        { id: '4', title: 'Integrations Hub', description: 'Connect with Slack, Zapier, and more', status: 'planned', priority: 'medium', eta: 'Q2 2026' },
        { id: '5', title: 'Advanced Analytics', description: 'Deeper business insights and reports', status: 'planned', priority: 'medium' },
        { id: '6', title: 'API Access', description: 'Public API for developers', status: 'planned', priority: 'low' },
        { id: '7', title: 'Dashboard Redesign', description: 'New modular agent dashboard', status: 'completed', priority: 'high' },
        { id: '8', title: 'Agent Customization', description: 'Create custom agents', status: 'completed', priority: 'medium' },
    ]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [newFeature, setNewFeature] = useState({ title: '', description: '', priority: 'medium' as const });

    const handleAddFeature = () => {
        if (newFeature.title) {
            setFeatures(prev => [{
                id: Date.now().toString(),
                title: newFeature.title,
                description: newFeature.description,
                status: 'planned',
                priority: newFeature.priority
            }, ...prev]);
            setNewFeature({ title: '', description: '', priority: 'medium' });
            setShowAddModal(false);
        }
    };

    const columns = ['planned', 'in-progress', 'completed'] as const;

    return (
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Map className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-emerald-500/60' : 'text-emerald-600/80'}`}>
                            Product Agent
                        </span>
                    </div>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Roadmap</h1>
                </div>
                <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-400">
                    <Plus className="w-4 h-4" /> Add Feature
                </button>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 grid grid-cols-3 gap-4 overflow-hidden">
                {columns.map(status => {
                    const config = STATUS_CONFIG[status];
                    const StatusIcon = config.icon;
                    const columnFeatures = features.filter(f => f.status === status);
                    return (
                        <div key={status} className="flex flex-col min-h-0">
                            <div className={`flex items-center gap-2 px-3 py-2 mb-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                                <StatusIcon className={`w-4 h-4 ${isDark ? 'text-white/40' : 'text-gray-500'}`} />
                                <span className={`text-sm font-medium ${isDark ? 'text-white/70' : 'text-gray-700'}`}>{config.label}</span>
                                <span className={`ml-auto text-xs font-medium ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{columnFeatures.length}</span>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                                {columnFeatures.map(feature => {
                                    const prioColor = PRIORITY_COLORS[feature.priority];
                                    return (
                                        <div
                                            key={feature.id}
                                            className={`p-4 rounded-2xl border-l-4 cursor-pointer transition-all hover:translate-x-1 ${isDark ? `bg-[#0c0c0c] border ${config.color.dark}` : `bg-white border ${config.color.light}`}`}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{feature.title}</h3>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${isDark ? prioColor.dark : prioColor.light}`}>
                                                    {feature.priority}
                                                </span>
                                            </div>
                                            <p className={`text-xs mb-2 ${isDark ? 'text-white/50' : 'text-gray-600'}`}>{feature.description}</p>
                                            {feature.eta && (
                                                <div className="flex items-center gap-1">
                                                    <Calendar className={`w-3 h-3 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
                                                    <span className={`text-[10px] ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{feature.eta}</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
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
                            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>New Feature</h2>
                            <button onClick={() => setShowAddModal(false)} className={`p-2 rounded-xl ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
                                <X className={`w-5 h-5 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
                            </button>
                        </div>
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>Title</label>
                                <input type="text" value={newFeature.title} onChange={(e) => setNewFeature(prev => ({ ...prev, title: e.target.value }))} placeholder="Feature name" className={`w-full px-4 py-3 rounded-xl text-sm border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-gray-50 border-gray-200 text-gray-900'}`} />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>Description</label>
                                <textarea value={newFeature.description} onChange={(e) => setNewFeature(prev => ({ ...prev, description: e.target.value }))} placeholder="What does this feature do?" rows={2} className={`w-full px-4 py-3 rounded-xl text-sm border outline-none resize-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-gray-50 border-gray-200 text-gray-900'}`} />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>Priority</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['high', 'medium', 'low'] as const).map(p => (
                                        <button key={p} onClick={() => setNewFeature(prev => ({ ...prev, priority: p }))} className={`py-2 px-3 rounded-xl text-xs font-medium capitalize ${newFeature.priority === p ? 'bg-emerald-500 text-white' : (isDark ? 'bg-white/5 text-white/50' : 'bg-gray-100 text-gray-500')}`}>
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button onClick={handleAddFeature} disabled={!newFeature.title} className={`w-full py-3 rounded-xl text-sm font-semibold ${newFeature.title ? 'bg-emerald-500 text-white hover:bg-emerald-400' : (isDark ? 'bg-white/5 text-white/20' : 'bg-gray-100 text-gray-300')}`}>
                            Add Feature
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoadmapPage;
