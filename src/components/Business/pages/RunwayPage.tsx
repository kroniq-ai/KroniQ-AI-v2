/**
 * RunwayPage - Advanced Financial Runway Calculator
 * Interactive runway with scenario planning, projections & AI insights
 * Premium green glowing design
 */

import React, { useState, useMemo } from 'react';
import {
    Wallet,
    TrendingDown,
    TrendingUp,
    Calendar,
    Edit3,
    Check,
    X,
    AlertTriangle,
    Users,
    DollarSign,
    Package,
    Scissors,
    Rocket,
    BarChart3,
    Sparkles,
    Clock,
    Target,
    ArrowUpRight,
    ArrowDownRight,
    PiggyBank,
    Briefcase,
    ChevronRight
} from 'lucide-react';

interface RunwayPageProps {
    isDark: boolean;
}

interface FinancialData {
    currentBalance: number;
    monthlyRevenue: number;
    monthlyBurn: number;
    lastUpdated: string;
}

interface Scenario {
    id: string;
    name: string;
    icon: React.ElementType;
    description: string;
    burnChange: number;
    revenueChange: number;
    balanceChange: number;
    color: string;
}

// ===== STAT CARD =====
interface StatCardProps {
    isDark: boolean;
    icon: React.ElementType;
    label: string;
    value: string;
    subValue?: string;
    trend?: 'up' | 'down' | 'neutral';
    highlight?: boolean;
    warning?: boolean;
    onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
    isDark, icon: Icon, label, value, subValue, trend, highlight, warning, onClick
}) => (
    <div
        onClick={onClick}
        className={`
            relative p-5 rounded-2xl border overflow-hidden transition-all duration-300
            ${onClick ? 'cursor-pointer hover:translate-y-[-2px]' : ''}
            ${warning
                ? (isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200')
                : highlight
                    ? (isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200')
                    : (isDark ? 'bg-[#0d0d0d] border-emerald-500/10' : 'bg-white border-gray-100')
            }
        `}
        style={{
            boxShadow: isDark && (highlight || warning)
                ? `0 0 25px ${warning ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)'}`
                : 'none'
        }}
    >
        {/* Glow effect for highlight */}
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
                    <Icon className={`w-5 h-5 ${warning
                            ? (isDark ? 'text-red-400' : 'text-red-600')
                            : (isDark ? 'text-emerald-400' : 'text-emerald-600')
                        }`} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-red-500' : 'text-gray-400'
                        }`}>
                        {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> :
                            trend === 'down' ? <ArrowDownRight className="w-3 h-3" /> : null}
                    </div>
                )}
            </div>
            <p className={`text-xs font-medium mb-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                {label}
            </p>
            <p className={`text-2xl font-bold ${warning ? (isDark ? 'text-red-400' : 'text-red-600') : (isDark ? 'text-white' : 'text-gray-900')
                }`} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
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

// ===== SCENARIO CARD =====
interface ScenarioCardProps {
    isDark: boolean;
    scenario: Scenario;
    isActive: boolean;
    onToggle: () => void;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({ isDark, scenario, isActive, onToggle }) => {
    const Icon = scenario.icon;

    return (
        <button
            onClick={onToggle}
            className={`
                w-full p-4 rounded-xl border text-left transition-all duration-300
                ${isActive
                    ? (isDark
                        ? 'bg-emerald-500/15 border-emerald-500/40 ring-1 ring-emerald-500/20'
                        : 'bg-emerald-50 border-emerald-300')
                    : (isDark
                        ? 'bg-[#0d0d0d] border-white/5 hover:border-emerald-500/30'
                        : 'bg-white border-gray-100 hover:border-emerald-200')
                }
            `}
        >
            <div className="flex items-center gap-3">
                <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                    ${isActive
                        ? 'bg-emerald-500/20'
                        : (isDark ? 'bg-white/5' : 'bg-gray-100')
                    }
                `}>
                    <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : (isDark ? 'text-white/40' : 'text-gray-400')
                        }`} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {scenario.name}
                    </p>
                    <p className={`text-xs truncate ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                        {scenario.description}
                    </p>
                </div>
                <div className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                    ${isActive
                        ? 'border-emerald-500 bg-emerald-500'
                        : (isDark ? 'border-white/20' : 'border-gray-300')
                    }
                `}>
                    {isActive && <Check className="w-3 h-3 text-white" />}
                </div>
            </div>
            {isActive && (
                <div className={`mt-3 pt-3 border-t ${isDark ? 'border-emerald-500/20' : 'border-emerald-100'}`}>
                    <div className="flex items-center gap-4 text-xs">
                        {scenario.burnChange !== 0 && (
                            <span className={scenario.burnChange > 0 ? 'text-red-400' : 'text-emerald-400'}>
                                Burn: {scenario.burnChange > 0 ? '+' : ''}{(scenario.burnChange / 1000).toFixed(0)}k/mo
                            </span>
                        )}
                        {scenario.revenueChange !== 0 && (
                            <span className="text-emerald-400">
                                Revenue: +{(scenario.revenueChange / 1000).toFixed(0)}k/mo
                            </span>
                        )}
                        {scenario.balanceChange !== 0 && (
                            <span className="text-emerald-400">
                                +${(scenario.balanceChange / 1000).toFixed(0)}k cash
                            </span>
                        )}
                    </div>
                </div>
            )}
        </button>
    );
};

// ===== RUNWAY CHART =====
interface RunwayChartProps {
    isDark: boolean;
    data: { month: number; balance: number; projected?: boolean }[];
    zeroMonth: number | null;
}

const RunwayChart: React.FC<RunwayChartProps> = ({ isDark, data, zeroMonth }) => {
    const maxBalance = Math.max(...data.map(d => d.balance), 0);

    return (
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#0d0d0d] border-emerald-500/10' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <BarChart3 className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        12-Month Projection
                    </span>
                </div>
                {zeroMonth !== null && (
                    <span className={`text-xs px-2 py-1 rounded-lg ${isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'}`}>
                        Runway ends month {zeroMonth}
                    </span>
                )}
            </div>

            <div className="flex items-end gap-1 h-32">
                {data.map((item, i) => {
                    const height = maxBalance > 0 ? (item.balance / maxBalance) * 100 : 0;
                    const isNegative = item.balance < 0;

                    return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div
                                className={`w-full rounded-t transition-all duration-300 ${isNegative
                                        ? (isDark ? 'bg-red-500/40' : 'bg-red-300')
                                        : item.projected
                                            ? (isDark ? 'bg-emerald-500/30' : 'bg-emerald-200')
                                            : (isDark ? 'bg-emerald-500' : 'bg-emerald-400')
                                    }`}
                                style={{
                                    height: `${Math.max(Math.abs(height), 4)}%`,
                                    boxShadow: !item.projected && isDark && !isNegative ? '0 0 10px rgba(16, 185, 129, 0.3)' : 'none'
                                }}
                            />
                            <span className={`text-[9px] ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                                M{item.month}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center justify-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${isDark ? 'bg-emerald-500' : 'bg-emerald-400'}`} />
                    <span className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Actual</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${isDark ? 'bg-emerald-500/30' : 'bg-emerald-200'}`} />
                    <span className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Projected</span>
                </div>
            </div>
        </div>
    );
};

// ===== MAIN COMPONENT =====
export const RunwayPage: React.FC<RunwayPageProps> = ({ isDark }) => {
    const [data, setData] = useState<FinancialData>({
        currentBalance: 250000,
        monthlyRevenue: 12000,
        monthlyBurn: 45000,
        lastUpdated: new Date().toLocaleDateString()
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(data);
    const [activeScenarios, setActiveScenarios] = useState<Set<string>>(new Set());

    const scenarios: Scenario[] = [
        {
            id: 'hire',
            name: 'Hire 1 Engineer',
            icon: Users,
            description: '+$8k/mo salary + benefits',
            burnChange: 8000,
            revenueChange: 0,
            balanceChange: 0,
            color: 'yellow'
        },
        {
            id: 'funding',
            name: 'Close Seed Round',
            icon: Rocket,
            description: '$500k at $5M valuation',
            burnChange: 0,
            revenueChange: 0,
            balanceChange: 500000,
            color: 'green'
        },
        {
            id: 'growth',
            name: 'Scale Marketing',
            icon: TrendingUp,
            description: '+$5k spend → +$15k MRR',
            burnChange: 5000,
            revenueChange: 15000,
            balanceChange: 0,
            color: 'blue'
        },
        {
            id: 'cut',
            name: 'Cut to Essential',
            icon: Scissors,
            description: 'Remove non-core expenses',
            burnChange: -12000,
            revenueChange: 0,
            balanceChange: 0,
            color: 'red'
        }
    ];

    // Calculate adjusted values based on scenarios
    const adjustedData = useMemo(() => {
        let adjustedBurn = data.monthlyBurn;
        let adjustedRevenue = data.monthlyRevenue;
        let adjustedBalance = data.currentBalance;

        scenarios.forEach(s => {
            if (activeScenarios.has(s.id)) {
                adjustedBurn += s.burnChange;
                adjustedRevenue += s.revenueChange;
                adjustedBalance += s.balanceChange;
            }
        });

        return {
            burn: adjustedBurn,
            revenue: adjustedRevenue,
            balance: adjustedBalance
        };
    }, [data, activeScenarios]);

    const netBurn = adjustedData.burn - adjustedData.revenue;
    const runwayMonths = netBurn > 0 ? Math.floor(adjustedData.balance / netBurn) : Infinity;
    const runwayWarning = runwayMonths <= 6;

    // Generate projection data
    const projectionData = useMemo(() => {
        const months = [];
        let balance = adjustedData.balance;
        let zeroMonth: number | null = null;

        for (let i = 1; i <= 12; i++) {
            balance -= netBurn;
            if (balance <= 0 && zeroMonth === null) {
                zeroMonth = i;
            }
            months.push({
                month: i,
                balance: Math.max(balance, -50000),
                projected: i > 1
            });
        }

        return { months, zeroMonth };
    }, [adjustedData.balance, netBurn]);

    const toggleScenario = (id: string) => {
        setActiveScenarios(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const saveEdits = () => {
        setData(editData);
        setIsEditing(false);
    };

    const cancelEdits = () => {
        setEditData(data);
        setIsEditing(false);
    };

    // AI Insights based on data
    const getInsight = () => {
        if (runwayMonths <= 3) {
            return {
                type: 'critical',
                message: "Critical runway alert. Consider raising emergency funding or cutting to essential operations immediately.",
                action: "Apply scenario: Cut to Essential"
            };
        }
        if (runwayMonths <= 6) {
            return {
                type: 'warning',
                message: "You have less than 6 months of runway. Start fundraising conversations now — they typically take 3-4 months to close.",
                action: "Explore funding scenarios"
            };
        }
        if (netBurn > data.monthlyRevenue * 3) {
            return {
                type: 'info',
                message: "Your burn is 3x+ your revenue. Focus on path to profitability or prepare for fundraising.",
                action: "Review expense breakdown"
            };
        }
        return {
            type: 'success',
            message: "Your runway looks healthy. Consider investing in growth to accelerate revenue.",
            action: "Explore growth scenarios"
        };
    };

    const insight = getInsight();

    return (
        <div className="flex-1 overflow-y-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Wallet className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-emerald-500/60' : 'text-emerald-600/80'}`}>
                            Finance • Runway
                        </span>
                    </div>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        Runway Calculator
                    </h1>
                </div>

                {isEditing ? (
                    <div className="flex items-center gap-2">
                        <button onClick={cancelEdits} className={`px-3 py-2 rounded-lg text-sm ${isDark ? 'bg-white/5 text-white/50' : 'bg-gray-100 text-gray-500'}`}>
                            <X className="w-4 h-4" />
                        </button>
                        <button onClick={saveEdits} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white text-sm font-medium">
                            <Check className="w-4 h-4" /> Save
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsEditing(true)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-white/5 text-white/70 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        <Edit3 className="w-4 h-4" /> Edit Numbers
                    </button>
                )}
            </div>

            {/* AI Insight Banner */}
            <div className={`p-4 rounded-2xl mb-6 border ${insight.type === 'critical'
                    ? (isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200')
                    : insight.type === 'warning'
                        ? (isDark ? 'bg-yellow-500/10 border-yellow-500/20' : 'bg-yellow-50 border-yellow-200')
                        : insight.type === 'success'
                            ? (isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200')
                            : (isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200')
                }`}>
                <div className="flex items-start gap-3">
                    <Sparkles className={`w-5 h-5 mt-0.5 ${insight.type === 'critical' ? 'text-red-400' :
                            insight.type === 'warning' ? 'text-yellow-400' :
                                isDark ? 'text-emerald-400' : 'text-emerald-600'
                        }`} />
                    <div className="flex-1">
                        <p className={`text-sm font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {insight.message}
                        </p>
                        <button className={`text-xs font-medium flex items-center gap-1 ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'
                            }`}>
                            {insight.action} <ChevronRight className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    isDark={isDark}
                    icon={PiggyBank}
                    label="Cash Balance"
                    value={`$${(adjustedData.balance / 1000).toFixed(0)}k`}
                    subValue={activeScenarios.size > 0 ? 'With scenarios' : 'Current'}
                    trend="neutral"
                    highlight
                />
                <StatCard
                    isDark={isDark}
                    icon={TrendingDown}
                    label="Monthly Burn"
                    value={`$${(adjustedData.burn / 1000).toFixed(0)}k`}
                    subValue={`Net: $${(netBurn / 1000).toFixed(0)}k/mo`}
                    trend="down"
                />
                <StatCard
                    isDark={isDark}
                    icon={TrendingUp}
                    label="Monthly Revenue"
                    value={`$${(adjustedData.revenue / 1000).toFixed(0)}k`}
                    subValue="MRR"
                    trend="up"
                />
                <StatCard
                    isDark={isDark}
                    icon={Calendar}
                    label="Runway"
                    value={runwayMonths === Infinity ? '∞' : `${runwayMonths} mo`}
                    subValue={runwayMonths !== Infinity ? `Until ${new Date(Date.now() + runwayMonths * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}` : 'Profitable'}
                    warning={runwayWarning}
                />
            </div>

            {/* Edit Form */}
            {isEditing && (
                <div className={`p-5 rounded-2xl border mb-6 ${isDark ? 'bg-[#0d0d0d] border-emerald-500/20' : 'bg-white border-gray-200'}`}>
                    <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Update Financial Data</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Current Balance ($)</label>
                            <input
                                type="number"
                                value={editData.currentBalance}
                                onChange={(e) => setEditData({ ...editData, currentBalance: Number(e.target.value) })}
                                className={`w-full px-4 py-3 rounded-xl border outline-none text-lg font-bold ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                                    }`}
                            />
                        </div>
                        <div>
                            <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Monthly Burn ($)</label>
                            <input
                                type="number"
                                value={editData.monthlyBurn}
                                onChange={(e) => setEditData({ ...editData, monthlyBurn: Number(e.target.value) })}
                                className={`w-full px-4 py-3 rounded-xl border outline-none text-lg font-bold ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                                    }`}
                            />
                        </div>
                        <div>
                            <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Monthly Revenue ($)</label>
                            <input
                                type="number"
                                value={editData.monthlyRevenue}
                                onChange={(e) => setEditData({ ...editData, monthlyRevenue: Number(e.target.value) })}
                                className={`w-full px-4 py-3 rounded-xl border outline-none text-lg font-bold ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'
                                    }`}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Scenario Planning */}
                <div>
                    <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                        <Target className="w-4 h-4" />
                        Scenario Planning
                    </h3>
                    <div className="space-y-3">
                        {scenarios.map(scenario => (
                            <ScenarioCard
                                key={scenario.id}
                                isDark={isDark}
                                scenario={scenario}
                                isActive={activeScenarios.has(scenario.id)}
                                onToggle={() => toggleScenario(scenario.id)}
                            />
                        ))}
                    </div>
                </div>

                {/* Projection Chart */}
                <div>
                    <h3 className={`text-sm font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                        <BarChart3 className="w-4 h-4" />
                        Cash Projection
                    </h3>
                    <RunwayChart
                        isDark={isDark}
                        data={projectionData.months}
                        zeroMonth={projectionData.zeroMonth}
                    />

                    {/* Quick Stats */}
                    <div className={`mt-4 p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className={`text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Break-even at</p>
                                <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    ${(adjustedData.burn / 1000).toFixed(0)}k MRR
                                </p>
                            </div>
                            <div>
                                <p className={`text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Need to raise by</p>
                                <p className={`font-bold ${runwayWarning ? 'text-red-400' : (isDark ? 'text-white' : 'text-gray-900')}`}>
                                    {runwayMonths > 6
                                        ? new Date(Date.now() + (runwayMonths - 3) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
                                        : 'ASAP'
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RunwayPage;
