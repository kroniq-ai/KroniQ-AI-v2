/**
 * Agent Workspace
 * Full workspace for a single agent with sidebar
 * Common sections + agent-specific sections
 */

import React, { useState, useRef, useEffect } from 'react';
import {
    ArrowLeft,
    Send,
    Sparkles,
    Loader2,
    Sun,
    CheckSquare,
    Target,
    Scale,
    Folder,
    Settings,
    DollarSign,
    TrendingUp,
    TrendingDown,
    CreditCard,
    Users,
    Lightbulb,
    MessageCircle,
    Rocket,
    BarChart2,
    FileText,
    Palette,
    Volume2,
    Image,
    Map,
    Bug,
    FileCode,
    Zap,
    AlertCircle,
    Clock,
    CheckCircle,
    Crown,
    Megaphone,
    Code
} from 'lucide-react';
import { useSharedAgentContext, getAgentDefinition, COMMON_SECTIONS, type AgentSection } from '../../contexts/SharedAgentContext';
import type { AgentType, AgentMessage } from '../../lib/agents/types';
import { AGENT_NAMES } from '../../lib/agents/AgentRouter';
import { getAgentResponse } from '../../lib/agents/AgentService';
import { detectIntent } from '../../lib/agents/AgentRouter';

// ===== ICON MAP =====

const ICON_MAP: Record<string, React.ElementType> = {
    Sun, CheckSquare, Target, Scale, Folder, Settings,
    DollarSign, TrendingUp, TrendingDown, CreditCard,
    Users, Lightbulb, MessageCircle,
    Rocket, BarChart2, FileText,
    Palette, Volume2, Image,
    Map, Bug, FileCode,
    Zap, AlertCircle, Clock, CheckCircle,
    Crown, Megaphone, Code
};

// ===== TYPES =====

interface AgentWorkspaceProps {
    isDark: boolean;
}

// ===== SIDEBAR =====

interface WorkspaceSidebarProps {
    isDark: boolean;
    agentType: AgentType;
    currentSection: string;
    onSectionChange: (section: string) => void;
    onBack: () => void;
}

const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
    isDark,
    agentType,
    currentSection,
    onSectionChange,
    onBack
}) => {
    const agentDef = getAgentDefinition(agentType);
    if (!agentDef) return null;

    const AgentIcon = ICON_MAP[agentDef.icon] || Sparkles;

    return (
        <div className={`
            w-56 flex-shrink-0 flex flex-col
            border-r
            ${isDark ? 'bg-[#0a0a0a] border-emerald-500/10' : 'bg-gray-50 border-gray-100'}
        `}>
            {/* Agent Header */}
            <div className={`p-4 border-b ${isDark ? 'border-emerald-500/10' : 'border-gray-100'}`}>
                <button
                    onClick={onBack}
                    className={`
                        flex items-center gap-2 text-sm font-medium mb-4
                        transition-colors duration-200
                        ${isDark ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-700'}
                    `}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </button>

                <div className="flex items-center gap-3">
                    <div className={`
                        w-10 h-10 rounded-xl flex items-center justify-center
                        bg-gradient-to-br from-emerald-500/20 to-emerald-600/10
                    `}
                        style={{ boxShadow: isDark ? '0 0 15px rgba(16, 185, 129, 0.2)' : 'none' }}
                    >
                        <AgentIcon className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    </div>
                    <div>
                        <h2 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                            {agentDef.shortName}
                        </h2>
                        <p className={`text-xs ${isDark ? 'text-emerald-500/50' : 'text-emerald-600/70'}`}>
                            Agent
                        </p>
                    </div>
                </div>
            </div>

            {/* Common Sections */}
            <div className="flex-1 overflow-y-auto p-3">
                <div className="mb-4">
                    <p className={`text-[10px] font-semibold uppercase tracking-wider px-3 mb-2 ${isDark ? 'text-white/20' : 'text-gray-400'}`}>
                        Main
                    </p>
                    {COMMON_SECTIONS.map(section => {
                        const Icon = ICON_MAP[section.icon] || Sparkles;
                        const isActive = currentSection === section.id;
                        return (
                            <button
                                key={section.id}
                                onClick={() => onSectionChange(section.id)}
                                className={`
                                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                                    text-sm font-medium transition-all duration-200
                                    ${isActive
                                        ? (isDark
                                            ? 'bg-emerald-500/15 text-emerald-400'
                                            : 'bg-emerald-100 text-emerald-700')
                                        : (isDark
                                            ? 'text-white/50 hover:text-white hover:bg-white/5'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100')}
                                `}
                                style={{
                                    boxShadow: isActive && isDark ? '0 0 10px rgba(16, 185, 129, 0.1)' : 'none'
                                }}
                            >
                                <Icon className="w-4 h-4" />
                                {section.label}
                            </button>
                        );
                    })}
                </div>

                {/* Agent-Specific Sections */}
                {agentDef.specificSections.length > 0 && (
                    <div>
                        <p className={`text-[10px] font-semibold uppercase tracking-wider px-3 mb-2 ${isDark ? 'text-white/20' : 'text-gray-400'}`}>
                            {agentDef.shortName}
                        </p>
                        {agentDef.specificSections.map(section => {
                            const Icon = ICON_MAP[section.icon] || Sparkles;
                            const isActive = currentSection === section.id;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => onSectionChange(section.id)}
                                    className={`
                                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                                        text-sm font-medium transition-all duration-200
                                        ${isActive
                                            ? (isDark
                                                ? 'bg-emerald-500/15 text-emerald-400'
                                                : 'bg-emerald-100 text-emerald-700')
                                            : (isDark
                                                ? 'text-white/50 hover:text-white hover:bg-white/5'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100')}
                                    `}
                                >
                                    <Icon className="w-4 h-4" />
                                    {section.label}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

// ===== CHAT AREA =====

interface ChatAreaProps {
    isDark: boolean;
    agentType: AgentType;
    messages: AgentMessage[];
    onSendMessage: (message: string) => Promise<void>;
    isProcessing: boolean;
}

const ChatArea: React.FC<ChatAreaProps> = ({
    isDark,
    agentType,
    messages,
    onSendMessage,
    isProcessing
}) => {
    const [inputValue, setInputValue] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const agentDef = getAgentDefinition(agentType);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async () => {
        if (!inputValue.trim() || isProcessing) return;
        const message = inputValue;
        setInputValue('');
        await onSendMessage(message);
    };

    return (
        <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                        <div className={`
                            w-16 h-16 rounded-2xl flex items-center justify-center mb-4
                            bg-gradient-to-br from-emerald-500/20 to-emerald-600/10
                        `}
                            style={{ boxShadow: isDark ? '0 0 30px rgba(16, 185, 129, 0.2)' : 'none' }}
                        >
                            <Sparkles className={`w-8 h-8 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        </div>
                        <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
                            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                            {agentDef?.name || 'Agent'}
                        </h2>
                        <p className={`text-sm max-w-sm ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                            {agentDef?.description}. Ask me anything!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4 max-w-2xl mx-auto">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                <div className={`
                                    w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                                    ${msg.role === 'user'
                                        ? (isDark ? 'bg-emerald-500/20' : 'bg-emerald-100')
                                        : 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10'}
                                `}>
                                    {msg.role === 'user' ? (
                                        <span className="text-[10px] font-bold text-emerald-400">YOU</span>
                                    ) : (
                                        <Sparkles className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                    )}
                                </div>
                                <div className={`
                                    max-w-[80%] px-4 py-3 rounded-2xl
                                    ${msg.role === 'user'
                                        ? (isDark ? 'bg-emerald-500/20 text-white' : 'bg-emerald-500 text-white')
                                        : (isDark ? 'bg-[#0d0d0d] border border-emerald-500/10' : 'bg-white border border-gray-100')}
                                `}>
                                    <p className={`text-sm leading-relaxed ${isDark && msg.role !== 'user' ? 'text-white/90' : ''}`}>
                                        {msg.content}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {isProcessing && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-emerald-500/20 to-emerald-600/10">
                                    <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                                </div>
                                <div className={`px-4 py-3 rounded-2xl ${isDark ? 'bg-[#0d0d0d] border border-emerald-500/10' : 'bg-white border border-gray-100'}`}>
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {/* Input */}
            <div className={`p-4 border-t ${isDark ? 'border-emerald-500/10' : 'border-gray-100'}`}>
                <div className="max-w-2xl mx-auto">
                    <div className={`
                        flex items-center gap-3 px-4 py-3.5 rounded-2xl
                        ${isDark
                            ? 'bg-emerald-500/5 border border-emerald-500/15 focus-within:border-emerald-500/40'
                            : 'bg-gray-50 border border-gray-200 focus-within:border-emerald-400'}
                    `}>
                        <Sparkles className={`w-5 h-5 ${isDark ? 'text-emerald-500/40' : 'text-emerald-400'}`} />
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit();
                                }
                            }}
                            placeholder={`Ask ${agentDef?.shortName || 'Agent'}...`}
                            disabled={isProcessing}
                            className={`
                                flex-1 bg-transparent border-none outline-none text-sm font-medium
                                ${isDark ? 'text-white placeholder-emerald-500/30' : 'text-gray-900 placeholder-gray-400'}
                            `}
                            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={!inputValue.trim() || isProcessing}
                            className={`
                                p-2.5 rounded-xl transition-all duration-300
                                ${inputValue.trim() && !isProcessing
                                    ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                                    : (isDark ? 'bg-emerald-500/10 text-emerald-500/30' : 'bg-gray-100 text-gray-300')}
                            `}
                        >
                            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ===== MAIN WORKSPACE =====

export const AgentWorkspace: React.FC<AgentWorkspaceProps> = ({ isDark }) => {
    const { state, closeAgent, setSection, addMessage, getAgentMessages } = useSharedAgentContext();
    const [isProcessing, setIsProcessing] = useState(false);
    const [localMessages, setLocalMessages] = useState<AgentMessage[]>([]);

    const agentType = state.currentAgent;
    if (!agentType) return null;

    const handleSendMessage = async (message: string) => {
        const userMessage: AgentMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: message,
            timestamp: new Date()
        };

        setLocalMessages(prev => [...prev, userMessage]);
        addMessage(userMessage);
        setIsProcessing(true);

        try {
            const response = await getAgentResponse({
                message,
                agentType,
                conversationHistory: localMessages.map(m => ({
                    role: m.role,
                    content: m.content
                }))
            }, 'pro');

            const agentMessage: AgentMessage = {
                id: (Date.now() + 1).toString(),
                role: 'agent',
                content: response.message,
                agentType: response.agentType,
                timestamp: new Date()
            };

            setLocalMessages(prev => [...prev, agentMessage]);
            addMessage(agentMessage);
        } catch (error) {
            console.error('[AgentWorkspace] Error:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    // For now, only "today" section shows chat
    // Other sections can be built out later
    const renderContent = () => {
        if (state.currentSection === 'today') {
            return (
                <ChatArea
                    isDark={isDark}
                    agentType={agentType}
                    messages={localMessages}
                    onSendMessage={handleSendMessage}
                    isProcessing={isProcessing}
                />
            );
        }

        // Placeholder for other sections
        return (
            <div className={`flex-1 flex items-center justify-center ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                <div className="text-center">
                    <p className="text-lg font-medium mb-2">{state.currentSection}</p>
                    <p className="text-sm">This section is coming soon...</p>
                </div>
            </div>
        );
    };

    return (
        <div className="flex-1 flex overflow-hidden">
            <WorkspaceSidebar
                isDark={isDark}
                agentType={agentType}
                currentSection={state.currentSection}
                onSectionChange={setSection}
                onBack={closeAgent}
            />
            <div className="flex-1 flex flex-col relative">
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
                <div className="relative z-10 flex-1 flex flex-col">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default AgentWorkspace;
