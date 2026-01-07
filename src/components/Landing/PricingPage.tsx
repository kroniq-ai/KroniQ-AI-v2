import React, { useState, useEffect, useRef } from 'react';
import { Check, X, Zap, Crown, Sparkles, ArrowRight, Star, Coins, Gem } from 'lucide-react';
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
  starter: boolean | string;
  pro: boolean | string;
  premium: boolean | string;
}

const features: PlanFeature[] = [
  { name: 'AI Chat', free: '240/mo', starter: '1,200/mo', pro: '2,000/mo', premium: '3,200/mo' },
  { name: 'TTS Generation', free: '40/mo', starter: '1,200/mo', pro: '2,000/mo', premium: '3,200/mo' },
  { name: 'Image Generation', free: '20/mo', starter: '400/mo', pro: '560/mo', premium: '800/mo' },
  { name: 'Video Generation', free: '—', starter: '96/mo', pro: '144/mo', premium: '200/mo' },
  { name: 'PPT Generation', free: '—', starter: '32/mo', pro: '64/mo', premium: '96/mo' },
  { name: 'All 70+ AI Models', free: 'Basic only', starter: true, pro: true, premium: true },
  { name: 'Smart Model Routing', free: true, starter: true, pro: true, premium: true },
  { name: 'Priority Support', free: false, starter: false, pro: false, premium: true },
];


const plans = [
  {
    name: 'Free',
    price: 0,
    tokens: 'Limited',
    tokensLabel: 'Try it out',
    description: 'Perfect for trying out KroniQ AI',
    tierImage: '/stripe-starter.png',
    gradient: 'from-emerald-600/50 to-teal-700/50',
    glowColor: 'emerald-500/20',
    borderColor: 'emerald-500/30',
    popular: false,
    cta: 'Get Started Free',
    tier: 'FREE'
  },
  {
    name: 'Starter',
    price: 5,
    tokens: 'Unlimited',
    tokensLabel: 'everything',
    description: 'Unlimited AI chat, images & videos',
    tierImage: '/stripe-starter.png',
    gradient: 'from-emerald-500 to-teal-500',
    glowColor: 'emerald-500/40',
    borderColor: 'emerald-400/50',
    popular: false,
    cta: 'Get Starter',
    tier: 'STARTER'
  },
  {
    name: 'Pro',
    price: 12,
    tokens: 'Unlimited',
    tokensLabel: 'everything',
    description: 'Premium models for creators',
    tierImage: '/stripe-pro.png',
    gradient: 'from-teal-400 via-emerald-400 to-cyan-400',
    glowColor: 'teal-500/50',
    borderColor: 'teal-400/70',
    popular: true,
    cta: 'Upgrade to Pro',
    tier: 'PRO'
  },
  {
    name: 'Premium',
    price: 24,
    tokens: 'Unlimited',
    tokensLabel: 'everything',
    description: 'Best models + Priority support',
    tierImage: '/stripe-premium.png',
    gradient: 'from-emerald-300 via-teal-300 to-cyan-300',
    glowColor: 'emerald-400/60',
    borderColor: 'emerald-300/80',
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
        description="Choose your KroniQ AI plan. Free with 15K tokens, Starter at $5/month with 100K tokens, Pro at $12/month with 220K tokens, or Premium at $29/month with 560K tokens."
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
              const isPremium = plan.tier === 'PREMIUM';
              const isPro = plan.tier === 'PRO';
              const isStarter = plan.tier === 'STARTER';

              return (
                <div
                  key={plan.name}
                  className={`relative rounded-3xl p-[2px] transition-all duration-500 group
                    ${plan.popular
                      ? 'lg:-translate-y-4 hover:-translate-y-6'
                      : 'hover:-translate-y-2'
                    }
                  `}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Animated gradient border */}
                  <div className={`absolute inset-0 rounded-3xl transition-opacity duration-500 
                    ${isPro ? 'bg-gradient-to-br from-teal-500 via-cyan-500 to-emerald-500 opacity-100' :
                      isPremium ? 'bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-400 opacity-80 group-hover:opacity-100' :
                        isStarter ? 'bg-gradient-to-br from-teal-400 via-emerald-400 to-cyan-400 opacity-40 group-hover:opacity-70' :
                          'bg-gradient-to-br from-emerald-600/50 to-teal-600/50 opacity-30 group-hover:opacity-50'
                    }
                  `} />

                  {/* Glow effect */}
                  <div className={`absolute inset-0 rounded-3xl blur-xl transition-opacity duration-500
                    ${isPro ? 'bg-teal-500/30 opacity-80' :
                      isPremium ? 'bg-emerald-400/30 opacity-60 group-hover:opacity-80' :
                        isStarter ? 'bg-emerald-500/15 opacity-0 group-hover:opacity-50' :
                          'bg-emerald-600/10 opacity-0 group-hover:opacity-30'
                    }
                  `} />

                  {/* Card content */}
                  <div className={`relative rounded-3xl p-8 h-full backdrop-blur-xl
                    ${plan.popular
                      ? 'bg-black/80'
                      : 'bg-black/90'
                    }
                  `}>
                    {/* Popular badge */}
                    {plan.popular && (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-gradient-to-r from-teal-500 via-cyan-400 to-emerald-500 text-white text-xs font-bold tracking-wider shadow-[0_0_30px_rgba(20,184,166,0.5)] animate-pulse">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" /> MOST POPULAR
                        </span>
                      </div>
                    )}

                    {/* Tier Image with glow */}
                    <div className="relative mb-6">
                      <div className={`absolute inset-0 w-16 h-16 rounded-2xl blur-lg transition-all duration-300 group-hover:blur-xl
                        ${isPremium ? 'bg-emerald-400/50' :
                          isPro ? 'bg-teal-500/50' :
                            isStarter ? 'bg-emerald-500/30' :
                              'bg-emerald-600/20'
                        }
                      `} />
                      <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center shadow-lg border border-white/10 overflow-hidden`}>
                        <img src={plan.tierImage} alt={plan.name} className="w-10 h-10 object-contain" />
                      </div>
                    </div>

                    {/* Plan name */}
                    <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>

                    {/* Description */}
                    <p className="text-white/50 text-sm mb-6">{plan.description}</p>

                    {/* TOKENS - Hero Display with glow */}
                    <div className="mb-4 relative">
                      <span className={`text-5xl font-black bg-clip-text text-transparent
                        ${isPremium ? 'bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300' :
                          isPro ? 'bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400' :
                            isStarter ? 'bg-gradient-to-r from-emerald-400 to-teal-400' :
                              'bg-gradient-to-r from-emerald-500/70 to-teal-500/70'
                        }
                      `}>
                        {plan.tokens}
                      </span>
                      <p className={`text-sm font-medium mt-1
                        ${isPremium ? 'text-emerald-300/70' :
                          isPro ? 'text-teal-400/70' :
                            isStarter ? 'text-emerald-400/70' :
                              'text-emerald-500/50'
                        }
                      `}>{plan.tokensLabel}</p>
                    </div>

                    {/* Price with styling */}
                    <div className="flex items-baseline gap-1 mb-8">
                      <span className="text-xl text-white/60">$</span>
                      <span className={`text-4xl font-black
                        ${isPremium ? 'text-emerald-300' :
                          isPro ? 'text-teal-300' :
                            isStarter ? 'text-emerald-300' :
                              'text-emerald-400/60'
                        }
                      `}>{plan.price}</span>
                      <span className="text-white/40 text-sm">/month</span>
                    </div>

                    {/* CTA Button with glow */}
                    <button
                      onClick={() => handleGetStarted(plan.tier)}
                      className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300
                        ${isPro
                          ? 'bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 text-white shadow-[0_0_25px_rgba(20,184,166,0.4)] hover:shadow-[0_0_40px_rgba(20,184,166,0.6)] hover:scale-[1.02]'
                          : isPremium
                            ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 text-black font-extrabold shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:shadow-[0_0_50px_rgba(16,185,129,0.7)] hover:scale-[1.02]'
                            : isStarter
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:scale-[1.02]'
                              : 'bg-emerald-900/30 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-800/30 hover:border-emerald-400/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                        }
                      `}
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {/* Feature highlights for paid tiers */}
                    {plan.tier !== 'FREE' && (
                      <div className="mt-6 pt-6 border-t border-white/10">
                        <div className="flex items-center gap-2 text-white/60 text-xs">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>All AI Models</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/60 text-xs mt-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Unlimited images & videos</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/60 text-xs mt-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{isPremium ? 'Priority support' : 'Smart model routing'}</span>
                        </div>
                      </div>
                    )}
                  </div>
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

          <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl shadow-teal-500/5 overflow-x-auto">
            {/* Table Header */}
            <div className="grid grid-cols-5 bg-gradient-to-r from-teal-500/10 to-purple-500/10 border-b border-white/10 min-w-[600px]">
              <div className="p-4 md:p-6 font-bold text-white/60">Feature</div>
              <div className="p-4 md:p-6 font-bold text-center text-white/60">Free</div>
              <div className="p-4 md:p-6 font-bold text-center text-emerald-400">Starter</div>
              <div className="p-4 md:p-6 font-bold text-center text-teal-400">Pro</div>
              <div className="p-4 md:p-6 font-bold text-center text-purple-400">Premium</div>
            </div>

            {/* Table Rows */}
            {features.map((feature, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-5 hover:bg-white/5 transition-colors min-w-[600px] ${idx !== features.length - 1 ? 'border-b border-white/5' : ''
                  }`}
              >
                <div className="p-3 md:p-6 text-white/70 text-xs md:text-sm">{feature.name}</div>
                <div className="p-3 md:p-6 text-center flex items-center justify-center">
                  {typeof feature.free === 'boolean' ? (
                    feature.free ? (
                      <Check className="w-4 h-4 md:w-5 md:h-5 text-teal-400" />
                    ) : (
                      <X className="w-4 h-4 md:w-5 md:h-5 text-white/20" />
                    )
                  ) : (
                    <span className="text-white/60 text-xs md:text-sm">{feature.free}</span>
                  )}
                </div>
                <div className="p-3 md:p-6 text-center flex items-center justify-center">
                  {typeof feature.starter === 'boolean' ? (
                    feature.starter ? (
                      <Check className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
                    ) : (
                      <X className="w-4 h-4 md:w-5 md:h-5 text-white/20" />
                    )
                  ) : (
                    <span className="text-emerald-400 font-semibold text-xs md:text-sm">{feature.starter}</span>
                  )}
                </div>
                <div className="p-3 md:p-6 text-center flex items-center justify-center">
                  {typeof feature.pro === 'boolean' ? (
                    feature.pro ? (
                      <Check className="w-4 h-4 md:w-5 md:h-5 text-teal-400" />
                    ) : (
                      <X className="w-4 h-4 md:w-5 md:h-5 text-white/20" />
                    )
                  ) : (
                    <span className="text-teal-400 font-semibold text-xs md:text-sm">{feature.pro}</span>
                  )}
                </div>
                <div className="p-3 md:p-6 text-center flex items-center justify-center">
                  {typeof feature.premium === 'boolean' ? (
                    feature.premium ? (
                      <Check className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                    ) : (
                      <X className="w-4 h-4 md:w-5 md:h-5 text-white/20" />
                    )
                  ) : (
                    <span className="text-purple-400 font-semibold text-xs md:text-sm">{feature.premium}</span>
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
