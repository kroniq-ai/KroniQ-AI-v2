/**
 * Today Page — Chat-First Agent Interface
 * Premium green design with glowing effects
 */

import React, { useState, useRef, useEffect } from 'react';
import {
    Send,
    Sparkles,
    Loader2,
    Target,
    CheckSquare,
    Users,
    Scale,
    DollarSign,
    Megaphone,
    Palette,
    Code,
    Sun,
    Zap,
    MessageSquare
} from 'lucide-react';
import { detectIntent, AGENT_NAMES } from '../../../lib/agents/AgentRouter';
import type { AgentType, AgentMessage } from '../../../lib/agents/types';
import { useBusinessContext } from '../../../contexts/BusinessContext';

// ===== TYPES =====

interface TodayPageProps {
    isDark: boolean;
}

// ===== AGENT ICONS =====

const AGENT_ICONS: Record<AgentType, React.ElementType> = {
    ceo: Target,
    execution: CheckSquare,
    customer: Users,
    decision: Scale,
    finance: DollarSign,
    marketing: Megaphone,
    branding: Palette,
    product: Code
};

// ===== AGENT COLORS (All green shades) =====

const AGENT_COLORS: Record<AgentType, string> = {
    ceo: 'from-emerald-500/20 to-emerald-600/10',
    execution: 'from-emerald-400/20 to-emerald-500/10',
    customer: 'from-teal-500/20 to-emerald-500/10',
    decision: 'from-emerald-500/20 to-teal-500/10',
    finance: 'from-emerald-600/20 to-emerald-500/10',
    marketing: 'from-emerald-400/20 to-teal-400/10',
    branding: 'from-teal-400/20 to-emerald-400/10',
    product: 'from-emerald-500/20 to-emerald-400/10'
};

// ===== GREETING =====

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
};

// ===== QUICK PROMPTS =====

const QUICK_PROMPTS = [
    { text: "What should I focus on today?", icon: Sun },
    { text: "I need to make a decision", icon: Scale },
    { text: "Help me with a task", icon: CheckSquare },
    { text: "Let's talk strategy", icon: Target },
];

// ===== MESSAGE BUBBLE =====

interface MessageBubbleProps {
    message: AgentMessage;
    isDark: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isDark }) => {
    const isUser = message.role === 'user';
    const Icon = message.agentType ? AGENT_ICONS[message.agentType] : Sparkles;
    const agentColor = message.agentType ? AGENT_COLORS[message.agentType] : 'from-emerald-500/20 to-emerald-600/10';

    return (
        <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div
                className={`
                    w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                    ${isUser
                        ? (isDark ? 'bg-emerald-500/20' : 'bg-emerald-100')
                        : `bg-gradient-to-br ${agentColor}`}
                `}
                style={{
                    boxShadow: isDark && !isUser ? '0 0 15px rgba(16, 185, 129, 0.2)' : 'none'
                }}
            >
                {isUser ? (
                    <span className="text-xs font-bold text-emerald-400">YOU</span>
                ) : (
                    <Icon className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                )}
            </div>

            {/* Message */}
            <div className={`max-w-[80%] ${isUser ? 'text-right' : ''}`}>
                {!isUser && message.agentType && (
                    <p className={`text-[10px] font-medium mb-1 ${isDark ? 'text-emerald-500/50' : 'text-emerald-600/70'}`}>
                        {AGENT_NAMES[message.agentType]}
                    </p>
                )}
                <div
                    className={`
                        px-4 py-3 rounded-2xl inline-block text-left
                        ${isUser
                            ? (isDark
                                ? 'bg-emerald-500/20 text-white'
                                : 'bg-emerald-500 text-white')
                            : (isDark
                                ? 'bg-[#0d0d0d] border border-emerald-500/10'
                                : 'bg-white border border-gray-100')}
                    `}
                    style={{
                        boxShadow: isUser && isDark ? '0 0 20px rgba(16, 185, 129, 0.2)' : 'none'
                    }}
                >
                    <p
                        className={`text-sm leading-relaxed ${isDark ? 'text-white/90' : isUser ? 'text-white' : 'text-gray-800'}`}
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                    >
                        {message.content}
                    </p>
                </div>
            </div>
        </div>
    );
};

// ===== AGENT INDICATOR =====

interface AgentIndicatorProps {
    agentType: AgentType;
    isDark: boolean;
}

const AgentIndicator: React.FC<AgentIndicatorProps> = ({ agentType, isDark }) => {
    const Icon = AGENT_ICONS[agentType];

    return (
        <div className={`
            inline-flex items-center gap-2 px-3 py-1.5 rounded-full
            ${isDark ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-100'}
        `}>
            <Icon className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <span className={`text-xs font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                {AGENT_NAMES[agentType]}
            </span>
        </div>
    );
};

// ===== MAIN COMPONENT =====

export const TodayPage: React.FC<TodayPageProps> = ({ isDark }) => {
    const { activeContext } = useBusinessContext();
    const [messages, setMessages] = useState<AgentMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentAgent, setCurrentAgent] = useState<AgentType>('ceo');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = async () => {
        if (!inputValue.trim() || isProcessing) return;

        const userMessage: AgentMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: inputValue.trim(),
            timestamp: new Date()
        };

        // Detect intent
        const intent = detectIntent(inputValue);
        setCurrentAgent(intent.primaryAgent);

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsProcessing(true);

        // Simulate AI response (will connect to Gemini)
        await new Promise(resolve => setTimeout(resolve, 1500));

        const agentResponse: AgentMessage = {
            id: (Date.now() + 1).toString(),
            role: 'agent',
            content: getAgentResponse(intent.primaryAgent, inputValue),
            agentType: intent.primaryAgent,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, agentResponse]);
        setIsProcessing(false);
    };

    // Temporary response generator (will be replaced with real AI)
    const getAgentResponse = (agent: AgentType, _query: string): string => {
        const responses: Record<AgentType, string> = {
            ceo: "Based on your stage, here are your top 3 priorities today:\n\n1. **Ship the MVP feature** — you've been stuck for 3 days\n2. **Talk to 2 customers** — always the most important\n3. **Review yesterday's feedback** — fresh insights matter",
            execution: "I'll help you turn this into action. What's the one thing that would make the biggest impact if you finished it today?",
            customer: "Let's track this customer insight. Who did you talk to and what was the key takeaway?",
            decision: "I'll log this decision. What options did you consider and why did you choose this path?",
            finance: "Your runway looks healthy. With current burn, you have roughly 8.8 months. Want me to calculate different scenarios?",
            marketing: "For your stage, I'd focus on one channel and go deep. What's worked best so far — content, outbound, or product-led?",
            branding: "Let's define your voice. Who's your ideal customer and what do they care about most?",
            product: "Before we scope this, let's validate: have you talked to customers who want this feature?"
        };
        return responses[agent];
    };

    const handleQuickPrompt = (prompt: string) => {
        setInputValue(prompt);
    };

    return (
        <div className="flex-1 flex flex-col relative overflow-hidden">
            {/* Background grid pattern */}
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
            <div className="relative z-10 flex-1 flex flex-col max-w-3xl mx-auto w-full px-6 py-6">
                {/* Header */}
                {messages.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                        {/* Animated sparkle icon */}
                        <div
                            className={`
                                w-20 h-20 rounded-3xl flex items-center justify-center mb-6
                                bg-gradient-to-br from-emerald-500/20 to-emerald-600/10
                            `}
                            style={{
                                boxShadow: isDark ? '0 0 40px rgba(16, 185, 129, 0.3), 0 0 80px rgba(16, 185, 129, 0.1)' : '0 4px 20px rgba(16, 185, 129, 0.2)'
                            }}
                        >
                            <MessageSquare className={`w-10 h-10 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        </div>

                        <h1
                            className={`text-3xl font-bold mb-2 tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}
                            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                        >
                            {getGreeting()}
                        </h1>
                        <p className={`text-sm mb-8 max-w-md ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                            I'm your AI COO. Tell me what you need help with{activeContext?.name ? ` for ${activeContext.name}` : ''}.
                        </p>

                        {/* Quick prompts */}
                        <div className="flex flex-wrap justify-center gap-2 mb-8">
                            {QUICK_PROMPTS.map((prompt, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleQuickPrompt(prompt.text)}
                                    className={`
                                        flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                                        transition-all duration-300 group
                                        ${isDark
                                            ? 'bg-emerald-500/10 text-emerald-400/70 hover:bg-emerald-500/20 hover:text-emerald-400 border border-emerald-500/10 hover:border-emerald-500/30'
                                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100'}
                                    `}
                                    style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                                >
                                    <prompt.icon className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
                                    {prompt.text}
                                </button>
                            ))}
                        </div>

                        {/* Agent badges */}
                        <div className="flex flex-wrap justify-center gap-2">
                            <p className={`w-full text-xs font-medium mb-2 ${isDark ? 'text-white/20' : 'text-gray-400'}`}>
                                Available Agents
                            </p>
                            {(['ceo', 'execution', 'customer', 'decision', 'finance'] as AgentType[]).map(agent => (
                                <AgentIndicator key={agent} agentType={agent} isDark={isDark} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Messages */}
                {messages.length > 0 && (
                    <div className="flex-1 overflow-y-auto space-y-4 pb-4">
                        {/* Active agent indicator */}
                        <div className="flex justify-center mb-4">
                            <AgentIndicator agentType={currentAgent} isDark={isDark} />
                        </div>

                        {messages.map((message) => (
                            <MessageBubble key={message.id} message={message} isDark={isDark} />
                        ))}

                        {/* Typing indicator */}
                        {isProcessing && (
                            <div className="flex gap-3">
                                <div
                                    className={`
                                        w-9 h-9 rounded-xl flex items-center justify-center
                                        bg-gradient-to-br ${AGENT_COLORS[currentAgent]}
                                    `}
                                    style={{ boxShadow: isDark ? '0 0 15px rgba(16, 185, 129, 0.2)' : 'none' }}
                                >
                                    <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                                </div>
                                <div className={`
                                    px-4 py-3 rounded-2xl
                                    ${isDark ? 'bg-[#0d0d0d] border border-emerald-500/10' : 'bg-white border border-gray-100'}
                                `}>
                                    <div className="flex gap-1">
                                        <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-emerald-400' : 'bg-emerald-500'} animate-bounce`} style={{ animationDelay: '0ms' }} />
                                        <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-emerald-400' : 'bg-emerald-500'} animate-bounce`} style={{ animationDelay: '150ms' }} />
                                        <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-emerald-400' : 'bg-emerald-500'} animate-bounce`} style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                )}

                {/* Input */}
                <div className={`
                    mt-auto pt-4 border-t
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
                                    handleSubmit();
                                }
                            }}
                            placeholder="Ask me anything about your business..."
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
                        <Zap className="w-3 h-3 inline mr-1" />
                        Agents activated by your intent
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TodayPage;
