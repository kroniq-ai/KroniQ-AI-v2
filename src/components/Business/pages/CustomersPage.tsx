/**
 * Customers Page — Customer Agent Interface
 * Track conversations, insights, and promises
 * Premium green design
 */

import React, { useState } from 'react';
import {
    Users,
    Plus,
    MessageSquare,
    Calendar,
    AlertCircle,
    CheckCircle,
    Clock,
    Search,
    Sparkles
} from 'lucide-react';

// ===== TYPES =====

interface CustomersPageProps {
    isDark: boolean;
}

interface CustomerNote {
    id: string;
    customerName: string;
    company?: string;
    content: string;
    keyTakeaway: string;
    nextStep?: string;
    tags: string[];
    createdAt: Date;
}

// ===== MOCK DATA =====

const MOCK_NOTES: CustomerNote[] = [
    {
        id: '1',
        customerName: 'John Smith',
        company: 'Acme Corp',
        content: 'Had a great call about their onboarding challenges. They lose 30% of users in first week.',
        keyTakeaway: 'Onboarding is a huge pain point',
        nextStep: 'Send proposal by Friday',
        tags: ['enterprise', 'high-value'],
        createdAt: new Date(Date.now() - 86400000)
    },
    {
        id: '2',
        customerName: 'Sarah Johnson',
        company: 'StartupXYZ',
        content: 'Pricing discussion. They want monthly option, not just annual.',
        keyTakeaway: 'Price flexibility matters for startups',
        nextStep: 'Follow up next week',
        tags: ['startup', 'pricing'],
        createdAt: new Date(Date.now() - 172800000)
    }
];

// ===== COMPONENTS =====

interface NoteCardProps {
    note: CustomerNote;
    isDark: boolean;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, isDark }) => {
    const daysAgo = Math.floor((Date.now() - note.createdAt.getTime()) / 86400000);
    const timeLabel = daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`;

    return (
        <div className={`
            p-5 rounded-2xl border transition-all duration-300
            hover:translate-y-[-2px]
            ${isDark
                ? 'bg-[#0d0d0d] border-emerald-500/10 hover:border-emerald-500/30'
                : 'bg-white border-gray-100 hover:shadow-lg'}
        `}>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center
                        ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}
                    `}>
                        <Users className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    </div>
                    <div>
                        <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                            {note.customerName}
                        </h3>
                        {note.company && (
                            <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                                {note.company}
                            </p>
                        )}
                    </div>
                </div>
                <span className={`text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                    {timeLabel}
                </span>
            </div>

            {/* Content */}
            <p className={`text-sm mb-4 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                {note.content}
            </p>

            {/* Key Takeaway */}
            <div className={`
                flex items-start gap-2 p-3 rounded-xl mb-3
                ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}
            `}>
                <Sparkles className={`w-4 h-4 mt-0.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <div>
                    <p className={`text-xs font-medium mb-0.5 ${isDark ? 'text-emerald-500/60' : 'text-emerald-600'}`}>
                        Key Takeaway
                    </p>
                    <p className={`text-sm font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                        {note.keyTakeaway}
                    </p>
                </div>
            </div>

            {/* Next Step */}
            {note.nextStep && (
                <div className="flex items-center gap-2 mb-3">
                    <Clock className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-500/50' : 'text-emerald-500'}`} />
                    <span className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                        Next: {note.nextStep}
                    </span>
                </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
                {note.tags.map((tag, idx) => (
                    <span
                        key={idx}
                        className={`
                            text-xs px-2 py-1 rounded-full
                            ${isDark ? 'bg-emerald-500/10 text-emerald-500/70' : 'bg-gray-100 text-gray-600'}
                        `}
                    >
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );
};

// ===== MAIN COMPONENT =====

export const CustomersPage: React.FC<CustomersPageProps> = ({ isDark }) => {
    const [notes] = useState<CustomerNote[]>(MOCK_NOTES);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredNotes = notes.filter(note =>
        note.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.keyTakeaway.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex-1 overflow-y-auto relative">
            {/* Background grid */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: isDark
                        ? `linear-gradient(rgba(16, 185, 129, 0.02) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(16, 185, 129, 0.02) 1px, transparent 1px)`
                        : 'none',
                    backgroundSize: '50px 50px',
                    maskImage: 'radial-gradient(ellipse 100% 60% at 50% 0%, black 0%, transparent 70%)',
                    WebkitMaskImage: 'radial-gradient(ellipse 100% 60% at 50% 0%, black 0%, transparent 70%)'
                }}
            />

            <div className="relative z-10 max-w-3xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1
                            className={`text-2xl font-bold mb-1 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}
                            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                        >
                            Customer Conversations
                        </h1>
                        <p className={`text-sm ${isDark ? 'text-emerald-500/50' : 'text-emerald-600/70'}`}>
                            Track what your users are telling you
                        </p>
                    </div>
                    <button
                        className={`
                            flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                            bg-emerald-500 text-white hover:bg-emerald-400
                            transition-all duration-200
                        `}
                        style={{
                            boxShadow: isDark ? '0 0 20px rgba(16, 185, 129, 0.3)' : 'none'
                        }}
                    >
                        <Plus className="w-4 h-4" />
                        Log Conversation
                    </button>
                </div>

                {/* Search */}
                <div className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl mb-6
                    ${isDark
                        ? 'bg-emerald-500/5 border border-emerald-500/10'
                        : 'bg-gray-50 border border-gray-100'}
                `}>
                    <Search className={`w-4 h-4 ${isDark ? 'text-emerald-500/40' : 'text-gray-400'}`} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search conversations..."
                        className={`
                            flex-1 bg-transparent border-none outline-none text-sm
                            ${isDark ? 'text-white placeholder-emerald-500/30' : 'text-gray-900 placeholder-gray-400'}
                        `}
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                    />
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { icon: MessageSquare, label: 'Total Conversations', value: notes.length },
                        { icon: AlertCircle, label: 'Pending Follow-ups', value: notes.filter(n => n.nextStep).length },
                        { icon: CheckCircle, label: 'Key Insights', value: notes.length }
                    ].map((stat, idx) => (
                        <div
                            key={idx}
                            className={`
                                p-4 rounded-xl border text-center
                                ${isDark ? 'bg-[#0d0d0d] border-emerald-500/10' : 'bg-white border-gray-100'}
                            `}
                        >
                            <stat.icon className={`w-5 h-5 mx-auto mb-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                {stat.value}
                            </p>
                            <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Notes */}
                <div className="space-y-4">
                    {filteredNotes.length > 0 ? (
                        filteredNotes.map(note => (
                            <NoteCard key={note.id} note={note} isDark={isDark} />
                        ))
                    ) : (
                        <div className={`text-center py-12 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No conversations yet</p>
                            <p className="text-sm mt-1">Start logging customer conversations</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomersPage;
