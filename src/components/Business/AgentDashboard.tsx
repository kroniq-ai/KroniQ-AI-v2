/**
 * Agent Dashboard — Premium Redesign v3
 * Fixed CEO card, better agent picker, custom agent creation
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
    X,
    Bot,
    Wand2,
    Star,
    Target,
    Rocket,
    Mail,
    Settings2,
    Briefcase
} from 'lucide-react';
import { useSharedAgentContext, getAgentDefinition, AGENT_DEFINITIONS, type AgentDefinition } from '../../contexts/SharedAgentContext';
import type { AgentType } from '../../lib/agents/types';
import { detectIntent } from '../../lib/agents/AgentRouter';

// ===== ICON MAP =====

const ICON_MAP: Record<string, React.ElementType> = {
    Crown, DollarSign, Users, Megaphone, Palette, Code, CheckSquare, Scale, Zap,
    Bot, Target, Rocket, Mail, Settings2, Briefcase, Star, Wand2
};

// ===== TYPES =====

interface AgentDashboardProps {
    isDark: boolean;
}

// ===== CEO HERO CARD (FIXED) =====

interface CEOHeroCardProps {
    isDark: boolean;
    onClick: () => void;
}

const CEOHeroCard: React.FC<CEOHeroCardProps> = ({ isDark, onClick }) => {
    return (
        <div
            onClick={onClick}
            className={`
                group relative w-full rounded-3xl overflow-hidden cursor-pointer
                border transition-all duration-500 hover:scale-[1.01]
                ${isDark
                    ? 'bg-gradient-to-br from-emerald-900/40 via-[#0c0c0c] to-[#0a0a0a] border-emerald-500/40 hover:border-emerald-400/70'
                    : 'bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 border-emerald-300 hover:border-emerald-400'}
            `}
            style={{
                boxShadow: isDark
                    ? '0 0 100px rgba(16, 185, 129, 0.25), inset 0 1px 0 rgba(16, 185, 129, 0.2)'
                    : '0 20px 60px rgba(16, 185, 129, 0.2)'
            }}
        >
            {/* Animated glow orbs */}
            <div className={`
                absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[400px] rounded-full blur-3xl pointer-events-none
                opacity-50 group-hover:opacity-70 transition-opacity duration-700
                ${isDark ? 'bg-gradient-to-b from-emerald-500/40 to-transparent' : 'bg-gradient-to-b from-emerald-200 to-transparent'}
            `} />

            {/* Grid pattern */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(rgba(16, 185, 129, 1) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(16, 185, 129, 1) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px'
                }}
            />

            {/* Content */}
            <div className="relative p-8 md:p-10 text-center">
                {/* Large Crown Icon */}
                <div className={`
                    w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-6
                    bg-gradient-to-br from-emerald-500/40 via-emerald-500/20 to-transparent
                    group-hover:scale-110 transition-transform duration-500
                    ring-2 ring-emerald-500/20
                `}
                    style={{
                        boxShadow: isDark
                            ? '0 0 50px rgba(16, 185, 129, 0.5), inset 0 0 20px rgba(16, 185, 129, 0.2)'
                            : '0 10px 40px rgba(16, 185, 129, 0.3)'
                    }}
                >
                    <Crown className={`w-10 h-10 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                </div>

                {/* Badge */}
                <div className={`
                    inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide mb-4
                    ${isDark ? 'bg-emerald-500/25 text-emerald-300' : 'bg-emerald-100 text-emerald-700'}
                `}>
                    <Sparkles className="w-3.5 h-3.5" />
                    YOUR AI COO
                </div>

                {/* Title */}
                <h2
                    className={`text-2xl md:text-3xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                >
                    CEO Agent
                </h2>

                {/* Description */}
                <p className={`text-sm md:text-base mb-6 max-w-md mx-auto leading-relaxed ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                    Your all-in-one business strategist. Strategy, marketing, finance, product — handled in one conversation.
                </p>

                {/* Feature pills */}
                <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                    <div className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                        ${isDark ? 'bg-white/5 text-emerald-400/90 ring-1 ring-emerald-500/20' : 'bg-emerald-50 text-emerald-600'}
                    `}>
                        <MessageSquare className="w-3.5 h-3.5" />
                        All-in-one
                    </div>
                    <div className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                        ${isDark ? 'bg-white/5 text-emerald-400/90 ring-1 ring-emerald-500/20' : 'bg-emerald-50 text-emerald-600'}
                    `}>
                        <Zap className="w-3.5 h-3.5" />
                        Full context
                    </div>
                    <div className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                        ${isDark ? 'bg-white/5 text-emerald-400/90 ring-1 ring-emerald-500/20' : 'bg-emerald-50 text-emerald-600'}
                    `}>
                        <Star className="w-3.5 h-3.5" />
                        Premium
                    </div>
                </div>

                {/* CTA Button */}
                <button className={`
                    inline-flex items-center gap-2 px-6 py-3 rounded-xl
                    font-semibold text-sm transition-all duration-300
                    ${isDark
                        ? 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/30'
                        : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/30'}
                `}>
                    Start chatting with CEO
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
            </div>
        </div>
    );
};

// ===== SPECIALIST AGENT CARD =====

interface SpecialistCardProps {
    agent: AgentDefinition;
    metadata: { messageCount: number; lastActive: Date | null };
    isDark: boolean;
    onClick: () => void;
}

const SpecialistCard: React.FC<SpecialistCardProps> = ({ agent, metadata, isDark, onClick }) => {
    const Icon = ICON_MAP[agent.icon] || Bot;

    return (
        <div
            onClick={onClick}
            className={`
                group relative p-5 rounded-2xl cursor-pointer
                border transition-all duration-300 hover:translate-y-[-2px]
                ${isDark
                    ? 'bg-[#111111] border-emerald-500/15 hover:border-emerald-500/50 hover:bg-[#151515]'
                    : 'bg-white border-gray-200 hover:border-emerald-400 hover:shadow-xl'}
            `}
            style={{
                boxShadow: isDark ? '0 0 0 rgba(16, 185, 129, 0)' : '0 2px 10px rgba(0,0,0,0.04)',
            }}
            onMouseEnter={(e) => {
                if (isDark) e.currentTarget.style.boxShadow = '0 0 40px rgba(16, 185, 129, 0.15)';
            }}
            onMouseLeave={(e) => {
                if (isDark) e.currentTarget.style.boxShadow = '0 0 0 rgba(16, 185, 129, 0)';
            }}
        >
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                    bg-gradient-to-br from-emerald-500/25 to-emerald-600/10
                    group-hover:scale-110 transition-transform duration-300
                    ring-1 ring-emerald-500/20
                `}>
                    <Icon className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                </div>

                <div className="flex-1 min-w-0">
                    <h3
                        className={`font-bold text-sm mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                    >
                        {agent.name}
                    </h3>
                    <p className={`text-xs mb-2 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                        {agent.description}
                    </p>
                    <div className={`
                        inline-flex items-center gap-1 text-[10px] font-medium
                        ${isDark ? 'text-emerald-500/60' : 'text-emerald-600/70'}
                    `}>
                        <MessageSquare className="w-3 h-3" />
                        {metadata.messageCount} messages
                    </div>
                </div>

                <ArrowRight className={`
                    w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300
                    ${isDark ? 'text-emerald-400' : 'text-emerald-500'}
                `} />
            </div>
        </div>
    );
};

// ===== ADD AGENT CARD =====

interface AddAgentCardProps {
    isDark: boolean;
    onClick: () => void;
}

const AddAgentCard: React.FC<AddAgentCardProps> = ({ isDark, onClick }) => (
    <div
        onClick={onClick}
        className={`
            group p-5 rounded-2xl cursor-pointer
            border-2 border-dashed transition-all duration-300 hover:scale-[1.02]
            ${isDark
                ? 'border-emerald-500/25 hover:border-emerald-500/50 hover:bg-emerald-500/5'
                : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50'}
        `}
    >
        <div className="flex items-center gap-4">
            <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center
                ${isDark ? 'bg-emerald-500/15' : 'bg-gray-100 group-hover:bg-emerald-100'}
                transition-colors duration-300
            `}>
                <Plus className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-gray-400 group-hover:text-emerald-600'} transition-colors`} />
            </div>
            <div>
                <p className={`font-semibold text-sm ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                    Add More Agents
                </p>
                <p className={`text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                    Choose from list or create custom
                </p>
            </div>
        </div>
    </div>
);

// ===== AGENT PICKER MODAL (REDESIGNED) =====

interface AgentPickerProps {
    isDark: boolean;
    activeAgents: AgentType[];
    onSelect: (type: AgentType) => void;
    onCreateCustom: (name: string, description: string) => void;
    onClose: () => void;
}

const AgentPicker: React.FC<AgentPickerProps> = ({ isDark, activeAgents, onSelect, onCreateCustom, onClose }) => {
    const [showCustom, setShowCustom] = useState(false);
    const [customName, setCustomName] = useState('');
    const [customDescription, setCustomDescription] = useState('');

    const availableAgents = AGENT_DEFINITIONS.filter(
        a => !activeAgents.includes(a.type) && a.type !== 'ceo'
    );

    // Suggested custom agents
    const suggestedAgents = [
        { name: 'Outreach Agent', description: 'Cold emails, LinkedIn, partnerships', icon: 'Mail' },
        { name: 'Automation Agent', description: 'Workflows, integrations, efficiency', icon: 'Settings2' },
        { name: 'Sales Agent', description: 'Pipeline, demos, closing deals', icon: 'Briefcase' },
        { name: 'Growth Agent', description: 'Viral loops, referrals, acquisition', icon: 'Rocket' },
        { name: 'Analytics Agent', description: 'Metrics, insights, dashboards', icon: 'Target' },
    ];

    const handleCreateCustom = () => {
        if (customName.trim()) {
            onCreateCustom(customName.trim(), customDescription.trim() || 'Custom AI agent');
            setCustomName('');
            setCustomDescription('');
            setShowCustom(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />
            <div className={`
                relative w-full max-w-lg max-h-[85vh] overflow-hidden rounded-3xl
                ${isDark ? 'bg-[#0c0c0c]' : 'bg-white'}
            `}
                style={{
                    boxShadow: isDark
                        ? '0 0 100px rgba(16, 185, 129, 0.2), inset 0 1px 0 rgba(255,255,255,0.05)'
                        : '0 30px 100px rgba(0,0,0,0.3)'
                }}
            >
                {/* Glow */}
                {isDark && (
                    <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[300px] h-[200px] rounded-full blur-3xl bg-emerald-500/20 pointer-events-none" />
                )}

                {/* Header */}
                <div className={`relative px-6 py-5 border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                                {showCustom ? 'Create Custom Agent' : 'Add Agent'}
                            </h2>
                            <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                                {showCustom ? 'Describe what you need' : 'Expand your AI team'}
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

                <div className="relative overflow-y-auto max-h-[60vh]">
                    {showCustom ? (
                        /* Custom Agent Creator */
                        <div className="p-6 space-y-4">
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                                    Agent Name
                                </label>
                                <input
                                    type="text"
                                    value={customName}
                                    onChange={(e) => setCustomName(e.target.value)}
                                    placeholder="e.g., Outreach Agent, Automation Agent..."
                                    className={`
                                        w-full px-4 py-3 rounded-xl text-sm font-medium
                                        border transition-colors
                                        ${isDark
                                            ? 'bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-emerald-500/50'
                                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-400'}
                                    `}
                                    style={{ outline: 'none' }}
                                />
                            </div>
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                                    What should this agent do?
                                </label>
                                <textarea
                                    value={customDescription}
                                    onChange={(e) => setCustomDescription(e.target.value)}
                                    placeholder="Describe the agent's role, tasks, and expertise..."
                                    rows={3}
                                    className={`
                                        w-full px-4 py-3 rounded-xl text-sm font-medium resize-none
                                        border transition-colors
                                        ${isDark
                                            ? 'bg-white/5 border-white/10 text-white placeholder-white/30 focus:border-emerald-500/50'
                                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-400'}
                                    `}
                                    style={{ outline: 'none' }}
                                />
                            </div>

                            {/* Suggestions */}
                            <div>
                                <p className={`text-xs font-medium mb-2 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                                    QUICK IDEAS
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {suggestedAgents.map((agent) => (
                                        <button
                                            key={agent.name}
                                            onClick={() => {
                                                setCustomName(agent.name);
                                                setCustomDescription(agent.description);
                                            }}
                                            className={`
                                                px-3 py-1.5 rounded-lg text-xs font-medium transition-colors
                                                ${isDark
                                                    ? 'bg-white/5 text-white/50 hover:bg-emerald-500/20 hover:text-emerald-400'
                                                    : 'bg-gray-100 text-gray-500 hover:bg-emerald-100 hover:text-emerald-600'}
                                            `}
                                        >
                                            {agent.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowCustom(false)}
                                    className={`
                                        flex-1 py-3 rounded-xl text-sm font-medium transition-colors
                                        ${isDark ? 'bg-white/5 text-white/50 hover:bg-white/10' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}
                                    `}
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleCreateCustom}
                                    disabled={!customName.trim()}
                                    className={`
                                        flex-1 py-3 rounded-xl text-sm font-semibold transition-colors
                                        flex items-center justify-center gap-2
                                        ${customName.trim()
                                            ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                                            : (isDark ? 'bg-white/5 text-white/20' : 'bg-gray-100 text-gray-300')}
                                    `}
                                >
                                    <Wand2 className="w-4 h-4" />
                                    Create Agent
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Standard Agent List */
                        <div className="p-4 space-y-3">
                            {/* Create Custom Button */}
                            <button
                                onClick={() => setShowCustom(true)}
                                className={`
                                    w-full flex items-center gap-4 p-4 rounded-2xl
                                    border-2 border-dashed transition-all duration-200
                                    ${isDark
                                        ? 'border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-500/10'
                                        : 'border-emerald-300 hover:border-emerald-400 hover:bg-emerald-50'}
                                `}
                            >
                                <div className={`
                                    w-12 h-12 rounded-xl flex items-center justify-center
                                    ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-100'}
                                `}>
                                    <Wand2 className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                </div>
                                <div className="text-left flex-1">
                                    <p className={`font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                                        Create Custom Agent
                                    </p>
                                    <p className={`text-xs ${isDark ? 'text-emerald-500/50' : 'text-emerald-600/70'}`}>
                                        Build any agent you need with a prompt
                                    </p>
                                </div>
                                <ArrowRight className={`w-4 h-4 ${isDark ? 'text-emerald-500/50' : 'text-emerald-400'}`} />
                            </button>

                            {/* Divider */}
                            {availableAgents.length > 0 && (
                                <div className="flex items-center gap-3 py-2">
                                    <div className={`flex-1 h-px ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
                                    <span className={`text-[10px] font-medium ${isDark ? 'text-white/20' : 'text-gray-400'}`}>
                                        OR CHOOSE PRESET
                                    </span>
                                    <div className={`flex-1 h-px ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
                                </div>
                            )}

                            {/* Preset Agents */}
                            {availableAgents.map(agent => {
                                const Icon = ICON_MAP[agent.icon] || Bot;
                                return (
                                    <button
                                        key={agent.type}
                                        onClick={() => onSelect(agent.type)}
                                        className={`
                                            w-full flex items-center gap-4 p-4 rounded-2xl
                                            border transition-all duration-200
                                            ${isDark
                                                ? 'bg-white/[0.02] border-white/5 hover:border-emerald-500/40 hover:bg-white/5'
                                                : 'bg-gray-50 border-gray-100 hover:border-emerald-300 hover:bg-emerald-50'}
                                        `}
                                    >
                                        <div className={`
                                            w-12 h-12 rounded-xl flex items-center justify-center
                                            bg-gradient-to-br from-emerald-500/20 to-emerald-600/10
                                            ring-1 ${isDark ? 'ring-emerald-500/20' : 'ring-emerald-200'}
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
                                        <ArrowRight className={`w-4 h-4 ${isDark ? 'text-white/20' : 'text-gray-300'}`} />
                                    </button>
                                );
                            })}

                            {availableAgents.length === 0 && (
                                <div className={`text-center py-6 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                                    <Bot className="w-10 h-10 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">All preset agents are active!</p>
                                    <p className="text-xs mt-1">Create a custom one above</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ===== MAIN DASHBOARD =====

export const AgentDashboard: React.FC<AgentDashboardProps> = ({ isDark }) => {
    const { state, openAgent, addAgent, setMode, addCustomAgent } = useSharedAgentContext();
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

    const handleCreateCustomAgent = (name: string, description: string) => {
        // For custom agents, we'll add them with a generated type
        const customType = `custom_${Date.now()}` as AgentType;
        if (addCustomAgent) {
            addCustomAgent(name, description);
        }
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
            <div className="absolute inset-0 pointer-events-none">
                {isDark && (
                    <>
                        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] rounded-full blur-3xl bg-emerald-900/30" />
                        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full blur-3xl bg-emerald-900/20" />
                        <div
                            className="absolute inset-0 opacity-40"
                            style={{
                                backgroundImage: `linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
                                                  linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px)`,
                                backgroundSize: '60px 60px'
                            }}
                        />
                    </>
                )}
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 md:px-6 py-6 md:py-8 overflow-y-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-emerald-500/60' : 'text-emerald-600/80'}`}>
                            Business OS
                        </span>
                    </div>
                    <h1
                        className={`text-2xl md:text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                    >
                        Your AI Team
                    </h1>
                    <p className={`text-sm mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                        {activeAgentDefs.length + 1} agents • Shared context across all
                    </p>
                </div>

                {/* CEO Hero Card */}
                <CEOHeroCard isDark={isDark} onClick={handleCEOClick} />

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                    <div className={`flex-1 h-px ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
                    <span className={`text-[10px] font-bold tracking-wider ${isDark ? 'text-white/20' : 'text-gray-400'}`}>
                        SPECIALIST AGENTS
                    </span>
                    <div className={`flex-1 h-px ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />
                </div>

                {/* Specialist Agents Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {activeAgentDefs.map(agent => (
                        <SpecialistCard
                            key={agent.type}
                            agent={agent}
                            metadata={state.agentMetadata[agent.type]}
                            isDark={isDark}
                            onClick={() => handleAgentClick(agent.type)}
                        />
                    ))}
                    <AddAgentCard isDark={isDark} onClick={() => setShowPicker(true)} />
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
                            flex items-center gap-3 px-4 md:px-5 py-3.5 md:py-4 rounded-2xl
                            transition-all duration-300
                            ${isDark
                                ? 'bg-[#111111] border border-white/10 focus-within:border-emerald-500/50'
                                : 'bg-white border border-gray-200 focus-within:border-emerald-400 shadow-lg'}
                        `}
                        style={{
                            boxShadow: isDark
                                ? '0 0 40px rgba(16, 185, 129, 0.08)'
                                : '0 10px 40px rgba(0,0,0,0.1)'
                        }}
                    >
                        <Sparkles className={`w-5 h-5 flex-shrink-0 ${isDark ? 'text-emerald-500/50' : 'text-emerald-400'}`} />

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
                            placeholder="Ask anything — routes to the right agent..."
                            disabled={isProcessing}
                            className={`
                                flex-1 bg-transparent border-none outline-none text-sm font-medium min-w-0
                                ${isDark ? 'text-white placeholder-white/30' : 'text-gray-900 placeholder-gray-400'}
                            `}
                            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                        />

                        <button
                            onClick={handleGlobalInput}
                            disabled={!inputValue.trim() || isProcessing}
                            className={`
                                p-2.5 md:p-3 rounded-xl transition-all duration-300 flex-shrink-0
                                ${inputValue.trim() && !isProcessing
                                    ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                                    : (isDark ? 'bg-white/5 text-white/20' : 'bg-gray-100 text-gray-300')}
                            `}
                            style={{
                                boxShadow: inputValue.trim() && !isProcessing && isDark
                                    ? '0 0 25px rgba(16, 185, 129, 0.5)'
                                    : 'none'
                            }}
                        >
                            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </div>

                    <p className={`text-center text-[10px] mt-2 ${isDark ? 'text-white/20' : 'text-gray-400'}`}>
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
                    onCreateCustom={handleCreateCustomAgent}
                    onClose={() => setShowPicker(false)}
                />
            )}
        </div>
    );
};

export default AgentDashboard;
