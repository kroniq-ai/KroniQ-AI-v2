/**
 * SocialKroniq.tsx - Premium Social Content Generation Workspace
 * Stunning design with glowing effects, glassmorphism cards, premium aesthetics
 * Generation only - no integrations, no posting
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
    Linkedin,
    Instagram,
    Twitter,
    Sparkles,
    Loader2,
    Copy,
    Check,
    RefreshCw,
    Image as ImageIcon,
    Hash,
    Zap,
    ChevronDown,
    ArrowLeft,
    Send,
    Wand2,
    MessageSquare,
    Target,
    Lightbulb,
    TrendingUp
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

// ===== PREMIUM ANIMATIONS =====

const premiumStyles = `
@keyframes glow-pulse {
    0%, 100% { opacity: 0.6; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.02); }
}

@keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
}

@keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}

@keyframes border-glow {
    0%, 100% { border-color: rgba(16, 185, 129, 0.3); box-shadow: 0 0 20px rgba(16, 185, 129, 0.1); }
    50% { border-color: rgba(16, 185, 129, 0.6); box-shadow: 0 0 40px rgba(16, 185, 129, 0.2); }
}

@keyframes gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

@keyframes success-pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
}

.animate-glow-pulse { animation: glow-pulse 3s ease-in-out infinite; }
.animate-float { animation: float 6s ease-in-out infinite; }
.animate-shimmer { animation: shimmer 3s linear infinite; background-size: 200% 100%; }
.animate-border-glow { animation: border-glow 3s ease-in-out infinite; }
.animate-gradient { animation: gradient-shift 4s ease infinite; background-size: 200% 200%; }
.animate-success { animation: success-pulse 0.3s ease-out; }
`;

// ===== TYPES =====

type Platform = 'linkedin' | 'instagram' | 'x';
type Tone = 'professional' | 'casual' | 'bold' | 'minimal';
type Audience = 'founders' | 'creators' | 'general';

interface GeneratedContent {
    copy: string;
    imagePrompt: string;
    imageUrl?: string;
    hooks: string[];
    hashtags: string[];
}

interface SocialKroniqProps {
    onBack?: () => void;
}

// ===== PLATFORM CONFIG =====

const PLATFORMS: { id: Platform; name: string; icon: React.ElementType; color: string; gradient: string; charLimit: number }[] = [
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0A66C2', gradient: 'from-blue-500 to-blue-600', charLimit: 3000 },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E1306C', gradient: 'from-pink-500 via-purple-500 to-orange-500', charLimit: 2200 },
    { id: 'x', name: 'X', icon: Twitter, color: '#1DA1F2', gradient: 'from-gray-700 to-black', charLimit: 280 },
];

const TONES: { id: Tone; label: string; icon: React.ElementType }[] = [
    { id: 'professional', label: 'Professional', icon: Target },
    { id: 'casual', label: 'Casual', icon: MessageSquare },
    { id: 'bold', label: 'Bold', icon: Zap },
    { id: 'minimal', label: 'Minimal', icon: Lightbulb },
];

const AUDIENCES: { id: Audience; label: string }[] = [
    { id: 'founders', label: 'Founders & CEOs' },
    { id: 'creators', label: 'Content Creators' },
    { id: 'general', label: 'General Audience' },
];

// ===== PREMIUM PLATFORM CARD =====

const PlatformCard: React.FC<{
    platform: typeof PLATFORMS[0];
    isSelected: boolean;
    onSelect: () => void;
    isDark: boolean;
}> = ({ platform, isSelected, onSelect, isDark }) => {
    const Icon = platform.icon;

    return (
        <button
            onClick={onSelect}
            className={`
                relative group flex flex-col items-center justify-center gap-3 p-6 rounded-3xl
                transition-all duration-500 transform
                ${isSelected
                    ? 'scale-105'
                    : 'hover:scale-102 hover:-translate-y-1'}
            `}
            style={{
                background: isSelected
                    ? `linear-gradient(135deg, ${platform.color}20, ${platform.color}10)`
                    : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                border: isSelected
                    ? `2px solid ${platform.color}60`
                    : isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)',
                boxShadow: isSelected
                    ? `0 0 60px ${platform.color}30, 0 20px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)`
                    : '0 4px 20px rgba(0,0,0,0.1)',
                minWidth: '140px'
            }}
        >
            {/* Glow effect on selection */}
            {isSelected && (
                <div
                    className="absolute inset-0 rounded-3xl animate-glow-pulse"
                    style={{
                        background: `radial-gradient(circle at 50% 50%, ${platform.color}20, transparent 70%)`,
                        pointerEvents: 'none'
                    }}
                />
            )}

            {/* Icon container with gradient */}
            <div
                className={`
                    relative w-14 h-14 rounded-2xl flex items-center justify-center
                    transition-all duration-300
                    ${isSelected ? 'bg-gradient-to-br ' + platform.gradient : ''}
                `}
                style={{
                    background: !isSelected
                        ? isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                        : undefined,
                    boxShadow: isSelected
                        ? `0 8px 25px ${platform.color}40`
                        : 'none'
                }}
            >
                <Icon
                    className={`w-7 h-7 transition-all duration-300 ${isSelected
                            ? 'text-white'
                            : isDark ? 'text-white/50' : 'text-gray-400'
                        }`}
                />
            </div>

            {/* Platform name */}
            <span className={`
                text-sm font-semibold tracking-wide transition-all duration-300
                ${isSelected
                    ? (isDark ? 'text-white' : 'text-gray-900')
                    : (isDark ? 'text-white/50' : 'text-gray-500')}
            `}>
                {platform.name}
            </span>

            {/* Character limit badge */}
            <span className={`
                text-xs px-2 py-0.5 rounded-full transition-all duration-300
                ${isSelected
                    ? 'bg-white/20 text-white/80'
                    : isDark ? 'bg-white/5 text-white/30' : 'bg-gray-100 text-gray-400'}
            `}>
                {platform.charLimit.toLocaleString()} chars
            </span>
        </button>
    );
};

// ===== PREMIUM GLASS CARD =====

const GlassCard: React.FC<{
    children: React.ReactNode;
    className?: string;
    isDark: boolean;
    glow?: boolean;
    glowColor?: string;
}> = ({ children, className = '', isDark, glow = false, glowColor = '#10b981' }) => (
    <div
        className={`
            relative rounded-3xl backdrop-blur-xl transition-all duration-500
            ${glow ? 'animate-border-glow' : ''}
            ${className}
        `}
        style={{
            background: isDark
                ? 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
            border: isDark
                ? '1px solid rgba(255,255,255,0.1)'
                : '1px solid rgba(0,0,0,0.05)',
            boxShadow: glow
                ? `0 0 40px ${glowColor}15, 0 20px 50px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)`
                : isDark
                    ? '0 20px 50px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
                    : '0 20px 50px rgba(0,0,0,0.08), 0 8px 25px rgba(0,0,0,0.05)'
        }}
    >
        {children}
    </div>
);

// ===== PREMIUM TONE SELECTOR =====

const ToneSelector: React.FC<{
    isDark: boolean;
    selected: Tone;
    onSelect: (tone: Tone) => void;
}> = ({ isDark, selected, onSelect }) => (
    <div className="grid grid-cols-4 gap-2">
        {TONES.map((tone) => {
            const isSelected = selected === tone.id;
            const Icon = tone.icon;
            return (
                <button
                    key={tone.id}
                    onClick={() => onSelect(tone.id)}
                    className={`
                        relative flex flex-col items-center gap-2 p-3 rounded-2xl
                        transition-all duration-300 group
                        ${isSelected
                            ? 'bg-emerald-500/20 border-emerald-500/50'
                            : isDark
                                ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}
                        border
                    `}
                >
                    <Icon className={`w-5 h-5 transition-colors ${isSelected ? 'text-emerald-400' : isDark ? 'text-white/40' : 'text-gray-400'
                        }`} />
                    <span className={`text-xs font-medium ${isSelected ? 'text-emerald-400' : isDark ? 'text-white/60' : 'text-gray-600'
                        }`}>
                        {tone.label}
                    </span>
                    {isSelected && (
                        <div className="absolute inset-0 rounded-2xl bg-emerald-500/10 animate-pulse" />
                    )}
                </button>
            );
        })}
    </div>
);

// ===== PREMIUM OUTPUT CARD =====

const OutputCard: React.FC<{
    isDark: boolean;
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    onRegenerate?: () => void;
    isRegenerating?: boolean;
    actions?: React.ReactNode;
    accentColor?: string;
}> = ({ isDark, title, icon: Icon, children, onRegenerate, isRegenerating, actions, accentColor = '#10b981' }) => (
    <GlassCard isDark={isDark} glow className="overflow-hidden">
        {/* Header with gradient accent */}
        <div
            className="px-6 py-4 border-b"
            style={{
                borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                background: `linear-gradient(135deg, ${accentColor}08, transparent)`
            }}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{
                            background: `linear-gradient(135deg, ${accentColor}30, ${accentColor}15)`,
                            boxShadow: `0 4px 15px ${accentColor}20`
                        }}
                    >
                        <Icon className="w-5 h-5" style={{ color: accentColor }} />
                    </div>
                    <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {title}
                    </h3>
                </div>

                <div className="flex items-center gap-2">
                    {actions}
                    {onRegenerate && (
                        <button
                            onClick={onRegenerate}
                            disabled={isRegenerating}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                                transition-all duration-300 group
                                ${isDark
                                    ? 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}
                            `}
                            style={{
                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                            }}
                        >
                            <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                            Regenerate
                        </button>
                    )}
                </div>
            </div>
        </div>

        {/* Content */}
        <div className="p-6">
            {children}
        </div>
    </GlassCard>
);

// ===== POST COPY EDITOR =====

const PostCopyEditor: React.FC<{
    isDark: boolean;
    content: string;
    platform: Platform;
    onChange: (content: string) => void;
    onRegenerate: () => void;
    isRegenerating: boolean;
}> = ({ isDark, content, platform, onChange, onRegenerate, isRegenerating }) => {
    const [copied, setCopied] = useState(false);
    const charLimit = PLATFORMS.find(p => p.id === platform)?.charLimit || 280;
    const charCount = content.length;
    const isOverLimit = charCount > charLimit;
    const percentage = Math.min((charCount / charLimit) * 100, 100);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <OutputCard
            isDark={isDark}
            title="Post Copy"
            icon={MessageSquare}
            onRegenerate={onRegenerate}
            isRegenerating={isRegenerating}
            accentColor="#10b981"
            actions={
                <button
                    onClick={handleCopy}
                    className={`
                        flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                        transition-all duration-300
                        ${copied
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : isDark
                                ? 'bg-white/5 hover:bg-emerald-500/20 text-white/60 hover:text-emerald-400'
                                : 'bg-gray-100 hover:bg-emerald-50 text-gray-600 hover:text-emerald-600'}
                    `}
                >
                    {copied ? <Check className="w-4 h-4 animate-success" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            }
        >
            <div className="relative">
                <textarea
                    value={content}
                    onChange={(e) => onChange(e.target.value)}
                    rows={8}
                    className={`
                        w-full p-5 rounded-2xl text-base leading-relaxed resize-none
                        transition-all duration-300 focus:outline-none
                        ${isDark
                            ? 'bg-white/[0.03] text-white placeholder-white/30'
                            : 'bg-gray-50 text-gray-900 placeholder-gray-400'}
                    `}
                    style={{
                        border: isDark
                            ? '1px solid rgba(255,255,255,0.08)'
                            : '1px solid rgba(0,0,0,0.05)',
                        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)'
                    }}
                    placeholder="Your generated post will appear here..."
                />

                {/* Character count with progress bar */}
                <div className="mt-4 flex items-center justify-between">
                    <div className="flex-1 mr-4">
                        <div
                            className="h-1.5 rounded-full overflow-hidden"
                            style={{
                                background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                            }}
                        >
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${percentage}%`,
                                    background: isOverLimit
                                        ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                                        : percentage > 80
                                            ? 'linear-gradient(90deg, #f59e0b, #d97706)'
                                            : 'linear-gradient(90deg, #10b981, #059669)'
                                }}
                            />
                        </div>
                    </div>
                    <span className={`text-sm font-medium ${isOverLimit
                            ? 'text-red-400'
                            : isDark ? 'text-white/40' : 'text-gray-400'
                        }`}>
                        {charCount.toLocaleString()} / {charLimit.toLocaleString()}
                    </span>
                </div>
            </div>
        </OutputCard>
    );
};

// ===== VISUAL GENERATOR =====

const VisualGenerator: React.FC<{
    isDark: boolean;
    imageUrl?: string;
    imagePrompt: string;
    onPromptChange: (prompt: string) => void;
    onRegenerate: () => void;
    isRegenerating: boolean;
}> = ({ isDark, imageUrl, imagePrompt, onPromptChange, onRegenerate, isRegenerating }) => (
    <OutputCard
        isDark={isDark}
        title="Visual Content"
        icon={ImageIcon}
        onRegenerate={onRegenerate}
        isRegenerating={isRegenerating}
        accentColor="#8b5cf6"
    >
        <div className="grid md:grid-cols-2 gap-6">
            {/* Image Preview */}
            <div
                className={`
                    aspect-square rounded-2xl overflow-hidden flex items-center justify-center
                    transition-all duration-500
                `}
                style={{
                    background: isDark
                        ? 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(139,92,246,0.05))'
                        : 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(139,92,246,0.02))',
                    border: isDark
                        ? '1px solid rgba(139,92,246,0.2)'
                        : '1px solid rgba(139,92,246,0.1)',
                    boxShadow: '0 10px 40px rgba(139,92,246,0.1)'
                }}
            >
                {isRegenerating ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
                            <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-purple-400 animate-pulse" />
                        </div>
                        <span className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                            Creating visual...
                        </span>
                    </div>
                ) : imageUrl ? (
                    <img src={imageUrl} alt="Generated visual" className="w-full h-full object-cover" />
                ) : (
                    <div className="flex flex-col items-center gap-4 p-8 text-center">
                        <div
                            className="w-20 h-20 rounded-2xl flex items-center justify-center"
                            style={{
                                background: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(139,92,246,0.1))'
                            }}
                        >
                            <ImageIcon className="w-10 h-10 text-purple-400/60" />
                        </div>
                        <div>
                            <p className={`font-medium ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                                Visual Preview
                            </p>
                            <p className={`text-sm ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                                Image will appear here
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Prompt Editor */}
            <div className="flex flex-col gap-4">
                <label className={`text-sm font-semibold ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                    Image Prompt
                </label>
                <textarea
                    value={imagePrompt}
                    onChange={(e) => onPromptChange(e.target.value)}
                    rows={6}
                    className={`
                        flex-1 p-4 rounded-2xl text-sm leading-relaxed resize-none
                        transition-all duration-300 focus:outline-none
                        ${isDark
                            ? 'bg-white/[0.03] text-white placeholder-white/30'
                            : 'bg-gray-50 text-gray-900 placeholder-gray-400'}
                    `}
                    style={{
                        border: isDark
                            ? '1px solid rgba(139,92,246,0.2)'
                            : '1px solid rgba(139,92,246,0.1)',
                    }}
                    placeholder="Describe the visual you want..."
                />
                <p className={`text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                    ✨ Tip: Be specific about style, colors, and composition
                </p>
            </div>
        </div>
    </OutputCard>
);

// ===== ENHANCEMENTS PANEL =====

const EnhancementsPanel: React.FC<{
    isDark: boolean;
    hooks: string[];
    hashtags: string[];
    onSelectHook: (hook: string) => void;
    onSelectHashtag: (hashtag: string) => void;
}> = ({ isDark, hooks, hashtags, onSelectHook, onSelectHashtag }) => (
    <div className="grid md:grid-cols-2 gap-6">
        {/* Hooks Card */}
        <GlassCard isDark={isDark} className="p-6">
            <div className="flex items-center gap-3 mb-5">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                        background: 'linear-gradient(135deg, rgba(245,158,11,0.3), rgba(245,158,11,0.15))',
                        boxShadow: '0 4px 15px rgba(245,158,11,0.2)'
                    }}
                >
                    <Lightbulb className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                    <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Hook Variations
                    </h4>
                    <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                        Click to use as opening line
                    </p>
                </div>
            </div>
            <div className="space-y-3">
                {hooks.length > 0 ? hooks.map((hook, i) => (
                    <button
                        key={i}
                        onClick={() => onSelectHook(hook)}
                        className={`
                            w-full text-left p-4 rounded-xl transition-all duration-300
                            ${isDark
                                ? 'bg-white/[0.03] hover:bg-amber-500/10 text-white/80 hover:text-amber-300'
                                : 'bg-gray-50 hover:bg-amber-50 text-gray-700 hover:text-amber-700'}
                            border hover:border-amber-500/30
                        `}
                        style={{
                            borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
                        }}
                    >
                        <span className="text-sm">{hook}</span>
                    </button>
                )) : (
                    <p className={`text-sm ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                        Hooks will appear here after generation
                    </p>
                )}
            </div>
        </GlassCard>

        {/* Hashtags Card */}
        <GlassCard isDark={isDark} className="p-6">
            <div className="flex items-center gap-3 mb-5">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{
                        background: 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(59,130,246,0.15))',
                        boxShadow: '0 4px 15px rgba(59,130,246,0.2)'
                    }}
                >
                    <Hash className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                    <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Hashtags
                    </h4>
                    <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                        Click to copy
                    </p>
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                {hashtags.length > 0 ? hashtags.map((tag, i) => (
                    <button
                        key={i}
                        onClick={() => onSelectHashtag(tag)}
                        className={`
                            px-4 py-2 rounded-full text-sm font-medium
                            transition-all duration-300 transform hover:scale-105
                            ${isDark
                                ? 'bg-blue-500/15 text-blue-400 hover:bg-blue-500/25'
                                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}
                        `}
                        style={{
                            boxShadow: '0 2px 10px rgba(59,130,246,0.1)'
                        }}
                    >
                        #{tag}
                    </button>
                )) : (
                    <p className={`text-sm ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                        Hashtags will appear here
                    </p>
                )}
            </div>
        </GlassCard>
    </div>
);

// ===== QUICK EDIT BAR =====

const QuickEditBar: React.FC<{
    isDark: boolean;
    onEdit: (instruction: string) => void;
    isProcessing: boolean;
}> = ({ isDark, onEdit, isProcessing }) => {
    const [input, setInput] = useState('');

    const suggestions = [
        { label: 'Shorter', icon: '✂️' },
        { label: 'Bolder', icon: '🔥' },
        { label: 'Add Emoji', icon: '😊' },
        { label: 'Professional', icon: '💼' },
        { label: 'Add CTA', icon: '👆' },
    ];

    const handleSubmit = () => {
        if (input.trim() && !isProcessing) {
            onEdit(input.trim());
            setInput('');
        }
    };

    return (
        <GlassCard isDark={isDark} glow glowColor="#10b981" className="p-6">
            <div className="flex items-center gap-3 mb-5">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center animate-float"
                    style={{
                        background: 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(16,185,129,0.15))',
                        boxShadow: '0 4px 15px rgba(16,185,129,0.2)'
                    }}
                >
                    <Wand2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                    <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Quick Edit
                    </h4>
                    <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                        Refine your content with AI
                    </p>
                </div>
            </div>

            {/* Suggestion chips */}
            <div className="flex flex-wrap gap-2 mb-4">
                {suggestions.map((s, i) => (
                    <button
                        key={i}
                        onClick={() => setInput(s.label)}
                        className={`
                            flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium
                            transition-all duration-300 transform hover:scale-105
                            ${isDark
                                ? 'bg-white/5 text-white/60 hover:bg-emerald-500/20 hover:text-emerald-400'
                                : 'bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'}
                        `}
                    >
                        <span>{s.icon}</span>
                        <span>{s.label}</span>
                    </button>
                ))}
            </div>

            {/* Input */}
            <div className="flex gap-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="Or type your edit instruction..."
                    className={`
                        flex-1 px-5 py-4 rounded-2xl text-sm
                        transition-all duration-300 focus:outline-none
                        ${isDark
                            ? 'bg-white/5 text-white placeholder-white/30'
                            : 'bg-gray-50 text-gray-900 placeholder-gray-400'}
                    `}
                    style={{
                        border: isDark
                            ? '1px solid rgba(16,185,129,0.2)'
                            : '1px solid rgba(16,185,129,0.1)',
                        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)'
                    }}
                />
                <button
                    onClick={handleSubmit}
                    disabled={!input.trim() || isProcessing}
                    className={`
                        px-6 py-4 rounded-2xl font-semibold text-sm flex items-center gap-2
                        transition-all duration-300 transform
                        ${input.trim() && !isProcessing
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:scale-105 shadow-lg shadow-emerald-500/25'
                            : isDark ? 'bg-white/5 text-white/20' : 'bg-gray-100 text-gray-300'}
                    `}
                >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </button>
            </div>
        </GlassCard>
    );
};

// ===== MAIN COMPONENT =====

export const SocialKroniq: React.FC<SocialKroniqProps> = ({ onBack }) => {
    const { currentTheme } = useTheme();
    const isDark = currentTheme === 'cosmic-dark';

    // State
    const [platform, setPlatform] = useState<Platform>('linkedin');
    const [intent, setIntent] = useState('');
    const [tone, setTone] = useState<Tone>('professional');
    const [audience, setAudience] = useState<Audience>('founders');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isRegeneratingCopy, setIsRegeneratingCopy] = useState(false);
    const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState<GeneratedContent | null>(null);

    // Generate content
    const handleGenerate = useCallback(async () => {
        if (!intent.trim()) return;
        setIsGenerating(true);

        try {
            const { generateContent } = await import('../../lib/social/SocialContentService');
            const result = await generateContent({
                intent: intent.trim(),
                platform,
                tone,
                audience
            });
            setContent({
                copy: result.copy,
                imagePrompt: result.imagePrompt,
                hooks: result.hooks,
                hashtags: result.hashtags
            });
        } catch (error) {
            console.error('Generation error:', error);
            setContent({
                copy: `${intent}\n\nShare your thoughts below! 👇`,
                imagePrompt: `Professional ${platform} visual about: ${intent}`,
                hooks: ["Here's what I learned...", "This changed everything..."],
                hashtags: ['startup', 'business', 'growth']
            });
        } finally {
            setIsGenerating(false);
        }
    }, [intent, platform, tone, audience]);

    // Regenerate copy
    const handleRegenerateCopy = useCallback(async () => {
        if (!content) return;
        setIsRegeneratingCopy(true);
        try {
            const { regenerateCopy } = await import('../../lib/social/SocialContentService');
            const newCopy = await regenerateCopy(content.copy, platform, tone);
            setContent(prev => prev ? { ...prev, copy: newCopy } : null);
        } catch (error) {
            console.error('Regenerate error:', error);
        } finally {
            setIsRegeneratingCopy(false);
        }
    }, [content, platform, tone]);

    // Regenerate image
    const handleRegenerateImage = useCallback(async () => {
        if (!content) return;
        setIsRegeneratingImage(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setIsRegeneratingImage(false);
    }, [content]);

    // Quick edit
    const handleQuickEdit = useCallback(async (instruction: string) => {
        if (!content) return;
        setIsEditing(true);
        try {
            const { editContent } = await import('../../lib/social/SocialContentService');
            const editedCopy = await editContent({
                currentContent: content.copy,
                instruction,
                platform
            });
            setContent(prev => prev ? { ...prev, copy: editedCopy } : null);
        } catch (error) {
            console.error('Edit error:', error);
        } finally {
            setIsEditing(false);
        }
    }, [content, platform]);

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: premiumStyles }} />

            <div className={`flex-1 flex flex-col min-h-screen overflow-hidden ${isDark ? 'bg-[#0a0a0a]' : 'bg-gradient-to-br from-gray-50 to-white'}`}>
                {/* Background effects */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {/* Gradient orbs */}
                    <div
                        className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[150px] opacity-20 animate-float"
                        style={{ background: 'radial-gradient(circle, #10b981, transparent)' }}
                    />
                    <div
                        className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[150px] opacity-15"
                        style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)', animationDelay: '2s' }}
                    />
                </div>

                {/* Header */}
                <header
                    className={`relative z-10 px-6 py-5 border-b backdrop-blur-xl`}
                    style={{
                        borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        background: isDark
                            ? 'linear-gradient(180deg, rgba(10,10,10,0.9), rgba(10,10,10,0.7))'
                            : 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))'
                    }}
                >
                    <div className="max-w-6xl mx-auto flex items-center justify-between">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 ${isDark ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-700'
                                    }`}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </button>
                        )}

                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center animate-glow-pulse"
                                style={{
                                    background: 'linear-gradient(135deg, #10b981, #059669)',
                                    boxShadow: '0 0 30px rgba(16,185,129,0.4)'
                                }}
                            >
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className={`font-bold text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Social KroniQ
                                </h1>
                                <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                                    AI-Powered Content
                                </p>
                            </div>
                        </div>

                        <div className="w-20" />
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto relative z-10">
                    <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">

                        {/* Platform Selection */}
                        <section className="text-center">
                            <h2 className={`text-sm font-semibold uppercase tracking-wider mb-6 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                                Choose Your Platform
                            </h2>
                            <div className="flex justify-center gap-6">
                                {PLATFORMS.map((p) => (
                                    <PlatformCard
                                        key={p.id}
                                        platform={p}
                                        isSelected={platform === p.id}
                                        onSelect={() => setPlatform(p.id)}
                                        isDark={isDark}
                                    />
                                ))}
                            </div>
                        </section>

                        {/* Intent Input Card */}
                        <GlassCard isDark={isDark} glow className="p-8">
                            <div className="space-y-6">
                                <div>
                                    <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        What do you want to post about?
                                    </label>
                                    <textarea
                                        value={intent}
                                        onChange={(e) => setIntent(e.target.value)}
                                        rows={3}
                                        placeholder="e.g., Announcing our new product launch, Sharing lessons from scaling to $1M ARR..."
                                        className={`
                                            w-full p-5 rounded-2xl text-base leading-relaxed resize-none
                                            transition-all duration-300 focus:outline-none
                                            ${isDark
                                                ? 'bg-white/[0.03] text-white placeholder-white/30'
                                                : 'bg-gray-50 text-gray-900 placeholder-gray-400'}
                                        `}
                                        style={{
                                            border: isDark
                                                ? '1px solid rgba(16,185,129,0.2)'
                                                : '1px solid rgba(16,185,129,0.1)',
                                            boxShadow: 'inset 0 2px 15px rgba(0,0,0,0.05)'
                                        }}
                                    />
                                </div>

                                {/* Tone & Audience */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                                            Tone
                                        </label>
                                        <ToneSelector isDark={isDark} selected={tone} onSelect={setTone} />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                                            Target Audience
                                        </label>
                                        <select
                                            value={audience}
                                            onChange={(e) => setAudience(e.target.value as Audience)}
                                            className={`
                                                w-full px-5 py-4 rounded-2xl text-sm font-medium
                                                appearance-none cursor-pointer transition-all duration-300
                                                ${isDark
                                                    ? 'bg-white/5 text-white border-white/10'
                                                    : 'bg-gray-50 text-gray-900 border-gray-200'}
                                                border focus:outline-none
                                            `}
                                        >
                                            {AUDIENCES.map(a => (
                                                <option key={a.id} value={a.id}>{a.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Generate Button */}
                                <button
                                    onClick={handleGenerate}
                                    disabled={!intent.trim() || isGenerating}
                                    className={`
                                        w-full py-5 rounded-2xl font-bold text-base flex items-center justify-center gap-3
                                        transition-all duration-500 transform
                                        ${intent.trim() && !isGenerating
                                            ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 text-white hover:scale-[1.02] animate-gradient'
                                            : isDark ? 'bg-white/5 text-white/20' : 'bg-gray-100 text-gray-300'}
                                    `}
                                    style={{
                                        boxShadow: intent.trim() && !isGenerating
                                            ? '0 10px 40px rgba(16,185,129,0.3), 0 4px 15px rgba(16,185,129,0.2)'
                                            : 'none'
                                    }}
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            Generating your content...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-6 h-6" />
                                            Generate Content
                                        </>
                                    )}
                                </button>
                            </div>
                        </GlassCard>

                        {/* Output Section */}
                        {content && (
                            <div className="space-y-8 animate-fade-in">
                                {/* Post Copy */}
                                <PostCopyEditor
                                    isDark={isDark}
                                    content={content.copy}
                                    platform={platform}
                                    onChange={(newCopy) => setContent(prev => prev ? { ...prev, copy: newCopy } : null)}
                                    onRegenerate={handleRegenerateCopy}
                                    isRegenerating={isRegeneratingCopy}
                                />

                                {/* Visual */}
                                <VisualGenerator
                                    isDark={isDark}
                                    imageUrl={content.imageUrl}
                                    imagePrompt={content.imagePrompt}
                                    onPromptChange={(prompt) => setContent(prev => prev ? { ...prev, imagePrompt: prompt } : null)}
                                    onRegenerate={handleRegenerateImage}
                                    isRegenerating={isRegeneratingImage}
                                />

                                {/* Enhancements */}
                                <EnhancementsPanel
                                    isDark={isDark}
                                    hooks={content.hooks}
                                    hashtags={content.hashtags}
                                    onSelectHook={(hook) => setContent(prev => prev ? { ...prev, copy: hook + '\n\n' + prev.copy } : null)}
                                    onSelectHashtag={(tag) => navigator.clipboard.writeText('#' + tag)}
                                />

                                {/* Quick Edit */}
                                <QuickEditBar
                                    isDark={isDark}
                                    onEdit={handleQuickEdit}
                                    isProcessing={isEditing}
                                />
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
};

export default SocialKroniq;
