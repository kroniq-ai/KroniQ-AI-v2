import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Zap, Shield, Globe, Sparkles, Image as ImageIcon, Video, Music,
  Brain, Wand2, Check, Layers, Bot, Crown, Target, LineChart, Users, FileText,
  ArrowUpDown, ArrowRight, RefreshCw, Briefcase, Database, BarChart3, Clock
} from 'lucide-react';
import { MouseParticles } from '../Landing/MouseParticles';
import { LandingFooter } from '../Landing/LandingFooter';

// Scroll reveal hook
const useScrollReveal = (threshold = 0.1) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold, rootMargin: '0px 0px -50px 0px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
};

// ===== MOCKUP COMPONENTS =====

// Smart Router Mockup - Shows model selection behind the scenes
const SmartRouterMockup = () => (
  <div className="relative">
    <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
      <div className="bg-white/5 border-b border-white/10 p-3 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
          <Brain className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-white text-sm font-semibold">KroniQ AI</div>
          <div className="text-emerald-400 text-xs">Smart Router Active</div>
        </div>
      </div>
      <div className="p-4 bg-[#0a0a0f]/80 space-y-3">
        <div className="text-white/60 text-xs mb-2">Analyzing your prompt...</div>
        <div className="space-y-2">
          {[
            { model: 'GPT-5.2', match: '94%', task: 'Code Tasks' },
            { model: 'Claude Sonnet 4', match: '89%', task: 'Writing' },
            { model: 'Gemini 2.5 Pro', match: '85%', task: 'Analysis' },
          ].map((m, i) => (
            <div key={i} className={`flex items-center gap-3 p-2 rounded-lg ${i === 0 ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-white/5'}`}>
              <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-xs">
                {i === 0 ? '✓' : ''}
              </div>
              <div className="flex-1">
                <div className={`text-sm ${i === 0 ? 'text-white font-medium' : 'text-white/60'}`}>{m.model}</div>
                <div className="text-xs text-white/40">{m.task}</div>
              </div>
              <div className={`text-xs ${i === 0 ? 'text-emerald-400' : 'text-white/40'}`}>{m.match}</div>
            </div>
          ))}
        </div>
        <div className="text-center text-xs text-emerald-400 pt-2">
          ✨ Best model selected automatically
        </div>
      </div>
    </div>
    <div className="absolute -top-3 -right-3 px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold shadow-lg">
      70+ Models
    </div>
  </div>
);

// Context Memory Mockup
const ContextMemoryMockup = () => (
  <div className="relative">
    <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
      <div className="bg-white/5 border-b border-white/10 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <span className="text-white text-sm font-semibold">Context Memory</span>
        </div>
        <span className="text-xs text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">Active</span>
      </div>
      <div className="p-4 bg-[#0a0a0f]/80 space-y-3">
        <div className="flex items-start gap-2">
          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">👤</div>
          <div className="bg-white/5 rounded-lg rounded-tl-none p-2 text-xs text-white/80">
            Remember: I'm building a React app called "TaskFlow"
          </div>
        </div>
        <div className="flex items-start gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <div className="bg-emerald-500/10 rounded-lg rounded-tl-none p-2 text-xs text-white/90">
            ✓ Context saved! I'll remember TaskFlow uses React, TypeScript, and Tailwind.
          </div>
        </div>
        <div className="border-t border-white/10 pt-3 mt-3">
          <div className="text-xs text-white/40 mb-2">Remembered context:</div>
          <div className="flex flex-wrap gap-1">
            {['React', 'TypeScript', 'Tailwind', 'TaskFlow'].map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-xs">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Message to Image Mockup
const MessageToImageMockup = () => (
  <div className="relative">
    <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
      <div className="bg-white/5 border-b border-white/10 p-3 flex items-center gap-2">
        <Wand2 className="w-4 h-4 text-emerald-400" />
        <span className="text-white text-sm font-semibold">Turn Message → Image</span>
      </div>
      <div className="p-4 bg-[#0a0a0f]/80 space-y-3">
        <div className="bg-white/5 rounded-lg p-3 text-sm text-white/80">
          "A futuristic city with flying cars at sunset"
        </div>
        <div className="flex items-center gap-2">
          <ArrowRight className="w-4 h-4 text-emerald-400" />
          <span className="text-emerald-400 text-xs">Generating with FLUX Pro...</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-square rounded-lg bg-gradient-to-br from-emerald-500/30 to-teal-500/30 flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-white/40" />
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="absolute -bottom-3 -right-3 px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold shadow-lg">
      1-Click
    </div>
  </div>
);

// Shorter/Longer Controls Mockup
const LengthControlMockup = () => (
  <div className="relative">
    <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
      <div className="bg-white/5 border-b border-white/10 p-3 flex items-center gap-2">
        <ArrowUpDown className="w-4 h-4 text-emerald-400" />
        <span className="text-white text-sm font-semibold">Quick Adjustments</span>
      </div>
      <div className="p-4 bg-[#0a0a0f]/80 space-y-4">
        <div className="bg-emerald-500/10 rounded-lg p-3 text-sm text-white/90">
          Here's a summary of quantum computing principles...
        </div>
        <div className="flex gap-2">
          <button className="flex-1 py-2 px-3 rounded-lg bg-white/10 hover:bg-emerald-500/20 border border-white/20 text-white text-xs font-medium flex items-center justify-center gap-1 transition-all">
            <span>Shorter</span>
          </button>
          <button className="flex-1 py-2 px-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center justify-center gap-1">
            <span>Longer</span>
          </button>
          <button className="flex-1 py-2 px-3 rounded-lg bg-white/10 hover:bg-emerald-500/20 border border-white/20 text-white text-xs font-medium flex items-center justify-center gap-1 transition-all">
            <RefreshCw className="w-3 h-3" />
            <span>Regen</span>
          </button>
        </div>
        <div className="text-center text-xs text-white/40">
          ✨ Adjust responses instantly without re-prompting
        </div>
      </div>
    </div>
  </div>
);

// Business Panel Mockup - Comprehensive
const BusinessPanelMockup = () => (
  <div className="relative">
    <div className="glass-panel rounded-2xl border border-emerald-500/30 overflow-hidden shadow-2xl shadow-emerald-500/10">
      <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-b border-white/10 p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-white text-sm font-bold">Business Panel</div>
            <div className="text-emerald-400 text-xs">Premium Feature</div>
          </div>
        </div>
        <div className="flex gap-1">
          {['Dashboard', 'Goals', 'Research'].map((tab, i) => (
            <span key={tab} className={`px-2 py-1 rounded text-xs ${i === 0 ? 'bg-emerald-500/30 text-emerald-300' : 'text-white/50'}`}>
              {tab}
            </span>
          ))}
        </div>
      </div>
      <div className="p-4 bg-[#0a0a0f]/90 space-y-4">
        {/* Context remembers business */}
        <div className="bg-white/5 rounded-lg p-3 border border-white/10">
          <div className="text-xs text-white/40 mb-2">Your Business Context</div>
          <div className="flex flex-wrap gap-1">
            {['D2C Startup', 'SaaS', '$10K MRR', 'B2B Sales'].map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-xs">{tag}</span>
            ))}
          </div>
        </div>

        {/* Natural language task */}
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-xs text-white/60 mb-2">Natural Language Task:</div>
          <div className="text-sm text-white/90 italic">
            "By 6 PM, prepare a competitive analysis of X and draft a response plan"
          </div>
        </div>

        {/* Generated deliverables */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-emerald-500/10 rounded-lg p-2 border border-emerald-500/20 text-center">
            <BarChart3 className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <div className="text-xs text-white/80">Analysis Ready</div>
          </div>
          <div className="bg-emerald-500/10 rounded-lg p-2 border border-emerald-500/20 text-center">
            <FileText className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <div className="text-xs text-white/80">Plan Generated</div>
          </div>
        </div>

        {/* Goals tracker preview */}
        <div className="border-t border-white/10 pt-3">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-white/60">Q1 Goals Progress</span>
            <span className="text-emerald-400">68%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full w-[68%] bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
          </div>
        </div>
      </div>
    </div>
    <div className="absolute -top-3 -right-3 px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold shadow-lg flex items-center gap-1">
      <Crown className="w-3 h-3" /> Premium
    </div>
  </div>
);

// Top Models Grid Mockup
const TopModelsMockup = () => (
  <div className="relative">
    <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
      <div className="bg-white/5 border-b border-white/10 p-3 flex items-center justify-between">
        <span className="text-white text-sm font-semibold">Newest Top Models</span>
        <span className="text-xs text-emerald-400">Updated Weekly</span>
      </div>
      <div className="p-4 bg-[#0a0a0f]/80">
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: 'GPT-5.2', icon: '🧠', tag: 'Reasoning' },
            { name: 'Claude Sonnet 4', icon: '🎭', tag: 'Creative' },
            { name: 'Gemini 2.5 Pro', icon: '💎', tag: 'Multimodal' },
            { name: 'DeepSeek V3', icon: '🔮', tag: 'Code' },
            { name: 'Grok 4', icon: '⚡', tag: 'Real-time' },
            { name: 'Llama 4', icon: '🦙', tag: 'Open' },
          ].map((model) => (
            <div key={model.name} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-emerald-500/10 transition-colors cursor-pointer">
              <span className="text-lg">{model.icon}</span>
              <div>
                <div className="text-xs text-white font-medium">{model.name}</div>
                <div className="text-xs text-emerald-400">{model.tag}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Feature Showcase Component
const FeatureShowcase: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  highlights: string[];
  mockup: React.ReactNode;
  reverse?: boolean;
  delay?: number;
}> = ({ icon: Icon, title, description, gradient, highlights, mockup, reverse = false, delay = 0 }) => {
  const { ref, isVisible } = useScrollReveal(0.15);

  return (
    <section
      ref={ref}
      className={`py-16 px-4 relative overflow-hidden transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-emerald-500/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[350px] h-[350px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className={`grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${reverse ? 'lg:flex-row-reverse' : ''}`}>
          {/* Text Content */}
          <div className={reverse ? 'lg:order-2' : ''}>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6`}>
              <Icon className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase">{title}</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight tracking-tight">
              {title.split(' ')[0]}{' '}
              <span className="text-emerald-400">
                {title.split(' ').slice(1).join(' ') || 'Studio'}
              </span>
            </h2>

            <p className="text-lg text-white/60 leading-relaxed mb-6">
              {description}
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {highlights.map((highlight, idx) => (
                <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-white/80 text-sm">{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mockup */}
          <div className={`relative ${reverse ? 'lg:order-1' : ''}`}>
            <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full scale-75 opacity-50" />
            <div className="relative">
              {mockup}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const FeaturesPage: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const capabilities = [
    { icon: Brain, title: 'Smart Router', description: 'AI automatically routes to the best model for each task.' },
    { icon: Zap, title: 'Lightning Fast', description: 'Optimized infrastructure with sub-second responses.' },
    { icon: Shield, title: 'Secure & Private', description: 'Enterprise-grade encryption. You own everything.' },
    { icon: Wand2, title: 'Prompt Enhancer', description: 'One-click AI prompt enhancement.' },
    { icon: Layers, title: 'Project Storage', description: 'All creations auto-saved and organized.' },
    { icon: Globe, title: 'Multi-language', description: 'Create in 100+ languages.' },
  ];

  return (
    <div className="relative w-full min-h-screen text-white overflow-hidden">
      <MouseParticles />

      {/* Background */}
      <div className="fixed inset-0 bg-black">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-emerald-500/20 via-emerald-500/5 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-teal-600/5 rounded-full blur-[200px]" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)',
          }}
        />
      </div>

      {/* Hero Section */}
      <section className={`relative pt-36 pb-12 px-4 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-8">
            <Crown className="w-4 h-4 text-emerald-400" />
            <span className="text-emerald-400 text-sm font-bold tracking-wider">PREMIUM FEATURES</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-[1.1] tracking-tight">
            Everything You Need,{' '}
            <span className="text-emerald-400">
              One Platform
            </span>
          </h1>

          <p className="text-xl text-white/60 leading-relaxed max-w-3xl mx-auto mb-8">
            Stop paying for multiple AI subscriptions. KroniQ combines Chat, Image, Video, Music, Voice, and PPT generation — all with one unified token balance.
          </p>
        </div>
      </section>

      {/* Feature: Smart Router */}
      <FeatureShowcase
        icon={Brain}
        title="Smart Router"
        description="KroniQ's Smart Router automatically selects the optimal AI model for every task. It analyzes your prompt and routes to the best-performing model — whether that's GPT-5.2 for code, Claude for writing, or Gemini for analysis. You get the best results without choosing manually."
        gradient="from-emerald-500 to-teal-500"
        highlights={['70+ Top Models', 'Auto-Selection', 'Best Results', 'Token Optimized']}
        mockup={<SmartRouterMockup />}
        delay={0}
      />

      {/* Feature: Context Memory */}
      <FeatureShowcase
        icon={Database}
        title="Context Memory"
        description="No more repeating yourself. KroniQ remembers your project context, preferences, and past conversations. Whether you're building an app or running a business, the AI understands your background and maintains context across sessions."
        gradient="from-emerald-500 to-teal-500"
        highlights={['Persistent Memory', 'Project Context', 'Cross-Session', 'Smart Recall']}
        mockup={<ContextMemoryMockup />}
        reverse
        delay={100}
      />

      {/* Feature: Message to Image */}
      <FeatureShowcase
        icon={Wand2}
        title="Message to Image"
        description="Turn any text message into stunning images with one click. Describe what you want and KroniQ generates it using FLUX Pro, DALL-E 3, or Imagen 4 Ultra. No switching apps, no complex workflows — just describe and create."
        gradient="from-emerald-500 to-teal-500"
        highlights={['1-Click Generation', 'FLUX Pro', 'DALL-E 3', 'Up to 4K']}
        mockup={<MessageToImageMockup />}
        delay={200}
      />

      {/* Feature: Quick Adjustments */}
      <FeatureShowcase
        icon={ArrowUpDown}
        title="Shorter or Longer"
        description="Don't like the response length? Click 'Shorter' or 'Longer' to instantly adjust without re-prompting. Regenerate with different tones, expand on specific sections, or get a quick summary — all with single-click controls."
        gradient="from-emerald-500 to-teal-500"
        highlights={['1-Click Adjust', 'Instant Regen', 'Tone Control', 'No Re-prompting']}
        mockup={<LengthControlMockup />}
        reverse
        delay={300}
      />

      {/* Feature: Top Models */}
      <FeatureShowcase
        icon={Bot}
        title="Newest Top Models"
        description="Access the world's most powerful AI models the moment they release. GPT-5.2, Claude Sonnet 4, Gemini 2.5 Pro, DeepSeek V3, Grok 4 — we add the newest models weekly so you always have cutting-edge AI at your fingertips."
        gradient="from-emerald-500 to-teal-500"
        highlights={['GPT-5.2', 'Claude 4', 'Gemini 2.5', 'Weekly Updates']}
        mockup={<TopModelsMockup />}
        delay={400}
      />

      {/* ===== BUSINESS PANEL SECTION ===== */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Glowing orbs */}
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-teal-500/8 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute top-1/2 left-0 w-[350px] h-[350px] bg-cyan-500/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-6">
              <Briefcase className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-bold tracking-wider">PREMIUM EXCLUSIVE</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Business <span className="text-emerald-400">Panel</span>
            </h2>
            <p className="text-xl text-white/60 max-w-3xl mx-auto">
              Your intelligent business assistant that actually understands your company and gets work done — not just answers questions.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">
                Like Notion + Strategic Advisor + Research Assistant — Powered by AI
              </h3>

              <div className="space-y-4">
                {[
                  { icon: Database, title: 'Remembers Business Context', desc: 'Brand, priorities, market, strategies — permanently stored' },
                  { icon: Target, title: 'Natural Language Tasking', desc: '"By 6PM, prepare a competitive analysis of X" — just ask' },
                  { icon: LineChart, title: 'Goals & Progress Tracking', desc: 'Short-term, mid-term, long-term goals with AI guidance' },
                  { icon: Users, title: 'Competitor Intelligence', desc: 'Automated research, pricing analysis, customer sentiment' },
                  { icon: FileText, title: 'Deliverables in One Place', desc: 'Plans, reports, dashboards, branding assets — all connected' },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-colors">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">{item.title}</div>
                      <div className="text-white/60 text-sm">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <BusinessPanelMockup />
          </div>

          {/* Example tasks */}
          <div className="glass-panel rounded-2xl border border-white/10 p-6 bg-[#0d1117]/80">
            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              Example Business Tasks You Can Ask
            </h4>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { cat: '🚀 Planning', tasks: ['Create a GTM strategy for next month', 'Outline a sales funnel for enterprise'] },
                { cat: '📊 Research', tasks: ['Find top 10 competitors globally', 'Summarize customer reviews for X'] },
                { cat: '📅 Execution', tasks: ['By 6PM, draft a press release', 'Make content calendar for Q2'] },
              ].map((group, i) => (
                <div key={i} className="space-y-2">
                  <div className="text-emerald-400 font-semibold text-sm">{group.cat}</div>
                  {group.tasks.map((task, j) => (
                    <div key={j} className="text-white/70 text-sm p-2 bg-white/5 rounded-lg">"{task}"</div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Grid */}
      <section className="relative py-16 px-4 overflow-hidden">
        {/* Glowing orbs */}
        <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-green-500/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-[380px] h-[380px] bg-emerald-500/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
              Powerful <span className="text-emerald-400">Capabilities</span>
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Built-in features that make AI creation effortless
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {capabilities.map((cap, idx) => {
              const Icon = cap.icon;
              return (
                <div
                  key={idx}
                  className="glass-panel rounded-xl p-5 border border-white/10 hover:border-emerald-500/30 transition-all duration-300 group cursor-pointer hover:shadow-lg hover:shadow-emerald-500/10"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform border border-emerald-500/20">
                      <Icon className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">{cap.title}</h4>
                      <p className="text-white/60 text-sm leading-relaxed">{cap.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
};

export default FeaturesPage;
