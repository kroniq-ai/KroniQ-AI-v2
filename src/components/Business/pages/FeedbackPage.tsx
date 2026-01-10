/**
 * Feedback Page — Customer Agent
 * Customer feedback and requests
 */

import React, { useState } from 'react';
import {
    MessageCircle,
    Plus,
    ThumbsUp,
    ThumbsDown,
    X,
    Clock,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

interface FeedbackPageProps {
    isDark: boolean;
}

interface FeedbackItem {
    id: string;
    content: string;
    customer: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    status: 'new' | 'reviewed' | 'actioned';
    date: Date;
}

const SENTIMENT_CONFIG = {
    positive: { icon: ThumbsUp, color: { dark: 'text-emerald-400', light: 'text-emerald-600' } },
    negative: { icon: ThumbsDown, color: { dark: 'text-red-400', light: 'text-red-500' } },
    neutral: { icon: MessageCircle, color: { dark: 'text-gray-400', light: 'text-gray-500' } }
};

const STATUS_CONFIG = {
    new: { label: 'New', icon: Clock, color: { dark: 'bg-yellow-500/20 text-yellow-400', light: 'bg-yellow-100 text-yellow-700' } },
    reviewed: { label: 'Reviewed', icon: CheckCircle, color: { dark: 'bg-blue-500/20 text-blue-400', light: 'bg-blue-100 text-blue-700' } },
    actioned: { label: 'Actioned', icon: CheckCircle, color: { dark: 'bg-emerald-500/20 text-emerald-400', light: 'bg-emerald-100 text-emerald-700' } }
};

export const FeedbackPage: React.FC<FeedbackPageProps> = ({ isDark }) => {
    const [feedback, setFeedback] = useState<FeedbackItem[]>([
        { id: '1', content: 'Love the new dashboard design! So much cleaner.', customer: 'Sarah M.', sentiment: 'positive', status: 'reviewed', date: new Date() },
        { id: '2', content: 'The export feature is too slow for large datasets', customer: 'John D.', sentiment: 'negative', status: 'new', date: new Date(Date.now() - 86400000) },
        { id: '3', content: 'Would be great to have Zapier integration', customer: 'Mike R.', sentiment: 'neutral', status: 'new', date: new Date(Date.now() - 86400000 * 2) },
        { id: '4', content: 'Customer support was incredibly helpful!', customer: 'Lisa K.', sentiment: 'positive', status: 'actioned', date: new Date(Date.now() - 86400000 * 3) },
        { id: '5', content: 'Pricing is a bit confusing, need clearer comparison', customer: 'Tom B.', sentiment: 'negative', status: 'reviewed', date: new Date(Date.now() - 86400000 * 5) },
    ]);

    const [showAddModal, setShowAddModal] = useState(false);
    const [newFeedback, setNewFeedback] = useState({ content: '', customer: '', sentiment: 'neutral' as const });

    const positiveCount = feedback.filter(f => f.sentiment === 'positive').length;
    const negativeCount = feedback.filter(f => f.sentiment === 'negative').length;
    const newCount = feedback.filter(f => f.status === 'new').length;

    const handleAddFeedback = () => {
        if (newFeedback.content) {
            setFeedback(prev => [{
                id: Date.now().toString(),
                content: newFeedback.content,
                customer: newFeedback.customer || 'Anonymous',
                sentiment: newFeedback.sentiment,
                status: 'new',
                date: new Date()
            }, ...prev]);
            setNewFeedback({ content: '', customer: '', sentiment: 'neutral' });
            setShowAddModal(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <MessageCircle className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-emerald-500/60' : 'text-emerald-600/80'}`}>
                            Customer Agent
                        </span>
                    </div>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Feedback</h1>
                </div>
                <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-400">
                    <Plus className="w-4 h-4" /> Log Feedback
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className={`p-4 rounded-2xl ${isDark ? 'bg-[#0c0c0c] border border-emerald-500/20' : 'bg-white border border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                        <ThumbsUp className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={`text-xs font-medium ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Positive</span>
                    </div>
                    <p className={`text-xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{positiveCount}</p>
                </div>
                <div className={`p-4 rounded-2xl ${isDark ? 'bg-[#0c0c0c] border border-red-500/20' : 'bg-white border border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                        <ThumbsDown className={`w-4 h-4 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
                        <span className={`text-xs font-medium ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Negative</span>
                    </div>
                    <p className={`text-xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{negativeCount}</p>
                </div>
                <div className={`p-4 rounded-2xl ${isDark ? 'bg-[#0c0c0c] border border-yellow-500/20' : 'bg-white border border-gray-200'}`}>
                    <div className="flex items-center gap-2">
                        <Clock className={`w-4 h-4 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                        <span className={`text-xs font-medium ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Pending</span>
                    </div>
                    <p className={`text-xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{newCount}</p>
                </div>
            </div>

            {/* Feedback List */}
            <div className="flex-1 space-y-3">
                {feedback.map(item => {
                    const sentimentConfig = SENTIMENT_CONFIG[item.sentiment];
                    const statusConfig = STATUS_CONFIG[item.status];
                    const SentimentIcon = sentimentConfig.icon;
                    return (
                        <div key={item.id} className={`p-4 rounded-2xl ${isDark ? 'bg-[#0c0c0c] border border-white/5' : 'bg-white border border-gray-200'}`}>
                            <div className="flex items-start gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                                    <SentimentIcon className={`w-4 h-4 ${isDark ? sentimentConfig.color.dark : sentimentConfig.color.light}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>"{item.content}"</p>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xs font-medium ${isDark ? 'text-white/50' : 'text-gray-500'}`}>{item.customer}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${isDark ? statusConfig.color.dark : statusConfig.color.light}`}>
                                            {statusConfig.label}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
                    <div className={`relative w-full max-w-md p-6 rounded-3xl ${isDark ? 'bg-[#0c0c0c]' : 'bg-white'}`}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Log Feedback</h2>
                            <button onClick={() => setShowAddModal(false)} className={`p-2 rounded-xl ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}>
                                <X className={`w-5 h-5 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
                            </button>
                        </div>
                        <div className="space-y-4 mb-6">
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>Feedback</label>
                                <textarea value={newFeedback.content} onChange={(e) => setNewFeedback(prev => ({ ...prev, content: e.target.value }))} placeholder="What did the customer say?" rows={3} className={`w-full px-4 py-3 rounded-xl text-sm border outline-none resize-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-gray-50 border-gray-200 text-gray-900'}`} />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>Customer</label>
                                <input type="text" value={newFeedback.customer} onChange={(e) => setNewFeedback(prev => ({ ...prev, customer: e.target.value }))} placeholder="Name or email" className={`w-full px-4 py-3 rounded-xl text-sm border outline-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-gray-50 border-gray-200 text-gray-900'}`} />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>Sentiment</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['positive', 'neutral', 'negative'] as const).map(s => (
                                        <button key={s} onClick={() => setNewFeedback(prev => ({ ...prev, sentiment: s }))} className={`py-2 px-3 rounded-xl text-xs font-medium capitalize ${newFeedback.sentiment === s ? 'bg-emerald-500 text-white' : (isDark ? 'bg-white/5 text-white/50' : 'bg-gray-100 text-gray-500')}`}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <button onClick={handleAddFeedback} disabled={!newFeedback.content} className={`w-full py-3 rounded-xl text-sm font-semibold ${newFeedback.content ? 'bg-emerald-500 text-white hover:bg-emerald-400' : (isDark ? 'bg-white/5 text-white/20' : 'bg-gray-100 text-gray-300')}`}>
                            Log Feedback
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeedbackPage;
