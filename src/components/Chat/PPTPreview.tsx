/**
 * PPT Preview Component
 * Shows a visual preview of PowerPoint slides in the chat
 */

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Edit2, Maximize2, X } from 'lucide-react';
import type { PPTStructure, PPTSlide } from '../../lib/pptGeneratorService';

interface PPTPreviewProps {
    structure: PPTStructure;
    downloadUrl: string;
    fileName: string;
    isDark?: boolean;
    onEdit?: (slideIndex: number) => void;
    onRegenerate?: () => void;
}

// Individual slide preview renderer
const SlidePreview: React.FC<{
    slide: PPTSlide;
    theme: PPTStructure['theme'];
    slideNumber: number;
    totalSlides: number;
    isExpanded?: boolean;
}> = ({ slide, theme, slideNumber, totalSlides, isExpanded }) => {
    const bgColor = theme.backgroundColor;
    const textColor = theme.textColor;
    const accentColor = theme.accentColor;

    const baseClasses = isExpanded
        ? 'w-full h-[60vh] rounded-xl'
        : 'w-full aspect-video rounded-lg';

    return (
        <div
            className={`${baseClasses} relative overflow-hidden`}
            style={{ backgroundColor: bgColor }}
        >
            {/* Slide number badge */}
            <div
                className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-medium"
                style={{ backgroundColor: accentColor + '40', color: textColor }}
            >
                {slideNumber}/{totalSlides}
            </div>

            {/* Slide content based on layout */}
            <div className="absolute inset-0 p-4 flex flex-col">
                {slide.layout === 'title' && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <h1
                            className="text-lg md:text-2xl font-bold mb-2"
                            style={{ color: textColor }}
                        >
                            {slide.title}
                        </h1>
                        {slide.subtitle && (
                            <p
                                className="text-sm md:text-base"
                                style={{ color: accentColor }}
                            >
                                {slide.subtitle}
                            </p>
                        )}
                    </div>
                )}

                {slide.layout === 'section' && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <h2
                            className="text-lg md:text-xl font-bold"
                            style={{ color: accentColor }}
                        >
                            {slide.title}
                        </h2>
                        <div
                            className="mt-3 h-0.5 w-16 rounded"
                            style={{ backgroundColor: accentColor }}
                        />
                    </div>
                )}

                {(slide.layout === 'content' || slide.layout === 'bullets') && (
                    <div className="flex-1 flex flex-col">
                        <h3
                            className="text-sm md:text-base font-bold mb-3"
                            style={{ color: textColor }}
                        >
                            {slide.title}
                        </h3>
                        <div className="flex-1 flex gap-3">
                            <div className={`${slide.imagePrompt ? 'flex-1' : 'w-full'}`}>
                                {slide.bullets && (
                                    <ul className="space-y-1">
                                        {slide.bullets.slice(0, 5).map((bullet, i) => (
                                            <li
                                                key={i}
                                                className="text-xs flex items-start gap-1.5"
                                                style={{ color: textColor + 'cc' }}
                                            >
                                                <span style={{ color: accentColor }}>•</span>
                                                <span className="line-clamp-1">{bullet}</span>
                                            </li>
                                        ))}
                                        {slide.bullets.length > 5 && (
                                            <li
                                                className="text-xs italic"
                                                style={{ color: textColor + '80' }}
                                            >
                                                +{slide.bullets.length - 5} more...
                                            </li>
                                        )}
                                    </ul>
                                )}
                            </div>
                            {slide.imagePrompt && (
                                <div
                                    className="w-1/3 rounded bg-white/10 flex items-center justify-center text-xs"
                                    style={{ color: textColor + '60' }}
                                >
                                    🖼️
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {slide.layout === 'twoColumn' && (
                    <div className="flex-1 flex flex-col">
                        <h3
                            className="text-sm md:text-base font-bold mb-3"
                            style={{ color: textColor }}
                        >
                            {slide.title}
                        </h3>
                        <div className="flex-1 flex gap-2">
                            <div className="flex-1 space-y-1">
                                {slide.leftColumn?.slice(0, 3).map((item, i) => (
                                    <div
                                        key={i}
                                        className="text-xs flex items-start gap-1"
                                        style={{ color: textColor + 'cc' }}
                                    >
                                        <span style={{ color: accentColor }}>•</span>
                                        <span className="line-clamp-1">{item}</span>
                                    </div>
                                ))}
                            </div>
                            <div
                                className="w-px"
                                style={{ backgroundColor: textColor + '20' }}
                            />
                            <div className="flex-1 space-y-1">
                                {slide.rightColumn?.slice(0, 3).map((item, i) => (
                                    <div
                                        key={i}
                                        className="text-xs flex items-start gap-1"
                                        style={{ color: textColor + 'cc' }}
                                    >
                                        <span style={{ color: accentColor }}>•</span>
                                        <span className="line-clamp-1">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {slide.layout === 'quote' && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                        <p
                            className="text-sm italic mb-2"
                            style={{ color: textColor }}
                        >
                            "{slide.quote?.substring(0, 100)}{slide.quote && slide.quote.length > 100 ? '...' : ''}"
                        </p>
                        {slide.quoteAuthor && (
                            <p
                                className="text-xs"
                                style={{ color: accentColor }}
                            >
                                — {slide.quoteAuthor}
                            </p>
                        )}
                    </div>
                )}

                {slide.layout === 'closing' && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        <h2
                            className="text-lg md:text-xl font-bold mb-2"
                            style={{ color: textColor }}
                        >
                            {slide.title || 'Thank You'}
                        </h2>
                        {slide.subtitle && (
                            <p
                                className="text-xs"
                                style={{ color: accentColor }}
                            >
                                {slide.subtitle}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export const PPTPreview: React.FC<PPTPreviewProps> = ({
    structure,
    downloadUrl,
    fileName,
    isDark = true,
    onEdit,
    onRegenerate
}) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isExpanded, setIsExpanded] = useState(false);

    const slides = structure.slides;
    const totalSlides = slides.length;

    const goToSlide = (index: number) => {
        setCurrentSlide(Math.max(0, Math.min(index, totalSlides - 1)));
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            {/* Expanded fullscreen modal */}
            {isExpanded && (
                <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/10">
                        <div>
                            <h2 className="text-white font-bold">{structure.title}</h2>
                            <p className="text-white/60 text-sm">{totalSlides} slides</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleDownload}
                                className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-600 flex items-center gap-1.5"
                            >
                                <Download className="w-4 h-4" />
                                Download
                            </button>
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Main slide */}
                    <div className="flex-1 flex items-center justify-center p-8">
                        <div className="w-full max-w-4xl">
                            <SlidePreview
                                slide={slides[currentSlide]}
                                theme={structure.theme}
                                slideNumber={currentSlide + 1}
                                totalSlides={totalSlides}
                                isExpanded={true}
                            />
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="p-4 border-t border-white/10">
                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={() => goToSlide(currentSlide - 1)}
                                disabled={currentSlide === 0}
                                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg disabled:opacity-30"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>

                            {/* Thumbnails */}
                            <div className="flex gap-2 overflow-x-auto max-w-2xl pb-2">
                                {slides.map((slide, i) => (
                                    <button
                                        key={i}
                                        onClick={() => goToSlide(i)}
                                        className={`flex-shrink-0 w-16 h-10 rounded border-2 overflow-hidden transition-all ${i === currentSlide
                                                ? 'border-emerald-500 scale-110'
                                                : 'border-white/20 hover:border-white/40'
                                            }`}
                                        style={{ backgroundColor: structure.theme.backgroundColor }}
                                    >
                                        <div
                                            className="w-full h-full flex items-center justify-center text-[6px] text-center p-0.5"
                                            style={{ color: structure.theme.textColor + '80' }}
                                        >
                                            {slide.title?.substring(0, 15) || slide.layout}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => goToSlide(currentSlide + 1)}
                                disabled={currentSlide === totalSlides - 1}
                                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg disabled:opacity-30"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Inline preview card */}
            <div className={`rounded-xl border overflow-hidden ${isDark ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-gray-200'
                }`}>
                {/* Header */}
                <div className={`flex items-center justify-between p-3 border-b ${isDark ? 'border-white/10' : 'border-gray-100'
                    }`}>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                            <span className="text-lg">📊</span>
                        </div>
                        <div>
                            <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {structure.title}
                            </p>
                            <p className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                                {totalSlides} slides • Ready to download
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setIsExpanded(true)}
                            className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10 text-white/60' : 'hover:bg-gray-100 text-gray-500'
                                }`}
                            title="Expand preview"
                        >
                            <Maximize2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleDownload}
                            className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 flex items-center gap-1.5"
                        >
                            <Download className="w-3.5 h-3.5" />
                            Download
                        </button>
                    </div>
                </div>

                {/* Slide preview carousel */}
                <div className="p-3">
                    <div className="relative">
                        {/* Current slide */}
                        <SlidePreview
                            slide={slides[currentSlide]}
                            theme={structure.theme}
                            slideNumber={currentSlide + 1}
                            totalSlides={totalSlides}
                        />

                        {/* Navigation arrows */}
                        {totalSlides > 1 && (
                            <>
                                <button
                                    onClick={() => goToSlide(currentSlide - 1)}
                                    disabled={currentSlide === 0}
                                    className={`absolute left-1 top-1/2 -translate-y-1/2 p-1 rounded-full ${isDark ? 'bg-black/50 text-white' : 'bg-white/80 text-gray-700'
                                        } disabled:opacity-30 hover:scale-110 transition-transform`}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => goToSlide(currentSlide + 1)}
                                    disabled={currentSlide === totalSlides - 1}
                                    className={`absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-full ${isDark ? 'bg-black/50 text-white' : 'bg-white/80 text-gray-700'
                                        } disabled:opacity-30 hover:scale-110 transition-transform`}
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </>
                        )}
                    </div>

                    {/* Slide dots */}
                    {totalSlides > 1 && (
                        <div className="flex justify-center gap-1 mt-2">
                            {slides.slice(0, 10).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => goToSlide(i)}
                                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentSlide
                                            ? 'bg-orange-500 w-3'
                                            : isDark ? 'bg-white/30 hover:bg-white/50' : 'bg-gray-300 hover:bg-gray-400'
                                        }`}
                                />
                            ))}
                            {totalSlides > 10 && (
                                <span className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                                    +{totalSlides - 10}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default PPTPreview;
