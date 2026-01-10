/**
 * Expenses Page — Finance Agent
 * Track costs and spending
 */

import React, { useState } from 'react';
import {
    TrendingDown,
    CreditCard,
    Plus,
    Calendar,
    PieChart,
    ArrowDownRight,
    X,
    Tag,
    Briefcase,
    Users,
    Server,
    Megaphone
} from 'lucide-react';

interface ExpensesPageProps {
    isDark: boolean;
}

interface ExpenseEntry {
    id: string;
    name: string;
    amount: number;
    category: 'payroll' | 'software' | 'marketing' | 'operations' | 'other';
    type: 'recurring' | 'one-time';
    date: Date;
}

const CATEGORY_ICONS: Record<string, React.ElementType> = {
    payroll: Users,
    software: Server,
    marketing: Megaphone,
    operations: Briefcase,
    other: CreditCard
};

const CATEGORY_COLORS: Record<string, { dark: string; light: string }> = {
    payroll: { dark: 'text-blue-400 bg-blue-500/20', light: 'text-blue-600 bg-blue-100' },
    software: { dark: 'text-purple-400 bg-purple-500/20', light: 'text-purple-600 bg-purple-100' },
    marketing: { dark: 'text-orange-400 bg-orange-500/20', light: 'text-orange-600 bg-orange-100' },
    operations: { dark: 'text-emerald-400 bg-emerald-500/20', light: 'text-emerald-600 bg-emerald-100' },
    other: { dark: 'text-gray-400 bg-gray-500/20', light: 'text-gray-600 bg-gray-100' }
};

export const ExpensesPage: React.FC<ExpensesPageProps> = ({ isDark }) => {
    const [entries, setEntries] = useState<ExpenseEntry[]>([
        { id: '1', name: 'Team Salaries', amount: 5000, category: 'payroll', type: 'recurring', date: new Date() },
        { id: '2', name: 'AWS Hosting', amount: 450, category: 'software', type: 'recurring', date: new Date() },
        { id: '3', name: 'Google Ads', amount: 800, category: 'marketing', type: 'recurring', date: new Date(Date.now() - 86400000 * 2) },
        { id: '4', name: 'Office Rent', amount: 1200, category: 'operations', type: 'recurring', date: new Date(Date.now() - 86400000 * 5) },
        { id: '5', name: 'Design Tools', amount: 150, category: 'software', type: 'recurring', date: new Date(Date.now() - 86400000 * 7) },
    ]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [newEntry, setNewEntry] = useState({ name: '', amount: '', category: 'software' as const, type: 'recurring' as const });

    // Calculate totals
    const totalExpenses = entries.reduce((sum, e) => sum + e.amount, 0);
    const monthlyRecurring = entries.filter(e => e.type === 'recurring').reduce((sum, e) => sum + e.amount, 0);

    // Category breakdown
    const categoryBreakdown = entries.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
    }, {} as Record<string, number>);

    const handleAddEntry = () => {
        if (newEntry.name && newEntry.amount) {
            setEntries(prev => [{
                id: Date.now().toString(),
                name: newEntry.name,
                amount: parseFloat(newEntry.amount),
                category: newEntry.category,
                type: newEntry.type,
                date: new Date()
            }, ...prev]);
            setNewEntry({ name: '', amount: '', category: 'software', type: 'recurring' });
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
                        <TrendingDown className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-emerald-500/60' : 'text-emerald-600/80'}`}>
                            Finance Agent
                        </span>
                    </div>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Expenses
                    </h1>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-400"
                >
                    <Plus className="w-4 h-4" />
                    Add Expense
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className={`p-5 rounded-2xl ${isDark ? 'bg-[#0c0c0c] border border-red-500/20' : 'bg-white border border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <CreditCard className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
                        <span className={`text-xs font-medium ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Monthly Burn</span>
                    </div>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(monthlyRecurring)}
                    </p>
                </div>
                <div className={`p-5 rounded-2xl ${isDark ? 'bg-[#0c0c0c] border border-white/5' : 'bg-white border border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <PieChart className={`w-4 h-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
                        <span className={`text-xs font-medium ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Total Tracked</span>
                    </div>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(totalExpenses)}
                    </p>
                </div>
            </div>

            {/* Category Breakdown */}
            <div className={`p-5 rounded-2xl mb-6 ${isDark ? 'bg-[#0c0c0c] border border-white/5' : 'bg-white border border-gray-200'}`}>
                <h3 className={`text-sm font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>By Category</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {Object.entries(categoryBreakdown).map(([cat, amount]) => {
                        const Icon = CATEGORY_ICONS[cat] || CreditCard;
                        const colors = CATEGORY_COLORS[cat] || CATEGORY_COLORS.other;
                        return (
                            <div key={cat} className={`p-3 rounded-xl ${isDark ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${isDark ? colors.dark : colors.light}`}>
                                    <Icon className="w-4 h-4" />
                                </div>
                                <p className={`text-xs capitalize ${isDark ? 'text-white/50' : 'text-gray-500'}`}>{cat}</p>
                                <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(amount)}</p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Expense List */}
            <div className={`flex-1 rounded-2xl overflow-hidden ${isDark ? 'bg-[#0c0c0c] border border-white/5' : 'bg-white border border-gray-200'}`}>
                <div className={`px-5 py-4 border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                    <h2 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>All Expenses</h2>
                </div>
                <div className="divide-y divide-white/5">
                    {entries.map(entry => {
                        const Icon = CATEGORY_ICONS[entry.category] || CreditCard;
                        const colors = CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.other;
                        return (
                            <div
                                key={entry.id}
                                className={`px-5 py-4 flex items-center justify-between ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? colors.dark : colors.light}`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{entry.name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className={`text-xs capitalize ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{entry.category}</span>
                                            <span className={`text-xs ${isDark ? 'text-white/20' : 'text-gray-300'}`}>•</span>
                                            <span className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{formatDate(entry.date)}</span>
                                        </div>
                                    </div>
                                </div>
                                <p className={`text-lg font-bold ${isDark ? 'text-red-400' : 'text-red-500'}`}>
                                    -{formatCurrency(entry.amount)}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
                    <div className={`relative w-full max-w-md p-6 rounded-3xl ${isDark ? 'bg-[#0c0c0c]' : 'bg-white'}`}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Add Expense</h2>
                            <button onClick={() => setShowAddModal(false)} className={`p-2 rounded-xl ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
                                <X className={`w-5 h-5 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>Name</label>
                                <input
                                    type="text"
                                    value={newEntry.name}
                                    onChange={(e) => setNewEntry(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., AWS, Salaries..."
                                    className={`w-full px-4 py-3 rounded-xl text-sm border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
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
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>Category</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['payroll', 'software', 'marketing', 'operations', 'other'].map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setNewEntry(prev => ({ ...prev, category: cat as any }))}
                                            className={`py-2 px-3 rounded-xl text-xs font-medium capitalize ${newEntry.category === cat ? 'bg-emerald-500 text-white' : (isDark ? 'bg-white/5 text-white/50' : 'bg-gray-100 text-gray-500')}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleAddEntry}
                            disabled={!newEntry.name || !newEntry.amount}
                            className={`w-full py-3 rounded-xl text-sm font-semibold ${newEntry.name && newEntry.amount ? 'bg-emerald-500 text-white hover:bg-emerald-400' : (isDark ? 'bg-white/5 text-white/20' : 'bg-gray-100 text-gray-300')}`}
                        >
                            Add Expense
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpensesPage;
