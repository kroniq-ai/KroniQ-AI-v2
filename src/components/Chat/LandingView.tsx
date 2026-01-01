import React, { useEffect, useState, useRef } from 'react';
import { ImageIcon, Video, Sparkles, ArrowRight, Presentation, Music, Paperclip, Image } from 'lucide-react';
import { CompactModelSelector } from './CompactModelSelector';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface LandingViewProps {
  onQuickAction: (prompt: string, attachments?: File[]) => void;
  selectedModel?: string;
  onModelChange?: (modelId: string) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onQuickAction, selectedModel = 'gpt-4o', onModelChange }) => {
  const { currentTheme } = useTheme();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [input, setInput] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [limits, setLimits] = useState({ images: 5, videos: 1, songs: 5, ppts: 5 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    fetchLimits();
  }, [user]);

  const fetchLimits = async () => {
    if (!user) return;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const { data } = await supabase
      .from('daily_usage_limits')
      .select('feature_type')
      .eq('user_id', user.id)
      .gte('created_at', startOfMonth);

    const usage = data || [];
    const imageCount = usage.filter(u => u.feature_type === 'image_generation').length;
    const videoCount = usage.filter(u => u.feature_type === 'video_generation').length;
    const songCount = usage.filter(u => u.feature_type === 'music_generation').length;
    const pptCount = usage.filter(u => u.feature_type === 'presentation_generation').length;

    setLimits({
      images: Math.max(0, 5 - imageCount),
      videos: Math.max(0, 1 - videoCount),
      songs: Math.max(0, 5 - songCount),
      ppts: Math.max(0, 5 - pptCount)
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() || attachedFiles.length > 0) {
      onQuickAction(input || 'Please analyze these files', attachedFiles);
      setInput('');
      setAttachedFiles([]);
    }
  };

  const suggestions = [
    {
      icon: ImageIcon,
      title: 'Generate Image',
      prompt: 'Create an image of a sunset over mountains',
      remaining: limits.images,
      total: 5
    },
    {
      icon: Video,
      title: 'Generate Video',
      prompt: 'Generate a video of ocean waves',
      remaining: limits.videos,
      total: 1
    },
    {
      icon: Presentation,
      title: 'Create PPT',
      prompt: 'Create a presentation about AI',
      remaining: limits.ppts,
      total: 5
    },
    {
      icon: Music,
      title: 'Generate Song',
      prompt: 'Create a calm instrumental music',
      remaining: limits.songs,
      total: 5
    }
  ];

  return (
    <div className="h-full flex flex-col p-4 md:p-6 relative grid-pattern-bg">
      {/* Background gradient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(16, 185, 129, 0.15) 0%, transparent 60%)'
        }}
      />

      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl w-full mx-auto relative z-10">
        {/* Badge - Like pricing popup */}
        <div className={`mb-6 ${mounted ? 'opacity-100 transition-opacity duration-500' : 'opacity-0'}`}>
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            AI-POWERED CREATIVITY
          </span>
        </div>

        {/* Title - Like pricing popup */}
        <div className={`text-center mb-10 ${mounted ? 'opacity-100 transition-opacity duration-700' : 'opacity-0'}`}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              KroniQ
            </span>
          </h1>
          <p className="text-white/50 text-base md:text-lg max-w-md mx-auto">
            Choose how you want to create today
          </p>
        </div>

        {/* Suggestion Cards - Glassmorphic like pricing popup */}
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 w-full ${mounted ? 'opacity-100 transition-opacity duration-700 delay-200' : 'opacity-0'}`}>
          {suggestions.map((suggestion, index) => {
            const Icon = suggestion.icon;
            return (
              <button
                key={index}
                onClick={() => onQuickAction(suggestion.prompt)}
                className={`
                  group relative flex flex-col items-center gap-4 p-6 rounded-2xl
                  backdrop-blur-xl border transition-all duration-300
                  bg-gradient-to-br from-white/10 via-white/5 to-transparent
                  border-white/10 hover:border-emerald-500/40
                  hover:shadow-[0_0_40px_rgba(16,185,129,0.15)]
                  active:scale-95
                `}
                style={{
                  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.05)'
                }}
              >
                {/* Icon container */}
                <div className={`
                  w-14 h-14 rounded-xl flex items-center justify-center
                  bg-gradient-to-br from-emerald-500/20 to-teal-500/20
                  border border-emerald-500/20
                  group-hover:from-emerald-500/30 group-hover:to-teal-500/30
                  group-hover:border-emerald-500/40
                  transition-all duration-300
                `}>
                  <Icon className="w-7 h-7 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                </div>

                {/* Title */}
                <span className="text-sm font-semibold text-white group-hover:text-emerald-100 transition-colors">
                  {suggestion.title}
                </span>

                {/* Usage badge */}
                {user && (
                  <span className="absolute top-3 right-3 text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/50 border border-white/10">
                    {suggestion.remaining}/{suggestion.total}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Area - Fixed at Bottom */}
      <div className={`w-full max-w-4xl mx-auto mt-auto ${mounted ? 'opacity-100 transition-opacity duration-700 delay-400' : 'opacity-0'}`}>
        <form
          onSubmit={handleSubmit}
          className="relative"
        >
          {onModelChange && (
            <div className="mb-3">
              <CompactModelSelector
                selectedModel={selectedModel}
                onModelChange={onModelChange}
                category="chat"
              />
            </div>
          )}

          {attachedFiles.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {attachedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white"
                >
                  <span className="truncate max-w-[200px]">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="relative flex items-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-colors focus-within:border-white/30">
            <div className="flex items-center gap-1 pl-3">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="*/*"
              />
              <input
                ref={imageInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                accept="image/*"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Attach file"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Upload image"
              >
                <Image className="w-5 h-5" />
              </button>
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message KroniQ..."
              className="flex-1 bg-transparent px-5 py-4 text-white text-sm placeholder-white/40 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() && attachedFiles.length === 0}
              className="mr-3 p-2 bg-white text-slate-900 rounded-lg hover:bg-white/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-white/30 text-center mt-3">
            KroniQ can make mistakes. Check important info.
          </p>
        </form>
      </div>
    </div>
  );
};
