/**
 * DesignStudioCanvas - A split-view canvas for displaying design variations
 * Features:
 * - Gallery grid for 4 design variations
 * - Canvas toolbar (Zoom, Pan, Download)
 * - Variation labels
 * - Closeable panel
 */

import React, { useState } from 'react';
import {
    X,
    Download,
    ZoomIn,
    ZoomOut,
    Maximize2,
    RotateCcw,
    Copy,
    Check,
    Loader2,
    RefreshCw
} from 'lucide-react';

interface DesignVariation {
    id: string;
    url: string;
    label: string;
    isSelected?: boolean;
}

interface DesignStudioCanvasProps {
    isDark: boolean;
    isOpen: boolean;
    onClose: () => void;
    variations: DesignVariation[];
    isGenerating?: boolean;
    prompt?: string;
    onRegenerateVariation?: (id: string) => void;
    onDownload?: (id: string) => void;
    onDownloadAll?: () => void;
}

const DesignStudioCanvas: React.FC<DesignStudioCanvasProps> = ({
    isDark,
    isOpen,
    onClose,
    variations,
    isGenerating = false,
    prompt = '',
    onRegenerateVariation,
    onDownload,
    onDownloadAll
}) => {
    const [zoom, setZoom] = useState(100);
    const [selectedVariation, setSelectedVariation] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
    const handleResetZoom = () => setZoom(100);

    const handleCopyImage = async (url: string, id: string) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            await navigator.clipboard.write([
                new ClipboardItem({ [blob.type]: blob })
            ]);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (error) {
            console.error('Failed to copy image:', error);
        }
    };

    const handleDownloadImage = (url: string, label: string) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = `${label.toLowerCase().replace(/\s+/g, '-')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className={`
            flex flex-col h-full border-l
            ${isDark ? 'bg-[#0d0d0d] border-white/10' : 'bg-gray-50 border-gray-200'}
        `}>
            {/* Header */}
            <div className={`
                flex items-center justify-between px-4 py-3 border-b
                ${isDark ? 'border-white/10' : 'border-gray-200'}
            `}>
                <div className="flex items-center gap-2">
                    <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center
                        ${isDark ? 'bg-pink-500/20' : 'bg-pink-100'}
                    `}>
                        <span className="text-lg">🎨</span>
                    </div>
                    <div>
                        <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            AI Designer Canvas
                        </h3>
                        <p className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                            {variations.length} variations
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className={`
                        p-2 rounded-lg transition-colors
                        ${isDark ? 'hover:bg-white/10 text-white/60' : 'hover:bg-gray-200 text-gray-500'}
                    `}
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Toolbar */}
            <div className={`
                flex items-center justify-between px-4 py-2 border-b
                ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-gray-100 bg-white'}
            `}>
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleZoomOut}
                        disabled={zoom <= 50}
                        className={`
                            p-2 rounded-lg transition-colors
                            ${zoom <= 50 ? 'opacity-40 cursor-not-allowed' : ''}
                            ${isDark ? 'hover:bg-white/10 text-white/60' : 'hover:bg-gray-100 text-gray-600'}
                        `}
                    >
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className={`text-xs font-medium px-2 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                        {zoom}%
                    </span>
                    <button
                        onClick={handleZoomIn}
                        disabled={zoom >= 200}
                        className={`
                            p-2 rounded-lg transition-colors
                            ${zoom >= 200 ? 'opacity-40 cursor-not-allowed' : ''}
                            ${isDark ? 'hover:bg-white/10 text-white/60' : 'hover:bg-gray-100 text-gray-600'}
                        `}
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleResetZoom}
                        className={`
                            p-2 rounded-lg transition-colors
                            ${isDark ? 'hover:bg-white/10 text-white/60' : 'hover:bg-gray-100 text-gray-600'}
                        `}
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>

                <button
                    onClick={onDownloadAll}
                    disabled={variations.length === 0 || isGenerating}
                    className={`
                        flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                        ${variations.length === 0 || isGenerating
                            ? 'opacity-40 cursor-not-allowed'
                            : isDark
                                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                                : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        }
                    `}
                >
                    <Download className="w-3.5 h-3.5" />
                    Download All
                </button>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 overflow-auto p-4">
                {isGenerating ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="relative">
                            <div className={`
                                w-16 h-16 rounded-2xl flex items-center justify-center
                                ${isDark ? 'bg-pink-500/20' : 'bg-pink-100'}
                            `}>
                                <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
                            </div>
                        </div>
                        <p className={`mt-4 text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                            Creating your designs...
                        </p>
                        {prompt && (
                            <p className={`mt-2 text-xs max-w-xs text-center ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                                "{prompt.substring(0, 100)}..."
                            </p>
                        )}
                    </div>
                ) : variations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className={`
                            w-20 h-20 rounded-2xl flex items-center justify-center mb-4
                            ${isDark ? 'bg-white/5' : 'bg-gray-100'}
                        `}>
                            <span className="text-4xl opacity-50">🎨</span>
                        </div>
                        <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                            No designs yet
                        </p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                            Ask me to design something!
                        </p>
                    </div>
                ) : (
                    <div
                        className="grid grid-cols-2 gap-4"
                        style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
                    >
                        {variations.map((variation) => (
                            <div
                                key={variation.id}
                                onClick={() => setSelectedVariation(
                                    selectedVariation === variation.id ? null : variation.id
                                )}
                                className={`
                                    group relative rounded-xl overflow-hidden cursor-pointer
                                    transition-all duration-200
                                    ${selectedVariation === variation.id
                                        ? isDark
                                            ? 'ring-2 ring-pink-500 shadow-lg shadow-pink-500/20'
                                            : 'ring-2 ring-pink-500 shadow-lg shadow-pink-500/20'
                                        : isDark
                                            ? 'hover:ring-1 hover:ring-white/20'
                                            : 'hover:ring-1 hover:ring-gray-300 hover:shadow-md'
                                    }
                                `}
                            >
                                <img
                                    src={variation.url}
                                    alt={variation.label}
                                    className="w-full aspect-[4/5] object-cover"
                                />

                                {/* Label */}
                                <div className={`
                                    absolute bottom-0 left-0 right-0 px-3 py-2
                                    bg-gradient-to-t from-black/80 to-transparent
                                `}>
                                    <p className="text-white text-xs font-medium truncate">
                                        {variation.label}
                                    </p>
                                </div>

                                {/* Hover Actions */}
                                <div className={`
                                    absolute top-2 right-2 flex gap-1.5
                                    opacity-0 group-hover:opacity-100 transition-opacity
                                `}>
                                    {/* Regenerate Button */}
                                    {onRegenerateVariation && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRegenerateVariation(variation.id);
                                            }}
                                            title="Regenerate this variation"
                                            className="p-1.5 rounded-lg bg-gradient-to-r from-pink-500/80 to-purple-500/80 backdrop-blur-sm text-white hover:from-pink-500 hover:to-purple-500 transition-all shadow-lg"
                                        >
                                            <RefreshCw className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCopyImage(variation.url, variation.id);
                                        }}
                                        className="p-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition-colors"
                                    >
                                        {copiedId === variation.id ? (
                                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                                        ) : (
                                            <Copy className="w-3.5 h-3.5" />
                                        )}
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDownloadImage(variation.url, variation.label);
                                            if (onDownload) onDownload(variation.id);
                                        }}
                                        className="p-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition-colors"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // Open fullscreen
                                            window.open(variation.url, '_blank');
                                        }}
                                        className="p-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition-colors"
                                    >
                                        <Maximize2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer with prompt */}
            {prompt && !isGenerating && variations.length > 0 && (
                <div className={`
                    px-4 py-3 border-t
                    ${isDark ? 'border-white/5 bg-white/[0.02]' : 'border-gray-100 bg-white'}
                `}>
                    <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                        Prompt: "{prompt.length > 100 ? prompt.substring(0, 100) + '...' : prompt}"
                    </p>
                </div>
            )}
        </div>
    );
};

export default DesignStudioCanvas;
