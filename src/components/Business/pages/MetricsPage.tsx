/**
 * Metrics Page — Marketing Agent
 * Track marketing performance metrics
 */

import React, { useState } from 'react';
import {
    BarChart2,
    TrendingUp,
    TrendingDown,
    Users,
    Target,
    DollarSign,
    MousePointer,
    Eye,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';

interface MetricsPageProps {
    isDark: boolean;
}

interface MetricCard {
    id: string;
    name: string;
    value: string;
    change: number;
    trend: 'up' | 'down';
    icon: React.ElementType;
}

export const MetricsPage: React.FC<MetricsPageProps> = ({ isDark }) => {
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

    const metrics: MetricCard[] = [
        { id: '1', name: 'Website Visitors', value: '12,456', change: 15.2, trend: 'up', icon: Users },
        { id: '2', name: 'Conversion Rate', value: '3.2%', change: 0.5, trend: 'up', icon: Target },
        { id: '3', name: 'Cost Per Acquisition', value: '$42', change: -8.3, trend: 'down', icon: DollarSign },
        { id: '4', name: 'Click-through Rate', value: '2.8%', change: 12.1, trend: 'up', icon: MousePointer },
        { id: '5', name: 'Impressions', value: '145K', change: 22.4, trend: 'up', icon: Eye },
        { id: '6', name: 'Marketing ROI', value: '320%', change: 18.6, trend: 'up', icon: TrendingUp },
    ];

    // Channel performance data
    const channels = [
        { name: 'Organic Search', visitors: 4500, conversions: 145, revenue: 12500, cac: 28 },
        { name: 'Paid Search', visitors: 3200, conversions: 98, revenue: 8200, cac: 45 },
        { name: 'Social Media', visitors: 2800, conversions: 65, revenue: 5400, cac: 38 },
        { name: 'Email', visitors: 1200, conversions: 89, revenue: 7800, cac: 12 },
        { name: 'Referrals', visitors: 756, conversions: 42, revenue: 3600, cac: 22 },
    ];

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-US', { notation: 'compact' }).format(num);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
    };

    return (
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <BarChart2 className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-emerald-500/60' : 'text-emerald-600/80'}`}>
                            Marketing Agent
                        </span>
                    </div>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Metrics
                    </h1>
                </div>
                {/* Time Range Selector */}
                <div className={`flex gap-1 p-1 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                    {(['7d', '30d', '90d'] as const).map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${timeRange === range
                                    ? 'bg-emerald-500 text-white'
                                    : (isDark ? 'text-white/50 hover:text-white' : 'text-gray-500 hover:text-gray-900')
                                }`}
                        >
                            {range === '7d' ? '7 days' : range === '30d' ? '30 days' : '90 days'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {metrics.map(metric => {
                    const Icon = metric.icon;
                    const isPositive = metric.trend === 'up' ? metric.change > 0 : metric.change < 0;
                    return (
                        <div
                            key={metric.id}
                            className={`p-5 rounded-2xl ${isDark ? 'bg-[#0c0c0c] border border-white/5' : 'bg-white border border-gray-200'}`}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-500/15' : 'bg-emerald-100'}`}>
                                    <Icon className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                </div>
                                <div className={`flex items-center gap-1 text-xs font-medium ${isPositive
                                        ? (isDark ? 'text-emerald-400' : 'text-emerald-600')
                                        : (isDark ? 'text-red-400' : 'text-red-500')
                                    }`}>
                                    {metric.trend === 'up' ? (
                                        <ArrowUpRight className="w-3 h-3" />
                                    ) : (
                                        <ArrowDownRight className="w-3 h-3" />
                                    )}
                                    {Math.abs(metric.change)}%
                                </div>
                            </div>
                            <p className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {metric.value}
                            </p>
                            <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                                {metric.name}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Channel Performance */}
            <div className={`flex-1 rounded-2xl overflow-hidden ${isDark ? 'bg-[#0c0c0c] border border-white/5' : 'bg-white border border-gray-200'}`}>
                <div className={`px-5 py-4 border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                    <h2 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Channel Performance</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className={isDark ? 'border-b border-white/5' : 'border-b border-gray-100'}>
                                <th className={`px-5 py-3 text-left text-xs font-medium ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Channel</th>
                                <th className={`px-5 py-3 text-right text-xs font-medium ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Visitors</th>
                                <th className={`px-5 py-3 text-right text-xs font-medium ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Conversions</th>
                                <th className={`px-5 py-3 text-right text-xs font-medium ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Revenue</th>
                                <th className={`px-5 py-3 text-right text-xs font-medium ${isDark ? 'text-white/40' : 'text-gray-500'}`}>CAC</th>
                            </tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-gray-100'}`}>
                            {channels.map(channel => (
                                <tr key={channel.name} className={isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50'}>
                                    <td className={`px-5 py-4 text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {channel.name}
                                    </td>
                                    <td className={`px-5 py-4 text-sm text-right ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                                        {formatNumber(channel.visitors)}
                                    </td>
                                    <td className={`px-5 py-4 text-sm text-right ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                                        {channel.conversions}
                                    </td>
                                    <td className={`px-5 py-4 text-sm text-right font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                                        {formatCurrency(channel.revenue)}
                                    </td>
                                    <td className={`px-5 py-4 text-sm text-right ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                                        {formatCurrency(channel.cac)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default MetricsPage;
