/**
 * Business Context Form
 * Modal form for creating/editing business contexts
 */

import React, { useState } from 'react';
import { X, Briefcase, Building2, Users, Rocket, Target } from 'lucide-react';
import { useBusinessContext } from '../../contexts/BusinessContext';
import type { BusinessStage, CreateBusinessContextInput } from '../../lib/businessContextService';

// ===== TYPES =====

interface BusinessContextFormProps {
    isDark: boolean;
    onClose: () => void;
    editContext?: {
        id: string;
        name: string;
        industry: string;
        target_audience: string;
        stage: BusinessStage;
        primary_goals: string[];
    };
}

// ===== STAGE OPTIONS =====

const STAGE_OPTIONS: { value: BusinessStage; label: string; description: string }[] = [
    { value: 'idea', label: 'Idea', description: 'Exploring concepts and validation' },
    { value: 'mvp', label: 'MVP', description: 'Building and testing first product' },
    { value: 'growth', label: 'Growth', description: 'Scaling users and revenue' },
    { value: 'scaling', label: 'Scaling', description: 'Expanding operations' },
];

// ===== GOAL SUGGESTIONS =====

const GOAL_SUGGESTIONS = [
    'Increase revenue',
    'Acquire customers',
    'Launch product',
    'Raise funding',
    'Build team',
    'Enter new market',
    'Improve retention',
    'Reduce costs',
];

// ===== COMPONENT =====

export const BusinessContextForm: React.FC<BusinessContextFormProps> = ({
    isDark,
    onClose,
    editContext,
}) => {
    const { createContext, updateContext } = useBusinessContext();
    const isEditing = !!editContext;

    const [formData, setFormData] = useState<CreateBusinessContextInput>({
        name: editContext?.name || '',
        industry: editContext?.industry || '',
        target_audience: editContext?.target_audience || '',
        stage: editContext?.stage || 'idea',
        primary_goals: editContext?.primary_goals || [],
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            if (!formData.name.trim()) {
                throw new Error('Business name is required');
            }

            let result;
            if (isEditing && editContext) {
                result = await updateContext(editContext.id, formData);
            } else {
                result = await createContext(formData);
            }

            if (result.success) {
                onClose();
            } else {
                setError(result.error || 'An error occurred');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Toggle goal selection
    const toggleGoal = (goal: string) => {
        setFormData(prev => ({
            ...prev,
            primary_goals: prev.primary_goals.includes(goal)
                ? prev.primary_goals.filter(g => g !== goal)
                : [...prev.primary_goals, goal],
        }));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`
        relative w-full max-w-lg rounded-3xl overflow-hidden
        ${isDark ? 'bg-[#0f0f0f] border border-white/10' : 'bg-white border border-gray-200'}
        shadow-2xl
      `}>
                {/* Header */}
                <div className={`
          px-6 py-5 border-b flex items-center justify-between
          ${isDark ? 'border-white/10' : 'border-gray-200'}
        `}>
                    <div className="flex items-center gap-3">
                        <div className={`
              w-10 h-10 rounded-xl flex items-center justify-center
              ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}
            `}>
                            <Briefcase className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        </div>
                        <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {isEditing ? 'Edit Business Context' : 'Create Business Context'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10 text-white/60' : 'hover:bg-gray-100 text-gray-500'}`}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Error Message */}
                    {error && (
                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Business Name */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                            <Building2 className="w-4 h-4 inline mr-2" />
                            Business Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., TechStartup AI"
                            className={`
                w-full px-4 py-3 rounded-xl text-sm
                ${isDark
                                    ? 'bg-white/5 border-white/10 text-white placeholder:text-white/40'
                                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'}
                border focus:outline-none focus:ring-2 focus:ring-emerald-500/50
              `}
                        />
                    </div>

                    {/* Industry */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                            Industry / Niche
                        </label>
                        <input
                            type="text"
                            value={formData.industry}
                            onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                            placeholder="e.g., SaaS, E-commerce, Healthcare"
                            className={`
                w-full px-4 py-3 rounded-xl text-sm
                ${isDark
                                    ? 'bg-white/5 border-white/10 text-white placeholder:text-white/40'
                                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'}
                border focus:outline-none focus:ring-2 focus:ring-emerald-500/50
              `}
                        />
                    </div>

                    {/* Target Audience */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                            <Users className="w-4 h-4 inline mr-2" />
                            Target Audience
                        </label>
                        <input
                            type="text"
                            value={formData.target_audience}
                            onChange={(e) => setFormData(prev => ({ ...prev, target_audience: e.target.value }))}
                            placeholder="e.g., Small business owners, Developers"
                            className={`
                w-full px-4 py-3 rounded-xl text-sm
                ${isDark
                                    ? 'bg-white/5 border-white/10 text-white placeholder:text-white/40'
                                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'}
                border focus:outline-none focus:ring-2 focus:ring-emerald-500/50
              `}
                        />
                    </div>

                    {/* Stage */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                            <Rocket className="w-4 h-4 inline mr-2" />
                            Current Stage
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {STAGE_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, stage: option.value }))}
                                    className={`
                    p-3 rounded-xl text-left transition-all
                    ${formData.stage === option.value
                                            ? 'bg-emerald-500/20 border-emerald-500 ring-1 ring-emerald-500'
                                            : (isDark
                                                ? 'bg-white/5 border-white/10 hover:bg-white/10'
                                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100')}
                    border
                  `}
                                >
                                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {option.label}
                                    </p>
                                    <p className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                                        {option.description}
                                    </p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Primary Goals */}
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                            <Target className="w-4 h-4 inline mr-2" />
                            Primary Goals
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {GOAL_SUGGESTIONS.map((goal) => (
                                <button
                                    key={goal}
                                    type="button"
                                    onClick={() => toggleGoal(goal)}
                                    className={`
                    px-3 py-1.5 rounded-full text-sm transition-all
                    ${formData.primary_goals.includes(goal)
                                            ? 'bg-emerald-500 text-white'
                                            : (isDark
                                                ? 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/10'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200')}
                  `}
                                >
                                    {goal}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting || !formData.name.trim()}
                            className={`
                w-full py-3 rounded-xl font-semibold transition-all
                ${isSubmitting || !formData.name.trim()
                                    ? 'bg-gray-500 text-white/50 cursor-not-allowed'
                                    : 'bg-emerald-500 text-white hover:bg-emerald-600'}
              `}
                        >
                            {isSubmitting
                                ? 'Creating...'
                                : isEditing
                                    ? 'Save Changes'
                                    : 'Create Business Context'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BusinessContextForm;
