/**
 * Brand Kit Page — Branding Agent
 * Visual identity management
 */

import React, { useState } from 'react';
import {
    Palette,
    Plus,
    Edit3,
    X,
    Copy,
    Check
} from 'lucide-react';

interface BrandKitPageProps {
    isDark: boolean;
}

interface ColorSwatch {
    id: string;
    name: string;
    hex: string;
    usage: string;
}

export const BrandKitPage: React.FC<BrandKitPageProps> = ({ isDark }) => {
    const [colors, setColors] = useState<ColorSwatch[]>([
        { id: '1', name: 'Primary', hex: '#10B981', usage: 'Main brand color, CTAs' },
        { id: '2', name: 'Secondary', hex: '#059669', usage: 'Hover states, accents' },
        { id: '3', name: 'Background', hex: '#0A0A0A', usage: 'Dark mode background' },
        { id: '4', name: 'Text', hex: '#FFFFFF', usage: 'Primary text' },
        { id: '5', name: 'Muted', hex: '#6B7280', usage: 'Secondary text, borders' },
    ]);

    const [fonts] = useState([
        { name: 'Inter', weights: ['400', '500', '600', '700'], usage: 'Headings & Body' },
        { name: 'Fira Code', weights: ['400', '500'], usage: 'Code blocks' },
    ]);

    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopy = (hex: string, id: string) => {
        navigator.clipboard.writeText(hex);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                    <Palette className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-emerald-500/60' : 'text-emerald-600/80'}`}>
                        Branding Agent
                    </span>
                </div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Brand Kit</h1>
                <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Your brand's visual identity</p>
            </div>

            {/* Color Palette */}
            <div className={`p-6 rounded-2xl mb-6 ${isDark ? 'bg-[#0c0c0c] border border-white/5' : 'bg-white border border-gray-200'}`}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Color Palette</h2>
                    <button className={`text-xs font-medium flex items-center gap-1 ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-500'}`}>
                        <Plus className="w-3 h-3" /> Add Color
                    </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {colors.map(color => (
                        <div key={color.id} className="group">
                            <div
                                className="aspect-square rounded-2xl mb-2 relative cursor-pointer overflow-hidden"
                                style={{ backgroundColor: color.hex }}
                                onClick={() => handleCopy(color.hex, color.id)}
                            >
                                <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${color.hex === '#FFFFFF' || color.hex === '#ffffff' ? 'bg-black/20' : 'bg-white/20'}`}>
                                    {copiedId === color.id ? (
                                        <Check className="w-5 h-5 text-white" />
                                    ) : (
                                        <Copy className="w-5 h-5 text-white" />
                                    )}
                                </div>
                            </div>
                            <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{color.name}</p>
                            <p className={`text-xs font-mono ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{color.hex}</p>
                            <p className={`text-[10px] mt-0.5 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{color.usage}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Typography */}
            <div className={`p-6 rounded-2xl mb-6 ${isDark ? 'bg-[#0c0c0c] border border-white/5' : 'bg-white border border-gray-200'}`}>
                <h2 className={`text-sm font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Typography</h2>
                <div className="space-y-4">
                    {fonts.map(font => (
                        <div key={font.name} className={`p-4 rounded-xl ${isDark ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                            <div className="flex items-center justify-between mb-2">
                                <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: font.name }}>
                                    {font.name}
                                </p>
                                <span className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{font.usage}</span>
                            </div>
                            <p className={`text-2xl mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`} style={{ fontFamily: font.name }}>
                                The quick brown fox jumps over the lazy dog
                            </p>
                            <div className="flex gap-2">
                                {font.weights.map(w => (
                                    <span key={w} className={`px-2 py-1 rounded text-xs font-mono ${isDark ? 'bg-white/5 text-white/50' : 'bg-gray-100 text-gray-600'}`}>
                                        {w}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Logo */}
            <div className={`p-6 rounded-2xl ${isDark ? 'bg-[#0c0c0c] border border-white/5' : 'bg-white border border-gray-200'}`}>
                <h2 className={`text-sm font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Logo</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className={`p-8 rounded-xl flex items-center justify-center ${isDark ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-3">
                                <span className="text-white font-bold text-2xl">K</span>
                            </div>
                            <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Dark background</p>
                        </div>
                    </div>
                    <div className={`p-8 rounded-xl flex items-center justify-center bg-white`}>
                        <div className="text-center">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-3">
                                <span className="text-white font-bold text-2xl">K</span>
                            </div>
                            <p className="text-xs text-gray-500">Light background</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrandKitPage;
