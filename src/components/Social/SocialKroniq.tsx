/**
 * SocialKroniq.tsx - Social Content Generation Workspace
 * Fast, simple content generation for social media posts
 * Generation only - no integrations, no posting
 */

import React, { useState, useCallback } from 'react';
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
    Wand2
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

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

const PLATFORMS: { id: Platform; name: string; icon: React.ElementType; color: string; charLimit: number }[] = [
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0A66C2', charLimit: 3000 },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E1306C', charLimit: 2200 },
    { id: 'x', name: 'X', icon: Twitter, color: '#1DA1F2', charLimit: 280 },
];

const TONES: { id: Tone; label: string }[] = [
    { id: 'professional', label: 'Professional' },
    { id: 'casual', label: 'Casual' },
    { id: 'bold', label: 'Bold' },
    { id: 'minimal', label: 'Minimal' },
];

const AUDIENCES: { id: Audience; label: string }[] = [
    { id: 'founders', label: 'Founders' },
    { id: 'creators', label: 'Creators' },
    { id: 'general', label: 'General' },
];

// ===== PLATFORM SELECTOR =====

const PlatformSelector: React.FC<{
    isDark: boolean;
    selected: Platform;
    onSelect: (platform: Platform) => void;
}> = ({ isDark, selected, onSelect }) => (
    <div className="flex justify-center gap-3 mb-8">
        {PLATFORMS.map((platform) => {
            const isSelected = selected === platform.id;
            const Icon = platform.icon;
            return (
                <button
                    key={platform.id}
                    onClick={() => onSelect(platform.id)}
                    className={`
                        flex items-center gap-2 px-6 py-3 rounded-2xl font-medium text-sm
                        transition-all duration-300 border
                        ${isSelected
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg'
                            : (isDark
                                ? 'bg-white/5 border-white/10 text-white/60 hover:border-emerald-500/50 hover:text-white'
                                : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-emerald-300')
                        }
                    `}
                    style={{
                        boxShadow: isSelected ? `0 0 30px ${platform.color}40` : 'none'
                    }}
                >
                    <Icon className="w-5 h-5" />
                    {platform.name}
                </button>
            );
        })}
    </div>
);

// ===== DROPDOWN =====

const Dropdown: React.FC<{
    isDark: boolean;
    label: string;
    value: string;
    options: { id: string; label: string }[];
    onChange: (value: string) => void;
}> = ({ isDark, label, value, options, onChange }) => (
    <div className="relative">
        <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
            {label}
        </label>
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`
                    w-full px-4 py-2.5 pr-10 rounded-xl text-sm font-medium appearance-none cursor-pointer
                    border outline-none transition-all
                    ${isDark
                        ? 'bg-white/5 border-white/10 text-white'
                        : 'bg-gray-50 border-gray-200 text-gray-900'
                    }
                `}
            >
                {options.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
            </select>
            <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
        </div>
    </div>
);

// ===== OUTPUT BLOCK =====

const OutputBlock: React.FC<{
    isDark: boolean;
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    onRegenerate?: () => void;
    isRegenerating?: boolean;
    actions?: React.ReactNode;
}> = ({ isDark, title, icon: Icon, children, onRegenerate, isRegenerating, actions }) => (
    <div className={`
        p-5 rounded-2xl border transition-all
        ${isDark ? 'bg-[#0d0d0d] border-emerald-500/10' : 'bg-white border-gray-100'}
    `}>
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? 'bg-emerald-500/15' : 'bg-emerald-50'}`}>
                    <Icon className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                </div>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
            </div>
            <div className="flex items-center gap-2">
                {actions}
                {onRegenerate && (
                    <button
                        onClick={onRegenerate}
                        disabled={isRegenerating}
                        className={`
                            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                            transition-all
                            ${isDark
                                ? 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }
                        `}
                    >
                        <RefreshCw className={`w-3 h-3 ${isRegenerating ? 'animate-spin' : ''}`} />
                        Regenerate
                    </button>
                )}
            </div>
        </div>
        {children}
    </div>
);

// ===== POST COPY BLOCK =====

const PostCopyBlock: React.FC<{
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

    const handleCopy = async () => {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <OutputBlock
            isDark={isDark}
            title="Post Copy"
            icon={Zap}
            onRegenerate={onRegenerate}
            isRegenerating={isRegenerating}
            actions={
                <button
                    onClick={handleCopy}
                    className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                        transition-all
                        ${copied
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : (isDark ? 'bg-white/5 text-white/60 hover:bg-white/10' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
                        }
                    `}
                >
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy'}
                </button>
            }
        >
            <textarea
                value={content}
                onChange={(e) => onChange(e.target.value)}
                rows={6}
                className={`
                    w-full p-4 rounded-xl text-sm leading-relaxed resize-none border outline-none
                    ${isDark
                        ? 'bg-white/[0.02] border-white/5 text-white placeholder-white/30'
                        : 'bg-gray-50 border-gray-100 text-gray-900'
                    }
                `}
                placeholder="Your generated post will appear here..."
            />
            <div className={`flex justify-end mt-2 text-xs ${isOverLimit ? 'text-red-400' : (isDark ? 'text-white/30' : 'text-gray-400')}`}>
                {charCount.toLocaleString()} / {charLimit.toLocaleString()} characters
            </div>
        </OutputBlock>
    );
};

// ===== VISUAL BLOCK =====

const VisualBlock: React.FC<{
    isDark: boolean;
    imageUrl?: string;
    imagePrompt: string;
    onPromptChange: (prompt: string) => void;
    onRegenerate: () => void;
    isRegenerating: boolean;
}> = ({ isDark, imageUrl, imagePrompt, onPromptChange, onRegenerate, isRegenerating }) => (
    <OutputBlock
        isDark={isDark}
        title="Visual"
        icon={ImageIcon}
        onRegenerate={onRegenerate}
        isRegenerating={isRegenerating}
    >
        <div className="grid md:grid-cols-2 gap-4">
            {/* Image Preview */}
            <div className={`
                aspect-square rounded-xl flex items-center justify-center overflow-hidden
                ${isDark ? 'bg-white/[0.02] border border-white/5' : 'bg-gray-50 border border-gray-100'}
            `}>
                {isRegenerating ? (
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className={`w-8 h-8 animate-spin ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Generating...</span>
                    </div>
                ) : imageUrl ? (
                    <img src={imageUrl} alt="Generated visual" className="w-full h-full object-cover" />
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <ImageIcon className={`w-12 h-12 ${isDark ? 'text-white/20' : 'text-gray-300'}`} />
                        <span className={`text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                            Image will appear here
                        </span>
                    </div>
                )}
            </div>

            {/* Prompt Editor */}
            <div>
                <label className={`block text-xs font-medium mb-2 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                    Image Prompt
                </label>
                <textarea
                    value={imagePrompt}
                    onChange={(e) => onPromptChange(e.target.value)}
                    rows={5}
                    className={`
                        w-full p-4 rounded-xl text-sm leading-relaxed resize-none border outline-none
                        ${isDark
                            ? 'bg-white/[0.02] border-white/5 text-white placeholder-white/30'
                            : 'bg-gray-50 border-gray-100 text-gray-900'
                        }
                    `}
                    placeholder="Describe the visual you want..."
                />
            </div>
        </div>
    </OutputBlock>
);

// ===== ENHANCEMENTS BLOCK =====

const EnhancementsBlock: React.FC<{
    isDark: boolean;
    hooks: string[];
    hashtags: string[];
}> = ({ isDark, hooks, hashtags }) => (
    <div className="grid md:grid-cols-2 gap-4">
        {/* Hooks */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0d0d0d] border-emerald-500/10' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center gap-2 mb-3">
                <Wand2 className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Hook Variations</span>
            </div>
            <div className="space-y-2">
                {hooks.length > 0 ? hooks.map((hook, i) => (
                    <div
                        key={i}
                        className={`p-3 rounded-lg text-sm cursor-pointer transition-all ${isDark ? 'bg-white/[0.02] hover:bg-white/5 text-white/80' : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                            }`}
                    >
                        {hook}
                    </div>
                )) : (
                    <p className={`text-sm ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                        Hooks will appear here
                    </p>
                )}
            </div>
        </div>

        {/* Hashtags */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-[#0d0d0d] border-emerald-500/10' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center gap-2 mb-3">
                <Hash className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Hashtags</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {hashtags.length > 0 ? hashtags.map((tag, i) => (
                    <span
                        key={i}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${isDark ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                    >
                        #{tag}
                    </span>
                )) : (
                    <p className={`text-sm ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                        Hashtags will appear here
                    </p>
                )}
            </div>
        </div>
    </div>
);

// ===== QUICK EDIT =====

const QuickEdit: React.FC<{
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

    const suggestions = ['Make it shorter', 'More bold', 'Add emoji', 'More professional'];

    return (
        <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#0a0a0a] border-emerald-500/10' : 'bg-gray-50 border-gray-100'}`}>
            <div className="flex items-center gap-2 mb-3">
                <Sparkles className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Quick Edit</span>
            </div>

            {/* Suggestions */}
            <div className="flex flex-wrap gap-2 mb-3">
                {suggestions.map((s, i) => (
                    <button
                        key={i}
                        onClick={() => setInput(s)}
                        className={`px-3 py-1 rounded-full text-xs transition-all ${isDark ? 'bg-white/5 text-white/60 hover:bg-white/10' : 'bg-white text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* Input */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="Or type your edit instruction..."
                    className={`
                        flex-1 px-4 py-3 rounded-xl text-sm border outline-none
                        ${isDark
                            ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                            : 'bg-white border-gray-200 text-gray-900'
                        }
                    `}
                />
                <button
                    onClick={handleSubmit}
                    disabled={!input.trim() || isProcessing}
                    className={`
                        px-4 py-3 rounded-xl font-medium text-sm flex items-center gap-2
                        transition-all
                        ${input.trim() && !isProcessing
                            ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                            : (isDark ? 'bg-white/5 text-white/20' : 'bg-gray-100 text-gray-300')
                        }
                    `}
                >
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
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
            // Import AI service
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
            // Fallback content
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
        // Would call image generation API here
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
        <div className={`flex-1 flex flex-col min-h-screen ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
            {/* Header */}
            <div className={`px-6 py-4 border-b ${isDark ? 'border-emerald-500/10' : 'border-gray-100'}`}>
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className={`flex items-center gap-2 text-sm font-medium ${isDark ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                    )}
                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500/30 to-emerald-600/20`}
                            style={{ boxShadow: isDark ? '0 0 15px rgba(16, 185, 129, 0.2)' : 'none' }}>
                            <Sparkles className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        </div>
                        <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Social KroniQ
                        </span>
                    </div>
                    <div className="w-20" /> {/* Spacer */}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto py-8 px-6">
                <div className="max-w-4xl mx-auto space-y-6">

                    {/* Platform Selector */}
                    <PlatformSelector
                        isDark={isDark}
                        selected={platform}
                        onSelect={setPlatform}
                    />

                    {/* Intent Input */}
                    <div className={`
                        p-6 rounded-3xl border
                        ${isDark
                            ? 'bg-gradient-to-b from-emerald-500/5 to-[#0d0d0d] border-emerald-500/20'
                            : 'bg-gradient-to-b from-emerald-50 to-white border-emerald-200'
                        }
                    `}
                        style={{ boxShadow: isDark ? '0 0 40px rgba(16, 185, 129, 0.1)' : '0 10px 40px rgba(16, 185, 129, 0.05)' }}
                    >
                        <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            What do you want to post about?
                        </label>
                        <textarea
                            value={intent}
                            onChange={(e) => setIntent(e.target.value)}
                            rows={3}
                            placeholder="e.g., Announcing my startup update, Educational post about AI for founders..."
                            className={`
                                w-full p-4 rounded-xl text-sm leading-relaxed resize-none border outline-none mb-4
                                ${isDark
                                    ? 'bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-emerald-500/50'
                                    : 'bg-white border-gray-200 text-gray-900 focus:border-emerald-300'
                                }
                            `}
                        />

                        {/* Options */}
                        <div className="grid grid-cols-2 gap-4 mb-5">
                            <Dropdown
                                isDark={isDark}
                                label="Tone"
                                value={tone}
                                options={TONES}
                                onChange={(v) => setTone(v as Tone)}
                            />
                            <Dropdown
                                isDark={isDark}
                                label="Audience"
                                value={audience}
                                options={AUDIENCES}
                                onChange={(v) => setAudience(v as Audience)}
                            />
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerate}
                            disabled={!intent.trim() || isGenerating}
                            className={`
                                w-full py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2
                                transition-all
                                ${intent.trim() && !isGenerating
                                    ? 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg'
                                    : (isDark ? 'bg-white/5 text-white/20' : 'bg-gray-100 text-gray-300')
                                }
                            `}
                            style={{ boxShadow: intent.trim() && !isGenerating && isDark ? '0 0 30px rgba(16, 185, 129, 0.3)' : 'none' }}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Generate Content
                                </>
                            )}
                        </button>
                    </div>

                    {/* Output Section */}
                    {content && (
                        <div className="space-y-4">
                            {/* Post Copy */}
                            <PostCopyBlock
                                isDark={isDark}
                                content={content.copy}
                                platform={platform}
                                onChange={(newCopy) => setContent(prev => prev ? { ...prev, copy: newCopy } : null)}
                                onRegenerate={handleRegenerateCopy}
                                isRegenerating={isRegeneratingCopy}
                            />

                            {/* Visual */}
                            <VisualBlock
                                isDark={isDark}
                                imageUrl={content.imageUrl}
                                imagePrompt={content.imagePrompt}
                                onPromptChange={(prompt) => setContent(prev => prev ? { ...prev, imagePrompt: prompt } : null)}
                                onRegenerate={handleRegenerateImage}
                                isRegenerating={isRegeneratingImage}
                            />

                            {/* Enhancements */}
                            <EnhancementsBlock
                                isDark={isDark}
                                hooks={content.hooks}
                                hashtags={content.hashtags}
                            />

                            {/* Quick Edit */}
                            <QuickEdit
                                isDark={isDark}
                                onEdit={handleQuickEdit}
                                isProcessing={isEditing}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SocialKroniq;
