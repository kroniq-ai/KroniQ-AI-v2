/**
 * Agent Dashboard
 * Grid of agent boxes with global input
 * Premium green design
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
    Settings,
    Zap
} from 'lucide-react';
import { useSharedAgentContext, getAgentDefinition, AGENT_DEFINITIONS, type AgentDefinition } from '../../contexts/SharedAgentContext';
import type { AgentType } from '../../lib/agents/types';
import { detectIntent } from '../../lib/agents/AgentRouter';
import { getAgentResponse } from '../../lib/agents/AgentService';

// ===== ICON MAP =====

const ICON_MAP: Record<string, React.ElementType> = {
    Crown, DollarSign, Users, Megaphone, Palette, Code, CheckSquare, Scale
};

// ===== TYPES =====

interface AgentDashboardProps {
    isDark: boolean;
}

// ===== AGENT BOX =====

interface AgentBoxProps {
    agent: AgentDefinition;
    metadata: { messageCount: number; lastActive: Date | null };
    isDark: boolean;
    onClick: () => void;
}

const AgentBox: React.FC<AgentBoxProps> = ({ agent, metadata, isDark, onClick }) => {
    const Icon = ICON_MAP[agent.icon] || Sparkles;

    return (
        <button
            onClick={onClick}
            className={`
                group relative p-5 rounded-2xl text-left
                border transition-all duration-300
                hover:translate-y-[-4px]
                ${isDark
                    ? 'bg-[#0d0d0d] border-emerald-500/10 hover:border-emerald-500/40'
                    : 'bg-white border-gray-100 hover:border-emerald-300 hover:shadow-lg'}
            `}
            style={{
                boxShadow: isDark ? '0 0 0 rgba(16, 185, 129, 0)' : 'none',
            }}
            onMouseEnter={(e) => {
                if (isDark) {
                    e.currentTarget.style.boxShadow = '0 0 30px rgba(16, 185, 129, 0.15)';
                }
            }}
            onMouseLeave={(e) => {
                if (isDark) {
                    e.currentTarget.style.boxShadow = '0 0 0 rgba(16, 185, 129, 0)';
                }
            }}
        >
            {/* Glow effect on hover */}
            <div className={`
                absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
                ${isDark ? 'bg-gradient-to-br from-emerald-500/5 to-transparent' : ''}
            `} />

            {/* Icon */}
            <div className={`
                relative w-12 h-12 rounded-xl flex items-center justify-center mb-4
                bg-gradient-to-br from-emerald-500/20 to-emerald-600/10
                group-hover:scale-110 transition-transform duration-300
            `}
                style={{ boxShadow: isDark ? '0 0 20px rgba(16, 185, 129, 0.2)' : 'none' }}
            >
                <Icon className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>

            {/* Name */}
            <h3
                className={`relative text-base font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            >
                {agent.shortName}
            </h3>

            {/* Description */}
            <p className={`relative text-xs mb-3 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                {agent.description}
            </p>

            {/* Stats */}
            <div className={`
                relative flex items-center gap-3 text-xs
                ${isDark ? 'text-emerald-500/50' : 'text-emerald-600/70'}
            `}>
                <span>{metadata.messageCount} messages</span>
                {metadata.lastActive && (
                    <span>•</span>
                )}
            </div>

            {/* Arrow indicator */}
            <div className={`
                absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100
                transition-all duration-300 group-hover:translate-x-1
                ${isDark ? 'text-emerald-400' : 'text-emerald-500'}
            `}>
                →
            </div>
        </button>
    );
};

// ===== ADD AGENT BUTTON =====

interface AddAgentButtonProps {
    isDark: boolean;
    onClick: () => void;
}

const AddAgentButton: React.FC<AddAgentButtonProps> = ({ isDark, onClick }) => (
    <button
        onClick={onClick}
        className={`
            p-5 rounded-2xl text-center
            border-2 border-dashed transition-all duration-300
            hover:scale-[1.02]
            ${isDark
                ? 'border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/5'
                : 'border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'}
        `}
    >
        <div className={`
            w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-4
            ${isDark ? 'bg-emerald-500/10' : 'bg-gray-100'}
        `}>
            <Plus className={`w-6 h-6 ${isDark ? 'text-emerald-500/50' : 'text-gray-400'}`} />
        </div>
        <p className={`text-sm font-medium ${isDark ? 'text-emerald-500/50' : 'text-gray-400'}`}>
            Add Agent
        </p>
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
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className={`
                relative w-full max-w-md rounded-2xl p-6
                ${isDark ? 'bg-[#0c0c0c]' : 'bg-white'}
            `}
                style={{ boxShadow: isDark ? '0 0 60px rgba(16, 185, 129, 0.1)' : '0 20px 60px rgba(0,0,0,0.2)' }}
            >
                <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    Add an Agent
                </h2>
                <p className={`text-sm mb-6 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                    Choose an agent to add to your dashboard
                </p>

                <div className="space-y-2">
                    {availableAgents.map(agent => {
                        const Icon = ICON_MAP[agent.icon] || Sparkles;
                        return (
                            <button
                                key={agent.type}
                                onClick={() => onSelect(agent.type)}
                                className={`
                                    w-full flex items-center gap-4 p-4 rounded-xl
                                    border transition-all duration-200
                                    ${isDark
                                        ? 'bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/40'
                                        : 'bg-gray-50 border-gray-100 hover:border-emerald-300'}
                                `}
                            >
                                <div className={`
                                    w-10 h-10 rounded-lg flex items-center justify-center
                                    bg-gradient-to-br from-emerald-500/20 to-emerald-600/10
                                `}>
                                    <Icon className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                </div>
                                <div className="text-left">
                                    <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {agent.name}
                                    </p>
                                    <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                                        {agent.description}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Single Agent Mode Option */}
                <div className={`mt-6 pt-4 border-t ${isDark ? 'border-emerald-500/10' : 'border-gray-100'}`}>
                    <button
                        onClick={() => onSelect('ceo')}
                        className={`
                            w-full flex items-center gap-4 p-4 rounded-xl
                            border transition-all duration-200
                            ${isDark
                                ? 'bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/50'
                                : 'bg-emerald-50 border-emerald-100 hover:border-emerald-400'}
                        `}
                    >
                        <div className={`
                            w-10 h-10 rounded-lg flex items-center justify-center
                            bg-gradient-to-br from-emerald-500/30 to-emerald-600/20
                        `}>
                            <Crown className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        </div>
                        <div className="text-left">
                            <p className={`font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                                CEO Agent (All-in-One)
                            </p>
                            <p className={`text-xs ${isDark ? 'text-emerald-500/50' : 'text-emerald-600/70'}`}>
                                Switch to single-agent mode
                            </p>
                        </div>
                    </button>
                </div>

                <button
                    onClick={onClose}
                    className={`mt-4 w-full py-2 text-sm ${isDark ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Cancel
                </button>
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

    const handleAgentClick = (type: AgentType) => {
        openAgent(type);
    };

    const handleAddAgent = (type: AgentType) => {
        if (type === 'ceo') {
            setMode('single');
        } else {
            addAgent(type);
        }
        setShowPicker(false);
    };

    const handleGlobalInput = async () => {
        if (!inputValue.trim() || isProcessing) return;

        setIsProcessing(true);
        const intent = detectIntent(inputValue);

        // Add the agent if not already active
        if (!state.activeAgents.includes(intent.primaryAgent)) {
            addAgent(intent.primaryAgent);
        }

        // Open that agent
        openAgent(intent.primaryAgent);
        setInputValue('');
        setIsProcessing(false);
    };

    return (
        <div className="flex-1 flex flex-col relative overflow-hidden">
            {/* Background */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: isDark
                        ? `linear-gradient(rgba(16, 185, 129, 0.02) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(16, 185, 129, 0.02) 1px, transparent 1px)`
                        : 'none',
                    backgroundSize: '50px 50px',
                }}
            />

            {/* Top glow */}
            <div className={`
                absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full blur-3xl pointer-events-none
                ${isDark ? 'bg-emerald-500/5' : 'bg-emerald-100/30'}
            `} />

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col max-w-4xl mx-auto w-full px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className={`
                            w-10 h-10 rounded-xl flex items-center justify-center
                            bg-gradient-to-br from-emerald-500/20 to-emerald-600/10
                        `}
                            style={{ boxShadow: isDark ? '0 0 20px rgba(16, 185, 129, 0.3)' : 'none' }}
                        >
                            <Zap className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        </div>
                        <div>
                            <h1
                                className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}
                                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                            >
                                Your Agents
                            </h1>
                            <p className={`text-sm ${isDark ? 'text-emerald-500/50' : 'text-emerald-600/70'}`}>
                                {activeAgentDefs.length} agents active • All share context
                            </p>
                        </div>
                    </div>
                </div>

                {/* Agent Grid */}
                <div className="flex-1">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {activeAgentDefs.map(agent => (
                            <AgentBox
                                key={agent.type}
                                agent={agent}
                                metadata={state.agentMetadata[agent.type]}
                                isDark={isDark}
                                onClick={() => handleAgentClick(agent.type)}
                            />
                        ))}
                        <AddAgentButton isDark={isDark} onClick={() => setShowPicker(true)} />
                    </div>
                </div>

                {/* Global Input */}
                <div className={`
                    mt-8 pt-4 border-t
                    ${isDark ? 'border-emerald-500/10' : 'border-gray-100'}
                `}>
                    <div
                        className={`
                            flex items-center gap-3 px-4 py-3.5 rounded-2xl
                            transition-all duration-300
                            ${isDark
                                ? 'bg-emerald-500/5 border border-emerald-500/15 focus-within:border-emerald-500/40'
                                : 'bg-gray-50 border border-gray-200 focus-within:border-emerald-400'}
                        `}
                        style={{
                            boxShadow: isDark ? 'inset 0 0 30px rgba(16, 185, 129, 0.03), 0 0 20px rgba(16, 185, 129, 0.05)' : 'none'
                        }}
                    >
                        <Sparkles className={`w-5 h-5 ${isDark ? 'text-emerald-500/40' : 'text-emerald-400'}`} />

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
                            placeholder="Ask anything... (routes to the right agent)"
                            disabled={isProcessing}
                            className={`
                                flex-1 bg-transparent border-none outline-none text-sm font-medium
                                ${isDark ? 'text-white placeholder-emerald-500/30' : 'text-gray-900 placeholder-gray-400'}
                            `}
                            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                        />

                        <button
                            onClick={handleGlobalInput}
                            disabled={!inputValue.trim() || isProcessing}
                            className={`
                                p-2.5 rounded-xl transition-all duration-300
                                ${inputValue.trim() && !isProcessing
                                    ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                                    : (isDark ? 'bg-emerald-500/10 text-emerald-500/30' : 'bg-gray-100 text-gray-300')}
                            `}
                            style={{
                                boxShadow: inputValue.trim() && !isProcessing && isDark
                                    ? '0 0 20px rgba(16, 185, 129, 0.4)'
                                    : 'none'
                            }}
                        >
                            {isProcessing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                        </button>
                    </div>

                    <p className={`text-center text-[10px] mt-2 ${isDark ? 'text-emerald-500/20' : 'text-gray-300'}`}>
                        <Sparkles className="w-3 h-3 inline mr-1" />
                        All agents share context — talk to one, they all know
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
