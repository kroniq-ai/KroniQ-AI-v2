/**
 * Goals Page — Shared across all agents
 * OKRs and goal tracking
 */

import React, { useState } from 'react';
import {
    Target,
    Plus,
    X,
    TrendingUp,
    CheckCircle,
    Clock
} from 'lucide-react';

interface GoalsPageProps {
    isDark: boolean;
    agentType?: string;
}

interface Goal {
    id: string;
    title: string;
    description: string;
    progress: number;
    target: string;
    current: string;
    status: 'on-track' | 'at-risk' | 'behind';
    agent?: string;
}

const STATUS_CONFIG = {
    'on-track': { label: 'On Track', color: { dark: 'bg-emerald-500/20 text-emerald-400', light: 'bg-emerald-100 text-emerald-700' } },
    'at-risk': { label: 'At Risk', color: { dark: 'bg-yellow-500/20 text-yellow-400', light: 'bg-yellow-100 text-yellow-700' } },
    'behind': { label: 'Behind', color: { dark: 'bg-red-500/20 text-red-400', light: 'bg-red-100 text-red-700' } }
};

export const GoalsPage: React.FC<GoalsPageProps> = ({ isDark, agentType }) => {
    const [goals, setGoals] = useState<Goal[]>([
        { id: '1', title: 'Increase MRR', description: 'Grow monthly recurring revenue', progress: 75, target: '$10,000', current: '$7,500', status: 'on-track', agent: 'finance' },
        { id: '2', title: 'Reduce CAC', description: 'Lower customer acquisition cost', progress: 60, target: '$30', current: '$42', status: 'at-risk', agent: 'marketing' },
        { id: '3', title: 'Improve NPS', description: 'Net promoter score target', progress: 85, target: '50', current: '42', status: 'on-track', agent: 'customer' },
        { id: '4', title: 'Brand Awareness', description: 'Social media followers', progress: 40, target: '10,000', current: '4,000', status: 'behind', agent: 'branding' },
        { id: '5', title: 'Ship v2.0', description: 'Major product release', progress: 90, target: 'Q1 2026', current: 'On schedule', status: 'on-track', agent: 'product' },
    ]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [newGoal, setNewGoal] = useState({ title: '', description: '', target: '' });

    // Filter by agent if specified
    const filteredGoals = agentType && agentType !== 'ceo'
        ? goals.filter(g => g.agent === agentType)
        : goals;

    const onTrackCount = filteredGoals.filter(g => g.status === 'on-track').length;
    const totalProgress = Math.round(filteredGoals.reduce((sum, g) => sum + g.progress, 0) / filteredGoals.length);

    const handleAddGoal = () => {
        if (newGoal.title) {
            setGoals(prev => [{
                id: Date.now().toString(),
                title: newGoal.title,
                description: newGoal.description,
                progress: 0,
                target: newGoal.target,
                current: '0',
                status: 'on-track',
                agent: agentType
            }, ...prev]);
            setNewGoal({ title: '', description: '', target: '' });
            setShowAddModal(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Target className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-emerald-500/60' : 'text-emerald-600/80'}`}>
                            {agentType ? agentType.charAt(0).toUpperCase() + agentType.slice(1) : 'All'} Goals
                        </span>
                    </div>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Goals</h1>
                </div>
                <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-400">
                    <Plus className="w-4 h-4" /> Add Goal
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className={`p-4 rounded-2xl ${isDark ? 'bg-[#0c0c0c] border border-emerald-500/20' : 'bg-white border border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                        <CheckCircle className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={`text-xs font-medium ${isDark ? 'text-white/50' : 'text-gray-500'}`}>On Track</span>
                    </div>
                    <p className={`text-xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{onTrackCount}/{filteredGoals.length}</p>
                </div>
                <div className={`p-4 rounded-2xl ${isDark ? 'bg-[#0c0c0c] border border-white/5' : 'bg-white border border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                        <TrendingUp className={`w-4 h-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
                        <span className={`text-xs font-medium ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Avg Progress</span>
                    </div>
                    <p className={`text-xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{totalProgress}%</p>
                </div>
            </div>

            {/* Goals List */}
            <div className="flex-1 space-y-4">
                {filteredGoals.map(goal => {
                    const statusConfig = STATUS_CONFIG[goal.status];
                    return (
                        <div
                            key={goal.id}
                            className={`p-5 rounded-2xl ${isDark ? 'bg-[#0c0c0c] border border-white/5' : 'bg-white border border-gray-200'}`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <h3 className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{goal.title}</h3>
                                    <p className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-600'}`}>{goal.description}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${isDark ? statusConfig.color.dark : statusConfig.color.light}`}>
                                    {statusConfig.label}
                                </span>
                            </div>

                            {/* Progress bar */}
                            <div className="mb-3">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className={isDark ? 'text-white/40' : 'text-gray-500'}>{goal.current}</span>
                                    <span className={isDark ? 'text-white/40' : 'text-gray-500'}>{goal.target}</span>
                                </div>
                                <div className={`h-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                                    <div
                                        className={`h-2 rounded-full transition-all ${goal.status === 'on-track' ? 'bg-emerald-500' :
                                                goal.status === 'at-risk' ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                        style={{ width: `${goal.progress}%` }}
                                    />
                                </div>
                            </div>

                            <p className={`text-xs font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                {goal.progress}% complete
                            </p>
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
                            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>New Goal</h2>
                            <button onClick={() => setShowAddModal(false)} className={`p-2 rounded-xl ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
                                <X className={`w-5 h-5 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
                            </button>
                        </div>
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>Goal</label>
                                <input type="text" value={newGoal.title} onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))} placeholder="What do you want to achieve?" className={`w-full px-4 py-3 rounded-xl text-sm border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-gray-50 border-gray-200 text-gray-900'}`} />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>Description</label>
                                <input type="text" value={newGoal.description} onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))} placeholder="How will you measure success?" className={`w-full px-4 py-3 rounded-xl text-sm border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-gray-50 border-gray-200 text-gray-900'}`} />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>Target</label>
                                <input type="text" value={newGoal.target} onChange={(e) => setNewGoal(prev => ({ ...prev, target: e.target.value }))} placeholder="e.g., $10,000, 50%, Q1 2026" className={`w-full px-4 py-3 rounded-xl text-sm border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-gray-50 border-gray-200 text-gray-900'}`} />
                            </div>
                        </div>
                        <button onClick={handleAddGoal} disabled={!newGoal.title} className={`w-full py-3 rounded-xl text-sm font-semibold ${newGoal.title ? 'bg-emerald-500 text-white hover:bg-emerald-400' : (isDark ? 'bg-white/5 text-white/20' : 'bg-gray-100 text-gray-300')}`}>
                            Add Goal
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GoalsPage;
