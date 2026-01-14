/**
 * SuperKroniqChat - Premium AI Chat Experience
 * 
 * Features:
 * - DeepSeek R1 orchestration for intelligent routing
 * - Multi-task types: Chat, Image, PPT, Video (paid only)
 * - Real-time status indicators (Thinking, Researching, Generating...)
 * - Editable assumptions panel after responses
 * - Context persistence with versioning
 * - Quick actions: Make shorter/longer, Turn into...
 * - Clarifying questions for complex prompts
 * - Failure fallback with "Refining response..." messaging
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    Download, ThumbsUp, ThumbsDown, Send, Plus, Loader2, Zap, Trash2,
    Image as ImageIcon, Video, FileText, MessageSquare, ChevronDown,
    Sparkles, Globe, Pencil, Check, X, Settings, RotateCcw, Minus, Paperclip, Lightbulb, Share2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { getOpenRouterResponseWithUsage } from '../../lib/openRouterService';
import { getMessages, createProject, addMessage } from '../../lib/chatService';
import { MarkdownRenderer } from './MarkdownRenderer';
import { PPTPreview } from './PPTPreview';
import { getModelLogoUrl, getModelById } from '../../lib/aiModels';
import {
    interpretRequest,
    checkToolAccess,
    recordToolUsage,
    checkUsageLimits,
    DAILY_LIMITS,
    updateContext,
    getContext,
    summarizeOldMessages,
    modifyResponse,
    performWebSearch,
    performDeepResearch,
    performThinkLonger,
    enhancePrompt,
    generateChatName,
    type TaskType,
    type Assumption,
    type ClarifyingQuestion,
    type ConversationContext,
    type InterpretationResult
} from '../../lib/geminiOrchestrator';
import contextService from '../../lib/conversationContextService';
import { deductTokensForRequest } from '../../lib/tokenService';
import { getUserMemory, processMessageForMemory, buildMemoryContext } from '../../lib/globalMemoryService';
import { quickEnhance as enhanceForModel } from '../../lib/promptEnhancerService';
import {
    GenerationTask,
    createAndProcessTask,
    subscribeToTaskUpdates,
    resumePendingTasks,
    getCompletedTasks,
} from '../../lib/generationTaskService';
import { getOpenRouterVisionResponse } from '../../lib/openRouterService';


// ===== TYPES =====

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    model?: string;
    timestamp: Date;
    isLoading?: boolean;
    taskType?: TaskType;
    assumptions?: Assumption[];
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'ppt' | 'audio';
    statusHistory?: string[];
    pptStructure?: any; // PPT slide structure for preview
    pptFileName?: string; // PPT file name for download
    attachments?: { url: string; type: 'image' | 'document' | 'audio' | 'video'; name: string }[]; // User-attached files
    feedback?: 'liked' | 'disliked'; // User feedback on response
}

interface SuperKroniqChatProps {
    isDark: boolean;
    initialMessage?: string;
    projectId?: string;
    onBack?: () => void;
}

type StatusPhase = 'idle' | 'thinking' | 'researching' | 'planning' | 'generating' | 'refining' | 'complete' | 'enhancing';

// Free tier models - fast and efficient models for free users
const FREE_TIER_MODELS = [
    'google/gemini-2.0-flash-001',           // Fast Google model
    'meta-llama/llama-3.3-70b-instruct',     // Meta's open model
    'deepseek/deepseek-chat',                // DeepSeek free
    'mistralai/mistral-7b-instruct',         // Mistral 7B
    'qwen/qwen-2.5-7b-instruct',             // Qwen small
    'google/gemma-3-27b-it',                 // Google Gemma
];

// Default free model to use
const DEFAULT_FREE_MODEL = 'google/gemini-2.0-flash-001';

// ===== STATUS MESSAGES =====

const STATUS_MESSAGES: Record<StatusPhase, string> = {
    idle: '',
    thinking: 'Thinking...',
    researching: 'Deep researching...',
    planning: 'Finding the best model to answer...',
    generating: 'Generating response...',
    refining: 'Refining response...',
    complete: 'Complete',
    enhancing: 'Enhancing prompt...'
};

const TASK_STATUS_MESSAGES: Record<TaskType, Record<string, string>> = {
    chat: {
        generating: 'Crafting response...',
        refining: 'Refining response...',
    },
    image: {
        generating: 'Creating your image...',
        refining: 'Refining image...',
    },
    image_edit: {
        generating: 'Editing your image...',
        refining: 'Perfecting edits...',
    },
    video: {
        generating: 'Generating video...',
        refining: 'Refining video...',
    },
    ppt: {
        generating: 'Building presentation...',
        refining: 'Polishing slides...',
    },
    tts: {
        generating: 'Converting to speech...',
        refining: 'Perfecting audio...',
    },
    music: {
        generating: 'Composing music...',
        refining: 'Mixing tracks...',
    },
};

// ===== HELPER FUNCTIONS =====

// Helper to get model icon - ALWAYS show KroniQ branding to hide backend models
const getModelIcon = (modelName?: string): { icon: string | null; logoUrl: string | null; color: string } => {
    // ALWAYS return KroniQ branding - never reveal backend model logos
    return { icon: null, logoUrl: '/assets/super-kroniq-rocket.png', color: 'text-emerald-500' };
};

// Helper to get clean model display name - ALWAYS show KroniQ AI to hide backend
const getModelDisplayName = (modelName?: string): string => {
    // Always return KroniQ AI to hide backend model details from users
    return 'KroniQ AI';
};

const getTaskTypeIcon = (type: TaskType) => {
    switch (type) {
        case 'image': return <ImageIcon className="w-4 h-4" />;
        case 'video': return <Video className="w-4 h-4" />;
        case 'ppt': return <FileText className="w-4 h-4" />;
        default: return <MessageSquare className="w-4 h-4" />;
    }
};

/**
 * Local pre-classification for intent detection
 * Uses regex patterns to detect image/video/ppt/tts/music intent
 * Returns the detected TaskType or null if no strong match found
 */
function preClassifyIntentLocal(message: string): TaskType | null {
    const lower = message.toLowerCase().trim();

    // Image generation patterns - comprehensive synonyms
    const imagePatterns = [
        /\b(create|make|generate|produce|design|draw|render|craft)\s+(an?\s+)?(image|picture|photo|logo|artwork|illustration|visual|graphic|portrait|poster|banner|thumbnail)/i,
        /\b(image|picture|photo|illustration)\s+of\b/i,
        /\bdraw\s+(me\s+)?(a|an)?\s*/i,
        /\b(i\s+want|give\s+me|show\s+me|can\s+you\s+(create|make))\s+(an?\s+)?(image|picture|photo)/i,
        /\bdesign\s+(a|an)\s+(logo|poster|banner|flyer)/i,
    ];

    // Video generation patterns
    const videoPatterns = [
        /\b(create|make|generate|produce)\s+(an?\s+)?(video|animation|clip|footage|movie)/i,
        /\bvideo\s+(of|showing|about)\b/i,
        /\bturn\s+.*\s+into\s+(a\s+)?video\b/i,
        /\b(animate|animation\s+of)\b/i,
        /\b(i\s+want|give\s+me|show\s+me)\s+(a\s+)?video\b/i,
    ];

    // Music generation patterns
    const musicPatterns = [
        /\b(create|make|generate|compose|produce)\s+(an?\s+)?(song|music|track|beat|melody|soundtrack|tune|jingle)/i,
        /\b(song|music|track|beat)\s+(about|for)\b/i,
        /\bcompose\s+(a|an)?\s*(song|piece|melody)/i,
        /\b(i\s+want|give\s+me)\s+(a\s+)?(song|music|beat)/i,
    ];

    // TTS (text-to-speech) patterns
    const ttsPatterns = [
        /\b(read|speak|say|narrate|voice)\s+(this|the|aloud|out\s+loud)/i,
        /\btext\s+to\s+speech\b/i,
        /\btts\b/i,
        /\bvoice\s+(over|this)\b/i,
        /\bconvert\s+.*\s+to\s+(speech|audio|voice)/i,
        /\b(read|narrate)\s+.*\s+aloud\b/i,
    ];

    // PPT (presentation) patterns
    const pptPatterns = [
        /\b(create|make|generate|build)\s+(an?\s+)?(presentation|ppt|powerpoint|slides|slideshow|pitch\s+deck|deck)/i,
        /\b(presentation|slides|ppt)\s+(about|on|for)\b/i,
        /\bpitch\s+deck\b/i,
        /\b(i\s+need|give\s+me)\s+(a\s+)?(presentation|slides)/i,
    ];

    // Check patterns in order of specificity
    const allPatterns: Array<{ patterns: RegExp[]; intent: TaskType }> = [
        { patterns: ttsPatterns, intent: 'tts' },
        { patterns: pptPatterns, intent: 'ppt' },
        { patterns: musicPatterns, intent: 'music' },
        { patterns: videoPatterns, intent: 'video' },
        { patterns: imagePatterns, intent: 'image' },
    ];

    for (const { patterns, intent } of allPatterns) {
        for (const pattern of patterns) {
            if (pattern.test(lower)) {
                console.log(`🎯 [Pre-Classify] Local detection: "${intent}" for: "${message.substring(0, 50)}..."`);
                return intent;
            }
        }
    }

    // No strong match found
    return null;
}

// ===== COMPONENT =====

export const SuperKroniqChat: React.FC<SuperKroniqChatProps> = ({
    isDark,
    initialMessage,
    projectId: initialProjectId,
    onBack: _onBack // Reserved for future use
}) => {
    const { user, userTier } = useAuth();
    const { showToast } = useToast();
    const { setActiveProject } = useNavigation();

    // Core state
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessingRef] = useState({ current: false }); // Prevent reload during processing
    const [currentProjectId, setCurrentProjectId] = useState<string | undefined>(initialProjectId);
    const [isEnhancing, setIsEnhancing] = useState(false); // Enhance prompt state

    // Orchestration state
    const [currentStatus, setCurrentStatus] = useState<StatusPhase>('idle');
    // statusHistory used internally for status tracking
    const [, setStatusHistory] = useState<string[]>([]);
    const [selectedTaskType] = useState<TaskType | 'auto'>('auto'); // DeepSeek auto-selects
    const [webResearchEnabled, setWebResearchEnabled] = useState(false);
    const [conversationContext, setConversationContext] = useState<ConversationContext | null>(null);
    const [userMemory, setUserMemory] = useState<Record<string, any>>({}); // Global cross-chat memory

    // UI state
    const [clarifyingQuestions, setClarifyingQuestions] = useState<ClarifyingQuestion[]>([]);
    const [clarifyingAnswers, setClarifyingAnswers] = useState<Record<string, string>>({});
    const [pendingMessage, setPendingMessage] = useState<string>('');
    const [expandedAssumptions, setExpandedAssumptions] = useState<string | null>(null);
    const [editingAssumption, setEditingAssumption] = useState<{ messageId: string; key: string } | null>(null);
    const [editingValue, setEditingValue] = useState('');
    const [showConvertMenu, setShowConvertMenu] = useState<string | null>(null);
    const [modifyingMessageId, setModifyingMessageId] = useState<string | null>(null);
    const [showPricingModal, setShowPricingModal] = useState(false);
    const [pricingReason, setPricingReason] = useState('');
    const [showPlusMenu, setShowPlusMenu] = useState(false);
    const [showTurnIntoInput, setShowTurnIntoInput] = useState<string | null>(null);
    const [turnIntoValue, setTurnIntoValue] = useState('');
    const [attachments, setAttachments] = useState<{ file: File; preview?: string; type: 'image' | 'document' | 'audio' | 'video' }[]>([]);
    const [showChatSettings, setShowChatSettings] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Input mode - controls how the message is processed
    // 'normal' = Auto-route via Gemini orchestrator
    // 'fast' = Direct DeepSeek response (no model routing)
    // 'search' = Web search enabled
    // 'research' = Deep research mode
    // 'image' = Image generation
    const [inputMode, setInputMode] = useState<'normal' | 'fast' | 'search' | 'research' | 'image' | 'think'>('normal');

    // Chat settings for context integration
    const [chatSettings, setChatSettings] = useState<{
        contextMemory: string;
        responseStyle: 'concise' | 'balanced' | 'detailed';
        conversationPattern: string;
    }>({
        contextMemory: '',
        responseStyle: 'balanced',
        conversationPattern: ''
    });

    // Build system prompt with chat settings
    const buildSystemPrompt = useCallback(() => {
        let prompt = `You are KroniQ AI, a powerful all-in-one AI assistant with multiple capabilities!

## YOUR CAPABILITIES (You CAN do all of these):
- 💬 **Chat**: Answer questions, write code, create documents, analyze data, give advice
- 🎨 **Image Generation**: Create stunning images, logos, artwork, photos, visualizations
- 🎬 **Video Generation**: Generate AI videos, animations, commercials, clips
- 🎵 **Music Generation**: Compose music, create songs, generate audio tracks
- 🎤 **Text-to-Speech**: Convert text to natural-sounding speech
- 📊 **Presentations**: Create professional PowerPoint-style presentations

## IMPORTANT TOOL AWARENESS:
- When a user asks you to CREATE/GENERATE/MAKE an image, video, music, or presentation, your system will automatically route it to the correct tool
- You NEVER need to say "I can't generate images" - KroniQ CAN generate images!
- You NEVER need to describe what an image would look like - actually generate it!
- If the user is on Free tier and tries to use a premium feature, inform them about their plan limits

## HOW TO RESPOND:
- For image/video requests: These are automatically routed. If you're responding in chat mode, it means the request was already processed.
- For informational questions about images: Answer helpfully, don't describe - the system generates for you.
- For tier-limited features: Say "You're on the [tier] plan - [feature] requires [required tier]"`;

        // Add global user memory (cross-chat context)
        const memoryContext = buildMemoryContext(userMemory);
        if (memoryContext) {
            prompt += memoryContext;
        }

        // Add context/memory if set
        if (chatSettings.contextMemory) {
            prompt += `\n\n**User Context:**\n${chatSettings.contextMemory}`;
        }

        // Add response style instructions
        switch (chatSettings.responseStyle) {
            case 'concise':
                prompt += `\n\n**Response Style:** Be concise and direct. Use short paragraphs and bullet points. Avoid unnecessary details.`;
                break;
            case 'detailed':
                prompt += `\n\n**Response Style:** Be thorough and detailed. Provide comprehensive explanations with examples when helpful.`;
                break;
            default:
                prompt += `\n\n**Response Style:** Use a balanced approach - thorough but not overly verbose.`;
        }

        // Add conversation pattern if set
        if (chatSettings.conversationPattern) {
            prompt += `\n\n**Format Instructions:** ${chatSettings.conversationPattern}`;
        }

        // Add identity protection - CRITICAL: Never reveal backend models
        prompt += `\n\n**CRITICAL IDENTITY RULES:**
- You ARE KroniQ AI. This is your only identity.
- NEVER mention Claude, GPT, OpenAI, Anthropic, Google, DeepSeek, Meta, Mistral, or any other AI company/model name.
- If asked what model you are, what powers you, or about your backend, ALWAYS respond: "I'm KroniQ AI! I'm designed to provide the best AI assistance without getting into the technical details of my infrastructure."
- Never say "I'm Claude" or "I'm GPT" or any variation - you are ONLY KroniQ AI.
- If pressed about your architecture, say: "I'm built on proprietary KroniQ technology optimized for your needs."
- Do not speculate about or reveal any internal routing, model switching, or backend systems.`;

        return prompt;
    }, [chatSettings, userMemory]);

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const hasInitializedRef = useRef(false);
    const hasLoadedProjectRef = useRef<string | null>(null);

    // ===== EFFECTS =====

    // Load global user memory on mount
    useEffect(() => {
        const loadUserMemory = async () => {
            if (user?.id) {
                try {
                    const memory = await getUserMemory(user.id);
                    setUserMemory(memory);
                    if (Object.keys(memory).length > 0) {
                        console.log('🧠 [GlobalMemory] Loaded user memory:', Object.keys(memory));
                    }
                } catch (error) {
                    console.error('Failed to load user memory:', error);
                }
            }
        };
        loadUserMemory();
    }, [user?.id]);

    // Load project messages - reload when projectId changes
    useEffect(() => {
        if (initialProjectId) {
            // Always load when initialProjectId changes (different project clicked)
            if (hasLoadedProjectRef.current !== initialProjectId) {
                // User is switching to a different chat - reset processing state
                if (isProcessingRef.current) {
                    console.log('🔄 [SuperKroniqChat] User switched chats - resetting processing state');
                    isProcessingRef.current = false;
                    setIsLoading(false);
                }

                hasLoadedProjectRef.current = initialProjectId;
                setCurrentProjectId(initialProjectId);
                loadMessagesFromProject(initialProjectId);
                loadContext(initialProjectId);
            }
        }
    }, [initialProjectId]);

    // Handle initial message
    useEffect(() => {
        if (initialMessage && !hasInitializedRef.current && !initialProjectId) {
            hasInitializedRef.current = true;
            handleSendMessage(initialMessage);
        }
    }, [initialMessage, initialProjectId]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Pending message recovery - detect user messages without AI responses after refresh
    useEffect(() => {
        const checkAndRetryPendingMessages = async () => {
            if (!user?.id || messages.length === 0 || isLoading) return;

            // Check if the last message is from user and there's no AI response after it
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.role === 'user' && !lastMessage.isLoading) {
                // Check localStorage for pending message flag
                const pendingKey = `pending_message_${currentProjectId}`;
                const pendingData = localStorage.getItem(pendingKey);

                if (pendingData) {
                    const pending = JSON.parse(pendingData);
                    const pendingTime = new Date(pending.timestamp).getTime();
                    const now = Date.now();

                    // Only retry if pending is less than 5 minutes old
                    if (now - pendingTime < 5 * 60 * 1000) {
                        console.log('🔄 [Recovery] Found pending message, auto-retrying...');
                        showToast('info', 'Resuming your message...');

                        // Clear the pending flag
                        localStorage.removeItem(pendingKey);

                        // Retry the message
                        handleSendMessage(pending.message);
                    } else {
                        // Too old, clear it
                        localStorage.removeItem(pendingKey);
                    }
                }
            }
        };

        // Delay check to allow messages to load first
        const timer = setTimeout(checkAndRetryPendingMessages, 1000);
        return () => clearTimeout(timer);
    }, [messages.length, user?.id, currentProjectId, isLoading]);

    // Subscribe to generation task updates (survives page refresh)
    useEffect(() => {
        if (!user?.id) return;

        // Subscribe to task completion events
        const unsubscribe = subscribeToTaskUpdates(user.id, (task: GenerationTask) => {
            if (task.status === 'completed' && task.project_id === currentProjectId) {
                // Add completed generation result to chat
                const completedMessage: ChatMessage = {
                    id: task.message_id || `task-${task.id}`,
                    role: 'assistant',
                    content: task.result_content || (task.task_type === 'image'
                        ? '🎨 **Image Generated!**\n\nYour image is ready!'
                        : '✅ **Generation Complete!**'),
                    model: 'KroniQ AI',
                    timestamp: new Date(task.completed_at || Date.now()),
                    isLoading: false,
                    taskType: task.task_type as TaskType,
                    mediaUrl: task.result_url,
                    mediaType: task.task_type === 'video' ? 'video' : task.task_type === 'image' ? 'image' : undefined,
                };

                // Add to messages if not already present
                setMessages(prev => {
                    const exists = prev.some(m => m.id === completedMessage.id);
                    if (exists) {
                        // Update existing message
                        return prev.map(m => m.id === completedMessage.id ? completedMessage : m);
                    } else {
                        // Add new message
                        return [...prev, completedMessage];
                    }
                });

                showToast('success', 'Generation complete!');
            } else if (task.status === 'failed') {
                showToast('error', `Generation failed: ${task.error_message || 'Unknown error'}`);
            }
        });

        // Resume pending tasks on mount (in case user refreshed during generation)
        resumePendingTasks(user.id);

        return () => {
            unsubscribe();
        };
    }, [user?.id, currentProjectId, showToast]);

    // Load completed tasks from previous sessions
    useEffect(() => {
        const loadCompletedGenerations = async () => {
            if (!currentProjectId) return;

            try {
                // Get tasks completed in last 24 hours for this project
                const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
                const completedTasks = await getCompletedTasks(currentProjectId, since);

                for (const task of completedTasks) {
                    // Add to messages if not already present
                    setMessages(prev => {
                        const existingIds = new Set(prev.map(m => m.id));
                        if (existingIds.has(task.message_id || `task-${task.id}`)) {
                            return prev; // Already present
                        }

                        const taskMessage: ChatMessage = {
                            id: task.message_id || `task-${task.id}`,
                            role: 'assistant',
                            content: task.result_content || (task.task_type === 'image'
                                ? '🎨 **Image Generated!**\n\nYour image is ready!'
                                : '✅ **Generation Complete!**'),
                            model: 'KroniQ AI',
                            timestamp: new Date(task.completed_at || Date.now()),
                            isLoading: false,
                            taskType: task.task_type as TaskType,
                            mediaUrl: task.result_url,
                            mediaType: task.task_type === 'video' ? 'video' : task.task_type === 'image' ? 'image' : undefined,
                        };

                        return [...prev, taskMessage];
                    });
                }
            } catch (err) {
                console.error('Failed to load completed generations:', err);
            }
        };

        loadCompletedGenerations();
    }, [currentProjectId]);

    // ===== DATA LOADING =====

    const loadMessagesFromProject = async (projId: string) => {
        // Don't reload messages if we're processing a response
        if (isProcessingRef.current) {
            console.log('⏳ [SuperKroniqChat] Skipping message reload - processing in progress');
            return;
        }

        try {
            console.log('📂 [SuperKroniqChat] Loading messages for project:', projId);
            const projectMessages = await getMessages(projId);

            const chatMessages: ChatMessage[] = projectMessages.map((msg: any) => ({
                id: msg.id,
                role: msg.role as 'user' | 'assistant',
                content: msg.content,
                model: 'KroniQ AI', // Always show KroniQ AI, never expose backend model
                timestamp: new Date(msg.created_at || Date.now()),
                isLoading: false,
                taskType: msg.metadata?.taskType,
                assumptions: msg.metadata?.assumptions,
                mediaUrl: msg.metadata?.mediaUrl,
                mediaType: msg.metadata?.mediaType,
            }));

            setMessages(chatMessages);
            console.log('✅ [SuperKroniqChat] Loaded', chatMessages.length, 'messages');
        } catch (error) {
            console.error('❌ [SuperKroniqChat] Failed to load messages:', error);
        }
    };

    const loadContext = async (projId: string) => {
        if (!user?.id) return;
        const ctx = await getContext(projId, user.id);
        setConversationContext(ctx);
    };

    // ===== STATUS MANAGEMENT =====

    const updateStatus = useCallback((phase: StatusPhase, taskType: TaskType = 'chat') => {
        setCurrentStatus(phase);
        const message = TASK_STATUS_MESSAGES[taskType]?.[phase] || STATUS_MESSAGES[phase];
        if (message && phase !== 'idle') {
            setStatusHistory(prev => [...prev.slice(-4), message]);
        }
    }, []);

    // ===== STOP GENERATION HANDLER =====

    const handleStopGeneration = () => {
        console.log('🛑 [SuperKroniqChat] User stopped generation');
        setIsLoading(false);
        setCurrentStatus('idle');
        isProcessingRef.current = false;

        // Update the loading message to show it was stopped
        setMessages(prev => prev.map(msg =>
            msg.isLoading
                ? { ...msg, content: '*(Generation stopped by user)*', isLoading: false }
                : msg
        ));

        console.log('✓ Generation stopped');
    };

    // ===== MAIN SEND HANDLER =====

    type InputMode = 'normal' | 'fast' | 'search' | 'research' | 'image' | 'think';

    const handleSendMessage = async (messageText?: string, overrideInputMode?: InputMode) => {
        const text = messageText || inputValue.trim();
        if (!text && attachments.length === 0) return;
        if (isLoading) return;

        // CHECK CHAT LIMITS FIRST - before any processing
        const chatLimitCheck = await checkUsageLimits(user?.id || '', 'chat', userTier || 'FREE');
        if (!chatLimitCheck.allowed) {
            // Show limit reached message as a system notification
            const limitMessage: ChatMessage = {
                id: Date.now().toString(),
                role: 'assistant',
                content: `💬 **Daily Chat Limit Reached!**

❌ You've used **${chatLimitCheck.used}/${chatLimitCheck.limit}** messages today on the **${userTier?.toUpperCase() || 'FREE'}** plan.

**Daily message limits:**
• 🆓 Free: ${DAILY_LIMITS.FREE.chat} messages/day
• ⭐ Starter: ${DAILY_LIMITS.STARTER.chat} messages/day  
• 💎 Pro: ${DAILY_LIMITS.PRO.chat} messages/day
• 👑 Premium: ${DAILY_LIMITS.PREMIUM.chat} messages/day

✨ **[Upgrade your plan](/pricing)** to send more messages, or wait until tomorrow for your limit to reset!`,
                timestamp: new Date(),
                model: 'KroniQ AI'
            };
            setMessages(prev => [...prev, {
                id: (Date.now() - 1).toString(),
                role: 'user',
                content: text,
                timestamp: new Date()
            }, limitMessage]);
            return;
        }

        // Set processing flag to prevent message reload race condition
        isProcessingRef.current = true;

        setInputValue('');
        setCurrentStatus('thinking');
        setStatusHistory([]);

        // Save pending message to localStorage for recovery on refresh
        if (currentProjectId) {
            const pendingKey = `pending_message_${currentProjectId}`;
            localStorage.setItem(pendingKey, JSON.stringify({
                message: text,
                timestamp: new Date().toISOString()
            }));
        }

        // Process attachments
        let processedText = text;
        let hasImages = false;
        const imageData: { base64: string; mimeType: string }[] = [];

        // ===== AUTOMATIC PROMPT ENHANCEMENT =====
        // Enhance the user's prompt for better AI responses (unless it's very short)
        if (processedText.length > 10 && !processedText.startsWith('/')) {
            try {
                console.log('✨ [AUTO-ENHANCE] Enhancing prompt:', processedText.substring(0, 50) + '...');
                setCurrentStatus('enhancing');
                const enhancedText = await enhanceForModel(processedText, 'chat');
                if (enhancedText && enhancedText !== processedText) {
                    console.log('✨ [AUTO-ENHANCE] Enhanced to:', enhancedText.substring(0, 50) + '...');
                    processedText = enhancedText;
                }
            } catch (enhanceError) {
                console.warn('✨ [AUTO-ENHANCE] Failed, using original:', enhanceError);
                // Continue with original text if enhancement fails
            }
            setCurrentStatus('thinking');
        }

        console.log('📎 [Attachments] Processing attachments count:', attachments.length, attachments);
        if (attachments.length > 0) {
            for (const attachment of attachments) {
                console.log('📎 [Attachment] Type:', attachment.type, 'File:', attachment.file?.name);
                if (attachment.type === 'image') {
                    hasImages = true;
                    console.log('🖼️ [Image] Encoding image to base64...');
                    // Encode image for vision model
                    const base64 = await encodeImageToBase64(attachment.file);
                    imageData.push({ base64, mimeType: attachment.file.type });
                    console.log('🖼️ [Image] Encoded! base64 length:', base64?.length, 'mimeType:', attachment.file.type);
                } else if (attachment.type === 'document') {
                    // Read text-based documents (txt, md, json, html, css, js, etc.)
                    const fileName = attachment.file.name.toLowerCase();
                    const textExtensions = ['.txt', '.md', '.json', '.html', '.css', '.js', '.ts', '.jsx', '.tsx', '.csv', '.xml', '.yaml', '.yml', '.py', '.java', '.c', '.cpp', '.h', '.php', '.rb', '.go', '.rs', '.swift'];
                    const isTextFile = textExtensions.some(ext => fileName.endsWith(ext));

                    if (isTextFile) {
                        try {
                            const fileContent = await readFileAsText(attachment.file);
                            const lang = fileName.split('.').pop() || 'text';
                            processedText += `\n\n📎 **${attachment.file.name}**\n\`\`\`${lang}\n${fileContent.substring(0, 15000)}\n\`\`\``;
                        } catch {
                            processedText += `\n\n📎 [${attachment.file.name}] (Unable to read content)`;
                        }
                    } else {
                        // Binary files (Word, PDF, PPT, Excel) - can't read directly
                        const binaryFormats = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx'];
                        const isBinary = binaryFormats.some(ext => fileName.endsWith(ext));
                        if (isBinary) {
                            processedText += `\n\n⚠️ [${attachment.file.name}] - This is a binary file format. For best results, copy the text content directly into the chat.`;
                        } else {
                            processedText += `\n\n📎 [Attached: ${attachment.file.name}]`;
                        }
                    }
                } else if (attachment.type === 'video') {
                    // Video files - note limitation
                    processedText += `\n\n🎬 [Video: ${attachment.file.name}] - Video analysis is not yet supported. Please describe what's in the video.`;
                } else if (attachment.type === 'audio') {
                    // Audio files - note limitation
                    processedText += `\n\n🎵 [Audio: ${attachment.file.name}] - Audio transcription is not yet supported. Please describe the audio content.`;
                }
            }
            // Clear attachments after processing
            setAttachments([]);
        }

        // For image analysis, use a vision-capable model
        const displayText = hasImages
            ? `${text || 'Analyze this image'}`
            : processedText;

        // Create attachment objects for the message
        const messageAttachments = attachments.map(att => ({
            url: att.preview || URL.createObjectURL(att.file),
            type: att.type,
            name: att.file.name
        }));

        // Add user message with attachments
        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: displayText,
            timestamp: new Date(),
            attachments: messageAttachments.length > 0 ? messageAttachments : undefined
        };

        // Add loading message immediately to show "Thinking..." right away
        const loadingId = (Date.now() + 1).toString();
        const loadingMessage: ChatMessage = {
            id: loadingId,
            role: 'assistant',
            content: '',
            model: 'KroniQ AI', // Always show KroniQ AI
            timestamp: new Date(),
            isLoading: true,
            taskType: 'chat',
            statusHistory: ['Thinking...']
        };

        // Add both messages atomically to prevent render timing issues
        setMessages(prev => [...prev, userMessage, loadingMessage]);
        setIsLoading(true);

        // Create project if needed
        let projId = currentProjectId;
        if (!projId) {
            try {
                // Generate AI-powered chat name (runs in parallel with intent interpretation)
                const chatName = await generateChatName(text);
                const project = await createProject(chatName, 'chat');
                projId = project.id;
                setCurrentProjectId(projId);

                // Update navigation to this project (updates URL for refresh persistence)
                setActiveProject(project);

                // Update pending message key with new project ID
                const pendingKey = `pending_message_${projId}`;
                localStorage.setItem(pendingKey, JSON.stringify({
                    message: text,
                    timestamp: new Date().toISOString()
                }));

                // Dispatch custom event to notify sidebar to refresh (after brief delay for DB commit)
                setTimeout(() => {
                    window.dispatchEvent(new CustomEvent('projectCreated', { detail: { projectId: projId, name: chatName } }));
                }, 200);
            } catch (error) {
                console.error('Failed to create project:', error);
            }
        }

        // Save user message
        if (projId) {
            try {
                await addMessage(projId, 'user', text);
            } catch (error) {
                console.error('Failed to save user message:', error);
            }
        }

        // Build conversation history
        const conversationHistory = messages.map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
        }));

        // Summarize if too long
        const { recentMessages, summary } = await summarizeOldMessages(conversationHistory, 35);

        // Get current context
        let context = conversationContext || {
            longTerm: {},
            shortTerm: {},
            version: 1,
            lastUpdated: new Date().toISOString()
        };

        // Add summary to context if exists
        if (summary) {
            context = {
                ...context,
                shortTerm: { ...context.shortTerm, currentTask: summary } as typeof context.shortTerm
            };
        }

        // Interpret request with DeepSeek R1
        updateStatus('planning');
        let interpretation: InterpretationResult;

        // Handle input mode overrides
        const isFastMode = inputMode === 'fast';
        const isSearchMode = inputMode === 'search';
        const isResearchMode = inputMode === 'research';
        const isImageMode = inputMode === 'image';

        // Reset input mode after use (except for fast mode which is sticky)
        if (!isFastMode && inputMode !== 'normal') {
            setInputMode('normal');
        }

        // Fast mode: Skip interpretation, use DeepSeek directly
        if (isFastMode) {
            interpretation = {
                intent: 'chat',
                confidence: 1.0,
                enhancedPrompt: text,
                contextUpdates: { longTerm: {}, shortTerm: {} },
                assumptions: [],
                needsClarification: false,
                clarifyingQuestions: [],
                suggestedModel: 'deepseek/deepseek-chat', // Direct DeepSeek
                statusMessage: 'Fast response...'
            };
        } else if (isImageMode) {
            interpretation = {
                intent: 'image',
                confidence: 1.0,
                enhancedPrompt: text,
                contextUpdates: { longTerm: {}, shortTerm: {} },
                assumptions: [],
                needsClarification: false,
                clarifyingQuestions: [],
                suggestedModel: 'image-generator',
                statusMessage: 'Creating image...'
            };
        } else {
            // Normal mode: Full interpretation with optional web research
            try {
                interpretation = await interpretRequest(
                    text,
                    recentMessages,
                    context,
                    {
                        webResearch: webResearchEnabled || isSearchMode || isResearchMode,
                        forceTaskType: selectedTaskType !== 'auto' ? selectedTaskType : undefined,
                        userTier: (userTier?.toLowerCase() || 'free') as 'free' | 'starter' | 'pro' | 'premium'
                    }
                );
            } catch (error) {
                console.error('Interpretation error:', error);
                interpretation = {
                    intent: 'chat',
                    confidence: 0.7,
                    enhancedPrompt: text,
                    contextUpdates: { longTerm: {}, shortTerm: {} },
                    assumptions: [],
                    needsClarification: false,
                    clarifyingQuestions: [],
                    suggestedModel: 'anthropic/claude-3.5-sonnet-20241022',
                    statusMessage: 'Generating response...'
                };
            }

            // ===== LOCAL PRE-CLASSIFICATION FALLBACK =====
            // If Gemini returned 'chat' intent, double-check with local regex detection
            // This catches cases where Gemini misses obvious phrases like "create an image"
            if (interpretation.intent === 'chat') {
                const localIntent = preClassifyIntentLocal(text);
                if (localIntent) {
                    console.log(`🔄 [Fallback] Overriding Gemini 'chat' → '${localIntent}' based on local detection`);
                    interpretation = { ...interpretation, intent: localIntent };
                }
            }
        }

        // Check if clarification needed - show as AI message in chat flow
        if (interpretation.needsClarification && interpretation.clarifyingQuestions.length > 0) {
            // Keep user message in the flow, add clarifying questions as assistant message
            setPendingMessage(text);

            // Build ChatGPT-style clarifying message
            const questionsContent = `Got it 👍 Before I proceed, just a few quick questions:\n\n${interpretation.clarifyingQuestions.map((q, i) =>
                `**${i + 1}. ${q.question}** *(${q.placeholder || 'optional'})*`
            ).join('\n\n')}\n\nReply with your answers and I'll get started right away! 🚀`;

            // Update the loading message with clarifying questions
            setMessages(prev => prev.map(msg =>
                msg.id === loadingId
                    ? {
                        ...msg,
                        content: questionsContent,
                        model: 'KroniQ AI', // Always show KroniQ AI
                        isLoading: false
                    }
                    : msg
            ));
            setClarifyingQuestions(interpretation.clarifyingQuestions);
            setIsLoading(false);
            setCurrentStatus('idle');
            return;
        }

        // Check tool access - TEMPORARILY BYPASSED FOR TESTING
        // TODO: Re-enable once is_paid detection is working properly
        // const access = await checkToolAccess(user?.id || '', interpretation.intent);
        // if (!access.allowed) {
        //     setShowPricingModal(true);
        //     setPricingReason(access.upgradeReason || 'Upgrade required');
        //     setIsLoading(false);
        //     setCurrentStatus('idle');
        //     return;
        // }
        const access = { allowed: true }; // Bypass for testing

        // Update the loading message with interpretation details
        setMessages(prev => prev.map(msg =>
            msg.id === loadingId
                ? {
                    ...msg,
                    model: 'KroniQ AI', // Always show KroniQ AI, hide backend model
                    taskType: interpretation.intent,
                    statusHistory: [interpretation.statusMessage]
                }
                : msg
        ));

        // Update status based on mode
        if (inputMode === 'search') {
            updateStatus('researching', 'chat');
        } else if (inputMode === 'research') {
            updateStatus('researching', 'chat');
        } else if (inputMode === 'fast') {
            updateStatus('generating', 'chat');
        } else {
            updateStatus('generating', interpretation.intent);
        }

        try {
            let response: string;
            let mediaUrl: string | undefined;
            let mediaType: 'image' | 'video' | 'ppt' | undefined;
            let pptStructure: any | undefined;
            let pptFileName: string | undefined;

            // Handle special input modes first
            if (inputMode === 'search') {
                updateStatus('researching', 'chat');
                try {
                    response = await performWebSearch(text);
                    if (!response) {
                        response = `🌐 **Web Search**\n\nI searched the web for: "${text}"\n\n*Unfortunately, I couldn't retrieve results at this time. Please try again.*`;
                    } else {
                        response = `🌐 **Web Search Results**\n\n${response}`;
                    }
                } catch (error) {
                    console.error('Web search error:', error);
                    response = `🌐 **Web Search**\n\nI tried to search for: "${text}"\n\n*The search service is currently unavailable. Please try again later.*`;
                }
            } else if (inputMode === 'research') {
                updateStatus('researching', 'chat');
                try {
                    response = await performDeepResearch(text);
                    if (!response) {
                        response = `🔬 **Deep Research**\n\nI conducted deep research on: "${text}"\n\n*Unfortunately, I couldn't complete the research at this time. Please try again.*`;
                    } else {
                        response = `🔬 **Deep Research Report**\n\n${response}`;
                    }
                } catch (error) {
                    console.error('Deep research error:', error);
                    response = `🔬 **Deep Research**\n\nI tried to research: "${text}"\n\n*The research service is currently unavailable. Please try again later.*`;
                }
            } else if (inputMode === 'fast') {
                // Fast mode - direct response without extensive research
                updateStatus('generating', 'chat');
                const conversationHistory = messages.map(msg => ({
                    role: msg.role as 'user' | 'assistant',
                    content: msg.content
                }));
                try {
                    response = await performThinkLonger(text, conversationHistory);
                    if (!response) {
                        response = `⚡ **Fast Response**\n\nI processed your request quickly.\n\n*Couldn't complete at this time. Please try again.*`;
                    }
                } catch (error) {
                    console.error('Fast mode error:', error);
                    response = `⚡ **Fast Response**\n\nI tried to process: "${text}"\n\n*The service encountered an issue. Please try again.*`;
                }
            } else if (inputMode === 'think') {
                // Think Longer mode - deeper reasoning with more context
                updateStatus('researching', 'chat');
                const conversationHistory = messages.map(msg => ({
                    role: msg.role as 'user' | 'assistant',
                    content: msg.content
                }));
                try {
                    response = await performThinkLonger(text, conversationHistory);
                    if (!response) {
                        response = `🧠 **Think Longer**\n\nI analyzed your request in depth.\n\n*Couldn't complete at this time. Please try again.*`;
                    } else {
                        response = `🧠 **Deep Analysis**\n\n${response}`;
                    }
                } catch (error) {
                    console.error('Think longer error:', error);
                    response = `🧠 **Think Longer**\n\nI tried to analyze: "${text}"\n\n*The service encountered an issue. Please try again.*`;
                }
            } else {
                // Normal routing based on intent

                // Fallback: Override intent if user explicitly mentions PPT/presentation keywords
                const lowerText = text.toLowerCase();
                const pptKeywords = [
                    'ppt', 'powerpoint', 'presentation', 'slide', 'slides',
                    'deck', 'pitch deck', 'keynote', 'slidedeck', 'slide deck',
                    'slides total', 'title slide', 'content slides'
                ];
                if (pptKeywords.some(kw => lowerText.includes(kw))) {
                    console.log('🎯 PPT keyword detected, overriding intent to ppt');
                    interpretation.intent = 'ppt';
                }

                // Fallback: Override intent if user explicitly mentions TTS/speech keywords
                const ttsKeywords = [
                    'text to speech', 'tts for', 'generate speech', 'speak this',
                    'read aloud', 'convert to speech', 'voice this', 'generate tts',
                    'make audio of', 'say this', 'narrate this', 'voiceover for'
                ];
                // Voice modification keywords - these should also route to TTS
                const voiceModificationKeywords = [
                    'make the voice', 'change the voice', 'use a different voice',
                    'female voice', 'male voice', 'woman voice', 'women voice', 'man voice',
                    'voice of a woman', 'voice of a man', 'voice of a women', 'voice of a men',
                    'deeper voice', 'softer voice', 'british voice', 'american voice',
                    'young voice', 'older voice', 'different voice', 'another voice',
                    'make it sound like', 'change voice to', 'use voice'
                ];
                if (ttsKeywords.some(kw => lowerText.includes(kw)) ||
                    voiceModificationKeywords.some(kw => lowerText.includes(kw))) {
                    console.log('🎙️ TTS keyword detected, overriding intent to tts');
                    interpretation.intent = 'tts';
                }

                // Fallback: Override intent if user explicitly mentions music keywords
                const musicKeywords = [
                    'compose a song', 'create music', 'generate music', 'make a song',
                    'write a jingle', 'background music', 'make beats', 'generate a track'
                ];
                if (musicKeywords.some(kw => lowerText.includes(kw))) {
                    console.log('🎵 Music keyword detected, overriding intent to music');
                    interpretation.intent = 'music';
                }

                // Fallback: Override intent if user explicitly mentions video keywords
                const videoKeywords = [
                    // Video creation keywords
                    'generate a video', 'create a video', 'make a video', 'generate video',
                    'create video', 'make video', 'video of', 'animate this', 'animation of',
                    'video for', 'generate clip', 'create clip', 'make a clip',
                    'turn into video', 'convert to video', 'make this a video',
                    // Additional video patterns
                    'video based on', 'promotional video', 'promo video',
                    'ad video', 'commercial for', 'advertisement video',
                    'animated video', 'motion graphics', 'video content',
                    'short video', 'video ad', 'product video', 'demo video',
                    'explainer video', 'cinematic video', 'footage of'
                ];
                if (videoKeywords.some(kw => lowerText.includes(kw))) {
                    console.log('🎬 Video keyword detected, overriding intent to video');
                    interpretation.intent = 'video';
                }

                // Fallback: Override intent if user explicitly mentions image/logo keywords
                // BUT NOT if user is asking to ANALYZE an attached image!
                const imageAnalysisKeywords = [
                    'analyze', 'describe', 'what is in', 'what\'s in', 'tell me about',
                    'explain', 'identify', 'recognize', 'look at', 'see in',
                    'check this', 'review this', 'my picture', 'my image', 'my photo',
                    'attached image', 'attached photo', 'attached picture', 'this image',
                    'the image', 'the photo', 'the picture', 'uploaded'
                ];
                const isAnalyzingAttachment = hasImages && imageAnalysisKeywords.some(kw => lowerText.includes(kw));

                if (isAnalyzingAttachment) {
                    console.log('🔍 [Intent] User wants to ANALYZE attached image - keeping chat intent for vision');
                    // Don't override to image generation - let vision handle it in default case
                } else {
                    const imageKeywords = [
                        // Logo keywords
                        'turn into logo', 'turn this into a logo', 'turn it into a logo',
                        'make a logo', 'create a logo', 'generate a logo', 'design a logo',
                        'logo for', 'logo based on',
                        // Image creation keywords
                        'make an image', 'create an image', 'generate an image',
                        'turn into image', 'turn this into an image', 'visualize this',
                        'create a visual', 'make a visual', 'turn into visual',
                        'generate image', 'create image', 'make image',
                        'draw this', 'illustrate this', 'picture of this',
                        'image of', 'picture of', 'photo of', 'artwork of', 'illustration of',
                        'generate a picture', 'create a picture', 'make a picture',
                        'draw a', 'draw an', 'sketch of', 'render of', 'graphic of',
                        // Additional patterns for comprehensive detection
                        'stunning image', 'create a stunning', 'make a stunning',
                        'beautiful image', 'realistic image', 'photorealistic',
                        'visualize', 'visualization of', 'visual of',
                        'based on this content', 'visually striking',
                        'design an image', 'design a picture', 'design a visual',
                        'poster of', 'banner of', 'flyer for', 'mockup of',
                        'generate art', 'create art', 'make art', 'artwork for',
                        'icon of', 'icon for', 'symbol of',
                        'portrait of', 'landscape of', 'scene of',
                        'show me', 'show an image', 'show a picture'
                    ];
                    if (imageKeywords.some(kw => lowerText.includes(kw))) {
                        console.log('🖼️ Image keyword detected, overriding intent to image');
                        interpretation.intent = 'image';

                        // For "turn into" requests, enhance the prompt with context from the last AI response
                        if (lowerText.includes('turn') && (lowerText.includes('into') || lowerText.includes('to'))) {
                            // Find the last AI message to use as context
                            const lastAIMessage = recentMessages.filter(m => m.role === 'assistant').pop();
                            if (lastAIMessage) {
                                const contextText = lastAIMessage.content.substring(0, 500);

                                // Determine what type of image
                                const isLogo = lowerText.includes('logo');
                                const isVisual = lowerText.includes('visual');
                                const isImage = lowerText.includes('image') || lowerText.includes('picture');

                                if (isLogo) {
                                    interpretation.enhancedPrompt = `Create a professional, modern logo design inspired by this concept:\n\n${contextText}\n\nThe logo should be clean, memorable, and suitable for branding. Use bold shapes and colors.`;
                                } else if (isVisual || isImage) {
                                    interpretation.enhancedPrompt = `Create a stunning visual representation based on:\n\n${contextText}\n\nMake it visually striking and clear.`;
                                }

                                console.log('📝 [Image] Enhanced prompt from context:', interpretation.enhancedPrompt.substring(0, 100));
                            }
                        }
                    }
                }

                console.log('📊 Routing intent:', interpretation.intent);

                switch (interpretation.intent) {
                    case 'image':
                        try {
                            // CHECK LIMITS FIRST - before any generation
                            const imageLimitCheck = await checkUsageLimits(user?.id || '', 'image', userTier || 'FREE');
                            if (!imageLimitCheck.allowed) {
                                const tierLimits = DAILY_LIMITS[userTier?.toUpperCase() || 'FREE'];
                                response = `🎨 **Daily Image Limit Reached!**

❌ You've used **${imageLimitCheck.used}/${imageLimitCheck.limit}** images today on the **${userTier?.toUpperCase() || 'FREE'}** plan.

**Daily limits by tier:**
• 🆓 Free: ${DAILY_LIMITS.FREE.image} images/day
• ⭐ Starter: ${DAILY_LIMITS.STARTER.image} images/day
• 💎 Pro: ${DAILY_LIMITS.PRO.image} images/day
• 👑 Premium: ${DAILY_LIMITS.PREMIUM.image} images/day

✨ **Upgrade your plan** to generate more images, or wait until tomorrow for your limit to reset!`;
                                break;
                            }

                            // Use tier-based image generation
                            const { generateImageForTier } = await import('../../lib/imageService');

                            // Map subscription tier to image service tier
                            const imageTier = (userTier?.toUpperCase() === 'PREMIUM' ? 'PREMIUM' :
                                userTier?.toUpperCase() === 'PRO' ? 'PRO' :
                                    userTier?.toUpperCase() === 'STARTER' ? 'PRO' : 'FREE') as 'FREE' | 'PRO' | 'PREMIUM';

                            let imagePrompt = interpretation.enhancedPrompt;

                            // Check if this is an image modification request
                            const lowerText = text.toLowerCase();
                            const modificationKeywords = [
                                'make it', 'change', 'add', 'remove', 'more', 'less',
                                'darker', 'brighter', 'colorful', 'vibrant', 'contrast',
                                'bigger', 'smaller', 'zoom', 'cropped', 'wider',
                                'different', 'another', 'redo', 'regenerate',
                                'in the style of', 'like', 'but', 'with',
                                'same but', 'this time', 'now make', 'instead'
                            ];
                            const isImageModification = modificationKeywords.some(kw => lowerText.includes(kw));

                            // If this seems like a modification, find the previous image prompt
                            if (isImageModification) {
                                // Look for previous image generation in history
                                const previousImageMessage = recentMessages
                                    .filter(m => m.role === 'assistant' && m.content.includes('Image Generated'))
                                    .pop();

                                // Also look for the original user request that triggered the image
                                const previousImageRequest = recentMessages
                                    .filter(m => m.role === 'user')
                                    .reverse()
                                    .find(m => {
                                        const msgLower = m.content.toLowerCase();
                                        return msgLower.includes('image') || msgLower.includes('picture') ||
                                            msgLower.includes('draw') || msgLower.includes('create') ||
                                            msgLower.includes('generate') || msgLower.includes('show me');
                                    });

                                if (previousImageRequest) {
                                    // Combine original request with modification
                                    imagePrompt = `${previousImageRequest.content}, but ${text}. Make sure to apply this modification: ${text}`;
                                    console.log('🎨 [Image] Detected modification request, combining with previous:', imagePrompt.substring(0, 100));
                                }
                            }

                            console.log('🎨 [Image] Generating with tier:', imageTier, 'prompt:', imagePrompt.substring(0, 100));

                            const imageResult = await generateImageForTier(
                                imagePrompt,
                                imageTier
                            );

                            // Get daily limits based on tier
                            const imageLimits = {
                                FREE: 3, STARTER: 5, PRO: 10, PREMIUM: 25
                            };
                            const dailyLimit = imageLimits[userTier?.toUpperCase() as keyof typeof imageLimits] || 3;

                            response = `🎨 **Image Generated!**\n\nYour image is ready!${isImageModification ? ' (Modified version)' : ''}\n\n*📊 Daily limit: ${dailyLimit} images/day (${userTier?.toUpperCase() || 'FREE'} tier)*`;
                            mediaUrl = imageResult.url;
                            mediaType = 'image';
                            console.log('✅ [Image] Success:', mediaUrl);
                        } catch (imageError: any) {
                            console.error('❌ [Image] Generation failed:', imageError);
                            response = `🎨 **Image Generation Request**\n\nI tried to create: ${interpretation.enhancedPrompt}\n\n❌ *Error: ${imageError.message || 'Generation failed. Please try again.'}*`;
                        }
                        // Record usage for free tier limit
                        await recordToolUsage(user?.id || '', 'image');
                        break;

                    case 'image_edit':
                        try {
                            const { removeBackground, editImageWithPrompt } = await import('../../lib/kieAIService');

                            // Get attached image URL
                            const imageAttachments = messageAttachments.filter(a => a.type === 'image');
                            if (imageAttachments.length === 0) {
                                response = `🖼️ **Image Editing**\n\nPlease attach an image to edit. You can:\n• Remove background\n• Edit with prompts (e.g., "make it brighter", "add a sunset")\n• Transform style`;
                                break;
                            }

                            const sourceImageUrl = imageAttachments[0].url;
                            const promptLower = interpretation.enhancedPrompt.toLowerCase();

                            console.log('🖼️ [Image Edit] Processing:', promptLower.substring(0, 50));

                            // Detect type of edit
                            const isBgRemoval = promptLower.includes('remove background') ||
                                promptLower.includes('remove bg') ||
                                promptLower.includes('transparent') ||
                                promptLower.includes('cut out') ||
                                promptLower.includes('background removal');

                            let editedImageUrl: string;

                            if (isBgRemoval) {
                                console.log('🖼️ [Image Edit] Performing background removal...');
                                editedImageUrl = await removeBackground(sourceImageUrl);
                                response = `🖼️ **Background Removed!**\n\nYour image now has a transparent background.`;
                            } else {
                                console.log('🖼️ [Image Edit] Performing prompt-based edit...');
                                editedImageUrl = await editImageWithPrompt(sourceImageUrl, interpretation.enhancedPrompt);
                                response = `🖼️ **Image Edited!**\n\nYour edited image is ready.`;
                            }

                            mediaUrl = editedImageUrl;
                            mediaType = 'image';
                            console.log('✅ [Image Edit] Success:', mediaUrl);
                        } catch (editError: any) {
                            console.error('❌ [Image Edit] Failed:', editError);
                            response = `🖼️ **Image Editing Request**\n\nI tried to edit your image.\n\n❌ *Error: ${editError.message || 'Editing failed. Please try again.'}*`;
                        }
                        await recordToolUsage(user?.id || '', 'image');
                        break;

                    case 'video':
                        try {
                            // Check tier for video access
                            const { isVideoAllowedForTier, generateVideoForTier } = await import('../../lib/videoService');

                            // Map subscription tier to video service tier
                            const videoTier = (userTier?.toUpperCase() === 'PREMIUM' ? 'PREMIUM' :
                                userTier?.toUpperCase() === 'PRO' ? 'PRO' :
                                    userTier?.toUpperCase() === 'STARTER' ? 'PRO' : 'FREE') as 'FREE' | 'PRO' | 'PREMIUM';

                            console.log('🎬 [Video] Checking access for tier:', videoTier);

                            // Block free tier from video generation
                            if (!isVideoAllowedForTier(videoTier)) {
                                response = `🎬 **Video Generation**

⚠️ **You're on the ${userTier || 'Free'} plan** - Video generation requires a **Pro** or **Premium** subscription.

**What you wanted:**
${interpretation.enhancedPrompt.substring(0, 200)}${interpretation.enhancedPrompt.length > 200 ? '...' : ''}

✨ **Upgrade to unlock:**
• AI video generation (Veo 3.1, Sora, Kling)
• More image generations
• Premium AI models
• Priority processing

Click the token widget in the sidebar to upgrade!`;
                                break;
                            }

                            // CHECK DAILY LIMITS for paid users
                            const videoLimitCheck = await checkUsageLimits(user?.id || '', 'video', userTier || 'FREE');
                            if (!videoLimitCheck.allowed) {
                                response = `🎬 **Daily Video Limit Reached!**

❌ You've used **${videoLimitCheck.used}/${videoLimitCheck.limit}** videos today on the **${userTier?.toUpperCase() || 'FREE'}** plan.

**Daily limits by tier:**
• 🆓 Free: ${DAILY_LIMITS.FREE.video} videos/day
• ⭐ Starter: ${DAILY_LIMITS.STARTER.video} video/day
• 💎 Pro: ${DAILY_LIMITS.PRO.video} videos/day
• 👑 Premium: ${DAILY_LIMITS.PREMIUM.video} videos/day

✨ **Upgrade your plan** to generate more videos, or wait until tomorrow!`;
                                break;
                            }

                            console.log('🎬 [Video] Generating with tier:', videoTier, 'prompt:', interpretation.enhancedPrompt.substring(0, 100));

                            const videoResult = await generateVideoForTier(
                                interpretation.enhancedPrompt,
                                videoTier
                            );

                            response = `🎬 **Video Generated!**\n\nYour video is ready!`;
                            mediaUrl = videoResult.url;
                            mediaType = 'video';
                            console.log('✅ [Video] Success:', mediaUrl);
                        } catch (videoError: any) {
                            console.error('❌ [Video] Generation failed:', videoError);

                            if (videoError.message?.includes('UPGRADE_REQUIRED')) {
                                response = `🎬 **Video Generation - Upgrade Required**\n\nVideo generation requires a Pro or Premium subscription.\n\n✨ **Upgrade now** to unlock video generation!`;
                            } else {
                                response = `🎬 **Video Generation Request**\n\nI tried to create: ${interpretation.enhancedPrompt}\n\n❌ *Error: ${videoError.message || 'Generation failed. Please try again.'}*`;
                            }
                        }
                        // Record usage for free tier limit
                        await recordToolUsage(user?.id || '', 'video');
                        break;

                    case 'ppt':
                        try {
                            // Map subscription tier for PPT access check
                            const pptTier = (userTier?.toUpperCase() === 'PREMIUM' ? 'PREMIUM' :
                                userTier?.toUpperCase() === 'PRO' ? 'PRO' :
                                    userTier?.toUpperCase() === 'STARTER' ? 'PRO' : 'FREE');

                            console.log('📊 [PPT] Checking access for tier:', pptTier);

                            // Check tier for PPT access (Pro and Premium only)
                            if (pptTier === 'FREE') {
                                response = `📊 **Presentation Generation - Upgrade Required**

Presentation generation is a **Pro/Premium** feature.

**What you tried to create:**
${interpretation.enhancedPrompt}

✨ **Upgrade now** to unlock:
• AI presentation generation
• Professional templates
• Video generation
• Priority support`;
                                break;
                            }

                            // Use PptxGenJS for direct download
                            const { generatePresentation } = await import('../../lib/pptGeneratorService');

                            // Extract slide count from prompt if mentioned
                            const slideCountMatch = interpretation.enhancedPrompt.match(/(\d+)\s*slides?/i);
                            const slideCount = slideCountMatch ? parseInt(slideCountMatch[1]) : 5;

                            console.log('📊 [PPT] Generating with tier:', pptTier, 'slides:', slideCount);

                            // Generate and download presentation directly
                            const pptResult = await generatePresentation(interpretation.enhancedPrompt, {
                                slideCount: Math.min(Math.max(slideCount, 3), 10)
                            });

                            if (pptResult.success) {
                                // Build slide preview markdown
                                let slidePreview = '';
                                if (pptResult.slides && pptResult.slides.length > 0) {
                                    slidePreview = '\n\n---\n\n**📑 Slide Preview:**\n';
                                    pptResult.slides.slice(0, 5).forEach((slide, idx) => {
                                        slidePreview += `\n**Slide ${idx + 1}:** ${slide.title}`;
                                        if (slide.bullets && slide.bullets.length > 0) {
                                            slidePreview += '\n' + slide.bullets.slice(0, 3).map(b => `  • ${b}`).join('\n');
                                        }
                                        if (slide.subtitle) {
                                            slidePreview += `\n  _${slide.subtitle}_`;
                                        }
                                    });
                                    if (pptResult.slides.length > 5) {
                                        slidePreview += `\n\n_...and ${pptResult.slides.length - 5} more slides_`;
                                    }
                                }

                                response = `📊 **Presentation Generated!**

✅ Your presentation "${pptResult.fileName || 'presentation.pptx'}" has been downloaded!

**${slideCount} slides** • ${pptResult.templateUsed || 'Professional'} template${slidePreview}

---
📥 _Check your Downloads folder for the .pptx file_`;
                                mediaType = 'ppt';
                                pptFileName = pptResult.fileName;
                                console.log('✅ [PPT] Success:', pptFileName);
                            } else {
                                throw new Error(pptResult.error || 'Generation failed');
                            }
                        } catch (pptError: any) {
                            console.error('❌ [PPT] Generation failed:', pptError);

                            // Check if it's a template missing error
                            const errorMsg = pptError.message?.includes('Template not found')
                                ? '⚠️ Template file not found. Please add .pptx templates to /public/ppt-templates/'
                                : `❌ Error: ${pptError.message || 'Generation failed. Please try again.'}`;

                            response = `📊 **Presentation Request**\n\nI tried to create a presentation about: ${interpretation.enhancedPrompt}\n\n${errorMsg}`;
                        }
                        // Record usage for free tier limit
                        await recordToolUsage(user?.id || '', 'ppt');
                        break;

                    case 'tts':
                        try {
                            // CHECK LIMITS FIRST
                            const ttsLimitCheck = await checkUsageLimits(user?.id || '', 'tts', userTier || 'FREE');
                            if (!ttsLimitCheck.allowed) {
                                response = `🎙️ **Daily TTS Limit Reached!**

❌ You've used **${ttsLimitCheck.used}/${ttsLimitCheck.limit}** TTS generations today on the **${userTier?.toUpperCase() || 'FREE'}** plan.

**Daily limits by tier:**
• 🆓 Free: ${DAILY_LIMITS.FREE.tts} TTS/day
• ⭐ Starter: ${DAILY_LIMITS.STARTER.tts} TTS/day
• 💎 Pro: ${DAILY_LIMITS.PRO.tts} TTS/day
• 👑 Premium: ${DAILY_LIMITS.PREMIUM.tts} TTS/day

✨ **Upgrade your plan** to generate more speech, or wait until tomorrow!`;
                                break;
                            }

                            const { generateWithElevenLabs, isElevenLabsAvailable, ELEVENLABS_VOICES } = await import('../../lib/elevenlabsTTSService');

                            // Extract the text to convert to speech
                            let textToSpeak = interpretation.enhancedPrompt;
                            let selectedVoiceId = ELEVENLABS_VOICES[0].id; // Default: Rachel (female)

                            // Check if this is a modification request (voice change, etc.)
                            const lowerText = text.toLowerCase();
                            const isVoiceModification = lowerText.includes('voice') ||
                                lowerText.includes('female') || lowerText.includes('male') ||
                                lowerText.includes('woman') || lowerText.includes('women') ||
                                lowerText.includes('man') || lowerText.includes('deeper') ||
                                lowerText.includes('softer') || lowerText.includes('british');

                            // If this seems like a modification, find the previous TTS text
                            if (isVoiceModification) {
                                // Look for previous TTS message in history
                                const previousTTSMessage = recentMessages
                                    .filter(m => m.role === 'assistant' && m.content.includes('Speech Generated'))
                                    .pop();

                                if (previousTTSMessage) {
                                    // Extract the text from the previous TTS response
                                    const textMatch = previousTTSMessage.content.match(/"([^"]+)"/);
                                    if (textMatch) {
                                        textToSpeak = textMatch[1];
                                        console.log('🎙️ [TTS] Found previous text to re-generate:', textToSpeak);
                                    }
                                }
                            }

                            // Voice selection based on user request
                            if (lowerText.includes('female') || lowerText.includes('woman') || lowerText.includes('women')) {
                                // Female voices: Rachel, Bella, Elli
                                selectedVoiceId = 'EXAVITQu4vr4xnSDxMaL'; // Bella - Soft female
                            } else if (lowerText.includes('male') || lowerText.includes('man') || lowerText.includes('men')) {
                                // Male voices: Josh, Antoni, Adam
                                selectedVoiceId = 'TxGEqnHWrfWFTfGW9XjX'; // Josh - Deep male
                            } else if (lowerText.includes('deep') || lowerText.includes('deeper')) {
                                selectedVoiceId = 'TxGEqnHWrfWFTfGW9XjX'; // Josh - Deep
                            } else if (lowerText.includes('soft') || lowerText.includes('softer') || lowerText.includes('calm')) {
                                selectedVoiceId = 'EXAVITQu4vr4xnSDxMaL'; // Bella - Soft
                            } else if (lowerText.includes('british')) {
                                selectedVoiceId = 'onwK4e9ZLuTAKqWW03F9'; // Daniel - Deep British
                            } else if (lowerText.includes('young')) {
                                selectedVoiceId = 'yoZ06aMxZJJ28mfd3POQ'; // Sam - Young
                            } else if (lowerText.includes('narrative') || lowerText.includes('narrator')) {
                                selectedVoiceId = 'pNInz6obpgDQGcFmaJgB'; // Adam - Narrative
                            }

                            // Try to extract quoted text if present (e.g., 'generate tts for "hello there"')
                            const quotedMatch = text.match(/"([^"]+)"|'([^']+)'|"([^"]+)"|'([^']+)'/);
                            if (quotedMatch && !isVoiceModification) {
                                textToSpeak = quotedMatch[1] || quotedMatch[2] || quotedMatch[3] || quotedMatch[4];
                            }

                            console.log('🎙️ [TTS] Generating speech for:', textToSpeak.substring(0, 100));
                            console.log('🎙️ [TTS] Using voice ID:', selectedVoiceId);

                            if (!isElevenLabsAvailable()) {
                                // Fallback message if ElevenLabs isn't configured
                                response = `🎙️ **Text-to-Speech**\n\nTTS service is being configured. Please try again later or visit the **TTS Studio** from the sidebar for full audio generation.`;
                                break;
                            }

                            updateStatus('generating', 'tts');

                            const audioDataUrl = await generateWithElevenLabs({
                                text: textToSpeak,
                                voice: selectedVoiceId,
                            });

                            // Create an audio element for playback
                            const ttsLimits = {
                                FREE: 5, STARTER: 15, PRO: 30, PREMIUM: 100
                            };
                            const ttsLimit = ttsLimits[userTier?.toUpperCase() as keyof typeof ttsLimits] || 5;

                            // Show which voice was used
                            const voiceName = ELEVENLABS_VOICES.find(v => v.id === selectedVoiceId)?.name || 'AI Voice';
                            response = `🎙️ **Speech Generated!**\n\n"${textToSpeak}" (${voiceName})\n\n▶️ *Click the audio player below to listen:*\n\n*📊 Daily limit: ${ttsLimit} TTS/day (${userTier?.toUpperCase() || 'FREE'} tier)*`;

                            // Add audio to the response using HTML audio tag (will be rendered in markdown)
                            mediaUrl = audioDataUrl;
                            mediaType = 'audio' as any;

                            console.log('✅ [TTS] Success! Audio URL length:', audioDataUrl?.length || 0);
                            console.log('✅ [TTS] Audio URL starts with:', audioDataUrl?.substring(0, 50));
                        } catch (ttsError: any) {
                            console.error('❌ [TTS] Generation failed:', ttsError);
                            response = `🎙️ **Text-to-Speech Request**\n\nI tried to generate speech for your text.\n\n❌ *Error: ${ttsError.message || 'Generation failed. Please try again or visit the TTS Studio.'}*`;
                        }
                        await recordToolUsage(user?.id || '', 'tts');
                        break;

                    case 'music':
                        // Music generation - redirect to Music Studio for now
                        response = `🎵 **Music Generation**\n\nI'd love to compose music for you! For the best experience, please visit the **Music Studio** from the sidebar where you can:\n\n• Generate full songs with vocals (Suno)\n• Create instrumental tracks\n• Choose genres and styles\n• Download high-quality audio\n\n*What you requested:* ${interpretation.enhancedPrompt}`;
                        break;

                    default:
                        // Chat response - use context-aware system prompt
                        let modelToUse = interpretation.suggestedModel;

                        // Import tier checking function
                        const { isModelAllowedForTier, getDefaultFreeModel } = await import('../../lib/aiModels');

                        // Check if suggested model is allowed for user's tier
                        if (modelToUse && !isModelAllowedForTier(modelToUse, userTier)) {
                            // Model not allowed - use default free model
                            modelToUse = getDefaultFreeModel();
                        }

                        // If no model suggested, use default free model
                        if (!modelToUse) {
                            modelToUse = getDefaultFreeModel();
                        }

                        // Use vision model if images are attached
                        console.log('🔍 [Vision Check] hasImages:', hasImages, 'imageData.length:', imageData.length);
                        if (hasImages && imageData.length > 0) {
                            console.log('🔍 [Vision] ✨ Processing with', imageData.length, 'images');
                            console.log('🔍 [Vision] First image base64 length:', imageData[0]?.base64?.length || 0);

                            // Vision models to try in order (free models first, then paid as backup)
                            const visionModels = [
                                'google/gemini-2.0-flash-exp:free',      // Free Gemini
                                'meta-llama/llama-3.2-90b-vision-instruct', // Free Llama vision
                                'openai/gpt-4o-mini',                     // Paid backup
                            ];

                            let visionSuccess = false;
                            for (const visionModel of visionModels) {
                                if (visionSuccess) break;
                                try {
                                    console.log('🔍 [Vision] Trying model:', visionModel);
                                    const visionResponse = await getOpenRouterVisionResponse(
                                        interpretation.enhancedPrompt || text,
                                        imageData,
                                        recentMessages.slice(-5) as Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
                                        buildSystemPrompt(),
                                        visionModel
                                    );
                                    response = visionResponse.content;
                                    visionSuccess = true;
                                    console.log('✅ [Vision] Response received from', visionModel, 'length:', response?.length);
                                } catch (visionError: any) {
                                    console.warn('⚠️ [Vision] Model', visionModel, 'failed:', visionError.message);
                                    // Continue to next model
                                }
                            }

                            if (!visionSuccess) {
                                console.error('❌ [Vision] All vision models failed');
                                response = `I can see your image but all vision models are currently unavailable. This might be due to high demand. Please try again in a moment!`;
                            }
                        } else {
                            console.log('🔍 [Vision] NOT using vision model - hasImages:', hasImages, 'imageData:', imageData.length);
                            const aiResponse = await getOpenRouterResponseWithUsage(
                                interpretation.enhancedPrompt,
                                recentMessages.slice(-10) as Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
                                buildSystemPrompt(),
                                modelToUse
                            );
                            response = aiResponse.content;
                        }
                }
            }

            // Update context
            if (projId && user?.id && Object.keys(interpretation.contextUpdates.longTerm).length > 0) {
                const updatedContext = await updateContext(
                    projId,
                    user.id,
                    interpretation.contextUpdates,
                    context
                );
                setConversationContext(updatedContext);
            }

            // Deduct tokens for this request
            if (user?.id) {
                // Get token cost from model pricing (since aiResponse is in inner scope)
                const { getModelCost } = await import('../../lib/modelTokenPricing');
                const modelCost = getModelCost(interpretation.suggestedModel || 'deepseek/deepseek-chat');
                const tokensUsed = modelCost?.tokensPerMessage || 100;

                try {
                    await deductTokensForRequest(
                        user.id,
                        interpretation.suggestedModel || 'deepseek/deepseek-chat',
                        'openrouter',
                        tokensUsed,
                        'chat'
                    );
                    console.log(`💰 [Tokens] Deducted ${tokensUsed} tokens for chat`);
                } catch (tokenError) {
                    console.error('Token deduction failed:', tokenError);
                }
            }

            // Extract any personal info from user message for global memory
            if (user?.id && text) {
                processMessageForMemory(user.id, text);
            }

            // Update message with response
            setMessages(prev => prev.map(msg =>
                msg.id === loadingId
                    ? {
                        ...msg,
                        content: response,
                        isLoading: false,
                        assumptions: interpretation.assumptions,
                        mediaUrl,
                        mediaType,
                        pptStructure,
                        pptFileName,
                        statusHistory: [...(msg.statusHistory || []), 'Complete']
                    }
                    : msg
            ));

            // Save assistant message
            if (projId) {
                try {
                    await addMessage(projId, 'assistant', response, undefined, undefined, {
                        model: interpretation.suggestedModel,
                        taskType: interpretation.intent,
                        assumptions: interpretation.assumptions,
                        mediaUrl,
                        mediaType
                    });
                } catch (error) {
                    console.error('Failed to save assistant message:', error);
                }
            }

        } catch (error: any) {
            console.error('AI Response error:', error);

            // Retry once with "Refining response..."
            updateStatus('refining', interpretation.intent);

            try {
                const retryResponse = await getOpenRouterResponseWithUsage(
                    interpretation.enhancedPrompt,
                    recentMessages.slice(-10) as Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
                    buildSystemPrompt(),
                    'openai/gpt-4o' // Fallback model
                );

                setMessages(prev => prev.map(msg =>
                    msg.id === loadingId
                        ? {
                            ...msg,
                            content: retryResponse.content,
                            isLoading: false,
                            assumptions: interpretation.assumptions
                        }
                        : msg
                ));
            } catch (retryError) {
                setMessages(prev => prev.map(msg =>
                    msg.id === loadingId
                        ? {
                            ...msg,
                            content: "I couldn't complete this request. Please try again.",
                            isLoading: false
                        }
                        : msg
                ));
            }
        } finally {
            setIsLoading(false);
            setCurrentStatus('idle');
            // Clear processing flag after a short delay to allow DB save
            setTimeout(() => {
                isProcessingRef.current = false;
            }, 500);
        }
    };

    // ===== CLARIFYING QUESTIONS HANDLER =====
    // Reserved for future use when clarifying questions require form input
    const _handleSubmitClarifyingAnswers = () => {
        if (!pendingMessage) return;

        // Combine original message with answers
        const enrichedMessage = `${pendingMessage}\n\nAdditional context:\n${clarifyingQuestions.map(q =>
            `- ${q.question}: ${clarifyingAnswers[q.id] || 'Not specified'}`
        ).join('\n')
            }`;

        setClarifyingQuestions([]);
        setClarifyingAnswers({});
        setPendingMessage('');

        handleSendMessage(enrichedMessage);
    };

    // ===== RESPONSE MODIFICATION =====

    const handleMakeShorterLonger = async (messageId: string, modification: 'shorter' | 'longer') => {
        const message = messages.find(m => m.id === messageId);
        if (!message || message.role !== 'assistant') return;

        setIsLoading(true);
        setModifyingMessageId(messageId);
        updateStatus('refining');

        // Show loading toast
        showToast(
            'info',
            modification === 'shorter'
                ? '✂️ Shortening response...'
                : '📝 Lengthening response...'
        );

        try {
            const modified = await modifyResponse(
                message.content,
                modification,
                conversationContext?.shortTerm.currentTask || ''
            );

            setMessages(prev => prev.map(msg =>
                msg.id === messageId
                    ? { ...msg, content: modified }
                    : msg
            ));

            // Show success toast
            showToast(
                'success',
                modification === 'shorter'
                    ? '✂️ Response shortened successfully!'
                    : '📝 Response lengthened successfully!'
            );
        } catch (error) {
            console.error('Modification failed:', error);
            showToast('error', 'Failed to modify response. Please try again.');
        } finally {
            setIsLoading(false);
            setModifyingMessageId(null);
            setCurrentStatus('idle');
        }
    };

    // ===== REGENERATE HANDLER =====

    const handleRegenerate = async (messageId: string) => {
        // Find the AI message and the user message before it
        const messageIndex = messages.findIndex(m => m.id === messageId);
        if (messageIndex <= 0) return;

        // Find the last user message before this AI response
        let userMessageIndex = messageIndex - 1;
        while (userMessageIndex >= 0 && messages[userMessageIndex].role !== 'user') {
            userMessageIndex--;
        }

        if (userMessageIndex < 0) return;

        const userMessage = messages[userMessageIndex];

        // Show loading toast
        showToast('info', '🔄 Regenerating response...');

        // Remove the AI response we're regenerating
        setMessages(prev => prev.filter(m => m.id !== messageId));

        // Re-send the user message
        handleSendMessage(userMessage.content);
    };

    // ===== CONVERT TO HANDLER =====

    const _handleConvertTo = async (messageId: string, targetType: TaskType) => {
        const message = messages.find(m => m.id === messageId);
        if (!message) return;

        setShowConvertMenu(null);

        // Check access
        const access = await checkToolAccess(user?.id || '', targetType);
        if (!access.allowed) {
            setShowPricingModal(true);
            setPricingReason(access.upgradeReason || 'Upgrade required');
            return;
        }

        // Create a new request based on the message
        let convertPrompt = '';
        switch (targetType) {
            case 'image':
                convertPrompt = `Create a visual/logo based on this: ${message.content.substring(0, 500)}`;
                break;
            case 'video':
                convertPrompt = `Create a promotional video based on: ${message.content.substring(0, 500)}`;
                break;
            case 'ppt':
                convertPrompt = `Create a pitch deck presentation based on: ${message.content.substring(0, 500)}`;
                break;
            default:
                return;
        }

        handleSendMessage(convertPrompt);
    };

    // ===== TURN INTO HANDLER =====
    // Enhanced handler that uses Gemini vision to analyze images before transformation
    const handleTurnInto = async (messageId: string, targetType: string) => {
        const message = messages.find(m => m.id === messageId);
        if (!message) return;

        setShowTurnIntoInput(null);
        setTurnIntoValue('');

        let sourceDescription = message.content.substring(0, 500);

        // If the message has a generated image/media, analyze it first using Gemini Vision
        if (message.mediaUrl && message.mediaType === 'image') {
            try {
                console.log('🔍 [TurnInto] Analyzing image with Gemini Vision...');

                // Convert image URL to base64 for vision API
                const response = await fetch(message.mediaUrl);
                const blob = await response.blob();
                const base64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const result = reader.result as string;
                        resolve(result.split(',')[1]); // Remove data URL prefix
                    };
                    reader.readAsDataURL(blob);
                });

                // Get image analysis from Gemini
                const analysisResult = await getOpenRouterVisionResponse(
                    'Describe this image in detail. What are the main elements, colors, style, and subject matter? Be specific about visual details.',
                    [{ base64, mimeType: blob.type || 'image/png' }],
                    [],
                    undefined,
                    'google/gemini-2.0-flash-exp:free'
                );

                sourceDescription = analysisResult.content;
                console.log('✅ [TurnInto] Image analyzed:', sourceDescription.substring(0, 200));
            } catch (error) {
                console.error('⚠️ [TurnInto] Vision analysis failed, using text content:', error);
            }
        }

        // Create appropriate prompt based on target type
        let transformPrompt = '';
        const targetLower = targetType.toLowerCase();

        if (targetLower.includes('image') || targetLower.includes('logo') || targetLower.includes('visual') || targetLower.includes('picture')) {
            // DIRECTLY generate image instead of sending through chat
            transformPrompt = `Create a stunning, ultra-high quality ${targetType} based on this concept:\n\n${sourceDescription}\n\nMake it visually striking, professional, photorealistic with excellent lighting and composition.`;

            console.log('🎨 [TurnInto] Directly generating image:', transformPrompt.substring(0, 100));

            // Add user message first
            const userMsgId = `usr_${Date.now()}`;
            setMessages(prev => [...prev, {
                id: userMsgId,
                role: 'user' as const,
                content: `Turn this into a ${targetType}`,
                timestamp: new Date(),
            }]);

            // Set loading
            setIsLoading(true);
            setCurrentStatus('generating');

            try {
                const { generateImageForTier } = await import('../../lib/imageService');
                const imageTier = (userTier?.toUpperCase() === 'PREMIUM' ? 'PREMIUM' :
                    userTier?.toUpperCase() === 'PRO' ? 'PRO' :
                        userTier?.toUpperCase() === 'STARTER' ? 'PRO' : 'FREE') as 'FREE' | 'PRO' | 'PREMIUM';

                const imageResult = await generateImageForTier(transformPrompt, imageTier);

                // Add the response with the image
                const aiMsgId = `ai_${Date.now()}`;
                setMessages(prev => [...prev, {
                    id: aiMsgId,
                    role: 'assistant' as const,
                    content: `🎨 **Image Generated!**\n\nYour ${targetType} is ready!`,
                    timestamp: new Date(),
                    mediaUrl: imageResult.url,
                    mediaType: 'image',
                    taskType: 'image',
                }]);

                showToast('success', `✨ ${targetType} created!`);
            } catch (error: any) {
                console.error('❌ [TurnInto] Image generation failed:', error);
                const aiMsgId = `ai_${Date.now()}`;
                setMessages(prev => [...prev, {
                    id: aiMsgId,
                    role: 'assistant' as const,
                    content: `🎨 **Image Generation Failed**\n\n${error.message || 'Please try again.'}`,
                    timestamp: new Date(),
                    taskType: 'image',
                }]);
                showToast('error', 'Image generation failed');
            } finally {
                setIsLoading(false);
                setCurrentStatus('idle');
            }
            return; // Don't go through handleSendMessage
        } else if (targetLower.includes('video')) {
            // DIRECT VIDEO GENERATION - same pattern as image generation above
            console.log('🎬 [TurnInto] Directly generating video from image:', sourceDescription.substring(0, 100));

            // Add user message first
            const userMsgId = `usr_${Date.now()}`;
            setMessages(prev => [...prev, {
                id: userMsgId,
                role: 'user' as const,
                content: `Turn this into a video`,
                timestamp: new Date(),
            }]);

            // Set loading
            setIsLoading(true);
            setCurrentStatus('generating');

            try {
                const { generateVideoForTier } = await import('../../lib/videoService');
                const videoTier = (userTier?.toUpperCase() === 'PREMIUM' ? 'PREMIUM' :
                    userTier?.toUpperCase() === 'PRO' ? 'PRO' :
                        userTier?.toUpperCase() === 'STARTER' ? 'PRO' : 'FREE') as 'FREE' | 'PRO' | 'PREMIUM';

                // Create a detailed prompt from the source image description
                const videoPrompt = `Create a cinematic video animation of: ${sourceDescription}. Style: smooth camera movements, high quality, visually stunning, 5-10 seconds.`;

                const videoResult = await generateVideoForTier(videoPrompt, videoTier);

                // Add the response with the video
                const aiMsgId = `ai_${Date.now()}`;
                setMessages(prev => [...prev, {
                    id: aiMsgId,
                    role: 'assistant' as const,
                    content: `🎬 **Video Generated!**\n\nYour video is ready!`,
                    timestamp: new Date(),
                    mediaUrl: videoResult.url,
                    mediaType: 'video',
                    taskType: 'video',
                }]);

                showToast('success', `✨ Video created!`);
            } catch (error: any) {
                console.error('❌ [TurnInto] Video generation failed:', error);
                const aiMsgId = `ai_${Date.now()}`;

                // Check if upgrade required
                const isUpgradeRequired = error.message?.includes('UPGRADE_REQUIRED');

                setMessages(prev => [...prev, {
                    id: aiMsgId,
                    role: 'assistant' as const,
                    content: isUpgradeRequired
                        ? `🎬 **Video Generation Requires Upgrade**\n\nVideo generation is available for Pro and Premium subscribers. Upgrade to unlock this feature!`
                        : `🎬 **Video Generation Failed**\n\n${error.message || 'Please try again.'}`,
                    timestamp: new Date(),
                    taskType: 'video',
                }]);
                showToast('error', isUpgradeRequired ? 'Upgrade required for video' : 'Video generation failed');
            } finally {
                setIsLoading(false);
                setCurrentStatus('idle');
            }
            return; // Don't go through handleSendMessage
        } else if (targetLower.includes('ppt') || targetLower.includes('presentation') || targetLower.includes('slides')) {
            transformPrompt = `Create a professional presentation based on:\n\n${sourceDescription}`;
        } else if (targetLower.includes('tweet') || targetLower.includes('post')) {
            transformPrompt = `Write a compelling ${targetType} about:\n\n${sourceDescription}`;
        } else if (targetLower.includes('blog') || targetLower.includes('article')) {
            transformPrompt = `Write a detailed ${targetType} based on:\n\n${sourceDescription}`;
        } else {
            transformPrompt = `Turn this into a ${targetType}:\n\n${sourceDescription}`;
        }

        console.log('🚀 [TurnInto] Sending transform request:', transformPrompt.substring(0, 100));
        handleSendMessage(transformPrompt);
    };

    // ===== ASSUMPTION EDITING =====

    const handleSaveAssumption = async (messageId: string, key: string, newValue: string) => {
        if (!currentProjectId) return;

        // Update message assumptions
        setMessages(prev => prev.map(msg =>
            msg.id === messageId
                ? {
                    ...msg,
                    assumptions: msg.assumptions?.map(a =>
                        a.key === key ? { ...a, value: newValue } : a
                    )
                }
                : msg
        ));

        // Update context
        await contextService.updateAssumption(currentProjectId, key, newValue);

        setEditingAssumption(null);
        setEditingValue('');
    };

    // ===== FILE ATTACHMENT HANDLERS =====

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newAttachments: typeof attachments = [];

        for (const file of Array.from(files)) {
            const fileType = getFileType(file);
            let preview: string | undefined;

            // Create preview for images
            if (fileType === 'image') {
                preview = await new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.readAsDataURL(file);
                });
            }

            newAttachments.push({ file, preview, type: fileType });
        }

        setAttachments(prev => [...prev, ...newAttachments]);
        setShowPlusMenu(false);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const getFileType = (file: File): 'image' | 'document' | 'audio' | 'video' => {
        const mimeType = file.type.toLowerCase();
        if (mimeType.startsWith('image/')) return 'image';
        if (mimeType.startsWith('audio/')) return 'audio';
        if (mimeType.startsWith('video/')) return 'video';
        return 'document';
    };

    const removeAttachment = (index: number) => {
        setAttachments(prev => prev.filter((_, i) => i !== index));
    };

    // Read file content for text-based files
    const readFileAsText = async (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    };

    // Encode image to base64 for vision models  
    const encodeImageToBase64 = async (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result as string;
                // Remove the data URL prefix (e.g., "data:image/png;base64,")
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    // Handle menu actions
    const handleImageGeneration = () => {
        setInputValue('[Image] ');
        setShowPlusMenu(false);
    };

    const handleDocumentGeneration = () => {
        setInputValue('[Document] ');
        setShowPlusMenu(false);
    };

    const handleWebSearch = () => {
        setInputValue('[Search] ');
        setShowPlusMenu(false);
    };

    const handleAttachFiles = () => {
        fileInputRef.current?.click();
        setShowPlusMenu(false);
    };

    // ===== ENHANCE PROMPT HANDLER =====

    const handleEnhancePrompt = async () => {
        if (!inputValue.trim() || isEnhancing) return;

        setIsEnhancing(true);
        try {
            const enhanced = await enhancePrompt(inputValue.trim());
            if (enhanced && enhanced !== inputValue.trim()) {
                setInputValue(enhanced);
                showToast('success', '✨ Prompt enhanced!');
            }
        } catch (error) {
            console.error('Failed to enhance prompt:', error);
            showToast('error', 'Failed to enhance prompt');
        } finally {
            setIsEnhancing(false);
        }
    };

    // ===== KEY HANDLERS =====

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // ===== RENDER =====

    return (
        <div className="flex-1 flex flex-col h-full relative">
            {/* Header */}
            <div className={`
                flex items-center justify-between gap-3 px-6 py-4 border-b
                ${isDark ? 'border-white/10 bg-[#0a0a0a]' : 'border-gray-100 bg-white'}
            `}>
                <div className="flex items-center gap-3">
                    <img
                        src="/assets/super-kroniq-rocket.png"
                        alt="Super KroniQ"
                        className="w-8 h-8 object-contain"
                    />
                    <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Super KroniQ
                    </span>
                </div>

                {/* Right side buttons */}
                <div className="flex items-center gap-1">
                    {/* Share Button */}
                    <button
                        onClick={() => setShowShareModal(true)}
                        className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-white/60' : 'hover:bg-gray-100 text-gray-500'
                            }`}
                        title="Share Chat"
                    >
                        <Share2 className="w-4 h-4" />
                    </button>

                    {/* Context Settings Button */}
                    <button
                        onClick={() => setShowChatSettings(true)}
                        className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-white/60' : 'hover:bg-gray-100 text-gray-500'
                            }`}
                        title="Chat Settings"
                    >
                        <Settings className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Status bar removed - status is now shown inline with loading message */}

            {/* Clarifying Questions are now shown as AI messages in chat, no separate modal */}

            {/* Messages Area */}
            <div className={`
                flex-1 overflow-y-auto px-6 py-6
                ${isDark ? 'bg-[#0a0a0a]' : 'bg-gradient-to-b from-teal-50/30 to-white'}
            `}>
                <div className="max-w-3xl mx-auto space-y-6">
                    {messages.map((message) => {
                        // Reserved for potential future feedback section
                        // const isLastAssistantMessage = ...

                        const modelIcon = getModelIcon(message.model);

                        return (
                            <div key={message.id}>
                                {message.role === 'user' ? (
                                    /* User Message */
                                    <div className="flex justify-end">
                                        <div className={`
                                            max-w-[80%] px-4 py-3 rounded-2xl rounded-br-md
                                            ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-900'}
                                        `}>
                                            {/* Attachments Preview */}
                                            {message.attachments && message.attachments.length > 0 && (
                                                <div className={`mb-2 ${message.attachments.length > 1 ? 'grid grid-cols-2 gap-2' : ''}`}>
                                                    {message.attachments.map((att, idx) => (
                                                        att.type === 'image' ? (
                                                            <div key={idx} className="rounded-lg overflow-hidden">
                                                                <img
                                                                    src={att.url}
                                                                    alt={att.name}
                                                                    className="max-h-48 w-full object-cover rounded-lg"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div
                                                                key={idx}
                                                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${isDark ? 'bg-white/5' : 'bg-gray-200'}`}
                                                            >
                                                                <span className="opacity-70">
                                                                    {att.type === 'document' ? '📄' : att.type === 'video' ? '🎬' : '🎵'}
                                                                </span>
                                                                <span className="truncate">{att.name}</span>
                                                            </div>
                                                        )
                                                    ))}
                                                </div>
                                            )}
                                            <p className="text-sm leading-relaxed">{message.content}</p>
                                        </div>
                                    </div>
                                ) : (
                                    /* Assistant Message */
                                    <div className="space-y-3 group">
                                        {/* Model Badge & Delete - Only show when actual model is determined (not during initial loading) */}
                                        {(!message.isLoading || (message.model && message.model !== 'Super KroniQ')) && (
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className={`
                                                    w-6 h-6 rounded-full flex items-center justify-center text-xs overflow-hidden
                                                    ${isDark ? 'bg-white/10' : 'bg-gray-100'}
                                                `}>
                                                        {modelIcon.logoUrl ? (
                                                            <img src={modelIcon.logoUrl} alt="" className="w-4 h-4 object-contain" />
                                                        ) : (
                                                            <span>{modelIcon.icon}</span>
                                                        )}
                                                    </div>
                                                    <span className={`text-xs font-medium ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                                                        {getModelDisplayName(message.model)}
                                                    </span>
                                                    {message.taskType && message.taskType !== 'chat' && (
                                                        <span className={`
                                                        px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1
                                                        ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}
                                                    `}>
                                                            {getTaskTypeIcon(message.taskType)}
                                                            {message.taskType.toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => setMessages(prev => prev.filter(m => m.id !== message.id))}
                                                    className={`
                                                    p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all
                                                    ${isDark ? 'hover:bg-white/10 text-white/40 hover:text-red-400' : 'hover:bg-gray-100 text-gray-400 hover:text-red-500'}
                                                `}
                                                    title="Remove from chat"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        )}

                                        {/* Content */}
                                        {message.isLoading ? (
                                            <div className="flex items-center gap-2 py-2">
                                                <svg
                                                    className={`w-4 h-4 animate-spin ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                >
                                                    <circle cx="11" cy="11" r="8" />
                                                    <path d="m21 21-4.35-4.35" />
                                                </svg>
                                                <span
                                                    className="text-sm font-medium bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent animate-pulse"
                                                    style={{ backgroundSize: '200% 100%' }}
                                                >
                                                    {STATUS_MESSAGES[currentStatus] || message.statusHistory?.slice(-1)[0] || 'Processing...'}
                                                </span>
                                            </div>
                                        ) : (
                                            <>
                                                {/* Media Content */}
                                                {message.mediaUrl && message.mediaType === 'image' && (
                                                    <div className="rounded-xl overflow-hidden max-w-md mb-4">
                                                        <img src={message.mediaUrl} alt="Generated" className="w-full" />
                                                        <div className="flex gap-2 mt-2">
                                                            <a
                                                                href={message.mediaUrl}
                                                                download
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isDark ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
                                                            >
                                                                <Download className="w-4 h-4" />
                                                                Download
                                                            </a>
                                                        </div>
                                                    </div>
                                                )}

                                                {message.mediaUrl && message.mediaType === 'video' && (
                                                    <div className="rounded-xl overflow-hidden max-w-md mb-4">
                                                        <video
                                                            src={message.mediaUrl}
                                                            controls
                                                            className="w-full rounded-lg"
                                                            preload="metadata"
                                                        />
                                                        <div className="flex gap-2 mt-2">
                                                            <a
                                                                href={message.mediaUrl}
                                                                download
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isDark ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-emerald-500 hover:bg-emerald-600 text-white'}`}
                                                            >
                                                                <Download className="w-4 h-4" />
                                                                Download Video
                                                            </a>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Audio Player for TTS */}
                                                {message.mediaUrl && message.mediaType === 'audio' && (
                                                    <div className={`rounded-xl p-4 mb-4 max-w-md ${isDark ? 'bg-gradient-to-br from-pink-500/20 to-rose-500/10 border border-pink-500/30' : 'bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200'}`}>
                                                        <audio
                                                            src={message.mediaUrl}
                                                            controls
                                                            className="w-full"
                                                        />
                                                        <div className="flex gap-2 mt-3">
                                                            <a
                                                                href={message.mediaUrl}
                                                                download="speech.mp3"
                                                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isDark ? 'bg-pink-600 hover:bg-pink-500 text-white' : 'bg-pink-500 hover:bg-pink-600 text-white'}`}
                                                            >
                                                                <Download className="w-4 h-4" />
                                                                Download Audio
                                                            </a>
                                                        </div>
                                                    </div>
                                                )}

                                                {message.mediaUrl && message.mediaType === 'ppt' && (
                                                    message.pptStructure ? (
                                                        <div className="mb-4 max-w-lg">
                                                            <PPTPreview
                                                                structure={message.pptStructure}
                                                                downloadUrl={message.mediaUrl}
                                                                fileName={message.pptFileName || 'presentation.pptx'}
                                                                isDark={isDark}
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className={`rounded-xl p-4 mb-4 max-w-md ${isDark ? 'bg-gradient-to-br from-orange-500/20 to-red-500/10 border border-orange-500/30' : 'bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200'}`}>
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <div className={`p-2 rounded-lg ${isDark ? 'bg-orange-500/30' : 'bg-orange-100'}`}>
                                                                    <FileText className="w-6 h-6 text-orange-500" />
                                                                </div>
                                                                <div>
                                                                    <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>PowerPoint Presentation</div>
                                                                    <div className={`text-sm ${isDark ? 'text-white/60' : 'text-gray-500'}`}>Ready to download</div>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <a
                                                                    href={message.mediaUrl}
                                                                    download
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white transition-colors"
                                                                >
                                                                    <Download className="w-4 h-4" />
                                                                    Download PPTX
                                                                </a>
                                                            </div>
                                                        </div>
                                                    )
                                                )}

                                                {/* Text Content */}
                                                <div className="max-w-none">
                                                    <MarkdownRenderer content={message.content} isDark={isDark} />
                                                </div>

                                                {/* Action Buttons - Icons only with tooltips */}
                                                <div className="flex items-center gap-1 pt-2">
                                                    {/* Copy */}
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await navigator.clipboard.writeText(message.content);
                                                                showToast('success', 'Copied to clipboard!');
                                                            } catch (err) {
                                                                showToast('error', 'Failed to copy');
                                                            }
                                                        }}
                                                        className={`
                                                            group/btn relative p-2 rounded-lg transition-all duration-200
                                                            ${isDark ? 'text-white/50 hover:bg-white/10 hover:text-white' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'}
                                                        `}
                                                    >
                                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                                        </svg>
                                                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                                            Copy
                                                        </span>
                                                    </button>

                                                    {/* Thumbs Up */}
                                                    <button
                                                        onClick={() => {
                                                            setMessages(prev => prev.map(m =>
                                                                m.id === message.id
                                                                    ? { ...m, feedback: m.feedback === 'liked' ? undefined : 'liked' }
                                                                    : m
                                                            ));
                                                            showToast('success', message.feedback === 'liked' ? 'Feedback removed' : 'Thanks for the feedback! 👍');
                                                        }}
                                                        className={`
                                                            group/btn relative p-2 rounded-lg transition-all duration-200
                                                            ${message.feedback === 'liked'
                                                                ? 'bg-emerald-500/20 text-emerald-500'
                                                                : isDark ? 'text-white/50 hover:bg-white/10 hover:text-white' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'}
                                                        `}
                                                    >
                                                        <ThumbsUp className="w-4 h-4" />
                                                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                                            Good
                                                        </span>
                                                    </button>

                                                    {/* Thumbs Down */}
                                                    <button
                                                        onClick={() => {
                                                            setMessages(prev => prev.map(m =>
                                                                m.id === message.id
                                                                    ? { ...m, feedback: m.feedback === 'disliked' ? undefined : 'disliked' }
                                                                    : m
                                                            ));
                                                            showToast('info', message.feedback === 'disliked' ? 'Feedback removed' : 'Thanks for the feedback');
                                                        }}
                                                        className={`
                                                            group/btn relative p-2 rounded-lg transition-all duration-200
                                                            ${message.feedback === 'disliked'
                                                                ? 'bg-red-500/20 text-red-500'
                                                                : isDark ? 'text-white/50 hover:bg-white/10 hover:text-white' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'}
                                                        `}
                                                    >
                                                        <ThumbsDown className="w-4 h-4" />
                                                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                                            Bad
                                                        </span>
                                                    </button>

                                                    {/* Shorter */}
                                                    <button
                                                        onClick={() => handleMakeShorterLonger(message.id, 'shorter')}
                                                        disabled={modifyingMessageId === message.id}
                                                        className={`
                                                            group/btn relative p-2 rounded-lg transition-all duration-200
                                                            ${isDark ? 'text-white/50 hover:bg-white/10 hover:text-white' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'}
                                                            ${modifyingMessageId === message.id ? 'opacity-50 cursor-not-allowed' : ''}
                                                        `}
                                                    >
                                                        <Minus className="w-4 h-4" />
                                                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                                            Shorter
                                                        </span>
                                                    </button>

                                                    {/* Longer */}
                                                    <button
                                                        onClick={() => handleMakeShorterLonger(message.id, 'longer')}
                                                        disabled={modifyingMessageId === message.id}
                                                        className={`
                                                            group/btn relative p-2 rounded-lg transition-all duration-200
                                                            ${isDark ? 'text-white/50 hover:bg-white/10 hover:text-white' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'}
                                                            ${modifyingMessageId === message.id ? 'opacity-50 cursor-not-allowed' : ''}
                                                        `}
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                                            Longer
                                                        </span>
                                                    </button>

                                                    {/* Regenerate/Retry */}
                                                    <button
                                                        onClick={() => handleRegenerate(message.id)}
                                                        disabled={isLoading}
                                                        className={`
                                                            group/btn relative p-2 rounded-lg transition-all duration-200
                                                            ${isDark ? 'text-white/50 hover:bg-white/10 hover:text-white' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'}
                                                            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                                                        `}
                                                    >
                                                        <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                                                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                                            Regenerate
                                                        </span>
                                                    </button>

                                                    {/* More Options - Turn into */}
                                                    <div className="relative">
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowConvertMenu(showConvertMenu === message.id ? null : message.id)}
                                                            className={`
                                                                group/btn relative p-2 rounded-lg transition-all duration-200
                                                                ${isDark ? 'text-white/50 hover:bg-white/10 hover:text-white' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'}
                                                            `}
                                                        >
                                                            <Sparkles className="w-4 h-4" />
                                                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                                                Turn into...
                                                            </span>
                                                        </button>

                                                        {showConvertMenu === message.id && (
                                                            <>
                                                                <div className="fixed inset-0 z-40" onClick={() => setShowConvertMenu(null)} />
                                                                <div className={`
                                                                    absolute bottom-full left-0 mb-1 py-1 rounded-lg border shadow-xl z-50 min-w-[140px]
                                                                    ${isDark ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-gray-200'}
                                                                `}>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => { setShowConvertMenu(null); setShowTurnIntoInput(message.id); setTurnIntoValue(''); }}
                                                                        className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 ${isDark ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-50 text-gray-700'}`}
                                                                    >
                                                                        <Sparkles className="w-4 h-4" />
                                                                        Transform content...
                                                                    </button>
                                                                </div>
                                                            </>
                                                        )}

                                                        {/* Premium Turn Into Input Popup */}
                                                        {showTurnIntoInput === message.id && (
                                                            <>
                                                                <div className="fixed inset-0 z-40" onClick={() => setShowTurnIntoInput(null)} />
                                                                <div className={`
                                                                    absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50
                                                                    w-72 p-4 rounded-2xl overflow-hidden
                                                                    backdrop-blur-2xl shadow-2xl border
                                                                    animate-in fade-in zoom-in-95 duration-200
                                                                    ${isDark
                                                                        ? 'bg-gradient-to-br from-[#1a1a1a]/95 via-[#1f1f1f]/95 to-[#252525]/95 border-white/20 shadow-[0_25px_50px_rgba(0,0,0,0.5)]'
                                                                        : 'bg-gradient-to-br from-white/95 via-white/90 to-gray-50/90 border-gray-200/50 shadow-2xl'}
                                                                `}>
                                                                    {/* Glowing accent line */}
                                                                    <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

                                                                    {/* Header */}
                                                                    <div className="flex items-center gap-2 mb-3">
                                                                        <div className={`
                                                                            w-7 h-7 rounded-lg flex items-center justify-center
                                                                            bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30
                                                                        `}>
                                                                            <Sparkles className="w-3.5 h-3.5" />
                                                                        </div>
                                                                        <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                                                            Turn into anything
                                                                        </span>
                                                                    </div>

                                                                    {/* Input Field */}
                                                                    <div className={`
                                                                        flex items-center gap-2 px-3 py-2.5 rounded-xl border transition-all duration-300
                                                                        ${isDark
                                                                            ? 'bg-white/5 border-white/20 focus-within:border-emerald-500/50 focus-within:bg-white/10'
                                                                            : 'bg-white border-gray-200 focus-within:border-emerald-400 shadow-sm'}
                                                                    `}>
                                                                        <input
                                                                            type="text"
                                                                            value={turnIntoValue}
                                                                            onChange={(e) => setTurnIntoValue(e.target.value)}
                                                                            onKeyDown={(e) => {
                                                                                if (e.key === 'Enter' && turnIntoValue.trim()) {
                                                                                    handleTurnInto(message.id, turnIntoValue.trim());
                                                                                }
                                                                            }}
                                                                            placeholder="e.g. logo, infographic, blog post..."
                                                                            autoFocus
                                                                            className={`
                                                                                flex-1 bg-transparent border-none outline-none text-sm
                                                                                ${isDark ? 'text-white placeholder-white/40' : 'text-gray-900 placeholder-gray-400'}
                                                                            `}
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                if (turnIntoValue.trim()) {
                                                                                    handleTurnInto(message.id, turnIntoValue.trim());
                                                                                }
                                                                            }}
                                                                            disabled={!turnIntoValue.trim()}
                                                                            className={`
                                                                                p-1.5 rounded-lg transition-all duration-200
                                                                                ${turnIntoValue.trim()
                                                                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:scale-105'
                                                                                    : isDark ? 'bg-white/10 text-white/30' : 'bg-gray-100 text-gray-400'}
                                                                            `}
                                                                        >
                                                                            <Send className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </div>

                                                                    {/* Quick Suggestions */}
                                                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                                                        {['Image', 'Logo', 'PPT', 'Video', 'Tweet', 'Blog'].map((suggestion) => (
                                                                            <button
                                                                                key={suggestion}
                                                                                type="button"
                                                                                onClick={() => setTurnIntoValue(suggestion)}
                                                                                className={`
                                                                                    px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200
                                                                                    ${isDark
                                                                                        ? 'bg-white/10 text-white/70 hover:bg-emerald-500/20 hover:text-emerald-400'
                                                                                        : 'bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-700'}
                                                                                `}
                                                                            >
                                                                                {suggestion}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Premium Glassmorphic Assumptions Panel */}
                                                {message.assumptions && message.assumptions.length > 0 && (
                                                    <div
                                                        className={`
                                                            group/assumptions mt-4 rounded-2xl overflow-hidden transition-all duration-500 relative
                                                            ${isDark
                                                                ? 'bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-transparent backdrop-blur-xl'
                                                                : 'bg-gradient-to-br from-white/80 via-white/60 to-white/40 backdrop-blur-xl shadow-lg'}
                                                            ${isDark ? 'border border-white/10' : 'border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.08)]'}
                                                            hover:scale-[1.01] hover:shadow-2xl
                                                        `}
                                                        style={{
                                                            boxShadow: isDark
                                                                ? '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.08)'
                                                                : '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)'
                                                        }}
                                                    >
                                                        {/* Glowing border effect */}
                                                        <div className={`
                                                            absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-hover/assumptions:opacity-100 transition-opacity duration-500
                                                            ${isDark
                                                                ? 'shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]'
                                                                : 'shadow-[inset_0_0_20px_rgba(16,185,129,0.05)]'}
                                                        `} />

                                                        {/* Header Button */}
                                                        <button
                                                            onClick={() => setExpandedAssumptions(
                                                                expandedAssumptions === message.id ? null : message.id
                                                            )}
                                                            className={`
                                                                w-full px-4 py-3 text-left flex items-center justify-between
                                                                transition-all duration-300 relative z-10
                                                                ${isDark
                                                                    ? 'text-white/80 hover:text-white hover:bg-white/5'
                                                                    : 'text-gray-700 hover:text-gray-900 hover:bg-white/50'}
                                                            `}
                                                        >
                                                            <span className="flex items-center gap-2.5">
                                                                <div className={`
                                                                    w-6 h-6 rounded-lg flex items-center justify-center
                                                                    ${isDark
                                                                        ? 'bg-gradient-to-br from-emerald-500/30 to-teal-500/20'
                                                                        : 'bg-gradient-to-br from-emerald-100 to-teal-50'}
                                                                    transition-transform duration-300 group-hover/assumptions:scale-110
                                                                `}>
                                                                    <Lightbulb className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                                                </div>
                                                                <span className="text-sm font-medium">
                                                                    Assumptions made ({message.assumptions.length})
                                                                </span>
                                                            </span>
                                                            <div className={`
                                                                w-6 h-6 rounded-full flex items-center justify-center
                                                                transition-all duration-300
                                                                ${expandedAssumptions === message.id ? 'rotate-180' : ''}
                                                                ${isDark ? 'bg-white/5' : 'bg-gray-100'}
                                                            `}>
                                                                <ChevronDown className="w-3.5 h-3.5" />
                                                            </div>
                                                        </button>

                                                        {/* Expandable Content with Animation */}
                                                        <div className={`
                                                            overflow-hidden transition-all duration-500 ease-out
                                                            ${expandedAssumptions === message.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                                                        `}>
                                                            <div className="px-4 pb-4 space-y-2">
                                                                {message.assumptions.map((assumption, idx) => (
                                                                    <div
                                                                        key={assumption.key}
                                                                        className={`
                                                                            group/item flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl
                                                                            transition-all duration-200 cursor-default
                                                                            ${isDark
                                                                                ? 'bg-white/[0.03] hover:bg-white/[0.08] border border-white/5'
                                                                                : 'bg-white/60 hover:bg-white/80 border border-white/50 shadow-sm hover:shadow'}
                                                                        `}
                                                                        style={{
                                                                            animationDelay: `${idx * 50}ms`,
                                                                            animation: expandedAssumptions === message.id ? 'slideInUp 0.3s ease-out forwards' : 'none'
                                                                        }}
                                                                    >
                                                                        <span className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                                                                            {assumption.key.replace(/_/g, ' ')}:
                                                                        </span>

                                                                        {editingAssumption?.messageId === message.id && editingAssumption?.key === assumption.key ? (
                                                                            <div className="flex items-center gap-2 flex-1">
                                                                                <input
                                                                                    value={editingValue}
                                                                                    onChange={e => setEditingValue(e.target.value)}
                                                                                    className={`
                                                                                        flex-1 px-3 py-1.5 text-xs rounded-lg border transition-all
                                                                                        ${isDark
                                                                                            ? 'bg-white/10 border-emerald-500/50 text-white focus:border-emerald-400'
                                                                                            : 'bg-white border-emerald-300 text-gray-900 focus:border-emerald-500'}
                                                                                        outline-none focus:ring-2 focus:ring-emerald-500/20
                                                                                    `}
                                                                                    autoFocus
                                                                                />
                                                                                <button
                                                                                    onClick={() => handleSaveAssumption(message.id, assumption.key, editingValue)}
                                                                                    className={`
                                                                                        p-1.5 rounded-lg transition-all duration-200
                                                                                        bg-gradient-to-r from-emerald-500 to-teal-500 text-white
                                                                                        hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-105
                                                                                    `}
                                                                                >
                                                                                    <Check className="w-3 h-3" />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => setEditingAssumption(null)}
                                                                                    className={`
                                                                                        p-1.5 rounded-lg transition-all duration-200
                                                                                        ${isDark ? 'bg-white/10 hover:bg-red-500/20 text-white/60 hover:text-red-400' : 'bg-gray-100 hover:bg-red-50 text-gray-500 hover:text-red-500'}
                                                                                    `}
                                                                                >
                                                                                    <X className="w-3 h-3" />
                                                                                </button>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="flex items-center gap-2">
                                                                                <span className={`
                                                                                    text-xs font-medium px-2.5 py-1 rounded-lg
                                                                                    ${isDark
                                                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                                                        : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}
                                                                                `}>
                                                                                    {assumption.value}
                                                                                </span>
                                                                                {assumption.editable && (
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            setEditingAssumption({ messageId: message.id, key: assumption.key });
                                                                                            setEditingValue(assumption.value);
                                                                                        }}
                                                                                        className={`
                                                                                            p-1.5 rounded-lg opacity-0 group-hover/item:opacity-100 
                                                                                            transition-all duration-200
                                                                                            ${isDark
                                                                                                ? 'hover:bg-white/10 text-white/40 hover:text-white'
                                                                                                : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'}
                                                                                        `}
                                                                                    >
                                                                                        <Pencil className="w-3 h-3" />
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Feedback now integrated into icon buttons above - removed separate section */}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area - Compact premium design */}
            <div className={`
                border-t px-3 sm:px-4 py-3 pb-4 mb-2 safe-area-bottom
                ${isDark ? 'border-white/10 bg-[#0a0a0a]' : 'border-gray-100 bg-white'}
            `}>
                <div className="mx-auto" style={{ maxWidth: 'min(768px, calc(100% - 8px))' }}>
                    {/* Input Box with integrated plus menu */}
                    <div className={`
                        relative flex items-end gap-2 min-h-12 py-2 px-3 rounded-xl border transition-all duration-300
                        ${isDark
                            ? 'bg-white/5 border-white/20 focus-within:border-emerald-500/50'
                            : 'bg-white border-gray-200 focus-within:border-teal-400 shadow-sm'}
                    `}>
                        {/* Plus Button with Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setShowPlusMenu(!showPlusMenu)}
                                className={`
                                    w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
                                    ${showPlusMenu
                                        ? 'bg-emerald-500/20 text-emerald-500'
                                        : isDark ? 'text-white/50 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}
                                `}
                            >
                                <Plus className={`w-5 h-5 transition-transform duration-200 ${showPlusMenu ? 'rotate-45' : ''}`} />
                            </button>

                            {/* Premium Dropdown Menu */}
                            {showPlusMenu && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowPlusMenu(false)} />
                                    <div
                                        className={`
                                            absolute bottom-full left-0 mb-3 z-50
                                            w-48 sm:w-52 rounded-2xl overflow-hidden
                                            backdrop-blur-2xl border
                                            animate-in slide-in-from-bottom-3 duration-300
                                            ${isDark
                                                ? 'bg-gradient-to-br from-white/10 via-white/5 to-transparent border-white/20'
                                                : 'bg-gradient-to-br from-white/90 via-white/80 to-white/70 border-white/50'}
                                        `}
                                        style={{
                                            boxShadow: isDark
                                                ? '0 20px 60px rgba(0,0,0,0.5), 0 8px 25px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.1), 0 0 40px rgba(16,185,129,0.1)'
                                                : '0 20px 60px rgba(0,0,0,0.15), 0 8px 25px rgba(0,0,0,0.1), inset 0 1px 2px rgba(255,255,255,0.8)',
                                            transform: 'perspective(1000px) rotateX(2deg)',
                                            transformOrigin: 'bottom center'
                                        }}
                                    >
                                        {/* Attach Files */}
                                        <button
                                            onClick={handleAttachFiles}
                                            className={`
                                            w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-all
                                            ${isDark ? 'text-white/80 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'}
                                        `}>
                                            <img src="/icons/attach-files-icon.png" alt="" className="w-4 h-4 object-contain" style={{ filter: isDark ? 'invert(1)' : 'none' }} />
                                            Attach Files
                                        </button>

                                        {/* Divider */}
                                        <div className={`mx-3 my-1 h-px ${isDark ? 'bg-white/10' : 'bg-gray-100'}`} />

                                        {/* Fast Mode */}
                                        <button
                                            onClick={() => { setInputMode('fast'); setShowPlusMenu(false); }}
                                            className={`
                                                w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-all
                                                ${inputMode === 'fast'
                                                    ? isDark ? 'text-emerald-400 bg-emerald-500/10' : 'text-emerald-600 bg-emerald-50'
                                                    : isDark ? 'text-white/80 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'}
                                            `}
                                        >
                                            <img src="/icons/fast-icon.png" alt="" className="w-4 h-4 object-contain" style={{ filter: isDark ? 'invert(1)' : 'none' }} />
                                            Fast
                                            {inputMode === 'fast' && <Check className="w-3.5 h-3.5 ml-auto" />}
                                        </button>

                                        {/* Search Mode */}
                                        <button
                                            onClick={() => { setInputMode('search'); setShowPlusMenu(false); }}
                                            className={`
                                                w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-all
                                                ${inputMode === 'search'
                                                    ? isDark ? 'text-blue-400 bg-blue-500/10' : 'text-blue-600 bg-blue-50'
                                                    : isDark ? 'text-white/80 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'}
                                            `}
                                        >
                                            <img src="/icons/websearch-icon.png" alt="" className="w-4 h-4 object-contain" style={{ filter: isDark ? 'invert(1)' : 'none' }} />
                                            Web Search
                                            {inputMode === 'search' && <Check className="w-3.5 h-3.5 ml-auto" />}
                                        </button>

                                        {/* Research Mode */}
                                        <button
                                            onClick={() => { setInputMode('research'); setShowPlusMenu(false); }}
                                            className={`
                                                w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-all
                                                ${inputMode === 'research'
                                                    ? isDark ? 'text-purple-400 bg-purple-500/10' : 'text-purple-600 bg-purple-50'
                                                    : isDark ? 'text-white/80 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'}
                                            `}
                                        >
                                            <img src="/icons/research-icon.png" alt="" className="w-4 h-4 object-contain" style={{ filter: isDark ? 'invert(1)' : 'none' }} />
                                            Research
                                            {inputMode === 'research' && <Check className="w-3.5 h-3.5 ml-auto" />}
                                        </button>

                                        {/* Think Longer Mode */}
                                        <button
                                            onClick={() => { setInputMode('think'); setShowPlusMenu(false); }}
                                            className={`
                                                w-full px-4 py-2.5 text-left text-sm flex items-center gap-3 transition-all
                                                ${inputMode === 'think'
                                                    ? isDark ? 'text-amber-400 bg-amber-500/10' : 'text-amber-600 bg-amber-50'
                                                    : isDark ? 'text-white/80 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'}
                                            `}
                                        >
                                            <img src="/icons/think-icon.png" alt="" className="w-4 h-4 object-contain" style={{ filter: isDark ? 'invert(1)' : 'none' }} />
                                            Think Longer
                                            {inputMode === 'think' && <Check className="w-3.5 h-3.5 ml-auto" />}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Hidden File Input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*,.pdf,.doc,.docx,.txt,.md,.csv,.json,.xlsx,.xls,audio/*,video/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        {/* Attachment Preview */}
                        {attachments.length > 0 && (
                            <div className="flex items-center gap-2 mr-2">
                                {attachments.map((attachment, index) => (
                                    <div
                                        key={index}
                                        className={`
                                            relative group flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs
                                            ${isDark ? 'bg-white/10 text-white/80' : 'bg-gray-100 text-gray-700'}
                                        `}
                                    >
                                        {attachment.type === 'image' && attachment.preview ? (
                                            <img src={attachment.preview} alt="" className="w-6 h-6 rounded object-cover" />
                                        ) : (
                                            <FileText className="w-4 h-4" />
                                        )}
                                        <span className="max-w-[80px] truncate">{attachment.file.name}</span>
                                        <button
                                            onClick={() => removeAttachment(index)}
                                            className={`
                                                ml-1 p-0.5 rounded-full opacity-60 hover:opacity-100 transition-opacity
                                                ${isDark ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-50 text-red-500'}
                                            `}
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <textarea
                            ref={(el) => {
                                // Auto-expand logic
                                if (el) {
                                    el.style.height = 'auto';
                                    el.style.height = Math.min(el.scrollHeight, 150) + 'px';
                                }
                            }}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Ask me anything... (Shift+Enter for new line)"
                            disabled={isLoading || clarifyingQuestions.length > 0}
                            rows={1}
                            className={`
                                flex-1 bg-transparent border-none outline-none text-sm resize-none overflow-y-auto
                                ${isDark ? 'text-white placeholder-white/40' : 'text-gray-900 placeholder-gray-400'}
                                ${isLoading ? 'opacity-50' : ''}
                            `}
                            style={{ maxHeight: '150px', minHeight: '24px' }}
                        />

                        {/* Enhance Prompt button - Magic Wand */}
                        <button
                            onClick={handleEnhancePrompt}
                            disabled={!inputValue.trim() || isEnhancing || isLoading}
                            title="Enhance prompt with AI"
                            className={`
                                w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200
                                ${!inputValue.trim() || isEnhancing || isLoading
                                    ? 'opacity-40 cursor-not-allowed'
                                    : isDark
                                        ? 'hover:bg-purple-500/20 cursor-pointer'
                                        : 'hover:bg-purple-50 cursor-pointer'}
                            `}
                        >
                            {isEnhancing ? (
                                <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <svg
                                    className="w-4 h-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    style={{
                                        color: '#a855f7',
                                        filter: 'drop-shadow(0 0 4px rgba(168, 85, 247, 0.4))'
                                    }}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 4l-1 1m0 0l-7 7m7-7l1-1m-8 8l-2.5 2.5a1.5 1.5 0 102.121 2.121L7 18m0 0l7-7"
                                    />
                                    <path strokeWidth={2} d="M17 3l.5 1 1 .5-1 .5-.5 1-.5-1-1-.5 1-.5.5-1z" />
                                    <path strokeWidth={2} d="M21 7l.3.7.7.3-.7.3-.3.7-.3-.7-.7-.3.7-.3.3-.7z" />
                                </svg>
                            )}
                        </button>

                        {isLoading ? (
                            <button
                                onClick={handleStopGeneration}
                                title="Stop generation"
                                className={`
                                    w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300
                                    bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/30 hover:scale-105
                                `}
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <rect x="6" y="6" width="12" height="12" rx="2" />
                                </svg>
                            </button>
                        ) : (
                            <button
                                onClick={() => handleSendMessage()}
                                disabled={!inputValue.trim()}
                                className={`
                                    w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300
                                    ${inputValue.trim()
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:scale-105'
                                        : isDark ? 'bg-white/10 text-white/40' : 'bg-gray-100 text-gray-400'}
                                `}
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Selected Mode Indicator - Only shows when a mode is selected */}
                    {inputMode !== 'normal' && (
                        <div className="flex justify-center mt-3">
                            <button
                                onClick={() => setInputMode('normal')}
                                className={`
                                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border
                                ${inputMode === 'search' ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : ''}
                                ${inputMode === 'research' ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' : ''}
                                ${inputMode === 'image' ? 'bg-pink-500/20 border-pink-500/50 text-pink-400' : ''}
                                ${inputMode === 'fast' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : ''}
                                ${inputMode === 'think' ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : ''}
                            `}
                            >
                                {inputMode === 'search' && <><img src="/icons/websearch-icon.png" alt="" className="w-4 h-4 invert" /> Web Search mode</>}
                                {inputMode === 'research' && <><img src="/icons/research-icon.png" alt="" className="w-4 h-4 invert" /> Research mode</>}
                                {inputMode === 'image' && <><ImageIcon className="w-4 h-4" /> Create image</>}
                                {inputMode === 'fast' && <><Zap className="w-4 h-4" /> Fast mode</>}
                                {inputMode === 'think' && <><img src="/icons/think-icon.png" alt="" className="w-4 h-4 invert" /> Think Longer mode</>}
                                <X className="w-3.5 h-3.5 ml-1 opacity-60 hover:opacity-100" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Pricing Modal */}
            {showPricingModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className={`
                        max-w-md w-full mx-4 p-6 rounded-2xl
                        ${isDark ? 'bg-[#1a1a1a] border border-white/10' : 'bg-white'}
                    `}>
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                                <Zap className="w-8 h-8 text-white" />
                            </div>
                            <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Upgrade to Premium
                            </h2>
                            <p className={`text-sm mb-6 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                                {pricingReason}
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowPricingModal(false)}
                                    className={`flex-1 px-4 py-2 rounded-lg font-medium ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    Maybe Later
                                </button>
                                <button
                                    onClick={() => {
                                        setShowPricingModal(false);
                                        window.location.href = '/pricing';
                                    }}
                                    className="flex-1 px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg"
                                >
                                    View Plans
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Chat Settings Modal */}
            {showChatSettings && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className={`
                        max-w-md w-full mx-4 p-6 rounded-2xl
                        ${isDark ? 'bg-[#1a1a1a] border border-white/10' : 'bg-white'}
                    `}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                                    <Settings className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        Chat Settings
                                    </h2>
                                    <p className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                                        Customize this conversation
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowChatSettings(false)}
                                className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10 text-white/60' : 'hover:bg-gray-100 text-gray-500'}`}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Context & Memory */}
                        <div className="mb-5">
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                                Context & Memory
                            </label>
                            <textarea
                                value={chatSettings.contextMemory}
                                onChange={(e) => setChatSettings(prev => ({ ...prev, contextMemory: e.target.value }))}
                                placeholder="e.g., I am a software developer working on a React project..."
                                className={`w-full px-3 py-2 rounded-xl border text-sm resize-none h-20
                                    ${isDark
                                        ? 'bg-white/5 border-white/10 text-white placeholder:text-white/40'
                                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
                            />
                            <p className={`text-xs mt-1.5 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                                This will be used as context in every message
                            </p>
                        </div>

                        {/* Response Style */}
                        <div className="mb-5">
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                                AI Response Style
                            </label>
                            <select
                                value={chatSettings.responseStyle}
                                onChange={(e) => setChatSettings(prev => ({ ...prev, responseStyle: e.target.value as any }))}
                                className={`w-full px-3 py-2 rounded-xl border text-sm
                                    ${isDark
                                        ? 'bg-white/5 border-white/10 text-white'
                                        : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                            >
                                <option value="concise">⚡ Concise - Short and direct</option>
                                <option value="balanced">⚖️ Balanced - Thorough but focused</option>
                                <option value="detailed">📚 Detailed - Comprehensive explanations</option>
                            </select>
                        </div>

                        {/* Conversation Pattern */}
                        <div className="mb-6">
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                                Future Conversation Style
                            </label>
                            <textarea
                                value={chatSettings.conversationPattern}
                                onChange={(e) => setChatSettings(prev => ({ ...prev, conversationPattern: e.target.value }))}
                                placeholder="e.g., Always use bullet points, be formal, include code examples..."
                                className={`w-full px-3 py-2 rounded-xl border text-sm resize-none h-16
                                    ${isDark
                                        ? 'bg-white/5 border-white/10 text-white placeholder:text-white/40'
                                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'}`}
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowChatSettings(false)}
                                className={`flex-1 px-4 py-2 rounded-xl font-medium text-sm
                                    ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setShowChatSettings(false)}
                                className="flex-1 px-4 py-2 rounded-xl font-medium text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg"
                            >
                                Save Settings
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className={`
                        max-w-md w-full mx-4 p-6 rounded-2xl
                        ${isDark ? 'bg-[#1a1a1a] border border-white/10' : 'bg-white'}
                    `}>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
                                    <Share2 className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        Share Chat
                                    </h2>
                                    <p className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                                        Share this conversation
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowShareModal(false)}
                                className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10 text-white/60' : 'hover:bg-gray-100 text-gray-500'}`}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Share Link */}
                        <div className="mb-5">
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                                Share Link
                            </label>
                            <div className="flex gap-2">
                                <input
                                    readOnly
                                    value={`${window.location.origin}/chat/${currentProjectId || 'new'}`}
                                    className={`flex-1 px-3 py-2 rounded-xl border text-sm
                                        ${isDark
                                            ? 'bg-white/5 border-white/10 text-white'
                                            : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                                />
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${window.location.origin}/chat/${currentProjectId || 'new'}`);
                                        showToast('success', 'Link copied!');
                                    }}
                                    className="px-4 py-2 rounded-xl font-medium text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowShareModal(false)}
                                className={`flex-1 px-4 py-2 rounded-xl font-medium text-sm
                                    ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperKroniqChat;
