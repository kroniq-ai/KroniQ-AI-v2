/**
 * Runway Page - Cash & Burn Tracker
 * Critical feature for founders: Know your runway
 * Premium green design
 */

import React, { useState } from 'react';
import {
    DollarSign,
    TrendingDown,
    Calendar,
    AlertTriangle,
    Edit3,
    Check,
    X
} from 'lucide-react';

interface RunwayPageProps {
    isDark: boolean;
}

interface FinancialData {
    cashInBank: number;
    monthlyBurn: number;
    revenue: number;
}

export const RunwayPage: React.FC<RunwayPageProps> = ({ isDark }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [data, setData] = useState<FinancialData>({
        cashInBank: 75000,
        monthlyBurn: 8500,
        revenue: 2100,
    });
    const [editData, setEditData] = useState(data);

    // Calculate runway
    const netBurn = data.monthlyBurn - data.revenue;
    const runwayMonths = netBurn > 0 ? Math.floor(data.cashInBank / netBurn) : Infinity;
    const isWarning = runwayMonths <= 6 && runwayMonths !== Infinity;
    const isCritical = runwayMonths <= 3 && runwayMonths !== Infinity;

    const handleSave = () => {
        setData(editData);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditData(data);
        setIsEditing(false);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Get runway status color (all green shades)
    const getRunwayColor = () => {
        if (isCritical) return isDark ? 'text-emerald-300' : 'text-emerald-500';
        if (isWarning) return isDark ? 'text-emerald-400' : 'text-emerald-600';
        return isDark ? 'text-emerald-400' : 'text-emerald-700';
    };

    return (
        <div className="flex-1 overflow-y-auto relative">
            {/* Background grid pattern */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: isDark
                        ? `linear-gradient(rgba(16, 185, 129, 0.02) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(16, 185, 129, 0.02) 1px, transparent 1px)`
                        : 'none',
                    backgroundSize: '50px 50px',
                    maskImage: 'radial-gradient(ellipse 100% 60% at 50% 0%, black 0%, transparent 70%)',
                    WebkitMaskImage: 'radial-gradient(ellipse 100% 60% at 50% 0%, black 0%, transparent 70%)'
                }}
            />

            <div className="relative z-10 max-w-2xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1
                            className={`text-2xl font-bold mb-1 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}
                            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                        >
                            Runway
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-emerald-500/50' : 'text-emerald-600/70'}`}>
                            How long can you survive?
                        </p>
                    </div>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                                transition-all duration-200
                                ${isDark
                                    ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                                    : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}
                            `}
                            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                        >
                            <Edit3 className="w-4 h-4" />
                            Update Numbers
                        </button>
                    )}
                </div>

                {/* Main Runway Display */}
                <div
                    className={`
                        relative p-8 rounded-2xl overflow-hidden mb-6
                        ${isDark
                            ? 'bg-gradient-to-br from-emerald-500/10 via-[#0d0d0d] to-[#0d0d0d] border border-emerald-500/20'
                            : 'bg-white border border-emerald-100 shadow-lg'}
                    `}
                    style={{
                        boxShadow: isDark ? '0 0 40px rgba(16, 185, 129, 0.1)' : undefined
                    }}
                >
                    {/* Warning badge */}
                    {(isWarning || isCritical) && (
                        <div className={`
                            absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                            ${isCritical
                                ? (isDark ? 'bg-emerald-300/20 text-emerald-300' : 'bg-emerald-100 text-emerald-600')
                                : (isDark ? 'bg-emerald-400/20 text-emerald-400' : 'bg-emerald-50 text-emerald-500')}
                        `}>
                            <AlertTriangle className="w-3 h-3" />
                            {isCritical ? 'Critical' : 'Low Runway'}
                        </div>
                    )}

                    <div className="text-center">
                        <p className={`text-xs font-medium uppercase tracking-widest mb-2 ${isDark ? 'text-emerald-500/40' : 'text-emerald-400'}`}>
                            Runway Remaining
                        </p>
                        <p
                            className={`text-7xl font-black tracking-tight ${getRunwayColor()}`}
                            style={{
                                fontFamily: 'Inter, system-ui, sans-serif',
                                textShadow: isDark && !isWarning ? '0 0 30px rgba(16, 185, 129, 0.3)' : 'none'
                            }}
                        >
                            {runwayMonths === Infinity ? '∞' : runwayMonths}
                        </p>
                        <p className={`text-lg font-medium ${isDark ? 'text-emerald-500/50' : 'text-emerald-600/70'}`}>
                            {runwayMonths === 1 ? 'month' : 'months'}
                        </p>
                    </div>
                </div>

                {/* Financial Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Cash in Bank */}
                    <div className={`
                        p-5 rounded-xl border
                        ${isDark ? 'bg-[#0d0d0d] border-emerald-500/10' : 'bg-white border-gray-100'}
                    `}>
                        <div className="flex items-center gap-2 mb-3">
                            <DollarSign className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                            <span className={`text-xs font-medium ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                                Cash in Bank
                            </span>
                        </div>
                        {isEditing ? (
                            <input
                                type="number"
                                value={editData.cashInBank}
                                onChange={(e) => setEditData({ ...editData, cashInBank: Number(e.target.value) })}
                                className={`
                                    w-full text-2xl font-bold bg-transparent outline-none
                                    ${isDark ? 'text-white' : 'text-gray-900'}
                                `}
                                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                            />
                        ) : (
                            <p
                                className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                            >
                                {formatCurrency(data.cashInBank)}
                            </p>
                        )}
                    </div>

                    {/* Monthly Burn */}
                    <div className={`
                        p-5 rounded-xl border
                        ${isDark ? 'bg-[#0d0d0d] border-emerald-500/10' : 'bg-white border-gray-100'}
                    `}>
                        <div className="flex items-center gap-2 mb-3">
                            <TrendingDown className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                            <span className={`text-xs font-medium ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                                Monthly Burn
                            </span>
                        </div>
                        {isEditing ? (
                            <input
                                type="number"
                                value={editData.monthlyBurn}
                                onChange={(e) => setEditData({ ...editData, monthlyBurn: Number(e.target.value) })}
                                className={`
                                    w-full text-2xl font-bold bg-transparent outline-none
                                    ${isDark ? 'text-white' : 'text-gray-900'}
                                `}
                                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                            />
                        ) : (
                            <p
                                className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                            >
                                {formatCurrency(data.monthlyBurn)}
                            </p>
                        )}
                    </div>

                    {/* Revenue */}
                    <div className={`
                        p-5 rounded-xl border
                        ${isDark ? 'bg-[#0d0d0d] border-emerald-500/10' : 'bg-white border-gray-100'}
                    `}>
                        <div className="flex items-center gap-2 mb-3">
                            <Calendar className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                            <span className={`text-xs font-medium ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                                Monthly Revenue
                            </span>
                        </div>
                        {isEditing ? (
                            <input
                                type="number"
                                value={editData.revenue}
                                onChange={(e) => setEditData({ ...editData, revenue: Number(e.target.value) })}
                                className={`
                                    w-full text-2xl font-bold bg-transparent outline-none
                                    ${isDark ? 'text-white' : 'text-gray-900'}
                                `}
                                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                            />
                        ) : (
                            <p
                                className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                            >
                                {formatCurrency(data.revenue)}
                            </p>
                        )}
                    </div>
                </div>

                {/* Edit Actions */}
                {isEditing && (
                    <div className="flex items-center justify-end gap-3">
                        <button
                            onClick={handleCancel}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                                ${isDark ? 'text-white/50 hover:text-white' : 'text-gray-500 hover:text-gray-700'}
                            `}
                        >
                            <X className="w-4 h-4" />
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className={`
                                flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                                bg-emerald-500 text-white hover:bg-emerald-400
                                transition-all duration-200
                            `}
                            style={{
                                boxShadow: isDark ? '0 0 20px rgba(16, 185, 129, 0.3)' : 'none'
                            }}
                        >
                            <Check className="w-4 h-4" />
                            Save
                        </button>
                    </div>
                )}

                {/* Net Burn Summary */}
                <div className={`
                    mt-6 p-4 rounded-xl border
                    ${isDark ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-emerald-50/50 border-emerald-100'}
                `}>
                    <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                            Net Monthly Burn
                        </span>
                        <span
                            className={`text-lg font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}
                            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                        >
                            {formatCurrency(netBurn)}/mo
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RunwayPage;
