/**
 * Bugs Page — Product Agent
 * Bug tracking and issue management
 */

import React, { useState } from 'react';
import {
    Bug,
    Plus,
    X,
    AlertTriangle,
    AlertCircle,
    Info,
    CheckCircle
} from 'lucide-react';

interface BugsPageProps {
    isDark: boolean;
}

interface BugItem {
    id: string;
    title: string;
    description: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    status: 'open' | 'in-progress' | 'resolved';
    reportedBy: string;
    date: Date;
}

const SEVERITY_CONFIG = {
    critical: { label: 'Critical', icon: AlertTriangle, color: { dark: 'bg-red-500/20 text-red-400 border-red-500/30', light: 'bg-red-100 text-red-700 border-red-200' } },
    high: { label: 'High', icon: AlertCircle, color: { dark: 'bg-orange-500/20 text-orange-400 border-orange-500/30', light: 'bg-orange-100 text-orange-700 border-orange-200' } },
    medium: { label: 'Medium', icon: Info, color: { dark: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', light: 'bg-yellow-100 text-yellow-700 border-yellow-200' } },
    low: { label: 'Low', icon: Info, color: { dark: 'bg-gray-500/20 text-gray-400 border-gray-500/30', light: 'bg-gray-100 text-gray-600 border-gray-200' } }
};

const STATUS_CONFIG = {
    open: { label: 'Open', color: { dark: 'bg-red-500/20 text-red-400', light: 'bg-red-100 text-red-700' } },
    'in-progress': { label: 'In Progress', color: { dark: 'bg-yellow-500/20 text-yellow-400', light: 'bg-yellow-100 text-yellow-700' } },
    resolved: { label: 'Resolved', color: { dark: 'bg-emerald-500/20 text-emerald-400', light: 'bg-emerald-100 text-emerald-700' } }
};

export const BugsPage: React.FC<BugsPageProps> = ({ isDark }) => {
    const [bugs, setBugs] = useState<BugItem[]>([
        { id: '1', title: 'Login fails on Safari', description: 'Users report 500 error when logging in on Safari browser', severity: 'critical', status: 'in-progress', reportedBy: 'User', date: new Date() },
        { id: '2', title: 'Chat messages not syncing', description: 'Messages sometimes appear out of order', severity: 'high', status: 'open', reportedBy: 'QA', date: new Date(Date.now() - 86400000) },
        { id: '3', title: 'Export button not working', description: 'CSV export returns empty file for large datasets', severity: 'medium', status: 'open', reportedBy: 'User', date: new Date(Date.now() - 86400000 * 2) },
        { id: '4', title: 'Typo in onboarding', description: 'Business spelled as "Busines" on step 2', severity: 'low', status: 'resolved', reportedBy: 'Internal', date: new Date(Date.now() - 86400000 * 5) },
    ]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [newBug, setNewBug] = useState({ title: '', description: '', severity: 'medium' as const });

    const openCount = bugs.filter(b => b.status === 'open').length;
    const inProgressCount = bugs.filter(b => b.status === 'in-progress').length;
    const criticalCount = bugs.filter(b => b.severity === 'critical' && b.status !== 'resolved').length;

    const handleAddBug = () => {
        if (newBug.title) {
            setBugs(prev => [{
                id: Date.now().toString(),
                title: newBug.title,
                description: newBug.description,
                severity: newBug.severity,
                status: 'open',
                reportedBy: 'You',
                date: new Date()
            }, ...prev]);
            setNewBug({ title: '', description: '', severity: 'medium' });
            setShowAddModal(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Bug className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-emerald-500/60' : 'text-emerald-600/80'}`}>
                            Product Agent
                        </span>
                    </div>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Bugs</h1>
                </div>
                <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-400">
                    <Plus className="w-4 h-4" /> Report Bug
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className={`p-4 rounded-2xl ${isDark ? 'bg-[#0c0c0c] border border-red-500/20' : 'bg-white border border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                        <AlertCircle className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
                        <span className={`text-xs font-medium ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Open</span>
                    </div>
                    <p className={`text-xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{openCount}</p>
                </div>
                <div className={`p-4 rounded-2xl ${isDark ? 'bg-[#0c0c0c] border border-yellow-500/20' : 'bg-white border border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                        <Bug className={`w-4 h-4 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                        <span className={`text-xs font-medium ${isDark ? 'text-white/50' : 'text-gray-500'}`}>In Progress</span>
                    </div>
                    <p className={`text-xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{inProgressCount}</p>
                </div>
                <div className={`p-4 rounded-2xl ${isDark ? 'bg-[#0c0c0c] border border-red-500/30' : 'bg-white border border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                        <AlertTriangle className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
                        <span className={`text-xs font-medium ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Critical</span>
                    </div>
                    <p className={`text-xl font-bold mt-1 ${isDark ? 'text-red-400' : 'text-red-600'}`}>{criticalCount}</p>
                </div>
            </div>

            {/* Bug List */}
            <div className="flex-1 space-y-3">
                {bugs.map(bug => {
                    const sevConfig = SEVERITY_CONFIG[bug.severity];
                    const statConfig = STATUS_CONFIG[bug.status];
                    const SevIcon = sevConfig.icon;
                    return (
                        <div key={bug.id} className={`p-4 rounded-2xl border ${isDark ? `bg-[#0c0c0c] ${sevConfig.color.dark.split(' ')[2]}` : `bg-white ${sevConfig.color.light.split(' ')[2]}`}`}>
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <SevIcon className={`w-4 h-4 ${isDark ? sevConfig.color.dark.split(' ')[1] : sevConfig.color.light.split(' ')[1]}`} />
                                    <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{bug.title}</h3>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${isDark ? statConfig.color.dark : statConfig.color.light}`}>
                                    {statConfig.label}
                                </span>
                            </div>
                            <p className={`text-sm mb-2 ${isDark ? 'text-white/50' : 'text-gray-600'}`}>{bug.description}</p>
                            <div className="flex items-center gap-3">
                                <span className={`text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Reported by: {bug.reportedBy}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${isDark ? sevConfig.color.dark : sevConfig.color.light}`}>
                                    {sevConfig.label}
                                </span>
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
                            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Report Bug</h2>
                            <button onClick={() => setShowAddModal(false)} className={`p-2 rounded-xl ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
                                <X className={`w-5 h-5 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
                            </button>
                        </div>
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>Title</label>
                                <input type="text" value={newBug.title} onChange={(e) => setNewBug(prev => ({ ...prev, title: e.target.value }))} placeholder="What's the bug?" className={`w-full px-4 py-3 rounded-xl text-sm border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-gray-50 border-gray-200 text-gray-900'}`} />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>Description</label>
                                <textarea value={newBug.description} onChange={(e) => setNewBug(prev => ({ ...prev, description: e.target.value }))} placeholder="Steps to reproduce..." rows={2} className={`w-full px-4 py-3 rounded-xl text-sm border outline-none resize-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-gray-50 border-gray-200 text-gray-900'}`} />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>Severity</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {(['critical', 'high', 'medium', 'low'] as const).map(s => (
                                        <button key={s} onClick={() => setNewBug(prev => ({ ...prev, severity: s }))} className={`py-2 px-3 rounded-xl text-xs font-medium capitalize ${newBug.severity === s ? 'bg-emerald-500 text-white' : (isDark ? 'bg-white/5 text-white/50' : 'bg-gray-100 text-gray-500')}`}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button onClick={handleAddBug} disabled={!newBug.title} className={`w-full py-3 rounded-xl text-sm font-semibold ${newBug.title ? 'bg-emerald-500 text-white hover:bg-emerald-400' : (isDark ? 'bg-white/5 text-white/20' : 'bg-gray-100 text-gray-300')}`}>
                            Report Bug
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BugsPage;
