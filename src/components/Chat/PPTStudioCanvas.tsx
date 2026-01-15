/**
 * PPTStudioCanvas - A split-view canvas for previewing presentations
 * Features:
 * - Slides preview grid/list
 * - Slide navigation
 * - Download PPTX button
 * - Closeable panel
 */

import React, { useState } from 'react';
import {
    X,
    Download,
    ChevronLeft,
    ChevronRight,
    Grid3X3,
    LayoutList,
    Loader2,
    Presentation,
    Edit2,
    Check
} from 'lucide-react';

interface Slide {
    id: string;
    title: string;
    content?: string;
    imageUrl?: string;
    bulletPoints?: string[];
}

interface PPTStudioCanvasProps {
    isDark: boolean;
    isOpen: boolean;
    onClose: () => void;
    slides: Slide[];
    isGenerating?: boolean;
    prompt?: string;
    pptxUrl?: string;
    fileName?: string;
    onDownload?: () => void;
    onSlideEdit?: (slideIndex: number, field: 'title' | 'content' | 'bulletPoints', value: string | string[]) => void;
}

const PPTStudioCanvas: React.FC<PPTStudioCanvasProps> = ({
    isDark,
    isOpen,
    onClose,
    slides,
    isGenerating = false,
    prompt = '',
    pptxUrl,
    fileName = 'presentation.pptx',
    onDownload,
    onSlideEdit
}) => {
    const [viewMode, setViewMode] = useState<'grid' | 'single'>('grid');
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [isEditing, setIsEditing] = useState(false);
    const [editingTitle, setEditingTitle] = useState('');
    const [editingBullets, setEditingBullets] = useState<string[]>([]);

    if (!isOpen) return null;

    const handlePrevSlide = () => {
        setCurrentSlideIndex(prev => Math.max(0, prev - 1));
    };

    const handleNextSlide = () => {
        setCurrentSlideIndex(prev => Math.min(slides.length - 1, prev + 1));
    };

    const handleDownload = () => {
        if (pptxUrl) {
            const link = document.createElement('a');
            link.href = pptxUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        if (onDownload) onDownload();
    };

    const startEditing = () => {
        const currentSlide = slides[currentSlideIndex];
        if (currentSlide) {
            setEditingTitle(currentSlide.title);
            setEditingBullets(currentSlide.bulletPoints || []);
            setIsEditing(true);
        }
    };

    const saveEditing = () => {
        if (onSlideEdit) {
            if (editingTitle !== slides[currentSlideIndex]?.title) {
                onSlideEdit(currentSlideIndex, 'title', editingTitle);
            }
            const currentBullets = slides[currentSlideIndex]?.bulletPoints || [];
            if (JSON.stringify(editingBullets) !== JSON.stringify(currentBullets)) {
                onSlideEdit(currentSlideIndex, 'bulletPoints', editingBullets);
            }
        }
        setIsEditing(false);
    };

    const updateBulletPoint = (index: number, value: string) => {
        const newBullets = [...editingBullets];
        newBullets[index] = value;
        setEditingBullets(newBullets);
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
                        ${isDark ? 'bg-orange-500/20' : 'bg-orange-100'}
                    `}>
                        <Presentation className={`w-4 h-4 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                    </div>
                    <div>
                        <h3 className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Slides Canvas
                        </h3>
                        <p className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                            {slides.length} slides
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
                        onClick={() => setViewMode('grid')}
                        className={`
                            p-2 rounded-lg transition-colors
                            ${viewMode === 'grid'
                                ? isDark ? 'bg-white/10 text-white' : 'bg-gray-200 text-gray-900'
                                : isDark ? 'text-white/50 hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100'
                            }
                        `}
                    >
                        <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('single')}
                        className={`
                            p-2 rounded-lg transition-colors
                            ${viewMode === 'single'
                                ? isDark ? 'bg-white/10 text-white' : 'bg-gray-200 text-gray-900'
                                : isDark ? 'text-white/50 hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100'
                            }
                        `}
                    >
                        <LayoutList className="w-4 h-4" />
                    </button>
                </div>

                <button
                    onClick={handleDownload}
                    disabled={!pptxUrl || isGenerating}
                    className={`
                        flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                        ${!pptxUrl || isGenerating
                            ? 'opacity-40 cursor-not-allowed'
                            : isDark
                                ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                        }
                    `}
                >
                    <Download className="w-3.5 h-3.5" />
                    Download PPTX
                </button>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 overflow-auto p-4">
                {isGenerating ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className="relative">
                            <div className={`
                                w-16 h-16 rounded-2xl flex items-center justify-center
                                ${isDark ? 'bg-orange-500/20' : 'bg-orange-100'}
                            `}>
                                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                            </div>
                        </div>
                        <p className={`mt-4 text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                            Creating your presentation...
                        </p>
                        {prompt && (
                            <p className={`mt-2 text-xs max-w-xs text-center ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                                "{prompt.substring(0, 100)}..."
                            </p>
                        )}
                    </div>
                ) : slides.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className={`
                            w-20 h-20 rounded-2xl flex items-center justify-center mb-4
                            ${isDark ? 'bg-white/5' : 'bg-gray-100'}
                        `}>
                            <Presentation className={`w-10 h-10 ${isDark ? 'text-white/30' : 'text-gray-300'}`} />
                        </div>
                        <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                            Preview of Your Slides
                        </p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                            Ask me to create a presentation!
                        </p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 gap-3">
                        {slides.map((slide, index) => (
                            <div
                                key={slide.id}
                                onClick={() => {
                                    setCurrentSlideIndex(index);
                                    setViewMode('single');
                                }}
                                className={`
                                    group relative rounded-lg overflow-hidden cursor-pointer
                                    border transition-all duration-200
                                    ${isDark
                                        ? 'bg-white/5 border-white/10 hover:border-orange-500/50'
                                        : 'bg-white border-gray-200 hover:border-orange-300 hover:shadow-md'
                                    }
                                `}
                            >
                                <div className="aspect-[16/9] p-3">
                                    <div className={`text-xs font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {slide.title}
                                    </div>
                                    {slide.bulletPoints && slide.bulletPoints.length > 0 && (
                                        <div className={`text-[10px] space-y-0.5 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                                            {slide.bulletPoints.slice(0, 3).map((point, i) => (
                                                <div key={i} className="truncate">• {point}</div>
                                            ))}
                                            {slide.bulletPoints.length > 3 && (
                                                <div className="text-white/40">+ {slide.bulletPoints.length - 3} more</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className={`
                                    absolute bottom-0 left-0 right-0 px-2 py-1 text-[10px]
                                    ${isDark ? 'bg-black/50 text-white/60' : 'bg-gray-100 text-gray-500'}
                                `}>
                                    Slide {index + 1}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        {/* Single Slide View */}
                        <div className="flex-1 flex items-center justify-center">
                            <div className={`
                                w-full max-w-md aspect-[16/9] rounded-xl p-6 relative
                                ${isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-lg'}
                            `}>
                                {/* Edit/Save Button */}
                                {onSlideEdit && (
                                    <button
                                        onClick={isEditing ? saveEditing : startEditing}
                                        className={`
                                            absolute top-3 right-3 p-2 rounded-lg transition-all
                                            ${isEditing
                                                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                                : isDark
                                                    ? 'bg-white/10 text-white/60 hover:bg-white/20'
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }
                                        `}
                                        title={isEditing ? 'Save changes' : 'Edit slide'}
                                    >
                                        {isEditing ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                                    </button>
                                )}

                                {/* Title - Editable or Static */}
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editingTitle}
                                        onChange={(e) => setEditingTitle(e.target.value)}
                                        className={`
                                            w-full text-lg font-bold mb-4 bg-transparent border-b-2 outline-none pb-1
                                            ${isDark
                                                ? 'text-white border-orange-500/50 focus:border-orange-500'
                                                : 'text-gray-900 border-orange-300 focus:border-orange-500'
                                            }
                                        `}
                                        placeholder="Slide title..."
                                    />
                                ) : (
                                    <div className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {slides[currentSlideIndex]?.title}
                                    </div>
                                )}

                                {/* Bullet Points - Editable or Static */}
                                {isEditing ? (
                                    <div className="space-y-2">
                                        {editingBullets.map((point, i) => (
                                            <div key={i} className="flex items-start gap-2">
                                                <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                                                <input
                                                    type="text"
                                                    value={point}
                                                    onChange={(e) => updateBulletPoint(i, e.target.value)}
                                                    className={`
                                                        flex-1 text-sm bg-transparent border-b outline-none pb-1
                                                        ${isDark
                                                            ? 'text-white/80 border-white/20 focus:border-orange-500/50'
                                                            : 'text-gray-700 border-gray-200 focus:border-orange-300'
                                                        }
                                                    `}
                                                    placeholder={`Bullet point ${i + 1}...`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    slides[currentSlideIndex]?.bulletPoints && (
                                        <div className={`space-y-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                                            {slides[currentSlideIndex].bulletPoints?.map((point, i) => (
                                                <div key={i} className="flex items-start gap-2 text-sm">
                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
                                                    <span>{point}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                )}

                                {/* Content - Static only (optional expand to editable) */}
                                {!isEditing && slides[currentSlideIndex]?.content && (
                                    <p className={`text-sm mt-4 ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                                        {slides[currentSlideIndex].content}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-center gap-4 py-4">
                            <button
                                onClick={handlePrevSlide}
                                disabled={currentSlideIndex === 0}
                                className={`
                                    p-2 rounded-lg transition-colors
                                    ${currentSlideIndex === 0 ? 'opacity-40 cursor-not-allowed' : ''}
                                    ${isDark ? 'hover:bg-white/10 text-white/60' : 'hover:bg-gray-100 text-gray-600'}
                                `}
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className={`text-sm font-medium ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                                {currentSlideIndex + 1} / {slides.length}
                            </span>
                            <button
                                onClick={handleNextSlide}
                                disabled={currentSlideIndex === slides.length - 1}
                                className={`
                                    p-2 rounded-lg transition-colors
                                    ${currentSlideIndex === slides.length - 1 ? 'opacity-40 cursor-not-allowed' : ''}
                                    ${isDark ? 'hover:bg-white/10 text-white/60' : 'hover:bg-gray-100 text-gray-600'}
                                `}
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer with prompt */}
            {prompt && !isGenerating && slides.length > 0 && (
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

export default PPTStudioCanvas;
