import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare, Image as ImageIcon, Video, Music, Mic, Palette,
  ArrowRight, Check, Sparkles, Zap, Star, Crown, Play, Gem,
  Bot, Wand2, Layers, FileText,
  LucideIcon, Coins, Brain, ChevronDown,
  Quote, Lock, Globe, Headphones, Award, TrendingUp,
  Rocket, CheckCircle2, MousePointer, CreditCard,
  Database, ArrowUpDown, RefreshCw, Shield
} from 'lucide-react';

import { getTokenPacks, getTotalTokens } from '../../lib/subscriptionManagementService';
import { trackPageVisit, trackGetStartedClick, trackEvent } from '../../lib/analyticsService';
import { PageMeta } from '../SEO/PageMeta';
import { supabase } from '../../lib/supabaseClient';

interface HomePageProps {
  onGetStarted: () => void;
}

// Scroll-triggered animation hook
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

// AI Model Icon Badge
const AIModelBadge: React.FC<{ icon: string; name: string; color: string }> = ({ icon, name, color }) => (
  <div className={`flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10 hover:border-${color}-500/30 hover:bg-white/10 transition-all cursor-default group`}>
    <span className="text-lg group-hover:scale-110 transition-transform">{icon}</span>
    <span className="text-white/60 text-sm font-medium">{name}</span>
  </div>
);

// Glowing Showcase Section Component
interface ShowcaseSectionProps {
  badge?: { icon: React.ReactNode; text: string };
  headline: string;
  highlightedText: string;
  description: string;
  benefits: string[];
  mockup: React.ReactNode;
  glowColor: string;
  reverse?: boolean;
  modelIcons?: { icon: string; name: string }[];
}

const ShowcaseSection: React.FC<ShowcaseSectionProps> = ({
  badge,
  headline,
  highlightedText,
  description,
  benefits,
  mockup,
  glowColor,
  reverse = false,
  modelIcons,
}) => {
  const { ref, isVisible } = useScrollReveal(0.15);

  return (
    <section
      ref={ref}
      className={`py-24 px-6 lg:px-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
    >
      <div className="max-w-[1200px] mx-auto">
        <div className={`grid lg:grid-cols-2 gap-16 items-center ${reverse ? 'lg:flex-row-reverse' : ''}`}>
          {/* Text Content */}
          <div className={reverse ? 'lg:order-2' : ''}>
            {/* Model icons strip */}
            {modelIcons && (
              <div className="flex flex-wrap gap-2 mb-6">
                {modelIcons.map((m) => (
                  <AIModelBadge key={m.name} icon={m.icon} name={m.name} color={glowColor} />
                ))}
              </div>
            )}

            {/* Badge */}
            {badge && (
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-${glowColor}-500/10 border border-${glowColor}-500/20 mb-6`}>
                {badge.icon}
                <span className={`text-${glowColor}-400 text-sm font-medium`}>{badge.text}</span>
              </div>
            )}

            {/* Headline */}
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
              {headline}{' '}
              <span className={`bg-gradient-to-r from-${glowColor}-400 to-${glowColor === 'teal' ? 'emerald' : glowColor === 'cyan' ? 'blue' : glowColor === 'pink' ? 'rose' : 'cyan'}-400 bg-clip-text text-transparent`}>
                {highlightedText}
              </span>
            </h2>

            <p className="text-lg text-white/50 mb-8 leading-relaxed">
              {description}
            </p>

            {/* Benefits */}
            <ul className="space-y-4">
              {benefits.map((benefit) => (
                <li key={benefit} className="flex items-center gap-3 text-white/70">
                  <div className={`w-5 h-5 rounded-full bg-${glowColor}-500/20 flex items-center justify-center flex-shrink-0`}>
                    <Check className={`w-3 h-3 text-${glowColor}-400`} />
                  </div>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          {/* Mockup with Glow */}
          <div className={`relative ${reverse ? 'lg:order-1' : ''}`}>
            {/* Glowing light behind mockup */}
            <div
              className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] rounded-full blur-[100px] opacity-30`}
              style={{
                background: glowColor === 'teal' ? 'radial-gradient(circle, rgba(20,184,166,0.4) 0%, transparent 70%)' :
                  glowColor === 'cyan' ? 'radial-gradient(circle, rgba(6,182,212,0.4) 0%, transparent 70%)' :
                    glowColor === 'pink' ? 'radial-gradient(circle, rgba(236,72,153,0.4) 0%, transparent 70%)' :
                      glowColor === 'purple' ? 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)' :
                        glowColor === 'orange' ? 'radial-gradient(circle, rgba(249,115,22,0.4) 0%, transparent 70%)' :
                          glowColor === 'green' ? 'radial-gradient(circle, rgba(34,197,94,0.4) 0%, transparent 70%)' :
                            'radial-gradient(circle, rgba(20,184,166,0.4) 0%, transparent 70%)'
              }}
            />
            <div className="relative z-10">
              {mockup}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Smart Select Mockup - Updated to remove model names
const SmartSelectMockup: React.FC = () => (
  <div className="bg-[#0d0d15] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
    {/* Browser bar */}
    <div className="flex items-center justify-between px-4 py-3 bg-[#080810] border-b border-white/5">
      <div className="flex gap-1.5">
        <div className="w-3 h-3 rounded-full bg-red-500/70" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
        <div className="w-3 h-3 rounded-full bg-green-500/70" />
      </div>
      <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
        <Brain className="w-3 h-3 text-emerald-400" />
        <span className="text-emerald-400 text-xs font-medium">Smart Router</span>
      </div>
    </div>

    {/* Chat area */}
    <div className="p-4 space-y-4">
      <div className="flex justify-start">
        <div className="bg-white/5 rounded-xl px-4 py-3 max-w-[85%] border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">KroniQ AI</span>
          </div>
          <p className="text-white/70 text-sm">For creative writing tasks, I'll maintain narrative consistency...</p>
        </div>
      </div>
      <div className="flex justify-end">
        <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl px-4 py-3 border border-emerald-500/20">
          <p className="text-white text-sm">Now write me a Python script</p>
        </div>
      </div>
      <div className="flex justify-start">
        <div className="bg-white/5 rounded-xl px-4 py-3 max-w-[85%] border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Optimized for Code</span>
          </div>
          <p className="text-white/70 text-sm">Here's an optimized Python script with best practices...</p>
        </div>
      </div>
    </div>
  </div>
);

// Image Gallery Mockup - Updated to remove model names
const ImageGalleryMockup: React.FC = () => (
  <div className="relative">
    <div className="grid grid-cols-2 gap-3">
      {[
        { image: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=400&h=400&fit=crop', label: 'Fantasy Art' },
        { image: 'https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?w=400&h=400&fit=crop', label: 'Cyberpunk' },
        { image: 'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=400&h=400&fit=crop', label: 'Abstract' },
        { image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=400&fit=crop', label: 'Nature' },
      ].map((img, idx) => (
        <div
          key={idx}
          className="aspect-square rounded-xl overflow-hidden flex items-end p-3 shadow-lg hover:scale-105 transition-transform cursor-pointer relative group"
          style={{ backgroundImage: `url(${img.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <span className="relative text-white text-xs font-medium bg-emerald-500/80 px-2 py-1 rounded-lg backdrop-blur-sm">{img.label}</span>
        </div>
      ))}
    </div>
    {/* Floating badges - Updated */}
    <div className="absolute -top-4 -right-4 flex items-center gap-2 px-3 py-2 rounded-full bg-[#0d0d15]/90 border border-emerald-500/30 backdrop-blur-xl shadow-lg animate-float">
      <Wand2 className="w-4 h-4 text-emerald-400" />
      <span className="text-white text-xs font-medium">AI Generated</span>
    </div>
    <div className="absolute -bottom-4 -left-4 flex items-center gap-2 px-3 py-2 rounded-full bg-[#0d0d15]/90 border border-emerald-500/30 backdrop-blur-xl shadow-lg animate-float" style={{ animationDelay: '1s' }}>
      <Sparkles className="w-4 h-4 text-emerald-400" />
      <span className="text-white text-xs font-medium">Up to 4K</span>
    </div>
  </div>
);

// Video & Music Mockup - Updated to remove model names
const VideoMusicMockup: React.FC = () => (
  <div className="space-y-4">
    {/* Video preview */}
    <div className="bg-[#0d0d15] rounded-2xl border border-white/10 overflow-hidden">
      <div className="aspect-video bg-gradient-to-br from-emerald-900/50 to-teal-900/50 flex items-center justify-center relative">
        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 cursor-pointer hover:scale-110 transition-transform">
          <Play className="w-6 h-6 text-white ml-1" />
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/50 backdrop-blur-sm">
          <Video className="w-3 h-3 text-emerald-400" />
          <span className="text-white text-xs">AI Video</span>
        </div>
      </div>
    </div>

    {/* Music waveform */}
    <div className="bg-[#0d0d15] rounded-xl border border-white/10 p-4">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
          <Music className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-end gap-0.5 h-8">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-teal-500 to-cyan-400 rounded-full animate-pulse"
                style={{
                  height: `${Math.random() * 100}%`,
                  animationDelay: `${i * 50}ms`
                }}
              />
            ))}
          </div>
        </div>
        <span className="text-white/50 text-xs">Suno AI</span>
      </div>
    </div>
  </div>
);

// Token Flow Visualization
const TokenFlowMockup: React.FC = () => (
  <div className="relative">
    {/* Central token */}
    <div className="flex flex-col items-center">
      <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/30 mb-8">
        <Coins className="w-12 h-12 text-white" />
      </div>
      <span className="text-white font-bold text-xl mb-2">One Token Balance</span>
      <span className="text-white/50 text-sm">Works everywhere</span>
    </div>

    {/* Studios around */}
    <div className="grid grid-cols-3 gap-4 mt-8">
      {[
        { icon: MessageSquare, label: 'Chat', color: 'purple' },
        { icon: ImageIcon, label: 'Images', color: 'pink' },
        { icon: Video, label: 'Video', color: 'orange' },
        { icon: Music, label: 'Music', color: 'green' },
        { icon: Mic, label: 'Voice', color: 'blue' },
        { icon: FileText, label: 'PPT', color: 'violet' },
      ].map((studio) => (
        <div key={studio.label} className="flex flex-col items-center p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
          <studio.icon className={`w-6 h-6 text-${studio.color}-400 mb-2`} />
          <span className="text-white/70 text-xs">{studio.label}</span>
        </div>
      ))}
    </div>
  </div>
);

// PPT Showcase Mockup
const PPTShowcaseMockup: React.FC = () => (
  <div className="relative">
    <div className="bg-[#0d0d15] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#080810] border-b border-white/5">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
        </div>
        <span className="text-white/40 text-xs ml-2">AI Marketing Strategy.pptx</span>
      </div>

      {/* Slides preview */}
      <div className="p-4 grid grid-cols-3 gap-3">
        {[
          { bg: 'from-purple-600 to-pink-600', title: 'Title Slide' },
          { bg: 'from-blue-600 to-cyan-600', title: 'Key Points' },
          { bg: 'from-orange-600 to-red-600', title: 'Charts' },
        ].map((slide, idx) => (
          <div key={idx} className={`aspect-video rounded-lg bg-gradient-to-br ${slide.bg} p-2 flex flex-col justify-between`}>
            <div className="w-3/4 h-2 bg-white/30 rounded" />
            <div className="space-y-1">
              <div className="w-full h-1.5 bg-white/20 rounded" />
              <div className="w-2/3 h-1.5 bg-white/20 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Floating badge */}
    <div className="absolute -top-3 -right-3 flex items-center gap-2 px-3 py-2 rounded-full bg-[#0d0d15]/90 border border-violet-500/30 backdrop-blur-xl shadow-lg animate-float">
      <FileText className="w-4 h-4 text-violet-400" />
      <span className="text-white text-xs font-medium">AI Generated</span>
    </div>
  </div>
);

// How It Works Card - Premium Teal Theme
interface HowItWorksCardProps {
  step: string;
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}

const HowItWorksCard: React.FC<HowItWorksCardProps> = ({ step, icon: Icon, title, description, color }) => {
  const { ref, isVisible } = useScrollReveal(0.2);

  return (
    <div
      ref={ref}
      className={`group relative transition-all duration-700 hover:-translate-y-2 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
    >
      {/* Animated glow behind card on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />

      <div className="relative p-8 rounded-2xl bg-gradient-to-b from-white/[0.05] to-[#0a0a0f] border border-white/10 group-hover:border-teal-500/30 transition-all duration-500">
        {/* Top border shimmer */}
        <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl overflow-hidden">
          <div className="h-full bg-gradient-to-r from-transparent via-teal-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Step number */}
        <div className="absolute -top-4 left-8 px-4 py-1.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-sm font-bold shadow-lg shadow-teal-500/30">
          {step}
        </div>

        {/* Icon with hover animation */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/10 border border-teal-500/20 group-hover:border-teal-400/40 flex items-center justify-center mb-6 mt-2 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-lg group-hover:shadow-teal-500/20">
          <Icon className="w-8 h-8 text-teal-400" />
        </div>

        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-teal-100 transition-colors">{title}</h3>
        <p className="text-white/50 leading-relaxed group-hover:text-white/60 transition-colors">{description}</p>
      </div>
    </div>
  );
};

// Testimonial Card - Premium Teal Theme
interface TestimonialCardProps {
  name: string;
  role: string;
  avatar: string;
  quote: string;
  rating: number;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ name, role, avatar, quote, rating }) => {
  const { ref, isVisible } = useScrollReveal(0.2);

  return (
    <div
      ref={ref}
      className={`group relative transition-all duration-700 hover:-translate-y-2 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
    >
      {/* Animated glow behind card on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500/15 to-cyan-500/15 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500" />

      <div className="relative p-6 rounded-2xl bg-gradient-to-b from-white/[0.05] to-[#0a0a0f] border border-white/10 group-hover:border-teal-500/30 transition-all duration-500">
        {/* Top border shimmer */}
        <div className="absolute top-0 left-0 right-0 h-[1px] rounded-t-2xl overflow-hidden">
          <div className="h-full bg-gradient-to-r from-transparent via-teal-400/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Stars */}
        <div className="flex gap-1 mb-4">
          {Array.from({ length: rating }).map((_, i) => (
            <Star key={i} className="w-4 h-4 text-teal-400 fill-teal-400 group-hover:text-cyan-400 group-hover:fill-cyan-400 transition-colors" />
          ))}
        </div>

        {/* Quote */}
        <p className="text-white/70 leading-relaxed mb-6 text-sm group-hover:text-white/80 transition-colors">"{quote}"</p>

        {/* Author */}
        <div className="flex items-center gap-3">
          <span className="text-3xl">{avatar}</span>
          <div>
            <div className="text-white font-semibold text-sm group-hover:text-teal-100 transition-colors">{name}</div>
            <div className="text-white/40 text-xs group-hover:text-white/50 transition-colors">{role}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// FAQ Item - Premium Teal Theme
interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="group relative transition-all duration-500 hover:-translate-y-1">
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-teal-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-500" />

      <div className="relative rounded-xl bg-gradient-to-b from-white/[0.05] to-[#0a0a0f] border border-white/10 group-hover:border-teal-500/30 overflow-hidden transition-all duration-500">
        {/* Top border shimmer */}
        <div className="absolute top-0 left-0 right-0 h-[1px] overflow-hidden">
          <div className="h-full bg-gradient-to-r from-transparent via-teal-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-colors"
        >
          <span className="text-white font-medium group-hover:text-teal-100 transition-colors">{question}</span>
          <ChevronDown className={`w-5 h-5 text-white/50 group-hover:text-teal-400 transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        <div className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
          <p className="px-5 pb-5 text-white/60 leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
};

// Animated Stat Card - Premium Teal Theme
interface AnimatedStatCardProps {
  value: number;
  suffix: string;
  label: string;
  icon: LucideIcon;
}

const AnimatedStatCard: React.FC<AnimatedStatCardProps> = ({ value, suffix, label, icon: Icon }) => {
  const [count, setCount] = useState(0);
  const { ref, isVisible } = useScrollReveal();

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isVisible, value]);

  return (
    <div
      ref={ref}
      className="group text-center transition-all duration-500 hover:-translate-y-1"
    >
      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/20 group-hover:border-teal-400/40 flex items-center justify-center mx-auto mb-4 transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-teal-500/20">
        <Icon className="w-7 h-7 text-teal-400" />
      </div>
      <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-2 transition-all duration-300 group-hover:from-teal-300 group-hover:to-cyan-300">
        {count}{suffix}
      </div>
      <div className="text-white/50 text-sm group-hover:text-white/70 transition-colors">{label}</div>
    </div>
  );
};

// Feature Card - Premium Style Matching Pricing Cards
interface FeatureCardProps {
  imageSrc: string;
  title: string;
  description: string;
  gradient: string;
  stats: string;
  delay: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ imageSrc, title, description, gradient, stats, delay }) => {
  const { ref, isVisible } = useScrollReveal(0.2);

  return (
    <div
      ref={ref}
      className={`group relative transition-all duration-700 hover:-translate-y-2 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Animated glow behind card on hover */}
      <div className={`absolute inset-0 rounded-2xl transition-all duration-500 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-20 blur-xl`} />

      {/* Card content */}
      <div className="relative rounded-2xl p-8 bg-gradient-to-b from-white/[0.05] to-[#0a0a0f] border border-white/10 group-hover:border-white/25 transition-all duration-500 overflow-hidden">
        {/* Glowing top border animation */}
        <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl overflow-hidden">
          <div className="h-full bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer transition-opacity duration-500" />
        </div>

        {/* Stats badge */}
        <div className="absolute top-6 right-6">
          <span className="text-xs text-white/50 bg-white/[0.08] px-3 py-1.5 rounded-full border border-white/10 group-hover:border-white/20 group-hover:bg-white/[0.12] transition-all duration-300">{stats}</span>
        </div>

        {/* AI Generated Image with hover animation */}
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg group-hover:shadow-xl overflow-hidden`}
          style={{ boxShadow: `0 0 20px rgba(20, 184, 166, 0.2)` }}
        >
          <img src={imageSrc} alt={title} className="w-10 h-10 object-contain" />
        </div>

        {/* Title with hover glow */}
        <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-white transition-colors">{title}</h3>

        {/* Description */}
        <p className="text-white/50 leading-relaxed group-hover:text-white/60 transition-colors">{description}</p>
      </div>
    </div>
  );
};

// Premium Pricing Card - AI Fiesta Style with Teal Theme
interface PricingCardProps {
  pack: any;
  index: number;
  onGetStarted: () => void;
}

const PricingCard: React.FC<PricingCardProps> = ({ pack, index, onGetStarted }) => {
  const { ref, isVisible } = useScrollReveal(0.2);
  // Use Stripe tier images instead of Lucide icons
  const tierImages = ['/stripe-starter.png', '/stripe-pro.png', '/stripe-premium.png'];
  const tierImage = tierImages[index] || '/stripe-starter.png';
  const totalTokens = getTotalTokens(pack.tokens, pack.bonusTokens);
  const isPopular = pack.popular;

  return (
    <div
      ref={ref}
      className={`group relative transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        } hover:-translate-y-2`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Popular Badge - Outside the card for proper visibility */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
          <span className="px-5 py-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-teal-500/40 animate-pulse">
            Most Popular
          </span>
        </div>
      )}

      {/* Animated glow behind card on hover */}
      <div className={`absolute inset-0 rounded-2xl transition-all duration-500 ${isPopular
        ? 'bg-gradient-to-r from-teal-500/30 via-cyan-500/30 to-teal-500/30 opacity-60 group-hover:opacity-100 blur-xl'
        : 'bg-white/5 opacity-0 group-hover:opacity-40 blur-lg'
        }`}
      />

      {/* Card content */}
      <div
        className={`relative rounded-2xl border transition-all duration-500 ${isPopular
          ? 'bg-gradient-to-b from-[#0a1a1f] to-[#080d10] border-teal-500/50 group-hover:border-teal-400/70 pt-10 pb-8 px-8'
          : 'bg-gradient-to-b from-white/[0.04] to-[#0a0a0f] border-white/10 group-hover:border-white/25 p-8'
          }`}
      >
        {/* Glowing top border animation */}
        <div className={`absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl overflow-hidden ${isPopular ? '' : ''}`}>
          <div className={`h-full ${isPopular
            ? 'bg-gradient-to-r from-transparent via-teal-400 to-transparent animate-shimmer'
            : 'bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:animate-shimmer'
            }`}
          />
        </div>

        {/* Tier Image with hover animation */}
        <div
          className={`w-14 h-14 rounded-xl mb-6 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 overflow-hidden ${isPopular
            ? 'bg-gradient-to-br from-teal-500/20 to-cyan-500/20 shadow-lg shadow-teal-500/30 group-hover:shadow-teal-400/50'
            : 'bg-white/[0.08] border border-white/10 group-hover:bg-white/[0.12] group-hover:border-white/20'
            }`}
        >
          <img src={tierImage} alt={pack.name} className="w-10 h-10 object-contain" />
        </div>

        {/* Plan Name with glow on popular */}
        <h3 className={`text-2xl font-bold mb-2 ${isPopular
          ? 'text-white drop-shadow-[0_0_10px_rgba(45,212,191,0.3)]'
          : 'text-white'
          }`}>{pack.name}</h3>

        {/* Price with animated counter feel */}
        <div className="mb-6 flex items-baseline gap-2">
          <span className={`text-5xl font-bold transition-all duration-300 ${isPopular
            ? 'text-white group-hover:text-teal-200'
            : 'text-white group-hover:text-white/90'
            }`}>
            ${pack.priceUsd}
          </span>
          <span className="text-white/40 text-sm">/month</span>
        </div>

        {/* Token Amount - Enhanced Box */}
        <div className={`mb-8 p-5 rounded-xl transition-all duration-500 ${isPopular
          ? 'bg-gradient-to-r from-teal-500/15 to-cyan-500/15 border border-teal-500/30 group-hover:from-teal-500/25 group-hover:to-cyan-500/25 group-hover:border-teal-400/50'
          : 'bg-white/[0.04] border border-white/10 group-hover:bg-white/[0.08] group-hover:border-white/20'
          }`}>
          <div className={`text-4xl font-bold mb-1 transition-all duration-300 ${isPopular
            ? 'bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent group-hover:from-teal-200 group-hover:to-cyan-200'
            : 'text-white group-hover:text-white/90'
            }`}>
            {totalTokens >= 1000000 ? `${(totalTokens / 1000000).toFixed(0)}M` : `${(totalTokens / 1000).toFixed(0)}K`}
          </div>
          <div className="text-white/50 text-sm">tokens included</div>
        </div>

        {/* Features with staggered animation on hover */}
        <ul className="space-y-4 mb-8">
          {['All 70+ AI models', 'Tokens never expire', 'All 6 studios included'].map((f, i) => (
            <li
              key={f}
              className="flex items-center gap-3 text-white/70 text-sm transition-all duration-300 group-hover:translate-x-1"
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isPopular
                ? 'bg-teal-500/20 group-hover:bg-teal-500/30'
                : 'bg-white/10 group-hover:bg-white/15'
                }`}>
                <Check className={`w-3 h-3 ${isPopular ? 'text-teal-400' : 'text-white/70'}`} />
              </div>
              <span className="group-hover:text-white/90 transition-colors">{f}</span>
            </li>
          ))}
        </ul>

        {/* Premium Pill Button - AI Fiesta Style */}
        <button
          onClick={() => {
            trackEvent({ eventType: 'button_click', eventName: 'pricing_get_started', eventData: { pack: pack.name }, pageName: 'home' });
            onGetStarted();
          }}
          className="group/btn relative w-full py-4 rounded-full font-semibold text-base transition-all duration-500 overflow-hidden flex items-center justify-center gap-2 text-white hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: isPopular
              ? 'linear-gradient(90deg, rgba(15, 23, 30, 0.9) 0%, rgba(20, 184, 166, 0.9) 35%, rgba(45, 212, 191, 1) 50%, rgba(20, 184, 166, 0.9) 65%, rgba(15, 23, 30, 0.9) 100%)'
              : 'linear-gradient(90deg, rgba(15, 23, 30, 0.8) 0%, rgba(128, 128, 128, 0.5) 35%, rgba(180, 180, 180, 0.6) 50%, rgba(128, 128, 128, 0.5) 65%, rgba(15, 23, 30, 0.8) 100%)',
            border: isPopular ? '1px solid rgba(45, 212, 191, 0.4)' : '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: isPopular
              ? '0 0 30px rgba(20, 184, 166, 0.4), inset 0 0 20px rgba(20, 184, 166, 0.1)'
              : '0 0 15px rgba(255, 255, 255, 0.05)'
          }}
        >
          {/* Animated glow overlay on hover */}
          <span
            className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"
            style={{
              background: isPopular
                ? 'linear-gradient(90deg, rgba(15, 23, 30, 0.8) 0%, rgba(45, 212, 191, 1) 35%, rgba(94, 234, 212, 1) 50%, rgba(45, 212, 191, 1) 65%, rgba(15, 23, 30, 0.8) 100%)'
                : 'linear-gradient(90deg, rgba(15, 23, 30, 0.7) 0%, rgba(200, 200, 200, 0.7) 35%, rgba(255, 255, 255, 0.8) 50%, rgba(200, 200, 200, 0.7) 65%, rgba(15, 23, 30, 0.7) 100%)',
              boxShadow: isPopular
                ? '0 0 50px rgba(45, 212, 191, 0.6), 0 0 100px rgba(20, 184, 166, 0.4)'
                : '0 0 30px rgba(255, 255, 255, 0.2)'
            }}
          />
          {/* Shine sweep effect */}
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out" />
          <span className="relative drop-shadow-lg">Get Started</span>
          <ArrowRight className="relative w-4 h-4 group-hover/btn:translate-x-1 transition-transform drop-shadow-lg" />
        </button>
      </div>
    </div>
  );
};

export const HomePage: React.FC<HomePageProps> = ({ onGetStarted }) => {
  const [mounted, setMounted] = useState(false);
  const [tokenPacks, setTokenPacks] = useState<any[]>([]);
  const [liveStats, setLiveStats] = useState({ totalUsers: 100, totalGenerations: 500 }); // Default fallback values

  useEffect(() => {
    setMounted(true);
    loadTokenPacks();
    loadLiveStats();
    trackPageVisit({ pageName: 'home' });
  }, []);

  const loadTokenPacks = async () => {
    const packs = await getTokenPacks();
    setTokenPacks(packs);
  };

  const loadLiveStats = async () => {
    try {
      // Fetch total users from profiles table
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch total generations from daily_usage table
      const { data: usageData } = await supabase
        .from('daily_usage')
        .select('count');

      const totalGenerations = usageData?.reduce((acc: number, curr: any) => acc + (curr.count || 0), 0) || 0;

      setLiveStats({
        totalUsers: userCount || 100,
        totalGenerations: totalGenerations || 500
      });
    } catch (error) {
      console.error('Error loading live stats:', error);
      // Keep default values on error
    }
  };

  const features = [
    { imageSrc: '/studio-chat.png', title: 'Multi-Model Chat', description: 'Access 70+ AI models through one unified interface.', gradient: 'from-emerald-500 to-teal-600', stats: '70+ Models' },
    { imageSrc: '/studio-image.png', title: 'AI Image Generation', description: 'Create stunning visuals with cutting-edge AI.', gradient: 'from-emerald-500 to-teal-600', stats: 'Unlimited' },
    { imageSrc: '/studio-video.png', title: 'Video Creation', description: 'Generate videos with the latest AI technology.', gradient: 'from-emerald-500 to-teal-600', stats: '4K Quality' },
    { imageSrc: '/studio-music.png', title: 'Music Studio', description: 'Compose original music and soundtracks with AI.', gradient: 'from-emerald-500 to-teal-600', stats: 'Any Genre' },
    { imageSrc: '/studio-voice.png', title: 'Text to Speech', description: 'Natural voice synthesis with 50+ voices.', gradient: 'from-emerald-500 to-teal-600', stats: '50+ Voices' },
    { imageSrc: '/cap-enhancer.png', title: 'PPT Generator', description: 'Create professional presentations with AI-designed slides.', gradient: 'from-emerald-500 to-teal-600', stats: 'Templates' },
  ];

  // AI Provider logos with styled badges - Using feature names instead of model names
  const providers = [
    { name: 'Chat', color: 'emerald', icon: '💬' },
    { name: 'Image', color: 'emerald', icon: '🎨' },
    { name: 'Video', color: 'emerald', icon: '🎬' },
    { name: 'Music', color: 'emerald', icon: '🎵' },
    { name: 'Voice', color: 'emerald', icon: '🎙️' },
    { name: 'PPT', color: 'emerald', icon: '📊' },
  ];

  return (
    <div className="relative w-full min-h-screen">
      <PageMeta
        title="One Platform. 70+ AI Models."
        description="KroniQ AI - Stop juggling subscriptions. Get GPT-5.2, Claude, Gemini, and 70+ AI models for chat, images, video, and music in one platform."
        keywords="AI platform, ChatGPT alternative, AI chat, image generation, video AI, KroniQ"
      />

      {/* Background - Premium Dark with Teal Accent Lighting */}
      <div className="fixed inset-0 bg-[#030306]">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/10 via-transparent to-cyan-900/10" />
        <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-teal-600/8 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-cyan-600/8 rounded-full blur-[200px]" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)`,
            backgroundSize: '48px 48px'
          }}
        />
      </div>

      <div className="relative z-10">

        {/* ===== HERO SECTION - Exact AI Fiesta Clone ===== */}
        <section className="min-h-screen flex items-center px-6 lg:px-16 pt-24 pb-16 relative overflow-hidden">
          {/* Grid pattern background */}
          <div
            className="absolute inset-0 opacity-[0.12] pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                               linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }}
          />

          {/* Glowing teal orbs */}
          <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-[180px] pointer-events-none" />
          <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-cyan-500/8 rounded-full blur-[150px] pointer-events-none" />

          <div className="max-w-[1400px] mx-auto w-full relative z-10">
            <div className="grid lg:grid-cols-[1fr,1.3fr] gap-12 lg:gap-16 items-center">
              {/* Left Side: Text Content */}
              <div className={`${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
                {/* AI Provider Logo Strip - Using SVG logos */}
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                  {[
                    { name: 'GPT-4o', logo: '/logos/openai.svg' },
                    { name: 'Claude', logo: '/logos/anthropic.svg' },
                    { name: 'Gemini', logo: '/logos/google.svg' },
                    { name: 'Llama', logo: '/logos/meta.svg' },
                    { name: 'DALL-E', logo: '/logos/dalle.svg' },
                    { name: 'Sora', logo: '/logos/sora.svg' },
                  ].map((provider) => (
                    <div
                      key={provider.name}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 hover:border-teal-500/30 hover:bg-white/10 transition-all cursor-default group"
                    >
                      <img src={provider.logo} alt={provider.name} className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" style={{ filter: 'invert(1)' }} />
                      <span className="text-white/50 text-xs font-medium group-hover:text-white/70 transition-colors">{provider.name}</span>
                    </div>
                  ))}
                  <span className="text-white/30 text-xs">+64 more</span>
                </div>

                {/* Main Headline - "70+ AI Models. 6 Creative Studios. One Platform." */}
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4.2rem] font-bold text-white leading-[1.1] mb-2 tracking-tight">
                  70+ AI Models.
                </h1>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4.2rem] font-bold text-white leading-[1.1] mb-2 tracking-tight">
                  6 <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400">Creative</span> Studios.
                </h1>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4.2rem] font-bold text-white leading-[1.1] mb-3 tracking-tight">
                  One Platform.
                </h1>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium mb-6 tracking-tight">
                  <span
                    className="bg-clip-text text-transparent animate-gradient-x italic"
                    style={{
                      backgroundImage: 'linear-gradient(90deg, #14b8a6, #06b6d4, #10b981, #14b8a6)',
                      backgroundSize: '300% 100%',
                      animation: 'gradient-shift 4s ease infinite',
                    }}
                  >
                    For the price of ChatGPT.
                  </span>
                </h2>

                {/* Killer Sub-Headline */}
                <p className="text-base lg:text-lg text-white/60 mb-8 max-w-xl leading-relaxed">
                  Chat, image, video, music, voice, and business intelligence — <span className="text-white font-medium">without switching tools</span>.
                </p>

                {/* CTA Buttons - Updated copy */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <button
                    onClick={() => { trackGetStartedClick('home_hero'); onGetStarted(); }}
                    className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-white text-base transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                    style={{
                      background: 'linear-gradient(90deg, rgba(15, 23, 30, 0.9) 0%, rgba(20, 184, 166, 0.8) 35%, rgba(45, 212, 191, 0.9) 50%, rgba(20, 184, 166, 0.8) 65%, rgba(15, 23, 30, 0.9) 100%)',
                      border: '1px solid rgba(45, 212, 191, 0.3)',
                      boxShadow: '0 0 20px rgba(20, 184, 166, 0.2), inset 0 0 20px rgba(20, 184, 166, 0.1)'
                    }}
                  >
                    {/* Animated glow overlay */}
                    <span
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: 'linear-gradient(90deg, rgba(15, 23, 30, 0.8) 0%, rgba(45, 212, 191, 1) 35%, rgba(94, 234, 212, 1) 50%, rgba(45, 212, 191, 1) 65%, rgba(15, 23, 30, 0.8) 100%)',
                        boxShadow: '0 0 40px rgba(45, 212, 191, 0.5), 0 0 80px rgba(20, 184, 166, 0.3)'
                      }}
                    />
                    {/* Shine sweep effect */}
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                    <span className="relative font-semibold drop-shadow-lg">Start Creating — Free</span>
                    <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform drop-shadow-lg" />
                  </button>

                  <button
                    onClick={() => window.location.href = '/pricing'}
                    className="group inline-flex items-center gap-2 px-6 py-4 rounded-full font-medium text-white/70 hover:text-white text-base transition-all duration-300 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20"
                  >
                    View All Models
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Social proof - Enhanced */}
                <div className="flex items-center gap-6 mb-4">
                  <div className="flex -space-x-2">
                    {['👨‍💻', '👩‍🎨', '👨‍🔬', '👩‍💼', '🧑‍🚀'].map((emoji, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-white/20 flex items-center justify-center text-sm">
                        {emoji}
                      </div>
                    ))}
                  </div>
                  <div className="text-sm">
                    <span className="text-white font-semibold">80,000+</span>
                    <span className="text-white/50 ml-1">creators</span>
                    <span className="text-white/30 mx-2">•</span>
                    <span className="text-white font-semibold">2M+</span>
                    <span className="text-white/50 ml-1">generations</span>
                    <span className="text-white/30 mx-2">•</span>
                    <span className="text-white/50">Rated </span>
                    <span className="text-yellow-400">4.9★</span>
                  </div>
                </div>

                {/* Trust indicators */}
                <div className="flex items-center gap-6 text-xs text-white/40">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-teal-400" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-teal-400" />
                    <span>Enterprise-grade security</span>
                  </div>
                </div>

                {/* Logo compatibility disclaimer */}
                <p className="text-[10px] text-white/20 mt-4 max-w-md">
                  *Logos shown for compatibility reference. KroniQ is not affiliated with these providers.
                </p>
              </div>


              {/* Right Side: Large Product Mockup - Visible on all devices, stacks on mobile */}
              <div className={`relative mt-12 lg:mt-0 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '200ms' }}>
                {/* Glow behind mockup */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-r from-emerald-600/15 via-teal-600/10 to-emerald-600/15 rounded-full blur-[80px] pointer-events-none" />

                {/* KroniQ AI Chat Mockup */}
                <div className="relative bg-[#0a0f12] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                  {/* Browser bar */}
                  <div className="flex items-center justify-between px-4 py-3 bg-[#060a0d] border-b border-white/5">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    {/* Smart Router Badge */}
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                      <Brain className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 text-xs font-medium">Smart Router Active</span>
                    </div>
                  </div>

                  {/* Chat conversation */}
                  <div className="p-4 space-y-4 min-h-[280px]">
                    {/* User message */}
                    <div className="flex justify-end">
                      <div className="bg-emerald-500/20 rounded-xl rounded-br-sm px-4 py-3 max-w-[75%] border border-emerald-500/20">
                        <p className="text-white text-sm">What's the best way to brew coffee at home?</p>
                      </div>
                    </div>

                    {/* AI Response */}
                    <div className="flex justify-start">
                      <div className="bg-white/5 rounded-xl rounded-bl-sm px-4 py-3 max-w-[85%] border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                          <img src="/logos/anthropic.svg" alt="Claude" className="w-3 h-3" style={{ filter: 'invert(1)' }} />
                          <span className="text-xs px-2 py-0.5 rounded bg-orange-500/20 text-orange-300">Claude 3.5</span>
                          <span className="text-[10px] text-white/30">via Smart Router</span>
                        </div>
                        <div className="text-white/70 text-sm space-y-2">
                          <p>Here are the key steps for great coffee:</p>
                          <ul className="space-y-1 ml-4">
                            <li>• Use fresh, quality beans</li>
                            <li>• Grind just before brewing</li>
                            <li>• Water at 195-205°F (not boiling)</li>
                            <li>• Use 1:15 coffee-to-water ratio</li>
                          </ul>
                        </div>
                        {/* Quick adjustment buttons */}
                        <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
                          <button className="px-3 py-1 rounded-lg bg-white/5 text-white/50 text-xs hover:bg-white/10 transition-colors">Shorter</button>
                          <button className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs border border-emerald-500/30">Longer</button>
                          <button className="px-3 py-1 rounded-lg bg-white/5 text-white/50 text-xs hover:bg-white/10 transition-colors">Regen</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input bar at bottom */}
                  <div className="px-4 py-3 border-t border-white/5 bg-[#060a0d]">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-white/5 rounded-lg px-3 py-2 text-white/30 text-sm">
                        Ask me anything...
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40">
                          📷
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40">
                          📎
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                          →
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== WHY KRONIQ EXISTS (Micro-Section) ===== */}
        <section className="py-8 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xl md:text-2xl text-white/40 font-light italic">
              "AI tools are fragmented. <span className="text-white/60">We unified them.</span>"
            </p>
          </div>
        </section>

        {/* ===== LIVE STATS SECTION ===== */}
        <section className="py-12 px-4 relative overflow-hidden">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Total Users */}
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-emerald-400">
                  {liveStats.totalUsers.toLocaleString()}+
                </div>
                <div className="text-sm text-white/50 mt-1">Happy Users</div>
              </div>
              {/* Total Generations */}
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-teal-400">
                  {liveStats.totalGenerations.toLocaleString()}+
                </div>
                <div className="text-sm text-white/50 mt-1">AI Creations</div>
              </div>
              {/* AI Models */}
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-cyan-400">70+</div>
                <div className="text-sm text-white/50 mt-1">AI Models</div>
              </div>
              {/* Studios */}
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-purple-400">8</div>
                <div className="text-sm text-white/50 mt-1">Creative Studios</div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== COMPETITOR COMPARISON SECTION ===== */}
        <section className="py-20 px-6 lg:px-16 relative overflow-hidden">
          {/* Grid pattern only on glow areas */}
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] opacity-30">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `linear-gradient(to right, rgba(20,184,166,0.15) 1px, transparent 1px),
                                   linear-gradient(to bottom, rgba(20,184,166,0.15) 1px, transparent 1px)`,
                  backgroundSize: '40px 40px',
                  maskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, black 30%, transparent 70%)'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 via-cyan-500/10 to-teal-500/10 blur-3xl" />
            </div>
          </div>

          <div className="max-w-6xl mx-auto relative z-10">
            {/* Badge */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 mb-6">
                <TrendingUp className="w-4 h-4 text-teal-400" />
                <span className="text-teal-400 text-sm font-medium">Why Switch to KroniQ?</span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                More Models. <span className="text-teal-400">Better Price.</span>
              </h2>
              <p className="text-white/60 text-lg max-w-2xl mx-auto">
                See how KroniQ compares to other AI aggregators
              </p>
            </div>

            {/* Comparison Table */}
            <div className="rounded-2xl border border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl overflow-hidden">
              {/* Header Row */}
              <div className="grid grid-cols-6 border-b border-white/10 bg-white/5">
                <div className="p-4 text-white/50 text-sm font-medium">Platform</div>
                <div className="p-4 text-white/50 text-sm font-medium text-center">AI Models</div>
                <div className="p-4 text-white/50 text-sm font-medium text-center">Free Tier</div>
                <div className="p-4 text-white/50 text-sm font-medium text-center">Pro Price</div>
                <div className="p-4 text-white/50 text-sm font-medium text-center">Video Gen</div>
                <div className="p-4 text-white/50 text-sm font-medium text-center">Music Gen</div>
              </div>

              {/* KroniQ Row - Highlighted */}
              <div className="grid grid-cols-6 border-b border-teal-500/30 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-400 to-cyan-400" />
                <div className="p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">K</div>
                  <div>
                    <div className="text-white font-semibold">KroniQ AI</div>
                    <div className="text-teal-400 text-xs">You are here ⭐</div>
                  </div>
                </div>
                <div className="p-4 text-center text-white font-bold">70+</div>
                <div className="p-4 text-center"><span className="px-2 py-1 rounded-full bg-teal-500/20 text-teal-400 text-sm">15K/day</span></div>
                <div className="p-4 text-center text-white font-bold">$12/mo</div>
                <div className="p-4 text-center"><Check className="w-5 h-5 text-teal-400 mx-auto" /></div>
                <div className="p-4 text-center"><Check className="w-5 h-5 text-teal-400 mx-auto" /></div>
              </div>

              {/* Magai Row */}
              <div className="grid grid-cols-6 border-b border-white/10 hover:bg-white/5 transition-colors">
                <div className="p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm">M</div>
                  <div className="text-white/80">Magai</div>
                </div>
                <div className="p-4 text-center text-white/70">50+</div>
                <div className="p-4 text-center"><span className="px-2 py-1 rounded-full bg-white/10 text-white/50 text-sm">Limited</span></div>
                <div className="p-4 text-center text-white/70">$19/mo</div>
                <div className="p-4 text-center text-white/30">—</div>
                <div className="p-4 text-center text-white/30">—</div>
              </div>

              {/* Abacus Row */}
              <div className="grid grid-cols-6 border-b border-white/10 hover:bg-white/5 transition-colors">
                <div className="p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">A</div>
                  <div className="text-white/80">Abacus AI</div>
                </div>
                <div className="p-4 text-center text-white/70">20+</div>
                <div className="p-4 text-center"><span className="px-2 py-1 rounded-full bg-white/10 text-white/50 text-sm">Trial</span></div>
                <div className="p-4 text-center text-white/70">$99/mo</div>
                <div className="p-4 text-center"><Check className="w-5 h-5 text-white/30 mx-auto" /></div>
                <div className="p-4 text-center text-white/30">—</div>
              </div>

              {/* AI Fiesta Row */}
              <div className="grid grid-cols-6 border-b border-white/10 hover:bg-white/5 transition-colors">
                <div className="p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 font-bold text-sm">F</div>
                  <div className="text-white/80">AI Fiesta</div>
                </div>
                <div className="p-4 text-center text-white/70">40+</div>
                <div className="p-4 text-center"><span className="px-2 py-1 rounded-full bg-white/10 text-white/50 text-sm">5 msg/day</span></div>
                <div className="p-4 text-center text-white/70">$15/mo</div>
                <div className="p-4 text-center"><Check className="w-5 h-5 text-white/30 mx-auto" /></div>
                <div className="p-4 text-center text-white/30">—</div>
              </div>

              {/* Monica Row */}
              <div className="grid grid-cols-6 hover:bg-white/5 transition-colors">
                <div className="p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400 font-bold text-sm">M</div>
                  <div className="text-white/80">Monica</div>
                </div>
                <div className="p-4 text-center text-white/70">10+</div>
                <div className="p-4 text-center"><span className="px-2 py-1 rounded-full bg-white/10 text-white/50 text-sm">30 msg/day</span></div>
                <div className="p-4 text-center text-white/70">$9/mo</div>
                <div className="p-4 text-center text-white/30">—</div>
                <div className="p-4 text-center text-white/30">—</div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-10">
              <button
                onClick={() => { trackEvent({ eventType: 'button_click', eventName: 'comparison_cta', eventData: {}, pageName: 'home' }); onGetStarted(); }}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold hover:from-teal-400 hover:to-cyan-400 transition-all hover:scale-105 shadow-lg shadow-teal-500/30"
              >
                Start Free — 15K Tokens/Day
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* ===== FEATURE: SMART ROUTER ===== */}
        <section className="py-20 px-4 relative overflow-hidden">

          {/* Glowing orbs */}
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-emerald-500/8 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Text Content */}
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                  <Brain className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase">Smart Router</span>
                </div>

                <h2 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight tracking-tight">
                  Introducing <span className="text-emerald-400">Smart Router</span>
                </h2>

                <p className="text-lg text-white/60 leading-relaxed mb-6">
                  KroniQ's Smart Router automatically selects the optimal AI model for every task. It analyzes your prompt and routes to the best-performing option — maximizing your tokens while delivering the best results.
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {['70+ Top Models', 'Auto-Selection', 'Best Results', 'Token Optimized'].map((highlight, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-white/80 text-sm">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mockup */}
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full scale-75 opacity-50" />
                <div className="relative glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
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
                        { task: 'Code Tasks', match: '94%', selected: true },
                        { task: 'Writing', match: '89%', selected: false },
                        { task: 'Analysis', match: '85%', selected: false },
                      ].map((m, i) => (
                        <div key={i} className={`flex items-center gap-3 p-2 rounded-lg ${m.selected ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-white/5'}`}>
                          <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center text-xs">
                            {m.selected ? '✓' : ''}
                          </div>
                          <div className="flex-1">
                            <div className={`text-sm ${m.selected ? 'text-white font-medium' : 'text-white/60'}`}>Best for {m.task}</div>
                          </div>
                          <div className={`text-xs ${m.selected ? 'text-emerald-400' : 'text-white/40'}`}>{m.match}</div>
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
            </div>
          </div>
        </section>

        {/* ===== FEATURE: CONTEXT MEMORY ===== */}
        <section className="py-20 px-4 relative overflow-hidden">
          {/* Glowing orbs */}
          <div className="absolute top-1/3 left-0 w-[350px] h-[350px] bg-cyan-500/8 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/8 rounded-full blur-[100px] pointer-events-none" />
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Mockup - Left side */}
              <div className="relative lg:order-1">
                <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full scale-75 opacity-50" />
                <div className="relative glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
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

              {/* Text Content - Right side */}
              <div className="lg:order-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase">Context Memory</span>
                </div>

                <h2 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight tracking-tight">
                  Context <span className="text-emerald-400">Memory</span>
                </h2>

                <p className="text-lg text-white/60 leading-relaxed mb-6">
                  No more repeating yourself. KroniQ remembers your project context, preferences, and past conversations. Whether you're building an app or running a business, the AI understands your background and maintains context across sessions.
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {['Persistent Memory', 'Project Context', 'Cross-Session', 'Smart Recall'].map((highlight, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-white/80 text-sm">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== FEATURE: MESSAGE TO IMAGE ===== */}
        <section className="py-20 px-4 relative overflow-hidden">
          {/* Glowing orbs */}
          <div className="absolute top-1/4 right-1/3 w-[450px] h-[450px] bg-teal-500/8 rounded-full blur-[130px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-[350px] h-[350px] bg-green-500/10 rounded-full blur-[110px] pointer-events-none" />
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Text Content */}
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                  <Wand2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase">Message to Image</span>
                </div>

                <h2 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight tracking-tight">
                  Message to <span className="text-emerald-400">Image</span>
                </h2>

                <p className="text-lg text-white/60 leading-relaxed mb-6">
                  Turn any text message into stunning images with one click. Describe what you want and KroniQ generates it using cutting-edge AI. No switching apps, no complex workflows — just describe and create.
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {['1-Click Generation', 'Multiple Styles', 'Up to 4K', 'Fast Results'].map((highlight, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-white/80 text-sm">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mockup */}
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full scale-75 opacity-50" />
                <div className="relative glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
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
                      <span className="text-emerald-400 text-xs">Generating with AI...</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { src: '/ai-sample-1.png', alt: 'Futuristic city with flying cars' },
                        { src: '/ai-sample-2.png', alt: 'Creative flyer design' },
                        { src: '/ai-sample-3.png', alt: 'Abstract colorful art' },
                        { src: '/ai-sample-4.png', alt: 'Fantasy landscape' }
                      ].map((img, i) => (
                        <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-emerald-500/20 to-teal-500/20">
                          <img
                            src={img.src}
                            alt={img.alt}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-3 -right-3 px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold shadow-lg">
                  1-Click
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== FEATURE: QUICK ADJUSTMENTS ===== */}
        <section className="py-20 px-4 relative overflow-hidden">
          {/* Glowing orbs */}
          <div className="absolute top-0 left-1/4 w-[380px] h-[380px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-1/3 right-0 w-[400px] h-[400px] bg-cyan-500/8 rounded-full blur-[130px] pointer-events-none" />
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Mockup - Left side */}
              <div className="relative lg:order-1">
                <div className="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full scale-75 opacity-50" />
                <div className="relative glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
                  <div className="bg-white/5 border-b border-white/10 p-3 flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4 text-emerald-400" />
                    <span className="text-white text-sm font-semibold">Quick Adjustments</span>
                  </div>
                  <div className="p-4 bg-[#0a0a0f]/80 space-y-4">
                    <div className="bg-emerald-500/10 rounded-lg p-3 text-sm text-white/90">
                      Here's a summary of quantum computing principles...
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 py-2 px-3 rounded-lg bg-white/10 border border-white/20 text-white text-xs font-medium">
                        Shorter
                      </button>
                      <button className="flex-1 py-2 px-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                        Longer
                      </button>
                      <button className="flex-1 py-2 px-3 rounded-lg bg-white/10 border border-white/20 text-white text-xs font-medium flex items-center justify-center gap-1">
                        <RefreshCw className="w-3 h-3" />
                        Regen
                      </button>
                    </div>
                    <div className="text-center text-xs text-white/40">
                      ✨ Adjust responses instantly without re-prompting
                    </div>
                  </div>
                </div>
              </div>

              {/* Text Content - Right side */}
              <div className="lg:order-2">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                  <ArrowUpDown className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase">Quick Adjustments</span>
                </div>

                <h2 className="text-3xl md:text-4xl font-black text-white mb-6 leading-tight tracking-tight">
                  Shorter or <span className="text-emerald-400">Longer</span>
                </h2>

                <p className="text-lg text-white/60 leading-relaxed mb-6">
                  Don't like the response length? Click 'Shorter' or 'Longer' to instantly adjust without re-prompting. Regenerate with different tones, expand on specific sections, or get a quick summary — all with single-click controls.
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {['1-Click Adjust', 'Instant Regen', 'Tone Control', 'No Re-prompting'].map((highlight, idx) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-white/80 text-sm">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== 6 STUDIOS GRID - Compact ===== */}
        <section className="py-20 px-6 lg:px-16 relative overflow-hidden">
          {/* Glowing orbs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-teal-500/8 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-cyan-500/8 rounded-full blur-[100px] pointer-events-none" />
          <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 text-sm font-bold tracking-wider">6 STUDIOS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
                All Creative Studios{' '}
                <span className="text-emerald-400">in One Place</span>
              </h2>
              <p className="text-white/50 max-w-xl mx-auto">
                Access Chat, Image, Video, Music, Voice, and PPT generation — all from a single unified platform.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
              {[
                { name: 'Chat Studio', icon: '💬', desc: '70+ AI models for any task', models: '70+ Models' },
                { name: 'Image Studio', icon: '🎨', desc: 'Create stunning visuals with AI', models: '10+ Models' },
                { name: 'Video Studio', icon: '🎬', desc: 'Generate videos with cutting-edge AI', models: '6+ Models' },
                { name: 'Music Studio', icon: '🎵', desc: 'Compose original music and soundtracks', models: '3+ Models' },
                { name: 'Voice Studio', icon: '🎙️', desc: 'Natural text-to-speech, 50+ voices', models: '50+ Voices' },
                { name: 'PPT Studio', icon: '📊', desc: 'AI-designed slides and templates', models: 'Templates' },
              ].map((studio) => (
                <div
                  key={studio.name}
                  className="group relative transition-all duration-500 hover:-translate-y-2"
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-20 blur-xl transition-all duration-500" />
                  <div className="relative p-6 rounded-2xl bg-gradient-to-b from-white/[0.05] to-[#0a0a0f] border border-white/10 group-hover:border-emerald-500/40 transition-all duration-500 h-full">
                    <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="text-xs text-emerald-400/80 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                        {studio.models}
                      </span>
                    </div>
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg">
                      <span className="text-2xl">{studio.icon}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-emerald-100 transition-colors">{studio.name}</h3>
                    <p className="text-white/50 text-sm leading-relaxed group-hover:text-white/60 transition-colors">{studio.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CAPABILITIES GRID ===== */}
        <section className="py-16 px-4 relative overflow-hidden">
          {/* Glowing orbs */}
          <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-green-500/8 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-[380px] h-[380px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
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
              {[
                { imageSrc: '/cap-smart-router.png', title: 'Smart Router', description: 'AI automatically routes to the best model for each task.' },
                { imageSrc: '/cap-lightning.png', title: 'Lightning Fast', description: 'Optimized infrastructure with sub-second responses.' },
                { imageSrc: '/cap-security.png', title: 'Secure & Private', description: 'Enterprise-grade encryption. You own everything.' },
                { imageSrc: '/cap-enhancer.png', title: 'Prompt Enhancer', description: 'One-click AI prompt enhancement.' },
                { imageSrc: '/cap-storage.png', title: 'Project Storage', description: 'All creations auto-saved and organized.' },
                { imageSrc: '/cap-language.png', title: 'Multi-language', description: 'Create in 100+ languages.' },
              ].map((cap, idx) => (
                <div
                  key={idx}
                  className="glass-panel rounded-xl p-5 border border-white/10 hover:border-emerald-500/30 transition-all duration-300 group cursor-pointer hover:shadow-lg hover:shadow-emerald-500/10"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform border border-emerald-500/20 overflow-hidden">
                      <img src={cap.imageSrc} alt={cap.title} className="w-8 h-8 object-contain" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">{cap.title}</h4>
                      <p className="text-white/60 text-sm leading-relaxed">{cap.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== AI MODEL CARDS - All Green Theme ===== */}
        <section className="py-24 px-6 lg:px-16 relative overflow-hidden">
          {/* Glowing orbs */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/8 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-teal-500/10 rounded-full blur-[130px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/5 rounded-full blur-[160px] pointer-events-none" />
          <div className="max-w-[1200px] mx-auto relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
                Pick the best characteristics{' '}
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  of each AI model
                </span>
              </h2>
              <p className="text-lg text-white/50 max-w-2xl mx-auto mt-4">
                Our intelligent routing analyzes your prompt and selects the optimal model — you get the best results without knowing which engine powers it.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  name: 'Reasoning Engine',
                  icon: '🧠',
                  gradient: 'from-emerald-500 to-green-600',
                  description: 'Best for coding, reasoning, and complex analysis with unmatched accuracy.',
                  glow: 'rgba(16, 185, 129, 0.4)',
                },
                {
                  name: 'Creative Writer',
                  icon: '✍️',
                  gradient: 'from-teal-500 to-cyan-600',
                  description: 'Exceptional creative writing and nuanced conversations with natural flow.',
                  glow: 'rgba(20, 184, 166, 0.4)',
                },
                {
                  name: 'Multimodal Expert',
                  icon: '💎',
                  gradient: 'from-cyan-500 to-teal-600',
                  description: 'Multimodal excellence with deep integration and advanced reasoning.',
                  glow: 'rgba(6, 182, 212, 0.4)',
                },
                {
                  name: 'Research Assistant',
                  icon: '🔍',
                  gradient: 'from-green-500 to-emerald-600',
                  description: 'Real-time web search with cited sources and up-to-date information.',
                  glow: 'rgba(34, 197, 94, 0.4)',
                },
                {
                  name: 'Math & Logic Pro',
                  icon: '🔮',
                  gradient: 'from-emerald-400 to-teal-500',
                  description: 'Advanced powerhouse with strong reasoning and math capabilities.',
                  glow: 'rgba(52, 211, 153, 0.4)',
                },
                {
                  name: 'Speed Optimizer',
                  icon: '⚡',
                  gradient: 'from-teal-400 to-green-500',
                  description: 'Lightning-fast responses with optimized processing for quick tasks.',
                  glow: 'rgba(45, 212, 191, 0.4)',
                },
              ].map((model) => (
                <div
                  key={model.name}
                  className="group relative p-6 rounded-2xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 hover:border-emerald-500/40 transition-all duration-500 overflow-hidden"
                  style={{
                    boxShadow: `0 0 0 rgba(0,0,0,0), inset 0 0 0 rgba(0,0,0,0)`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 40px ${model.glow}, inset 0 0 20px ${model.glow}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 0 rgba(0,0,0,0), inset 0 0 0 rgba(0,0,0,0)`;
                  }}
                >
                  {/* Glow on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Glowing ring effect on hover */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `radial-gradient(circle at center, ${model.glow} 0%, transparent 70%)`,
                      filter: 'blur(20px)',
                    }}
                  />

                  <div className="relative z-10">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${model.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:shadow-2xl transition-all duration-500`}
                      style={{
                        boxShadow: `0 8px 30px ${model.glow}`,
                      }}
                    >
                      <span className="text-2xl">{model.icon}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-100 transition-colors">{model.name}</h3>
                    <p className="text-white/50 text-sm leading-relaxed group-hover:text-white/70 transition-colors">{model.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* How it works explanation */}
            <div className="mt-16 glass-panel rounded-2xl border border-emerald-500/20 p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-emerald-500/5" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />

              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white mb-4 text-center">
                  How Our <span className="text-emerald-400">AI Backend</span> Works
                </h3>
                <div className="grid md:grid-cols-3 gap-6 mt-8">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <span className="text-emerald-400 font-bold">1</span>
                    </div>
                    <h4 className="text-white font-semibold mb-2">Analyze Your Prompt</h4>
                    <p className="text-white/50 text-sm">Our router analyzes your message to understand intent, complexity, and required capabilities.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <span className="text-emerald-400 font-bold">2</span>
                    </div>
                    <h4 className="text-white font-semibold mb-2">Select Best Engine</h4>
                    <p className="text-white/50 text-sm">We automatically route to the optimal AI engine from our pool of 70+ models — you never see which one.</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <span className="text-emerald-400 font-bold">3</span>
                    </div>
                    <h4 className="text-white font-semibold mb-2">Deliver Best Results</h4>
                    <p className="text-white/50 text-sm">You receive the highest quality response, optimized for your specific use case. It's like magic.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== COMPETITOR COMPARISON SECTION ===== */}
        <section className="py-24 px-6 lg:px-16 relative overflow-hidden">
          {/* Enhanced glowing backgrounds with animation */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[120px] animate-pulse pointer-events-none" />
          <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-teal-500/12 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-1/4 left-1/3 w-[450px] h-[450px] bg-cyan-500/10 rounded-full blur-[130px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

          <div className="max-w-[1200px] mx-auto relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 text-sm font-bold tracking-wider">WHY SWITCH?</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
                Compare KroniQ to{' '}
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  the Competition
                </span>
              </h2>
              <p className="text-lg text-white/50 max-w-2xl mx-auto">
                Why pay for multiple AI subscriptions when KroniQ gives you everything in one platform?
              </p>
            </div>

            {/* Comparison Table - Horizontally scrollable on mobile */}
            <div className="overflow-x-auto -mx-6 px-6 lg:mx-0 lg:px-0">
              <div className="min-w-[700px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm">
                {/* Header Row */}
                <div className="grid grid-cols-5 gap-0 border-b border-white/10">
                  <div className="p-3 sm:p-4 bg-white/5">
                    <span className="text-white/60 text-xs sm:text-sm font-medium">Feature</span>
                  </div>
                  <div className="p-3 sm:p-4 bg-emerald-500/10 border-l border-white/10 relative">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                        <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                      </div>
                      <span className="text-emerald-400 font-bold text-xs sm:text-sm">KroniQ</span>
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 border-l border-white/10">
                    <span className="text-white/60 text-xs sm:text-sm">ChatGPT</span>
                  </div>
                  <div className="p-3 sm:p-4 border-l border-white/10">
                    <span className="text-white/60 text-xs sm:text-sm">Lovable</span>
                  </div>
                  <div className="p-3 sm:p-4 border-l border-white/10">
                    <span className="text-white/60 text-xs sm:text-sm">AI Studio</span>
                  </div>
                </div>

                {/* Comparison Rows */}
                {[
                  { feature: 'AI Chat Models', kroniq: '70+ Models', chatgpt: '4 Models', lovable: '3 Models', aistudio: '5 Models' },
                  { feature: 'Image Generation', kroniq: '✓ 10+ (DALL-E, Flux, Imagen)', chatgpt: '✓ DALL-E 3 only', lovable: '✗ None', aistudio: '✓ Imagen only' },
                  { feature: 'Video Generation', kroniq: '✓ Sora, Veo 3, Kling', chatgpt: '✓ Sora (Pro only)', lovable: '✗ None', aistudio: '✓ Veo (limited)' },
                  { feature: 'Music & Audio', kroniq: '✓ Suno AI, Lyria', chatgpt: '✗ None', lovable: '✗ None', aistudio: '✗ None' },
                  { feature: 'Text to Speech', kroniq: '✓ ElevenLabs 50+ Voices', chatgpt: '✓ 5 Voices', lovable: '✗ None', aistudio: '✓ Limited' },
                  { feature: 'PPT/Slides Creation', kroniq: '✓ AI Slide Generator', chatgpt: '✗ None', lovable: '✗ None', aistudio: '✗ None' },
                  { feature: 'App Building', kroniq: '✓ Code + Design', chatgpt: '✓ Code only', lovable: '✓ Primary focus', aistudio: '✗ None' },
                  { feature: 'Web Search', kroniq: '✓ Real-time', chatgpt: '✓ Paid only', lovable: '✗ None', aistudio: '✓ Yes' },
                  { feature: 'Smart Model Routing', kroniq: '✓ Auto-selects best', chatgpt: '✗ Manual', lovable: '✗ Manual', aistudio: '✗ Manual' },
                  { feature: 'Free Tier', kroniq: '✓ 15K tokens/month', chatgpt: '✓ Limited GPT-4o', lovable: '✓ Limited builds', aistudio: '✓ Limited' },
                  { feature: 'Pro Price', kroniq: '$12/mo', chatgpt: '$20/mo', lovable: '$20/mo', aistudio: 'Free (limited)' },
                ].map((row, idx) => (
                  <div key={row.feature} className={`grid grid-cols-5 gap-0 ${idx % 2 === 0 ? 'bg-white/[0.02]' : ''} hover:bg-white/[0.05] transition-colors`}>
                    <div className="p-3 sm:p-4 text-white/70 text-xs sm:text-sm font-medium">{row.feature}</div>
                    <div className="p-3 sm:p-4 border-l border-white/10 bg-emerald-500/5">
                      <span className="text-emerald-400 font-semibold text-xs sm:text-sm">{row.kroniq}</span>
                    </div>
                    <div className="p-3 sm:p-4 border-l border-white/10 text-white/50 text-xs sm:text-sm">{row.chatgpt}</div>
                    <div className="p-3 sm:p-4 border-l border-white/10 text-white/50 text-xs sm:text-sm">{row.lovable}</div>
                    <div className="p-3 sm:p-4 border-l border-white/10 text-white/50 text-xs sm:text-sm">{row.aistudio}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="mt-8 text-center">
              <p className="text-white/50 mb-4">Stop paying $60+/month for separate subscriptions</p>
              <button
                onClick={() => { trackGetStartedClick('comparison_section'); onGetStarted(); }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold hover:scale-105 transition-transform shadow-lg shadow-emerald-500/20"
              >
                Get All-in-One Access
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ===== WHY KRONIQ SECTION ===== */}
        <section className="py-24 px-6 lg:px-16">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                <Award className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 text-sm font-bold tracking-wider">WHY KRONIQ?</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
                Built for the{' '}
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Future of AI
                </span>
              </h2>
              <p className="text-lg text-white/50 max-w-2xl mx-auto">
                We're not just another AI wrapper — we're building the most comprehensive AI platform.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                {
                  icon: Layers,
                  title: 'All-in-One Platform',
                  description: 'Chat, images, video, music, voice, and presentations — all from one unified interface.',
                  glow: 'from-emerald-500/20 to-transparent',
                },
                {
                  icon: Coins,
                  title: 'Token Flexibility',
                  description: 'Pay for what you use. Roll over unused tokens. No wasted subscriptions.',
                  glow: 'from-teal-500/20 to-transparent',
                },
                {
                  icon: Brain,
                  title: 'Smart Routing',
                  description: 'Our AI automatically picks the best model for each task — you just prompt.',
                  glow: 'from-cyan-500/20 to-transparent',
                },
                {
                  icon: Lock,
                  title: 'Enterprise Security',
                  description: 'Bank-level encryption. Your data stays yours. SOC2 compliant.',
                  glow: 'from-green-500/20 to-transparent',
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="group relative p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/40 transition-all duration-500 overflow-hidden"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    {/* Glow on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                    <div className="relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-emerald-500/20 transition-all duration-300">
                        <Icon className="w-6 h-6 text-emerald-400" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-100 transition-colors">{item.title}</h3>
                      <p className="text-white/50 text-sm leading-relaxed group-hover:text-white/70 transition-colors">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===== TESTIMONIALS SECTION ===== */}
        <section className="py-24 px-6 lg:px-16 relative overflow-hidden">
          {/* Glowing background */}
          <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none" />
          <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[150px] pointer-events-none" />

          <div className="max-w-[1200px] mx-auto relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                <Quote className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 text-sm font-bold tracking-wider">TESTIMONIALS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
                Loved by{' '}
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Thousands
                </span>
              </h2>
              <p className="text-lg text-white/50 max-w-xl mx-auto">
                See what creators and professionals are saying about KroniQ AI.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  name: 'Jason He',
                  role: 'Software Engineer',
                  avatar: '👨‍💻',
                  quote: 'KroniQ replaced 4 separate AI tools for me. The video and music generation is incredible!',
                  rating: 5,
                },
                {
                  name: 'Oscar Cardoza',
                  role: 'Content Creator',
                  avatar: '🎬',
                  quote: 'The smart routing is genius. I just ask my question and it picks the best model automatically.',
                  rating: 4.5,
                },
                {
                  name: 'Achyuth Reddy',
                  role: 'Marketing Director',
                  avatar: '📊',
                  quote: 'We saved over $200/month switching from separate subscriptions. The PPT generator is a game-changer.',
                  rating: 4,
                },
              ].map((testimonial) => (
                <TestimonialCard
                  key={testimonial.name}
                  name={testimonial.name}
                  role={testimonial.role}
                  avatar={testimonial.avatar}
                  quote={testimonial.quote}
                  rating={testimonial.rating}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ===== FEATURES GRID ===== */}
        <section id="features" className="py-24 px-6 lg:px-16">
          <div className="max-w-[1200px] mx-auto">
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 text-sm font-medium">6 AI Studios</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
                Everything you need.{' '}
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">One platform.</span>
              </h2>
              <p className="text-lg text-white/50 max-w-2xl mx-auto">From chat to video creation, access every AI tool through a single unified interface.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, idx) => (
                <FeatureCard key={feature.title} imageSrc={feature.imageSrc} title={feature.title} description={feature.description} gradient={feature.gradient} stats={feature.stats} delay={idx * 100} />
              ))}
            </div>
          </div>
        </section>

        {/* ===== PRICING SECTION ===== */}
        <section id="pricing" className="py-24 px-6 lg:px-16 relative overflow-hidden">
          {/* Glowing background orbs */}
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full bg-teal-500/5 blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[120px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-r from-teal-500/3 to-cyan-500/3 blur-[150px] pointer-events-none" />

          <div className="max-w-[1200px] mx-auto relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 mb-6">
                <Zap className="w-4 h-4 text-teal-400" />
                <span className="text-teal-400 text-sm font-medium">Simple Monthly Plans</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
                Simple,{' '}
                <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">affordable</span>{' '}
                pricing
              </h2>
              <p className="text-lg text-white/50 max-w-xl mx-auto">Start free, upgrade when you need more. All plans include 70+ AI models.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {tokenPacks.slice(0, 3).map((pack, index) => (
                <PricingCard key={pack.id} pack={pack} index={index} onGetStarted={onGetStarted} />
              ))}
            </div>
          </div>
        </section>

        {/* ===== FINAL CTA - AIFiesta Style with Hover Arc Effect ===== */}
        <section className="py-32 px-6 lg:px-16 relative overflow-hidden group/cta">
          {/* Semi-circle arc with line and misty clouds - brightens on button hover */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[700px] pointer-events-none overflow-hidden transition-all duration-500">
            {/* The arc LINE (curved border) - brightens on hover */}
            <svg
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] transition-all duration-500 group-hover/cta:drop-shadow-[0_0_20px_rgba(45,212,191,0.5)]"
              viewBox="0 0 1200 600"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(20, 184, 166, 0)" />
                  <stop offset="30%" stopColor="rgba(20, 184, 166, 0.4)" />
                  <stop offset="50%" stopColor="rgba(45, 212, 191, 0.6)" />
                  <stop offset="70%" stopColor="rgba(20, 184, 166, 0.4)" />
                  <stop offset="100%" stopColor="rgba(20, 184, 166, 0)" />
                </linearGradient>
                <linearGradient id="arcGradientHover" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(20, 184, 166, 0.1)" />
                  <stop offset="30%" stopColor="rgba(45, 212, 191, 0.7)" />
                  <stop offset="50%" stopColor="rgba(94, 234, 212, 1)" />
                  <stop offset="70%" stopColor="rgba(45, 212, 191, 0.7)" />
                  <stop offset="100%" stopColor="rgba(20, 184, 166, 0.1)" />
                </linearGradient>
              </defs>
              {/* Arc path - semi-circle */}
              < path
                d="M 0 600 Q 600 -100 1200 600"
                className="transition-all duration-500"
                stroke="url(#arcGradient)"
                strokeWidth="1.5"
                fill="none"
              />
              {/* Brighter arc on hover */}
              < path
                d="M 0 600 Q 600 -100 1200 600"
                className="opacity-0 group-hover/cta:opacity-100 transition-opacity duration-500"
                stroke="url(#arcGradientHover)"
                strokeWidth="2"
                fill="none"
              />
            </svg>

            {/* Misty cloud blobs - intensify on hover */}
            <div
              className="absolute top-[80px] left-[30%] w-[200px] h-[100px] rounded-full transition-all duration-500 group-hover/cta:scale-125"
              style={{
                background: 'radial-gradient(ellipse, rgba(20, 184, 166, 0.15) 0%, transparent 70%)',
                filter: 'blur(50px)'
              }}
            />
            <div
              className="absolute top-[50px] left-[55%] w-[300px] h-[150px] rounded-full transition-all duration-500 group-hover/cta:scale-125"
              style={{
                background: 'radial-gradient(ellipse, rgba(45, 212, 191, 0.12) 0%, transparent 70%)',
                filter: 'blur(60px)'
              }}
            />
            <div
              className="absolute top-[120px] left-[40%] w-[250px] h-[120px] rounded-full transition-all duration-500 group-hover/cta:scale-110"
              style={{
                background: 'radial-gradient(ellipse, rgba(34, 211, 238, 0.1) 0%, transparent 70%)',
                filter: 'blur(70px)'
              }}
            />
            {/* Larger background mist - intensifies on hover */}
            <div
              className="absolute top-[20px] left-[20%] w-[60%] h-[250px] rounded-full transition-all duration-500 group-hover/cta:opacity-150"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(20, 184, 166, 0.08) 0%, transparent 60%)',
                filter: 'blur(80px)'
              }}
            />
            {/* Extra glow on hover */}
            <div
              className="absolute top-[0px] left-[25%] w-[50%] h-[200px] rounded-full opacity-0 group-hover/cta:opacity-100 transition-opacity duration-500"
              style={{
                background: 'radial-gradient(ellipse at top, rgba(45, 212, 191, 0.25) 0%, transparent 70%)',
                filter: 'blur(60px)'
              }}
            />
          </div>

          <div className="max-w-[700px] mx-auto text-center relative z-10">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
              Ready to experience smarter &
              <br />
              more accurate AI answers?
            </h2>

            <p className="text-white/50 mb-10 max-w-lg mx-auto">
              Gain an edge with our exclusive platform, designed to provide you with tailored insights and guidance across every industry and subject.
            </p>

            {/* AI Fiesta Animated Button */}
            <button
              onClick={() => { trackGetStartedClick('home_final_cta'); onGetStarted(); }}
              className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-full font-semibold text-white text-base transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
              style={{
                background: 'linear-gradient(90deg, rgba(15, 23, 30, 0.9) 0%, rgba(20, 184, 166, 0.8) 35%, rgba(45, 212, 191, 0.9) 50%, rgba(20, 184, 166, 0.8) 65%, rgba(15, 23, 30, 0.9) 100%)',
                border: '1px solid rgba(45, 212, 191, 0.3)',
                boxShadow: '0 0 20px rgba(20, 184, 166, 0.2), inset 0 0 20px rgba(20, 184, 166, 0.1)'
              }}
            >
              {/* Animated glow overlay */}
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                  background: 'linear-gradient(90deg, rgba(15, 23, 30, 0.8) 0%, rgba(45, 212, 191, 1) 35%, rgba(94, 234, 212, 1) 50%, rgba(45, 212, 191, 1) 65%, rgba(15, 23, 30, 0.8) 100%)',
                  boxShadow: '0 0 40px rgba(45, 212, 191, 0.5), 0 0 80px rgba(20, 184, 166, 0.3)'
                }}
              />
              {/* Shine sweep effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              <span className="relative font-semibold drop-shadow-lg">Get Started Now</span>
              <ArrowRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform drop-shadow-lg" />
            </button>
          </div>
        </section>

        {/* ===== FOOTER - AIFiesta Style ===== */}
        <footer className="py-16 px-6 lg:px-16 border-t border-white/5">
          <div className="max-w-[1200px] mx-auto">
            {/* Logo centered */}
            <div className="flex flex-col items-center justify-center mb-8">
              <div className="flex items-center gap-2 mb-4">
                <img
                  src="/kroniq-logo-white.png"
                  alt="KroniQ AI Logo"
                  width={40}
                  height={40}
                  loading="lazy"
                  className="h-10 w-auto object-contain"
                />
                <span className="text-white font-semibold text-xl">KroniQ</span>
              </div>

              {/* Email */}
              <a
                href="mailto:support@kroniqai.com"
                className="flex items-center gap-2 text-white/60 hover:text-white/80 transition-colors mb-4"
              >
                <ArrowRight className="w-4 h-4 rotate-[-45deg]" />
                <span>support@kroniqai.com</span>
              </a>

              {/* Investor Signal - Quiet but Strong */}
              <p className="text-sm text-white/30 italic">
                Built by builders. Designed for serious execution.
              </p>
            </div>

            {/* Bottom bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
              <div className="flex items-center gap-6 text-sm text-white/40">
                <a href="/privacy" className="hover:text-white/60 transition-colors">Privacy Policy</a>
                <a href="/terms" className="hover:text-white/60 transition-colors">Terms & Conditions</a>
              </div>
              <p className="text-sm text-white/40">
                © 2025 KroniQ. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div >
    </div >
  );
};
