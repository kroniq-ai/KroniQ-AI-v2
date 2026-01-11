/**
 * CustomersPage - Advanced Customer Management
 * Health scores, lifecycle stages, MRR tracking, churn risk analysis
 * Premium green glowing design
 */

import React, { useState, useMemo } from 'react';
import {
    Users,
    Search,
    Plus,
    X,
    Heart,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    MessageSquare,
    Calendar,
    DollarSign,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Sparkles,
    Phone,
    Mail,
    MoreHorizontal,
    Star,
    UserPlus,
    UserMinus,
    Activity,
    Target,
    ChevronRight,
    Crown,
    Clock
} from 'lucide-react';

interface CustomersPageProps {
    isDark: boolean;
}

interface Customer {
    id: string;
    name: string;
    company: string;
    email: string;
    mrr: number;
    healthScore: number;
    stage: 'lead' | 'trial' | 'active' | 'at-risk' | 'churned';
    lastContact: string;
    joinDate: string;
    notes?: string;
    trend: 'up' | 'down' | 'stable';
}

// ===== HEALTH SCORE RING =====
const HealthScoreRing: React.FC<{ score: number; size?: number; isDark: boolean }> = ({ score, size = 48, isDark }) => {
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (score / 100) * circumference;

    const getColor = () => {
        if (score >= 70) return '#10B981';
        if (score >= 40) return '#F59E0B';
        return '#EF4444';
    };

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="w-full h-full transform -rotate-90">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}
                    strokeWidth="4"
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={getColor()}
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference - progress}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {score}
                </span>
            </div>
        </div>
    );
};

// ===== STAGE BADGE =====
const StageBadge: React.FC<{ stage: Customer['stage']; isDark: boolean }> = ({ stage, isDark }) => {
    const config = {
        lead: { label: 'Lead', color: isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700', icon: UserPlus },
        trial: { label: 'Trial', color: isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700', icon: Clock },
        active: { label: 'Active', color: isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700', icon: Crown },
        'at-risk': { label: 'At Risk', color: isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700', icon: AlertTriangle },
        churned: { label: 'Churned', color: isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700', icon: UserMinus }
    };

    const { label, color, icon: Icon } = config[stage];

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium ${color}`}>
            <Icon className="w-3 h-3" />
            {label}
        </span>
    );
};

// ===== CUSTOMER ROW =====
const CustomerRow: React.FC<{
    isDark: boolean;
    customer: Customer;
    onClick: () => void;
}> = ({ isDark, customer, onClick }) => (
    <button
        onClick={onClick}
        className={`
            w-full p-4 rounded-xl border flex items-center gap-4 text-left group
            transition-all duration-300 hover:translate-x-1
            ${customer.stage === 'at-risk'
                ? (isDark ? 'bg-yellow-500/5 border-yellow-500/20 hover:border-yellow-500/40' : 'bg-yellow-50 border-yellow-200')
                : customer.stage === 'churned'
                    ? (isDark ? 'bg-red-500/5 border-red-500/10' : 'bg-red-50/50 border-red-100')
                    : (isDark ? 'bg-[#0d0d0d] border-emerald-500/10 hover:border-emerald-500/30' : 'bg-white border-gray-100 hover:border-emerald-200')
            }
        `}
    >
        {/* Health Score */}
        <HealthScoreRing score={customer.healthScore} isDark={isDark} />

        {/* Customer Info */}
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
                <p className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {customer.name}
                </p>
                {customer.trend === 'down' && (
                    <ArrowDownRight className="w-4 h-4 text-red-400 flex-shrink-0" />
                )}
                {customer.trend === 'up' && (
                    <ArrowUpRight className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                )}
            </div>
            <p className={`text-xs truncate ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                {customer.company} • {customer.email}
            </p>
        </div>

        {/* Stage */}
        <StageBadge stage={customer.stage} isDark={isDark} />

        {/* MRR */}
        <div className="text-right hidden sm:block">
            <p className={`font-bold ${customer.stage === 'churned' ? 'line-through text-white/30' : (isDark ? 'text-white' : 'text-gray-900')}`}>
                ${customer.mrr.toLocaleString()}
            </p>
            <p className={`text-[10px] ${isDark ? 'text-white/30' : 'text-gray-400'}`}>MRR</p>
        </div>

        {/* Last Contact */}
        <div className={`text-right hidden md:block ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
            <p className="text-xs">{customer.lastContact}</p>
            <p className="text-[10px]">last contact</p>
        </div>

        <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
    </button>
);

// ===== STAT CARD =====
const StatCard: React.FC<{
    isDark: boolean;
    icon: React.ElementType;
    label: string;
    value: string;
    change?: number;
    highlight?: boolean;
    warning?: boolean;
}> = ({ isDark, icon: Icon, label, value, change, highlight, warning }) => (
    <div className={`
        relative p-5 rounded-2xl border overflow-hidden
        ${warning
            ? (isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200')
            : highlight
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
                    ${warning
                        ? (isDark ? 'bg-red-500/20' : 'bg-red-100')
                        : highlight
                            ? (isDark ? 'bg-emerald-500/20' : 'bg-emerald-100')
                            : (isDark ? 'bg-emerald-500/10' : 'bg-gray-100')
                    }
                `}>
                    <Icon className={`w-5 h-5 ${warning ? (isDark ? 'text-red-400' : 'text-red-600') : (isDark ? 'text-emerald-400' : 'text-emerald-600')
                        }`} />
                </div>
                {change !== undefined && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${change >= 0 ? 'text-emerald-500' : 'text-red-500'
                        }`}>
                        {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(change)}%
                    </div>
                )}
            </div>
            <p className={`text-xs font-medium mb-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{label}</p>
            <p className={`text-2xl font-bold ${warning ? (isDark ? 'text-red-400' : 'text-red-600') : (isDark ? 'text-white' : 'text-gray-900')
                }`}>{value}</p>
        </div>
    </div>
);

// ===== CUSTOMER DETAIL MODAL =====
const CustomerDetailModal: React.FC<{
    isDark: boolean;
    customer: Customer | null;
    onClose: () => void;
}> = ({ isDark, customer, onClose }) => {
    if (!customer) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full max-w-lg p-6 rounded-3xl ${isDark ? 'bg-[#0c0c0c]' : 'bg-white'}`}
                style={{ boxShadow: isDark ? '0 0 60px rgba(16, 185, 129, 0.15)' : '0 25px 80px rgba(0,0,0,0.2)' }}>

                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <HealthScoreRing score={customer.healthScore} size={56} isDark={isDark} />
                        <div>
                            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {customer.name}
                            </h2>
                            <p className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                                {customer.company}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className={`p-2 rounded-xl ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
                        <X className={`w-5 h-5 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
                    </button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <p className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-white/30' : 'text-gray-400'}`}>MRR</p>
                        <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>${customer.mrr}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <p className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Since</p>
                        <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{customer.joinDate}</p>
                    </div>
                    <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <p className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Stage</p>
                        <StageBadge stage={customer.stage} isDark={isDark} />
                    </div>
                </div>

                {/* AI Insight */}
                {customer.stage === 'at-risk' && (
                    <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-yellow-50 border border-yellow-200'}`}>
                        <div className="flex items-start gap-3">
                            <Sparkles className={`w-4 h-4 mt-0.5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                            <div>
                                <p className={`text-sm font-medium ${isDark ? 'text-yellow-300' : 'text-yellow-800'}`}>
                                    Churn Risk Detected
                                </p>
                                <p className={`text-xs mt-1 ${isDark ? 'text-yellow-400/70' : 'text-yellow-700'}`}>
                                    No activity in 14 days. Consider reaching out with a personalized check-in.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contact Info */}
                <div className={`p-4 rounded-xl mb-6 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <p className={`text-xs font-medium mb-3 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Contact</p>
                    <div className="space-y-2">
                        <button className={`w-full flex items-center gap-3 p-2 rounded-lg ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
                            <Mail className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                            <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{customer.email}</span>
                        </button>
                    </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                    <button className={`py-3 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 ${isDark ? 'bg-white/5 text-white/70 hover:bg-white/10' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}>
                        <Phone className="w-4 h-4" /> Log Call
                    </button>
                    <button className="py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-emerald-500 text-white hover:bg-emerald-400">
                        <MessageSquare className="w-4 h-4" /> Send Email
                    </button>
                </div>
            </div>
        </div>
    );
};

// ===== MAIN COMPONENT =====
export const CustomersPage: React.FC<CustomersPageProps> = ({ isDark }) => {
    const [customers, setCustomers] = useState<Customer[]>([
        { id: '1', name: 'Sarah Chen', company: 'TechStart Inc', email: 'sarah@techstart.io', mrr: 999, healthScore: 92, stage: 'active', lastContact: '2 days ago', joinDate: 'Mar 2024', trend: 'up' },
        { id: '2', name: 'Marcus Rodriguez', company: 'GrowthCo', email: 'marcus@growthco.com', mrr: 299, healthScore: 78, stage: 'active', lastContact: '1 week ago', joinDate: 'Jun 2024', trend: 'stable' },
        { id: '3', name: 'Emily Watson', company: 'ScaleUp LLC', email: 'emily@scaleup.io', mrr: 499, healthScore: 35, stage: 'at-risk', lastContact: '3 weeks ago', joinDate: 'Feb 2024', trend: 'down' },
        { id: '4', name: 'James Park', company: 'InnovateTech', email: 'james@innovatech.co', mrr: 199, healthScore: 65, stage: 'trial', lastContact: '4 days ago', joinDate: 'Dec 2024', trend: 'up' },
        { id: '5', name: 'Lisa Thompson', company: 'DigitalFirst', email: 'lisa@digitalfirst.io', mrr: 0, healthScore: 45, stage: 'lead', lastContact: '1 day ago', joinDate: 'Jan 2025', trend: 'stable' },
        { id: '6', name: 'David Kim', company: 'FastGrowth', email: 'david@fastgrowth.com', mrr: 149, healthScore: 12, stage: 'churned', lastContact: '2 months ago', joinDate: 'Jan 2024', trend: 'down' },
        { id: '7', name: 'Anna Martinez', company: 'CloudNative', email: 'anna@cloudnative.dev', mrr: 799, healthScore: 88, stage: 'active', lastContact: 'Yesterday', joinDate: 'Apr 2024', trend: 'up' },
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [stageFilter, setStageFilter] = useState<Customer['stage'] | 'all'>('all');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    // Calculate metrics
    const metrics = useMemo(() => {
        const active = customers.filter(c => c.stage === 'active');
        const atRisk = customers.filter(c => c.stage === 'at-risk');
        const totalMRR = active.reduce((sum, c) => sum + c.mrr, 0);
        const avgHealth = customers.filter(c => c.stage !== 'churned').reduce((sum, c) => sum + c.healthScore, 0) /
            customers.filter(c => c.stage !== 'churned').length;
        const churnRate = (customers.filter(c => c.stage === 'churned').length / customers.length * 100);

        return {
            totalCustomers: customers.filter(c => c.stage !== 'churned').length,
            totalMRR,
            avgHealth: Math.round(avgHealth),
            atRiskCount: atRisk.length,
            atRiskMRR: atRisk.reduce((sum, c) => sum + c.mrr, 0),
            churnRate: churnRate.toFixed(1)
        };
    }, [customers]);

    const filteredCustomers = customers.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.company.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStage = stageFilter === 'all' || c.stage === stageFilter;
        return matchesSearch && matchesStage;
    });

    return (
        <div className="flex-1 overflow-y-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Users className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-emerald-500/60' : 'text-emerald-600/80'}`}>
                            Customer • CRM
                        </span>
                    </div>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        Customer Health
                    </h1>
                </div>

                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-400"
                    style={{ boxShadow: isDark ? '0 0 20px rgba(16, 185, 129, 0.3)' : 'none' }}>
                    <Plus className="w-4 h-4" /> Add Customer
                </button>
            </div>

            {/* At-Risk Alert */}
            {metrics.atRiskCount > 0 && (
                <div className={`p-4 rounded-2xl mb-6 border ${isDark ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-yellow-50 border-yellow-200'}`}>
                    <div className="flex items-start gap-3">
                        <AlertTriangle className={`w-5 h-5 mt-0.5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                        <div className="flex-1">
                            <p className={`font-medium ${isDark ? 'text-yellow-300' : 'text-yellow-800'}`}>
                                {metrics.atRiskCount} customer{metrics.atRiskCount > 1 ? 's' : ''} at risk (${metrics.atRiskMRR} MRR)
                            </p>
                            <p className={`text-sm mt-1 ${isDark ? 'text-yellow-400/70' : 'text-yellow-700'}`}>
                                Schedule check-in calls to prevent churn.
                            </p>
                        </div>
                        <button className={`px-3 py-1.5 rounded-lg text-xs font-medium ${isDark ? 'bg-yellow-500/20 text-yellow-300' : 'bg-yellow-100 text-yellow-700'}`}>
                            View at-risk
                        </button>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    isDark={isDark}
                    icon={Users}
                    label="Active Customers"
                    value={metrics.totalCustomers.toString()}
                    change={12}
                    highlight
                />
                <StatCard
                    isDark={isDark}
                    icon={DollarSign}
                    label="Total MRR"
                    value={`$${(metrics.totalMRR / 1000).toFixed(1)}k`}
                    change={8}
                />
                <StatCard
                    isDark={isDark}
                    icon={Heart}
                    label="Avg Health Score"
                    value={`${metrics.avgHealth}`}
                />
                <StatCard
                    isDark={isDark}
                    icon={AlertTriangle}
                    label="At Risk"
                    value={metrics.atRiskCount.toString()}
                    warning={metrics.atRiskCount > 0}
                />
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search customers..."
                        className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-gray-50 border-gray-200 placeholder-gray-400'
                            }`}
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto">
                    {(['all', 'active', 'at-risk', 'trial', 'lead'] as const).map(stage => (
                        <button
                            key={stage}
                            onClick={() => setStageFilter(stage)}
                            className={`px-3 py-2 rounded-xl text-xs font-medium capitalize whitespace-nowrap ${stageFilter === stage
                                    ? 'bg-emerald-500 text-white'
                                    : (isDark ? 'bg-white/5 text-white/50' : 'bg-gray-100 text-gray-500')
                                }`}
                        >
                            {stage === 'all' ? 'All' : stage}
                        </button>
                    ))}
                </div>
            </div>

            {/* Customer List */}
            <div className="space-y-2">
                {filteredCustomers.map(customer => (
                    <CustomerRow
                        key={customer.id}
                        isDark={isDark}
                        customer={customer}
                        onClick={() => setSelectedCustomer(customer)}
                    />
                ))}

                {filteredCustomers.length === 0 && (
                    <div className={`py-12 text-center ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                        <Users className="w-8 h-8 mx-auto mb-3 opacity-50" />
                        <p>No customers match your search</p>
                    </div>
                )}
            </div>

            {/* Customer Detail Modal */}
            <CustomerDetailModal
                isDark={isDark}
                customer={selectedCustomer}
                onClose={() => setSelectedCustomer(null)}
            />
        </div>
    );
};

export default CustomersPage;
