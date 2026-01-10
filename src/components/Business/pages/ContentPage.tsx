/**
 * Content Page — Marketing Agent
 * Content calendar and management
 */

import React, { useState } from 'react';
import {
    FileText,
    Plus,
    Calendar,
    Twitter,
    Linkedin,
    Globe,
    Video,
    Image,
    X,
    Clock,
    CheckCircle,
    Edit3
} from 'lucide-react';

interface ContentPageProps {
    isDark: boolean;
}

interface ContentItem {
    id: string;
    title: string;
    type: 'blog' | 'social' | 'video' | 'image';
    platform: string;
    status: 'draft' | 'scheduled' | 'published';
    scheduledDate: Date;
}

const TYPE_ICONS: Record<string, React.ElementType> = {
    blog: FileText,
    social: Twitter,
    video: Video,
    image: Image
};

const PLATFORM_ICONS: Record<string, React.ElementType> = {
    'Twitter': Twitter,
    'LinkedIn': Linkedin,
    'Blog': Globe,
    'YouTube': Video,
    'Instagram': Image
};

const STATUS_CONFIG = {
    draft: { label: 'Draft', color: { dark: 'bg-gray-500/20 text-gray-400', light: 'bg-gray-100 text-gray-600' } },
    scheduled: { label: 'Scheduled', color: { dark: 'bg-yellow-500/20 text-yellow-400', light: 'bg-yellow-100 text-yellow-700' } },
    published: { label: 'Published', color: { dark: 'bg-emerald-500/20 text-emerald-400', light: 'bg-emerald-100 text-emerald-700' } },
};

export const ContentPage: React.FC<ContentPageProps> = ({ isDark }) => {
    const [content, setContent] = useState<ContentItem[]>([
        { id: '1', title: 'How AI is Revolutionizing Small Business', type: 'blog', platform: 'Blog', status: 'published', scheduledDate: new Date(Date.now() - 86400000 * 2) },
        { id: '2', title: 'Product Update Thread 🧵', type: 'social', platform: 'Twitter', status: 'published', scheduledDate: new Date(Date.now() - 86400000) },
        { id: '3', title: 'CEO Interview: Building in Public', type: 'video', platform: 'YouTube', status: 'scheduled', scheduledDate: new Date(Date.now() + 86400000 * 2) },
        { id: '4', title: '5 Tips for Startup Founders', type: 'social', platform: 'LinkedIn', status: 'scheduled', scheduledDate: new Date(Date.now() + 86400000 * 3) },
        { id: '5', title: 'Product Demo GIF', type: 'image', platform: 'Twitter', status: 'draft', scheduledDate: new Date(Date.now() + 86400000 * 5) },
        { id: '6', title: 'Customer Success Story', type: 'blog', platform: 'Blog', status: 'draft', scheduledDate: new Date(Date.now() + 86400000 * 7) },
    ]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [newContent, setNewContent] = useState({ title: '', type: 'blog' as const, platform: 'Blog' });

    const publishedCount = content.filter(c => c.status === 'published').length;
    const scheduledCount = content.filter(c => c.status === 'scheduled').length;
    const draftCount = content.filter(c => c.status === 'draft').length;

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(date);
    };

    const handleAddContent = () => {
        if (newContent.title) {
            setContent(prev => [{
                id: Date.now().toString(),
                title: newContent.title,
                type: newContent.type,
                platform: newContent.platform,
                status: 'draft',
                scheduledDate: new Date()
            }, ...prev]);
            setNewContent({ title: '', type: 'blog', platform: 'Blog' });
            setShowAddModal(false);
        }
    };

    // Group by date
    const groupedContent = content.reduce((acc, item) => {
        const dateKey = item.scheduledDate.toDateString();
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(item);
        return acc;
    }, {} as Record<string, ContentItem[]>);

    return (
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <FileText className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-emerald-500/60' : 'text-emerald-600/80'}`}>
                            Marketing Agent
                        </span>
                    </div>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Content
                    </h1>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-400"
                >
                    <Plus className="w-4 h-4" />
                    New Content
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className={`p-4 rounded-2xl ${isDark ? 'bg-[#0c0c0c] border border-emerald-500/20' : 'bg-white border border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                        <CheckCircle className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={`text-xs font-medium ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Published</span>
                    </div>
                    <p className={`text-xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{publishedCount}</p>
                </div>
                <div className={`p-4 rounded-2xl ${isDark ? 'bg-[#0c0c0c] border border-yellow-500/20' : 'bg-white border border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                        <Clock className={`w-4 h-4 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                        <span className={`text-xs font-medium ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Scheduled</span>
                    </div>
                    <p className={`text-xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{scheduledCount}</p>
                </div>
                <div className={`p-4 rounded-2xl ${isDark ? 'bg-[#0c0c0c] border border-white/5' : 'bg-white border border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                        <Edit3 className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`text-xs font-medium ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Drafts</span>
                    </div>
                    <p className={`text-xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{draftCount}</p>
                </div>
            </div>

            {/* Content List by Date */}
            <div className="flex-1 space-y-6">
                {Object.entries(groupedContent).map(([dateKey, items]) => (
                    <div key={dateKey}>
                        <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                            {new Date(dateKey).toDateString() === new Date().toDateString() ? 'Today' : dateKey}
                        </p>
                        <div className="space-y-2">
                            {items.map(item => {
                                const TypeIcon = TYPE_ICONS[item.type] || FileText;
                                const PlatformIcon = PLATFORM_ICONS[item.platform] || Globe;
                                const statusConfig = STATUS_CONFIG[item.status];
                                return (
                                    <div
                                        key={item.id}
                                        className={`p-4 rounded-2xl flex items-center gap-4 ${isDark ? 'bg-[#0c0c0c] border border-white/5 hover:border-emerald-500/30' : 'bg-white border border-gray-200 hover:border-emerald-300'} transition-colors cursor-pointer`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-500/15' : 'bg-emerald-100'}`}>
                                            <TypeIcon className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-medium text-sm mb-1 truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                                {item.title}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1">
                                                    <PlatformIcon className={`w-3 h-3 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
                                                    <span className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{item.platform}</span>
                                                </div>
                                                <span className={`text-xs ${isDark ? 'text-white/20' : 'text-gray-300'}`}>•</span>
                                                <span className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{formatDate(item.scheduledDate)}</span>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-medium ${isDark ? statusConfig.color.dark : statusConfig.color.light}`}>
                                            {statusConfig.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
                    <div className={`relative w-full max-w-md p-6 rounded-3xl ${isDark ? 'bg-[#0c0c0c]' : 'bg-white'}`}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>New Content</h2>
                            <button onClick={() => setShowAddModal(false)} className={`p-2 rounded-xl ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
                                <X className={`w-5 h-5 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
                            </button>
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>Title</label>
                                <input
                                    type="text"
                                    value={newContent.title}
                                    onChange={(e) => setNewContent(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="What are you creating?"
                                    className={`w-full px-4 py-3 rounded-xl text-sm border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>Type</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {(['blog', 'social', 'video', 'image'] as const).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setNewContent(prev => ({ ...prev, type }))}
                                            className={`py-2 px-3 rounded-xl text-xs font-medium capitalize ${newContent.type === type ? 'bg-emerald-500 text-white' : (isDark ? 'bg-white/5 text-white/50' : 'bg-gray-100 text-gray-500')}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>Platform</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Blog', 'Twitter', 'LinkedIn', 'YouTube', 'Instagram'].map(platform => (
                                        <button
                                            key={platform}
                                            onClick={() => setNewContent(prev => ({ ...prev, platform }))}
                                            className={`py-2 px-3 rounded-xl text-xs font-medium ${newContent.platform === platform ? 'bg-emerald-500 text-white' : (isDark ? 'bg-white/5 text-white/50' : 'bg-gray-100 text-gray-500')}`}
                                        >
                                            {platform}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleAddContent}
                            disabled={!newContent.title}
                            className={`w-full py-3 rounded-xl text-sm font-semibold ${newContent.title ? 'bg-emerald-500 text-white hover:bg-emerald-400' : (isDark ? 'bg-white/5 text-white/20' : 'bg-gray-100 text-gray-300')}`}
                        >
                            Create Content
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContentPage;
