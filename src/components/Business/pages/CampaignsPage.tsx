/**
 * Campaigns Page — Marketing Agent
 * Track marketing campaigns and initiatives
 */

import React, { useState } from 'react';
import {
    Rocket,
    Plus,
    Calendar,
    Target,
    TrendingUp,
    X,
    Clock,
    CheckCircle,
    Pause,
    Play,
    Sparkles
} from 'lucide-react';

interface CampaignsPageProps {
    isDark: boolean;
}

interface Campaign {
    id: string;
    name: string;
    status: 'active' | 'paused' | 'completed' | 'planned';
    channel: string;
    budget: number;
    spent: number;
    startDate: Date;
    endDate?: Date;
    metrics: {
        impressions: number;
        clicks: number;
        conversions: number;
    };
}

const STATUS_CONFIG = {
    active: { label: 'Active', icon: Play, color: { dark: 'bg-emerald-500/20 text-emerald-400', light: 'bg-emerald-100 text-emerald-700' } },
    paused: { label: 'Paused', icon: Pause, color: { dark: 'bg-yellow-500/20 text-yellow-400', light: 'bg-yellow-100 text-yellow-700' } },
    completed: { label: 'Completed', icon: CheckCircle, color: { dark: 'bg-blue-500/20 text-blue-400', light: 'bg-blue-100 text-blue-700' } },
    planned: { label: 'Planned', icon: Clock, color: { dark: 'bg-gray-500/20 text-gray-400', light: 'bg-gray-100 text-gray-600' } },
};

export const CampaignsPage: React.FC<CampaignsPageProps> = ({ isDark }) => {
    const [campaigns, setCampaigns] = useState<Campaign[]>([
        {
            id: '1',
            name: 'Product Hunt Launch',
            status: 'active',
            channel: 'Product Hunt',
            budget: 500,
            spent: 350,
            startDate: new Date(),
            metrics: { impressions: 12500, clicks: 890, conversions: 45 }
        },
        {
            id: '2',
            name: 'LinkedIn Thought Leadership',
            status: 'active',
            channel: 'LinkedIn',
            budget: 1000,
            spent: 600,
            startDate: new Date(Date.now() - 86400000 * 7),
            metrics: { impressions: 8200, clicks: 420, conversions: 28 }
        },
        {
            id: '3',
            name: 'Google Ads - Brand',
            status: 'paused',
            channel: 'Google Ads',
            budget: 2000,
            spent: 1200,
            startDate: new Date(Date.now() - 86400000 * 14),
            metrics: { impressions: 45000, clicks: 1200, conversions: 65 }
        },
        {
            id: '4',
            name: 'TikTok Creator Collab',
            status: 'planned',
            channel: 'TikTok',
            budget: 3000,
            spent: 0,
            startDate: new Date(Date.now() + 86400000 * 7),
            metrics: { impressions: 0, clicks: 0, conversions: 0 }
        },
    ]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [newCampaign, setNewCampaign] = useState({ name: '', channel: '', budget: '' });

    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    const totalSpent = campaigns.reduce((sum, c) => sum + c.spent, 0);
    const totalConversions = campaigns.reduce((sum, c) => sum + c.metrics.conversions, 0);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-US', { notation: 'compact' }).format(num);
    };

    const handleAddCampaign = () => {
        if (newCampaign.name && newCampaign.channel) {
            setCampaigns(prev => [{
                id: Date.now().toString(),
                name: newCampaign.name,
                status: 'planned',
                channel: newCampaign.channel,
                budget: parseFloat(newCampaign.budget) || 0,
                spent: 0,
                startDate: new Date(),
                metrics: { impressions: 0, clicks: 0, conversions: 0 }
            }, ...prev]);
            setNewCampaign({ name: '', channel: '', budget: '' });
            setShowAddModal(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Rocket className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-emerald-500/60' : 'text-emerald-600/80'}`}>
                            Marketing Agent
                        </span>
                    </div>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Campaigns
                    </h1>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-400"
                >
                    <Plus className="w-4 h-4" />
                    New Campaign
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className={`p-5 rounded-2xl ${isDark ? 'bg-[#0c0c0c] border border-emerald-500/20' : 'bg-white border border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <Play className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={`text-xs font-medium ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Active</span>
                    </div>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{activeCampaigns}</p>
                </div>
                <div className={`p-5 rounded-2xl ${isDark ? 'bg-[#0c0c0c] border border-white/5' : 'bg-white border border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className={`w-4 h-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
                        <span className={`text-xs font-medium ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Total Spent</span>
                    </div>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{formatCurrency(totalSpent)}</p>
                </div>
                <div className={`p-5 rounded-2xl ${isDark ? 'bg-[#0c0c0c] border border-white/5' : 'bg-white border border-gray-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                        <Target className={`w-4 h-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
                        <span className={`text-xs font-medium ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Conversions</span>
                    </div>
                    <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{totalConversions}</p>
                </div>
            </div>

            {/* Campaign List */}
            <div className={`flex-1 rounded-2xl overflow-hidden ${isDark ? 'bg-[#0c0c0c] border border-white/5' : 'bg-white border border-gray-200'}`}>
                <div className={`px-5 py-4 border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                    <h2 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>All Campaigns</h2>
                </div>
                <div className="divide-y divide-white/5">
                    {campaigns.map(campaign => {
                        const statusConfig = STATUS_CONFIG[campaign.status];
                        const StatusIcon = statusConfig.icon;
                        return (
                            <div
                                key={campaign.id}
                                className={`px-5 py-4 ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50'}`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{campaign.name}</p>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 ${isDark ? statusConfig.color.dark : statusConfig.color.light}`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {statusConfig.label}
                                            </span>
                                        </div>
                                        <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{campaign.channel}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {formatCurrency(campaign.spent)} <span className={`font-normal ${isDark ? 'text-white/40' : 'text-gray-500'}`}>/ {formatCurrency(campaign.budget)}</span>
                                        </p>
                                    </div>
                                </div>
                                {/* Metrics row */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className={`text-[10px] font-medium ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Impressions</p>
                                        <p className={`text-sm font-semibold ${isDark ? 'text-white/70' : 'text-gray-700'}`}>{formatNumber(campaign.metrics.impressions)}</p>
                                    </div>
                                    <div>
                                        <p className={`text-[10px] font-medium ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Clicks</p>
                                        <p className={`text-sm font-semibold ${isDark ? 'text-white/70' : 'text-gray-700'}`}>{formatNumber(campaign.metrics.clicks)}</p>
                                    </div>
                                    <div>
                                        <p className={`text-[10px] font-medium ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Conversions</p>
                                        <p className={`text-sm font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{campaign.metrics.conversions}</p>
                                    </div>
                                </div>
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
                            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>New Campaign</h2>
                            <button onClick={() => setShowAddModal(false)} className={`p-2 rounded-xl ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
                                <X className={`w-5 h-5 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>Campaign Name</label>
                                <input
                                    type="text"
                                    value={newCampaign.name}
                                    onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., Product Launch..."
                                    className={`w-full px-4 py-3 rounded-xl text-sm border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>Channel</label>
                                <input
                                    type="text"
                                    value={newCampaign.channel}
                                    onChange={(e) => setNewCampaign(prev => ({ ...prev, channel: e.target.value }))}
                                    placeholder="e.g., Google Ads, LinkedIn..."
                                    className={`w-full px-4 py-3 rounded-xl text-sm border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>Budget ($)</label>
                                <input
                                    type="number"
                                    value={newCampaign.budget}
                                    onChange={(e) => setNewCampaign(prev => ({ ...prev, budget: e.target.value }))}
                                    placeholder="0"
                                    className={`w-full px-4 py-3 rounded-xl text-lg font-medium border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleAddCampaign}
                            disabled={!newCampaign.name || !newCampaign.channel}
                            className={`w-full py-3 rounded-xl text-sm font-semibold ${newCampaign.name && newCampaign.channel ? 'bg-emerald-500 text-white hover:bg-emerald-400' : (isDark ? 'bg-white/5 text-white/20' : 'bg-gray-100 text-gray-300')}`}
                        >
                            Create Campaign
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CampaignsPage;
