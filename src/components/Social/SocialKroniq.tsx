/**
 * SocialKroniq.tsx - v2 Complete Rebuild
 * ChatGPT-style simplicity with FULL features
 * 
 * Features:
 * - One prompt → multiple outputs (text, image, hooks, hashtags)
 * - Separate editing per output block
 * - Project saving to sidebar
 * - Clean, minimal design
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
    MoreHorizontal,
    MessageCircle,
    Zap,
    Target,
    Share2,
    Download,
    Layers,
    Clock,
    CheckCircle
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { generatePixazoImage, isPixazoConfigured } from '../../lib/pixazoService';

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

interface SocialProject {
    id: string;
    name: string;
    platform: Platform;
    tone: Tone;
    intent: string;
    content: GeneratedContent;
    createdAt: Date;
    updatedAt: Date;
}

interface SocialKroniqProps {
    onBack?: () => void;
}

// ===== PLATFORM CONFIG =====

const PLATFORMS: { id: Platform; name: string; icon: React.ElementType; color: string; charLimit: number }[] = [
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0A66C2', charLimit: 3000 },
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E1306C', charLimit: 2200 },
    { id: 'x', name: 'X (Twitter)', icon: Twitter, color: '#000000', charLimit: 280 },
];

const TONES: { id: Tone; label: string }[] = [
    { id: 'professional', label: 'Professional' },
    { id: 'casual', label: 'Casual' },
    { id: 'bold', label: 'Bold' },
    { id: 'minimal', label: 'Minimal' },
];

// ===== HELPER COMPONENTS =====

// Simple dropdown
const Dropdown: React.FC<{
    isDark: boolean;
    value: string;
    options: { id: string; label: string; icon?: React.ElementType }[];
    onChange: (value: string) => void;
    className?: string;
}> = ({ isDark, value, options, onChange, className = '' }) => {
    const selected = options.find(o => o.id === value);
    const Icon = selected?.icon;

    return (
        <div className={`relative ${className}`}>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`
                    appearance-none w-full px-4 py-2.5 pr-10 rounded-xl text-sm font-medium
                    cursor-pointer transition-all border outline-none
                    ${isDark
                        ? 'bg-white/5 border-white/10 text-white hover:border-white/20'
                        : 'bg-gray-50 border-gray-200 text-gray-900 hover:border-gray-300'}
                `}
            >
                {options.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
            </select>
            <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
        </div>
    );
};

// Action button
const ActionButton: React.FC<{
    onClick: () => void;
    icon: React.ElementType;
    label: string;
    isDark: boolean;
    loading?: boolean;
    variant?: 'default' | 'success' | 'primary';
    size?: 'sm' | 'md';
}> = ({ onClick, icon: Icon, label, isDark, loading, variant = 'default', size = 'sm' }) => {
    const baseClasses = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm';

    const variantClasses = {
        default: isDark
            ? 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border-white/10'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200',
        success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        primary: 'bg-emerald-500 text-white hover:bg-emerald-400 border-emerald-500'
    };

    return (
        <button
            onClick={onClick}
            disabled={loading}
            className={`
                flex items-center gap-1.5 rounded-lg font-medium
                transition-all duration-200 border
                ${baseClasses}
                ${variantClasses[variant]}
            `}
        >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Icon className="w-3.5 h-3.5" />}
            {label}
        </button>
    );
};

// ===== OUTPUT BLOCK COMPONENT =====

const OutputBlock: React.FC<{
    isDark: boolean;
    title: string;
    icon: React.ElementType;
    iconColor?: string;
    children: React.ReactNode;
    onRegenerate?: () => void;
    isRegenerating?: boolean;
    actions?: React.ReactNode;
}> = ({ isDark, title, icon: Icon, iconColor = '#10b981', children, onRegenerate, isRegenerating, actions }) => (
    <div className={`
        rounded-xl border transition-all
        ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-white border-gray-100'}
    `}>
        {/* Header */}
        <div className={`
            flex items-center justify-between px-4 py-3 border-b
            ${isDark ? 'border-white/5' : 'border-gray-50'}
        `}>
            <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" style={{ color: iconColor }} />
                <span className={`text-sm font-semibold ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                    {title}
                </span>
            </div>
            <div className="flex items-center gap-2">
                {actions}
                {onRegenerate && (
                    <ActionButton
                        onClick={onRegenerate}
                        icon={RefreshCw}
                        label="Regenerate"
                        isDark={isDark}
                        loading={isRegenerating}
                    />
                )}
            </div>
        </div>

        {/* Content */}
        <div className="p-4">
            {children}
        </div>
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
    const [isEditMode, setIsEditMode] = useState(false);
    const charLimit = PLATFORMS.find(p => p.id === platform)?.charLimit || 280;
    const charCount = content.length;
    const isOverLimit = charCount > charLimit;

    const handleCopy = async () => {
        await navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const quickActions = [
        { label: 'Shorter', instruction: 'Make it shorter and more concise' },
        { label: 'Bolder', instruction: 'Make it more bold and attention-grabbing' },
        { label: 'Add Emoji', instruction: 'Add relevant emojis' },
        { label: 'Add CTA', instruction: 'Add a clear call-to-action' },
    ];

    return (
        <OutputBlock
            isDark={isDark}
            title="Post Text"
            icon={MessageCircle}
            iconColor="#10b981"
            onRegenerate={onRegenerate}
            isRegenerating={isRegenerating}
            actions={
                <>
                    <ActionButton
                        onClick={() => setIsEditMode(!isEditMode)}
                        icon={Edit3}
                        label={isEditMode ? 'Done' : 'Edit'}
                        isDark={isDark}
                        variant={isEditMode ? 'success' : 'default'}
                    />
                    <ActionButton
                        onClick={handleCopy}
                        icon={copied ? Check : Copy}
                        label={copied ? 'Copied!' : 'Copy'}
                        isDark={isDark}
                        variant={copied ? 'success' : 'default'}
                    />
                </>
            }
        >
            {/* Text content */}
            {isEditMode ? (
                <textarea
                    value={content}
                    onChange={(e) => onChange(e.target.value)}
                    rows={6}
                    className={`
                        w-full p-4 rounded-lg text-sm leading-relaxed resize-none
                        border outline-none transition-all
                        ${isDark
                            ? 'bg-white/5 border-emerald-500/30 text-white'
                            : 'bg-emerald-50/50 border-emerald-200 text-gray-900'}
                    `}
                />
            ) : (
                <div className={`
                    p-4 rounded-lg text-sm leading-relaxed whitespace-pre-wrap
                    ${isDark ? 'bg-white/[0.02] text-white/90' : 'bg-gray-50 text-gray-800'}
                `}>
                    {content || 'Your post will appear here...'}
                </div>
            )}

            {/* Character count */}
            <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                    {/* Quick action buttons */}
                    {quickActions.map((action, i) => (
                        <button
                            key={i}
                            onClick={() => onQuickEdit(action.instruction)}
                            disabled={isEditing}
                            className={`
                                px-2.5 py-1 rounded-md text-xs font-medium transition-all
                                ${isDark
                                    ? 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'}
                                ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}
                            `}
                        >
                            {action.label}
                        </button>
                    ))}
                    {isEditing && <Loader2 className="w-3 h-3 animate-spin text-emerald-400 ml-2" />}
                </div>

                <span className={`text-xs font-medium ${isOverLimit ? 'text-red-400' : isDark ? 'text-white/40' : 'text-gray-400'
                    }`}>
                    {charCount.toLocaleString()} / {charLimit.toLocaleString()}
                </span>
            </div>
        </OutputBlock>
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
    const [editingPrompt, setEditingPrompt] = useState(false);

    return (
        <OutputBlock
            isDark={isDark}
            title="Image"
            icon={ImageIcon}
            iconColor="#8b5cf6"
            onRegenerate={onRegenerate}
            isRegenerating={isRegenerating}
            actions={
                <ActionButton
                    onClick={() => setEditingPrompt(!editingPrompt)}
                    icon={Edit3}
                    label={editingPrompt ? 'Done' : 'Edit Prompt'}
                    isDark={isDark}
                    variant={editingPrompt ? 'success' : 'default'}
                />
            }
        >
            <div className="grid md:grid-cols-2 gap-4">
                {/* Image preview */}
                <div className={`
                    aspect-square rounded-xl overflow-hidden flex items-center justify-center
                    ${isDark ? 'bg-white/[0.02] border border-white/5' : 'bg-gray-50 border border-gray-100'}
                `}>
                    {isRegenerating ? (
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full border-3 border-purple-500/30 border-t-purple-500 animate-spin" />
                            </div>
                            <span className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                                Generating image...
                            </span>
                        </div>
                    ) : imageUrl ? (
                        <img src={imageUrl} alt="Generated" className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-center p-4">
                            <ImageIcon className={`w-10 h-10 ${isDark ? 'text-white/20' : 'text-gray-300'}`} />
                            <span className={`text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                                Image will appear here
                            </span>
                        </div>
                    )}
                </div>

                {/* Prompt */}
                <div className="flex flex-col gap-2">
                    <label className={`text-xs font-medium ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                        Image Prompt
                    </label>
                    {editingPrompt ? (
                        <textarea
                            value={imagePrompt}
                            onChange={(e) => onPromptChange(e.target.value)}
                            rows={5}
                            className={`
                                flex-1 p-3 rounded-lg text-sm resize-none border outline-none
                                ${isDark
                                    ? 'bg-white/5 border-purple-500/30 text-white'
                                    : 'bg-purple-50/50 border-purple-200 text-gray-900'}
                            `}
                        />
                    ) : (
                        <div className={`
                            flex-1 p-3 rounded-lg text-sm
                            ${isDark ? 'bg-white/[0.02] text-white/70' : 'bg-gray-50 text-gray-600'}
                        `}>
                            {imagePrompt || 'Prompt will appear here...'}
                        </div>
                    )}
                    <p className={`text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                        ✨ Edit the prompt and regenerate for different results
                    </p>
                </div>
            </div>
        </OutputBlock>
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
    <OutputBlock
        isDark={isDark}
        title="Hook Variations"
        icon={Zap}
        iconColor="#f59e0b"
        onRegenerate={onRegenerate}
        isRegenerating={isRegenerating}
    >
        <div className="space-y-2">
            {hooks.length > 0 ? hooks.map((hook, i) => (
                <button
                    key={i}
                    onClick={() => onSelectHook(hook)}
                    className={`
                        w-full text-left p-3 rounded-lg text-sm transition-all
                        ${isDark
                            ? 'bg-white/[0.02] hover:bg-amber-500/10 text-white/80 hover:text-amber-300 border border-white/5 hover:border-amber-500/30'
                            : 'bg-gray-50 hover:bg-amber-50 text-gray-700 hover:text-amber-700 border border-gray-100 hover:border-amber-200'}
                    `}
                >
                    <span className="text-amber-500 mr-2">→</span>
                    {hook}
                </button>
            )) : (
                <p className={`text-sm ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                    Hooks will appear here after generation
                </p>
            )}
        </div>
        <p className={`text-xs mt-3 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
            💡 Click a hook to use it as your opening line
        </p>
    </OutputBlock>
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
        <OutputBlock
            isDark={isDark}
            title="Hashtags"
            icon={Hash}
            iconColor="#3b82f6"
            onRegenerate={onRegenerate}
            isRegenerating={isRegenerating}
            actions={
                <ActionButton
                    onClick={handleCopyAll}
                    icon={copied ? Check : Copy}
                    label={copied ? 'Copied!' : 'Copy All'}
                    isDark={isDark}
                    variant={copied ? 'success' : 'default'}
                />
            }
        >
            <div className="flex flex-wrap gap-2">
                {hashtags.length > 0 ? hashtags.map((tag, i) => (
                    <span
                        key={i}
                        className={`
                            px-3 py-1.5 rounded-full text-sm font-medium
                            ${isDark
                                ? 'bg-blue-500/15 text-blue-400'
                                : 'bg-blue-50 text-blue-600'}
                        `}
                    >
                        #{tag}
                    </span>
                )) : (
                    <p className={`text-sm ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                        Hashtags will appear here
                    </p>
                )}
            </div>
        </OutputBlock>
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
        <div className={`
            flex gap-3 p-4 rounded-xl border
            ${isDark ? 'bg-white/[0.02] border-white/10' : 'bg-gray-50 border-gray-100'}
        `}>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="Quick edit: e.g., 'Make it more personal' or 'Add statistics'"
                className={`
                    flex-1 px-4 py-3 rounded-lg text-sm border outline-none
                    ${isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-emerald-500/50'
                        : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-300'}
                `}
            />
            <button
                onClick={handleSubmit}
                disabled={!input.trim() || isProcessing}
                className={`
                    px-5 py-3 rounded-lg font-medium text-sm flex items-center gap-2 transition-all
                    ${input.trim() && !isProcessing
                        ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                        : isDark ? 'bg-white/5 text-white/20' : 'bg-gray-100 text-gray-300'}
                `}
            >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Apply
            </button>
        </div>
    );
};

// ===== MAIN COMPONENT =====

export const SocialKroniq: React.FC<SocialKroniqProps> = ({ onBack }) => {
    const { currentTheme } = useTheme();
    const isDark = currentTheme === 'cosmic-dark';

    // Input state
    const [platform, setPlatform] = useState<Platform>('linkedin');
    const [tone, setTone] = useState<Tone>('professional');
    const [intent, setIntent] = useState('');

    // Generation state
    const [isGenerating, setIsGenerating] = useState(false);
    const [isRegeneratingText, setIsRegeneratingText] = useState(false);
    const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);
    const [isRegeneratingHooks, setIsRegeneratingHooks] = useState(false);
    const [isRegeneratingHashtags, setIsRegeneratingHashtags] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Content state
    const [content, setContent] = useState<GeneratedContent | null>(null);

    // Project state
    const [projectName, setProjectName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // ===== GENERATION FUNCTIONS =====

    const generateAllContent = useCallback(async () => {
        if (!intent.trim()) return;
        setIsGenerating(true);

        try {
            // Generate text content
            const { generateContent } = await import('../../lib/social/SocialContentService');
            const textResult = await generateContent({
                intent: intent.trim(),
                platform,
                tone,
                audience: 'founders' // Default
            });

            // Generate image (if Pixazo is configured)
            let imageUrl: string | null = null;
            if (isPixazoConfigured()) {
                try {
                    imageUrl = await generatePixazoImage(
                        textResult.imagePrompt,
                        1024, 1024
                    );
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
                cta: 'Learn more in the comments!' // Default CTA
            });

            // Auto-generate project name
            const words = intent.trim().split(' ').slice(0, 4).join(' ');
            setProjectName(words + '...');

        } catch (error) {
            console.error('Generation error:', error);
            // Fallback content
            setContent({
                postText: `${intent}\n\nWhat do you think? Let me know in the comments! 👇`,
                imageUrl: null,
                imagePrompt: `Professional ${platform} visual about: ${intent}`,
                hooks: [
                    "Here's something I've been thinking about...",
                    "I learned this the hard way...",
                    "Stop scrolling. This is important..."
                ],
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
        } catch (error) {
            console.error('Regenerate text error:', error);
        } finally {
            setIsRegeneratingText(false);
        }
    }, [content, platform, tone]);

    const regenerateImage = useCallback(async () => {
        if (!content) return;
        setIsRegeneratingImage(true);
        try {
            if (isPixazoConfigured()) {
                const imageUrl = await generatePixazoImage(content.imagePrompt, 1024, 1024);
                setContent(prev => prev ? { ...prev, imageUrl } : null);
            }
        } catch (error) {
            console.error('Regenerate image error:', error);
        } finally {
            setIsRegeneratingImage(false);
        }
    }, [content]);

    const regenerateHooks = useCallback(async () => {
        if (!content) return;
        setIsRegeneratingHooks(true);
        try {
            // Simple regeneration by calling content service again for hooks
            const { generateContent } = await import('../../lib/social/SocialContentService');
            const result = await generateContent({
                intent: intent.trim(),
                platform,
                tone,
                audience: 'founders'
            });
            setContent(prev => prev ? { ...prev, hooks: result.hooks } : null);
        } catch (error) {
            console.error('Regenerate hooks error:', error);
        } finally {
            setIsRegeneratingHooks(false);
        }
    }, [content, intent, platform, tone]);

    const regenerateHashtags = useCallback(async () => {
        if (!content) return;
        setIsRegeneratingHashtags(true);
        try {
            const { generateContent } = await import('../../lib/social/SocialContentService');
            const result = await generateContent({
                intent: intent.trim(),
                platform,
                tone,
                audience: 'founders'
            });
            setContent(prev => prev ? { ...prev, hashtags: result.hashtags } : null);
        } catch (error) {
            console.error('Regenerate hashtags error:', error);
        } finally {
            setIsRegeneratingHashtags(false);
        }
    }, [content, intent, platform, tone]);

    const handleQuickEdit = useCallback(async (instruction: string) => {
        if (!content) return;
        setIsEditing(true);
        try {
            const { editContent } = await import('../../lib/social/SocialContentService');
            const editedText = await editContent({
                currentContent: content.postText,
                instruction,
                platform
            });
            setContent(prev => prev ? { ...prev, postText: editedText } : null);
        } catch (error) {
            console.error('Quick edit error:', error);
        } finally {
            setIsEditing(false);
        }
    }, [content, platform]);

    const handleSelectHook = useCallback((hook: string) => {
        if (!content) return;
        setContent(prev => prev ? {
            ...prev,
            postText: hook + '\n\n' + prev.postText
        } : null);
    }, [content]);

    // ===== SAVE PROJECT =====

    const handleSaveProject = useCallback(async () => {
        if (!content || !projectName.trim()) return;
        setIsSaving(true);

        try {
            const { supabase } = await import('../../lib/supabaseClient');
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.error('No user logged in');
                return;
            }

            const { error } = await supabase.from('projects').insert({
                user_id: user.id,
                name: projectName.trim(),
                type: 'social', // Different from 'chat'
                session_state: {
                    platform,
                    tone,
                    intent,
                    content
                }
            });

            if (error) throw error;

            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Save error:', error);
        } finally {
            setIsSaving(false);
        }
    }, [content, projectName, platform, tone, intent]);

    // ===== RENDER =====

    return (
        <div className={`flex-1 flex flex-col min-h-screen ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
            {/* Header */}
            <header className={`
                px-6 py-4 border-b
                ${isDark ? 'border-white/5 bg-[#0a0a0a]' : 'border-gray-100 bg-white'}
            `}>
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/5 text-white/50' : 'hover:bg-gray-100 text-gray-400'
                                    }`}
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        )}
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                                <Share2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    Social KroniQ
                                </h1>
                            </div>
                        </div>
                    </div>

                    {content && (
                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                placeholder="Project name..."
                                className={`
                                    px-3 py-2 rounded-lg text-sm w-48 border outline-none
                                    ${isDark
                                        ? 'bg-white/5 border-white/10 text-white placeholder-white/30'
                                        : 'bg-gray-50 border-gray-200 text-gray-900'}
                                `}
                            />
                            <button
                                onClick={handleSaveProject}
                                disabled={isSaving || !projectName.trim()}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
                                    transition-all
                                    ${saved
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : 'bg-emerald-500 text-white hover:bg-emerald-400'}
                                `}
                            >
                                {isSaving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : saved ? (
                                    <CheckCircle className="w-4 h-4" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                {saved ? 'Saved!' : 'Save'}
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

                    {/* Input Section */}
                    <div className={`
                        p-6 rounded-xl border
                        ${isDark ? 'bg-white/[0.02] border-white/10' : 'bg-white border-gray-100'}
                    `}>
                        {/* Platform & Tone selectors */}
                        <div className="flex gap-4 mb-5">
                            <Dropdown
                                isDark={isDark}
                                value={platform}
                                options={PLATFORMS.map(p => ({ id: p.id, label: p.name, icon: p.icon }))}
                                onChange={(v) => setPlatform(v as Platform)}
                                className="w-40"
                            />
                            <Dropdown
                                isDark={isDark}
                                value={tone}
                                options={TONES}
                                onChange={(v) => setTone(v as Tone)}
                                className="w-36"
                            />
                        </div>

                        {/* Intent input */}
                        <div className="mb-5">
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                                What do you want to post about?
                            </label>
                            <textarea
                                value={intent}
                                onChange={(e) => setIntent(e.target.value)}
                                rows={3}
                                placeholder="e.g., Announcing our new product launch, or sharing my startup journey..."
                                className={`
                                    w-full p-4 rounded-xl text-sm leading-relaxed resize-none
                                    border outline-none transition-all
                                    ${isDark
                                        ? 'bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-emerald-500/50'
                                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-emerald-300'}
                                `}
                            />
                        </div>

                        {/* Generate button */}
                        <button
                            onClick={generateAllContent}
                            disabled={!intent.trim() || isGenerating}
                            className={`
                                w-full py-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2
                                transition-all
                                ${intent.trim() && !isGenerating
                                    ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                                    : isDark ? 'bg-white/5 text-white/20' : 'bg-gray-100 text-gray-300'}
                            `}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Generating all content...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Generate Content
                                </>
                            )}
                        </button>
                    </div>

                    {/* Generated Content */}
                    {content && (
                        <div className="space-y-4">
                            {/* Divider with label */}
                            <div className="flex items-center gap-4 py-2">
                                <div className={`flex-1 h-px ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                                <span className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                                    Generated Content
                                </span>
                                <div className={`flex-1 h-px ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                            </div>

                            {/* Post Text */}
                            <PostTextBlock
                                isDark={isDark}
                                content={content.postText}
                                platform={platform}
                                onChange={(text) => setContent(prev => prev ? { ...prev, postText: text } : null)}
                                onRegenerate={regenerateText}
                                onQuickEdit={handleQuickEdit}
                                isRegenerating={isRegeneratingText}
                                isEditing={isEditing}
                            />

                            {/* Image */}
                            <ImageBlock
                                isDark={isDark}
                                imageUrl={content.imageUrl}
                                imagePrompt={content.imagePrompt}
                                onPromptChange={(prompt) => setContent(prev => prev ? { ...prev, imagePrompt: prompt } : null)}
                                onRegenerate={regenerateImage}
                                isRegenerating={isRegeneratingImage}
                            />

                            {/* Hooks & Hashtags side by side */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <HooksBlock
                                    isDark={isDark}
                                    hooks={content.hooks}
                                    onSelectHook={handleSelectHook}
                                    onRegenerate={regenerateHooks}
                                    isRegenerating={isRegeneratingHooks}
                                />
                                <HashtagsBlock
                                    isDark={isDark}
                                    hashtags={content.hashtags}
                                    onRegenerate={regenerateHashtags}
                                    isRegenerating={isRegeneratingHashtags}
                                />
                            </div>

                            {/* Quick Edit Bar */}
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
    );
};

export default SocialKroniq;
