/**
 * Runway Page — Finance Agent
 * Track cash balance, burn rate, and runway
 */

import React, { useState } from 'react';
import {
    DollarSign,
    TrendingDown,
    Calendar,
    AlertTriangle,
    CheckCircle,
    Plus,
    Edit3,
    Sparkles,
    ArrowRight,
    Wallet,
    Clock
} from 'lucide-react';
import { useSharedAgentContext } from '../../../contexts/SharedAgentContext';

interface RunwayPageProps {
    isDark: boolean;
}

interface RunwayData {
    currentBalance: number;
    monthlyBurn: number;
    lastUpdated: Date;
}

export const RunwayPage: React.FC<RunwayPageProps> = ({ isDark }) => {
    const { state, addMessage } = useSharedAgentContext();

    // Get saved data from context or use defaults
    const [runwayData, setRunwayData] = useState<RunwayData>({
        currentBalance: 50000,
        monthlyBurn: 8000,
        lastUpdated: new Date()
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editBalance, setEditBalance] = useState(runwayData.currentBalance.toString());
    const [editBurn, setEditBurn] = useState(runwayData.monthlyBurn.toString());

    // Calculate runway
    const runwayMonths = runwayData.monthlyBurn > 0
        ? Math.floor(runwayData.currentBalance / runwayData.monthlyBurn)
        : Infinity;

    const runwayStatus = runwayMonths <= 3 ? 'critical' : runwayMonths <= 6 ? 'warning' : 'healthy';

    const handleSave = () => {
        const balance = parseFloat(editBalance) || 0;
        const burn = parseFloat(editBurn) || 0;
        setRunwayData({
            currentBalance: balance,
            monthlyBurn: burn,
            lastUpdated: new Date()
        });
        setIsEditing(false);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-1">
                    <DollarSign className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-emerald-500/60' : 'text-emerald-600/80'}`}>
                        Finance Agent
                    </span>
                </div>
                <h1
                    className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                    style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                >
                    Runway
                </h1>
                <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                    Track your cash position and burn rate
                </p>
            </div>

            {/* Main Runway Card */}
            <div className={`
                relative p-8 rounded-3xl mb-6 overflow-hidden
                ${isDark
                    ? 'bg-gradient-to-br from-emerald-900/40 via-[#0c0c0c] to-[#0a0a0a] border border-emerald-500/30'
                    : 'bg-gradient-to-br from-emerald-50 to-white border border-emerald-200'}
            `}
                style={{
                    boxShadow: isDark ? '0 0 60px rgba(16, 185, 129, 0.15)' : '0 10px 40px rgba(16, 185, 129, 0.1)'
                }}
            >
                {/* Status badge */}
                <div className={`
                    absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold
                    ${runwayStatus === 'critical'
                        ? (isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-700')
                        : runwayStatus === 'warning'
                            ? (isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700')
                            : (isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700')}
                `}>
                    {runwayStatus === 'critical' ? (
                        <><AlertTriangle className="w-3.5 h-3.5" /> Critical</>
                    ) : runwayStatus === 'warning' ? (
                        <><Clock className="w-3.5 h-3.5" /> Low</>
                    ) : (
                        <><CheckCircle className="w-3.5 h-3.5" /> Healthy</>
                    )}
                </div>

                {/* Main number */}
                <div className="text-center mb-8">
                    <p className={`text-sm font-medium mb-2 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                        Runway Remaining
                    </p>
                    <div className={`text-6xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {runwayMonths === Infinity ? '∞' : runwayMonths}
                    </div>
                    <p className={`text-lg ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        months
                    </p>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className={`p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-emerald-50'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <Wallet className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                            <span className={`text-xs font-medium ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                                Current Balance
                            </span>
                        </div>
                        <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(runwayData.currentBalance)}
                        </p>
                    </div>

                    <div className={`p-4 rounded-2xl ${isDark ? 'bg-white/5' : 'bg-emerald-50'}`}>
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingDown className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
                            <span className={`text-xs font-medium ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                                Monthly Burn
                            </span>
                        </div>
                        <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {formatCurrency(runwayData.monthlyBurn)}
                        </p>
                    </div>
                </div>

                {/* Edit button */}
                <button
                    onClick={() => setIsEditing(true)}
                    className={`
                        mt-6 w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2
                        ${isDark
                            ? 'bg-white/5 text-white/60 hover:bg-white/10'
                            : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}
                        transition-colors
                    `}
                >
                    <Edit3 className="w-4 h-4" />
                    Update Numbers
                </button>
            </div>

            {/* AI Insight */}
            <div className={`
                p-5 rounded-2xl mb-6
                ${isDark ? 'bg-[#0c0c0c] border border-emerald-500/20' : 'bg-white border border-gray-200'}
            `}>
                <div className="flex items-start gap-3">
                    <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                        ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}
                    `}>
                        <Sparkles className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    </div>
                    <div>
                        <p className={`text-sm font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            AI Insight
                        </p>
                        <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                            {runwayStatus === 'critical'
                                ? `⚠️ Your runway is critically low at ${runwayMonths} months. Consider reducing expenses or raising funds immediately.`
                                : runwayStatus === 'warning'
                                    ? `📊 With ${runwayMonths} months of runway, you should start planning your next funding round or cost reduction measures.`
                                    : `✅ Your runway of ${runwayMonths} months is healthy. Focus on growth while maintaining this buffer.`}
                        </p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
                <button className={`
                    p-4 rounded-2xl text-left
                    ${isDark
                        ? 'bg-[#0c0c0c] border border-white/5 hover:border-emerald-500/30'
                        : 'bg-white border border-gray-200 hover:border-emerald-300'}
                    transition-colors
                `}>
                    <div className="flex items-center gap-2 mb-1">
                        <Plus className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Log Income
                        </span>
                    </div>
                    <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                        Record new revenue
                    </p>
                </button>

                <button className={`
                    p-4 rounded-2xl text-left
                    ${isDark
                        ? 'bg-[#0c0c0c] border border-white/5 hover:border-emerald-500/30'
                        : 'bg-white border border-gray-200 hover:border-emerald-300'}
                    transition-colors
                `}>
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingDown className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
                        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Log Expense
                        </span>
                    </div>
                    <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                        Record new cost
                    </p>
                </button>
            </div>

            {/* Edit Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsEditing(false)} />
                    <div className={`
                        relative w-full max-w-md p-6 rounded-3xl
                        ${isDark ? 'bg-[#0c0c0c]' : 'bg-white'}
                    `}
                        style={{ boxShadow: isDark ? '0 0 60px rgba(16, 185, 129, 0.15)' : '0 20px 60px rgba(0,0,0,0.2)' }}
                    >
                        <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Update Runway
                        </h2>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                                    Current Balance ($)
                                </label>
                                <input
                                    type="number"
                                    value={editBalance}
                                    onChange={(e) => setEditBalance(e.target.value)}
                                    className={`
                                        w-full px-4 py-3 rounded-xl text-lg font-medium border outline-none
                                        ${isDark
                                            ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500/50'
                                            : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-emerald-400'}
                                    `}
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                                    Monthly Burn ($)
                                </label>
                                <input
                                    type="number"
                                    value={editBurn}
                                    onChange={(e) => setEditBurn(e.target.value)}
                                    className={`
                                        w-full px-4 py-3 rounded-xl text-lg font-medium border outline-none
                                        ${isDark
                                            ? 'bg-white/5 border-white/10 text-white focus:border-emerald-500/50'
                                            : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-emerald-400'}
                                    `}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsEditing(false)}
                                className={`flex-1 py-3 rounded-xl text-sm font-medium ${isDark ? 'bg-white/5 text-white/50' : 'bg-gray-100 text-gray-500'}`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="flex-1 py-3 rounded-xl text-sm font-semibold bg-emerald-500 text-white hover:bg-emerald-400"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RunwayPage;
