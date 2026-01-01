import React, { useState, useEffect } from 'react';
import { MessageSquare, Image, Video, Music, Sparkles, Bot, Send } from 'lucide-react';

// Typing animation component
const TypingIndicator: React.FC = () => (
  <div className="flex items-center gap-1 px-3 py-2">
    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }} />
    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '150ms' }} />
    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '300ms' }} />
  </div>
);

// Animated typing text
const TypewriterText: React.FC<{ text: string; delay?: number }> = ({ text, delay = 0 }) => {
  const [displayText, setDisplayText] = useState('');
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      let index = 0;
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayText(text.slice(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
          setShowCursor(false);
        }
      }, 25);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, delay]);

  return (
    <span>
      {displayText}
      {showCursor && <span className="animate-pulse text-purple-400">|</span>}
    </span>
  );
};

export const ProductMockup: React.FC = () => {
  const [showResponse, setShowResponse] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowResponse(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const capabilities = [
    { icon: MessageSquare, label: 'Chat AI', color: 'from-purple-500 to-violet-600', delay: 0 },
    { icon: Image, label: 'Images', color: 'from-pink-500 to-rose-600', delay: 200 },
    { icon: Video, label: 'Video', color: 'from-orange-500 to-red-600', delay: 400 },
    { icon: Music, label: 'Music', color: 'from-emerald-500 to-green-600', delay: 600 },
  ];

  return (
    <div className="relative mx-auto max-w-2xl lg:max-w-3xl">
      {/* Floating capability badges */}
      <div className="absolute -top-4 -left-8 lg:-left-16 hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0d0d15]/90 backdrop-blur-xl border border-purple-500/30 shadow-lg shadow-purple-500/10 animate-float z-20">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-white" />
        </div>
        <span className="text-white font-medium text-sm">Chat AI</span>
      </div>

      <div className="absolute top-20 -right-4 lg:-right-12 hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0d0d15]/90 backdrop-blur-xl border border-pink-500/30 shadow-lg shadow-pink-500/10 animate-float z-20" style={{ animationDelay: '1s' }}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
          <Image className="w-4 h-4 text-white" />
        </div>
        <span className="text-white font-medium text-sm">Images</span>
      </div>

      <div className="absolute -bottom-2 -left-4 lg:-left-12 hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0d0d15]/90 backdrop-blur-xl border border-orange-500/30 shadow-lg shadow-orange-500/10 animate-float z-20" style={{ animationDelay: '2s' }}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
          <Video className="w-4 h-4 text-white" />
        </div>
        <span className="text-white font-medium text-sm">Video</span>
      </div>

      <div className="absolute bottom-24 -right-8 lg:-right-16 hidden lg:flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0d0d15]/90 backdrop-blur-xl border border-emerald-500/30 shadow-lg shadow-emerald-500/10 animate-float z-20" style={{ animationDelay: '3s' }}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <Music className="w-4 h-4 text-white" />
        </div>
        <span className="text-white font-medium text-sm">Music</span>
      </div>

      {/* Ambient glow behind laptop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-radial from-purple-500/15 via-purple-500/5 to-transparent blur-3xl -z-10" />
      <div className="absolute top-1/3 left-1/3 w-[80%] h-[80%] bg-gradient-radial from-pink-500/10 via-transparent to-transparent blur-3xl -z-10" />

      {/* Laptop Frame */}
      <div className="relative">
        {/* Screen */}
        <div className="relative mx-auto w-full">
          {/* Screen bezel */}
          <div className="relative bg-gray-900 rounded-t-2xl pt-4 px-4 pb-0 border border-gray-700/50 shadow-2xl">
            {/* Camera notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gray-700" />

            {/* Screen content */}
            <div className="relative bg-[#0a0a10] rounded-lg overflow-hidden aspect-[16/10] border border-gray-800/50">
              {/* KroniQ Dashboard Preview */}
              <div className="absolute inset-0 p-4">
                {/* Header bar */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                      <span className="text-white font-bold text-xs">K</span>
                    </div>
                    <span className="text-white font-semibold text-sm">KroniQ Studio</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30">
                      <span className="text-purple-400 text-xs font-medium">GPT-5.2</span>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                      <span className="text-emerald-400 text-xs font-medium">200K</span>
                    </div>
                  </div>
                </div>

                {/* Main content area */}
                <div className="grid grid-cols-4 gap-3 h-[calc(100%-4rem)]">
                  {/* Sidebar */}
                  <div className="col-span-1 bg-white/[0.03] rounded-lg p-3 border border-white/5 hidden sm:block">
                    <div className="text-[10px] text-white/40 mb-3 uppercase tracking-wider">Studios</div>
                    {['Chat', 'Image', 'Video', 'Music'].map((studio, i) => (
                      <div
                        key={studio}
                        className={`py-2 px-2 rounded-lg mb-1.5 flex items-center gap-2 text-xs ${i === 0 ? 'bg-purple-500/20 text-purple-300' : 'text-white/50'
                          }`}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-purple-400' : 'bg-white/20'}`} />
                        {studio}
                      </div>
                    ))}
                  </div>

                  {/* Main chat area */}
                  <div className="col-span-4 sm:col-span-3 bg-white/[0.03] rounded-lg p-3 border border-white/5 flex flex-col">
                    {/* Messages */}
                    <div className="flex-1 space-y-3 overflow-hidden">
                      {/* User message */}
                      <div className="flex justify-end">
                        <div className="bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-xl px-3 py-2 max-w-[80%] border border-purple-500/20">
                          <p className="text-white text-[11px]">Help me write a marketing strategy for my AI startup</p>
                        </div>
                      </div>

                      {/* AI response */}
                      <div className="flex justify-start">
                        <div className="bg-white/[0.08] rounded-xl px-3 py-2 max-w-[85%] border border-white/5">
                          <div className="flex items-center gap-2 mb-2">
                            <Bot className="w-3 h-3 text-purple-400" />
                            <span className="text-purple-400 text-[10px] font-medium">GPT-5.2</span>
                          </div>
                          {showResponse ? (
                            <p className="text-white/80 text-[11px] leading-relaxed">
                              <TypewriterText
                                text="Here's a comprehensive marketing strategy for your AI startup: 1) Define your target audience clearly. 2) Create compelling content that showcases your AI's capabilities..."
                                delay={500}
                              />
                            </p>
                          ) : (
                            <TypingIndicator />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Input bar */}
                    <div className="mt-3 flex items-center gap-2 bg-white/[0.05] rounded-xl px-3 py-2.5 border border-white/10">
                      <div className="flex-1 text-white/30 text-xs">Ask anything...</div>
                      <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                        <Send className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Glow overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-purple-500/5 pointer-events-none" />
            </div>
          </div>

          {/* Laptop base/keyboard */}
          <div className="relative h-3 bg-gradient-to-b from-gray-800 to-gray-900 rounded-b-xl mx-6 border-x border-b border-gray-700/50">
            {/* Trackpad indent */}
            <div className="absolute top-0.5 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-700/50 rounded-full" />
          </div>

          {/* Laptop shadow */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-[70%] h-8 bg-gradient-to-t from-transparent to-black/40 blur-2xl" />
        </div>
      </div>
    </div>
  );
};
