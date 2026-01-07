import React, { useState } from 'react';
import { X, Zap, Crown, Star, Image, Video, Music, Presentation, Mic, Sparkles, Check, Shield, Gem } from 'lucide-react';
import { createPortal } from 'react-dom';
import { redirectToCheckout } from '../../lib/stripeService';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

interface PricingPopupProps {
    isOpen: boolean;
    onClose: () => void;
    isDark?: boolean;
}

const PLANS = [
    {
        id: 'free',
        name: 'Free',
        price: 0,
        period: 'forever',
        tokens: '15K',
        tokensNum: 15000,
        description: 'Try KroniQ AI',
        icon: Star,
        logo: null,
        gradient: 'from-emerald-600/20 to-teal-600/20',
        accentColor: 'emerald',
        limits: {
            messages: '50/mo',
            images: '2/mo',
            videos: '—',
            music: '—',
            ppt: '—',
            tts: '4/mo',
        },
        tierLevel: 0,
    },
    {
        id: 'starter',
        name: 'Starter',
        price: 5,
        period: 'month',
        tokens: '100K',
        tokensNum: 100000,
        description: 'Basic access',
        icon: Star,
        iconColor: 'text-teal-400',
        logo: '/stripe-starter.png',
        gradient: 'from-emerald-500/20 to-cyan-500/20',
        accentColor: 'emerald',
        limits: {
            messages: '45/mo',
            images: '14/mo',
            videos: '9/mo',
            music: '9/mo',
            ppt: '5/mo',
            tts: '5/mo',
        },
        tier: 'starter' as const,
        tierLevel: 1,
        priceId: 'price_1Skd0CFBTh5tg3ftUqapwbFS',
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 12,
        period: 'month',
        tokens: '220K',
        tokensNum: 220000,
        description: 'For creators',
        icon: Gem,
        iconColor: 'text-purple-400',
        logo: '/stripe-pro.png',
        gradient: 'from-emerald-400/30 to-teal-400/30',
        accentColor: 'emerald',
        popular: true,
        limits: {
            messages: '110/mo',
            images: '33/mo',
            videos: '21/mo',
            music: '20/mo',
            ppt: '12/mo',
            tts: '12/mo',
        },
        tier: 'pro' as const,
        tierLevel: 2,
        priceId: 'price_1Skd4YFBTh5tg3ftMYD6xjBg',
    },
    {
        id: 'premium',
        name: 'Premium',
        price: 24,
        period: 'month',
        tokens: '560K',
        tokensNum: 560000,
        description: 'Ultimate power',
        icon: Crown,
        iconColor: 'text-amber-400',
        logo: '/stripe-premium.png',
        gradient: 'from-emerald-300/30 to-teal-300/30',
        accentColor: 'emerald',
        limits: {
            messages: '220/mo',
            images: '66/mo',
            videos: '42/mo',
            music: '41/mo',
            ppt: '20/mo',
            tts: '25/mo',
        },
        tier: 'premium' as const,
        tierLevel: 3,
        priceId: 'price_1Sld4AFBTh5tg3ftFmsbmBpO',
    },
];

const LIMIT_ICONS = {
    images: Image,
    videos: Video,
    music: Music,
    ppt: Presentation,
    tts: Mic,
};

const LIMIT_LABELS = {
    images: 'Images',
    videos: 'Videos',
    music: 'Music',
    ppt: 'PPT',
    tts: 'TTS',
};

const getTierLevel = (tier: string): number => {
    switch (tier.toUpperCase()) {
        case 'PREMIUM': return 3;
        case 'PRO': return 2;
        case 'STARTER': return 1;
        default: return 0;
    }
};

export const PricingPopup: React.FC<PricingPopupProps> = ({ isOpen, onClose }) => {
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const { currentUser, userTier } = useAuth();
    const { currentTheme } = useTheme();
    const isLight = currentTheme === 'pure-white';

    if (!isOpen) return null;

    const currentTierLevel = getTierLevel(userTier);

    const getButtonState = (planId: string, planTierLevel: number) => {
        if (planTierLevel === currentTierLevel) {
            return { text: 'Current Plan', disabled: true };
        }
        if (planTierLevel < currentTierLevel) {
            return { text: 'Downgrade', disabled: false, isDowngrade: true };
        }
        if (planId === 'premium') return { text: 'Get Premium →', disabled: false };
        if (planId === 'pro') return { text: 'Get Pro →', disabled: false };
        if (planId === 'starter') return { text: 'Get Starter →', disabled: false };
        return { text: 'Get Started', disabled: false };
    };

    const handleSubscribe = (planId: string, tier?: string, priceId?: string, isDowngrade?: boolean) => {
        if (isDowngrade) {
            import('../../lib/stripeService').then(({ openBillingPortal }) => {
                openBillingPortal();
            });
            return;
        }

        if (!tier || !priceId) return;

        const planLevel = getTierLevel(tier);
        if (planLevel === currentTierLevel) return;

        if (planLevel > currentTierLevel) {
            setIsLoading(planId);
            redirectToCheckout({
                priceId,
                tier: tier as 'pro' | 'premium',
                email: currentUser?.email || undefined,
            });
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
            {/* Backdrop */}
            <div className={`absolute inset-0 backdrop-blur-xl ${isLight ? 'bg-white/90' : 'bg-black/90'}`} />

            {/* Animated glow orbs - only on dark mode */}
            {!isLight && (
                <>
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
                    <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px] animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[30rem] bg-gradient-to-r from-emerald-500/5 via-teal-500/10 to-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
                </>
            )}

            {/* Modal */}
            <div
                className="relative w-full max-w-6xl overflow-hidden max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* 3D Glass Card Container */}
                <div className={`relative rounded-3xl border shadow-2xl ${isLight
                    ? 'bg-white border-gray-200 shadow-gray-200/50'
                    : 'border-emerald-500/20 shadow-emerald-500/10'}`}
                    style={{
                        background: isLight
                            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 253, 250, 0.9) 100%)'
                            : 'linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(0, 0, 0, 0.8) 50%, rgba(20, 184, 166, 0.05) 100%)',
                        backdropFilter: 'blur(20px)',
                    }}
                >
                    {/* Top glow line */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className={`absolute top-4 right-4 p-2 rounded-xl transition-all z-10 border ${isLight
                            ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 border-gray-200'
                            : 'text-white/60 hover:text-white hover:bg-white/10 border-white/10'
                            }`}
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="p-6 lg:p-8 relative">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border mb-4 shadow-lg ${isLight
                                ? 'bg-emerald-50 border-emerald-200 shadow-emerald-100'
                                : 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-emerald-500/30 shadow-emerald-500/10'}`}>
                                <Zap className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                                <span className={`text-xs font-bold tracking-wider uppercase ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>Choose Your Plan</span>
                            </div>

                            <h2 className={`text-3xl lg:text-4xl font-black mb-3 ${isLight ? 'text-gray-900' : 'text-white'}`}>
                                Unlock <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 bg-clip-text text-transparent">Full Power</span>
                            </h2>
                            <p className={`text-sm max-w-md mx-auto ${isLight ? 'text-gray-500' : 'text-white/50'}`}>
                                Tokens power all AI features • Daily limits prevent overuse
                            </p>
                        </div>

                        {/* Plans Grid - 4 columns */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {PLANS.map((plan) => {
                                const buttonState = getButtonState(plan.id, plan.tierLevel);
                                const Icon = plan.icon;
                                const isPaid = plan.price > 0;

                                return (
                                    <div
                                        key={plan.id}
                                        className={`relative rounded-2xl p-5 transition-all duration-500 flex flex-col group
                                            ${plan.popular
                                                ? isLight
                                                    ? 'lg:-translate-y-3 ring-2 ring-emerald-500 shadow-2xl shadow-emerald-200'
                                                    : 'lg:-translate-y-3 ring-2 ring-emerald-400/60 shadow-2xl shadow-emerald-500/20'
                                                : isLight
                                                    ? 'hover:ring-1 hover:ring-emerald-300 hover:shadow-xl hover:shadow-emerald-100'
                                                    : 'hover:ring-1 hover:ring-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/10'
                                            }`}
                                        style={{
                                            background: plan.popular
                                                ? isLight
                                                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(255, 255, 255, 1) 100%)'
                                                    : 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(0, 0, 0, 0.6) 100%)'
                                                : isLight
                                                    ? 'linear-gradient(135deg, rgba(255,255,255,1) 0%, rgba(249,250,251,1) 100%)'
                                                    : 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.4) 100%)',
                                            border: plan.popular
                                                ? 'none'
                                                : isLight
                                                    ? '1px solid rgba(16, 185, 129, 0.2)'
                                                    : '1px solid rgba(16, 185, 129, 0.15)',
                                        }}
                                    >
                                        {/* Popular badge with 3D effect */}
                                        {plan.popular && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-emerald-400 to-teal-400 text-black shadow-lg shadow-emerald-500/40">
                                                ⭐ Best Value
                                            </div>
                                        )}

                                        {/* Header with Logo */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-lg transition-shadow ${isLight
                                                ? `bg-gradient-to-br ${plan.gradient.replace('/20', '/15').replace('/30', '/20')} border-emerald-200 shadow-emerald-100 group-hover:shadow-emerald-200`
                                                : `bg-gradient-to-br ${plan.gradient} border-emerald-500/20 shadow-emerald-500/20 group-hover:shadow-emerald-500/30`}`}>
                                                {plan.logo ? (
                                                    <img src={plan.logo} alt="" className="w-7 h-7 object-contain" />
                                                ) : (
                                                    <Icon className={`w-6 h-6 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className={`text-lg font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>{plan.name}</h3>
                                                <p className={`text-xs ${isLight ? 'text-emerald-600/70' : 'text-emerald-400/70'}`}>{plan.description}</p>
                                            </div>
                                        </div>

                                        {/* Price with 3D effect */}
                                        <div className="flex items-baseline gap-1 mb-4">
                                            <span className={`text-lg ${isLight ? 'text-emerald-600/70' : 'text-emerald-400/70'}`}>$</span>
                                            <span className={`text-4xl font-black ${isLight ? 'text-gray-900' : 'text-white drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]'}`}>{plan.price}</span>
                                            <span className={`text-sm ${isLight ? 'text-gray-400' : 'text-white/40'}`}>/{plan.period}</span>
                                        </div>

                                        {/* Tokens Display - Glassy */}
                                        <div className={`rounded-xl p-3 mb-4 border ${isLight
                                            ? 'bg-emerald-50 border-emerald-200'
                                            : 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-emerald-500/20'}`}>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-2xl font-black bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                                                    {plan.tokens}
                                                </span>
                                                <span className={`text-xs ${isLight ? 'text-emerald-600/60' : 'text-emerald-400/60'}`}>tokens/mo</span>
                                            </div>
                                            <p className={`text-[10px] mt-1 ${isLight ? 'text-gray-400' : 'text-white/40'}`}>Powers chat, images, video & more</p>
                                        </div>

                                        {/* Generation Limits */}
                                        <div className="mb-4 flex-grow">
                                            <p className={`text-[10px] font-bold mb-2 uppercase tracking-wider ${isLight ? 'text-emerald-600/50' : 'text-emerald-400/50'}`}>Monthly Generation Limits</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {(Object.entries(LIMIT_ICONS) as [keyof typeof LIMIT_ICONS, typeof Image][])
                                                    .map(([key]) => {
                                                        const LimitIcon = LIMIT_ICONS[key];
                                                        const value = plan.limits[key];
                                                        const isDisabled = value === '—';
                                                        return (
                                                            <div
                                                                key={key}
                                                                className={`rounded-lg p-2 flex items-center gap-2 transition-all
                                                                    ${isDisabled
                                                                        ? isLight ? 'bg-gray-50 opacity-40' : 'bg-white/5 opacity-30'
                                                                        : isLight
                                                                            ? 'bg-emerald-50 border border-emerald-100'
                                                                            : 'bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/10'
                                                                    }`}
                                                            >
                                                                <LimitIcon className={`w-3.5 h-3.5 ${isDisabled ? (isLight ? 'text-gray-300' : 'text-white/30') : (isLight ? 'text-emerald-600' : 'text-emerald-400')}`} />
                                                                <div className="flex-1 min-w-0">
                                                                    <p className={`text-xs font-bold ${isDisabled ? (isLight ? 'text-gray-300' : 'text-white/30') : (isLight ? 'text-gray-900' : 'text-white')}`}>{value}</p>
                                                                    <p className={`text-[8px] ${isLight ? 'text-gray-400' : 'text-white/30'}`}>{LIMIT_LABELS[key]}</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        </div>

                                        {/* CTA Button with 3D effect */}
                                        <button
                                            onClick={() => handleSubscribe(plan.id, (plan as any).tier, (plan as any).priceId, buttonState.isDowngrade)}
                                            disabled={buttonState.disabled || isLoading === plan.id}
                                            className={`
                                                w-full py-3 rounded-xl font-bold text-sm
                                                flex items-center justify-center gap-2 transition-all duration-300 mt-auto
                                                ${buttonState.disabled
                                                    ? 'bg-white/5 text-white/30 cursor-not-allowed border border-white/10'
                                                    : isPaid
                                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]'
                                                        : 'bg-white/10 text-white border border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50'}
                                            `}
                                        >
                                            {isLoading === plan.id ? (
                                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                buttonState.text
                                            )}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Footer */}
                        <div className={`mt-8 pt-6 border-t ${isLight ? 'border-gray-200' : 'border-emerald-500/10'}`}>
                            <div className={`flex items-center justify-center gap-6 text-xs ${isLight ? 'text-gray-500' : 'text-white/40'}`}>
                                <div className="flex items-center gap-2">
                                    <Shield className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                                    <span>Stripe secure</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                                    <span>Cancel anytime</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Zap className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                                    <span>Limits reset monthly</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default PricingPopup;
