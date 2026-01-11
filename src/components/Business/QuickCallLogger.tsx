/**
 * Quick Call Logger Component
 * Log customer calls in 30 seconds with AI summary
 * Part of the "First 5 Minutes WOW" experience
 */

import React, { useState, useEffect } from 'react';
import {
    Phone,
    X,
    Sparkles,
    User,
    Building2,
    FileText,
    ChevronRight,
    CheckCircle,
    Clock,
    AlertTriangle,
    Loader2
} from 'lucide-react';

interface QuickCallLoggerProps {
    isDark: boolean;
    isOpen: boolean;
    onClose: () => void;
    onSave?: (call: CallLog) => void;
}

export interface CallLog {
    id: string;
    customerName: string;
    company?: string;
    notes: string;
    summary?: string;
    painPoints?: string[];
    nextSteps?: string[];
    sentiment?: 'positive' | 'neutral' | 'negative';
    churnRisk?: 'low' | 'medium' | 'high';
    createdAt: Date;
}

export const QuickCallLogger: React.FC<QuickCallLoggerProps> = ({
    isDark,
    isOpen,
    onClose,
    onSave
}) => {
    const [step, setStep] = useState<'input' | 'processing' | 'result'>('input');
    const [customerName, setCustomerName] = useState('');
    const [company, setCompany] = useState('');
    const [notes, setNotes] = useState('');
    const [generatedSummary, setGeneratedSummary] = useState<CallLog | null>(null);

    // Reset when opened
    useEffect(() => {
        if (isOpen) {
            setStep('input');
            setCustomerName('');
            setCompany('');
            setNotes('');
            setGeneratedSummary(null);
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (!customerName.trim() || !notes.trim()) return;

        setStep('processing');

        // Simulate AI processing (in production, this calls the AI service)
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Generate AI summary
        const aiSummary = generateAISummary(notes);
        setGeneratedSummary(aiSummary);
        setStep('result');
    };

    const generateAISummary = (rawNotes: string): CallLog => {
        // In production, this would call the AI service
        // For now, we simulate intelligent extraction
        const lowercaseNotes = rawNotes.toLowerCase();

        // Extract pain points (keywords)
        const painPointKeywords = ['problem', 'issue', 'struggle', 'difficult', 'hate', 'frustrated', 'pain', 'challenge', 'hard'];
        const hasPainPoints = painPointKeywords.some(kw => lowercaseNotes.includes(kw));

        // Detect sentiment
        const positiveKeywords = ['love', 'great', 'awesome', 'amazing', 'happy', 'excited', 'perfect'];
        const negativeKeywords = ['hate', 'terrible', 'awful', 'disappointed', 'angry', 'frustrated', 'cancel'];

        let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
        if (positiveKeywords.some(kw => lowercaseNotes.includes(kw))) sentiment = 'positive';
        if (negativeKeywords.some(kw => lowercaseNotes.includes(kw))) sentiment = 'negative';

        // Detect churn risk
        const churnKeywords = ['cancel', 'leave', 'competitor', 'alternative', 'too expensive', 'not using'];
        const churnRisk: 'low' | 'medium' | 'high' = churnKeywords.some(kw => lowercaseNotes.includes(kw)) ? 'high' : sentiment === 'negative' ? 'medium' : 'low';

        // Generate summary
        const sentences = rawNotes.split(/[.!?]+/).filter(s => s.trim().length > 10);
        const summary = sentences.length > 2
            ? `${sentences[0].trim()}. ${sentences[1]?.trim() || ''}`
            : rawNotes.substring(0, 150);

        // Extract next steps (look for "will", "should", "need to", etc.)
        const nextStepPatterns = ['will', 'should', 'need to', 'going to', 'follow up', 'send', 'schedule'];
        const nextSteps: string[] = [];
        sentences.forEach(sentence => {
            if (nextStepPatterns.some(p => sentence.toLowerCase().includes(p))) {
                nextSteps.push(sentence.trim());
            }
        });

        // Generate pain points
        const painPoints: string[] = [];
        if (hasPainPoints) {
            sentences.forEach(sentence => {
                if (painPointKeywords.some(kw => sentence.toLowerCase().includes(kw))) {
                    painPoints.push(sentence.trim());
                }
            });
        }

        return {
            id: Date.now().toString(),
            customerName,
            company: company || undefined,
            notes: rawNotes,
            summary: summary + (summary.endsWith('.') ? '' : '.'),
            painPoints: painPoints.length > 0 ? painPoints.slice(0, 3) : undefined,
            nextSteps: nextSteps.length > 0 ? nextSteps.slice(0, 3) : ['Follow up within 1 week'],
            sentiment,
            churnRisk,
            createdAt: new Date()
        };
    };

    const handleSave = () => {
        if (generatedSummary && onSave) {
            onSave(generatedSummary);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`relative w-full max-w-lg rounded-2xl overflow-hidden ${isDark ? 'bg-[#0d0d0d] border border-emerald-500/20' : 'bg-white'
                }`}
                style={{ boxShadow: isDark ? '0 0 60px rgba(16, 185, 129, 0.15)' : '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
            >
                {/* Header */}
                <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-emerald-500/10' : 'border-gray-100'
                    }`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'
                            }`}>
                            <Phone className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        </div>
                        <div>
                            <h2 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Log a Call
                            </h2>
                            <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                                {step === 'input' && 'Takes about 30 seconds'}
                                {step === 'processing' && 'AI is analyzing...'}
                                {step === 'result' && 'Here\'s what I found'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/5 text-white/40' : 'hover:bg-gray-100 text-gray-400'
                            }`}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {step === 'input' && (
                        <div className="space-y-4">
                            {/* Customer Name */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/60' : 'text-gray-700'}`}>
                                    <User className="w-4 h-4 inline mr-2" />
                                    Who did you talk to?
                                </label>
                                <input
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="John Smith"
                                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-colors ${isDark
                                            ? 'bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-emerald-500/50'
                                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500'
                                        }`}
                                    autoFocus
                                />
                            </div>

                            {/* Company (Optional) */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/60' : 'text-gray-700'}`}>
                                    <Building2 className="w-4 h-4 inline mr-2" />
                                    Company (optional)
                                </label>
                                <input
                                    type="text"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    placeholder="Acme Corp"
                                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-colors ${isDark
                                            ? 'bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-emerald-500/50'
                                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500'
                                        }`}
                                />
                            </div>

                            {/* Notes */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/60' : 'text-gray-700'}`}>
                                    <FileText className="w-4 h-4 inline mr-2" />
                                    What happened?
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Quick notes about the call... What did they say? Any problems? Next steps?"
                                    rows={4}
                                    className={`w-full px-4 py-3 rounded-xl border outline-none transition-colors resize-none ${isDark
                                            ? 'bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-emerald-500/50'
                                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500'
                                        }`}
                                />
                                <p className={`text-xs mt-1 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                                    Don't worry about formatting — I'll organize it for you
                                </p>
                            </div>

                            {/* Submit */}
                            <button
                                onClick={handleSubmit}
                                disabled={!customerName.trim() || !notes.trim()}
                                className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${customerName.trim() && notes.trim()
                                        ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                                        : (isDark ? 'bg-white/5 text-white/30' : 'bg-gray-100 text-gray-400')
                                    }`}
                            >
                                <Sparkles className="w-4 h-4" />
                                Summarize with AI
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className="py-12 text-center">
                            <Loader2 className={`w-10 h-10 mx-auto mb-4 animate-spin ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                            <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Analyzing your notes...
                            </p>
                            <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                                Extracting insights and next steps
                            </p>
                        </div>
                    )}

                    {step === 'result' && generatedSummary && (
                        <div className="space-y-4">
                            {/* Summary Card */}
                            <div className={`p-4 rounded-xl ${isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-100'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                    <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                                        AI Summary
                                    </span>
                                </div>
                                <p className={`text-sm ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                                    {generatedSummary.summary}
                                </p>
                            </div>

                            {/* Sentiment & Risk */}
                            <div className="flex gap-3">
                                <div className={`flex-1 p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                                    <p className={`text-xs font-medium mb-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Sentiment</p>
                                    <p className={`text-sm font-semibold capitalize ${generatedSummary.sentiment === 'positive' ? 'text-emerald-500' :
                                            generatedSummary.sentiment === 'negative' ? 'text-red-500' :
                                                (isDark ? 'text-white/60' : 'text-gray-600')
                                        }`}>
                                        {generatedSummary.sentiment === 'positive' && '😊 '}
                                        {generatedSummary.sentiment === 'negative' && '😟 '}
                                        {generatedSummary.sentiment === 'neutral' && '😐 '}
                                        {generatedSummary.sentiment}
                                    </p>
                                </div>
                                <div className={`flex-1 p-3 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                                    <p className={`text-xs font-medium mb-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>Churn Risk</p>
                                    <p className={`text-sm font-semibold capitalize ${generatedSummary.churnRisk === 'high' ? 'text-red-500' :
                                            generatedSummary.churnRisk === 'medium' ? 'text-yellow-500' :
                                                'text-emerald-500'
                                        }`}>
                                        {generatedSummary.churnRisk === 'high' && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                                        {generatedSummary.churnRisk}
                                    </p>
                                </div>
                            </div>

                            {/* Pain Points */}
                            {generatedSummary.painPoints && generatedSummary.painPoints.length > 0 && (
                                <div>
                                    <p className={`text-xs font-medium mb-2 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                                        Pain Points Detected
                                    </p>
                                    <ul className="space-y-1">
                                        {generatedSummary.painPoints.map((point, i) => (
                                            <li key={i} className={`text-sm flex items-start gap-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                                                <span className="text-red-500">•</span>
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Next Steps */}
                            {generatedSummary.nextSteps && generatedSummary.nextSteps.length > 0 && (
                                <div>
                                    <p className={`text-xs font-medium mb-2 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                                        Suggested Next Steps
                                    </p>
                                    <ul className="space-y-1">
                                        {generatedSummary.nextSteps.map((step, i) => (
                                            <li key={i} className={`text-sm flex items-start gap-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                                                <CheckCircle className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                                                {step}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Save Button */}
                            <button
                                onClick={handleSave}
                                className="w-full py-3 rounded-xl font-semibold bg-emerald-500 text-white hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Save & Create Follow-up Task
                            </button>

                            <p className={`text-xs text-center ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                                💡 I'll also update this customer's health score
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuickCallLogger;
