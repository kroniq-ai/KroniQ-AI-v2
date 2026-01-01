/**
 * Upgrade Prompt Modal
 * Shows when users hit limits or try to access premium features
 */

import React from 'react';
import { X, Check, Sparkles, Zap, Crown, ArrowRight, Lock } from 'lucide-react';
import { PRICING_PLANS, getUpgradeBenefits, type PlanType } from '../../lib/pricingPlans';

// ===== TYPES =====

interface UpgradePromptProps {
    isOpen: boolean;
    onClose: () => void;
    currentPlan: PlanType;
    targetPlan?: PlanType;
    reason?: string;
    featureBlocked?: string;
    isDark?: boolean;
}

// Plan icons
const PLAN_ICONS = {
    free: Sparkles,
    pro: Zap,
    premium: Crown,
};

// ===== COMPONENT =====

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
    isOpen,
    onClose,
    currentPlan,
    targetPlan = 'pro',
    reason,
    featureBlocked,
    isDark = true,
}) => {
    if (!isOpen) return null;

    const target = PRICING_PLANS[targetPlan];
    const benefits = getUpgradeBenefits(currentPlan, targetPlan);
    const TargetIcon = PLAN_ICONS[targetPlan];

    const handleUpgrade = () => {
        // Mock upgrade - will be replaced with actual payment flow
        console.log('Upgrade to:', targetPlan);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`
        relative w-full max-w-md rounded-3xl overflow-hidden
        ${isDark ? 'bg-[#0f0f0f] border border-white/10' : 'bg-white border border-gray-200'}
        shadow-2xl animate-fade-in-up
      `}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className={`absolute top-4 right-4 p-2 rounded-full z-10 ${isDark ? 'text-white/50 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header with gradient */}
                <div className={`
          px-8 pt-8 pb-6 text-center
          ${targetPlan === 'premium'
                        ? 'bg-gradient-to-b from-purple-500/20 to-transparent'
                        : 'bg-gradient-to-b from-emerald-500/20 to-transparent'}
        `}>
                    <div className={`
            w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center
            ${targetPlan === 'premium'
                            ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                            : 'bg-gradient-to-br from-emerald-500 to-teal-500'}
          `}>
                        <TargetIcon className="w-8 h-8 text-white" />
                    </div>

                    <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Upgrade to {target.name}
                    </h2>

                    {reason && (
                        <p className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                            {reason}
                        </p>
                    )}

                    {featureBlocked && (
                        <div className={`
              inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full text-sm
              ${isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'}
            `}>
                            <Lock className="w-3.5 h-3.5" />
                            {featureBlocked} requires {target.name}
                        </div>
                    )}
                </div>

                {/* Benefits */}
                <div className="px-8 py-6">
                    <p className={`text-sm font-medium mb-4 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                        What you'll unlock:
                    </p>

                    <div className="space-y-3">
                        {target.features.slice(0, 6).map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-3">
                                <div className={`
                  w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                  ${targetPlan === 'premium' ? 'bg-purple-500/20' : 'bg-emerald-500/20'}
                `}>
                                    <Check className={`w-3 h-3 ${targetPlan === 'premium' ? 'text-purple-400' : 'text-emerald-400'}`} />
                                </div>
                                <span className={`text-sm ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                                    {feature}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pricing */}
                <div className={`px-8 py-6 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                    <div className="flex items-baseline justify-center gap-1 mb-4">
                        <span className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            ${target.price}
                        </span>
                        <span className={`${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                            /{target.period}
                        </span>
                    </div>

                    <button
                        onClick={handleUpgrade}
                        className={`
              w-full py-4 rounded-2xl font-bold transition-all duration-300 
              hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2
              ${targetPlan === 'premium'
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/30'
                                : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/30'}
            `}
                    >
                        Upgrade to {target.name}
                        <ArrowRight className="w-5 h-5" />
                    </button>

                    <p className={`text-center text-xs mt-3 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                        Cancel anytime · No commitment
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UpgradePrompt;
