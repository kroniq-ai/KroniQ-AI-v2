/**
 * RoadmapPage - Visual Product Roadmap
 * Kanban-style with Now/Next/Later columns, milestones, drag-drop
 * Premium green glowing design
 */

import React, { useState } from 'react';
import {
    Map,
    Plus,
    X,
    GripVertical,
    Calendar,
    Target,
    Rocket,
    Clock,
    CheckCircle,
    Circle,
    Sparkles,
    Flag,
    Users,
    Star,
    ArrowRight,
    MoreHorizontal,
    Edit3,
    Trash2,
    Tag
} from 'lucide-react';

interface RoadmapPageProps {
    isDark: boolean;
}

interface RoadmapItem {
    id: string;
    title: string;
    description: string;
    status: 'now' | 'next' | 'later' | 'done';
    priority: 'high' | 'medium' | 'low';
    category: 'feature' | 'improvement' | 'bug' | 'infrastructure';
    votes?: number;
    progress?: number;
    dueDate?: string;
    assignee?: string;
}

// ===== PRIORITY BADGE =====
const PriorityBadge: React.FC<{ priority: RoadmapItem['priority']; isDark: boolean }> = ({ priority, isDark }) => {
    const config = {
        high: { label: 'High', color: isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600' },
        medium: { label: 'Medium', color: isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-600' },
        low: { label: 'Low', color: isDark ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-600' }
    };

    return (
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${config[priority].color}`}>
            {config[priority].label}
        </span>
    );
};

// ===== CATEGORY TAG =====
const CategoryTag: React.FC<{ category: RoadmapItem['category']; isDark: boolean }> = ({ category, isDark }) => {
    const config = {
        feature: { label: 'Feature', color: isDark ? 'text-emerald-400 border-emerald-500/30' : 'text-emerald-600 border-emerald-200' },
        improvement: { label: 'Improve', color: isDark ? 'text-blue-400 border-blue-500/30' : 'text-blue-600 border-blue-200' },
        bug: { label: 'Bug', color: isDark ? 'text-red-400 border-red-500/30' : 'text-red-600 border-red-200' },
        infrastructure: { label: 'Infra', color: isDark ? 'text-purple-400 border-purple-500/30' : 'text-purple-600 border-purple-200' }
    };

    return (
        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${config[category].color}`}>
            {config[category].label}
        </span>
    );
};

// ===== ROADMAP CARD =====
const RoadmapCard: React.FC<{
    isDark: boolean;
    item: RoadmapItem;
    onMove?: (id: string, status: RoadmapItem['status']) => void;
    onEdit?: () => void;
}> = ({ isDark, item, onMove, onEdit }) => (
    <div className={`
        group p-4 rounded-xl border cursor-grab
        transition-all duration-200 hover:translate-y-[-2px]
        ${isDark
            ? 'bg-[#0d0d0d] border-emerald-500/10 hover:border-emerald-500/30'
            : 'bg-white border-gray-100 hover:border-emerald-200 hover:shadow-md'
        }
    `}
        style={{ boxShadow: isDark ? '0 0 0 rgba(16, 185, 129, 0)' : undefined }}
        onMouseEnter={(e) => isDark && (e.currentTarget.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.1)')}
        onMouseLeave={(e) => isDark && (e.currentTarget.style.boxShadow = '0 0 0 rgba(16, 185, 129, 0)')}
    >
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
                <CategoryTag category={item.category} isDark={isDark} />
                <PriorityBadge priority={item.priority} isDark={isDark} />
            </div>
            <button className={`opacity-0 group-hover:opacity-100 p-1 rounded ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
                <MoreHorizontal className={`w-4 h-4 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
            </button>
        </div>

        {/* Title */}
        <h4 className={`font-semibold text-sm mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {item.title}
        </h4>

        {/* Description */}
        <p className={`text-xs mb-3 line-clamp-2 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
            {item.description}
        </p>

        {/* Progress Bar (if applicable) */}
        {item.progress !== undefined && item.status === 'now' && (
            <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] ${isDark ? 'text-white/30' : 'text-gray-400'}`}>Progress</span>
                    <span className={`text-[10px] font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        {item.progress}%
                    </span>
                </div>
                <div className={`h-1.5 rounded-full ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                    <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${item.progress}%` }}
                    />
                </div>
            </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                {item.votes !== undefined && (
                    <div className={`flex items-center gap-1 text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                        <Star className="w-3 h-3" />
                        {item.votes}
                    </div>
                )}
                {item.dueDate && (
                    <div className={`flex items-center gap-1 text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                        <Calendar className="w-3 h-3" />
                        {item.dueDate}
                    </div>
                )}
            </div>

            {item.assignee && (
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'
                    }`}>
                    {item.assignee.charAt(0).toUpperCase()}
                </div>
            )}
        </div>
    </div>
);

// ===== COLUMN =====
const RoadmapColumn: React.FC<{
    isDark: boolean;
    title: string;
    icon: React.ElementType;
    status: RoadmapItem['status'];
    items: RoadmapItem[];
    accentColor: string;
    onAddItem?: () => void;
    onMoveItem?: (id: string, status: RoadmapItem['status']) => void;
}> = ({ isDark, title, icon: Icon, status, items, accentColor, onAddItem, onMoveItem }) => (
    <div className={`
        flex-1 min-w-[280px] rounded-2xl border
        ${isDark ? 'bg-[#0a0a0a] border-white/5' : 'bg-gray-50 border-gray-100'}
    `}>
        {/* Header */}
        <div className={`p-4 border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br ${accentColor}`}
                        style={{ boxShadow: isDark ? `0 0 15px ${accentColor.includes('emerald') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0,0,0,0.1)'}` : 'none' }}>
                        <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {title}
                        </h3>
                        <p className={`text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                            {items.length} items
                        </p>
                    </div>
                </div>
                <button
                    onClick={onAddItem}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/5 text-white/30' : 'hover:bg-gray-100 text-gray-400'}`}
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        </div>

        {/* Items */}
        <div className="p-3 space-y-3 max-h-[calc(100vh-350px)] overflow-y-auto">
            {items.map(item => (
                <RoadmapCard
                    key={item.id}
                    isDark={isDark}
                    item={item}
                    onMove={onMoveItem}
                />
            ))}

            {items.length === 0 && (
                <div className={`py-8 text-center ${isDark ? 'text-white/20' : 'text-gray-400'}`}>
                    <Circle className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">No items yet</p>
                </div>
            )}
        </div>
    </div>
);

// ===== ADD ITEM MODAL =====
const AddItemModal: React.FC<{
    isDark: boolean;
    isOpen: boolean;
    defaultStatus: RoadmapItem['status'];
    onClose: () => void;
    onAdd: (item: Omit<RoadmapItem, 'id'>) => void;
}> = ({ isDark, isOpen, defaultStatus, onClose, onAdd }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<RoadmapItem['priority']>('medium');
    const [category, setCategory] = useState<RoadmapItem['category']>('feature');

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (title) {
            onAdd({
                title,
                description,
                status: defaultStatus,
                priority,
                category,
                votes: 0,
                progress: defaultStatus === 'now' ? 0 : undefined
            });
            setTitle(''); setDescription('');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full max-w-md p-6 rounded-3xl ${isDark ? 'bg-[#0c0c0c]' : 'bg-white'}`}
                style={{ boxShadow: isDark ? '0 0 60px rgba(16, 185, 129, 0.15)' : '0 25px 80px rgba(0,0,0,0.2)' }}>

                <div className="flex items-center justify-between mb-6">
                    <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Add to Roadmap</h2>
                    <button onClick={onClose} className={`p-2 rounded-xl ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
                        <X className={`w-5 h-5 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
                    </button>
                </div>

                <div className="space-y-4 mb-6">
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>Title *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="What are you building?"
                            className={`w-full px-4 py-3 rounded-xl text-sm border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-gray-50 border-gray-200'
                                }`}
                        />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief description..."
                            rows={2}
                            className={`w-full px-4 py-3 rounded-xl text-sm border outline-none resize-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-gray-50 border-gray-200'
                                }`}
                        />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>Category</label>
                        <div className="grid grid-cols-4 gap-2">
                            {(['feature', 'improvement', 'bug', 'infrastructure'] as const).map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`py-2 rounded-xl text-xs font-medium capitalize ${category === cat ? 'bg-emerald-500 text-white' : (isDark ? 'bg-white/5 text-white/50' : 'bg-gray-100 text-gray-500')
                                        }`}
                                >
                                    {cat.slice(0, 7)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>Priority</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['high', 'medium', 'low'] as const).map(p => (
                                <button
                                    key={p}
                                    onClick={() => setPriority(p)}
                                    className={`py-2 rounded-xl text-xs font-medium capitalize ${priority === p ? 'bg-emerald-500 text-white' : (isDark ? 'bg-white/5 text-white/50' : 'bg-gray-100 text-gray-500')
                                        }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={!title}
                    className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 ${title ? 'bg-emerald-500 text-white hover:bg-emerald-400' : (isDark ? 'bg-white/5 text-white/20' : 'bg-gray-100 text-gray-300')
                        }`}
                >
                    <Plus className="w-4 h-4" /> Add to Roadmap
                </button>
            </div>
        </div>
    );
};

// ===== MAIN COMPONENT =====
export const RoadmapPage: React.FC<RoadmapPageProps> = ({ isDark }) => {
    const [items, setItems] = useState<RoadmapItem[]>([
        { id: '1', title: 'User Authentication v2', description: 'Implement OAuth and magic link login options', status: 'now', priority: 'high', category: 'feature', progress: 75, dueDate: 'Jan 15', assignee: 'Alex' },
        { id: '2', title: 'Dashboard Performance', description: 'Optimize load times and reduce bundle size', status: 'now', priority: 'high', category: 'improvement', progress: 40, assignee: 'Sam' },
        { id: '3', title: 'Mobile Responsive', description: 'Full mobile optimization for all pages', status: 'now', priority: 'medium', category: 'improvement', progress: 20 },
        { id: '4', title: 'API Rate Limiting', description: 'Implement rate limiting for all endpoints', status: 'next', priority: 'high', category: 'infrastructure', votes: 12 },
        { id: '5', title: 'Team Collaboration', description: 'Invite team members and share workspaces', status: 'next', priority: 'medium', category: 'feature', votes: 24 },
        { id: '6', title: 'Dark Mode Toggle', description: 'Allow users to switch between themes', status: 'next', priority: 'low', category: 'improvement', votes: 18 },
        { id: '7', title: 'AI Writing Assistant', description: 'GPT-powered content suggestions', status: 'later', priority: 'medium', category: 'feature', votes: 45 },
        { id: '8', title: 'Custom Integrations', description: 'Allow 3rd party integrations via API', status: 'later', priority: 'medium', category: 'feature', votes: 32 },
        { id: '9', title: 'Analytics Dashboard', description: 'Detailed usage analytics and reports', status: 'later', priority: 'low', category: 'feature', votes: 15 },
    ]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [addToStatus, setAddToStatus] = useState<RoadmapItem['status']>('now');

    const handleAddItem = (item: Omit<RoadmapItem, 'id'>) => {
        setItems(prev => [{ ...item, id: Date.now().toString() }, ...prev]);
    };

    const getItemsByStatus = (status: RoadmapItem['status']) => items.filter(i => i.status === status);

    const columns = [
        { status: 'now' as const, title: 'Now', icon: Rocket, color: 'from-emerald-500 to-emerald-600' },
        { status: 'next' as const, title: 'Next', icon: Clock, color: 'from-blue-500 to-blue-600' },
        { status: 'later' as const, title: 'Later', icon: Calendar, color: 'from-purple-500 to-purple-600' },
    ];

    const stats = {
        total: items.filter(i => i.status !== 'done').length,
        inProgress: items.filter(i => i.status === 'now').length,
        upcoming: items.filter(i => i.status === 'next' || i.status === 'later').length
    };

    return (
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Map className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-emerald-500/60' : 'text-emerald-600/80'}`}>
                            Product • Roadmap
                        </span>
                    </div>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        Product Roadmap
                    </h1>
                </div>

                <button
                    onClick={() => { setAddToStatus('now'); setShowAddModal(true); }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-400"
                    style={{ boxShadow: isDark ? '0 0 20px rgba(16, 185, 129, 0.3)' : 'none' }}
                >
                    <Plus className="w-4 h-4" /> Add Item
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className={`
                    relative p-4 rounded-2xl border overflow-hidden
                    ${isDark ? 'bg-gradient-to-br from-emerald-500/15 to-[#0d0d0d] border-emerald-500/30' : 'bg-gradient-to-br from-emerald-50 to-white border-emerald-200'}
                `}>
                    {isDark && <div className="absolute -top-10 -right-10 w-20 h-20 rounded-full blur-2xl bg-emerald-500/20" />}
                    <div className="relative z-10 flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}`}>
                            <Target className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        </div>
                        <div>
                            <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Total Items</p>
                            <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
                        </div>
                    </div>
                </div>

                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#0d0d0d] border-emerald-500/10' : 'bg-white border-gray-100'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-500/10' : 'bg-gray-100'}`}>
                            <Rocket className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        </div>
                        <div>
                            <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>In Progress</p>
                            <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.inProgress}</p>
                        </div>
                    </div>
                </div>

                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#0d0d0d] border-emerald-500/10' : 'bg-white border-gray-100'}`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-500/10' : 'bg-gray-100'}`}>
                            <Calendar className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        </div>
                        <div>
                            <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Upcoming</p>
                            <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.upcoming}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
                {columns.map(col => (
                    <RoadmapColumn
                        key={col.status}
                        isDark={isDark}
                        title={col.title}
                        icon={col.icon}
                        status={col.status}
                        items={getItemsByStatus(col.status)}
                        accentColor={col.color}
                        onAddItem={() => { setAddToStatus(col.status); setShowAddModal(true); }}
                    />
                ))}
            </div>

            {/* Add Modal */}
            <AddItemModal
                isDark={isDark}
                isOpen={showAddModal}
                defaultStatus={addToStatus}
                onClose={() => setShowAddModal(false)}
                onAdd={handleAddItem}
            />
        </div>
    );
};

export default RoadmapPage;
