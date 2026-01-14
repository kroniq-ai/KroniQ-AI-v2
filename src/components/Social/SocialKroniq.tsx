/**
 * SocialKroniq.tsx - Premium Edition
 * Advanced glassmorphism design + FULL working features
 * 
 * Design: Glowing cards, gradients, animations
 * Features: Multi-output, separate editing, project saving
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
    ChevronDown,
    ArrowLeft,
    Send,
    Save,
    Edit3,
    MessageCircle,
    Zap,
    Share2,
    CheckCircle,
    Lightbulb,
    Target,
    TrendingUp,
    Wand2
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { generatePixazoImage, isPixazoConfigured } from '../../lib/pixazoService';

// ===== PREMIUM ANIMATIONS =====

const premiumStyles = `
@keyframes glow-pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
}

@keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-8px); }
}

@keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
}

@keyframes gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

@keyframes border-glow {
    0%, 100% { 
        border-color: rgba(16, 185, 129, 0.2);
        box-shadow: 0 0 20px rgba(16, 185, 129, 0.05);
    }
    50% { 
        border-color: rgba(16, 185, 129, 0.4);
        box-shadow: 0 0 40px rgba(16, 185, 129, 0.1);
    }
}

@keyframes card-hover {
    0% { transform: translateY(0); }
    100% { transform: translateY(-4px); }
}

.animate-glow-pulse { animation: glow-pulse 3s ease-in-out infinite; }
.animate-float { animation: float 6s ease-in-out infinite; }
.animate-shimmer { animation: shimmer 3s linear infinite; background-size: 200% 100%; }
.animate-gradient { animation: gradient-shift 4s ease infinite; background-size: 200% 200%; }
.animate-border-glow { animation: border-glow 3s ease-in-out infinite; }

.glass-card {
    background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.08);
}

.glass-card-light {
    background: linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(0,0,0,0.05);
}
`;

// ===== TYPES =====

type Platform = 'linkedin' | 'instagram' | 'x';
type Tone = 'professional' | 'casual' | 'bold' | 'minimal';

interface GeneratedContent {
    postText: string;
    imageUrl: string | null;
    imagePrompt: string;
    hooks: string[];
    hashtags: string[];
    cta: string;
}

interface SocialKroniqProps {
    onBack?: () => void;
}

// ===== PLATFORM CONFIG =====

const PLATFORMS: { id: Platform; name: string; icon: React.ElementType; color: string; gradient: string; charLimit: number }[] = [
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0A66C2', gradient: 'from-blue-600 to-blue-700', charLimit: 3000 },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E1306C', gradient: 'from-pink-500 via-purple-500 to-orange-400', charLimit: 2200 },
    { id: 'x', name: 'X', icon: Twitter, color: '#000000', gradient: 'from-gray-800 to-black', charLimit: 280 },
];

const TONES: { id: Tone; label: string; icon: React.ElementType }[] = [
    { id: 'professional', label: 'Professional', icon: Target },
    { id: 'casual', label: 'Casual', icon: MessageCircle },
    { id: 'bold', label: 'Bold', icon: Zap },
    { id: 'minimal', label: 'Minimal', icon: Lightbulb },
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
                relative group flex flex-col items-center gap-3 p-5 rounded-2xl
                transition-all duration-500 transform
                ${isSelected ? 'scale-105' : 'hover:scale-102 hover:-translate-y-1'}
            `}
            style={{
                background: isSelected
                    ? `linear-gradient(135deg, ${platform.color}25, ${platform.color}10)`
                    : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                border: isSelected
                    ? `2px solid ${platform.color}50`
                    : isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.04)',
                boxShadow: isSelected
                    ? `0 0 50px ${platform.color}25, 0 15px 35px rgba(0,0,0,0.2)`
                    : '0 4px 15px rgba(0,0,0,0.1)',
                minWidth: '130px'
            }}
        >
            {/* Glow effect */}
            {isSelected && (
                <div
                    className="absolute inset-0 rounded-2xl animate-glow-pulse"
                    style={{
                        background: `radial-gradient(circle at 50% 50%, ${platform.color}15, transparent 70%)`,
                    }}
                />
            )}

            {/* Icon */}
            <div
                className={`
                    relative w-12 h-12 rounded-xl flex items-center justify-center
                    transition-all duration-300
                `}
                style={{
                    background: isSelected
                        ? `linear-gradient(135deg, ${platform.color}, ${platform.color}cc)`
                        : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                    boxShadow: isSelected ? `0 8px 25px ${platform.color}40` : 'none'
                }}
            >
                <Icon className={`w-6 h-6 transition-colors ${isSelected ? 'text-white' : isDark ? 'text-white/40' : 'text-gray-400'}`} />
            </div>

            <span className={`text-sm font-semibold transition-colors ${isSelected ? (isDark ? 'text-white' : 'text-gray-900') : (isDark ? 'text-white/40' : 'text-gray-400')
                }`}>
                {platform.name}
            </span>

            <span className={`text-xs px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white/80' : isDark ? 'bg-white/5 text-white/25' : 'bg-gray-100 text-gray-400'
                }`}>
                {platform.charLimit.toLocaleString()} chars
            </span>
        </button>
    );
};

// ===== TONE SELECTOR =====

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
                        relative flex flex-col items-center gap-2 p-3 rounded-xl
                        transition-all duration-300
                        ${isSelected
                            ? 'bg-emerald-500/15 border-emerald-500/40'
                            : isDark
                                ? 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06]'
                                : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}
                        border
                    `}
                    style={{
                        boxShadow: isSelected ? '0 0 25px rgba(16, 185, 129, 0.15)' : 'none'
                    }}
                >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-emerald-400' : isDark ? 'text-white/30' : 'text-gray-400'}`} />
                    <span className={`text-xs font-medium ${isSelected ? 'text-emerald-400' : isDark ? 'text-white/50' : 'text-gray-500'}`}>
                        {tone.label}
                    </span>
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
    iconColor: string;
    children: React.ReactNode;
    headerActions?: React.ReactNode;
    onRegenerate?: () => void;
    isRegenerating?: boolean;
}> = ({ isDark, title, icon: Icon, iconColor, children, headerActions, onRegenerate, isRegenerating }) => (
    <div
        className={`
            rounded-2xl overflow-hidden transition-all duration-500
            ${isDark ? 'glass-card' : 'glass-card-light'}
        `}
        style={{
            boxShadow: isDark
                ? '0 20px 50px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
                : '0 20px 50px rgba(0,0,0,0.08)'
        }}
    >
        {/* Header */}
        <div
            className={`px-5 py-4 border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}
            style={{
                background: `linear-gradient(135deg, ${iconColor}08, transparent)`
            }}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{
                            background: `linear-gradient(135deg, ${iconColor}30, ${iconColor}15)`,
                            boxShadow: `0 4px 15px ${iconColor}20`
                        }}
                    >
                        <Icon className="w-4.5 h-4.5" style={{ color: iconColor }} />
                    </div>
                    <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
                </div>

                <div className="flex items-center gap-2">
                    {headerActions}
                    {onRegenerate && (
                        <button
                            onClick={onRegenerate}
                            disabled={isRegenerating}
                            className={`
                                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                                transition-all duration-300
                                ${isDark
                                    ? 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                            `}
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                            Regenerate
                        </button>
                    )}
                </div>
            </div>
        </div>

        <div className="p-5">{children}</div>
    </div>
);

// ===== POST TEXT BLOCK =====

const PostTextBlock: React.FC<{
    isDark: boolean;
    content: string;
    platform: Platform;
    onChange: (content: string) => void;
    onRegenerate: () => void;
    onQuickEdit: (instruction: string) => void;
    isRegenerating: boolean;
    isEditing: boolean;
}> = ({ isDark, content, platform, onChange, onRegenerate, onQuickEdit, isRegenerating, isEditing }) => {
    const [copied, setCopied] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const charLimit = PLATFORMS.find(p => p.id === platform)?.charLimit || 280;
    const charCount = content.length;
    const isOverLimit = charCount > charLimit;
    const percentage = Math.min((charCount / charLimit) * 100, 100);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const quickActions = [
        { label: '✂️ Shorter', instruction: 'Make it shorter and more concise' },
        { label: '🔥 Bolder', instruction: 'Make it more bold and attention-grabbing' },
        { label: '😊 Emoji', instruction: 'Add relevant emojis' },
        { label: '👆 Add CTA', instruction: 'Add a clear call-to-action' },
    ];

    return (
        <OutputCard
            isDark={isDark}
            title="Post Copy"
            icon={MessageCircle}
            iconColor="#10b981"
            onRegenerate={onRegenerate}
            isRegenerating={isRegenerating}
            headerActions={
                <>
                    <button
                        onClick={() => setEditMode(!editMode)}
                        className={`
                            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                            ${editMode
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : isDark ? 'bg-white/5 text-white/60 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                        `}
                    >
                        <Edit3 className="w-3.5 h-3.5" />
                        {editMode ? 'Done' : 'Edit'}
                    </button>
                    <button
                        onClick={handleCopy}
                        className={`
                            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                            ${copied
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : isDark ? 'bg-white/5 text-white/60 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                        `}
                    >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </>
            }
        >
            {/* Text area */}
            {editMode ? (
                <textarea
                    value={content}
                    onChange={(e) => onChange(e.target.value)}
                    rows={6}
                    className={`
                        w-full p-4 rounded-xl text-sm leading-relaxed resize-none
                        transition-all outline-none
                        ${isDark
                            ? 'bg-white/[0.03] border-emerald-500/30 text-white'
                            : 'bg-emerald-50/50 border-emerald-200 text-gray-900'}
                        border-2
                    `}
                />
            ) : (
                <div
                    className={`
                        p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap min-h-[120px]
                        ${isDark ? 'bg-white/[0.02] text-white/90' : 'bg-gray-50 text-gray-800'}
                    `}
                >
                    {content || 'Your post will appear here...'}
                </div>
            )}

            {/* Character progress */}
            <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex flex-wrap gap-2">
                        {quickActions.map((action, i) => (
                            <button
                                key={i}
                                onClick={() => onQuickEdit(action.instruction)}
                                disabled={isEditing}
                                className={`
                                    px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                                    ${isDark
                                        ? 'bg-white/[0.03] text-white/50 hover:bg-emerald-500/15 hover:text-emerald-400 border border-white/5'
                                        : 'bg-gray-50 text-gray-500 hover:bg-emerald-50 hover:text-emerald-600 border border-gray-100'}
                                `}
                            >
                                {action.label}
                            </button>
                        ))}
                        {isEditing && <Loader2 className="w-4 h-4 animate-spin text-emerald-400 ml-2" />}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/5">
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
                    <span className={`text-xs font-medium ${isOverLimit ? 'text-red-400' : isDark ? 'text-white/40' : 'text-gray-400'}`}>
                        {charCount.toLocaleString()} / {charLimit.toLocaleString()}
                    </span>
                </div>
            </div>
        </OutputCard>
    );
};

// ===== IMAGE BLOCK =====

const ImageBlock: React.FC<{
    isDark: boolean;
    imageUrl: string | null;
    imagePrompt: string;
    onPromptChange: (prompt: string) => void;
    onRegenerate: () => void;
    isRegenerating: boolean;
}> = ({ isDark, imageUrl, imagePrompt, onPromptChange, onRegenerate, isRegenerating }) => {
    const [editPrompt, setEditPrompt] = useState(false);

    return (
        <OutputCard
            isDark={isDark}
            title="Visual Content"
            icon={ImageIcon}
            iconColor="#8b5cf6"
            onRegenerate={onRegenerate}
            isRegenerating={isRegenerating}
            headerActions={
                <button
                    onClick={() => setEditPrompt(!editPrompt)}
                    className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                        ${editPrompt
                            ? 'bg-purple-500/20 text-purple-400'
                            : isDark ? 'bg-white/5 text-white/60 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                    `}
                >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit Prompt
                </button>
            }
        >
            <div className="grid md:grid-cols-2 gap-5">
                {/* Image Preview */}
                <div
                    className="aspect-square rounded-xl overflow-hidden flex items-center justify-center"
                    style={{
                        background: isDark
                            ? 'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(139,92,246,0.05))'
                            : 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(139,92,246,0.02))',
                        border: isDark ? '1px solid rgba(139,92,246,0.2)' : '1px solid rgba(139,92,246,0.1)',
                        boxShadow: '0 10px 40px rgba(139,92,246,0.1)'
                    }}
                >
                    {isRegenerating ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                                <div className="w-14 h-14 rounded-full border-4 border-purple-500/30 border-t-purple-500 animate-spin" />
                                <Sparkles className="absolute inset-0 m-auto w-5 h-5 text-purple-400" />
                            </div>
                            <span className={`text-sm ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Generating...</span>
                        </div>
                    ) : imageUrl ? (
                        <img src={imageUrl} alt="Generated" className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex flex-col items-center gap-3 p-6 text-center">
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                                style={{ background: 'rgba(139,92,246,0.15)' }}
                            >
                                <ImageIcon className="w-8 h-8 text-purple-400/50" />
                            </div>
                            <p className={`text-sm ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                                Image will appear here
                            </p>
                        </div>
                    )}
                </div>

                {/* Prompt */}
                <div className="flex flex-col gap-3">
                    <label className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                        Image Prompt
                    </label>
                    {editPrompt ? (
                        <textarea
                            value={imagePrompt}
                            onChange={(e) => onPromptChange(e.target.value)}
                            rows={5}
                            className={`
                                flex-1 p-4 rounded-xl text-sm resize-none border-2 outline-none
                                ${isDark
                                    ? 'bg-white/[0.03] border-purple-500/30 text-white'
                                    : 'bg-purple-50/50 border-purple-200 text-gray-900'}
                            `}
                        />
                    ) : (
                        <div className={`flex-1 p-4 rounded-xl text-sm ${isDark ? 'bg-white/[0.02] text-white/60' : 'bg-gray-50 text-gray-600'}`}>
                            {imagePrompt || 'Prompt will appear here...'}
                        </div>
                    )}
                    <p className={`text-xs ${isDark ? 'text-white/25' : 'text-gray-400'}`}>
                        ✨ Edit the prompt and regenerate for different results
                    </p>
                </div>
            </div>
        </OutputCard>
    );
};

// ===== HOOKS BLOCK =====

const HooksBlock: React.FC<{
    isDark: boolean;
    hooks: string[];
    onSelectHook: (hook: string) => void;
    onRegenerate: () => void;
    isRegenerating: boolean;
}> = ({ isDark, hooks, onSelectHook, onRegenerate, isRegenerating }) => (
    <OutputCard
        isDark={isDark}
        title="Hook Variations"
        icon={Zap}
        iconColor="#f59e0b"
        onRegenerate={onRegenerate}
        isRegenerating={isRegenerating}
    >
        <div className="space-y-2">
            {hooks.map((hook, i) => (
                <button
                    key={i}
                    onClick={() => onSelectHook(hook)}
                    className={`
                        w-full text-left p-4 rounded-xl text-sm transition-all group
                        ${isDark
                            ? 'bg-white/[0.02] hover:bg-amber-500/10 text-white/70 hover:text-amber-300 border border-white/5 hover:border-amber-500/30'
                            : 'bg-gray-50 hover:bg-amber-50 text-gray-700 hover:text-amber-700 border border-gray-100 hover:border-amber-200'}
                    `}
                >
                    <span className="text-amber-500 mr-2 group-hover:animate-pulse">→</span>
                    {hook}
                </button>
            ))}
        </div>
        <p className={`text-xs mt-4 ${isDark ? 'text-white/25' : 'text-gray-400'}`}>
            💡 Click a hook to use it as your opening line
        </p>
    </OutputCard>
);

// ===== HASHTAGS BLOCK =====

const HashtagsBlock: React.FC<{
    isDark: boolean;
    hashtags: string[];
    onRegenerate: () => void;
    isRegenerating: boolean;
}> = ({ isDark, hashtags, onRegenerate, isRegenerating }) => {
    const [copied, setCopied] = useState(false);

    const handleCopyAll = async () => {
        await navigator.clipboard.writeText(hashtags.map(t => '#' + t).join(' '));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <OutputCard
            isDark={isDark}
            title="Hashtags"
            icon={Hash}
            iconColor="#3b82f6"
            onRegenerate={onRegenerate}
            isRegenerating={isRegenerating}
            headerActions={
                <button
                    onClick={handleCopyAll}
                    className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                        ${copied
                            ? 'bg-blue-500/20 text-blue-400'
                            : isDark ? 'bg-white/5 text-white/60 hover:bg-white/10' : 'bg-gray-100 text-gray-600'}
                    `}
                >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy All'}
                </button>
            }
        >
            <div className="flex flex-wrap gap-2">
                {hashtags.map((tag, i) => (
                    <span
                        key={i}
                        className={`
                            px-4 py-2 rounded-full text-sm font-medium cursor-pointer
                            transition-all hover:scale-105
                            ${isDark ? 'bg-blue-500/15 text-blue-400 hover:bg-blue-500/25' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}
                        `}
                        style={{ boxShadow: '0 2px 10px rgba(59,130,246,0.1)' }}
                        onClick={() => navigator.clipboard.writeText('#' + tag)}
                    >
                        #{tag}
                    </span>
                ))}
            </div>
        </OutputCard>
    );
};

// ===== QUICK EDIT BAR =====

const QuickEditBar: React.FC<{
    isDark: boolean;
    onEdit: (instruction: string) => void;
    isProcessing: boolean;
}> = ({ isDark, onEdit, isProcessing }) => {
    const [input, setInput] = useState('');

    const handleSubmit = () => {
        if (input.trim() && !isProcessing) {
            onEdit(input.trim());
            setInput('');
        }
    };

    return (
        <div
            className={`rounded-2xl p-5 ${isDark ? 'glass-card animate-border-glow' : 'glass-card-light'}`}
            style={{
                boxShadow: isDark
                    ? '0 20px 50px rgba(0,0,0,0.3), 0 0 40px rgba(16,185,129,0.05)'
                    : '0 20px 50px rgba(0,0,0,0.08)'
            }}
        >
            <div className="flex items-center gap-3 mb-4">
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center animate-float"
                    style={{
                        background: 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(16,185,129,0.15))',
                        boxShadow: '0 4px 15px rgba(16,185,129,0.2)'
                    }}
                >
                    <Wand2 className="w-4.5 h-4.5 text-emerald-400" />
                </div>
                <div>
                    <h4 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Quick Edit</h4>
                    <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Refine with AI</p>
                </div>
            </div>

            <div className="flex gap-3">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="e.g., 'Make it more personal' or 'Add statistics'"
                    className={`
                        flex-1 px-4 py-3 rounded-xl text-sm border-2 outline-none transition-all
                        ${isDark
                            ? 'bg-white/[0.03] border-white/10 text-white placeholder-white/30 focus:border-emerald-500/50'
                            : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-emerald-300'}
                    `}
                />
                <button
                    onClick={handleSubmit}
                    disabled={!input.trim() || isProcessing}
                    className={`
                        px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all
                        ${input.trim() && !isProcessing
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:scale-105'
                            : isDark ? 'bg-white/5 text-white/20' : 'bg-gray-100 text-gray-300'}
                    `}
                    style={{
                        boxShadow: input.trim() && !isProcessing ? '0 8px 25px rgba(16,185,129,0.3)' : 'none'
                    }}
                >
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Apply
                </button>
            </div>
        </div>
    );
};

// ===== MAIN COMPONENT =====

export const SocialKroniq: React.FC<SocialKroniqProps> = ({ onBack }) => {
    const { currentTheme } = useTheme();
    const isDark = currentTheme === 'cosmic-dark';

    // State
    const [platform, setPlatform] = useState<Platform>('linkedin');
    const [tone, setTone] = useState<Tone>('professional');
    const [intent, setIntent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isRegeneratingText, setIsRegeneratingText] = useState(false);
    const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);
    const [isRegeneratingHooks, setIsRegeneratingHooks] = useState(false);
    const [isRegeneratingHashtags, setIsRegeneratingHashtags] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [content, setContent] = useState<GeneratedContent | null>(null);
    const [projectName, setProjectName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Generate all content
    const generateAllContent = useCallback(async () => {
        if (!intent.trim()) return;
        setIsGenerating(true);

        try {
            const { generateContent } = await import('../../lib/social/SocialContentService');
            const textResult = await generateContent({
                intent: intent.trim(),
                platform,
                tone,
                audience: 'founders'
            });

            // Generate image
            let imageUrl: string | null = null;
            if (isPixazoConfigured()) {
                try {
                    imageUrl = await generatePixazoImage(textResult.imagePrompt, 1024, 1024);
                } catch (imgError) {
                    console.error('Image generation failed:', imgError);
                }
            }

            setContent({
                postText: textResult.copy,
                imageUrl,
                imagePrompt: textResult.imagePrompt,
                hooks: textResult.hooks,
                hashtags: textResult.hashtags,
                cta: 'Learn more in the comments!'
            });

            setProjectName(intent.trim().split(' ').slice(0, 4).join(' ') + '...');
        } catch (error) {
            console.error('Generation error:', error);
            setContent({
                postText: `${intent}\n\nWhat do you think? Let me know in the comments! 👇`,
                imageUrl: null,
                imagePrompt: `Professional ${platform} visual about: ${intent}`,
                hooks: ["Here's something I've been thinking about...", "I learned this the hard way...", "Stop scrolling. This is important..."],
                hashtags: ['business', 'startup', 'growth', 'entrepreneur'],
                cta: 'Share your thoughts below!'
            });
        } finally {
            setIsGenerating(false);
        }
    }, [intent, platform, tone]);

    const regenerateText = useCallback(async () => {
        if (!content) return;
        setIsRegeneratingText(true);
        try {
            const { regenerateCopy } = await import('../../lib/social/SocialContentService');
            const newText = await regenerateCopy(content.postText, platform, tone);
            setContent(prev => prev ? { ...prev, postText: newText } : null);
        } catch (error) { console.error(error); }
        finally { setIsRegeneratingText(false); }
    }, [content, platform, tone]);

    const regenerateImage = useCallback(async () => {
        if (!content) return;
        setIsRegeneratingImage(true);
        try {
            if (isPixazoConfigured()) {
                const imageUrl = await generatePixazoImage(content.imagePrompt, 1024, 1024);
                setContent(prev => prev ? { ...prev, imageUrl } : null);
            }
        } catch (error) { console.error(error); }
        finally { setIsRegeneratingImage(false); }
    }, [content]);

    const regenerateHooks = useCallback(async () => {
        if (!content) return;
        setIsRegeneratingHooks(true);
        try {
            const { generateContent } = await import('../../lib/social/SocialContentService');
            const result = await generateContent({ intent, platform, tone, audience: 'founders' });
            setContent(prev => prev ? { ...prev, hooks: result.hooks } : null);
        } catch (error) { console.error(error); }
        finally { setIsRegeneratingHooks(false); }
    }, [content, intent, platform, tone]);

    const regenerateHashtags = useCallback(async () => {
        if (!content) return;
        setIsRegeneratingHashtags(true);
        try {
            const { generateContent } = await import('../../lib/social/SocialContentService');
            const result = await generateContent({ intent, platform, tone, audience: 'founders' });
            setContent(prev => prev ? { ...prev, hashtags: result.hashtags } : null);
        } catch (error) { console.error(error); }
        finally { setIsRegeneratingHashtags(false); }
    }, [content, intent, platform, tone]);

    const handleQuickEdit = useCallback(async (instruction: string) => {
        if (!content) return;
        setIsEditing(true);
        try {
            const { editContent } = await import('../../lib/social/SocialContentService');
            const editedText = await editContent({ currentContent: content.postText, instruction, platform });
            setContent(prev => prev ? { ...prev, postText: editedText } : null);
        } catch (error) { console.error(error); }
        finally { setIsEditing(false); }
    }, [content, platform]);

    const handleSelectHook = useCallback((hook: string) => {
        if (!content) return;
        setContent(prev => prev ? { ...prev, postText: hook + '\n\n' + prev.postText } : null);
    }, [content]);

    const handleSaveProject = useCallback(async () => {
        if (!content || !projectName.trim()) return;
        setIsSaving(true);
        try {
            const { supabase } = await import('../../lib/supabaseClient');
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            await supabase.from('projects').insert({
                user_id: user.id,
                name: projectName.trim(),
                type: 'social',
                session_state: { platform, tone, intent, content }
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) { console.error(error); }
        finally { setIsSaving(false); }
    }, [content, projectName, platform, tone, intent]);

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: premiumStyles }} />

            <div className={`flex-1 flex flex-col min-h-screen overflow-hidden ${isDark ? 'bg-[#0a0a0a]' : 'bg-gradient-to-br from-gray-50 to-white'}`}>
                {/* Background orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div
                        className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-15 animate-float"
                        style={{ background: 'radial-gradient(circle, #10b981, transparent)' }}
                    />
                    <div
                        className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px] opacity-10"
                        style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)', animationDelay: '2s' }}
                    />
                </div>

                {/* Header */}
                <header
                    className={`relative z-10 px-6 py-4 border-b backdrop-blur-xl`}
                    style={{
                        borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                        background: isDark ? 'rgba(10,10,10,0.8)' : 'rgba(255,255,255,0.8)'
                    }}
                >
                    <div className="max-w-5xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {onBack && (
                                <button onClick={onBack} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/5 text-white/40' : 'hover:bg-gray-100 text-gray-400'}`}>
                                    <ArrowLeft className="w-5 h-5" />
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
                                    <Share2 className="w-5 h-5 text-white" />
                                </div>
                                <h1 className={`font-bold text-xl ${isDark ? 'text-white' : 'text-gray-900'}`}>Social KroniQ</h1>
                            </div>
                        </div>

                        {content && (
                            <div className="flex items-center gap-3">
                                <input
                                    type="text"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    placeholder="Project name..."
                                    className={`px-3 py-2 rounded-lg text-sm w-48 border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                />
                                <button
                                    onClick={handleSaveProject}
                                    disabled={isSaving || !projectName.trim()}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${saved ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-500 text-white hover:bg-emerald-400'}`}
                                    style={{ boxShadow: !saved ? '0 4px 15px rgba(16,185,129,0.3)' : 'none' }}
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                                    {saved ? 'Saved!' : 'Save'}
                                </button>
                            </div>
                        )}
                    </div>
                </header>

                {/* Main */}
                <main className="flex-1 overflow-y-auto relative z-10">
                    <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

                        {/* Platform Selection */}
                        <section className="text-center">
                            <h2 className={`text-xs font-semibold uppercase tracking-widest mb-6 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                                Choose Platform
                            </h2>
                            <div className="flex justify-center gap-4">
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

                        {/* Input Card */}
                        <div
                            className={`rounded-2xl p-6 ${isDark ? 'glass-card' : 'glass-card-light'}`}
                            style={{ boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.3)' : '0 20px 50px rgba(0,0,0,0.08)' }}
                        >
                            <div className="mb-5">
                                <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-white/50' : 'text-gray-600'}`}>Tone</label>
                                <ToneSelector isDark={isDark} selected={tone} onSelect={setTone} />
                            </div>

                            <div className="mb-5">
                                <label className={`block text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>What do you want to post about?</label>
                                <textarea
                                    value={intent}
                                    onChange={(e) => setIntent(e.target.value)}
                                    rows={3}
                                    placeholder="e.g., Announcing our Series A, sharing startup lessons, or promoting a new feature..."
                                    className={`w-full p-4 rounded-xl text-sm leading-relaxed resize-none border-2 outline-none transition-all ${isDark ? 'bg-white/[0.03] border-white/10 text-white placeholder-white/30 focus:border-emerald-500/50' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-emerald-300'}`}
                                />
                            </div>

                            <button
                                onClick={generateAllContent}
                                disabled={!intent.trim() || isGenerating}
                                className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${intent.trim() && !isGenerating ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 text-white hover:scale-[1.02] animate-gradient' : isDark ? 'bg-white/5 text-white/20' : 'bg-gray-100 text-gray-300'}`}
                                style={{ boxShadow: intent.trim() && !isGenerating ? '0 10px 40px rgba(16,185,129,0.3)' : 'none' }}
                            >
                                {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</> : <><Sparkles className="w-5 h-5" /> Generate All Content</>}
                            </button>
                        </div>

                        {/* Output */}
                        {content && (
                            <div className="space-y-6">
                                <PostTextBlock isDark={isDark} content={content.postText} platform={platform} onChange={(t) => setContent(prev => prev ? { ...prev, postText: t } : null)} onRegenerate={regenerateText} onQuickEdit={handleQuickEdit} isRegenerating={isRegeneratingText} isEditing={isEditing} />
                                <ImageBlock isDark={isDark} imageUrl={content.imageUrl} imagePrompt={content.imagePrompt} onPromptChange={(p) => setContent(prev => prev ? { ...prev, imagePrompt: p } : null)} onRegenerate={regenerateImage} isRegenerating={isRegeneratingImage} />
                                <div className="grid md:grid-cols-2 gap-6">
                                    <HooksBlock isDark={isDark} hooks={content.hooks} onSelectHook={handleSelectHook} onRegenerate={regenerateHooks} isRegenerating={isRegeneratingHooks} />
                                    <HashtagsBlock isDark={isDark} hashtags={content.hashtags} onRegenerate={regenerateHashtags} isRegenerating={isRegeneratingHashtags} />
                                </div>
                                <QuickEditBar isDark={isDark} onEdit={handleQuickEdit} isProcessing={isEditing} />
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
};

export default SocialKroniq;
