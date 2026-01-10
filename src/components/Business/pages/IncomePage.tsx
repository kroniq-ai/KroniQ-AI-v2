/**
 * Income Page — Finance Agent
 * Track revenue sources and trends
 */

import React, { useState } from 'react';
import {
    TrendingUp,
    DollarSign,
    Plus,
    Calendar,
    BarChart2,
    ArrowUpRight,
    Sparkles,
    X,
    Tag
} from 'lucide-react';

interface IncomePageProps {
    isDark: boolean;
}

interface IncomeEntry {
    id: string;
    source: string;
    amount: number;
    type: 'recurring' | 'one-time';
    date: Date;
    category: string;
}

export const IncomePage: React.FC<IncomePageProps> = ({ isDark }) => {
    const [entries, setEntries] = useState<IncomeEntry[]>([
        { id: '1', source: 'Subscription Revenue', amount: 4500, type: 'recurring', date: new Date(), category: 'MRR' },
        { id: '2', source: 'Enterprise Deal', amount: 12000, type: 'one-time', date: new Date(Date.now() - 86400000 * 5), category: 'Sales' },
        { id: '3', source: 'Consulting', amount: 2500, type: 'one-time', date: new Date(Date.now() - 86400000 * 10), category: 'Services' },
    ]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [newEntry, setNewEntry] = useState({ source: '', amount: '', type: 'recurring' as const, category: 'MRR' });

    // Calculate totals
    const totalMRR = entries.filter(e => e.type === 'recurring').reduce((sum, e) => sum + e.amount, 0);
    const totalRevenue = entries.reduce((sum, e) => sum + e.amount, 0);
    const arr = totalMRR * 12;

    const handleAddEntry = () => {
        if (newEntry.source && newEntry.amount) {
            setEntries(prev => [{
                id: Date.now().toString(),
                source: newEntry.source,
                amount: parseFloat(newEntry.amount),
                type: newEntry.type,
                date: new Date(),
                category: newEntry.category
            }, ...prev]);
            setNewEntry({ source: '', amount: '', type: 'recurring', category: 'MRR' });
            setShowAddModal(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
    };

    return (
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-emerald-500/60' : 'text-emerald-600/80'}`}>
                            Finance Agent
                        </span>
                    </div>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Income
                    </h1>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-400"
                >
                    <Plus className="w-4 h-4" />
                    Add Income
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className={`p-5 rounded-2xl ${isDark ? 'bg-[#0c0c0c] border border-emerald-500/20' : 'bg-white border border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <BarChart2 className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={`text-xs font-medium ${isDark ? 'text-white/50' : 'text-gray-500'}`}>MRR</span>
                    </div>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(totalMRR)}
                    </p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        Monthly recurring
                    </p>
                </div>

                <div className={`p-5 rounded-2xl ${isDark ? 'bg-[#0c0c0c] border border-emerald-500/20' : 'bg-white border border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={`text-xs font-medium ${isDark ? 'text-white/50' : 'text-gray-500'}`}>ARR</span>
                    </div>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(arr)}
                    </p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        Annual run rate
                    </p>
                </div>

                <div className={`p-5 rounded-2xl ${isDark ? 'bg-[#0c0c0c] border border-emerald-500/20' : 'bg-white border border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={`text-xs font-medium ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Total</span>
                    </div>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(totalRevenue)}
                    </p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                        All income
                    </p>
                </div>
            </div>

            {/* Income List */}
            <div className={`flex-1 rounded-2xl overflow-hidden ${isDark ? 'bg-[#0c0c0c] border border-white/5' : 'bg-white border border-gray-200'}`}>
                <div className={`px-5 py-4 border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                    <h2 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Recent Income
                    </h2>
                </div>
                <div className="divide-y divide-white/5">
                    {entries.map(entry => (
                        <div
                            key={entry.id}
                            className={`px-5 py-4 flex items-center justify-between ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50'}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`
                                    w-10 h-10 rounded-xl flex items-center justify-center
                                    ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}
                                `}>
                                    <ArrowUpRight className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                </div>
                                <div>
                                    <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {entry.source}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                                            {formatDate(entry.date)}
                                        </span>
                                        <span className={`
                                            px-2 py-0.5 rounded-full text-[10px] font-medium
                                            ${entry.type === 'recurring'
                                                ? (isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700')
                                                : (isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700')}
                                        `}>
                                            {entry.type === 'recurring' ? 'Recurring' : 'One-time'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <p className={`text-lg font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                +{formatCurrency(entry.amount)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
                    <div className={`relative w-full max-w-md p-6 rounded-3xl ${isDark ? 'bg-[#0c0c0c]' : 'bg-white'}`}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Add Income</h2>
                            <button onClick={() => setShowAddModal(false)} className={`p-2 rounded-xl ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
                                <X className={`w-5 h-5 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>Source</label>
                                <input
                                    type="text"
                                    value={newEntry.source}
                                    onChange={(e) => setNewEntry(prev => ({ ...prev, source: e.target.value }))}
                                    placeholder="e.g., Subscription, Consulting..."
                                    className={`w-full px-4 py-3 rounded-xl text-sm border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>Amount ($)</label>
                                <input
                                    type="number"
                                    value={newEntry.amount}
                                    onChange={(e) => setNewEntry(prev => ({ ...prev, amount: e.target.value }))}
                                    placeholder="0"
                                    className={`w-full px-4 py-3 rounded-xl text-lg font-medium border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>Type</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setNewEntry(prev => ({ ...prev, type: 'recurring' }))}
                                        className={`flex-1 py-2 rounded-xl text-sm font-medium ${newEntry.type === 'recurring' ? 'bg-emerald-500 text-white' : (isDark ? 'bg-white/5 text-white/50' : 'bg-gray-100 text-gray-500')}`}
                                    >
                                        Recurring
                                    </button>
                                    <button
                                        onClick={() => setNewEntry(prev => ({ ...prev, type: 'one-time' }))}
                                        className={`flex-1 py-2 rounded-xl text-sm font-medium ${newEntry.type === 'one-time' ? 'bg-emerald-500 text-white' : (isDark ? 'bg-white/5 text-white/50' : 'bg-gray-100 text-gray-500')}`}
                                    >
                                        One-time
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleAddEntry}
                            disabled={!newEntry.source || !newEntry.amount}
                            className={`w-full py-3 rounded-xl text-sm font-semibold ${newEntry.source && newEntry.amount ? 'bg-emerald-500 text-white hover:bg-emerald-400' : (isDark ? 'bg-white/5 text-white/20' : 'bg-gray-100 text-gray-300')}`}
                        >
                            Add Income
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IncomePage;
