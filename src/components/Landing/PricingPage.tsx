import React, { useState, useEffect, useRef } from 'react';
import { Check, X, Zap, Crown, Sparkles, ArrowRight, Star, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageMeta } from '../SEO/PageMeta';
import { MouseParticles } from '../Landing/MouseParticles';

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

interface PlanFeature {
  name: string;
  free: boolean | string;
  pro: boolean | string;
  premium: boolean | string;
}

const features: PlanFeature[] = [
  { name: 'Daily Tokens', free: '15,000', pro: '75,000', premium: '200,000' },
  { name: 'Chat Messages', free: '50/day', pro: '200/day', premium: 'Unlimited' },
  { name: 'Image Generation', free: '3/day', pro: '10/day', premium: '25/day' },
  { name: 'Video Generation', free: '1/day', pro: '5/day', premium: '12/day' },
  { name: 'Music Generation', free: '2/day', pro: '8/day', premium: '15/day' },
  { name: 'TTS Generation', free: '5/day', pro: '20/day', premium: '50/day' },
  { name: 'PPT Generation', free: '1/day', pro: '5/day', premium: '10/day' },
  { name: 'All AI Models', free: 'Basic only', pro: true, premium: true },
  { name: 'Smart Router', free: true, pro: true, premium: true },
  { name: 'Priority Support', free: false, pro: false, premium: true },
];

const plans = [
  {
    name: 'Free',
    price: 0,
    tokens: '15K',
    tokensLabel: 'tokens/day',
    description: 'Perfect for trying out KroniQ AI',
    icon: Star,
    gradient: 'from-gray-500 to-slate-600',
    popular: false,
    cta: 'Get Started Free',
    tier: 'FREE'
  },
  {
    name: 'Starter',
    price: 4.99,
    tokens: '30K',
    tokensLabel: 'tokens/day',
    description: 'For casual users and hobbyists',
    icon: Sparkles,
    gradient: 'from-teal-500 to-emerald-500',
    popular: false,
    cta: 'Get Starter',
    tier: 'STARTER'
  },
  {
    name: 'Pro',
    price: 9.99,
    tokens: '75K',
    tokensLabel: 'tokens/day',
    description: 'For creators and professionals',
    icon: Zap,
    gradient: 'from-emerald-500 to-teal-500',
    popular: true,
    cta: 'Upgrade to Pro',
    tier: 'PRO'
  },
  {
    name: 'Premium',
    price: 19.99,
    tokens: '200K',
    tokensLabel: 'tokens/day',
    description: 'Ultimate power for professionals',
    icon: Crown,
    gradient: 'from-purple-500 to-violet-600',
    popular: false,
    cta: 'Go Premium',
    tier: 'PREMIUM'
  },
];

interface PricingPageProps {
  onGetStarted?: () => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onGetStarted }) => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const ctaRef = useScrollReveal(0.15);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGetStarted = (tier: string) => {
    if (onGetStarted) {
      onGetStarted();
    } else {
      if (tier === 'FREE') {
        navigate('/signup');
      } else {
        navigate(`/signup?plan=${tier.toLowerCase()}`);
      }
    }
  };

  return (
    <div className="relative w-full min-h-screen text-white overflow-hidden">
      <PageMeta
        title="Pricing - KroniQ AI"
        description="Choose your KroniQ AI plan. Free with 1K tokens, Pro at $12/month with 5K tokens, or Premium at $29/month with 15K tokens."
        keywords="AI pricing, KroniQ pricing, AI subscription, token plans"
      />

      <MouseParticles />

      {/* Background with grid - matching FeaturesPage */}
      <div className="fixed inset-0 bg-black">
        {/* Teal glow at top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-teal-500/20 via-teal-500/5 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[200px]" />

        {/* Perspective Grid Lines */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.1) 70%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.1) 70%, transparent 100%)',
          }}
        />

        {/* Scattered dark rectangles */}
        {[
          { top: '10%', left: '5%', w: 50, h: 70, opacity: 0.35 },
          { top: '30%', left: '12%', w: 40, h: 55, opacity: 0.25 },
          { top: '55%', left: '3%', w: 45, h: 60, opacity: 0.3 },
          { top: '15%', right: '8%', w: 55, h: 70, opacity: 0.35 },
          { top: '40%', right: '4%', w: 45, h: 60, opacity: 0.3 },
        ].map((rect, i) => (
          <div
            key={i}
            className="absolute rounded-lg bg-white/5 border border-white/5"
            style={{
              top: rect.top,
              left: rect.left,
              right: rect.right,
              width: rect.w,
              height: rect.h,
              opacity: rect.opacity,
            }}
          />
        ))}
      </div>

      {/* Hero Section */}
      <section className={`relative pt-40 pb-12 px-4 ${mounted ? 'animate-fade-in-up' : 'opacity-0'}`}>
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-teal-500/30 bg-teal-500/10 mb-8">
            <Coins className="w-4 h-4 text-teal-400" />
            <span className="text-teal-400 text-sm font-bold tracking-wider">TOKEN PLANS</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 leading-[1.1] tracking-tight">
            Simple, Transparent{' '}
            <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Pricing
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/60 leading-relaxed max-w-3xl mx-auto mb-12">
            Get tokens to power all your AI needs. One balance for chat, images, video, music, and more.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan, index) => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.name}
                  className={`relative rounded-3xl p-8 transition-all duration-300 border ${plan.popular
                    ? 'bg-gradient-to-b from-teal-500/10 to-transparent border-teal-500/30 shadow-2xl shadow-teal-500/10 lg:-translate-y-4'
                    : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                    }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Popular badge */}
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-xs font-bold tracking-wider shadow-lg shadow-teal-500/30">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> MOST POPULAR
                      </span>
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-6 shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Plan name */}
                  <h3 className="text-2xl font-bold text-white mb-4">{plan.name}</h3>

                  {/* TOKENS - Hero Display */}
                  <div className="mb-4">
                    <span className="text-6xl font-black bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                      {plan.tokens}
                    </span>
                    <p className="text-teal-400/70 text-sm font-medium mt-1">{plan.tokensLabel}</p>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-lg text-white/60">$</span>
                    <span className="text-3xl font-bold text-white">{plan.price}</span>
                    <span className="text-white/40 text-sm">/month</span>
                  </div>

                  {/* Description */}
                  <p className="text-white/50 text-sm mb-8">{plan.description}</p>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleGetStarted(plan.tier)}
                    className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${plan.popular
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-teal-500/30 hover:scale-[1.02]'
                      : 'bg-white/10 text-white border border-white/20 hover:bg-white/15 hover:border-teal-500/30'
                      }`}
                  >
                    {plan.cta}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="relative py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Compare <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">Plans</span>
            </h2>
          </div>

          <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl shadow-teal-500/5">
            {/* Table Header */}
            <div className="grid grid-cols-4 bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border-b border-white/10">
              <div className="p-6 font-bold text-white/60">Feature</div>
              <div className="p-6 font-bold text-center text-white/60">Free</div>
              <div className="p-6 font-bold text-center text-teal-400">Pro</div>
              <div className="p-6 font-bold text-center text-purple-400">Premium</div>
            </div>

            {/* Table Rows */}
            {features.map((feature, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-4 hover:bg-white/5 transition-colors ${idx !== features.length - 1 ? 'border-b border-white/5' : ''
                  }`}
              >
                <div className="p-4 md:p-6 text-white/70 text-sm md:text-base">{feature.name}</div>
                <div className="p-4 md:p-6 text-center flex items-center justify-center">
                  {typeof feature.free === 'boolean' ? (
                    feature.free ? (
                      <Check className="w-5 h-5 text-teal-400" />
                    ) : (
                      <X className="w-5 h-5 text-white/20" />
                    )
                  ) : (
                    <span className="text-white/60 text-sm">{feature.free}</span>
                  )}
                </div>
                <div className="p-4 md:p-6 text-center flex items-center justify-center">
                  {typeof feature.pro === 'boolean' ? (
                    feature.pro ? (
                      <Check className="w-5 h-5 text-teal-400" />
                    ) : (
                      <X className="w-5 h-5 text-white/20" />
                    )
                  ) : (
                    <span className="text-teal-400 font-semibold text-sm">{feature.pro}</span>
                  )}
                </div>
                <div className="p-4 md:p-6 text-center flex items-center justify-center">
                  {typeof feature.premium === 'boolean' ? (
                    feature.premium ? (
                      <Check className="w-5 h-5 text-purple-400" />
                    ) : (
                      <X className="w-5 h-5 text-white/20" />
                    )
                  ) : (
                    <span className="text-purple-400 font-semibold text-sm">{feature.premium}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Matching image 5 style */}
      <section ref={ctaRef.ref} className={`relative py-24 px-4 ${ctaRef.isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to experience smarter &<br />more accurate AI answers?
          </h2>
          <p className="text-white/50 text-lg mb-10 max-w-2xl mx-auto">
            Gain an edge with our exclusive platform, designed to provide you with tailored insights and guidance across every industry and subject.
          </p>
          <button
            onClick={() => handleGetStarted('FREE')}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold rounded-full hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-300 hover:scale-105"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src="/kroniq-logo-white.png" alt="KroniQ" className="w-8 h-8" />
              <span className="text-white font-bold">KroniQ</span>
            </div>
            <p className="text-white/40 text-sm">
              ✉ support@kroniqai.com
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8 pt-8 border-t border-white/5">
            <div className="flex gap-6 text-sm text-white/40">
              <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-white transition-colors">Terms & Conditions</a>
            </div>
            <p className="text-white/30 text-sm">© 2025 KroniQ. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PricingPage;
