/**
 * ChatMessage - Premium animated chat message component
 * Features glass-morphism, tool indicators, and media embeds
 */

import React, { useState } from 'react';
import {
    User, Sparkles, Image as ImageIcon, Video, Music, Presentation,
    Copy, Check, Download, Play, Pause, Volume2, Expand, ThumbsUp, RefreshCw
} from 'lucide-react';

// Tool type indicators with gradients
const TOOL_STYLES = {
    chat: { gradient: 'from-emerald-500 to-teal-500', icon: Sparkles, label: 'AI Response' },
    image: { gradient: 'from-purple-500 to-pink-500', icon: ImageIcon, label: 'Image Generation' },
    video: { gradient: 'from-blue-500 to-cyan-500', icon: Video, label: 'Video Generation' },
    tts: { gradient: 'from-pink-500 to-rose-500', icon: Music, label: 'Text to Speech' },
    ppt: { gradient: 'from-orange-500 to-amber-500', icon: Presentation, label: 'Presentation' },
};

export interface ChatMessageProps {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    tool?: 'chat' | 'image' | 'video' | 'tts' | 'ppt';
    model?: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'audio';
    timestamp?: Date;
    isStreaming?: boolean;
    isDark?: boolean;
    // Feedback callbacks
    onLike?: (messageId: string) => void;
    onTryAnother?: (messageId: string) => void;
    showFeedback?: boolean;
}

// Image Viewer with zoom
const ImageEmbed: React.FC<{ url: string; isDark: boolean }> = ({ url, isDark }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="relative group mt-3">
            <img
                src={url}
                alt="Generated"
                className={`
                    max-w-full rounded-xl cursor-pointer transition-all duration-300
                    ${isExpanded ? 'max-h-[80vh]' : 'max-h-80'}
                    hover:shadow-2xl hover:shadow-purple-500/20
                `}
                onClick={() => setIsExpanded(!isExpanded)}
            />
            <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`p-2 rounded-lg backdrop-blur-xl ${isDark ? 'bg-black/50 text-white' : 'bg-white/80 text-gray-800'}`}
                >
                    <Expand className="w-4 h-4" />
                </button>
                <a
                    href={url}
                    download
                    className={`p-2 rounded-lg backdrop-blur-xl ${isDark ? 'bg-black/50 text-white' : 'bg-white/80 text-gray-800'}`}
                >
                    <Download className="w-4 h-4" />
                </a>
            </div>
        </div>
    );
};

// Video Player
const VideoEmbed: React.FC<{ url: string; isDark: boolean }> = ({ url, isDark }) => (
    <div className="relative mt-3 rounded-xl overflow-hidden">
        <video
            src={url}
            controls
            className="max-w-full max-h-96 rounded-xl"
        />
    </div>
);

// Audio Player for TTS
const AudioEmbed: React.FC<{ url: string; isDark: boolean }> = ({ url, isDark }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const audioRef = React.useRef<HTMLAudioElement>(null);

    const togglePlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const prog = (audioRef.current.currentTime / audioRef.current.duration) * 100;
            setProgress(prog);
        }
    };

    return (
        <div className={`
            flex items-center gap-4 p-4 mt-3 rounded-xl border
            ${isDark
                ? 'bg-gradient-to-r from-pink-500/10 to-rose-500/10 border-pink-500/30'
                : 'bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200'}
        `}>
            <audio ref={audioRef} src={url} onTimeUpdate={handleTimeUpdate} onEnded={() => setIsPlaying(false)} />

            <button
                onClick={togglePlay}
                className={`
                    w-12 h-12 rounded-full flex items-center justify-center
                    bg-gradient-to-r from-pink-500 to-rose-500 text-white
                    hover:scale-105 transition-transform shadow-lg shadow-pink-500/30
                `}
            >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>

            <div className="flex-1">
                <div className={`h-2 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
                    <div
                        className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-100"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <Volume2 className={`w-5 h-5 ${isDark ? 'text-pink-400' : 'text-pink-600'}`} />
        </div>
    );
};

// Streaming dots animation with "Thinking" text
const StreamingIndicator: React.FC<{ isDark: boolean }> = ({ isDark }) => (
    <div className="flex items-center gap-2 py-2">
        <span className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>Thinking</span>
        <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-emerald-400' : 'bg-emerald-500'}`} style={{ animationDelay: '0ms' }} />
            <div className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-emerald-400' : 'bg-emerald-500'}`} style={{ animationDelay: '150ms' }} />
            <div className={`w-2 h-2 rounded-full animate-bounce ${isDark ? 'bg-emerald-400' : 'bg-emerald-500'}`} style={{ animationDelay: '300ms' }} />
        </div>
    </div>
);

export const ChatMessage: React.FC<ChatMessageProps> = ({
    id,
    role,
    content,
    tool = 'chat',
    model,
    mediaUrl,
    mediaType,
    isStreaming,
    isDark = true,
    onLike,
    onTryAnother,
    showFeedback = true,
}) => {
    const [copied, setCopied] = useState(false);
    const [liked, setLiked] = useState(false);
    const isUser = role === 'user';
    const toolStyle = TOOL_STYLES[tool];
    const ToolIcon = toolStyle.icon;

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLike = () => {
        setLiked(true);
        onLike?.(id);
    };

    const handleTryAnother = () => {
        onTryAnother?.(id);
    };

    return (
        <div
            className={`
                flex gap-4 px-4 py-6 animate-fade-in-up
                ${isUser ? 'flex-row-reverse' : 'flex-row'}
            `}
            style={{
                animation: 'fadeInUp 0.4s ease-out forwards',
            }}
        >
            {/* Avatar */}
            <div className={`
                flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
                ${isUser
                    ? (isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600')
                    : `bg-gradient-to-br ${toolStyle.gradient} text-white shadow-lg`}
                ${!isUser && `shadow-${tool === 'image' ? 'purple' : tool === 'video' ? 'blue' : 'emerald'}-500/30`}
            `}>
                {isUser ? (
                    <User className="w-5 h-5" />
                ) : (
                    // Use KroniQ Q logo for AI responses
                    <img
                        src="/kroniq-logo-white.png"
                        alt="KroniQ AI"
                        className="w-6 h-6 object-contain"
                    />
                )}
            </div>

            {/* Message Bubble */}
            <div className={`
                flex-1 max-w-[80%]
                ${isUser ? 'flex flex-col items-end' : ''}
            `}>
                {/* KroniQ AI Badge */}
                {!isUser && (
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`
                            px-3 py-1 rounded-full text-xs font-medium
                            bg-gradient-to-r from-emerald-500/20 to-teal-500/20 
                            text-emerald-400 border border-emerald-500/20
                        `}>
                            KroniQ AI
                        </span>
                    </div>
                )}

                {/* Content Bubble */}
                <div className={`
                    relative group p-4 rounded-2xl transition-all duration-300
                    ${isUser
                        ? (isDark
                            ? 'bg-emerald-500 text-white'
                            : 'bg-emerald-500 text-white')
                        : (isDark
                            ? 'bg-white/5 backdrop-blur-xl border border-white/10 text-white'
                            : 'bg-white border border-gray-200 text-gray-900 shadow-sm')}
                    ${isUser ? 'rounded-br-md' : 'rounded-bl-md'}
                `}>
                    {/* Content or streaming indicator */}
                    {isStreaming ? (
                        <StreamingIndicator isDark={isDark} />
                    ) : (
                        <>
                            <p className="whitespace-pre-wrap leading-relaxed">{content}</p>

                            {/* Media Embeds */}
                            {mediaUrl && mediaType === 'image' && (
                                <ImageEmbed url={mediaUrl} isDark={isDark} />
                            )}
                            {mediaUrl && mediaType === 'video' && (
                                <VideoEmbed url={mediaUrl} isDark={isDark} />
                            )}
                            {mediaUrl && mediaType === 'audio' && (
                                <AudioEmbed url={mediaUrl} isDark={isDark} />
                            )}
                        </>
                    )}

                    {/* Copy button for AI messages */}
                    {!isUser && !isStreaming && (
                        <button
                            onClick={handleCopy}
                            className={`
                                absolute -bottom-3 right-3 p-1.5 rounded-lg
                                opacity-0 group-hover:opacity-100 transition-all duration-200
                                ${isDark
                                    ? 'bg-white/10 hover:bg-white/20 text-white/70'
                                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}
                            `}
                        >
                            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                    )}
                </div>

                {/* Feedback buttons for AI messages */}
                {!isUser && !isStreaming && showFeedback && (
                    <div className="mt-4 flex flex-col items-center gap-3">
                        <p className={`text-sm font-medium ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                            How do you like this response?
                        </p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleLike}
                                disabled={liked}
                                className={`
                                    flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium
                                    transition-all duration-200
                                    ${liked
                                        ? 'bg-emerald-500 text-white cursor-default'
                                        : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-105'}
                                `}
                            >
                                <ThumbsUp className="w-4 h-4" />
                                {liked ? 'Thanks!' : 'Yes, I prefer this'}
                            </button>
                            <button
                                onClick={handleTryAnother}
                                className={`
                                    flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium
                                    transition-all duration-200
                                    ${isDark
                                        ? 'bg-white/10 text-white/80 hover:bg-white/15'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                                `}
                            >
                                <RefreshCw className="w-4 h-4" />
                                Try another AI model
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Export animation styles
export const chatAnimationStyles = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .animate-fade-in-up {
        animation: fadeInUp 0.4s ease-out forwards;
    }
`;

export default ChatMessage;
