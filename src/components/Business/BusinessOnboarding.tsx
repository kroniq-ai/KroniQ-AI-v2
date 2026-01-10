/**
 * Business Onboarding Wizard
 * First-time setup for new business contexts
 * Premium green design with step-by-step flow
 */

import React, { useState } from 'react';
import {
    Building2,
    Target,
    Users,
    Sparkles,
    ArrowRight,
    ArrowLeft,
    CheckCircle,
    Rocket
} from 'lucide-react';
import { useBusinessContext } from '../../contexts/BusinessContext';

interface BusinessOnboardingProps {
    isDark: boolean;
    onComplete: () => void;
    onClose: () => void;
}

// Business stages
const BUSINESS_STAGES = [
    { id: 'idea', label: 'Idea Stage', description: 'Validating the concept' },
    { id: 'mvp', label: 'Building MVP', description: 'Creating first version' },
    { id: 'early', label: 'Early Traction', description: 'First customers onboard' },
    { id: 'growth', label: 'Growth', description: 'Scaling the business' },
];

// Industries
const INDUSTRIES = [
    'SaaS', 'E-commerce', 'Fintech', 'Healthcare', 'Education',
    'Consumer', 'B2B Services', 'Marketplace', 'AI/ML', 'Other'
];

export const BusinessOnboarding: React.FC<BusinessOnboardingProps> = ({
    isDark,
    onComplete,
    onClose,
}) => {
    const { createContext } = useBusinessContext();

    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        stage: '',
        industry: '',
        targetCustomer: '',
        mainChallenge: '',
    });

    const totalSteps = 3;

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Map stage values to match BusinessStage type
            const stageMap: Record<string, 'idea' | 'mvp' | 'growth' | 'scaling'> = {
                'idea': 'idea',
                'mvp': 'mvp',
                'early': 'growth',  // Map early traction to growth
                'growth': 'scaling' // Map growth to scaling
            };

            const result = await createContext({
                name: formData.name || 'My Business',
                industry: formData.industry || 'Other',
                target_audience: formData.targetCustomer || '',
                stage: stageMap[formData.stage] || 'idea',
                primary_goals: formData.mainChallenge
                    ? [formData.mainChallenge]
                    : ['Build and launch product'],
            });

            if (result.success) {
                onComplete();
            } else {
                console.error('Failed to create context:', result.error);
                alert(result.error || 'Failed to create business context');
            }
        } catch (error) {
            console.error('Onboarding error:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const canProceed = () => {
        if (step === 1) return formData.name.trim().length > 0;
        if (step === 2) return formData.stage.length > 0;
        return true;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div
                className={`
                    relative w-full max-w-lg rounded-2xl overflow-hidden
                    ${isDark ? 'bg-[#0c0c0c]' : 'bg-white'}
                `}
                style={{
                    boxShadow: isDark
                        ? '0 0 60px rgba(16, 185, 129, 0.1), 0 0 30px rgba(16, 185, 129, 0.05)'
                        : '0 20px 60px rgba(0,0,0,0.2)'
                }}
            >
                {/* Grid pattern */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-30"
                    style={{
                        backgroundImage: isDark
                            ? `linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px)`
                            : 'none',
                        backgroundSize: '20px 20px'
                    }}
                />

                {/* Header */}
                <div className={`
                    relative px-6 py-5 border-b
                    ${isDark ? 'border-emerald-500/10' : 'border-gray-100'}
                `}>
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-emerald-500/20 to-emerald-600/10"
                            style={{ boxShadow: isDark ? '0 0 20px rgba(16, 185, 129, 0.3)' : 'none' }}
                        >
                            <Sparkles className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h2
                                className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                            >
                                Setup Your Business
                            </h2>
                            <p className={`text-xs ${isDark ? 'text-emerald-500/50' : 'text-emerald-600'}`}>
                                Step {step} of {totalSteps}
                            </p>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className={`mt-4 h-1 rounded-full ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-100'}`}>
                        <div
                            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                            style={{
                                width: `${(step / totalSteps) * 100}%`,
                                boxShadow: isDark ? '0 0 10px rgba(16, 185, 129, 0.5)' : 'none'
                            }}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="relative p-6">
                    {/* Step 1: Business Name */}
                    {step === 1 && (
                        <div className="space-y-5">
                            <div className="text-center mb-6">
                                <Building2 className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
                                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                                    style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                    What's your business called?
                                </h3>
                            </div>

                            <div>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., KroniQ AI"
                                    className={`
                                        w-full px-4 py-3.5 rounded-xl text-sm font-medium
                                        border transition-all duration-200
                                        ${isDark
                                            ? 'bg-emerald-500/5 border-emerald-500/20 text-white placeholder-emerald-500/30 focus:border-emerald-500/50'
                                            : 'bg-emerald-50 border-emerald-100 text-gray-900 placeholder-emerald-400 focus:border-emerald-400'}
                                        outline-none
                                    `}
                                    style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                                />
                            </div>

                            <div>
                                <label className={`text-xs font-medium ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                                    Brief description (optional)
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="What does your business do?"
                                    rows={3}
                                    className={`
                                        w-full mt-2 px-4 py-3 rounded-xl text-sm
                                        border transition-all duration-200 resize-none
                                        ${isDark
                                            ? 'bg-emerald-500/5 border-emerald-500/20 text-white placeholder-emerald-500/30 focus:border-emerald-500/50'
                                            : 'bg-emerald-50 border-emerald-100 text-gray-900 placeholder-emerald-400 focus:border-emerald-400'}
                                        outline-none
                                    `}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Stage */}
                    {step === 2 && (
                        <div className="space-y-5">
                            <div className="text-center mb-6">
                                <Rocket className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
                                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                                    style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                    What stage are you at?
                                </h3>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {BUSINESS_STAGES.map((stage) => (
                                    <button
                                        key={stage.id}
                                        onClick={() => setFormData({ ...formData, stage: stage.id })}
                                        className={`
                                            p-4 rounded-xl text-left transition-all duration-200
                                            border
                                            ${formData.stage === stage.id
                                                ? (isDark
                                                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                                                    : 'bg-emerald-100 border-emerald-400 text-emerald-700')
                                                : (isDark
                                                    ? 'bg-emerald-500/5 border-emerald-500/10 text-white/60 hover:border-emerald-500/30'
                                                    : 'bg-emerald-50 border-emerald-100 text-gray-600 hover:border-emerald-300')}
                                        `}
                                        style={{
                                            boxShadow: formData.stage === stage.id && isDark
                                                ? '0 0 15px rgba(16, 185, 129, 0.2)'
                                                : 'none'
                                        }}
                                    >
                                        <p className="font-semibold text-sm" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                            {stage.label}
                                        </p>
                                        <p className={`text-xs mt-0.5 ${isDark ? 'opacity-50' : 'opacity-70'}`}>
                                            {stage.description}
                                        </p>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-4">
                                <label className={`text-xs font-medium ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                                    Industry
                                </label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {INDUSTRIES.slice(0, 6).map((ind) => (
                                        <button
                                            key={ind}
                                            onClick={() => setFormData({ ...formData, industry: ind })}
                                            className={`
                                                px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                                                ${formData.industry === ind
                                                    ? (isDark
                                                        ? 'bg-emerald-500/20 text-emerald-400'
                                                        : 'bg-emerald-200 text-emerald-700')
                                                    : (isDark
                                                        ? 'bg-emerald-500/5 text-white/50 hover:bg-emerald-500/10'
                                                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100')}
                                            `}
                                        >
                                            {ind}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Focus */}
                    {step === 3 && (
                        <div className="space-y-5">
                            <div className="text-center mb-6">
                                <Target className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-emerald-400' : 'text-emerald-500'}`} />
                                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                                    style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                    Almost done!
                                </h3>
                            </div>

                            <div>
                                <label className={`text-xs font-medium ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                                    Who is your target customer? (optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.targetCustomer}
                                    onChange={(e) => setFormData({ ...formData, targetCustomer: e.target.value })}
                                    placeholder="e.g., Early-stage founders"
                                    className={`
                                        w-full mt-2 px-4 py-3 rounded-xl text-sm
                                        border transition-all duration-200
                                        ${isDark
                                            ? 'bg-emerald-500/5 border-emerald-500/20 text-white placeholder-emerald-500/30 focus:border-emerald-500/50'
                                            : 'bg-emerald-50 border-emerald-100 text-gray-900 placeholder-emerald-400 focus:border-emerald-400'}
                                        outline-none
                                    `}
                                />
                            </div>

                            <div>
                                <label className={`text-xs font-medium ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                                    What's your main challenge right now? (optional)
                                </label>
                                <textarea
                                    value={formData.mainChallenge}
                                    onChange={(e) => setFormData({ ...formData, mainChallenge: e.target.value })}
                                    placeholder="e.g., Getting first 10 paying customers"
                                    rows={3}
                                    className={`
                                        w-full mt-2 px-4 py-3 rounded-xl text-sm
                                        border transition-all duration-200 resize-none
                                        ${isDark
                                            ? 'bg-emerald-500/5 border-emerald-500/20 text-white placeholder-emerald-500/30 focus:border-emerald-500/50'
                                            : 'bg-emerald-50 border-emerald-100 text-gray-900 placeholder-emerald-400 focus:border-emerald-400'}
                                        outline-none
                                    `}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={`
                    relative px-6 py-4 border-t flex items-center justify-between
                    ${isDark ? 'border-emerald-500/10' : 'border-gray-100'}
                `}>
                    {step > 1 ? (
                        <button
                            onClick={handleBack}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium
                                transition-all duration-200
                                ${isDark
                                    ? 'text-white/50 hover:text-white'
                                    : 'text-gray-500 hover:text-gray-700'}
                            `}
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back
                        </button>
                    ) : (
                        <button
                            onClick={onClose}
                            className={`text-sm ${isDark ? 'text-white/40 hover:text-white/60' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Cancel
                        </button>
                    )}

                    {step < totalSteps ? (
                        <button
                            onClick={handleNext}
                            disabled={!canProceed()}
                            className={`
                                flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                                transition-all duration-200
                                ${canProceed()
                                    ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                                    : (isDark
                                        ? 'bg-emerald-500/10 text-emerald-500/30'
                                        : 'bg-emerald-100 text-emerald-400')}
                            `}
                            style={{
                                boxShadow: canProceed() && isDark
                                    ? '0 0 20px rgba(16, 185, 129, 0.3)'
                                    : 'none'
                            }}
                        >
                            Continue
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className={`
                                flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                                bg-emerald-500 text-white hover:bg-emerald-400
                                transition-all duration-200
                            `}
                            style={{
                                boxShadow: isDark ? '0 0 20px rgba(16, 185, 129, 0.3)' : 'none'
                            }}
                        >
                            {isSubmitting ? (
                                <>Creating...</>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    Launch Business OS
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BusinessOnboarding;
