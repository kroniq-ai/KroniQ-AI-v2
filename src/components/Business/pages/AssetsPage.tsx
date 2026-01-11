/**
 * Assets Page
 * Centralized file and document management for agents
 */

import React, { useState } from 'react';
import {
    Folder,
    File,
    FileText,
    Image,
    Link2,
    Upload,
    Search,
    Grid,
    List,
    MoreVertical,
    Download,
    Trash2,
    ExternalLink,
    Plus,
    X,
    Clock
} from 'lucide-react';

interface AssetsPageProps {
    isDark: boolean;
    agentType?: string;
}

interface Asset {
    id: string;
    name: string;
    type: 'file' | 'image' | 'document' | 'link';
    size?: string;
    url?: string;
    createdAt: Date;
    tags: string[];
}

export const AssetsPage: React.FC<AssetsPageProps> = ({ isDark, agentType }) => {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [assets, setAssets] = useState<Asset[]>([
        {
            id: '1',
            name: 'Brand Guidelines.pdf',
            type: 'document',
            size: '2.4 MB',
            createdAt: new Date('2026-01-08'),
            tags: ['branding', 'guidelines']
        },
        {
            id: '2',
            name: 'Logo Primary.png',
            type: 'image',
            size: '156 KB',
            createdAt: new Date('2026-01-05'),
            tags: ['logo', 'branding']
        },
        {
            id: '3',
            name: 'Pitch Deck',
            type: 'link',
            url: 'https://docs.google.com/presentation/...',
            createdAt: new Date('2026-01-09'),
            tags: ['pitch', 'investors']
        },
        {
            id: '4',
            name: 'Q1 Financial Report.xlsx',
            type: 'file',
            size: '890 KB',
            createdAt: new Date('2026-01-10'),
            tags: ['finance', 'reports']
        }
    ]);

    const getIcon = (type: string) => {
        switch (type) {
            case 'image': return Image;
            case 'document': return FileText;
            case 'link': return Link2;
            default: return File;
        }
    };

    const filteredAssets = assets.filter(asset =>
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className={`flex-1 p-6 overflow-y-auto ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        Assets
                    </h1>
                    <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                        Files, documents, and resources
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-400 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Asset
                </button>
            </div>

            {/* Search & Filters */}
            <div className="flex items-center gap-4 mb-6">
                <div className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200'}`}>
                    <Search className={`w-4 h-4 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search assets..."
                        className={`flex-1 bg-transparent border-none outline-none text-sm ${isDark ? 'text-white placeholder-white/30' : 'text-gray-900 placeholder-gray-400'}`}
                    />
                </div>
                <div className={`flex items-center gap-1 p-1 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? (isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white text-emerald-600 shadow-sm') : (isDark ? 'text-white/40' : 'text-gray-400')}`}
                    >
                        <Grid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? (isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white text-emerald-600 shadow-sm') : (isDark ? 'text-white/40' : 'text-gray-400')}`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Asset Grid/List */}
            {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredAssets.map(asset => {
                        const Icon = getIcon(asset.type);
                        return (
                            <div
                                key={asset.id}
                                className={`group p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] cursor-pointer ${isDark ? 'bg-[#0d0d0d] border-emerald-500/10 hover:border-emerald-500/30' : 'bg-white border-gray-100 hover:border-emerald-200 hover:shadow-md'}`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                                    <Icon className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                </div>
                                <h3 className={`font-medium text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {asset.name}
                                </h3>
                                <p className={`text-xs mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                                    {asset.size || 'External link'}
                                </p>
                                <div className="flex items-center gap-2 mt-3">
                                    {asset.tags.slice(0, 2).map(tag => (
                                        <span key={tag} className={`px-2 py-0.5 rounded-full text-[10px] ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                {/* Hover Actions */}
                                <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10 text-white/50' : 'hover:bg-gray-100 text-gray-400'}`}>
                                        <Download className="w-3.5 h-3.5" />
                                    </button>
                                    <button className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10 text-white/50' : 'hover:bg-gray-100 text-gray-400'}`}>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </button>
                                    <button className={`p-1.5 rounded-lg hover:bg-red-500/10 text-red-400`}>
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className={`rounded-xl border ${isDark ? 'bg-[#0d0d0d] border-emerald-500/10' : 'bg-white border-gray-100'}`}>
                    {filteredAssets.map((asset, index) => {
                        const Icon = getIcon(asset.type);
                        return (
                            <div
                                key={asset.id}
                                className={`flex items-center gap-4 p-4 ${index !== filteredAssets.length - 1 ? (isDark ? 'border-b border-emerald-500/10' : 'border-b border-gray-100') : ''}`}
                            >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}`}>
                                    <Icon className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-medium text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {asset.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        {asset.tags.map(tag => (
                                            <span key={tag} className={`px-2 py-0.5 rounded-full text-[10px] ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                                    {asset.size || 'Link'}
                                </div>
                                <div className={`flex items-center gap-1 text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                                    <Clock className="w-3 h-3" />
                                    {asset.createdAt.toLocaleDateString()}
                                </div>
                                <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/5 text-white/40' : 'hover:bg-gray-50 text-gray-400'}`}>
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className={`w-full max-w-md rounded-2xl p-6 ${isDark ? 'bg-[#0d0d0d] border border-emerald-500/20' : 'bg-white'}`}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Add Asset</h2>
                            <button onClick={() => setShowAddModal(false)} className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10 text-white/50' : 'hover:bg-gray-100 text-gray-400'}`}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button className={`p-6 rounded-xl border-2 border-dashed flex flex-col items-center gap-3 transition-colors ${isDark ? 'border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/5' : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'}`}>
                                <Upload className={`w-8 h-8 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Upload File</span>
                            </button>
                            <button className={`p-6 rounded-xl border-2 border-dashed flex flex-col items-center gap-3 transition-colors ${isDark ? 'border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/5' : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'}`}>
                                <Link2 className={`w-8 h-8 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Add Link</span>
                            </button>
                        </div>

                        <div className={`mt-4 p-4 rounded-xl text-center text-sm ${isDark ? 'bg-white/5 text-white/50' : 'bg-gray-50 text-gray-500'}`}>
                            Drag and drop files here
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssetsPage;
