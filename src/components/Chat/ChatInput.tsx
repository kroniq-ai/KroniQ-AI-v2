import React, { useState, useRef } from 'react';
import { ArrowUp, Sparkles, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { enhancePrompt, isPromptEnhancementAvailable } from '../../lib/promptEnhancer';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (attachments?: File[]) => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  disabled?: boolean;
  selectedModel: string;
  attachments?: File[];
  onFileSelect?: (files: File[]) => void;
  onRemoveAttachment?: (index: number) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  onKeyPress,
  placeholder = 'Type your message...',
  disabled = false,
  attachments = [],
  onFileSelect,
  onRemoveAttachment
}) => {
  const { currentTheme } = useTheme();
  const { showToast } = useToast();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const handleEnhancePrompt = async () => {
    if (!value.trim() || isEnhancing) return;

    if (!isPromptEnhancementAvailable()) {
      showToast('error', 'Feature Unavailable', 'Prompt enhancement requires API configuration');
      return;
    }

    setIsEnhancing(true);
    try {
      const enhanced = await enhancePrompt(value);
      onChange(enhanced);
      showToast('success', 'Prompt Enhanced!', 'Your prompt has been improved');
    } catch (error: any) {
      showToast('error', 'Enhancement Failed', error.message || 'Could not enhance prompt');
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onFileSelect) {
      onFileSelect(Array.from(e.target.files));
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if ((value.trim() || attachments.length > 0) && !disabled) {
        onSend(attachments);
      }
    } else if (onKeyPress) {
      onKeyPress(e);
    }
  };

  return (
    <div className="space-y-2">
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 px-1">
          {attachments.map((file, idx) => (
            <div
              key={idx}
              className={`relative flex items-center gap-2 p-2 pr-8 rounded-xl border flex-shrink-0 ${currentTheme === 'pure-white' ? 'bg-white border-gray-200' : 'bg-white/10 border-white/10'
                }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${currentTheme === 'pure-white' ? 'bg-gray-100' : 'bg-white/5'
                }`}>
                {file.type.startsWith('image/') ? (
                  <ImageIcon className="w-4 h-4 opacity-50" />
                ) : (
                  <FileText className="w-4 h-4 opacity-50" />
                )}
              </div>
              <div className="flex flex-col min-w-[100px] max-w-[200px]">
                <span className="text-xs font-medium truncate">{file.name}</span>
                <span className="text-[10px] opacity-50">{(file.size / 1024).toFixed(1)} KB</span>
              </div>
              <button
                onClick={() => onRemoveAttachment && onRemoveAttachment(idx)}
                className="absolute right-1 top-1 p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Container - Modern Glassmorphism */}
      <div className="w-full">
        <div className={`relative rounded-2xl shadow-2xl border transition-all duration-300 group ${currentTheme === 'pure-white'
            ? 'bg-white/95 backdrop-blur-xl border-gray-200 focus-within:border-blue-300 focus-within:shadow-blue-500/10'
            : 'bg-gradient-to-r from-white/[0.08] via-white/[0.12] to-white/[0.08] backdrop-blur-2xl border-white/15 focus-within:border-teal-500/40 focus-within:shadow-[0_0_40px_rgba(20,184,166,0.15)]'
          }`}>
          {/* Subtle inner glow */}
          <div className={`absolute inset-0 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 pointer-events-none ${currentTheme === 'pure-white' ? '' : 'bg-gradient-to-r from-teal-500/5 via-transparent to-cyan-500/5'
            }`} />

          <div className="flex items-end gap-2 p-3 relative">
            {/* Left Action Buttons - More subtle */}
            <div className="flex items-center gap-1 pb-2">
              {/* File Attachment Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className={`p-2.5 rounded-xl transition-all duration-200 ${disabled
                  ? 'opacity-30 cursor-not-allowed'
                  : currentTheme === 'pure-white'
                    ? 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                    : 'hover:bg-white/10 text-white/40 hover:text-white/70'
                  }`}
                title="Attach files"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                className="hidden"
              />

              {/* Enhance Prompt Button */}
              {isPromptEnhancementAvailable() && (
                <button
                  onClick={handleEnhancePrompt}
                  disabled={disabled || isEnhancing || !value.trim()}
                  className={`p-2.5 rounded-xl transition-all duration-200 ${isEnhancing
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse shadow-lg shadow-purple-500/30'
                    : disabled || !value.trim()
                      ? currentTheme === 'pure-white'
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-white/20 cursor-not-allowed'
                      : currentTheme === 'pure-white'
                        ? 'hover:bg-purple-50 text-purple-500 hover:text-purple-600'
                        : 'hover:bg-purple-500/20 text-purple-400 hover:text-purple-300'
                    }`}
                  title={isEnhancing ? 'Enhancing...' : 'Enhance prompt with AI'}
                >
                  <Sparkles className={`w-4 h-4 ${isEnhancing ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>

            {/* Text Input - Cleaner */}
            <textarea
              ref={inputRef}
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 180) + 'px';
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className={`flex-1 bg-transparent px-3 py-3 resize-none focus:outline-none text-sm font-medium leading-relaxed ${currentTheme === 'pure-white'
                ? 'text-gray-800 placeholder-gray-400'
                : 'text-white/95 placeholder-white/35'
                }`}
              rows={1}
              style={{ minHeight: '24px', maxHeight: '150px' }}
            />

            {/* Send Button - Gradient pill */}
            <div className="flex items-center pb-2">
              <button
                onClick={() => onSend(attachments)}
                disabled={(!value.trim() && attachments.length === 0) || disabled}
                className={`p-3 rounded-xl transition-all duration-300 ${(value.trim() || attachments.length > 0) && !disabled
                  ? currentTheme === 'pure-white'
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105'
                    : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 hover:scale-105'
                  : currentTheme === 'pure-white'
                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    : 'bg-white/5 text-white/20 cursor-not-allowed'
                  }`}
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>


      {/* Disclaimer - Hidden on mobile for compactness */}
      <div className="hidden sm:flex items-center justify-center px-2">
        <p className={`text-xs ${currentTheme === 'pure-white' ? 'text-gray-400' : 'text-white/30'}`}>
          KroniQ can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
};
