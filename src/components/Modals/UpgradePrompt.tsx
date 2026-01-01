import React from 'react';
import { Zap, X, Video, Image, Presentation, MessageSquare } from 'lucide-react';

interface UpgradePromptProps {
    isOpen: boolean;
    onClose: () => void;
    feature: 'video' | 'ppt' | 'image' | 'message';
    currentTier: 'FREE' | 'PRO' | 'PREMIUM';
    onUpgrade: () => void;
}

const FEATURE_INFO: Record<string, { icon: any; title: string; description: string; requiresTier: string }> = {
    video: {
        icon: Video,
        title: 'Video Generation',
        description: 'Create stunning AI videos from text prompts',
        requiresTier: 'Pro',
    },
    ppt: {
        icon: Presentation,
        title: 'Presentation Generation',
        description: 'Generate professional PowerPoint presentations instantly',
        requiresTier: 'Pro',
    },
    image: {
        icon: Image,
        title: 'More Image Credits',
        description: 'Generate more high-quality AI images',
        requiresTier: 'Pro',
    },
    message: {
        icon: MessageSquare,
        title: 'More Messages',
        description: 'Get more daily AI chat messages',
        requiresTier: 'Pro',
    },
};

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
    isOpen,
    onClose,
    feature,
    currentTier,
    onUpgrade,
}) => {
    if (!isOpen) return null;

    const info = FEATURE_INFO[feature];
    const Icon = info.icon;

    return (
        <div
            className="fixed inset-0 z-[150] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            <div
                className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 max-w-sm w-full border border-emerald-500/30 shadow-2xl"
                onClick={e => e.stopPropagation()}
                style={{ boxShadow: '0 0 60px rgba(16, 185, 129, 0.2)' }}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-emerald-400" />
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-white text-center mb-2">
                    Unlock {info.title}
                </h3>

                {/* Description */}
                <p className="text-white/60 text-center text-sm mb-4">
                    {info.description}
                </p>

                {/* Current Tier Badge */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    <span className="text-xs text-white/40">Current plan:</span>
                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/10 text-white/60">
                        {currentTier}
                    </span>
                </div>

                {/* Upgrade Benefits */}
                <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-white/80 text-sm">
                        <span className="text-emerald-400">✓</span>
                        {feature === 'video' && 'Up to 6 videos per week'}
                        {feature === 'ppt' && 'Up to 12 presentations per month'}
                        {feature === 'image' && 'Up to 12 images per week'}
                        {feature === 'message' && 'Up to 70 messages per day'}
                    </div>
                    <div className="flex items-center gap-2 text-white/80 text-sm">
                        <span className="text-emerald-400">✓</span>
                        Access to premium AI models
                    </div>
                    <div className="flex items-center gap-2 text-white/80 text-sm">
                        <span className="text-emerald-400">✓</span>
                        Priority support
                    </div>
                </div>

                {/* Buttons */}
                <div className="space-y-2">
                    <button
                        onClick={onUpgrade}
                        className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 transition-all flex items-center justify-center gap-2"
                    >
                        <Zap className="w-4 h-4" />
                        Upgrade to {info.requiresTier}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-2 text-sm text-white/40 hover:text-white/60 transition-colors"
                    >
                        Maybe later
                    </button>
                </div>
            </div>
        </div>
    );
};
