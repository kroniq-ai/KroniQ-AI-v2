/**
 * AppShell - Main application layout shell
 * Premium design with Multi-Chat model comparison and Super KroniQ modes
 */

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { useToast } from '../../contexts/ToastContext';
import { useStudioMode } from '../../contexts/StudioModeContext';
import { SettingsView } from '../Settings/SettingsView';
import { ProfilePage } from '../Profile/ProfilePage';
import { BusinessPanel } from '../Business/BusinessPanel';
import { SuperKroniqChat } from '../Chat/SuperKroniqChat';
import { SocialKroniq } from '../Social/SocialKroniq';
import {
    Search,
    ChevronDown, Sun, Moon, X, Menu, PanelLeftClose, PanelLeft,
    Check, Plus,
    Compass, Rocket, Lock,
    GripVertical, Sparkles, Share2 as Share2Icon,
    Coins
} from 'lucide-react';
import { enhancePrompt } from '../../lib/geminiOrchestrator';
import { PricingPopup } from '../Modals/PricingPopup';
import { OnboardingModal } from '../Modals/OnboardingModal';

// Premium animations CSS - Enhanced for high-level design
const animationStyles = `
  @keyframes glow-pulse {
    0%, 100% { opacity: 0.7; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.02); }
  }
  
  @keyframes fade-in-up {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes gradient-shift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }
  
  @keyframes border-glow-pulse {
    0%, 100% { opacity: 0.6; }
    50% { opacity: 1; }
  }
  
  @keyframes sparkle {
    0%, 100% { transform: scale(1) rotate(0deg); }
    25% { transform: scale(1.15) rotate(5deg); }
    75% { transform: scale(1.05) rotate(-5deg); }
  }
  
  @keyframes rotate-gradient {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  
  @keyframes pulse-ring {
    0% { transform: scale(0.95); opacity: 1; }
    50% { transform: scale(1); opacity: 0.8; }
    100% { transform: scale(0.95); opacity: 1; }
  }
  
  @keyframes input-focus-glow {
    0%, 100% { box-shadow: none; }
    50% { box-shadow: none; }
  }
  
  @keyframes rainbow-border {
    0% { border-color: rgba(16, 185, 129, 0.6); }
    25% { border-color: rgba(52, 211, 153, 0.6); }
    50% { border-color: rgba(110, 231, 183, 0.6); }
    75% { border-color: rgba(52, 211, 153, 0.6); }
    100% { border-color: rgba(16, 185, 129, 0.6); }
  }
  
  @keyframes send-pulse {
    0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(16, 185, 129, 0.4); }
    50% { transform: scale(1.05); box-shadow: 0 0 30px rgba(16, 185, 129, 0.6); }
  }
  
  @keyframes pulse-glow {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.8; }
  }
  
  .animate-glow-pulse { animation: glow-pulse 3s ease-in-out infinite; }
  .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
  .animate-gradient { animation: gradient-shift 3s ease infinite; background-size: 200% 200%; }
  .animate-border-glow { animation: border-glow-pulse 2s ease-in-out infinite; }
  .animate-sparkle { animation: sparkle 3s ease-in-out infinite; }
  .animate-rotate { animation: rotate-gradient 8s linear infinite; }
  .animate-shimmer { animation: shimmer 3s linear infinite; background-size: 200% 100%; }
  .animate-pulse-ring { animation: pulse-ring 2s ease-in-out infinite; }
  .animate-rainbow-border { animation: rainbow-border 4s ease-in-out infinite; }
  .animate-send-pulse { animation: send-pulse 2s ease-in-out infinite; }
  
  input { caret-color: #10b981; }
  input::selection { background: rgba(16, 185, 129, 0.3); }
  input:focus { outline: none; }
  
  .premium-input-glow:focus-within {
    animation: input-focus-glow 2s ease-in-out infinite;
  }
`;

// Clean background - no grid
const GridBackground: React.FC<{ isDark: boolean }> = ({ isDark }) => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Base background color only - no grid */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundColor: isDark ? '#0a0a0a' : '#f9fafb',
                }}
            />
        </div>
    );
};

// Layers icon for Projects
const LayersIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
    </svg>
);

// Settings cog icon
const SettingsIcon: React.FC<{ className?: string }> = ({ className = "w-3.5 h-3.5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);

// 3-dot menu icon
const MoreVertIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="5" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="12" cy="19" r="2" />
    </svg>
);

// Edit icon
const EditIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

// Trash icon
const TrashIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);

// Create Project Modal
const CreateProjectModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name: string, systemPrompt: string, useMemory: boolean) => void;
    isDark: boolean;
}> = ({ isOpen, onClose, onCreate, isDark }) => {
    const [name, setName] = useState('');
    const [systemPrompt, setSystemPrompt] = useState('');
    const [useMemory, setUseMemory] = useState(false);

    if (!isOpen) return null;

    const handleCreate = () => {
        if (name.trim()) {
            onCreate(name.trim(), systemPrompt.trim(), useMemory);
            setName('');
            setSystemPrompt('');
            setUseMemory(false);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-md" onClick={onClose} />

            {/* Glassmorphism Modal */}
            <div className={`
                relative w-full max-w-md mx-4 rounded-3xl p-6 shadow-2xl
                backdrop-blur-2xl border
                ${isDark ? 'bg-white/10 border-white/20' : 'bg-white/70 border-white/50'}
            `}>
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        Create new project
                    </h2>
                    <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-white/60' : 'hover:bg-gray-100 text-gray-500'}`}>
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <p className={`text-sm mb-6 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                    Fill in the details below to create a new project.
                </p>

                {/* Project Name */}
                <div className="mb-4">
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                        Project name
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value.slice(0, 50))}
                        placeholder="Enter a name for your project (max 50 characters)"
                        className={`
                            w-full px-4 py-3 rounded-xl text-sm transition-all
                            ${isDark
                                ? 'bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50'
                                : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500'}
                        `}
                    />
                </div>

                {/* System Prompt */}
                <div className="mb-4">
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                        System prompt
                    </label>
                    <textarea
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value.slice(0, 5000))}
                        placeholder="Enter a system prompt for chats in this project (max 5000 characters)"
                        rows={5}
                        className={`
                            w-full px-4 py-3 rounded-xl text-sm transition-all resize-none
                            ${isDark
                                ? 'bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50'
                                : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500'}
                        `}
                    />
                    <p className={`text-xs mt-1 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                        All chats in this project will use this as the system prompt sent to the AI model.
                    </p>
                </div>

                {/* Memory Toggle */}
                <div className={`mb-6 p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Use account memory in this project
                            </div>
                            <div className={`text-xs mt-1 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                                Share your saved memory context with conversations inside this project.
                            </div>
                        </div>
                        <button
                            onClick={() => setUseMemory(!useMemory)}
                            className={`
                                relative w-11 h-6 rounded-full transition-all duration-300
                                ${useMemory ? 'bg-emerald-500' : (isDark ? 'bg-white/20' : 'bg-gray-300')}
                            `}
                        >
                            <div className={`
                                absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300
                                ${useMemory ? 'left-5' : 'left-0.5'}
                            `} />
                        </button>
                    </div>
                </div>

                {/* Create Button */}
                <button
                    onClick={handleCreate}
                    disabled={!name.trim()}
                    className={`
                        w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-300
                        ${name.trim()
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02]'
                            : (isDark ? 'bg-white/10 text-white/30 cursor-not-allowed' : 'bg-gray-200 text-gray-400 cursor-not-allowed')}
                    `}
                >
                    Create project
                </button>
            </div>
        </div>
    );
};

// Project Item with dropdown - accepts drops from chats
const ProjectItem: React.FC<{
    project: { id: string; name: string; chats: { id: string; title: string }[] };
    isDark: boolean;
    onAddChat: () => void;
    onEdit: () => void;
    onDelete: () => void;
    onDrop?: (chatId: string) => void; // Handle dropped chat
    onRenameChat?: (chatId: string, chatTitle: string) => void; // Handle rename chat inside folder
    onDeleteChat?: (chatId: string) => void; // Handle delete chat inside folder
    onOpenChat?: (chatId: string, chatTitle: string) => void; // Handle opening a chat
}> = ({ project, isDark, onAddChat, onEdit, onDelete, onDrop, onRenameChat, onDeleteChat, onOpenChat }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showChatMenu, setShowChatMenu] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    // Drag handlers for accepting drops
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const chatId = e.dataTransfer.getData('text/chat-id');
        if (chatId && onDrop) {
            onDrop(chatId);
        }
    };

    return (
        <div className="space-y-1">
            {/* Project header - droppable */}
            <div
                className={`
                    flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer
                    transition-all duration-200 group
                    ${isDragOver
                        ? (isDark ? 'bg-emerald-500/20 border-2 border-dashed border-emerald-400' : 'bg-emerald-50 border-2 border-dashed border-emerald-400')
                        : (isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100')}
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div
                    className={`flex items-center gap-2 flex-1 min-w-0 ${isDark ? 'text-white/80' : 'text-gray-700'}`}
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <span className="text-sm font-medium truncate">
                        {project.name}
                    </span>
                    {isDragOver && (
                        <span className="text-xs text-emerald-400 ml-auto flex-shrink-0">Drop here</span>
                    )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Add chat */}
                    <button
                        onClick={(e) => { e.stopPropagation(); onAddChat(); }}
                        className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${isDark ? 'hover:bg-white/10 text-white/50' : 'hover:bg-gray-200 text-gray-400'}`}
                    >
                        <Plus className="w-4 h-4" />
                    </button>

                    {/* Settings dropdown */}
                    <div className="relative">
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings); }}
                            className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${isDark ? 'hover:bg-white/10 text-white/50' : 'hover:bg-gray-200 text-gray-400'}`}
                        >
                            <SettingsIcon className="w-4 h-4" />
                        </button>

                        {showSettings && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)} />
                                <div className={`
                                    absolute right-0 top-full mt-1 w-40 rounded-2xl overflow-hidden z-50 shadow-2xl
                                    backdrop-blur-2xl border
                                    ${isDark ? 'bg-white/10 border-white/20' : 'bg-white/70 border-white/50'}
                                `}>
                                    <button
                                        onClick={() => { onEdit(); setShowSettings(false); }}
                                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm ${isDark ? 'text-white/80 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        <EditIcon className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => { onDelete(); setShowSettings(false); }}
                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-500/10"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Expand chevron */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={`p-1.5 rounded-lg transition-all ${isDark ? 'text-white/40' : 'text-gray-400'}`}
                    >
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Chats list */}
            {isExpanded && project.chats.length > 0 && (
                <div className="ml-3 space-y-0.5">
                    {project.chats.map((chat) => (
                        <div
                            key={chat.id}
                            draggable
                            onDragStart={(e) => {
                                e.dataTransfer.setData('projectChatId', chat.id);
                                e.dataTransfer.setData('fromProjectId', project.id);
                                e.dataTransfer.effectAllowed = 'move';
                            }}
                            onClick={() => onOpenChat?.(chat.id, chat.title)}
                            className={`
                                flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer
                                transition-all duration-200 group/chat
                                ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100'}
                            `}
                        >
                            <div className={`flex items-center gap-2 flex-1 min-w-0 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                                <Rocket className="w-4 h-4 flex-shrink-0 text-emerald-500" />
                                <span className="text-sm truncate">{chat.title}</span>
                            </div>
                            <div className="relative">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowChatMenu(showChatMenu === chat.id ? null : chat.id); }}
                                    className={`p-1 rounded-lg opacity-0 group-hover/chat:opacity-100 transition-all ${isDark ? 'hover:bg-white/10 text-white/40' : 'hover:bg-gray-200 text-gray-400'}`}
                                >
                                    <MoreVertIcon className="w-4 h-4" />
                                </button>

                                {showChatMenu === chat.id && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowChatMenu(null)} />
                                        <div className={`
                                            absolute right-0 top-full mt-1 w-36 rounded-2xl overflow-hidden z-50 shadow-2xl
                                            backdrop-blur-2xl border
                                            ${isDark ? 'bg-white/10 border-white/20' : 'bg-white/70 border-white/50'}
                                        `}>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setShowChatMenu(null);
                                                    // Copy share link to clipboard
                                                    const shareUrl = `${window.location.origin}/#/chat/${chat.id}`;
                                                    navigator.clipboard.writeText(shareUrl);
                                                    // Show toast notification
                                                    const event = new CustomEvent('show-toast', { detail: { type: 'success', title: 'Link Copied', message: 'Share link copied to clipboard!' } });
                                                    window.dispatchEvent(event);
                                                }}
                                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${isDark ? 'text-white/80 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'}`}
                                            >
                                                <Share2Icon className="w-3.5 h-3.5" />
                                                Share
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setShowChatMenu(null); onRenameChat?.(chat.id, chat.title); }}
                                                className={`w-full flex items-center gap-2 px-3 py-2 text-sm ${isDark ? 'text-white/80 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'}`}
                                            >
                                                <EditIcon className="w-3.5 h-3.5" />
                                                Rename
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setShowChatMenu(null); onDeleteChat?.(chat.id); }}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-500/10"
                                            >
                                                <TrashIcon className="w-3.5 h-3.5" />
                                                Delete
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Draggable Chat Item - can be dropped into projects
const DraggableChatItem: React.FC<{
    chat: { id: string; name: string; created_at?: string };
    isDark: boolean;
    onEdit: () => void;
    onDelete: () => void;
    onClick?: () => void;
}> = ({ chat, isDark, onEdit, onDelete, onClick }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Settings state
    const [chatName, setChatName] = useState(chat.name);
    const [chatContext, setChatContext] = useState('');
    const [aiStyle, setAiStyle] = useState('balanced');
    const [conversationPattern, setConversationPattern] = useState('');
    const [showAiStyleDropdown, setShowAiStyleDropdown] = useState(false);
    const [useCrossMemory, setUseCrossMemory] = useState(true); // Cross-chat memory sharing

    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('text/chat-id', chat.id);
        e.dataTransfer.effectAllowed = 'move';
        setIsDragging(true);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };
    const [mouseDownTime, setMouseDownTime] = useState(0);

    const handleMouseDown = () => {
        setMouseDownTime(Date.now());
    };

    const handleClick = () => {
        // Only trigger click if mouse was held for less than 200ms (not a drag)
        if (Date.now() - mouseDownTime < 200 && onClick) {
            onClick();
        }
    };

    const handleSaveSettings = async () => {
        try {
            const { supabase } = await import('../../lib/supabaseClient');

            // Update chat name if changed
            if (chatName !== chat.name) {
                await supabase.from('projects').update({ name: chatName }).eq('id', chat.id);
                onEdit(); // Trigger refresh
            }

            // Save chat preferences to session_state
            await supabase.from('projects').update({
                session_state: {
                    chatContext,
                    aiStyle,
                    conversationPattern
                }
            }).eq('id', chat.id);

            setShowSettings(false);
        } catch (error) {
            console.error('Failed to save chat settings:', error);
        }
    };

    return (
        <>
            <div
                draggable
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onMouseDown={handleMouseDown}
                onClick={handleClick}
                className={`
                    flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer
                    transition-all duration-200 group
                    ${isDragging
                        ? 'opacity-50 scale-95 ring-2 ring-emerald-400'
                        : (isDark ? 'hover:bg-white/5' : 'hover:bg-gray-100')}
                `}
            >
                <div className={`flex items-center gap-2 flex-1 min-w-0 max-w-[140px] ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                    <Rocket className="w-4 h-4 flex-shrink-0 text-emerald-500" />
                    <span className="text-sm truncate">{chat.name}</span>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                    {/* Drag indicator */}
                    <div className={`p-1 rounded opacity-0 group-hover:opacity-50 ${isDark ? 'text-white/30' : 'text-gray-300'}`}>
                        <GripVertical className="w-3.5 h-3.5" />
                    </div>
                    {/* Menu */}
                    <div className="relative">
                        <button
                            type="button"
                            data-chat-menu={chat.id}
                            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                            className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all ${isDark ? 'hover:bg-white/10 text-white/50' : 'hover:bg-gray-200 text-gray-400'}`}
                        >
                            <MoreVertIcon className="w-4 h-4" />
                        </button>
                        {showMenu && createPortal(
                            <>
                                <div className="fixed inset-0 z-[100]" onClick={() => setShowMenu(false)} />
                                <div
                                    style={{
                                        position: 'fixed',
                                        top: (document.querySelector(`[data-chat-menu="${chat.id}"]`)?.getBoundingClientRect().bottom ?? 0) + 4,
                                        left: (document.querySelector(`[data-chat-menu="${chat.id}"]`)?.getBoundingClientRect().left ?? 0) - 100,
                                    }}
                                    className={`
                                        w-40 rounded-2xl overflow-hidden z-[101] shadow-2xl
                                        backdrop-blur-2xl border
                                        ${isDark ? 'bg-[#1a1a1a]/95 border-white/20' : 'bg-white/95 border-gray-200/50'}
                                    `}
                                >
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setShowMenu(false); setShowSettings(true); }}
                                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm ${isDark ? 'text-white/80 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        <SettingsIcon className="w-3.5 h-3.5" />
                                        Settings
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigator.clipboard.writeText(`${window.location.origin}/chat/${chat.id}`);
                                            setShowMenu(false);
                                        }}
                                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm ${isDark ? 'text-white/80 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50'}`}
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                        </svg>
                                        Share
                                    </button>
                                    <div className={`h-px ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); onDelete(); setShowMenu(false); }}
                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-500 hover:bg-red-500/10"
                                    >
                                        <TrashIcon className="w-3.5 h-3.5" />
                                        Delete
                                    </button>
                                </div>
                            </>,
                            document.body
                        )}
                    </div>
                </div>
            </div>

            {/* Chat Settings Modal - Portal to body to escape sidebar overflow */}
            {showSettings && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowSettings(false)}>
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

                    {/* Modal - Glassmorphic */}
                    <div
                        className={`
                            relative w-full max-w-md mx-4 rounded-2xl p-6 z-10
                            backdrop-blur-xl border shadow-2xl
                            ${isDark
                                ? 'bg-[#1a1a1a]/80 border-white/10 shadow-[0_0_50px_rgba(16,185,129,0.1)]'
                                : 'bg-white/90 border-gray-200 shadow-xl'}
                        `}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Top glow accent */}
                        <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />

                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                                    <SettingsIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        Chat Settings
                                    </h3>
                                    <p className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                                        Customize this conversation
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowSettings(false)}
                                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-white/50' : 'hover:bg-gray-100 text-gray-400'}`}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Settings Content */}
                        <div className="space-y-5">
                            {/* Chat Name */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                                    Chat Name
                                </label>
                                <input
                                    type="text"
                                    value={chatName}
                                    onChange={(e) => setChatName(e.target.value)}
                                    className={`
                                        w-full px-4 py-3 rounded-xl text-sm transition-all
                                        ${isDark
                                            ? 'bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50'
                                            : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500'}
                                    `}
                                    placeholder="Give this chat a name..."
                                />
                            </div>

                            {/* Context/Memory */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                                    Context & Memory
                                </label>
                                <textarea
                                    value={chatContext}
                                    onChange={(e) => setChatContext(e.target.value)}
                                    rows={3}
                                    className={`
                                        w-full px-4 py-3 rounded-xl text-sm transition-all resize-none
                                        ${isDark
                                            ? 'bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50'
                                            : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500'}
                                    `}
                                    placeholder="Add context that the AI should remember for this chat..."
                                />
                                <p className={`text-xs mt-1.5 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                                    This information will be used as context in every message.
                                </p>
                            </div>

                            {/* Cross-Chat Memory Toggle */}
                            <div className={`flex items-center justify-between p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                                <div className="flex-1">
                                    <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        Cross-Chat Memory
                                    </div>
                                    <p className={`text-xs mt-0.5 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                                        Share context with other chats in Super KroniQ & Business
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setUseCrossMemory(!useCrossMemory)}
                                    className={`
                                        relative w-12 h-7 rounded-full transition-all duration-300
                                        ${useCrossMemory
                                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25'
                                            : (isDark ? 'bg-white/20' : 'bg-gray-300')}
                                    `}
                                >
                                    <div className={`
                                        absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-lg transition-all duration-300
                                        ${useCrossMemory ? 'left-5.5 translate-x-0.5' : 'left-0.5'}
                                    `} />
                                </button>
                            </div>

                            {/* AI Style - Dropdown */}
                            <div className="relative">
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                                    AI Response Style
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowAiStyleDropdown(!showAiStyleDropdown)}
                                    className={`w-full px-4 py-3 rounded-xl flex items-center justify-between
                                        ${isDark
                                            ? 'bg-white/5 border-white/10 text-white'
                                            : 'bg-gray-50 border-gray-200 text-gray-900'}
                                        border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all`}
                                >
                                    <span>{
                                        aiStyle === 'balanced' ? '⚖️ Balanced' :
                                            aiStyle === 'concise' ? '⚡ Concise & Direct' :
                                                aiStyle === 'detailed' ? '📝 Detailed & Thorough' :
                                                    aiStyle === 'professional' ? '💼 Professional' :
                                                        aiStyle === 'casual' ? '😊 Casual & Friendly' :
                                                            aiStyle === 'creative' ? '🎨 Creative & Imaginative' : '⚖️ Balanced'
                                    }</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showAiStyleDropdown ? 'rotate-180' : ''}`} />
                                </button>

                                {showAiStyleDropdown && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowAiStyleDropdown(false)} />
                                        <div
                                            className={`
                                                absolute left-0 right-0 top-full mt-2 rounded-xl overflow-hidden z-50
                                                border shadow-2xl
                                                ${isDark
                                                    ? 'bg-[#1e2227] border-white/10'
                                                    : 'bg-white border-gray-200'}
                                            `}
                                            style={{
                                                boxShadow: isDark
                                                    ? '0 10px 40px rgba(0,0,0,0.5)'
                                                    : '0 10px 40px rgba(0,0,0,0.15)'
                                            }}
                                        >
                                            {[
                                                { value: 'balanced', label: '⚖️ Balanced' },
                                                { value: 'concise', label: '⚡ Concise & Direct' },
                                                { value: 'detailed', label: '📝 Detailed & Thorough' },
                                                { value: 'professional', label: '💼 Professional' },
                                                { value: 'casual', label: '😊 Casual & Friendly' },
                                                { value: 'creative', label: '🎨 Creative & Imaginative' }
                                            ].map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => {
                                                        setAiStyle(option.value);
                                                        setShowAiStyleDropdown(false);
                                                    }}
                                                    className={`
                                                        w-full px-4 py-3 text-left text-sm transition-all flex items-center justify-between
                                                        ${aiStyle === option.value
                                                            ? (isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-700')
                                                            : (isDark ? 'text-white/80 hover:bg-white/5' : 'text-gray-700 hover:bg-gray-50')}
                                                    `}
                                                >
                                                    <span>{option.label}</span>
                                                    {aiStyle === option.value && <Check className="w-4 h-4" />}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Conversation Pattern */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                                    Future Conversation Style
                                </label>
                                <textarea
                                    value={conversationPattern}
                                    onChange={(e) => setConversationPattern(e.target.value)}
                                    rows={2}
                                    className={`
                                        w-full px-4 py-3 rounded-xl text-sm transition-all resize-none
                                        ${isDark
                                            ? 'bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50'
                                            : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-emerald-500'}
                                    `}
                                    placeholder="e.g., Always use bullet points, be formal, include code examples..."
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowSettings(false)}
                                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${isDark ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveSettings}
                                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all hover:scale-[1.02]"
                            >
                                Save Settings
                            </button>
                        </div>
                    </div>
                </div>, document.body)}
        </>
    );
};

// Projects section with expandable items and Chats section
const ProjectsSection: React.FC<{ isDark: boolean; onOpenProject?: (projectId: string) => void }> = ({ isDark, onOpenProject }) => {
    const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [projects, setProjects] = useState<{ id: string; name: string; created_at?: string; mode?: 'playground' | 'super'; chats: { id: string; title: string }[]; is_folder?: boolean }[]>([]);
    const [editingProject, setEditingProject] = useState<{ id: string; name: string } | null>(null);
    const [editName, setEditName] = useState('');
    const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
    const [isDragOverChats, setIsDragOverChats] = useState(false);

    // Multi-select state for bulk delete
    const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
    const [selectedChatIds, setSelectedChatIds] = useState<Set<string>>(new Set());
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

    // AI Preference states for project settings
    const [projectAiStyle, setProjectAiStyle] = useState('default');
    const [projectSystemPrompt, setProjectSystemPrompt] = useState('');
    const [showStyleDropdown, setShowStyleDropdown] = useState(false);

    const { currentUser } = useAuth();
    const { showToast } = useToast();
    const { navigateTo } = useNavigation();

    // Handler to open a project
    const openProject = (projectId: string, _projectName: string) => {
        // Store the project ID to load - will be picked up by playground/chat view
        sessionStorage.setItem('kroniq_open_project', projectId);

        // Call the onOpenProject callback if provided (for Super KroniQ mode)
        if (onOpenProject) {
            onOpenProject(projectId);
            // Clear after a short delay to allow the view to pick it up
            setTimeout(() => sessionStorage.removeItem('kroniq_open_project'), 100);
            return;
        }

        // Old behavior: Navigate to chat view for non-Super KroniQ mode
        navigateTo('chat');
        // Trigger focus event so PlaygroundView picks up the change
        setTimeout(() => {
            window.dispatchEvent(new Event('focus'));
            sessionStorage.removeItem('kroniq_open_project');
        }, 50);
    };

    // Date grouping helper
    const getDateGroup = (dateStr?: string): 'today' | 'yesterday' | 'week' | 'older' => {
        if (!dateStr) return 'older';
        const date = new Date(dateStr);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

        if (date >= today) return 'today';
        if (date >= yesterday) return 'yesterday';
        if (date >= weekAgo) return 'week';
        return 'older';
    };

    // Group projects by date - only non-folder items (standalone chats)
    const chatsOnly = projects.filter(p => !p.is_folder);
    const groupedProjects = {
        today: chatsOnly.filter(p => getDateGroup(p.created_at) === 'today'),
        yesterday: chatsOnly.filter(p => getDateGroup(p.created_at) === 'yesterday'),
        week: chatsOnly.filter(p => getDateGroup(p.created_at) === 'week'),
        older: chatsOnly.filter(p => getDateGroup(p.created_at) === 'older')
    };

    // Load real projects from database
    useEffect(() => {
        if (!currentUser?.id) return;

        const loadProjects = async () => {
            try {
                const { subscribeToProjects } = await import('../../lib/chatService');
                const unsubscribe = subscribeToProjects((loadedProjects) => {
                    // First pass: format all projects and identify parent-child relationships
                    const allFormatted = loadedProjects.map(p => ({
                        id: p.id,
                        name: p.name || 'Untitled Project',
                        created_at: p.created_at,
                        mode: p.mode || 'playground',
                        chats: [] as { id: string; title: string }[],
                        is_folder: (p.session_state as any)?.is_folder || false,
                        parent_folder_id: (p.session_state as any)?.parent_folder_id || null
                    }));

                    // Second pass: populate folder.chats with children and filter out children from root
                    const foldersMap = new Map<string, typeof allFormatted[0]>();
                    allFormatted.forEach(p => {
                        if (p.is_folder) {
                            foldersMap.set(p.id, p);
                        }
                    });

                    // Add children to their parent folders
                    allFormatted.forEach(p => {
                        if (p.parent_folder_id && foldersMap.has(p.parent_folder_id)) {
                            const folder = foldersMap.get(p.parent_folder_id)!;
                            folder.chats.push({ id: p.id, title: p.name });
                        }
                    });

                    // Filter out chats that have a parent (they'll show inside the folder)
                    const formatted = allFormatted.filter(p => !p.parent_folder_id);

                    // Sort by created_at descending (newest first)
                    formatted.sort((a, b) => {
                        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                        return dateB - dateA;
                    });
                    setProjects(formatted);
                });
                return () => unsubscribe();
            } catch (error) {
                console.error('Error loading projects:', error);
            }
        };

        loadProjects();
    }, [currentUser?.id]);

    // Listen for projectCreated events to refresh sidebar immediately
    useEffect(() => {
        const handleProjectCreated = async () => {
            // Re-fetch projects when a new one is created
            const { getProjects } = await import('../../lib/chatService');
            const loadedProjects = await getProjects();

            const allFormatted = loadedProjects.map(p => ({
                id: p.id,
                name: p.name || 'Untitled Project',
                created_at: p.created_at,
                mode: p.mode || 'playground',
                chats: [] as { id: string; title: string }[],
                is_folder: (p.session_state as any)?.is_folder || false,
                parent_folder_id: (p.session_state as any)?.parent_folder_id || null
            }));

            const foldersMap = new Map<string, typeof allFormatted[0]>();
            allFormatted.forEach(p => {
                if (p.is_folder) foldersMap.set(p.id, p);
            });

            allFormatted.forEach(p => {
                if (p.parent_folder_id && foldersMap.has(p.parent_folder_id)) {
                    const folder = foldersMap.get(p.parent_folder_id)!;
                    folder.chats.push({ id: p.id, title: p.name });
                }
            });

            const formatted = allFormatted.filter(p => !p.parent_folder_id);
            formatted.sort((a, b) => {
                const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                return dateB - dateA;
            });
            setProjects(formatted);
        };

        window.addEventListener('projectCreated', handleProjectCreated);
        return () => window.removeEventListener('projectCreated', handleProjectCreated);
    }, []);

    const handleDeleteProject = async (projectId: string) => {
        // Set to show delete confirmation modal
        setDeletingProjectId(projectId);
    };

    const confirmDeleteProject = async () => {
        if (!deletingProjectId) return;
        try {
            const { deleteProject } = await import('../../lib/chatService');
            await deleteProject(deletingProjectId);

            // Update local state - remove from projects OR from folder's chats
            setProjects(prevProjects => {
                // First, check if this is a root-level project
                const isRootProject = prevProjects.some(p => p.id === deletingProjectId);

                if (isRootProject) {
                    // Remove from root projects
                    return prevProjects.filter(p => p.id !== deletingProjectId);
                } else {
                    // It's a chat inside a folder - remove from folder's chats array
                    return prevProjects.map(folder => {
                        if (folder.is_folder && folder.chats.some(c => c.id === deletingProjectId)) {
                            return {
                                ...folder,
                                chats: folder.chats.filter(c => c.id !== deletingProjectId)
                            };
                        }
                        return folder;
                    });
                }
            });

            showToast('success', 'Deleted', 'Deleted successfully');
        } catch (error) {
            console.error('Error deleting project:', error);
            showToast('error', 'Error', 'Failed to delete');
        } finally {
            setDeletingProjectId(null);
        }
    };

    // Multi-select handlers
    const handleToggleChatSelect = (chatId: string) => {
        setSelectedChatIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(chatId)) {
                newSet.delete(chatId);
            } else {
                newSet.add(chatId);
            }
            return newSet;
        });
    };

    const handleSelectAll = () => {
        const allChatIds = chatsOnly.map(c => c.id);
        setSelectedChatIds(new Set(allChatIds));
    };

    const handleDeselectAll = () => {
        setSelectedChatIds(new Set());
    };

    const handleBulkDelete = async () => {
        if (selectedChatIds.size === 0) return;

        try {
            const { deleteProject } = await import('../../lib/chatService');

            // Delete all selected chats
            for (const chatId of selectedChatIds) {
                await deleteProject(chatId);
            }

            // Update local state
            setProjects(prev => prev.filter(p => !selectedChatIds.has(p.id)));

            showToast('success', 'Deleted', `${selectedChatIds.size} chat(s) deleted successfully`);
            setSelectedChatIds(new Set());
            setIsMultiSelectMode(false);
            setShowBulkDeleteConfirm(false);
        } catch (error) {
            console.error('Error bulk deleting:', error);
            showToast('error', 'Error', 'Failed to delete some chats');
        }
    };

    const handleEditProject = (project: { id: string; name: string }) => {
        setEditingProject(project);
        setEditName(project.name);
        // Reset AI preferences for this project (could load from DB in future)
        setProjectAiStyle('default');
        setProjectSystemPrompt('');
    };

    const handleSaveEdit = async () => {
        if (!editingProject || !editName.trim()) return;
        try {
            const { renameProject } = await import('../../lib/chatService');
            await renameProject(editingProject.id, editName.trim());

            // Update local state - update in projects OR in folder's chats
            setProjects(prevProjects => {
                // First, check if this is a root-level project
                const isRootProject = prevProjects.some(p => p.id === editingProject.id);

                if (isRootProject) {
                    // Update root project
                    return prevProjects.map(p =>
                        p.id === editingProject.id ? { ...p, name: editName.trim() } : p
                    );
                } else {
                    // It's a chat inside a folder - update in folder's chats array
                    return prevProjects.map(folder => {
                        if (folder.is_folder && folder.chats.some(c => c.id === editingProject.id)) {
                            return {
                                ...folder,
                                chats: folder.chats.map(c =>
                                    c.id === editingProject.id ? { ...c, title: editName.trim() } : c
                                )
                            };
                        }
                        return folder;
                    });
                }
            });

            setEditingProject(null);
            showToast('success', 'Saved', 'Updated successfully');
        } catch (error) {
            console.error('Error renaming project:', error);
            showToast('error', 'Error', 'Failed to update');
        }
    };

    const handleCreateProject = async (name: string, _systemPrompt: string, _useMemory: boolean) => {
        try {
            const { supabase } = await import('../../lib/supabaseClient');
            const { getCurrentUser } = await import('../../lib/supabaseClient');
            const user = await getCurrentUser();
            if (!user) throw new Error('Not authenticated');

            // Create project with is_folder flag in session_state
            const { data: newProject, error } = await supabase
                .from('projects')
                .insert({
                    user_id: user.id,
                    name: name || 'New Project',
                    type: 'chat',
                    session_state: { is_folder: true }, // Mark as folder project
                    status: 'active'
                })
                .select()
                .single();

            if (error) throw error;
            if (newProject) {
                setProjects([{ id: newProject.id, name: newProject.name, chats: [], is_folder: true }, ...projects]);
                showToast('success', 'Created', 'Project created successfully');
            }
        } catch (error) {
            console.error('Error creating project:', error);
            showToast('error', 'Error', 'Failed to create project');
        }
    };

    // Move a chat into a project folder
    const moveChatToProject = async (chatId: string, targetProjectId: string) => {
        try {
            const { supabase } = await import('../../lib/supabaseClient');

            // Find the chat and target project
            const chat = projects.find(p => p.id === chatId);
            const targetProject = projects.find(p => p.id === targetProjectId);

            if (!chat || !targetProject) {
                showToast('error', 'Error', 'Chat or project not found');
                return;
            }

            // Update the chat's session_state to set parent_folder_id
            const { error } = await supabase
                .from('projects')
                .update({
                    session_state: {
                        parent_folder_id: targetProjectId
                    }
                })
                .eq('id', chatId);

            if (error) throw error;

            // Update local state - remove from main list and add to project's chats
            setProjects(prevProjects => {
                // First, add the chat to the target project's chats array
                const updated = prevProjects.map(p => {
                    if (p.id === targetProjectId) {
                        return {
                            ...p,
                            chats: [...p.chats, { id: chat.id, title: chat.name }]
                        };
                    }
                    return p;
                });
                // Then, remove the chat from the main projects list (filter it out)
                return updated.filter(p => p.id !== chatId);
            });

            showToast('success', 'Moved', `"${chat.name}" moved to "${targetProject.name}"`);
        } catch (error) {
            console.error('Error moving chat to project:', error);
            showToast('error', 'Error', 'Failed to move chat');
        }
    };

    // Move a chat from inside a project folder back to the main Chats list
    const moveChatFromProject = async (chatId: string, fromProjectId: string) => {
        try {
            const { supabase } = await import('../../lib/supabaseClient');

            // Find the source project to get the chat details
            const sourceProject = projects.find(p => p.id === fromProjectId);
            const chat = sourceProject?.chats.find(c => c.id === chatId);
            if (!sourceProject || !chat) {
                showToast('error', 'Error', 'Chat not found');
                return;
            }

            // Clear the session_state (remove parent_folder_id)
            const { error } = await supabase
                .from('projects')
                .update({
                    session_state: {}
                })
                .eq('id', chatId);

            if (error) throw error;

            // Update local state - remove from project's chats and add back to main list
            setProjects(prevProjects => {
                // First, remove the chat from the source project
                const updated = prevProjects.map(p => {
                    if (p.id === fromProjectId) {
                        return {
                            ...p,
                            chats: p.chats.filter(c => c.id !== chatId)
                        };
                    }
                    return p;
                });
                // Add the chat back to the main projects list
                const withChat = [
                    ...updated,
                    {
                        id: chat.id,
                        name: chat.title,
                        chats: [],
                        is_folder: false,
                        created_at: new Date().toISOString()
                    }
                ];
                // Sort by created_at descending (newest first)
                return withChat.sort((a, b) => {
                    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
                    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
                    return dateB - dateA;
                });
            });

            showToast('success', 'Moved', `"${chat.title}" moved back to Chats`);
        } catch (error) {
            console.error('Error moving chat from project:', error);
            showToast('error', 'Error', 'Failed to move chat');
        }
    };

    // Add a new chat inside a project folder
    const addChatToProject = async (projectId: string, projectName: string) => {
        try {
            const { supabase } = await import('../../lib/supabaseClient');
            const { getCurrentUser } = await import('../../lib/supabaseClient');
            const user = await getCurrentUser();
            if (!user) throw new Error('Not authenticated');

            // Create new chat with parent_folder_id
            const { data: newChat, error } = await supabase
                .from('projects')
                .insert({
                    user_id: user.id,
                    name: `New Chat in ${projectName}`,
                    type: 'chat',
                    session_state: {
                        is_folder: false,
                        parent_folder_id: projectId
                    },
                    status: 'active'
                })
                .select()
                .single();

            if (error) throw error;

            if (newChat) {
                // Update local state - add to project's chats
                setProjects(projects.map(p => {
                    if (p.id === projectId) {
                        return {
                            ...p,
                            chats: [...p.chats, { id: newChat.id, title: newChat.name }]
                        };
                    }
                    return p;
                }));

                showToast('success', 'Created', 'New chat added to project');
            }
        } catch (error) {
            console.error('Error adding chat to project:', error);
            showToast('error', 'Error', 'Failed to add chat');
        }
    };

    return (
        <>
            <div className="space-y-1">
                {/* Projects Header */}
                <div className={`
                    flex items-center justify-between px-3 py-2 rounded-lg
                    transition-all duration-200
                    ${isDark ? 'text-white/60' : 'text-gray-500'}
                `}>
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}>
                        <LayersIcon className="w-4 h-4" />
                        <span className="text-sm font-medium">Projects</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className={`p-1.5 rounded-lg transition-all ${isDark ? 'hover:bg-white/10 text-white/50' : 'hover:bg-gray-100 text-gray-400'}`}
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setIsProjectsExpanded(!isProjectsExpanded)}
                            className={`p-1.5 rounded-lg transition-all ${isDark ? 'text-white/40' : 'text-gray-400'}`}
                        >
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isProjectsExpanded ? '' : '-rotate-90'}`} />
                        </button>
                    </div>
                </div>

                {/* Projects List - Simple flat list */}
                {isProjectsExpanded && (
                    <div className="ml-2 space-y-1">
                        {/* Only show projects marked as folders */}
                        {projects.filter(p => p.is_folder).map((project) => (
                            <ProjectItem
                                key={project.id}
                                project={project}
                                isDark={isDark}
                                onAddChat={() => addChatToProject(project.id, project.name)}
                                onEdit={() => handleEditProject(project)}
                                onDelete={() => handleDeleteProject(project.id)}
                                onDrop={(chatId) => moveChatToProject(chatId, project.id)}
                                onOpenChat={(chatId, chatTitle) => openProject(chatId, chatTitle)}
                                onRenameChat={(chatId, chatTitle) => {
                                    // Find the chat in projects and trigger edit modal
                                    const chatToEdit = { id: chatId, name: chatTitle };
                                    handleEditProject(chatToEdit);
                                }}
                                onDeleteChat={(chatId) => {
                                    handleDeleteProject(chatId);
                                }}
                            />
                        ))}
                        {projects.filter(p => p.is_folder).length === 0 && (
                            <div className={`px-3 py-4 text-center text-sm ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                                No projects yet.
                            </div>
                        )}
                    </div>
                )}

            </div>

            {/* Chats Section - Date Grouped with Scroll - Drop zone for project chats */}
            <div
                className={`space-y-1 mt-4 flex flex-col overflow-hidden transition-all ${isDragOverChats ? (isDark ? 'ring-2 ring-emerald-500/50 rounded-lg bg-emerald-500/10' : 'ring-2 ring-emerald-400/50 rounded-lg bg-emerald-50') : ''}`}
                onDragOver={(e) => {
                    if (e.dataTransfer.types.includes('projectchatid')) {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                        setIsDragOverChats(true);
                    }
                }}
                onDragLeave={() => setIsDragOverChats(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOverChats(false);
                    const chatId = e.dataTransfer.getData('projectChatId');
                    const fromProjectId = e.dataTransfer.getData('fromProjectId');
                    if (chatId && fromProjectId) {
                        moveChatFromProject(chatId, fromProjectId);
                    }
                }}
            >
                <div className={`flex items-center justify-between px-3 py-2`}>
                    <span className={`text-xs font-semibold uppercase tracking-wider flex-shrink-0 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                        Chats {isMultiSelectMode && selectedChatIds.size > 0 && `(${selectedChatIds.size})`}
                    </span>
                    <div className="flex items-center gap-0.5 flex-wrap justify-end">
                        {isMultiSelectMode ? (
                            <>
                                <button
                                    onClick={handleSelectAll}
                                    className={`text-[10px] px-1.5 py-0.5 rounded ${isDark ? 'text-white/60 hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100'}`}
                                >
                                    All
                                </button>
                                <button
                                    onClick={handleDeselectAll}
                                    className={`text-[10px] px-1.5 py-0.5 rounded ${isDark ? 'text-white/60 hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100'}`}
                                >
                                    None
                                </button>
                                <button
                                    onClick={() => setShowBulkDeleteConfirm(true)}
                                    disabled={selectedChatIds.size === 0}
                                    className={`text-[10px] px-1.5 py-0.5 rounded ${selectedChatIds.size > 0 ? 'text-red-400 hover:bg-red-500/20' : 'text-gray-400 cursor-not-allowed'}`}
                                >
                                    Del
                                </button>
                                <button
                                    onClick={() => {
                                        setIsMultiSelectMode(false);
                                        setSelectedChatIds(new Set());
                                    }}
                                    className={`text-[10px] px-1.5 py-0.5 rounded ${isDark ? 'text-white/60 hover:bg-white/10' : 'text-gray-500 hover:bg-gray-100'}`}
                                >
                                    ✕
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => setIsMultiSelectMode(true)}
                                title="Select multiple chats to delete"
                                className={`text-xs px-2 py-0.5 rounded ${isDark ? 'text-white/40 hover:text-white/70 hover:bg-white/10' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                            >
                                Select
                            </button>
                        )}
                    </div>
                </div>

                {/* Scrollable chats container */}
                <div className="ml-2 space-y-3 overflow-y-auto overflow-x-hidden max-h-[40vh] pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-white/20 scrollbar-track-transparent">
                    {/* Today */}
                    {groupedProjects.today.length > 0 && (
                        <div>
                            <div className={`px-2 py-1 text-xs font-medium ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Today</div>
                            <div className="space-y-1">
                                {groupedProjects.today.map((chat) => (
                                    <div key={chat.id} className="flex items-center gap-1">
                                        {isMultiSelectMode && (
                                            <button
                                                onClick={() => handleToggleChatSelect(chat.id)}
                                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                                                    ${selectedChatIds.has(chat.id)
                                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                                        : isDark ? 'border-white/30 hover:border-white/50' : 'border-gray-300 hover:border-gray-400'}`}
                                            >
                                                {selectedChatIds.has(chat.id) && <Check className="w-3 h-3" />}
                                            </button>
                                        )}
                                        <div className="flex-1">
                                            <DraggableChatItem
                                                chat={chat}
                                                isDark={isDark}
                                                onClick={isMultiSelectMode ? () => handleToggleChatSelect(chat.id) : () => openProject(chat.id, chat.name)}
                                                onEdit={() => handleEditProject(chat)}
                                                onDelete={() => handleDeleteProject(chat.id)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Yesterday */}
                    {groupedProjects.yesterday.length > 0 && (
                        <div>
                            <div className={`px-2 py-1 text-xs font-medium ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Yesterday</div>
                            <div className="space-y-1">
                                {groupedProjects.yesterday.map((chat) => (
                                    <div key={chat.id} className="flex items-center gap-1">
                                        {isMultiSelectMode && (
                                            <button
                                                onClick={() => handleToggleChatSelect(chat.id)}
                                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                                                    ${selectedChatIds.has(chat.id)
                                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                                        : isDark ? 'border-white/30 hover:border-white/50' : 'border-gray-300 hover:border-gray-400'}`}
                                            >
                                                {selectedChatIds.has(chat.id) && <Check className="w-3 h-3" />}
                                            </button>
                                        )}
                                        <div className="flex-1">
                                            <DraggableChatItem
                                                chat={chat}
                                                isDark={isDark}
                                                onClick={isMultiSelectMode ? () => handleToggleChatSelect(chat.id) : () => openProject(chat.id, chat.name)}
                                                onEdit={() => handleEditProject(chat)}
                                                onDelete={() => handleDeleteProject(chat.id)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Previous 7 Days */}
                    {groupedProjects.week.length > 0 && (
                        <div>
                            <div className={`px-2 py-1 text-xs font-medium ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Previous 7 Days</div>
                            <div className="space-y-1">
                                {groupedProjects.week.map((chat) => (
                                    <div key={chat.id} className="flex items-center gap-1">
                                        {isMultiSelectMode && (
                                            <button
                                                onClick={() => handleToggleChatSelect(chat.id)}
                                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                                                    ${selectedChatIds.has(chat.id)
                                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                                        : isDark ? 'border-white/30 hover:border-white/50' : 'border-gray-300 hover:border-gray-400'}`}
                                            >
                                                {selectedChatIds.has(chat.id) && <Check className="w-3 h-3" />}
                                            </button>
                                        )}
                                        <div className="flex-1">
                                            <DraggableChatItem
                                                chat={chat}
                                                isDark={isDark}
                                                onClick={isMultiSelectMode ? () => handleToggleChatSelect(chat.id) : () => openProject(chat.id, chat.name)}
                                                onEdit={() => handleEditProject(chat)}
                                                onDelete={() => handleDeleteProject(chat.id)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Older */}
                    {groupedProjects.older.length > 0 && (
                        <div>
                            <div className={`px-2 py-1 text-xs font-medium ${isDark ? 'text-white/40' : 'text-gray-400'}`}>Older</div>
                            <div className="space-y-1">
                                {groupedProjects.older.map((chat) => (
                                    <div key={chat.id} className="flex items-center gap-1">
                                        {isMultiSelectMode && (
                                            <button
                                                onClick={() => handleToggleChatSelect(chat.id)}
                                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                                                    ${selectedChatIds.has(chat.id)
                                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                                        : isDark ? 'border-white/30 hover:border-white/50' : 'border-gray-300 hover:border-gray-400'}`}
                                            >
                                                {selectedChatIds.has(chat.id) && <Check className="w-3 h-3" />}
                                            </button>
                                        )}
                                        <div className="flex-1">
                                            <DraggableChatItem
                                                chat={chat}
                                                isDark={isDark}
                                                onClick={isMultiSelectMode ? () => handleToggleChatSelect(chat.id) : () => openProject(chat.id, chat.name)}
                                                onEdit={() => handleEditProject(chat)}
                                                onDelete={() => handleDeleteProject(chat.id)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* No chats message */}
                    {chatsOnly.length === 0 && (
                        <div className={`px-3 py-4 text-center text-sm ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                            No chats yet. Start a conversation!
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deletingProjectId && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-md">
                    <div className={`
                        w-full max-w-sm rounded-3xl p-6 backdrop-blur-2xl shadow-2xl border text-center
                        ${isDark ? 'bg-white/10 border-white/20' : 'bg-white/70 border-white/50'}
                    `}>
                        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                            <TrashIcon className="w-6 h-6 text-red-500" />
                        </div>
                        <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Delete Project?</h3>
                        <p className={`text-sm mb-6 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                            This will permanently delete the project and all its chats. This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeletingProjectId(null)}
                                className={`flex-1 py-2.5 rounded-xl ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >Cancel</button>
                            <button
                                onClick={confirmDeleteProject}
                                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium"
                            >Delete</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bulk Delete Confirmation Modal */}
            {showBulkDeleteConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-md">
                    <div className={`
                        w-full max-w-sm rounded-3xl p-6 backdrop-blur-2xl shadow-2xl border text-center
                        ${isDark ? 'bg-white/10 border-white/20' : 'bg-white/70 border-white/50'}
                    `}>
                        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
                            <TrashIcon className="w-6 h-6 text-red-500" />
                        </div>
                        <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Delete {selectedChatIds.size} Chat{selectedChatIds.size > 1 ? 's' : ''}?
                        </h3>
                        <p className={`text-sm mb-6 ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                            This will permanently delete the selected chats and all their messages. This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowBulkDeleteConfirm(false)}
                                className={`flex-1 py-2.5 rounded-xl ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >Cancel</button>
                            <button
                                onClick={handleBulkDelete}
                                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium"
                            >Delete All</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Project Modal - Enhanced with AI Preferences */}
            {editingProject && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setEditingProject(null)}>
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

                    {/* Modal - Glassmorphic */}
                    <div
                        className={`
                            relative w-full max-w-md rounded-2xl p-6 z-10 max-h-[80vh] overflow-y-auto
                            backdrop-blur-xl border shadow-2xl
                            ${isDark
                                ? 'bg-[#1a1a1a]/80 border-white/10 shadow-[0_0_50px_rgba(16,185,129,0.1)]'
                                : 'bg-white/90 border-gray-200 shadow-xl'}
                        `}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Top glow accent */}
                        <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent" />

                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                                    <SettingsIcon className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        Project Settings
                                    </h3>
                                    <p className={`text-xs ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                                        Customize this project
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setEditingProject(null)}
                                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-white/50' : 'hover:bg-gray-100 text-gray-400'}`}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Project Name */}
                        <div className="mb-5">
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>Project Name</label>
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className={`w-full px-4 py-3 rounded-xl ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white/50 border-gray-200 text-gray-900'} border focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                                placeholder="Project name"
                            />
                        </div>

                        {/* AI Response Style - Custom Dropdown */}
                        <div className="mb-5 relative">
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>AI Response Style</label>
                            <button
                                type="button"
                                onClick={() => setShowStyleDropdown(!showStyleDropdown)}
                                className={`w-full px-4 py-3 rounded-xl flex items-center justify-between
                                    ${isDark
                                        ? 'bg-[#1a1d21] border-white/10 text-white'
                                        : 'bg-white border-gray-200 text-gray-900'}
                                    border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all`}
                            >
                                <span>{
                                    projectAiStyle === 'default' ? 'Default' :
                                        projectAiStyle === 'professional' ? 'Professional' :
                                            projectAiStyle === 'casual' ? 'Casual & Friendly' :
                                                projectAiStyle === 'concise' ? 'Concise & Direct' :
                                                    projectAiStyle === 'detailed' ? 'Detailed & Thorough' :
                                                        projectAiStyle === 'creative' ? 'Creative & Imaginative' : 'Default'
                                }</span>
                                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showStyleDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {showStyleDropdown && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowStyleDropdown(false)} />
                                    <div
                                        className={`
                                            absolute left-0 right-0 top-full mt-2 rounded-xl overflow-hidden z-50
                                            border shadow-2xl
                                            ${isDark
                                                ? 'bg-[#1e2227] border-white/10'
                                                : 'bg-white border-gray-200'}
                                        `}
                                        style={{
                                            boxShadow: isDark
                                                ? '0 10px 40px rgba(0,0,0,0.5)'
                                                : '0 10px 40px rgba(0,0,0,0.15)'
                                        }}
                                    >
                                        {[
                                            { value: 'default', label: 'Default' },
                                            { value: 'professional', label: 'Professional' },
                                            { value: 'casual', label: 'Casual & Friendly' },
                                            { value: 'concise', label: 'Concise & Direct' },
                                            { value: 'detailed', label: 'Detailed & Thorough' },
                                            { value: 'creative', label: 'Creative & Imaginative' }
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => {
                                                    setProjectAiStyle(option.value);
                                                    setShowStyleDropdown(false);
                                                }}
                                                className={`
                                                    w-full px-4 py-3 text-left text-sm transition-all flex items-center justify-between
                                                    ${projectAiStyle === option.value
                                                        ? (isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-700')
                                                        : (isDark ? 'text-white/80 hover:bg-white/5' : 'text-gray-700 hover:bg-gray-50')}
                                                `}
                                            >
                                                <span>{option.label}</span>
                                                {projectAiStyle === option.value && (
                                                    <Check className="w-4 h-4 text-emerald-500" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* System Prompt */}
                        <div className="mb-6">
                            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>Custom Instructions</label>
                            <textarea
                                value={projectSystemPrompt}
                                onChange={(e) => setProjectSystemPrompt(e.target.value)}
                                rows={3}
                                className={`w-full px-4 py-3 rounded-xl resize-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/30' : 'bg-white/50 border-gray-200 text-gray-900 placeholder-gray-400'} border focus:outline-none focus:ring-2 focus:ring-emerald-500/50`}
                                placeholder="Enter any specific instructions for how you want AI to respond in this project..."
                            />
                            <p className={`text-xs mt-1 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                                These instructions will apply to all chats in this project.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setEditingProject(null)}
                                className={`flex-1 py-2.5 rounded-xl ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                            >Cancel</button>
                            <button
                                onClick={handleSaveEdit}
                                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:shadow-lg"
                            >Save Changes</button>
                        </div>
                    </div>
                </div>, document.body)}

            {/* Create Project Modal */}
            <CreateProjectModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onCreate={handleCreateProject}
                isDark={isDark}
            />
        </>
    );
};

// Sidebar component - Responsive with mobile toggle
const Sidebar: React.FC<{ isDark: boolean; onNewChat?: () => void; onOpenProject?: (projectId: string) => void; isMobileOpen?: boolean; onMobileClose?: () => void; isCollapsed?: boolean }> = ({ isDark, onNewChat, onOpenProject, isMobileOpen = false, onMobileClose, isCollapsed = false }) => {
    const { signOut, currentUser, userTier, setUserTier } = useAuth();
    const { currentTheme, setTheme } = useTheme();
    const [showProfilePopup, setShowProfilePopup] = useState(false);
    const [showPricingPopup, setShowPricingPopup] = useState(false);
    const { navigateTo } = useNavigation();
    const [tokensRemaining, setTokensRemaining] = useState<number | null>(null);
    const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');
    // userTier now comes from AuthContext (line 1872)
    const [showUpgradeSuccess, setShowUpgradeSuccess] = useState<'PRO' | 'PREMIUM' | null>(null);

    // Check for payment success and update tier
    useEffect(() => {
        const checkPaymentSuccess = async () => {
            try {
                const { handlePaymentSuccess, getUserTierFromDB } = await import('../../lib/stripeService');

                // Check if user just completed payment
                const result = await handlePaymentSuccess(currentUser?.id);
                if (result.success && result.tier) {
                    setUserTier(result.tier);
                    setShowUpgradeSuccess(result.tier as any);
                } else if (currentUser?.id) {
                    // Load current tier from database
                    const tier = await getUserTierFromDB(currentUser.id);
                    setUserTier(tier);
                }
            } catch (error) {
                console.error('Error checking payment:', error);
            }
        };

        checkPaymentSuccess();
    }, [currentUser?.id]);

    // Fetch token usage
    useEffect(() => {
        if (!currentUser?.id) return;

        const fetchUsage = async () => {
            try {
                const { getUserProfile } = await import('../../lib/chatService');
                const profile = await getUserProfile(currentUser.id);
                if (profile) {
                    const used = profile.tokens_used || 0;
                    const limit = profile.tokens_limit || 20000;
                    const remaining = Math.max(0, limit - used);
                    setTokensRemaining(remaining);
                    console.log('📊 [Sidebar] Tokens:', { used, limit, remaining });
                }
            } catch (error) {
                console.error('Error fetching usage:', error);
            }
        };

        fetchUsage();

        // Listen for token updates from deduction
        const handleTokenUpdate = (e: CustomEvent) => {
            console.log('🔄 [Sidebar] Token update event:', e.detail);
            if (e.detail?.balance !== undefined) {
                setTokensRemaining(e.detail.balance);
            } else {
                fetchUsage();
            }
        };
        window.addEventListener('tokenBalanceUpdated', handleTokenUpdate as EventListener);

        // Refetch every 30 seconds
        const interval = setInterval(fetchUsage, 30000);
        return () => {
            clearInterval(interval);
            window.removeEventListener('tokenBalanceUpdated', handleTokenUpdate as EventListener);
        };
    }, [currentUser?.id]);

    const toggleTheme = () => {
        setTheme(currentTheme === 'cosmic-dark' ? 'pure-white' : 'cosmic-dark');
    };

    const profilePicture = currentUser?.user_metadata?.avatar_url ||
        currentUser?.user_metadata?.picture || null;
    const userName = currentUser?.user_metadata?.full_name ||
        currentUser?.user_metadata?.name ||
        currentUser?.email?.split('@')[0] || 'User';
    const userInitial = userName[0]?.toUpperCase() || 'U';

    return (
        <>
            {/* Mobile overlay */}
            {isMobileOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    onClick={onMobileClose}
                />
            )}

            <aside
                className={`
                    ${isCollapsed ? 'fixed' : 'fixed md:relative'} z-50 h-full
                    w-[280px] sm:w-[260px]
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
                    ${isCollapsed ? 'md:-translate-x-full' : 'md:translate-x-0'}
                    flex flex-col overflow-hidden
                    ${isDark
                        ? 'bg-gradient-to-b from-[#0c0c0c] to-[#0a0a0a]'
                        : 'bg-gradient-to-b from-gray-50 to-white'
                    }
                    border-r ${isDark ? 'border-white/5' : 'border-gray-100'}
                    ${!isCollapsed ? 'shadow-2xl shadow-black/20' : ''}
                `}
                style={{
                    transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
                    willChange: 'transform'
                }}
            >
                {/* Logo Header - No border */}
                <div className="h-14 flex items-center justify-between px-3">
                    {/* Collapse/Expand button */}
                    <button
                        onClick={onMobileClose}
                        className={`p-2 rounded-lg transition-all duration-300 ${isDark
                            ? 'text-white/50 hover:text-white hover:bg-white/10'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                            }`}
                        title="Close sidebar"
                    >
                        <PanelLeftClose className="w-5 h-5" />
                    </button>

                    {/* Centered logo */}
                    <img
                        src={isDark ? '/kroniq-logo-white.png' : '/kroniq-logo-light.png'}
                        alt="KroniQ AI Logo"
                        className={`object-contain transition-all duration-300 hover:scale-105 ${isDark ? 'h-16' : 'h-24'}`}
                    />

                    {/* Theme toggle with premium glow */}
                    <button
                        onClick={toggleTheme}
                        className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${isDark
                            ? 'text-white/50 hover:text-amber-400 hover:bg-amber-400/10'
                            : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                    >
                        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                </div>

                {/* Search - Glass effect */}
                <div className="px-4 py-3">
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 ${isDark
                        ? 'bg-white/[0.03] focus-within:bg-white/[0.06] text-white/40'
                        : 'bg-gray-100/50 focus-within:bg-gray-100 text-gray-400 focus-within:shadow-sm'
                        }`}>
                        <Search className="w-4 h-4 text-emerald-500/60" />
                        <input
                            type="text"
                            placeholder="Search"
                            value={sidebarSearchQuery}
                            onChange={(e) => setSidebarSearchQuery(e.target.value)}
                            className={`flex-1 text-sm font-medium bg-transparent outline-none placeholder:opacity-60 ${isDark ? 'text-white placeholder:text-white/40' : 'text-gray-900 placeholder:text-gray-400'}`}
                        />
                        {sidebarSearchQuery && (
                            <button
                                onClick={() => setSidebarSearchQuery('')}
                                className={`ml-auto p-1 rounded-full ${isDark ? 'hover:bg-white/20 text-white/50' : 'hover:bg-gray-300 text-gray-500'}`}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Scrollable Navigation Area */}
                <div className="flex-1 min-h-0 overflow-y-auto">
                    <nav className="px-3 space-y-1">
                        {/* New Chat - Premium button */}
                        <button
                            onClick={() => {
                                // Call the onNewChat callback to reset chat state
                                if (onNewChat) {
                                    onNewChat();
                                }
                                // Set trigger for PlaygroundView to reset
                                sessionStorage.setItem('kroniq_new_chat_trigger', 'true');
                                sessionStorage.removeItem('kroniq_open_project');
                                navigateTo('chat');
                                // Force component to see the change
                                window.dispatchEvent(new Event('focus'));
                            }}
                            className={`
                        w-full flex items-center gap-3 px-4 py-3 rounded-xl
                        transition-all duration-300 group
                        ${isDark
                                    ? 'bg-white/[0.02] hover:bg-emerald-500/10 text-white/70 hover:text-white'
                                    : 'bg-gray-50 hover:bg-emerald-50 text-gray-700 hover:text-gray-900'}
                    `}>
                            <div className={`p-1.5 rounded-lg transition-all duration-300 ${isDark
                                ? 'bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/30'
                                : 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200'
                                }`}>
                                <Plus className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium">New Chat</span>
                        </button>

                        {/* Projects section */}
                        <ProjectsSection isDark={isDark} onOpenProject={onOpenProject} />
                    </nav>
                </div>
                {/* Bottom section - Fixed at bottom */}
                <div className="flex-shrink-0 p-3 space-y-3">
                    {/* Minimalist Plan & Tokens Widget - Apple-style */}
                    <div
                        className={`p-4 rounded-xl cursor-pointer transition-all duration-200 hover:scale-[1.01] ${isDark
                            ? 'bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05]'
                            : 'bg-gray-50 border border-gray-100 hover:bg-gray-100'}`}
                        onClick={() => setShowPricingPopup(true)}
                        title="Click to view plans"
                    >
                        {/* Plan Header */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2.5">
                                {/* Simple tier indicator */}
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${userTier === 'PREMIUM'
                                        ? 'bg-amber-500/10 text-amber-500'
                                        : 'bg-emerald-500/10 text-emerald-500'
                                    }`}>
                                    <img
                                        src={
                                            userTier === 'FREE' ? '/icons/free-tier-logo.svg' :
                                                userTier === 'STARTER' ? '/icons/starter-tier-logo.svg' :
                                                    userTier === 'PRO' ? '/icons/pro-tier-logo.svg' :
                                                        '/icons/premium-tier-logo.svg'
                                        }
                                        alt={`${userTier} tier`}
                                        className="w-4 h-4 object-contain"
                                    />
                                </div>
                                <div>
                                    <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                        {userTier === 'FREE' ? 'Free' : userTier === 'STARTER' ? 'Starter' : userTier === 'PRO' ? 'Pro' : 'Premium'}
                                    </span>
                                    <p className={`text-[11px] ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                                        Current plan
                                    </p>
                                </div>
                            </div>
                            <svg className={`w-4 h-4 ${isDark ? 'text-white/30' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                            </svg>
                        </div>

                        {/* Token Display - Clean and simple */}
                        <div className={`flex items-center justify-between py-2.5 px-3 rounded-lg ${isDark ? 'bg-white/[0.02]' : 'bg-white'}`}>
                            <span className={`text-xs font-medium ${isDark ? 'text-white/50' : 'text-gray-500'}`}>Tokens</span>
                            <span className={`text-lg font-semibold tabular-nums ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {tokensRemaining !== null
                                    ? (tokensRemaining >= 1000 ? `${Math.round(tokensRemaining / 1000)}K` : tokensRemaining)
                                    : '—'}
                            </span>
                        </div>

                        {/* Minimal progress bar */}
                        <div className={`mt-2.5 h-1 rounded-full overflow-hidden ${isDark ? 'bg-white/[0.04]' : 'bg-gray-200'}`}>
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${userTier === 'PREMIUM' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                style={{
                                    width: tokensRemaining !== null ? `${Math.min(100, (tokensRemaining / 20000) * 100)}%` : '0%'
                                }}
                            />
                        </div>
                    </div>

                    {/* Minimalist Upgrade button */}
                    <button
                        onClick={() => {
                            if (userTier === 'FREE') {
                                setShowPricingPopup(true);
                            } else {
                                import('../../lib/stripeService').then(({ openBillingPortal }) => {
                                    openBillingPortal();
                                });
                            }
                        }}
                        className={`w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${userTier === 'FREE'
                                ? isDark
                                    ? 'bg-white text-black hover:bg-white/90'
                                    : 'bg-gray-900 text-white hover:bg-gray-800'
                                : isDark
                                    ? 'bg-white/[0.05] text-white/70 hover:bg-white/[0.08] border border-white/[0.06]'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                            }`}
                    >
                        {userTier === 'FREE' ? (
                            <>
                                Upgrade
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </>
                        ) : (
                            <>
                                Manage Plan
                            </>
                        )}
                    </button>

                    {/* User profile - Clickable for popup */}
                    <div className="relative">
                        <div
                            onClick={() => setShowProfilePopup(!showProfilePopup)}
                            className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-300 cursor-pointer ${isDark
                                ? 'hover:bg-white/[0.05]'
                                : 'hover:bg-gray-50'
                                }`}
                        >
                            {profilePicture ? (
                                <img src={profilePicture} alt={userName} className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/30" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-emerald-500/25">
                                    {userInitial}
                                </div>
                            )}
                            <span className={`text-sm flex-1 truncate font-medium ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                                {userName}
                            </span>
                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showProfilePopup ? 'rotate-180' : ''} ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
                        </div>

                        {/* Glassmorphism Profile Popup */}
                        {showProfilePopup && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowProfilePopup(false)} />
                                <div className={`
                                absolute bottom-full left-0 right-0 mb-2 z-50
                                backdrop-blur-xl rounded-2xl p-4 shadow-2xl
                                border animate-scale-in
                                ${isDark
                                        ? 'bg-black/80 border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]'
                                        : 'bg-white/90 border-gray-200 shadow-xl'}
                            `}>
                                    {/* User Info Header */}
                                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                                        {profilePicture ? (
                                            <img src={profilePicture} alt={userName} className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/30" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                                                {userInitial}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{userName}</div>
                                            <div className={`text-xs truncate ${isDark ? 'text-white/50' : 'text-gray-500'}`}>{currentUser?.email}</div>
                                        </div>
                                    </div>

                                    {/* Menu Options with Premium Icons */}
                                    <div className="space-y-2">
                                        <button
                                            onClick={() => { setShowProfilePopup(false); navigateTo('profile'); }}
                                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group hover:scale-[1.02] ${isDark
                                                ? 'text-white/90 hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-teal-500/10 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                                                : 'text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 hover:shadow-md'}`}
                                        >
                                            <div className="p-1 rounded-lg overflow-hidden transition-transform duration-300 group-hover:scale-110">
                                                <img src="/profile-icon.png" alt="Profile" className="w-6 h-6" />
                                            </div>
                                            <span className="text-sm font-semibold tracking-wide">Profile</span>
                                            <svg className={`w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-8px] group-hover:translate-x-0 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </button>

                                        <button
                                            onClick={() => { setShowProfilePopup(false); navigateTo('settings'); }}
                                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group hover:scale-[1.02] ${isDark
                                                ? 'text-white/90 hover:bg-gradient-to-r hover:from-emerald-500/10 hover:to-teal-500/10 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]'
                                                : 'text-gray-700 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 hover:shadow-md'}`}
                                        >
                                            <div className="p-1 rounded-lg overflow-hidden transition-transform duration-300 group-hover:scale-110 group-hover:rotate-45">
                                                <img src="/settings-icon.png" alt="Settings" className="w-6 h-6" />
                                            </div>
                                            <span className="text-sm font-semibold tracking-wide">Settings</span>
                                            <svg className={`w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-8px] group-hover:translate-x-0 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </button>

                                        <div className={`border-t my-3 ${isDark ? 'border-white/5' : 'border-gray-100'}`} />

                                        <button
                                            onClick={() => { setShowProfilePopup(false); signOut(); }}
                                            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 group hover:scale-[1.02] hover:bg-gradient-to-r hover:from-red-500/10 hover:to-orange-500/10 hover:shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                                        >
                                            <div className="p-1 rounded-lg overflow-hidden transition-transform duration-300 group-hover:scale-110 group-hover:translate-x-[-3px]">
                                                <img src="/logout-icon.png" alt="Logout" className="w-6 h-6" />
                                            </div>
                                            <span className="text-sm font-semibold tracking-wide text-red-400 group-hover:text-red-300">Log out</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </aside>

            {/* Pricing Popup */}
            <PricingPopup
                isOpen={showPricingPopup}
                onClose={() => setShowPricingPopup(false)}
                isDark={isDark}
            />

            {/* Upgrade Success Modal */}
            {showUpgradeSuccess && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4"
                    onClick={() => setShowUpgradeSuccess(null)}
                >
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                    <div
                        className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 max-w-md w-full border border-emerald-500/30 shadow-2xl"
                        onClick={e => e.stopPropagation()}
                        style={{
                            boxShadow: '0 0 100px rgba(16, 185, 129, 0.3)',
                            animation: 'slideUp 0.4s ease-out'
                        }}
                    >
                        {/* Success Icon */}
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/40">
                            <span className="text-4xl">{showUpgradeSuccess === 'PRO' ? '⚡' : '👑'}</span>
                        </div>

                        {/* Title */}
                        <h2 className="text-3xl font-bold text-white text-center mb-2">
                            Welcome to <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">{showUpgradeSuccess}</span>!
                        </h2>

                        {/* Message */}
                        <p className="text-white/60 text-center mb-6">
                            Your account has been successfully upgraded. Enjoy your new features!
                        </p>

                        {/* Features */}
                        <div className="space-y-2 mb-6">
                            <div className="flex items-center gap-3 text-white/80">
                                <span className="text-emerald-400">✓</span>
                                <span>{showUpgradeSuccess === 'PRO' ? '30' : '70'} messages per day</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/80">
                                <span className="text-emerald-400">✓</span>
                                <span>{showUpgradeSuccess === 'PRO' ? '5' : '12'} images per week</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/80">
                                <span className="text-emerald-400">✓</span>
                                <span>{showUpgradeSuccess === 'PRO' ? '3' : '6'} videos per week</span>
                            </div>
                            {showUpgradeSuccess === 'PREMIUM' && (
                                <div className="flex items-center gap-3 text-white/80">
                                    <span className="text-emerald-400">✓</span>
                                    <span>All premium AI models</span>
                                </div>
                            )}
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={() => setShowUpgradeSuccess(null)}
                            className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/30"
                        >
                            Start Using KroniQ {showUpgradeSuccess}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

// Tool icons
const ToolIcons = {
    chat: ({ className }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    ),
    image: ({ className }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
        </svg>
    ),
    video: ({ className }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
    ),
    tts: ({ className }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
    ),
    ppt: ({ className }: { className?: string }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
            <line x1="8" y1="10" x2="16" y2="10" />
            <line x1="8" y1="14" x2="14" y2="14" />
            <line x1="8" y1="6" x2="10" y2="6" />
        </svg>
    ),
};

// Provider logos for Chat models - Accurate brand logos
const ProviderLogos = {
    openai: ({ className, isDark }: { className?: string; isDark?: boolean }) => (
        <svg className={className} viewBox="0 0 24 24" fill={isDark ? "white" : "currentColor"}>
            <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.4066-.6812zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.5056-2.6067-1.4998z" />
        </svg>
    ),
    google: ({ className }: { className?: string }) => (
        // Gemini - using actual logo image
        <img src="/gemini-logo.png" alt="Gemini" className={className} style={{ objectFit: 'contain' }} />
    ),
    anthropic: ({ className }: { className?: string }) => (
        // Claude - using actual logo image
        <img src="/logos/claude.png" alt="Claude" className={className} style={{ objectFit: 'contain' }} />
    ),
    meta: ({ className }: { className?: string }) => (
        // Meta - using actual logo image
        <img src="/meta-logo.png" alt="Meta" className={className} style={{ objectFit: 'contain' }} />
    ),
    grok: ({ className }: { className?: string }) => (
        // Grok - using actual logo image
        <img src="/logos/grok.png" alt="Grok" className={className} style={{ objectFit: 'contain' }} />
    ),
    perplexity: ({ className }: { className?: string }) => (
        // Perplexity - using actual logo image
        <img src="/logos/perplexity.png" alt="Perplexity" className={className} style={{ objectFit: 'contain' }} />
    ),
    deepseek: ({ className }: { className?: string }) => (
        // DeepSeek - using actual logo image
        <img src="/deepseek-logo.png" alt="DeepSeek" className={className} style={{ objectFit: 'contain' }} />
    ),
    mistral: ({ className }: { className?: string }) => (
        // Mistral - using actual logo image
        <img src="/mistral-logo.png" alt="Mistral" className={className} style={{ objectFit: 'contain' }} />
    ),
    qwen: ({ className }: { className?: string }) => (
        // Qwen - using actual logo image
        <img src="/logos/qwen.png" alt="Qwen" className={className} style={{ objectFit: 'contain' }} />
    ),
};

// Provider models for Chat - Free models listed first
const CHAT_PROVIDER_MODELS: Record<string, string[]> = {
    openai: ['GPT-4.1 Nano', 'GPT-4o mini', 'GPT-5 nano', 'GPT-5 mini', 'GPT-5', 'GPT-5.2', 'GPT 5.2 Pro', 'GPT 5.1 Codex Max'],
    google: ['Gemini 2.0 Flash', 'Google Gemma', 'Gemini 2.5 Flash', 'Gemini 2.5 Pro', 'Gemini 3', 'Gemini 3 Pro'],
    anthropic: ['Haiku 4.5', 'Sonnet 4', 'Sonnet 4.5', 'Opus 4.1', 'Opus 4.5'],
    meta: ['Llama Guard 3', 'Llama 3.2', 'Llama 3.3', 'Llama 4 Scout', 'Llama 4 Maverick', 'Llama Guard 4'],
    grok: ['Grok Code Fast 1', 'Grok 4 Fast', 'Grok 4.1 Fast', 'Grok 4'],
    perplexity: ['Sonar Reasoning', 'Sonar Pro Search', 'Sonar Reasoning Pro', 'Sonar Deep Research'],
    deepseek: ['DeepSeek v3', 'DeepSeek v3.1', 'DeepSeek v3.2', 'DeepSeek R1'],
    mistral: ['Mistral 3 3B', 'Mistral 3 8B', 'Mistral 3 14B', 'Codestral', 'Devstral'],
    qwen: ['Qwen3 Coder Flash', 'Qwen3 VL 8B', 'Qwen3 Coder Plus', 'Qwen3 Max', 'Qwen3 VL 32B'],
};

// Premium models that require paid subscription (locked for free users)
// Free users can only access models NOT in this list
const PREMIUM_MODELS: string[] = [
    // OpenAI - only GPT-5 nano and GPT-4o mini are free
    'GPT 5.1 Codex Max', 'GPT 5.2 Pro', 'GPT-5.2', 'GPT-5', 'GPT-5 mini',
    // Google - only Google Gemma is free
    'Gemini 3', 'Gemini 3 Pro', 'Gemini 2.5 Flash', 'Gemini 2.5 Pro',
    // Anthropic - only Haiku 4.5 is free
    'Opus 4.1', 'Sonnet 4', 'Opus 4.5', 'Sonnet 4.5',
    // Meta - only Llama Guard 3 is free
    'Llama 4 Maverick', 'Llama 4 Scout', 'Llama 3.3', 'Llama 3.2', 'Llama Guard 4',
    // Grok - only Grok Code Fast 1 is free
    'Grok 4', 'Grok 4.1 Fast', 'Grok 4 Fast',
    // Perplexity - only Sonar Reasoning is free
    'Sonar Pro Search', 'Sonar Reasoning Pro', 'Sonar Deep Research',
    // DeepSeek - only DeepSeek v3.1 is free
    'DeepSeek v3.2', 'DeepSeek R1',
    // Mistral - only Mistral 3 3B is free
    'Devstral', 'Mistral 3 8B', 'Codestral', 'Mistral 3 14B',
    // Qwen - only Qwen3 Coder Flash is free
    'Qwen3 VL 8B', 'Qwen3 Coder Plus', 'Qwen3 Max', 'Qwen3 VL 32B',
];

// Helper to check if a model is premium
const isModelPremium = (modelName: string): boolean => {
    return PREMIUM_MODELS.includes(modelName);
};

// Tool-specific model configurations (for non-chat tools)
const TOOL_MODELS = {
    image: ['Nanobanana', 'Nanobanana Pro', 'GPT-4o Image', 'Flux Context Pro', 'Imagen 4', 'Seedreem 4.5', 'Seedream 3', 'Grok Imagine', 'DALL-E 3'],
    video: ['Wan 2.5', 'Sora 2', 'Veo 3.1 Fast', 'Veo 3.1 Quality', 'Kling 2.6', 'Runway Gen-4'],
    tts: ['Eleven Labs'],
    ppt: ['KroniQ Slides', 'Office 365 AI'],
};

// Tool Provider Logos (for Image, Video, TTS models)
const ToolProviderLogos: Record<string, React.FC<{ className?: string; isDark?: boolean }>> = {
    // === IMAGE PROVIDERS ===
    // Nanobanana - using actual logo image
    nanobanana: ({ className }) => (
        <img src="/logos/nanobanana.png" alt="Nanobanana" className={className} style={{ objectFit: 'contain' }} />
    ),
    // OpenAI (GPT-4o Image, DALL-E)
    openai_image: ({ className, isDark }) => (
        <svg className={className} viewBox="0 0 24 24" fill={isDark ? "white" : "currentColor"}>
            <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.677l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.896zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
        </svg>
    ),
    // Flux - using actual logo image
    flux: ({ className }) => (
        <img src="/logos/flux.png" alt="Flux" className={className} style={{ objectFit: 'contain' }} />
    ),
    // Imagen - using actual logo image
    imagen: ({ className }) => (
        <img src="/logos/imagen.png" alt="Imagen" className={className} style={{ objectFit: 'contain' }} />
    ),
    // Seedream (ByteDance) - using actual logo image
    seedream: ({ className }) => (
        <img src="/logos/bytedance.png" alt="Seedream" className={className} style={{ objectFit: 'contain' }} />
    ),
    // Grok Imagine - uses Grok logo
    grok: ({ className }) => (
        <img src="/logos/grok.png" alt="Grok" className={className} style={{ objectFit: 'contain' }} />
    ),

    // === VIDEO PROVIDERS ===
    // Wan - uses Qwen logo (Alibaba)
    wan: ({ className }) => (
        <img src="/logos/qwen.png" alt="Wan" className={className} style={{ objectFit: 'contain' }} />
    ),
    // Sora - using actual logo image
    sora: ({ className }) => (
        <img src="/logos/sora.png" alt="Sora" className={className} style={{ objectFit: 'contain' }} />
    ),
    // Veo - uses Gemini logo (Google)
    veo: ({ className }) => (
        <img src="/gemini-logo.png" alt="Veo" className={className} style={{ objectFit: 'contain' }} />
    ),
    // Kling - using actual logo image
    kling: ({ className }) => (
        <img src="/logos/kling.png" alt="Kling" className={className} style={{ objectFit: 'contain' }} />
    ),
    // Runway - using actual logo image
    runway: ({ className }) => (
        <img src="/logos/runway.png" alt="Runway" className={className} style={{ objectFit: 'contain' }} />
    ),

    // === TTS PROVIDERS ===
    // ElevenLabs - using actual logo image
    elevenlabs: ({ className }) => (
        <img src="/logos/elevenlabs.png" alt="ElevenLabs" className={className} style={{ objectFit: 'contain' }} />
    ),
};

// Helper to get tool provider logo based on model name
const getToolProviderLogo = (modelName: string, isDark: boolean): React.ReactNode => {
    const name = modelName.toLowerCase();

    // Image models
    if (name.includes('nanobanana') || name.includes('nano banana')) {
        return <ToolProviderLogos.nanobanana className="w-5 h-5" isDark={isDark} />;
    }
    if (name.includes('gpt-4o') || name.includes('dall-e') || name.includes('dalle')) {
        return <ToolProviderLogos.openai_image className="w-5 h-5" isDark={isDark} />;
    }
    if (name.includes('flux')) {
        return <ToolProviderLogos.flux className="w-5 h-5" isDark={isDark} />;
    }
    if (name.includes('imagen')) {
        return <ToolProviderLogos.imagen className="w-5 h-5" isDark={isDark} />;
    }
    if (name.includes('seedream') || name.includes('seedreem')) {
        return <ToolProviderLogos.seedream className="w-5 h-5" isDark={isDark} />;
    }
    if (name.includes('grok')) {
        return <ToolProviderLogos.grok className="w-5 h-5" isDark={isDark} />;
    }

    // Video models
    if (name.includes('wan')) {
        return <ToolProviderLogos.wan className="w-5 h-5" isDark={isDark} />;
    }
    if (name.includes('sora')) {
        return <ToolProviderLogos.sora className="w-5 h-5" isDark={isDark} />;
    }
    if (name.includes('veo')) {
        return <ToolProviderLogos.veo className="w-5 h-5" isDark={isDark} />;
    }
    if (name.includes('kling')) {
        return <ToolProviderLogos.kling className="w-5 h-5" isDark={isDark} />;
    }
    if (name.includes('runway')) {
        return <ToolProviderLogos.runway className="w-5 h-5" isDark={isDark} />;
    }

    // TTS models
    if (name.includes('eleven')) {
        return <ToolProviderLogos.elevenlabs className="w-5 h-5" isDark={isDark} />;
    }

    return null;
};

// Icon-only Tool Dropdown (compact, shows only icon, dropdown reveals tool names)
// Premium Glassmorphic Design with PPT support - Uses context for mode management
const ToolIconDropdown: React.FC<{
    selectedTool?: 'chat' | 'image' | 'video' | 'tts' | 'ppt';
    onToolChange?: (tool: 'chat' | 'image' | 'video' | 'tts' | 'ppt') => void;
    isDark: boolean;
}> = ({ selectedTool, onToolChange, isDark }) => {
    const { mode, setMode } = useStudioMode();
    const { navigateTo } = useNavigation();
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Map context mode to tool type
    const mapModeToTool = (m: string): 'chat' | 'image' | 'video' | 'tts' | 'ppt' => {
        if (m === 'voice') return 'tts';
        if (m === 'ppt' || m === 'image' || m === 'video' || m === 'chat') return m as 'chat' | 'image' | 'video' | 'ppt';
        return 'chat';
    };

    // Use context mode as source of truth, fall back to prop
    const currentTool = selectedTool ?? mapModeToTool(mode);

    const tools = [
        { id: 'chat' as const, label: 'Chat', Icon: ToolIcons.chat, description: 'AI conversation' },
        { id: 'image' as const, label: 'Image', Icon: ToolIcons.image, description: 'Generate images' },
        { id: 'video' as const, label: 'Video', Icon: ToolIcons.video, description: 'Create videos' },
        { id: 'tts' as const, label: 'TTS', Icon: ToolIcons.tts, description: 'Text to speech' },
        { id: 'ppt' as const, label: 'PPT', Icon: ToolIcons.ppt, description: 'Presentations' },
    ];
    const CurrentIcon = ToolIcons[currentTool];

    // Update dropdown position when opened
    useEffect(() => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setDropdownPos({
                top: rect.bottom + 8,
                left: rect.left
            });
        }
    }, [isOpen]);

    // Click outside to close
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (
                triggerRef.current && !triggerRef.current.contains(target) &&
                dropdownRef.current && !dropdownRef.current.contains(target)
            ) {
                setIsOpen(false);
            }
        };

        const timeoutId = setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 10);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <>
            {/* Trigger Button - Glassmorphic */}
            <button
                ref={triggerRef}
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex items-center justify-center w-10 h-10 rounded-xl
                    backdrop-blur-xl transition-all duration-300 ease-out
                    ${isDark
                        ? 'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20'
                        : 'bg-white/80 text-gray-700 border border-gray-200 hover:bg-white hover:border-gray-300'}
                    ${isOpen ? (isDark ? 'ring-2 ring-emerald-500/30 bg-white/10' : 'ring-2 ring-emerald-500/20') : ''}
                    shadow-lg hover:shadow-xl
                `}
            >
                <CurrentIcon className="w-5 h-5" />
            </button>

            {/* Dropdown - Premium Glassmorphic */}
            {isOpen && createPortal(
                <div
                    ref={dropdownRef}
                    className={`
                        fixed w-56 rounded-2xl overflow-hidden
                        backdrop-blur-2xl shadow-2xl
                        animate-in fade-in-0 slide-in-from-top-2 duration-200
                        ${isDark
                            ? 'bg-black/80 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]'
                            : 'bg-white/95 border border-gray-200 shadow-xl'}
                    `}
                    style={{
                        top: dropdownPos.top,
                        left: dropdownPos.left,
                        zIndex: 99999
                    }}
                >
                    {/* Header */}
                    <div className={`
                        px-4 py-3 border-b flex items-center gap-2
                        ${isDark ? 'border-white/10' : 'border-gray-100'}
                    `}>
                        <Sparkles className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-white/60' : 'text-gray-500'}`}>
                            AI Tools
                        </span>
                    </div>

                    {/* Tools List */}
                    <div className="p-2">
                        {tools.map((tool) => (
                            <button
                                key={tool.id}
                                onClick={() => {
                                    // Map tool ID to context mode
                                    const modeMap: Record<string, 'chat' | 'image' | 'video' | 'voice' | 'ppt'> = {
                                        chat: 'chat',
                                        image: 'image',
                                        video: 'video',
                                        tts: 'voice', // TTS maps to 'voice' in context
                                        ppt: 'ppt'
                                    };
                                    const targetMode = modeMap[tool.id] || 'chat';
                                    setMode(targetMode);
                                    // Navigate to the correct view (exits Playground if needed)
                                    navigateTo(targetMode);
                                    onToolChange?.(tool.id);
                                    setIsOpen(false);
                                }}
                                className={`
                                    w-full flex items-center gap-3 px-3 py-3 rounded-xl
                                    transition-all duration-200
                                    ${currentTool === tool.id
                                        ? isDark
                                            ? 'bg-emerald-500/20 border border-emerald-500/30'
                                            : 'bg-emerald-50 border border-emerald-200'
                                        : isDark
                                            ? 'hover:bg-white/5 border border-transparent'
                                            : 'hover:bg-gray-50 border border-transparent'}
                                `}
                            >
                                {/* Icon */}
                                <div className={`
                                    p-2 rounded-lg transition-colors
                                    ${currentTool === tool.id
                                        ? isDark ? 'bg-emerald-500/30' : 'bg-emerald-100'
                                        : isDark ? 'bg-white/5' : 'bg-gray-100'}
                                `}>
                                    <tool.Icon className={`
                                        w-4 h-4 transition-colors
                                        ${currentTool === tool.id
                                            ? 'text-emerald-400'
                                            : isDark ? 'text-white/60' : 'text-gray-500'}
                                    `} />
                                </div>

                                {/* Label & Description */}
                                <div className="flex-1 text-left">
                                    <div className={`
                                        text-sm font-medium
                                        ${currentTool === tool.id
                                            ? isDark ? 'text-emerald-400' : 'text-emerald-700'
                                            : isDark ? 'text-white' : 'text-gray-900'}
                                    `}>
                                        {tool.label}
                                    </div>
                                    <div className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                                        {tool.description}
                                    </div>
                                </div>

                                {/* Checkmark */}
                                {selectedTool === tool.id && (
                                    <Check className="w-4 h-4 text-emerald-400" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

// Premium Model Slot component with animations and even spacing
const ModelSlot: React.FC<{
    providerLogo?: React.ReactNode;
    selectedModel: string;
    models: string[];
    onModelSelect: (model: string) => void;
    enabled: boolean;
    onToggle: () => void;
    isDark: boolean;
    showProviderDropdown?: boolean;
    selectedProvider?: string;
    onProviderChange?: (provider: string) => void;
}> = ({
    providerLogo,
    selectedModel,
    models,
    onModelSelect,
    enabled,
    onToggle,
    isDark,
    showProviderDropdown,
    selectedProvider,
    onProviderChange
}) => {
        const [isModelOpen, setIsModelOpen] = useState(false);
        const [isProviderOpen, setIsProviderOpen] = useState(false);
        const [isHovered, setIsHovered] = useState(false);
        const [providerDropdownPos, setProviderDropdownPos] = useState({ top: 0, left: 0 });
        const [modelDropdownPos, setModelDropdownPos] = useState({ top: 0, left: 0 });

        const providerTriggerRef = useRef<HTMLButtonElement>(null);
        const providerDropdownRef = useRef<HTMLDivElement>(null);
        const modelTriggerRef = useRef<HTMLButtonElement>(null);
        const modelDropdownRef = useRef<HTMLDivElement>(null);
        const providers = Object.keys(CHAT_PROVIDER_MODELS);

        // Update provider dropdown position
        useEffect(() => {
            if (isProviderOpen && providerTriggerRef.current) {
                const rect = providerTriggerRef.current.getBoundingClientRect();
                setProviderDropdownPos({
                    top: rect.bottom + 12,
                    left: rect.left + rect.width / 2 - 96 // Center the 192px dropdown
                });
            }
        }, [isProviderOpen]);

        // Update model dropdown position
        useEffect(() => {
            if (isModelOpen && modelTriggerRef.current) {
                const rect = modelTriggerRef.current.getBoundingClientRect();
                setModelDropdownPos({
                    top: rect.bottom + 12,
                    left: rect.left
                });
            }
        }, [isModelOpen]);

        // Click outside to close provider dropdown
        useEffect(() => {
            if (!isProviderOpen) return;

            const handleClickOutside = (event: MouseEvent) => {
                const target = event.target as Node;
                if (
                    providerTriggerRef.current && !providerTriggerRef.current.contains(target) &&
                    providerDropdownRef.current && !providerDropdownRef.current.contains(target)
                ) {
                    setIsProviderOpen(false);
                }
            };

            const timeoutId = setTimeout(() => {
                document.addEventListener('click', handleClickOutside);
            }, 10);

            return () => {
                clearTimeout(timeoutId);
                document.removeEventListener('click', handleClickOutside);
            };
        }, [isProviderOpen]);

        // Click outside to close model dropdown
        useEffect(() => {
            if (!isModelOpen) return;

            const handleClickOutside = (event: MouseEvent) => {
                const target = event.target as Node;
                if (
                    modelTriggerRef.current && !modelTriggerRef.current.contains(target) &&
                    modelDropdownRef.current && !modelDropdownRef.current.contains(target)
                ) {
                    setIsModelOpen(false);
                }
            };

            const timeoutId = setTimeout(() => {
                document.addEventListener('click', handleClickOutside);
            }, 10);

            return () => {
                clearTimeout(timeoutId);
                document.removeEventListener('click', handleClickOutside);
            };
        }, [isModelOpen]);

        return (
            <div
                className={`
                flex-1 flex items-center justify-center gap-3 px-4 py-3 
                border-r last:border-r-0 transition-all duration-300
                ${isDark ? 'border-white/10' : 'border-gray-200/50'}
                ${isHovered ? (isDark ? 'bg-white/5' : 'bg-gray-50/50') : ''}
            `}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Provider Logo / Dropdown Button */}
                {showProviderDropdown && selectedProvider && onProviderChange ? (
                    <>
                        <button
                            ref={providerTriggerRef}
                            onClick={() => setIsProviderOpen(!isProviderOpen)}
                            className={`
                            flex items-center justify-center w-9 h-9 rounded-xl
                            transition-all duration-300 transform
                            ${isDark
                                    ? 'hover:bg-white/15 hover:shadow-lg hover:shadow-white/10 hover:scale-110'
                                    : 'hover:bg-gray-100 hover:shadow-lg hover:shadow-gray-300/30 hover:scale-110'}
                            ${isProviderOpen ? 'scale-110 ring-2 ring-emerald-500/50' : ''}
                        `}
                        >
                            {(() => {
                                const Logo = ProviderLogos[selectedProvider as keyof typeof ProviderLogos];
                                return Logo ? <Logo className="w-5 h-5" isDark={isDark} /> : providerLogo;
                            })()}
                        </button>

                        {isProviderOpen && createPortal(
                            <div
                                ref={providerDropdownRef}
                                className={`
                                fixed w-48 rounded-2xl overflow-hidden
                                backdrop-blur-2xl shadow-2xl
                                animate-in fade-in-0 slide-in-from-top-2 duration-200
                                ${isDark
                                        ? 'bg-black/80 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]'
                                        : 'bg-white/95 border border-gray-200 shadow-xl'}
                            `}
                                style={{
                                    top: providerDropdownPos.top,
                                    left: providerDropdownPos.left,
                                    zIndex: 99999
                                }}
                            >
                                <div className={`px-3 py-2 border-b ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
                                    <p className={`text-xs font-medium ${isDark ? 'text-white/50' : 'text-gray-400'}`}>
                                        Select Provider
                                    </p>
                                </div>
                                {providers.map((provider) => {
                                    const Logo = ProviderLogos[provider as keyof typeof ProviderLogos];
                                    return (
                                        <button
                                            key={provider}
                                            onClick={() => {
                                                onProviderChange(provider);
                                                onModelSelect(CHAT_PROVIDER_MODELS[provider][0]);
                                                setIsProviderOpen(false);
                                            }}
                                            className={`
                                            w-full flex items-center gap-3 px-4 py-3 transition-all duration-200
                                            ${selectedProvider === provider
                                                    ? (isDark
                                                        ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400'
                                                        : 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700')
                                                    : (isDark
                                                        ? 'text-white/90 hover:bg-white/10 hover:pl-5'
                                                        : 'text-gray-700 hover:bg-gray-50 hover:pl-5')}
                                        `}
                                        >
                                            <div className={`
                                            w-7 h-7 rounded-lg flex items-center justify-center transition-all
                                            ${selectedProvider === provider
                                                    ? (isDark ? 'bg-emerald-500/20' : 'bg-emerald-100')
                                                    : (isDark ? 'bg-white/5' : 'bg-gray-100')}
                                        `}>
                                                <Logo className="w-4 h-4" isDark={isDark} />
                                            </div>
                                            <span className="text-sm font-medium capitalize flex-1">{provider}</span>
                                            {selectedProvider === provider && (
                                                <Check className="w-4 h-4 text-emerald-500" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>,
                            document.body
                        )}
                    </>
                ) : (
                    <div className={`
                    w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-300
                    ${isDark ? 'bg-white/5' : 'bg-gray-100/50'}
                `}>
                        {providerLogo}
                    </div>
                )}

                {/* Model Name & Dropdown */}
                <div className="relative flex-1 min-w-0">
                    <button
                        ref={modelTriggerRef}
                        onClick={() => setIsModelOpen(!isModelOpen)}
                        className={`
                        flex items-center gap-2 px-3 py-2 rounded-xl w-full
                        transition-all duration-300 group
                        ${isDark
                                ? 'hover:bg-white/10'
                                : 'hover:bg-gray-100'}
                        ${isModelOpen ? (isDark ? 'bg-white/10' : 'bg-gray-100') : ''}
                    `}
                    >
                        <span className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            {selectedModel}
                        </span>
                        <ChevronDown className={`
                        w-4 h-4 transition-all duration-300 ml-auto flex-shrink-0
                        ${isModelOpen ? 'rotate-180' : ''}
                        ${isDark ? 'text-white/40 group-hover:text-white/70' : 'text-gray-400 group-hover:text-gray-600'}
                    `} />
                    </button>
                </div>

                {isModelOpen && createPortal(
                    <div
                        ref={modelDropdownRef}
                        className={`
                        fixed w-56 max-h-72 overflow-y-auto rounded-2xl
                        backdrop-blur-2xl shadow-2xl
                        animate-in fade-in-0 slide-in-from-top-2 duration-200
                        ${isDark
                                ? 'bg-black/80 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]'
                                : 'bg-white/95 border border-gray-200 shadow-xl'}
                    `}
                        style={{
                            top: modelDropdownPos.top,
                            left: modelDropdownPos.left,
                            zIndex: 99999
                        }}
                    >
                        <div className={`px-3 py-2 border-b sticky top-0 ${isDark ? 'border-white/10 bg-[#0f0f0f]' : 'border-gray-100 bg-white'}`}>
                            <p className={`text-xs font-medium ${isDark ? 'text-white/50' : 'text-gray-400'}`}>
                                Available Models
                            </p>
                        </div>
                        {/* Standard (Free) Models */}
                        <div className={`px-3 py-2 border-b ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
                            <p className={`text-xs font-semibold ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                                Standard
                            </p>
                        </div>
                        {models.filter(model => !isModelPremium(model)).map((model) => (
                            <button
                                key={model}
                                onClick={() => {
                                    onModelSelect(model);
                                    setIsModelOpen(false);
                                }}
                                className={`
                                w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 text-left
                                ${selectedModel === model
                                        ? (isDark
                                            ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400'
                                            : 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700')
                                        : (isDark
                                            ? 'text-white/90 hover:bg-white/10 hover:pl-5'
                                            : 'text-gray-700 hover:bg-gray-50 hover:pl-5')}
                            `}
                            >
                                {selectedModel === model && (
                                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white" />
                                    </div>
                                )}
                                <span className="text-sm font-medium flex-1">{model}</span>
                            </button>
                        ))}

                        {/* Premium (Locked) Models */}
                        <div className={`px-3 py-2 border-b border-t ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
                            <p className={`text-xs font-semibold ${isDark ? 'text-white/70' : 'text-gray-600'}`}>
                                Premium
                            </p>
                        </div>
                        {models.filter(model => isModelPremium(model)).map((model) => (
                            <button
                                key={model}
                                onClick={() => { }}
                                disabled={true}
                                className={`
                                w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 text-left
                                ${isDark ? 'text-white/40 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed'}
                            `}
                            >
                                <div className={`w-5 h-5 rounded-md flex items-center justify-center ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
                                    <Lock className="w-3 h-3 text-gray-400" />
                                </div>
                                <span className="text-sm font-medium flex-1 opacity-60">{model}</span>
                            </button>
                        ))}
                    </div>,
                    document.body
                )}

                {/* Premium Toggle Switch */}
                <button
                    onClick={onToggle}
                    className={`
                    relative w-12 h-6 rounded-full transition-all duration-500 flex-shrink-0
                    ${enabled
                            ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 shadow-lg shadow-emerald-500/40'
                            : (isDark ? 'bg-white/15' : 'bg-gray-300')}
                `}
                >
                    <div className={`
                    absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-500
                    ${enabled
                            ? 'left-7 shadow-emerald-500/50'
                            : 'left-1'}
                `}>
                        {enabled && (
                            <div className="absolute inset-0 rounded-full bg-white animate-pulse" />
                        )}
                    </div>
                </button>
            </div>
        );
    };

// Completely redesigned Playground model bar with 3 models (currently unused, kept for future use)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _PlaygroundModelBar: React.FC<{ isDark: boolean }> = ({ isDark }) => {
    const [selectedTool, setSelectedTool] = useState<'chat' | 'image' | 'video' | 'tts' | 'ppt'>('chat');

    // 3 provider states for Chat
    const [provider1, setProvider1] = useState('openai');
    const [provider2, setProvider2] = useState('google');
    const [provider3, setProvider3] = useState('deepseek');

    // 3 model states - Using FREE working models
    const [model1, setModel1] = useState('GPT-4.1 Nano');
    const [model2, setModel2] = useState('Gemini 2.0 Flash');
    const [model3, setModel3] = useState('DeepSeek v3');

    // 3 enabled states
    const [model1Enabled, setModel1Enabled] = useState(true);
    const [model2Enabled, setModel2Enabled] = useState(true);
    const [model3Enabled, setModel3Enabled] = useState(true);

    // Reset models when tool changes
    useEffect(() => {
        if (selectedTool === 'chat') {
            setProvider1('openai');
            setProvider2('google');
            setProvider3('deepseek');
            setModel1('GPT-4.1 Nano');
            setModel2('Gemini 2.0 Flash');
            setModel3('DeepSeek v3');
        } else if (selectedTool === 'image') {
            setModel1('Nanobanana');
            setModel2('Flux Context Pro');
            setModel3('Imagen 4');
        } else if (selectedTool === 'video') {
            setModel1('Wan 2.5');
            setModel2('Sora 2');
            setModel3('Veo 3.1 Fast');
        } else if (selectedTool === 'tts') {
            setModel1('Eleven Labs');
        }
    }, [selectedTool]);

    // Get models based on tool
    const getModels = (providerIdx: number) => {
        if (selectedTool === 'chat') {
            const providerMap = [provider1, provider2, provider3];
            return CHAT_PROVIDER_MODELS[providerMap[providerIdx]] || [];
        }
        return TOOL_MODELS[selectedTool] || [];
    };

    // Get provider logo for non-chat tools - uses actual brand logos
    const getToolLogo = (modelName: string) => {
        return getToolProviderLogo(modelName, isDark);
    };


    return (
        <div className={`
            flex items-center border-b backdrop-blur-xl
            ${isDark ? 'border-white/10 bg-[#0a0a0a]/80' : 'border-gray-200 bg-white/90'}
        `}>
            {/* Tool Icon Dropdown - Fixed width */}
            <div className={`
                px-4 py-3 flex-shrink-0 border-r
                ${isDark ? 'border-white/10' : 'border-gray-200/50'}
            `}>
                <ToolIconDropdown
                    selectedTool={selectedTool}
                    onToolChange={setSelectedTool}
                    isDark={isDark}
                />
            </div>

            {/* Models Container - Takes all available space, evenly distributed */}
            <div className="flex-1 flex items-stretch">
                {/* Model Slot 1 */}
                <ModelSlot
                    providerLogo={selectedTool === 'chat'
                        ? <ProviderLogos.openai className="w-5 h-5" isDark={isDark} />
                        : getToolLogo(model1)
                    }
                    selectedModel={model1}
                    models={getModels(0)}
                    onModelSelect={setModel1}
                    enabled={model1Enabled}
                    onToggle={() => setModel1Enabled(!model1Enabled)}
                    isDark={isDark}
                    showProviderDropdown={selectedTool === 'chat'}
                    selectedProvider={provider1}
                    onProviderChange={(p) => {
                        setProvider1(p);
                        setModel1(CHAT_PROVIDER_MODELS[p][0]);
                    }}
                />

                {/* Model Slot 2 - hidden for TTS */}
                {selectedTool !== 'tts' && (
                    <ModelSlot
                        providerLogo={selectedTool === 'chat'
                            ? <ProviderLogos.google className="w-5 h-5" />
                            : getToolLogo(model2)
                        }
                        selectedModel={model2}
                        models={getModels(1)}
                        onModelSelect={setModel2}
                        enabled={model2Enabled}
                        onToggle={() => setModel2Enabled(!model2Enabled)}
                        isDark={isDark}
                        showProviderDropdown={selectedTool === 'chat'}
                        selectedProvider={provider2}
                        onProviderChange={(p) => {
                            setProvider2(p);
                            setModel2(CHAT_PROVIDER_MODELS[p][0]);
                        }}
                    />
                )}

                {/* Model Slot 3 - hidden for TTS */}
                {selectedTool !== 'tts' && (
                    <ModelSlot
                        providerLogo={selectedTool === 'chat'
                            ? <ProviderLogos.deepseek className="w-5 h-5" />
                            : getToolLogo(model3)
                        }
                        selectedModel={model3}
                        models={getModels(2)}
                        onModelSelect={setModel3}
                        enabled={model3Enabled}
                        onToggle={() => setModel3Enabled(!model3Enabled)}
                        isDark={isDark}
                        showProviderDropdown={selectedTool === 'chat'}
                        selectedProvider={provider3}
                        onProviderChange={(p) => {
                            setProvider3(p);
                            setModel3(CHAT_PROVIDER_MODELS[p][0]);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

// Mode Toggle with animated pill - Super KroniQ and Business modes only
const ModeToggle: React.FC<{
    isDark: boolean;
    mode: 'super' | 'business' | 'social';
    onModeChange: (mode: 'super' | 'business' | 'social') => void;
}> = ({ isDark, mode, onModeChange }) => {
    const buttonRef1 = useRef<HTMLButtonElement>(null);
    const buttonRef2 = useRef<HTMLButtonElement>(null);
    const buttonRef3 = useRef<HTMLButtonElement>(null);
    const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });

    // Update pill position when mode changes
    useEffect(() => {
        const updatePill = () => {
            let targetButton: HTMLButtonElement | null = null;
            if (mode === 'super') targetButton = buttonRef1.current;
            else if (mode === 'business') targetButton = buttonRef2.current;
            else if (mode === 'social') targetButton = buttonRef3.current;

            if (targetButton) {
                setPillStyle({
                    left: targetButton.offsetLeft,
                    width: targetButton.offsetWidth
                });
            }
        };
        updatePill();
        // Small delay to ensure layout is complete
        const timer = setTimeout(updatePill, 50);
        return () => clearTimeout(timer);
    }, [mode]);

    return (
        <div
            className={`
                relative inline-flex items-center p-1 rounded-full
                transition-all duration-300 ease-out
                ${isDark
                    ? 'bg-[#1a1d21]/90 border border-white/10'
                    : 'bg-white/90 border border-gray-200'}
            `}
            style={{
                backdropFilter: 'blur(20px)',
                boxShadow: isDark
                    ? '0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
                    : '0 4px 20px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)'
            }}
        >
            {/* Animated pill background */}
            <div
                className={`
                    absolute h-[calc(100%-8px)] rounded-full transition-all duration-300 ease-out
                    ${mode === 'super'
                        ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/15'
                        : mode === 'business'
                            ? 'bg-gradient-to-r from-teal-500/15 to-cyan-500/15'
                            : 'bg-gradient-to-r from-pink-500/15 to-purple-500/15'}
                `}
                style={{
                    left: `${pillStyle.left}px`,
                    width: `${pillStyle.width}px`,
                    top: '4px',
                    boxShadow: isDark
                        ? '0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
                        : '0 2px 8px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)',
                    border: isDark
                        ? '1px solid rgba(255,255,255,0.1)'
                        : '1px solid rgba(0,0,0,0.05)'
                }}
            />

            {/* Super KroniQ Button */}
            <button
                ref={buttonRef1}
                onClick={() => onModeChange('super')}
                className={`
                    relative z-10 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full 
                    text-sm font-medium whitespace-nowrap
                    transition-all duration-200 ease-out
                    ${mode === 'super'
                        ? 'text-emerald-400'
                        : (isDark ? 'text-white/40 hover:text-white/60' : 'text-gray-400 hover:text-gray-600')}
                `}
            >
                <Sparkles className={`w-4 h-4 transition-all duration-200 ${mode === 'super' ? 'text-emerald-400 scale-110' : ''}`} />
                <span>Super KroniQ</span>
            </button>

            {/* Business Button */}
            <button
                ref={buttonRef2}
                onClick={() => onModeChange('business')}
                className={`
                    relative z-10 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full 
                    text-sm font-medium whitespace-nowrap
                    transition-all duration-200 ease-out
                    ${mode === 'business'
                        ? 'text-teal-400'
                        : (isDark ? 'text-white/40 hover:text-white/60' : 'text-gray-400 hover:text-gray-600')}
                `}
            >
                <Compass className={`w-4 h-4 transition-all duration-200 ${mode === 'business' ? 'text-teal-400 scale-110' : ''}`} />
                <span>Business</span>
            </button>

            {/* Social Button */}
            <button
                ref={buttonRef3}
                onClick={() => onModeChange('social')}
                className={`
                    relative z-10 flex items-center justify-center gap-2 px-4 py-2.5 rounded-full 
                    text-sm font-medium whitespace-nowrap
                    transition-all duration-200 ease-out
                    ${mode === 'social'
                        ? 'text-pink-400'
                        : (isDark ? 'text-white/40 hover:text-white/60' : 'text-gray-400 hover:text-gray-600')}
                `}
            >
                <Share2Icon className={`w-4 h-4 transition-all duration-200 ${mode === 'social' ? 'text-pink-400 scale-110' : ''}`} />
                <span>Social</span>
            </button>
        </div>
    );
};

// Plus menu dropdown
const PlusMenuDropdown: React.FC<{
    isDark: boolean;
    onClose: () => void;
    onSelect: (action: 'attach' | 'web_search' | 'deep_research' | 'think_longer' | 'fast') => void;
}> = ({ isDark, onClose, onSelect }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    type MenuItem = { icon?: React.ReactNode; label?: string; action?: 'attach' | 'web_search' | 'deep_research' | 'think_longer' | 'fast'; divider?: boolean };

    const menuItems: MenuItem[] = [
        { icon: <img src="/icons/attach-files-icon.png" alt="" className="w-4 h-4 object-contain" style={{ filter: isDark ? 'invert(1)' : 'none' }} />, label: 'Attach Files', action: 'attach' as const },
        { divider: true },
        { icon: <img src="/icons/fast-icon.png" alt="" className="w-4 h-4 object-contain" style={{ filter: isDark ? 'invert(1)' : 'none' }} />, label: 'Fast', action: 'fast' as const },
        { icon: <img src="/icons/websearch-icon.png" alt="" className="w-4 h-4 object-contain" style={{ filter: isDark ? 'invert(1)' : 'none' }} />, label: 'Web Search', action: 'web_search' as const },
        { icon: <img src="/icons/research-icon.png" alt="" className="w-4 h-4 object-contain" style={{ filter: isDark ? 'invert(1)' : 'none' }} />, label: 'Deep Research', action: 'deep_research' as const },
        { icon: <img src="/icons/think-icon.png" alt="" className="w-4 h-4 object-contain" style={{ filter: isDark ? 'invert(1)' : 'none' }} />, label: 'Think Longer', action: 'think_longer' as const },
    ];

    return (
        <div
            ref={menuRef}
            className={`
                absolute bottom-full left-0 mb-3 w-52 rounded-2xl overflow-hidden z-50
                backdrop-blur-2xl border animate-fade-in-up
                ${isDark
                    ? 'bg-gradient-to-br from-white/10 via-white/5 to-transparent border-white/20'
                    : 'bg-gradient-to-br from-white/90 via-white/80 to-white/70 border-white/50'}
            `}
            style={{
                animationDuration: '0.3s',
                boxShadow: isDark
                    ? '0 20px 60px rgba(0,0,0,0.5), 0 8px 25px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.1), 0 0 40px rgba(16,185,129,0.1)'
                    : '0 20px 60px rgba(0,0,0,0.15), 0 8px 25px rgba(0,0,0,0.1), inset 0 1px 2px rgba(255,255,255,0.8)',
                transform: 'perspective(1000px) rotateX(2deg)',
                transformOrigin: 'bottom center'
            }}
        >
            {menuItems.map((item, i) => {
                if (item.divider && 'label' in item && item.label) {
                    return (
                        <div key={i} className={`px-3 py-1.5 text-xs font-medium uppercase tracking-wider ${isDark ? 'text-white/30' : 'text-gray-400'
                            }`}>
                            {item.label}
                        </div>
                    );
                }
                if (item.divider) {
                    return <div key={i} className={`h-px my-1 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />;
                }
                return (
                    <button
                        key={i}
                        onClick={() => {
                            if (item.action) {
                                onSelect(item.action);
                            }
                            onClose();
                        }}
                        className={`
              w-full flex items-center justify-between gap-3 px-3 py-2.5 text-sm
              transition-all duration-200
              ${isDark
                                ? 'text-white/80 hover:bg-white/10 hover:text-white'
                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}
            `}
                    >
                        <div className="flex items-center gap-3">
                            {item.icon}
                            <span>{item.label}</span>
                        </div>
                    </button>
                );
            })}
        </div>
    );
};

// Clean simple input bar - Premium Glass Design
export type InputMode = 'normal' | 'fast' | 'web_search' | 'deep_research' | 'think_longer';

const PremiumInputBar: React.FC<{
    isDark: boolean;
    isSuperMode: boolean;
    onSendMessage?: (message: string, mode?: InputMode, files?: File[]) => void
}> = ({ isDark, isSuperMode: _isSuperMode, onSendMessage }) => {
    const [inputValue, setInputValue] = useState('');
    const [showPlusMenu, setShowPlusMenu] = useState(false);
    const [activeMode, setActiveMode] = useState<InputMode>('normal');
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSend = () => {
        console.log('🚀 [PremiumInputBar] handleSend called with:', inputValue, 'mode:', activeMode, 'files:', attachedFiles.length);
        if ((inputValue.trim() || attachedFiles.length > 0) && onSendMessage) {
            onSendMessage(inputValue.trim(), activeMode, attachedFiles);
            setInputValue('');
            setActiveMode('normal'); // Reset mode after sending
            setAttachedFiles([]); // Clear attachments after sending
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleMenuSelect = (action: 'attach' | 'web_search' | 'deep_research' | 'think_longer' | 'fast') => {
        if (action === 'attach') {
            fileInputRef.current?.click();
        } else {
            // Toggle the mode if already active, otherwise set it
            setActiveMode(prev => prev === action ? 'normal' : action);
        }
    };

    const getModeLabel = () => {
        switch (activeMode) {
            case 'fast': return '⚡ Fast';
            case 'web_search': return '🌐 Web Search';
            case 'deep_research': return '🔬 Deep Research';
            case 'think_longer': return '🧠 Think Longer';
            default: return null;
        }
    };

    // Enhance prompt state
    const [isEnhancing, setIsEnhancing] = useState(false);

    const handleEnhancePrompt = async () => {
        if (!inputValue.trim() || isEnhancing) return;

        setIsEnhancing(true);
        try {
            const enhanced = await enhancePrompt(inputValue.trim());
            if (enhanced && enhanced !== inputValue.trim()) {
                setInputValue(enhanced);
            }
        } catch (error) {
            console.error('Failed to enhance prompt:', error);
        } finally {
            setIsEnhancing(false);
        }
    };

    return (
        <div className="w-full mx-auto flex flex-col gap-3" style={{ maxWidth: 'calc(100% - 24px)' }}>
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt,.csv,.json,.md"
                className="hidden"
                onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                        console.log('📎 Files selected:', files.length);
                        setAttachedFiles(prev => [...prev, ...Array.from(files)]);
                    }
                    // Reset input so same file can be selected again
                    e.target.value = '';
                }}
            />

            {/* Attached files preview - NOW VISIBLE ABOVE INPUT */}
            {attachedFiles.length > 0 && (
                <div className={`flex flex-wrap gap-2 px-4 py-3 rounded-2xl ${isDark ? 'bg-white/10 border border-white/10' : 'bg-gray-100 border border-gray-200'}`}>
                    {attachedFiles.map((file, index) => (
                        <div
                            key={`${file.name}-${index}`}
                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm ${isDark ? 'bg-white/15 text-white border border-white/20' : 'bg-white text-gray-700 border border-gray-200'}`}
                        >
                            <span className="truncate max-w-[150px] font-medium">{file.name}</span>
                            <span className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                                {(file.size / 1024).toFixed(0)}KB
                            </span>
                            <button
                                onClick={() => setAttachedFiles(prev => prev.filter((_, i) => i !== index))}
                                className={`flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-full transition-colors ${isDark ? 'hover:bg-white/20 text-white/60 hover:text-white' : 'hover:bg-gray-200 text-gray-400 hover:text-gray-600'}`}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Active mode indicator */}
            {activeMode !== 'normal' && (
                <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                    <span>{getModeLabel()}</span>
                    <button
                        onClick={() => setActiveMode('normal')}
                        className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'}`}
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Main input container - Glass pill shape */}
            <div
                className={`
                    relative flex items-center gap-2 sm:gap-3 h-12 sm:h-14 px-2 sm:px-4 rounded-full w-full
                    backdrop-blur-xl transition-all duration-300
                    ${activeMode !== 'normal'
                        ? (isDark ? 'ring-2 ring-teal-500/50' : 'ring-2 ring-teal-400/50')
                        : ''}
                    ${isDark
                        ? 'bg-white/5 border border-white/20 shadow-2xl shadow-black/30'
                        : 'bg-white/90 border border-gray-200/50 shadow-xl shadow-gray-200/50'}
                `}
            >

                {/* Plus button - Minimal */}
                <div className="relative">
                    <button
                        onClick={() => setShowPlusMenu(!showPlusMenu)}
                        className={`
                            flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center
                            transition-all duration-200
                            ${isDark
                                ? 'text-white/50 hover:text-white hover:bg-white/10'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}
                        `}
                    >
                        <Plus className="w-4 h-4" />
                    </button>

                    {showPlusMenu && (
                        <PlusMenuDropdown
                            isDark={isDark}
                            onClose={() => setShowPlusMenu(false)}
                            onSelect={handleMenuSelect}
                        />
                    )}
                </div>

                {/* Text input */}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask me anything..."
                    className={`
                        flex-1 min-w-0 bg-transparent border-none outline-none text-sm sm:text-base
                        ${isDark
                            ? 'text-white placeholder-white/40'
                            : 'text-gray-900 placeholder-gray-400'}
                    `}
                />

                {/* Enhance Prompt button - Hidden on mobile, visible on desktop */}
                <button
                    onClick={handleEnhancePrompt}
                    disabled={!inputValue.trim() || isEnhancing}
                    title="Enhance prompt with AI"
                    className={`
                        hidden sm:flex flex-shrink-0 w-8 h-8 rounded-full items-center justify-center
                        transition-all duration-200
                        ${!inputValue.trim() || isEnhancing
                            ? 'opacity-30 cursor-not-allowed'
                            : 'text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 cursor-pointer'}
                    `}
                >
                    {isEnhancing ? (
                        <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l.5 1 1 .5-1 .5-.5 1-.5-1-1-.5 1-.5.5-1z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l.5 1 1 .5-1 .5-.5 1-.5-1-1-.5 1-.5.5-1z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" />
                        </svg>
                    )}
                </button>

                {/* Send button - Clean teal */}
                <button
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    className={`
                        flex-shrink-0 w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center
                        transition-all duration-200
                        ${inputValue.trim()
                            ? 'bg-teal-500 text-white shadow-md hover:bg-teal-400 cursor-pointer'
                            : (isDark
                                ? 'bg-white/5 text-white/30 cursor-not-allowed'
                                : 'bg-gray-100 text-gray-300 cursor-not-allowed')}
                    `}
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14m-4-4l4 4-4 4" />
                    </svg>
                </button>
            </div>
        </div>
    );
};
// Main content
const MainContent: React.FC<{
    isDark: boolean;
    mode: 'super' | 'business' | 'social';
    onModeChange: (mode: 'super' | 'business' | 'social') => void;
    isInChat?: boolean;
    initialMessage?: string | null;
    projectId?: string | null;
    onStartChat?: (message: string) => void;
    onResetChat?: () => void;
}> = ({ isDark, mode, onModeChange, isInChat, initialMessage, projectId, onStartChat, onResetChat }) => {
    const isBusinessMode = mode === 'business';
    const isSocialMode = mode === 'social';

    // Handle message from PremiumInputBar
    const handleSendMessage = (message: string) => {
        console.log('🚀 [MainContent] Starting Super KroniQ chat with:', message);
        if (onStartChat) {
            onStartChat(message);
        }
    };

    // Render Social KroniQ if in social mode
    if (isSocialMode) {
        return (
            <main className={`flex-1 flex relative overflow-hidden h-full ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
                <SocialKroniq onBack={() => onModeChange('super')} />
            </main>
        );
    }

    // Render Business Panel if in business mode
    if (isBusinessMode) {
        return (
            <main className={`flex-1 flex relative overflow-hidden h-full ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
                {/* Business Panel takes full height - mode toggle is in the nav sidebar */}
                <BusinessPanel onModeChange={onModeChange} />
            </main>
        );
    }

    // Super KroniQ mode - Show chat if message sent, otherwise show landing
    if (isInChat) {
        return (
            <SuperKroniqChat
                isDark={isDark}
                initialMessage={initialMessage || undefined}
                projectId={projectId || undefined}
                onBack={() => {
                    if (onResetChat) {
                        onResetChat();
                    }
                }}
            />
        );
    }

    // Super KroniQ landing page
    return (
        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-8 relative overflow-x-hidden overflow-y-auto grid-pattern-bg">
            {/* Arc design with grid only near the glow */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                {/* Grid lines - only visible very close to the arc glow */}
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: isDark
                            ? `linear-gradient(rgba(20, 184, 166, 0.08) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(20, 184, 166, 0.08) 1px, transparent 1px)`
                            : `linear-gradient(rgba(20, 184, 166, 0.1) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(20, 184, 166, 0.1) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px',
                        maskImage: 'radial-gradient(ellipse 100% 15% at 50% 100%, black 0%, transparent 50%)',
                        WebkitMaskImage: 'radial-gradient(ellipse 100% 15% at 50% 100%, black 0%, transparent 50%)'
                    }}
                />
                {/* Subtle center glow - above the arc */}
                <div
                    className="absolute left-1/2 -translate-x-1/2 bottom-[10%]"
                    style={{
                        width: '500px',
                        height: '250px',
                        background: isDark
                            ? 'radial-gradient(ellipse at center bottom, rgba(20, 184, 166, 0.18) 0%, transparent 70%)'
                            : 'radial-gradient(ellipse at center bottom, rgba(20, 184, 166, 0.22) 0%, transparent 70%)',
                        filter: 'blur(50px)'
                    }}
                />
                {/* Glassmorphic filled arc - beautiful horizon effect */}
                <div
                    className="absolute left-1/2 bottom-0 backdrop-blur-xl"
                    style={{
                        width: '300vw',
                        height: '300vw',
                        transform: 'translateX(-50%) translateY(96%)',
                        borderRadius: '50%',
                        background: isDark
                            ? 'linear-gradient(180deg, rgba(20, 184, 166, 0.15) 0%, rgba(16, 185, 129, 0.08) 30%, rgba(6, 78, 59, 0.05) 60%, transparent 100%)'
                            : 'linear-gradient(180deg, rgba(20, 184, 166, 0.12) 0%, rgba(16, 185, 129, 0.06) 30%, rgba(209, 250, 229, 0.03) 60%, transparent 100%)',
                        border: isDark
                            ? '3px solid rgba(45, 212, 191, 0.8)'
                            : '3px solid rgba(20, 184, 166, 0.7)',
                        boxShadow: isDark
                            ? `0 0 20px 4px rgba(45, 212, 191, 0.7),
                               0 0 50px 12px rgba(45, 212, 191, 0.4),
                               0 0 100px 25px rgba(20, 184, 166, 0.2),
                               0 0 150px 50px rgba(20, 184, 166, 0.1),
                               inset 0 -50px 100px -20px rgba(45, 212, 191, 0.15),
                               inset 0 -100px 200px -40px rgba(20, 184, 166, 0.1)`
                            : `0 0 20px 4px rgba(20, 184, 166, 0.8),
                               0 0 50px 12px rgba(20, 184, 166, 0.5),
                               0 0 100px 25px rgba(20, 184, 166, 0.25),
                               0 0 150px 50px rgba(20, 184, 166, 0.15),
                               inset 0 -50px 100px -20px rgba(20, 184, 166, 0.1),
                               inset 0 -100px 200px -40px rgba(16, 185, 129, 0.08)`
                    }}
                />
            </div>





            {/* Centered content */}
            <div className="w-full px-3 sm:px-0 relative z-10 animate-fade-in-up flex flex-col items-center" style={{ maxWidth: 'min(672px, calc(100% - 24px))' }}>
                {/* Mode Toggle */}
                <div className="flex justify-center mb-8">
                    <ModeToggle isDark={isDark} mode={mode} onModeChange={onModeChange} />
                </div>

                {/* Premium Input Bar for Super KroniQ */}
                <div className="w-full" style={{ maxWidth: 'calc(100vw - 48px)', margin: '0 auto' }}>
                    <PremiumInputBar isDark={isDark} isSuperMode={true} onSendMessage={handleSendMessage} />
                </div>

                {/* Hint text */}
                <div className={`text-center mt-6 text-sm ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                    AI automatically selects the best model for your task
                </div>
            </div>
        </main>
    );
};

// App Shell
export const AppShell: React.FC = () => {
    const { currentTheme } = useTheme();
    const { currentView, navigateTo } = useNavigation();
    const { setIsSuperMode } = useStudioMode();
    const isDark = currentTheme === 'cosmic-dark';
    const [mode, setMode] = useState<'super' | 'business' | 'social'>('super');

    // Mobile sidebar toggle state
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    // Desktop sidebar collapsed state
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Lifted chat state for Super KroniQ - allows Sidebar to reset it
    const [isInSuperChat, setIsInSuperChat] = useState(false);
    const [superChatInitialMessage, setSuperChatInitialMessage] = useState<string | null>(null);
    const [superChatProjectId, setSuperChatProjectId] = useState<string | null>(null);

    // Onboarding modal state - show for new users
    const [showOnboarding, setShowOnboarding] = useState(false);

    // Check if user has completed onboarding on mount
    useEffect(() => {
        const hasCompletedOnboarding = localStorage.getItem('kroniq_onboarding_complete');
        if (!hasCompletedOnboarding) {
            // Small delay to not show immediately
            const timer = setTimeout(() => {
                setShowOnboarding(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    // Sync mode toggle with context for MainChat access
    const handleModeChange = (newMode: 'super' | 'business' | 'social') => {
        setMode(newMode);
        setIsSuperMode(newMode === 'super');
        // Collapse sidebar when entering Business mode
        if (newMode === 'business') {
            setIsSidebarCollapsed(true);
        }
    };

    // Start new chat - called from Sidebar or input bar
    const handleStartSuperChat = (message: string) => {
        console.log('🚀 [AppShell] Starting Super KroniQ chat with:', message);
        setSuperChatProjectId(null); // New chat, no existing project
        setSuperChatInitialMessage(message);
        setIsInSuperChat(true);
    };

    // Reset chat - called from Sidebar "New Chat" button
    const handleResetSuperChat = () => {
        console.log('🔄 [AppShell] Resetting Super KroniQ chat');
        setIsInSuperChat(false);
        setSuperChatInitialMessage(null);
        setSuperChatProjectId(null);
    };

    // Open existing project - called from Sidebar when clicking a chat
    const handleOpenProject = (projectId: string) => {
        console.log('📂 [AppShell] Opening project:', projectId);
        setSuperChatProjectId(projectId);
        setSuperChatInitialMessage(null); // No initial message, will load from project
        setIsInSuperChat(true);
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: animationStyles }} />

            <div
                className="h-screen w-screen overflow-hidden transition-colors duration-500"
                style={{ backgroundColor: isDark ? '#0a0a0a' : '#f9fafb' }}
            >
                <GridBackground isDark={isDark} />

                {/* Mobile Header with Hamburger Menu */}
                <div className={`
                    md:hidden fixed top-0 left-0 right-0 z-40 h-14
                    flex items-center justify-between px-4
                    backdrop-blur-xl
                    ${isDark ? 'bg-[#0a0a0a]/90 border-b border-white/5' : 'bg-white/90 border-b border-gray-100'}
                `}>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-white/70' : 'hover:bg-gray-100 text-gray-600'}`}
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <img
                        src={isDark ? '/kroniq-logo-white.png' : '/kroniq-logo-light.png'}
                        alt="KroniQ AI"
                        className={`object-contain ${isDark ? 'h-16' : 'h-24'}`}
                    />
                    <div className="w-10" /> {/* Spacer for centering logo */}
                </div>

                <div className="relative z-10 h-full flex flex-col pt-14 md:pt-0">
                    <div className="flex-1 flex overflow-hidden">
                        {/* Sidebar expand button when collapsed on desktop */}
                        {isSidebarCollapsed && (
                            <button
                                onClick={() => setIsSidebarCollapsed(false)}
                                className={`hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 z-50
                                    w-6 h-20 items-center justify-center
                                    rounded-r-xl backdrop-blur-sm
                                    animate-slide-in-right
                                    ${isDark
                                        ? 'bg-white/10 hover:bg-emerald-500/20 text-white/70 hover:text-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20'
                                        : 'bg-gray-100 hover:bg-emerald-50 text-gray-500 hover:text-emerald-600 hover:shadow-lg'}
                                `}
                                style={{
                                    transition: 'all 0.3s cubic-bezier(0.32, 0.72, 0, 1)'
                                }}
                                title="Expand sidebar"
                            >
                                <PanelLeft className="w-4 h-4" />
                            </button>
                        )}
                        <Sidebar
                            isDark={isDark}
                            onNewChat={handleResetSuperChat}
                            onOpenProject={handleOpenProject}
                            isMobileOpen={isSidebarOpen}
                            onMobileClose={() => {
                                setIsSidebarOpen(false);
                                setIsSidebarCollapsed(true);
                            }}
                            isCollapsed={isSidebarCollapsed}
                        />
                        <div
                            className="flex-1 flex flex-col"
                            style={{
                                transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)'
                            }}
                        >
                            <MainContent
                                isDark={isDark}
                                mode={mode}
                                onModeChange={handleModeChange}
                                isInChat={isInSuperChat}
                                initialMessage={superChatInitialMessage}
                                projectId={superChatProjectId}
                                onStartChat={handleStartSuperChat}
                                onResetChat={handleResetSuperChat}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile Popup Overlay */}
            {currentView === 'profile' && (
                <ProfilePage onClose={() => navigateTo('chat')} />
            )}

            {/* Settings Popup Overlay */}
            {currentView === 'settings' && (
                <SettingsView />
            )}

            {/* Onboarding Modal for New Users */}
            {showOnboarding && (
                <OnboardingModal
                    onClose={() => setShowOnboarding(false)}
                    onComplete={() => setShowOnboarding(false)}
                />
            )}
        </>
    );
};

export default AppShell;
