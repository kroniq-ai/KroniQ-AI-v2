/**
 * ExpensesPage - Advanced Expense Management
 * Category breakdown, budget tracking, vendor management, over-budget alerts
 * Premium green glowing design
 */

import React, { useState, useMemo } from 'react';
import {
    CreditCard,
    TrendingUp,
    TrendingDown,
    Plus,
    X,
    Building2,
    Users,
    Monitor,
    Megaphone,
    Server,
    MoreHorizontal,
    AlertTriangle,
    Check,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    PieChart,
    Sparkles,
    Calendar,
    Receipt,
    DollarSign,
    Target
} from 'lucide-react';

interface ExpensesPageProps {
    isDark: boolean;
}

interface Expense {
    id: string;
    name: string;
    vendor: string;
    amount: number;
    category: 'payroll' | 'software' | 'marketing' | 'office' | 'hosting' | 'other';
    type: 'recurring' | 'one-time';
    date: string;
    status: 'paid' | 'pending' | 'overdue';
}

interface CategoryBudget {
    category: string;
    icon: React.ElementType;
    spent: number;
    budget: number;
    color: string;
}

// ===== CATEGORY PIE CHART =====
const CategoryChart: React.FC<{ isDark: boolean; categories: CategoryBudget[] }> = ({ isDark, categories }) => {
    const total = categories.reduce((sum, c) => sum + c.spent, 0);
    let currentAngle = 0;

    const colors = {
        payroll: '#10B981',
        software: '#3B82F6',
        marketing: '#F59E0B',
        office: '#8B5CF6',
        hosting: '#EC4899',
        other: '#6B7280'
    };

    return (
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#0d0d0d] border-emerald-500/10' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center gap-2 mb-4">
                <PieChart className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Spending by Category
                </span>
            </div>

            <div className="flex items-center gap-6">
                {/* SVG Donut Chart */}
                <div className="relative w-32 h-32 flex-shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        {categories.map((cat, i) => {
                            const percentage = (cat.spent / total) * 100;
                            const strokeDasharray = `${percentage} ${100 - percentage}`;
                            const strokeDashoffset = -currentAngle;
                            currentAngle += percentage;

                            return (
                                <circle
                                    key={cat.category}
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="none"
                                    stroke={colors[cat.category as keyof typeof colors] || '#6B7280'}
                                    strokeWidth="12"
                                    strokeDasharray={strokeDasharray}
                                    strokeDashoffset={strokeDashoffset}
                                    pathLength="100"
                                    className="transition-all duration-500"
                                />
                            );
                        })}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            ${(total / 1000).toFixed(0)}k
                        </p>
                        <p className={`text-[10px] ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Total</p>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-2">
                    {categories.map(cat => (
                        <div key={cat.category} className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: colors[cat.category as keyof typeof colors] }}
                            />
                            <span className={`text-xs flex-1 capitalize ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                                {cat.category}
                            </span>
                            <span className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                ${(cat.spent / 1000).toFixed(1)}k
                            </span>
                            <span className={`text-[10px] ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                                {((cat.spent / total) * 100).toFixed(0)}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ===== BUDGET PROGRESS BAR =====
const BudgetProgress: React.FC<{
    isDark: boolean;
    category: CategoryBudget;
}> = ({ isDark, category }) => {
    const percentage = Math.min((category.spent / category.budget) * 100, 100);
    const isOverBudget = category.spent > category.budget;
    const Icon = category.icon;

    return (
        <div className={`
            p-4 rounded-xl border transition-all duration-300
            ${isOverBudget
                ? (isDark ? 'bg-red-500/5 border-red-500/20' : 'bg-red-50 border-red-200')
                : (isDark ? 'bg-[#0d0d0d] border-emerald-500/10 hover:border-emerald-500/30' : 'bg-white border-gray-100 hover:border-emerald-200')
            }
        `}>
            <div className="flex items-center gap-3 mb-3">
                <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    ${isOverBudget
                        ? (isDark ? 'bg-red-500/20' : 'bg-red-100')
                        : (isDark ? 'bg-emerald-500/10' : 'bg-gray-100')
                    }
                `}>
                    <Icon className={`w-5 h-5 ${isOverBudget ? (isDark ? 'text-red-400' : 'text-red-600') : (isDark ? 'text-emerald-400' : 'text-emerald-600')
                        }`} />
                </div>
                <div className="flex-1">
                    <p className={`font-semibold capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {category.category}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                        ${category.spent.toLocaleString()} / ${category.budget.toLocaleString()}
                    </p>
                </div>
                {isOverBudget && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'
                        }`}>
                        <AlertTriangle className="w-3 h-3" />
                        +${(category.spent - category.budget).toLocaleString()}
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                <div
                    className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : percentage > 80 ? 'bg-yellow-500' : 'bg-emerald-500'
                        }`}
                    style={{
                        width: `${percentage}%`,
                        boxShadow: isDark && !isOverBudget ? '0 0 10px rgba(16, 185, 129, 0.4)' : 'none'
                    }}
                />
            </div>
            <p className={`text-[10px] mt-1 text-right ${isOverBudget ? 'text-red-400' : percentage > 80 ? 'text-yellow-400' : (isDark ? 'text-white/30' : 'text-gray-400')
                }`}>
                {percentage.toFixed(0)}% used
            </p>
        </div>
    );
};

// ===== EXPENSE ROW =====
const ExpenseRow: React.FC<{
    isDark: boolean;
    expense: Expense;
}> = ({ isDark, expense }) => {
    const categoryIcons = {
        payroll: Users,
        software: Monitor,
        marketing: Megaphone,
        office: Building2,
        hosting: Server,
        other: MoreHorizontal
    };

    const Icon = categoryIcons[expense.category];

    const statusStyles = {
        paid: isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600',
        pending: isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-600',
        overdue: isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'
    };

    return (
        <div className={`
            p-4 rounded-xl border flex items-center gap-4 group
            transition-all duration-200
            ${isDark ? 'bg-[#0d0d0d] border-emerald-500/10 hover:border-emerald-500/30' : 'bg-white border-gray-100 hover:border-emerald-200'}
        `}>
            <div className={`
                w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                ${isDark ? 'bg-emerald-500/10' : 'bg-gray-100'}
            `}>
                <Icon className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>

            <div className="flex-1 min-w-0">
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {expense.name}
                </p>
                <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                    {expense.vendor} • {expense.date}
                </p>
            </div>

            <span className={`text-[10px] px-2 py-1 rounded-full font-medium capitalize ${statusStyles[expense.status]}`}>
                {expense.status}
            </span>

            <div className="text-right">
                <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ${expense.amount.toLocaleString()}
                </p>
                <p className={`text-[10px] capitalize ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                    {expense.type}
                </p>
            </div>
        </div>
    );
};

// ===== ADD EXPENSE MODAL =====
const AddExpenseModal: React.FC<{
    isDark: boolean;
    isOpen: boolean;
    onClose: () => void;
    onAdd: (expense: Omit<Expense, 'id'>) => void;
}> = ({ isDark, isOpen, onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [vendor, setVendor] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<Expense['category']>('software');
    const [type, setType] = useState<'recurring' | 'one-time'>('recurring');

    if (!isOpen) return null;

    const categories: { id: Expense['category']; label: string; icon: React.ElementType }[] = [
        { id: 'payroll', label: 'Payroll', icon: Users },
        { id: 'software', label: 'Software', icon: Monitor },
        { id: 'marketing', label: 'Marketing', icon: Megaphone },
        { id: 'office', label: 'Office', icon: Building2 },
        { id: 'hosting', label: 'Hosting', icon: Server },
        { id: 'other', label: 'Other', icon: MoreHorizontal },
    ];

    const handleSubmit = () => {
        if (name && vendor && amount) {
            onAdd({
                name,
                vendor,
                amount: Number(amount),
                category,
                type,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                status: 'pending'
            });
            setName(''); setVendor(''); setAmount('');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full max-w-md p-6 rounded-3xl ${isDark ? 'bg-[#0c0c0c]' : 'bg-white'}`}
                style={{ boxShadow: isDark ? '0 0 60px rgba(16, 185, 129, 0.15)' : '0 25px 80px rgba(0,0,0,0.2)' }}>

                <div className="flex items-center justify-between mb-6">
                    <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Add Expense</h2>
                    <button onClick={onClose} className={`p-2 rounded-xl ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
                        <X className={`w-5 h-5 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
                    </button>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                                Expense Name *
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Slack, AWS"
                                className={`w-full px-4 py-3 rounded-xl text-sm border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-gray-50 border-gray-200'
                                    }`}
                            />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                                Vendor *
                            </label>
                            <input
                                type="text"
                                value={vendor}
                                onChange={(e) => setVendor(e.target.value)}
                                placeholder="Company name"
                                className={`w-full px-4 py-3 rounded-xl text-sm border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-gray-50 border-gray-200'
                                    }`}
                            />
                        </div>
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                            Category
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {categories.map(cat => {
                                const CatIcon = cat.icon;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setCategory(cat.id)}
                                        className={`py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 ${category === cat.id
                                                ? 'bg-emerald-500 text-white'
                                                : (isDark ? 'bg-white/5 text-white/50' : 'bg-gray-100 text-gray-500')
                                            }`}
                                    >
                                        <CatIcon className="w-3 h-3" />
                                        {cat.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                                Amount ($) *
                            </label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="0"
                                className={`w-full px-4 py-3 rounded-xl text-sm border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-gray-50 border-gray-200'
                                    }`}
                            />
                        </div>
                        <div>
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                                Type
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => setType('recurring')}
                                    className={`py-3 rounded-xl text-xs font-medium ${type === 'recurring' ? 'bg-emerald-500 text-white' : (isDark ? 'bg-white/5 text-white/50' : 'bg-gray-100')
                                        }`}
                                >
                                    Recurring
                                </button>
                                <button
                                    onClick={() => setType('one-time')}
                                    className={`py-3 rounded-xl text-xs font-medium ${type === 'one-time' ? 'bg-emerald-500 text-white' : (isDark ? 'bg-white/5 text-white/50' : 'bg-gray-100')
                                        }`}
                                >
                                    One-time
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={!name || !vendor || !amount}
                    className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 ${name && vendor && amount
                            ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                            : (isDark ? 'bg-white/5 text-white/20' : 'bg-gray-100 text-gray-300')
                        }`}
                >
                    <Plus className="w-4 h-4" /> Add Expense
                </button>
            </div>
        </div>
    );
};

// ===== MAIN COMPONENT =====
export const ExpensesPage: React.FC<ExpensesPageProps> = ({ isDark }) => {
    const [expenses, setExpenses] = useState<Expense[]>([
        { id: '1', name: 'Engineering Salaries', vendor: 'Payroll', amount: 25000, category: 'payroll', type: 'recurring', date: 'Jan 1', status: 'paid' },
        { id: '2', name: 'AWS Hosting', vendor: 'Amazon', amount: 2500, category: 'hosting', type: 'recurring', date: 'Jan 3', status: 'paid' },
        { id: '3', name: 'Slack', vendor: 'Salesforce', amount: 150, category: 'software', type: 'recurring', date: 'Jan 5', status: 'paid' },
        { id: '4', name: 'Google Ads', vendor: 'Google', amount: 5000, category: 'marketing', type: 'recurring', date: 'Jan 7', status: 'pending' },
        { id: '5', name: 'Office Rent', vendor: 'WeWork', amount: 3000, category: 'office', type: 'recurring', date: 'Jan 1', status: 'paid' },
        { id: '6', name: 'Figma', vendor: 'Figma Inc', amount: 75, category: 'software', type: 'recurring', date: 'Jan 10', status: 'paid' },
        { id: '7', name: 'Notion', vendor: 'Notion Labs', amount: 96, category: 'software', type: 'recurring', date: 'Jan 12', status: 'pending' },
        { id: '8', name: 'Contractor Fee', vendor: 'Freelancer', amount: 2000, category: 'payroll', type: 'one-time', date: 'Jan 15', status: 'overdue' },
    ]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [filter, setFilter] = useState<Expense['category'] | 'all'>('all');

    // Calculate budget data
    const budgets = useMemo((): CategoryBudget[] => {
        const categoryTotals: Record<string, number> = {};
        const budgetLimits: Record<string, number> = {
            payroll: 30000,
            software: 500,
            marketing: 5000,
            office: 3500,
            hosting: 3000,
            other: 1000
        };

        expenses.forEach(e => {
            categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
        });

        const iconMap: Record<string, React.ElementType> = {
            payroll: Users,
            software: Monitor,
            marketing: Megaphone,
            office: Building2,
            hosting: Server,
            other: MoreHorizontal
        };

        return Object.keys(budgetLimits).map(cat => ({
            category: cat,
            icon: iconMap[cat],
            spent: categoryTotals[cat] || 0,
            budget: budgetLimits[cat],
            color: ''
        })).sort((a, b) => b.spent - a.spent);
    }, [expenses]);

    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const totalBudget = budgets.reduce((sum, b) => sum + b.budget, 0);
    const overBudgetCategories = budgets.filter(b => b.spent > b.budget);

    const filteredExpenses = filter === 'all'
        ? expenses
        : expenses.filter(e => e.category === filter);

    const handleAddExpense = (expense: Omit<Expense, 'id'>) => {
        setExpenses(prev => [{ ...expense, id: Date.now().toString() }, ...prev]);
    };

    return (
        <div className="flex-1 overflow-y-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <CreditCard className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-emerald-500/60' : 'text-emerald-600/80'}`}>
                            Finance • Expenses
                        </span>
                    </div>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        Expense Management
                    </h1>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-400"
                    style={{ boxShadow: isDark ? '0 0 20px rgba(16, 185, 129, 0.3)' : 'none' }}
                >
                    <Plus className="w-4 h-4" /> Add Expense
                </button>
            </div>

            {/* Over Budget Alert */}
            {overBudgetCategories.length > 0 && (
                <div className={`p-4 rounded-2xl mb-6 border ${isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-start gap-3">
                        <AlertTriangle className={`w-5 h-5 mt-0.5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                        <div>
                            <p className={`font-medium ${isDark ? 'text-red-300' : 'text-red-800'}`}>
                                {overBudgetCategories.length} categor{overBudgetCategories.length > 1 ? 'ies' : 'y'} over budget
                            </p>
                            <p className={`text-sm mt-1 ${isDark ? 'text-red-400/70' : 'text-red-600'}`}>
                                {overBudgetCategories.map(c => c.category).join(', ')} exceeded spending limits.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className={`
                    relative p-5 rounded-2xl border overflow-hidden
                    ${isDark ? 'bg-gradient-to-br from-emerald-500/15 to-[#0d0d0d] border-emerald-500/30' : 'bg-gradient-to-br from-emerald-50 to-white border-emerald-200'}
                `}
                    style={{ boxShadow: isDark ? '0 0 30px rgba(16, 185, 129, 0.15)' : 'none' }}
                >
                    {isDark && <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl bg-emerald-500/20" />}
                    <div className="relative z-10">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                            <DollarSign className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        </div>
                        <p className={`text-xs font-medium mb-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Total Spent</p>
                        <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            ${(totalSpent / 1000).toFixed(1)}k
                        </p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                            of ${(totalBudget / 1000).toFixed(0)}k budget
                        </p>
                    </div>
                </div>

                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#0d0d0d] border-emerald-500/10' : 'bg-white border-gray-100'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${isDark ? 'bg-emerald-500/10' : 'bg-gray-100'}`}>
                        <Target className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    </div>
                    <p className={`text-xs font-medium mb-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Budget Used</p>
                    <p className={`text-2xl font-bold ${totalSpent > totalBudget ? 'text-red-400' : (isDark ? 'text-white' : 'text-gray-900')}`}>
                        {((totalSpent / totalBudget) * 100).toFixed(0)}%
                    </p>
                </div>

                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#0d0d0d] border-emerald-500/10' : 'bg-white border-gray-100'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${isDark ? 'bg-emerald-500/10' : 'bg-gray-100'}`}>
                        <Receipt className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    </div>
                    <p className={`text-xs font-medium mb-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Transactions</p>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{expenses.length}</p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>This month</p>
                </div>

                <div className={`p-5 rounded-2xl border ${overBudgetCategories.length > 0
                        ? (isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200')
                        : (isDark ? 'bg-[#0d0d0d] border-emerald-500/10' : 'bg-white border-gray-100')
                    }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${overBudgetCategories.length > 0
                            ? (isDark ? 'bg-red-500/20' : 'bg-red-100')
                            : (isDark ? 'bg-emerald-500/10' : 'bg-gray-100')
                        }`}>
                        <AlertTriangle className={`w-5 h-5 ${overBudgetCategories.length > 0 ? 'text-red-400' : (isDark ? 'text-emerald-400' : 'text-emerald-600')
                            }`} />
                    </div>
                    <p className={`text-xs font-medium mb-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Categories Over</p>
                    <p className={`text-2xl font-bold ${overBudgetCategories.length > 0 ? 'text-red-400' : (isDark ? 'text-white' : 'text-gray-900')}`}>
                        {overBudgetCategories.length}
                    </p>
                </div>
            </div>

            {/* Charts & Budgets */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
                <CategoryChart isDark={isDark} categories={budgets} />

                <div className="space-y-3">
                    <h3 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                        <Target className="w-4 h-4" />
                        Budget Progress
                    </h3>
                    {budgets.slice(0, 4).map(cat => (
                        <BudgetProgress key={cat.category} isDark={isDark} category={cat} />
                    ))}
                </div>
            </div>

            {/* Expenses List */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                        <Receipt className="w-4 h-4" />
                        Recent Expenses ({filteredExpenses.length})
                    </h3>

                    <div className="flex items-center gap-2 overflow-x-auto">
                        {(['all', 'payroll', 'software', 'marketing'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap ${filter === f
                                        ? 'bg-emerald-500 text-white'
                                        : (isDark ? 'bg-white/5 text-white/50' : 'bg-gray-100 text-gray-500')
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    {filteredExpenses.map(expense => (
                        <ExpenseRow key={expense.id} isDark={isDark} expense={expense} />
                    ))}
                </div>
            </div>

            {/* Add Modal */}
            <AddExpenseModal
                isDark={isDark}
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAdd={handleAddExpense}
            />
        </div>
    );
};

export default ExpensesPage;
