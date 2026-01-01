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

      {/* Input Container */}
      <div className="w-full">
        <div className={`relative rounded-xl sm:rounded-2xl shadow-lg border sm:border-2 ${currentTheme === 'pure-white'
          ? 'bg-white/95 backdrop-blur-xl border-gray-200'
          : 'bg-white/10 backdrop-blur-xl border-white/20'
          }`}>
          <div className="flex items-end gap-1 sm:gap-2 p-1.5 sm:p-2">
            {/* Left Action Buttons */}
            <div className="flex items-center gap-0.5 sm:gap-1 pb-1 sm:pb-2">
              {/* File Attachment Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled}
                className={`p-2 rounded-lg transition-all ${disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : currentTheme === 'pure-white'
                      ? 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                      : 'hover:bg-white/10 text-white/50 hover:text-white'
                  }`}
                title="Attach files"
              >
                <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
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
                  className={`p-2 rounded-lg transition-all ${isEnhancing
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse'
                    : disabled || !value.trim()
                      ? currentTheme === 'pure-white'
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-600 cursor-not-allowed'
                      : currentTheme === 'pure-white'
                        ? 'hover:bg-purple-100 text-purple-600'
                        : 'hover:bg-purple-500/20 text-purple-400'
                    }`}
                  title={isEnhancing ? 'Enhancing...' : 'Enhance prompt with AI'}
                >
                  <Sparkles className={`w-3 h-3 sm:w-4 sm:h-4 ${isEnhancing ? 'animate-spin' : ''}`} />
                </button>
              )}
            </div>

            {/* Text Input */}
            <textarea
              ref={inputRef}
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className={`flex-1 bg-transparent px-2 sm:px-4 py-2 sm:py-3 resize-none focus:outline-none text-xs sm:text-sm font-medium ${currentTheme === 'pure-white'
                ? 'text-gray-800 placeholder-gray-400'
                : 'text-white/90 placeholder-white/40'
                }`}
              rows={1}
              style={{ minHeight: '20px', maxHeight: '120px' }}
            />

            {/* Send Button */}
            <div className="flex items-center pb-1 sm:pb-2">
              <button
                onClick={() => onSend(attachments)}
                disabled={(!value.trim() && attachments.length === 0) || disabled}
                className={`p-2 rounded-xl transition-all ${(value.trim() || attachments.length > 0) && !disabled
                  ? currentTheme === 'pure-white'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                    : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500'
                  : currentTheme === 'pure-white'
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white/10 text-white/30 cursor-not-allowed'
                  }`}
              >
                <ArrowUp className="w-4 h-4 sm:w-5 sm:h-5" />
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
