/**
 * Onboarding Modal - Welcome new users and show them what they can do
 * Features beautiful glowing design with image carousel
 */

import React, { useState } from 'react';
import {
    X,
    ChevronRight,
    ChevronLeft,
    MessageSquare,
    Image as ImageIcon,
    Video,
    Presentation,
    Sparkles,
    ArrowRight
} from 'lucide-react';

interface OnboardingModalProps {
    onClose: () => void;
    onComplete: () => void;
}

interface OnboardingSlide {
    title: string;
    subtitle: string;
    description: string;
    icon: React.ElementType;
    features: string[];
    imagePath?: string;
    gradient: string;
}

const slides: OnboardingSlide[] = [
    {
        title: 'Welcome to KroniQ AI',
        subtitle: 'Your All-in-One AI Platform',
        description: 'Access 70+ AI models for chat, images, video, music, voice, and presentations — all from one unified interface.',
        icon: Sparkles,
        features: [
            '70+ AI models including GPT-4, Claude, Gemini',
            'Smart routing picks the best model automatically',
            'One token balance for everything',
        ],
        gradient: 'from-emerald-500 to-teal-600',
    },
    {
        title: 'Chat Studio',
        subtitle: 'Intelligent Conversations',
        description: 'Have natural conversations with the world\'s most powerful AI models. Ask anything, get instant answers.',
        icon: MessageSquare,
        features: [
            'Multi-model chat with 70+ options',
            'Context memory remembers your projects',
            'Quick adjustments — shorter, longer, regenerate',
        ],
        gradient: 'from-teal-500 to-cyan-600',
    },
    {
        title: 'Image Studio',
        subtitle: 'Create Stunning Visuals',
        description: 'Generate beautiful images from text descriptions using FLUX, DALL-E 3, and more.',
        icon: ImageIcon,
        features: [
            '10+ image generation models',
            'Up to 4K resolution',
            'Multiple styles and aspect ratios',
        ],
        gradient: 'from-cyan-500 to-blue-600',
    },
    {
        title: 'Video & Music Studios',
        subtitle: 'Multimedia Creation',
        description: 'Generate videos, compose music, and create voice-overs — all with AI assistance.',
        icon: Video,
        features: [
            'Video generation with Kling, Runway, and more',
            'AI music composition with Suno',
            'Text-to-speech with 50+ natural voices',
        ],
        gradient: 'from-blue-500 to-purple-600',
    },
    {
        title: 'PPT Studio',
        subtitle: 'Instant Presentations',
        description: 'Create professional presentations in seconds. Just describe your topic and let AI design the slides.',
        icon: Presentation,
        features: [
            'AI-designed slide layouts',
            'Multiple themes and styles',
            'Ready-to-use templates',
        ],
        gradient: 'from-purple-500 to-pink-600',
    },
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onClose, onComplete }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const nextSlide = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            handleComplete();
        }
        setTimeout(() => setIsAnimating(false), 300);
    };

    const prevSlide = () => {
        if (isAnimating || currentSlide === 0) return;
        setIsAnimating(true);
        setCurrentSlide(currentSlide - 1);
        setTimeout(() => setIsAnimating(false), 300);
    };

    const handleComplete = () => {
        // Save that user has completed onboarding
        localStorage.setItem('kroniq_onboarding_complete', 'true');
        onComplete();
    };

    const handleSkip = () => {
        localStorage.setItem('kroniq_onboarding_complete', 'true');
        onClose();
    };

    const slide = slides[currentSlide];
    const Icon = slide.icon;
    const isLastSlide = currentSlide === slides.length - 1;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            {/* Background glowing orbs */}
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[150px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-teal-500/15 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[180px] pointer-events-none" />

            {/* Modal container */}
            <div className="relative w-full max-w-2xl bg-gradient-to-br from-[#0d1117] via-[#0a0f14] to-[#0d1117] rounded-3xl border border-white/10 shadow-2xl overflow-hidden z-10">
                {/* Glowing top border */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent rounded-full" />

                {/* Close button */}
                <button
                    onClick={handleSkip}
                    className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Content */}
                <div className="p-6 sm:p-8 md:p-10">
                    {/* Icon with glow */}
                    <div className="relative mx-auto mb-4 sm:mb-6 w-16 h-16 sm:w-20 sm:h-20">
                        <div
                            className="absolute inset-0 rounded-full blur-2xl animate-pulse"
                            style={{
                                background: `linear-gradient(135deg, rgba(16, 185, 129, 0.6) 0%, rgba(20, 184, 166, 0.4) 100%)`
                            }}
                        />
                        <div className={`
                            relative w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl flex items-center justify-center
                            bg-gradient-to-br ${slide.gradient}
                            shadow-xl shadow-emerald-500/30
                            transform transition-all duration-300
                        `}>
                            <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-4 sm:mb-6">
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2">
                            {slide.title}
                        </h2>
                        <p className="text-emerald-400 font-medium text-sm sm:text-base">
                            {slide.subtitle}
                        </p>
                    </div>

                    {/* Description */}
                    <p className="text-white/70 text-center text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-lg mx-auto leading-relaxed">
                        {slide.description}
                    </p>

                    {/* Features list */}
                    <div className="bg-white/5 rounded-2xl p-4 sm:p-5 border border-white/10 mb-6 sm:mb-8">
                        <div className="space-y-2 sm:space-y-3">
                            {slide.features.map((feature, idx) => (
                                <div key={idx} className="flex items-start gap-2 sm:gap-3">
                                    <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full" />
                                    </div>
                                    <span className="text-white/80 text-xs sm:text-sm">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Progress dots */}
                    <div className="flex justify-center gap-2 mb-6">
                        {slides.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => !isAnimating && setCurrentSlide(idx)}
                                className={`
                                    w-2.5 h-2.5 rounded-full transition-all duration-300
                                    ${idx === currentSlide
                                        ? 'bg-emerald-400 w-8 shadow-lg shadow-emerald-400/50'
                                        : 'bg-white/20 hover:bg-white/40'}
                                `}
                            />
                        ))}
                    </div>

                    {/* Navigation buttons */}
                    <div className="flex items-center justify-between gap-2 sm:gap-4">
                        <button
                            onClick={handleSkip}
                            className="px-3 sm:px-4 py-2 text-white/50 hover:text-white/80 text-xs sm:text-sm transition-colors"
                        >
                            Skip tour
                        </button>

                        <div className="flex items-center gap-2 sm:gap-3">
                            {currentSlide > 0 && (
                                <button
                                    onClick={prevSlide}
                                    className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all text-sm"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    <span className="hidden sm:inline">Back</span>
                                </button>
                            )}

                            <button
                                onClick={nextSlide}
                                className="flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-105 transition-all text-sm sm:text-base"
                            >
                                {isLastSlide ? 'Get Started' : 'Next'}
                                {isLastSlide ? <ArrowRight className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OnboardingModal;
