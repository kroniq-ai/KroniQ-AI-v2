/**
 * Agent Dashboard — Premium Redesign
 * CEO hero card in center, specialist agents around
 * Ultra-premium green glowing design
 */

import React, { useState } from 'react';
import {
    Plus,
    Sparkles,
    Send,
    Loader2,
    Crown,
    DollarSign,
    Users,
    Megaphone,
    Palette,
    Code,
    CheckSquare,
    Scale,
    Zap,
    ArrowRight,
    MessageSquare,
    X
} from 'lucide-react';
import { useSharedAgentContext, getAgentDefinition, AGENT_DEFINITIONS, type AgentDefinition } from '../../contexts/SharedAgentContext';
import type { AgentType } from '../../lib/agents/types';
import { detectIntent } from '../../lib/agents/AgentRouter';

// ===== ICON MAP =====

const ICON_MAP: Record<string, React.ElementType> = {
    Crown, DollarSign, Users, Megaphone, Palette, Code, CheckSquare, Scale, Zap
};

// ===== TYPES =====

interface AgentDashboardProps {
    isDark: boolean;
}

// ===== CEO HERO CARD =====

interface CEOHeroCardProps {
    isDark: boolean;
    onClick: () => void;
}

const CEOHeroCard: React.FC<CEOHeroCardProps> = ({ isDark, onClick }) => (
    <button
        onClick={onClick}
        className={`
            group relative w-full rounded-3xl text-center overflow-hidden
            border transition-all duration-500
            hover:scale-[1.01]
            ${isDark
                ? 'bg-gradient-to-b from-emerald-950/60 via-[#0a0a0a] to-[#0a0a0a] border-emerald-500/30 hover:border-emerald-400/60'
                : 'bg-gradient-to-b from-emerald-50 to-white border-emerald-200 hover:border-emerald-400'}
        `}
        style={{
            boxShadow: isDark
                ? '0 0 80px rgba(16, 185, 129, 0.2), inset 0 1px 0 rgba(16, 185, 129, 0.15)'
                : '0 15px 50px rgba(16, 185, 129, 0.15)'
        }}
    >
        {/* Large animated glow orb behind crown */}
        <div className={`
            absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] rounded-full blur-3xl
            opacity-40 group-hover:opacity-60 transition-opacity duration-700
            ${isDark ? 'bg-emerald-500' : 'bg-emerald-200'}
        `} />

        {/* Grid pattern overlay */}
        <div
            className="absolute inset-0 opacity-5"
            style={{
                backgroundImage: `linear-gradient(rgba(16, 185, 129, 1) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(16, 185, 129, 1) 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
            }}
        />

        {/* Content - centered vertical layout */}
        <div className="relative py-10 px-8">
            {/* Crown icon - large and prominent */}
            <div className={`
                w-24 h-24 mx-auto rounded-3xl flex items-center justify-center mb-6
                bg-gradient-to-br from-emerald-500/30 via-emerald-500/20 to-emerald-600/10
                group-hover:scale-110 transition-transform duration-500
            `}
                style={{
                    boxShadow: isDark
                        ? '0 0 60px rgba(16, 185, 129, 0.4), inset 0 0 30px rgba(16, 185, 129, 0.1)'
                        : '0 10px 40px rgba(16, 185, 129, 0.2)'
                }}
            >
                <Crown className={`w-12 h-12 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>

            {/* Badge */}
            <div className={`
                inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold mb-4
                ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}
            `}>
                <Sparkles className="w-3.5 h-3.5" />
                YOUR AI COO
            </div>

            {/* Title */}
            <h2
                className={`text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            >
                CEO Agent
            </h2>

            {/* Description */}
            <p className={`text-sm mb-6 max-w-lg mx-auto ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                Your all-in-one business strategist. Ask anything about strategy, marketing,
                finance, product — I handle it all in one conversation.
            </p>

            {/* Feature pills */}
            <div className="flex items-center justify-center gap-3 mb-6">
                <div className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                    ${isDark ? 'bg-emerald-500/10 text-emerald-400/80' : 'bg-emerald-50 text-emerald-600'}
                `}>
                    <MessageSquare className="w-3.5 h-3.5" />
                    All-in-one mode
                </div>
                <div className={`
                    flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                    ${isDark ? 'bg-emerald-500/10 text-emerald-400/80' : 'bg-emerald-50 text-emerald-600'}
                `}>
                    <Zap className="w-3.5 h-3.5" />
                    Full business context
                </div>
            </div>

            {/* CTA Button */}
            <div className={`
                inline-flex items-center gap-2 px-6 py-3 rounded-xl
                font-semibold text-sm transition-all duration-300
                ${isDark
                    ? 'bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/30'
                    : 'bg-emerald-100 text-emerald-700 group-hover:bg-emerald-200'}
            `}>
                Start chatting with CEO
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
        </div>
    </button>
);

// ===== SPECIALIST AGENT CARD =====

interface SpecialistCardProps {
    agent: AgentDefinition;
    metadata: { messageCount: number; lastActive: Date | null };
    isDark: boolean;
    onClick: () => void;
}

const SpecialistCard: React.FC<SpecialistCardProps> = ({ agent, metadata, isDark, onClick }) => {
    const Icon = ICON_MAP[agent.icon] || Sparkles;

    return (
        <button
            onClick={onClick}
            className={`
                group relative p-5 rounded-2xl text-left
                border transition-all duration-300
                hover:translate-y-[-4px]
                ${isDark
                    ? 'bg-[#0d0d0d]/80 border-emerald-500/10 hover:border-emerald-500/40'
                    : 'bg-white border-gray-100 hover:border-emerald-300 hover:shadow-xl'}
            `}
            style={{
                boxShadow: isDark ? 'none' : '0 4px 20px rgba(0,0,0,0.03)',
            }}
            onMouseEnter={(e) => {
                if (isDark) {
                    e.currentTarget.style.boxShadow = '0 0 40px rgba(16, 185, 129, 0.1)';
                }
            }}
            onMouseLeave={(e) => {
                if (isDark) {
                    e.currentTarget.style.boxShadow = 'none';
                }
            }}
        >
            {/* Subtle glow on hover */}
            <div className={`
                absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500
                ${isDark ? 'bg-gradient-to-br from-emerald-500/5 to-transparent' : ''}
            `} />

            <div className="relative flex items-start gap-4">
                {/* Icon */}
                <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                    bg-gradient-to-br from-emerald-500/20 to-emerald-600/5
                    group-hover:scale-110 transition-transform duration-300
                `}
                    style={{ boxShadow: isDark ? '0 0 20px rgba(16, 185, 129, 0.15)' : 'none' }}
                >
                    <Icon className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                </div>

                <div className="flex-1 min-w-0">
                    {/* Name */}
                    <h3
                        className={`font-bold mb-0.5 ${isDark ? 'text-white' : 'text-gray-900'}`}
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                    >
                        {agent.shortName}
                    </h3>

                    {/* Description */}
                    <p className={`text-xs mb-2 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                        {agent.description}
                    </p>

                    {/* Message count */}
                    <div className={`
                        inline-flex items-center gap-1 text-[10px] font-medium
                        ${isDark ? 'text-emerald-500/50' : 'text-emerald-600/60'}
                    `}>
                        <MessageSquare className="w-3 h-3" />
                        {metadata.messageCount} messages
                    </div>
                </div>

                {/* Arrow */}
                <div className={`
                    opacity-0 group-hover:opacity-100 transition-all duration-300
                    ${isDark ? 'text-emerald-400' : 'text-emerald-500'}
                `}>
                    <ArrowRight className="w-4 h-4" />
                </div>
            </div>
        </button>
    );
};

// ===== ADD MORE AGENTS =====

interface AddMoreAgentsProps {
    isDark: boolean;
    onClick: () => void;
}

const AddMoreAgents: React.FC<AddMoreAgentsProps> = ({ isDark, onClick }) => (
    <button
        onClick={onClick}
        className={`
            group p-5 rounded-2xl text-left
            border-2 border-dashed transition-all duration-300
            hover:scale-[1.02]
            ${isDark
                ? 'border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/5'
                : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'}
        `}
    >
        <div className="flex items-center gap-4">
            <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center
                ${isDark ? 'bg-emerald-500/10' : 'bg-gray-100 group-hover:bg-emerald-100'}
                transition-colors duration-300
            `}>
                <Plus className={`w-6 h-6 ${isDark ? 'text-emerald-500/50 group-hover:text-emerald-400' : 'text-gray-400 group-hover:text-emerald-600'} transition-colors`} />
            </div>
            <div>
                <p className={`font-semibold text-sm ${isDark ? 'text-white/50 group-hover:text-white/80' : 'text-gray-500 group-hover:text-gray-700'} transition-colors`}>
                    Add More Agents
                </p>
                <p className={`text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                    Customize your team
                </p>
            </div>
        </div>
    </button>
);

// ===== AGENT PICKER MODAL =====

interface AgentPickerProps {
    isDark: boolean;
    activeAgents: AgentType[];
    onSelect: (type: AgentType) => void;
    onClose: () => void;
}

const AgentPicker: React.FC<AgentPickerProps> = ({ isDark, activeAgents, onSelect, onClose }) => {
    const availableAgents = AGENT_DEFINITIONS.filter(
        a => !activeAgents.includes(a.type) && a.type !== 'ceo'
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
            <div className={`
                relative w-full max-w-md rounded-3xl overflow-hidden
                ${isDark ? 'bg-[#0c0c0c]' : 'bg-white'}
            `}
                style={{
                    boxShadow: isDark
                        ? '0 0 80px rgba(16, 185, 129, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)'
                        : '0 25px 80px rgba(0,0,0,0.25)'
                }}
            >
                {/* Grid pattern */}
                {isDark && (
                    <div
                        className="absolute inset-0 opacity-20 pointer-events-none"
                        style={{
                            backgroundImage: `linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px),
                                              linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)`,
                            backgroundSize: '20px 20px'
                        }}
                    />
                )}

                {/* Header */}
                <div className={`relative px-6 py-5 border-b ${isDark ? 'border-emerald-500/10' : 'border-gray-100'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                Add Specialist Agent
                            </h2>
                            <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                                Expand your AI team
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}`}
                        >
                            <X className={`w-5 h-5 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
                        </button>
                    </div>
                </div>

                {/* Agents */}
                <div className="relative p-4 max-h-[60vh] overflow-y-auto space-y-2">
                    {availableAgents.length > 0 ? (
                        availableAgents.map(agent => {
                            const Icon = ICON_MAP[agent.icon] || Sparkles;
                            return (
                                <button
                                    key={agent.type}
                                    onClick={() => onSelect(agent.type)}
                                    className={`
                                        w-full flex items-center gap-4 p-4 rounded-2xl
                                        border transition-all duration-200
                                        ${isDark
                                            ? 'bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/40 hover:bg-emerald-500/10'
                                            : 'bg-gray-50 border-gray-100 hover:border-emerald-300 hover:bg-emerald-50'}
                                    `}
                                >
                                    <div className={`
                                        w-12 h-12 rounded-xl flex items-center justify-center
                                        bg-gradient-to-br from-emerald-500/20 to-emerald-600/10
                                    `}>
                                        <Icon className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                    </div>
                                    <div className="text-left flex-1">
                                        <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                            {agent.name}
                                        </p>
                                        <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                                            {agent.description}
                                        </p>
                                    </div>
                                    <ArrowRight className={`w-4 h-4 ${isDark ? 'text-emerald-500/50' : 'text-gray-300'}`} />
                                </button>
                            );
                        })
                    ) : (
                        <div className={`text-center py-8 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>All agents are already active!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ===== MAIN DASHBOARD =====

export const AgentDashboard: React.FC<AgentDashboardProps> = ({ isDark }) => {
    const { state, openAgent, addAgent, setMode } = useSharedAgentContext();
    const [showPicker, setShowPicker] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const activeAgentDefs = state.activeAgents
        .map(type => getAgentDefinition(type))
        .filter(Boolean) as AgentDefinition[];

    const handleCEOClick = () => {
        setMode('single');
        openAgent('ceo');
    };

    const handleAgentClick = (type: AgentType) => {
        openAgent(type);
    };

    const handleAddAgent = (type: AgentType) => {
        addAgent(type);
        setShowPicker(false);
    };

    const handleGlobalInput = async () => {
        if (!inputValue.trim() || isProcessing) return;

        setIsProcessing(true);
        const intent = detectIntent(inputValue);

        if (!state.activeAgents.includes(intent.primaryAgent)) {
            addAgent(intent.primaryAgent);
        }

        openAgent(intent.primaryAgent);
        setInputValue('');
        setIsProcessing(false);
    };

    return (
        <div className="flex-1 flex flex-col relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0">
                {/* Gradient orbs */}
                <div className={`
                    absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full blur-3xl
                    ${isDark ? 'bg-emerald-900/20' : 'bg-emerald-100/50'}
                `} />
                <div className={`
                    absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl
                    ${isDark ? 'bg-emerald-900/10' : 'bg-emerald-50/50'}
                `} />

                {/* Grid lines */}
                {isDark && (
                    <div
                        className="absolute inset-0 opacity-30"
                        style={{
                            backgroundImage: `linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
                                              linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px)`,
                            backgroundSize: '60px 60px'
                        }}
                    />
                )}
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col max-w-4xl mx-auto w-full px-6 py-8 overflow-y-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-emerald-500/50' : 'text-emerald-600/70'}`}>
                            Business OS
                        </span>
                    </div>
                    <h1
                        className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                    >
                        Your AI Team
                    </h1>
                    <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                        {activeAgentDefs.length + 1} agents ready • Shared context across all
                    </p>
                </div>

                {/* CEO Hero Card */}
                <CEOHeroCard isDark={isDark} onClick={handleCEOClick} />

                {/* Divider */}
                <div className="flex items-center gap-4 my-8">
                    <div className={`flex-1 h-px ${isDark ? 'bg-emerald-500/10' : 'bg-gray-100'}`} />
                    <span className={`text-xs font-medium ${isDark ? 'text-white/20' : 'text-gray-400'}`}>
                        SPECIALIST AGENTS
                    </span>
                    <div className={`flex-1 h-px ${isDark ? 'bg-emerald-500/10' : 'bg-gray-100'}`} />
                </div>

                {/* Specialist Agents Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {activeAgentDefs.map(agent => (
                        <SpecialistCard
                            key={agent.type}
                            agent={agent}
                            metadata={state.agentMetadata[agent.type]}
                            isDark={isDark}
                            onClick={() => handleAgentClick(agent.type)}
                        />
                    ))}
                    <AddMoreAgents isDark={isDark} onClick={() => setShowPicker(true)} />
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* Global Input */}
                <div className={`
                    sticky bottom-0 pt-4 pb-2
                    ${isDark ? 'bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent' : 'bg-gradient-to-t from-gray-50 via-gray-50 to-transparent'}
                `}>
                    <div
                        className={`
                            flex items-center gap-3 px-5 py-4 rounded-2xl
                            transition-all duration-300
                            ${isDark
                                ? 'bg-[#0d0d0d] border border-emerald-500/20 focus-within:border-emerald-500/50'
                                : 'bg-white border border-gray-200 focus-within:border-emerald-400 shadow-lg'}
                        `}
                        style={{
                            boxShadow: isDark
                                ? 'inset 0 0 30px rgba(16, 185, 129, 0.03), 0 0 30px rgba(16, 185, 129, 0.08)'
                                : '0 10px 40px rgba(0,0,0,0.08)'
                        }}
                    >
                        <Sparkles className={`w-5 h-5 ${isDark ? 'text-emerald-500/50' : 'text-emerald-400'}`} />

                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleGlobalInput();
                                }
                            }}
                            placeholder="Ask anything — I'll route to the right agent..."
                            disabled={isProcessing}
                            className={`
                                flex-1 bg-transparent border-none outline-none text-sm font-medium
                                ${isDark ? 'text-white placeholder-white/30' : 'text-gray-900 placeholder-gray-400'}
                            `}
                            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                        />

                        <button
                            onClick={handleGlobalInput}
                            disabled={!inputValue.trim() || isProcessing}
                            className={`
                                p-3 rounded-xl transition-all duration-300
                                ${inputValue.trim() && !isProcessing
                                    ? 'bg-emerald-500 text-white hover:bg-emerald-400 scale-100'
                                    : (isDark ? 'bg-emerald-500/10 text-emerald-500/30' : 'bg-gray-100 text-gray-300')}
                            `}
                            style={{
                                boxShadow: inputValue.trim() && !isProcessing && isDark
                                    ? '0 0 25px rgba(16, 185, 129, 0.5)'
                                    : 'none'
                            }}
                        >
                            {isProcessing ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                        </button>
                    </div>

                    <p className={`text-center text-[10px] mt-3 ${isDark ? 'text-emerald-500/30' : 'text-gray-400'}`}>
                        All agents share context — they collaborate like a real team
                    </p>
                </div>
            </div>

            {/* Agent Picker Modal */}
            {showPicker && (
                <AgentPicker
                    isDark={isDark}
                    activeAgents={state.activeAgents}
                    onSelect={handleAddAgent}
                    onClose={() => setShowPicker(false)}
                />
            )}
        </div>
    );
};

export default AgentDashboard;
