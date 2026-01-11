/**
 * CampaignsPage - Marketing Campaign Management
 * ROI tracking, performance metrics, spend analysis, channel breakdown
 * Premium green glowing design
 */

import React, { useState, useMemo } from 'react';
import {
    Megaphone,
    Plus,
    X,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Target,
    Users,
    MousePointer,
    Eye,
    ArrowUpRight,
    ArrowDownRight,
    Play,
    Pause,
    BarChart3,
    Sparkles,
    Calendar,
    Filter,
    ExternalLink,
    Zap,
    MoreHorizontal
} from 'lucide-react';

interface CampaignsPageProps {
    isDark: boolean;
}

interface Campaign {
    id: string;
    name: string;
    channel: 'google' | 'facebook' | 'linkedin' | 'twitter' | 'email' | 'content';
    status: 'active' | 'paused' | 'completed';
    budget: number;
    spent: number;
    impressions: number;
    clicks: number;
    conversions: number;
    revenue: number;
    startDate: string;
    endDate?: string;
}

// ===== CHANNEL BADGE =====
const ChannelBadge: React.FC<{ channel: Campaign['channel']; isDark: boolean }> = ({ channel, isDark }) => {
    const config = {
        google: { label: 'Google Ads', color: isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700' },
        facebook: { label: 'Facebook', color: isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-700' },
        linkedin: { label: 'LinkedIn', color: isDark ? 'bg-sky-500/20 text-sky-400' : 'bg-sky-100 text-sky-700' },
        twitter: { label: 'Twitter', color: isDark ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-700' },
        email: { label: 'Email', color: isDark ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-700' },
        content: { label: 'Content', color: isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700' }
    };

    return (
        <span className={`text-[10px] px-2 py-1 rounded font-medium ${config[channel].color}`}>
            {config[channel].label}
        </span>
    );
};

// ===== STATUS INDICATOR =====
const StatusIndicator: React.FC<{ status: Campaign['status']; isDark: boolean }> = ({ status, isDark }) => {
    const config = {
        active: { icon: Play, color: 'text-emerald-400', bg: isDark ? 'bg-emerald-500/20' : 'bg-emerald-100' },
        paused: { icon: Pause, color: 'text-yellow-400', bg: isDark ? 'bg-yellow-500/20' : 'bg-yellow-100' },
        completed: { icon: Target, color: 'text-gray-400', bg: isDark ? 'bg-gray-500/20' : 'bg-gray-100' }
    };

    const { icon: Icon, color, bg } = config[status];

    return (
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${bg}`}>
            <Icon className={`w-3.5 h-3.5 ${color}`} />
        </div>
    );
};

// ===== METRIC CARD =====
const MetricCard: React.FC<{
    isDark: boolean;
    icon: React.ElementType;
    label: string;
    value: string;
    change?: number;
    highlight?: boolean;
}> = ({ isDark, icon: Icon, label, value, change, highlight }) => (
    <div className={`
        relative p-5 rounded-2xl border overflow-hidden
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
                    ${highlight ? (isDark ? 'bg-emerald-500/20' : 'bg-emerald-100') : (isDark ? 'bg-emerald-500/10' : 'bg-gray-100')}
                `}>
                    <Icon className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                </div>
                {change !== undefined && (
                    <div className={`flex items-center gap-1 text-xs font-medium ${change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {Math.abs(change)}%
                    </div>
                )}
            </div>
            <p className={`text-xs font-medium mb-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{label}</p>
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
        </div>
    </div>
);

// ===== CAMPAIGN ROW =====
const CampaignRow: React.FC<{
    isDark: boolean;
    campaign: Campaign;
}> = ({ isDark, campaign }) => {
    const roi = campaign.spent > 0 ? ((campaign.revenue - campaign.spent) / campaign.spent * 100) : 0;
    const ctr = campaign.impressions > 0 ? (campaign.clicks / campaign.impressions * 100) : 0;
    const cpc = campaign.clicks > 0 ? (campaign.spent / campaign.clicks) : 0;
    const budgetUsed = (campaign.spent / campaign.budget * 100);

    return (
        <div className={`
            p-4 rounded-xl border group transition-all duration-200
            ${isDark ? 'bg-[#0d0d0d] border-emerald-500/10 hover:border-emerald-500/30' : 'bg-white border-gray-100 hover:border-emerald-200'}
        `}>
            <div className="flex items-center gap-4">
                {/* Status */}
                <StatusIndicator status={campaign.status} isDark={isDark} />

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <p className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {campaign.name}
                        </p>
                        <ChannelBadge channel={campaign.channel} isDark={isDark} />
                    </div>
                    <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                        Started {campaign.startDate}
                    </p>
                </div>

                {/* Metrics */}
                <div className="hidden md:flex items-center gap-6">
                    {/* Impressions */}
                    <div className="text-center">
                        <p className={`text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Impressions</p>
                        <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {campaign.impressions >= 1000 ? `${(campaign.impressions / 1000).toFixed(1)}k` : campaign.impressions}
                        </p>
                    </div>

                    {/* CTR */}
                    <div className="text-center">
                        <p className={`text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>CTR</p>
                        <p className={`font-bold ${ctr > 2 ? 'text-emerald-400' : (isDark ? 'text-white' : 'text-gray-900')}`}>
                            {ctr.toFixed(2)}%
                        </p>
                    </div>

                    {/* Conversions */}
                    <div className="text-center">
                        <p className={`text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Conversions</p>
                        <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{campaign.conversions}</p>
                    </div>

                    {/* ROI */}
                    <div className="text-center">
                        <p className={`text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>ROI</p>
                        <p className={`font-bold ${roi > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {roi > 0 ? '+' : ''}{roi.toFixed(0)}%
                        </p>
                    </div>
                </div>

                {/* Spend & Budget */}
                <div className="w-32">
                    <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                            ${campaign.spent.toLocaleString()}
                        </span>
                        <span className={`text-[10px] ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                            / ${campaign.budget.toLocaleString()}
                        </span>
                    </div>
                    <div className={`h-1.5 rounded-full ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${budgetUsed > 100 ? 'bg-red-500' : budgetUsed > 80 ? 'bg-yellow-500' : 'bg-emerald-500'
                                }`}
                            style={{ width: `${Math.min(budgetUsed, 100)}%` }}
                        />
                    </div>
                </div>

                <button className={`opacity-0 group-hover:opacity-100 p-2 rounded-lg ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
                    <MoreHorizontal className={`w-4 h-4 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
                </button>
            </div>
        </div>
    );
};

// ===== CHANNEL PERFORMANCE CHART =====
const ChannelChart: React.FC<{ isDark: boolean; campaigns: Campaign[] }> = ({ isDark, campaigns }) => {
    const channelStats = useMemo(() => {
        const stats: Record<string, { spent: number; revenue: number; conversions: number }> = {};
        campaigns.forEach(c => {
            if (!stats[c.channel]) stats[c.channel] = { spent: 0, revenue: 0, conversions: 0 };
            stats[c.channel].spent += c.spent;
            stats[c.channel].revenue += c.revenue;
            stats[c.channel].conversions += c.conversions;
        });
        return Object.entries(stats).map(([channel, data]) => ({
            channel,
            ...data,
            roi: data.spent > 0 ? ((data.revenue - data.spent) / data.spent * 100) : 0
        })).sort((a, b) => b.revenue - a.revenue);
    }, [campaigns]);

    const maxRevenue = Math.max(...channelStats.map(c => c.revenue));

    return (
        <div className={`p-5 rounded-2xl border ${isDark ? 'bg-[#0d0d0d] border-emerald-500/10' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center gap-2 mb-4">
                <BarChart3 className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Channel Performance
                </span>
            </div>

            <div className="space-y-3">
                {channelStats.map(stat => (
                    <div key={stat.channel} className="flex items-center gap-3">
                        <ChannelBadge channel={stat.channel as Campaign['channel']} isDark={isDark} />
                        <div className="flex-1">
                            <div className={`h-2 rounded-full ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                                <div
                                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                    style={{ width: `${(stat.revenue / maxRevenue) * 100}%` }}
                                />
                            </div>
                        </div>
                        <span className={`text-xs font-medium min-w-[60px] text-right ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            ${(stat.revenue / 1000).toFixed(1)}k
                        </span>
                        <span className={`text-xs min-w-[50px] text-right ${stat.roi > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {stat.roi > 0 ? '+' : ''}{stat.roi.toFixed(0)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ===== MAIN COMPONENT =====
export const CampaignsPage: React.FC<CampaignsPageProps> = ({ isDark }) => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([
        { id: '1', name: 'Q1 Brand Awareness', channel: 'google', status: 'active', budget: 5000, spent: 3200, impressions: 125000, clicks: 3750, conversions: 45, revenue: 8500, startDate: 'Jan 1' },
        { id: '2', name: 'Product Launch', channel: 'facebook', status: 'active', budget: 3000, spent: 2100, impressions: 85000, clicks: 2125, conversions: 32, revenue: 6400, startDate: 'Jan 5' },
        { id: '3', name: 'B2B Outreach', channel: 'linkedin', status: 'active', budget: 4000, spent: 1500, impressions: 35000, clicks: 875, conversions: 18, revenue: 5400, startDate: 'Jan 10' },
        { id: '4', name: 'Newsletter Campaign', channel: 'email', status: 'completed', budget: 500, spent: 500, impressions: 15000, clicks: 1200, conversions: 28, revenue: 2800, startDate: 'Dec 15', endDate: 'Dec 31' },
        { id: '5', name: 'Blog Content Push', channel: 'content', status: 'active', budget: 2000, spent: 800, impressions: 45000, clicks: 2250, conversions: 15, revenue: 3000, startDate: 'Jan 8' },
        { id: '6', name: 'Retargeting Ads', channel: 'google', status: 'paused', budget: 1500, spent: 750, impressions: 28000, clicks: 840, conversions: 12, revenue: 1800, startDate: 'Jan 3' },
    ]);

    const [statusFilter, setStatusFilter] = useState<Campaign['status'] | 'all'>('all');

    // Calculate metrics
    const metrics = useMemo(() => {
        const active = campaigns.filter(c => c.status === 'active');
        const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
        const totalRevenue = campaigns.reduce((sum, c) => sum + c.revenue, 0);
        const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
        const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
        const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
        const blendedCPC = totalClicks > 0 ? totalSpent / totalClicks : 0;
        const overallROI = totalSpent > 0 ? ((totalRevenue - totalSpent) / totalSpent * 100) : 0;

        return {
            activeCampaigns: active.length,
            totalSpent,
            totalRevenue,
            totalConversions,
            blendedCPC,
            overallROI,
            avgCTR: totalImpressions > 0 ? (totalClicks / totalImpressions * 100) : 0
        };
    }, [campaigns]);

    const filteredCampaigns = statusFilter === 'all'
        ? campaigns
        : campaigns.filter(c => c.status === statusFilter);

    return (
        <div className="flex-1 overflow-y-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Megaphone className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-emerald-500/60' : 'text-emerald-600/80'}`}>
                            Marketing • Campaigns
                        </span>
                    </div>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        Campaign Performance
                    </h1>
                </div>

                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-400"
                    style={{ boxShadow: isDark ? '0 0 20px rgba(16, 185, 129, 0.3)' : 'none' }}>
                    <Plus className="w-4 h-4" /> New Campaign
                </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <MetricCard
                    isDark={isDark}
                    icon={DollarSign}
                    label="Total Revenue"
                    value={`$${(metrics.totalRevenue / 1000).toFixed(1)}k`}
                    change={18}
                    highlight
                />
                <MetricCard
                    isDark={isDark}
                    icon={Target}
                    label="Conversions"
                    value={metrics.totalConversions.toString()}
                    change={12}
                />
                <MetricCard
                    isDark={isDark}
                    icon={TrendingUp}
                    label="Overall ROI"
                    value={`${metrics.overallROI > 0 ? '+' : ''}${metrics.overallROI.toFixed(0)}%`}
                />
                <MetricCard
                    isDark={isDark}
                    icon={MousePointer}
                    label="Avg CTR"
                    value={`${metrics.avgCTR.toFixed(2)}%`}
                    change={5}
                />
            </div>

            {/* AI Insight + Channel Chart */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
                {/* AI Insight */}
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
                                <strong className="text-emerald-400">LinkedIn has highest ROI</strong> at 260%. Consider increasing budget allocation.
                            </p>
                        </div>
                        <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-white'}`}>
                            <p className={`text-sm ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                                <strong className="text-yellow-400">Google Retargeting paused</strong> — was performing below target. Review creative.
                            </p>
                        </div>
                        <div className={`p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-white'}`}>
                            <p className={`text-sm ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                                Email campaigns show <strong className="text-emerald-400">8% open → conversion</strong>. Best channel for retention.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Channel Chart */}
                <ChannelChart isDark={isDark} campaigns={campaigns} />
            </div>

            {/* Campaigns List */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                        <Megaphone className="w-4 h-4" />
                        Campaigns ({filteredCampaigns.length})
                    </h3>

                    <div className="flex items-center gap-2">
                        {(['all', 'active', 'paused', 'completed'] as const).map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${statusFilter === status
                                        ? 'bg-emerald-500 text-white'
                                        : (isDark ? 'bg-white/5 text-white/50' : 'bg-gray-100 text-gray-500')
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    {filteredCampaigns.map(campaign => (
                        <CampaignRow key={campaign.id} isDark={isDark} campaign={campaign} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CampaignsPage;
