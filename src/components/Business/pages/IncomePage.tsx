/**
 * IncomePage - Advanced Revenue Tracking Dashboard
 * MRR/ARR tracking, revenue streams, growth metrics, trend charts
 * Premium green glowing design
 */

import React, { useState, useMemo } from 'react';
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    Users,
    Plus,
    X,
    Check,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Filter,
    RefreshCw,
    Star,
    Clock,
    Sparkles,
    ChevronRight,
    Receipt,
    CreditCard,
    Zap,
    Target
} from 'lucide-react';

interface IncomePageProps {
    isDark: boolean;
}

interface RevenueStream {
    id: string;
    name: string;
    customer?: string;
    amount: number;
    type: 'recurring' | 'one-time';
    frequency?: 'monthly' | 'annual';
    status: 'active' | 'churned' | 'pending';
    startDate: string;
    nextPayment?: string;
}

interface MetricCardProps {
    isDark: boolean;
    icon: React.ElementType;
    label: string;
    value: string;
    change?: number;
    subValue?: string;
    highlight?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ isDark, icon: Icon, label, value, change, subValue, highlight }) => (
    <div className={`
        relative p-5 rounded-2xl border overflow-hidden transition-all duration-300
        ${highlight
            ? (isDark ? 'bg-gradient-to-br from-emerald-500/15 to-[#0d0d0d] border-emerald-500/30' : 'bg-gradient-to-br from-emerald-50 to-white border-emerald-200')
            : (isDark ? 'bg-[#0d0d0d] border-emerald-500/10' : 'bg-white border-gray-100')
        }
    `}
        style={{ boxShadow: isDark && highlight ? '0 0 30px rgba(16, 185, 129, 0.15)' : 'none' }}
    >
        {highlight && isDark && (
            <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl bg-emerald-500/20" />
        )}

        <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
                <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center
                    ${highlight
                        ? (isDark ? 'bg-emerald-500/20' : 'bg-emerald-100')
                        : (isDark ? 'bg-emerald-500/10' : 'bg-gray-100')
                    }
                `}
                    style={{ boxShadow: isDark && highlight ? '0 0 15px rgba(16, 185, 129, 0.2)' : 'none' }}
                >
                    <Icon className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                </div>
                {change !== undefined && (
                    <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${change >= 0
                            ? (isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600')
                            : (isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600')
                        }`}>
                        {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(change)}%
                    </div>
                )}
            </div>
            <p className={`text-xs font-medium mb-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                {label}
            </p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                {value}
            </p>
            {subValue && (
                <p className={`text-xs mt-1 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                    {subValue}
                </p>
            )}
        </div>
    </div>
);

// ===== REVENUE TREND CHART =====
const RevenueTrendChart: React.FC<{ isDark: boolean; data: number[] }> = ({ isDark, data }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    // Create SVG path for smooth line
    const points = data.map((val, i) => ({
        x: (i / (data.length - 1)) * 100,
        y: 100 - ((val - min) / range) * 80 - 10
    }));

    const pathD = points.reduce((acc, p, i) => {
        if (i === 0) return `M ${p.x} ${p.y}`;
        const prev = points[i - 1];
        const cpx = (prev.x + p.x) / 2;
        return `${acc} C ${cpx} ${prev.y}, ${cpx} ${p.y}, ${p.x} ${p.y}`;
    }, '');

    const areaD = `${pathD} L 100 100 L 0 100 Z`;

    return (
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#0d0d0d] border-emerald-500/10' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <BarChart3 className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        MRR Trend (6 months)
                    </span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-lg ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                    +{((data[data.length - 1] - data[0]) / data[0] * 100).toFixed(0)}% growth
                </span>
            </div>

            <div className="h-32 relative">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                    {/* Gradient fill */}
                    <defs>
                        <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor={isDark ? "rgb(16, 185, 129)" : "rgb(16, 185, 129)"} stopOpacity="0.3" />
                            <stop offset="100%" stopColor={isDark ? "rgb(16, 185, 129)" : "rgb(16, 185, 129)"} stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Area fill */}
                    <path d={areaD} fill="url(#areaGradient)" />

                    {/* Line */}
                    <path
                        d={pathD}
                        fill="none"
                        stroke={isDark ? "rgb(16, 185, 129)" : "rgb(5, 150, 105)"}
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                    />

                    {/* Data points */}
                    {points.map((p, i) => (
                        <circle
                            key={i}
                            cx={p.x}
                            cy={p.y}
                            r="3"
                            fill={isDark ? "rgb(16, 185, 129)" : "rgb(5, 150, 105)"}
                            className="opacity-0 hover:opacity-100 transition-opacity"
                        />
                    ))}
                </svg>

                {/* Y-axis labels */}
                <div className={`absolute left-0 top-0 text-[10px] ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                    ${(max / 1000).toFixed(0)}k
                </div>
                <div className={`absolute left-0 bottom-0 text-[10px] ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                    ${(min / 1000).toFixed(0)}k
                </div>
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between mt-2">
                {['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                    <span key={m} className={`text-[10px] ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{m}</span>
                ))}
            </div>
        </div>
    );
};

// ===== REVENUE STREAM ROW =====
const RevenueStreamRow: React.FC<{
    isDark: boolean;
    stream: RevenueStream;
    onEdit?: () => void;
}> = ({ isDark, stream, onEdit }) => (
    <div className={`
        p-4 rounded-xl border flex items-center gap-4 group
        transition-all duration-200 hover:translate-x-1
        ${isDark ? 'bg-[#0d0d0d] border-emerald-500/10 hover:border-emerald-500/30' : 'bg-white border-gray-100 hover:border-emerald-200'}
    `}>
        <div className={`
            w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
            ${stream.type === 'recurring'
                ? (isDark ? 'bg-emerald-500/20 ring-1 ring-emerald-500/30' : 'bg-emerald-100')
                : (isDark ? 'bg-blue-500/20 ring-1 ring-blue-500/30' : 'bg-blue-100')
            }
        `}>
            {stream.type === 'recurring' ? (
                <RefreshCw className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            ) : (
                <Zap className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            )}
        </div>

        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
                <p className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stream.name}
                </p>
                {stream.status === 'churned' && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'}`}>
                        Churned
                    </span>
                )}
            </div>
            {stream.customer && (
                <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                    {stream.customer}
                </p>
            )}
        </div>

        <div className="text-right">
            <p className={`font-bold ${stream.status === 'churned'
                    ? (isDark ? 'text-white/30 line-through' : 'text-gray-300 line-through')
                    : (isDark ? 'text-white' : 'text-gray-900')
                }`}>
                ${stream.amount.toLocaleString()}
            </p>
            <p className={`text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                {stream.frequency === 'monthly' ? '/mo' : stream.frequency === 'annual' ? '/yr' : 'one-time'}
            </p>
        </div>

        {stream.type === 'recurring' && stream.nextPayment && (
            <div className={`text-right hidden sm:block ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                <p className="text-[10px] uppercase tracking-wider">Next</p>
                <p className="text-xs">{stream.nextPayment}</p>
            </div>
        )}
    </div>
);

// ===== ADD REVENUE MODAL =====
const AddRevenueModal: React.FC<{
    isDark: boolean;
    isOpen: boolean;
    onClose: () => void;
    onAdd: (stream: Omit<RevenueStream, 'id'>) => void;
}> = ({ isDark, isOpen, onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [customer, setCustomer] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'recurring' | 'one-time'>('recurring');
    const [frequency, setFrequency] = useState<'monthly' | 'annual'>('monthly');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (name && amount) {
            onAdd({
                name,
                customer: customer || undefined,
                amount: Number(amount),
                type,
                frequency: type === 'recurring' ? frequency : undefined,
                status: 'active',
                startDate: new Date().toISOString().split('T')[0],
                nextPayment: type === 'recurring'
                    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    : undefined
            });
            setName(''); setCustomer(''); setAmount(''); setType('recurring');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full max-w-md p-6 rounded-3xl ${isDark ? 'bg-[#0c0c0c]' : 'bg-white'}`}
                style={{ boxShadow: isDark ? '0 0 60px rgba(16, 185, 129, 0.15)' : '0 25px 80px rgba(0,0,0,0.2)' }}>

                <div className="flex items-center justify-between mb-6">
                    <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Add Revenue</h2>
                    <button onClick={onClose} className={`p-2 rounded-xl ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
                        <X className={`w-5 h-5 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
                    </button>
                </div>

                <div className="space-y-4 mb-6">
                    {/* Type Toggle */}
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setType('recurring')}
                            className={`py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 ${type === 'recurring' ? 'bg-emerald-500 text-white' : (isDark ? 'bg-white/5 text-white/50' : 'bg-gray-100 text-gray-500')
                                }`}
                        >
                            <RefreshCw className="w-4 h-4" /> Recurring
                        </button>
                        <button
                            onClick={() => setType('one-time')}
                            className={`py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 ${type === 'one-time' ? 'bg-emerald-500 text-white' : (isDark ? 'bg-white/5 text-white/50' : 'bg-gray-100 text-gray-500')
                                }`}
                        >
                            <Zap className="w-4 h-4" /> One-time
                        </button>
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                            Revenue Name *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Pro Plan, Consulting, etc."
                            className={`w-full px-4 py-3 rounded-xl text-sm border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-gray-50 border-gray-200'
                                }`}
                        />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                            Customer <span className={`${isDark ? 'text-white/30' : 'text-gray-400'}`}>(optional)</span>
                        </label>
                        <input
                            type="text"
                            value={customer}
                            onChange={(e) => setCustomer(e.target.value)}
                            placeholder="Customer or company name"
                            className={`w-full px-4 py-3 rounded-xl text-sm border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-gray-50 border-gray-200'
                                }`}
                        />
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

                        {type === 'recurring' && (
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                                    Frequency
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setFrequency('monthly')}
                                        className={`py-3 rounded-xl text-xs font-medium ${frequency === 'monthly' ? 'bg-emerald-500 text-white' : (isDark ? 'bg-white/5 text-white/50' : 'bg-gray-100')
                                            }`}
                                    >
                                        Monthly
                                    </button>
                                    <button
                                        onClick={() => setFrequency('annual')}
                                        className={`py-3 rounded-xl text-xs font-medium ${frequency === 'annual' ? 'bg-emerald-500 text-white' : (isDark ? 'bg-white/5 text-white/50' : 'bg-gray-100')
                                            }`}
                                    >
                                        Annual
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={!name || !amount}
                    className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 ${name && amount
                            ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                            : (isDark ? 'bg-white/5 text-white/20' : 'bg-gray-100 text-gray-300')
                        }`}
                >
                    <Plus className="w-4 h-4" /> Add Revenue
                </button>
            </div>
        </div>
    );
};

// ===== MAIN COMPONENT =====
export const IncomePage: React.FC<IncomePageProps> = ({ isDark }) => {
    const [streams, setStreams] = useState<RevenueStream[]>([
        { id: '1', name: 'Pro Plan', customer: 'Acme Corp', amount: 299, type: 'recurring', frequency: 'monthly', status: 'active', startDate: '2024-01-15', nextPayment: 'Jan 15' },
        { id: '2', name: 'Enterprise', customer: 'TechStart Inc', amount: 999, type: 'recurring', frequency: 'monthly', status: 'active', startDate: '2024-02-01', nextPayment: 'Jan 1' },
        { id: '3', name: 'Starter Plan', customer: 'Local Biz', amount: 49, type: 'recurring', frequency: 'monthly', status: 'active', startDate: '2024-03-10', nextPayment: 'Jan 10' },
        { id: '4', name: 'Consulting', customer: 'BigCo Ltd', amount: 5000, type: 'one-time', status: 'active', startDate: '2024-12-01' },
        { id: '5', name: 'Starter Plan', customer: 'Failed Startup', amount: 49, type: 'recurring', frequency: 'monthly', status: 'churned', startDate: '2024-06-01' },
        { id: '6', name: 'Pro Plan', customer: 'GrowthCo', amount: 299, type: 'recurring', frequency: 'monthly', status: 'active', startDate: '2024-08-20', nextPayment: 'Jan 20' },
    ]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [filter, setFilter] = useState<'all' | 'recurring' | 'one-time'>('all');

    // Calculate metrics
    const metrics = useMemo(() => {
        const activeRecurring = streams.filter(s => s.status === 'active' && s.type === 'recurring');
        const mrr = activeRecurring.reduce((sum, s) => sum + (s.frequency === 'annual' ? s.amount / 12 : s.amount), 0);
        const arr = mrr * 12;
        const customerCount = new Set(activeRecurring.map(s => s.customer).filter(Boolean)).size;
        const oneTimeTotal = streams.filter(s => s.type === 'one-time' && s.status === 'active')
            .reduce((sum, s) => sum + s.amount, 0);

        return { mrr, arr, customerCount, oneTimeTotal, activeCount: activeRecurring.length };
    }, [streams]);

    // Trend data (simulated 6 months)
    const trendData = [8500, 9200, 10100, 11000, 12500, metrics.mrr || 14000];

    const filteredStreams = streams.filter(s => {
        if (filter === 'recurring') return s.type === 'recurring';
        if (filter === 'one-time') return s.type === 'one-time';
        return true;
    });

    const handleAddStream = (stream: Omit<RevenueStream, 'id'>) => {
        setStreams(prev => [{ ...stream, id: Date.now().toString() }, ...prev]);
    };

    return (
        <div className="flex-1 overflow-y-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <DollarSign className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-emerald-500/60' : 'text-emerald-600/80'}`}>
                            Finance • Income
                        </span>
                    </div>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        Revenue Tracking
                    </h1>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-400 transition-colors"
                    style={{ boxShadow: isDark ? '0 0 20px rgba(16, 185, 129, 0.3)' : 'none' }}
                >
                    <Plus className="w-4 h-4" /> Add Revenue
                </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <MetricCard
                    isDark={isDark}
                    icon={TrendingUp}
                    label="Monthly Recurring"
                    value={`$${(metrics.mrr / 1000).toFixed(1)}k`}
                    change={12}
                    subValue="MRR"
                    highlight
                />
                <MetricCard
                    isDark={isDark}
                    icon={Target}
                    label="Annual Recurring"
                    value={`$${(metrics.arr / 1000).toFixed(0)}k`}
                    subValue="ARR"
                />
                <MetricCard
                    isDark={isDark}
                    icon={Users}
                    label="Active Customers"
                    value={metrics.customerCount.toString()}
                    change={8}
                    subValue={`${metrics.activeCount} subscriptions`}
                />
                <MetricCard
                    isDark={isDark}
                    icon={Zap}
                    label="One-time Revenue"
                    value={`$${(metrics.oneTimeTotal / 1000).toFixed(1)}k`}
                    subValue="This month"
                />
            </div>

            {/* Chart & Insights */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
                <RevenueTrendChart isDark={isDark} data={trendData} />

                {/* AI Insights */}
                <div className={`p-5 rounded-2xl border ${isDark ? 'bg-gradient-to-br from-emerald-500/10 to-[#0d0d0d] border-emerald-500/20' : 'bg-gradient-to-br from-emerald-50 to-white border-emerald-200'}`}>
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            AI Insights
                        </span>
                    </div>

                    <div className="space-y-3">
                        <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-white'}`}>
                            <p className={`text-sm ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                                <strong className="text-emerald-400">Growing +12%</strong> MoM. At this rate, you'll hit <strong className="text-emerald-400">$20k MRR</strong> by April.
                            </p>
                        </div>
                        <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-white'}`}>
                            <p className={`text-sm ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                                <strong className="text-yellow-400">1 customer churned</strong> this month. Consider a win-back campaign.
                            </p>
                        </div>
                        <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-white'}`}>
                            <p className={`text-sm ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                                Enterprise tier ($999) has highest LTV. <strong className="text-emerald-400">Focus upsells here.</strong>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Revenue Streams */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                        <Receipt className="w-4 h-4" />
                        Revenue Streams ({filteredStreams.length})
                    </h3>

                    <div className="flex items-center gap-2">
                        {(['all', 'recurring', 'one-time'] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${filter === f
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
                    {filteredStreams.map(stream => (
                        <RevenueStreamRow
                            key={stream.id}
                            isDark={isDark}
                            stream={stream}
                        />
                    ))}
                </div>
            </div>

            {/* Add Modal */}
            <AddRevenueModal
                isDark={isDark}
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAdd={handleAddStream}
            />
        </div>
    );
};

export default IncomePage;
