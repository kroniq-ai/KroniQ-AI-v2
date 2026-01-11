/**
 * SettingsPage - Agent & System Settings
 * Trust Kill-Switch, AI behavior controls, data & privacy
 * Premium green glowing design
 */

import React, { useState } from 'react';
import {
    Settings,
    Power,
    AlertTriangle,
    Shield,
    Bell,
    Brain,
    Database,
    Download,
    Trash2,
    RefreshCw,
    Sliders,
    CheckCircle,
    X,
    Zap,
    MessageSquare,
    Calendar,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ExternalLink,
    ChevronRight,
    Sparkles,
    Volume2,
    VolumeX
} from 'lucide-react';
import type { AgentType } from '../../../lib/agents/types';

interface SettingsPageProps {
    isDark: boolean;
    agentType?: AgentType;
}

// ===== TOGGLE SWITCH =====
const Toggle: React.FC<{
    enabled: boolean;
    onChange: (value: boolean) => void;
    isDark: boolean;
}> = ({ enabled, onChange, isDark }) => (
    <button
        onClick={() => onChange(!enabled)}
        className={`
            relative w-12 h-6 rounded-full transition-all duration-300
            ${enabled
                ? 'bg-emerald-500'
                : (isDark ? 'bg-white/10' : 'bg-gray-200')
            }
        `}
        style={{ boxShadow: enabled && isDark ? '0 0 15px rgba(16, 185, 129, 0.4)' : 'none' }}
    >
        <div className={`
            absolute top-1 w-4 h-4 rounded-full transition-all duration-300 bg-white
            ${enabled ? 'left-7' : 'left-1'}
        `} />
    </button>
);

// ===== SETTING ROW =====
const SettingRow: React.FC<{
    isDark: boolean;
    icon: React.ElementType;
    title: string;
    description: string;
    children: React.ReactNode;
}> = ({ isDark, icon: Icon, title, description, children }) => (
    <div className={`flex items-center justify-between py-4 border-b ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
        <div className="flex items-start gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-emerald-500/10' : 'bg-gray-100'}`}>
                <Icon className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>
            <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</p>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>{description}</p>
            </div>
        </div>
        {children}
    </div>
);

// ===== SECTION =====
const SettingSection: React.FC<{
    isDark: boolean;
    title: string;
    children: React.ReactNode;
}> = ({ isDark, title, children }) => (
    <div className={`p-5 rounded-2xl border mb-6 ${isDark ? 'bg-[#0d0d0d] border-emerald-500/10' : 'bg-white border-gray-100'}`}>
        <h3 className={`text-sm font-semibold mb-4 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>{title}</h3>
        <div>{children}</div>
    </div>
);

// ===== TRUST KILL-SWITCH =====
const TrustKillSwitch: React.FC<{
    isDark: boolean;
    isPaused: boolean;
    onToggle: () => void;
}> = ({ isDark, isPaused, onToggle }) => {
    const [showConfirm, setShowConfirm] = useState(false);

    const handleToggle = () => {
        if (!isPaused) {
            setShowConfirm(true);
        } else {
            onToggle();
        }
    };

    const confirmPause = () => {
        onToggle();
        setShowConfirm(false);
    };

    return (
        <div className={`
            relative p-6 rounded-2xl border overflow-hidden mb-6
            ${isPaused
                ? (isDark ? 'bg-red-500/10 border-red-500/30' : 'bg-red-50 border-red-200')
                : (isDark ? 'bg-gradient-to-br from-emerald-500/10 to-[#0d0d0d] border-emerald-500/20' : 'bg-gradient-to-br from-emerald-50 to-white border-emerald-200')
            }
        `}
            style={{ boxShadow: isDark && !isPaused ? '0 0 30px rgba(16, 185, 129, 0.1)' : 'none' }}
        >
            {/* Glow */}
            {isDark && !isPaused && (
                <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl bg-emerald-500/20" />
            )}

            <div className="relative z-10">
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                        <div className={`
                            w-12 h-12 rounded-2xl flex items-center justify-center
                            ${isPaused
                                ? (isDark ? 'bg-red-500/20' : 'bg-red-100')
                                : (isDark ? 'bg-emerald-500/20' : 'bg-emerald-100')
                            }
                        `}>
                            <Power className={`w-6 h-6 ${isPaused ? 'text-red-400' : (isDark ? 'text-emerald-400' : 'text-emerald-600')}`} />
                        </div>
                        <div>
                            <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {isPaused ? 'Automations Paused' : 'Emergency Pause'}
                            </h3>
                            <p className={`text-sm ${isPaused ? (isDark ? 'text-red-400/70' : 'text-red-600') : (isDark ? 'text-white/50' : 'text-gray-500')}`}>
                                {isPaused
                                    ? 'All KroniQ automations are currently stopped'
                                    : 'One-click pause all AI actions & automations'
                                }
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleToggle}
                        className={`
                            px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2
                            transition-all duration-300
                            ${isPaused
                                ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                                : (isDark ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-red-100 text-red-600 hover:bg-red-200')
                            }
                        `}
                    >
                        {isPaused ? (
                            <>
                                <CheckCircle className="w-4 h-4" /> Resume
                            </>
                        ) : (
                            <>
                                <Power className="w-4 h-4" /> Pause All
                            </>
                        )}
                    </button>
                </div>

                {/* Status Info */}
                {isPaused && (
                    <div className={`mt-4 p-4 rounded-xl ${isDark ? 'bg-red-500/10' : 'bg-red-100/50'}`}>
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className={`text-sm font-medium mb-2 ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                                    The following are paused:
                                </p>
                                <ul className={`text-xs space-y-1 ${isDark ? 'text-red-400/70' : 'text-red-600'}`}>
                                    <li>• Scheduled tasks & reminders</li>
                                    <li>• AI-initiated messages & emails</li>
                                    <li>• Proactive suggestions & alerts</li>
                                    <li>• Customer health monitoring</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
                    <div className={`relative w-full max-w-sm p-6 rounded-3xl ${isDark ? 'bg-[#0c0c0c]' : 'bg-white'}`}
                        style={{ boxShadow: isDark ? '0 0 60px rgba(239, 68, 68, 0.15)' : '0 25px 80px rgba(0,0,0,0.2)' }}>

                        <div className="text-center mb-6">
                            <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${isDark ? 'bg-red-500/20' : 'bg-red-100'}`}>
                                <Power className="w-8 h-8 text-red-400" />
                            </div>
                            <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                Pause All Automations?
                            </h3>
                            <p className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                                This will stop all AI actions immediately. You can resume at any time.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className={`py-3 rounded-xl text-sm font-medium ${isDark ? 'bg-white/5 text-white/50' : 'bg-gray-100 text-gray-500'}`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmPause}
                                className="py-3 rounded-xl text-sm font-semibold bg-red-500 text-white hover:bg-red-400"
                            >
                                Yes, Pause
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ===== MAIN COMPONENT =====
export const SettingsPage: React.FC<SettingsPageProps> = ({ isDark, agentType }) => {
    const [isPaused, setIsPaused] = useState(false);
    const [aiSettings, setAiSettings] = useState({
        proactiveSuggestions: true,
        autoSendEmails: false,
        scheduleTasks: true,
        notifications: true,
        soundEffects: false,
        verbosity: 50
    });

    return (
        <div className="flex-1 overflow-y-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Settings className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                        <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-emerald-500/60' : 'text-emerald-600/80'}`}>
                            {agentType ? `${agentType} • ` : ''}Settings
                        </span>
                    </div>
                    <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                        style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                        Agent Settings
                    </h1>
                </div>
            </div>

            {/* Trust Kill-Switch */}
            <TrustKillSwitch
                isDark={isDark}
                isPaused={isPaused}
                onToggle={() => setIsPaused(!isPaused)}
            />

            {/* AI Behavior */}
            <SettingSection isDark={isDark} title="AI Behavior">
                <SettingRow
                    isDark={isDark}
                    icon={Sparkles}
                    title="Proactive Suggestions"
                    description="AI offers suggestions without being asked"
                >
                    <Toggle
                        enabled={aiSettings.proactiveSuggestions}
                        onChange={(v) => setAiSettings(s => ({ ...s, proactiveSuggestions: v }))}
                        isDark={isDark}
                    />
                </SettingRow>

                <SettingRow
                    isDark={isDark}
                    icon={Mail}
                    title="Auto-send Emails"
                    description="AI can send emails on your behalf"
                >
                    <Toggle
                        enabled={aiSettings.autoSendEmails}
                        onChange={(v) => setAiSettings(s => ({ ...s, autoSendEmails: v }))}
                        isDark={isDark}
                    />
                </SettingRow>

                <SettingRow
                    isDark={isDark}
                    icon={Calendar}
                    title="Schedule Tasks"
                    description="AI can create and schedule tasks"
                >
                    <Toggle
                        enabled={aiSettings.scheduleTasks}
                        onChange={(v) => setAiSettings(s => ({ ...s, scheduleTasks: v }))}
                        isDark={isDark}
                    />
                </SettingRow>

                <div className="pt-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-500/10' : 'bg-gray-100'}`}>
                                <Sliders className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                            </div>
                            <div>
                                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Response Verbosity</p>
                                <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                                    {aiSettings.verbosity < 30 ? 'Concise' : aiSettings.verbosity > 70 ? 'Detailed' : 'Balanced'}
                                </p>
                            </div>
                        </div>
                        <span className={`text-sm font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                            {aiSettings.verbosity}%
                        </span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={aiSettings.verbosity}
                        onChange={(e) => setAiSettings(s => ({ ...s, verbosity: Number(e.target.value) }))}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer"
                        style={{
                            background: isDark
                                ? `linear-gradient(to right, #10B981 0%, #10B981 ${aiSettings.verbosity}%, rgba(255,255,255,0.1) ${aiSettings.verbosity}%, rgba(255,255,255,0.1) 100%)`
                                : `linear-gradient(to right, #10B981 0%, #10B981 ${aiSettings.verbosity}%, #E5E7EB ${aiSettings.verbosity}%, #E5E7EB 100%)`
                        }}
                    />
                </div>
            </SettingSection>

            {/* Notifications */}
            <SettingSection isDark={isDark} title="Notifications">
                <SettingRow
                    isDark={isDark}
                    icon={Bell}
                    title="Push Notifications"
                    description="Get notified about important updates"
                >
                    <Toggle
                        enabled={aiSettings.notifications}
                        onChange={(v) => setAiSettings(s => ({ ...s, notifications: v }))}
                        isDark={isDark}
                    />
                </SettingRow>

                <SettingRow
                    isDark={isDark}
                    icon={aiSettings.soundEffects ? Volume2 : VolumeX}
                    title="Sound Effects"
                    description="Play sounds for AI responses"
                >
                    <Toggle
                        enabled={aiSettings.soundEffects}
                        onChange={(v) => setAiSettings(s => ({ ...s, soundEffects: v }))}
                        isDark={isDark}
                    />
                </SettingRow>
            </SettingSection>

            {/* Data & Privacy */}
            <SettingSection isDark={isDark} title="Data & Privacy">
                <div className="space-y-3">
                    <button className={`
                        w-full flex items-center justify-between p-4 rounded-xl border
                        ${isDark ? 'border-white/5 hover:border-emerald-500/30 hover:bg-white/[0.02]' : 'border-gray-100 hover:border-emerald-200 hover:bg-gray-50'}
                    `}>
                        <div className="flex items-center gap-3">
                            <Download className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                            <span className={isDark ? 'text-white' : 'text-gray-900'}>Export All Data</span>
                        </div>
                        <ChevronRight className={`w-4 h-4 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
                    </button>

                    <button className={`
                        w-full flex items-center justify-between p-4 rounded-xl border
                        ${isDark ? 'border-white/5 hover:border-emerald-500/30 hover:bg-white/[0.02]' : 'border-gray-100 hover:border-emerald-200 hover:bg-gray-50'}
                    `}>
                        <div className="flex items-center gap-3">
                            <RefreshCw className={`w-4 h-4 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                            <span className={isDark ? 'text-white' : 'text-gray-900'}>Reset Agent Memory</span>
                        </div>
                        <ChevronRight className={`w-4 h-4 ${isDark ? 'text-white/30' : 'text-gray-400'}`} />
                    </button>

                    <button className={`
                        w-full flex items-center justify-between p-4 rounded-xl border
                        ${isDark ? 'border-red-500/20 hover:border-red-500/40 hover:bg-red-500/5' : 'border-red-200 hover:border-red-300 hover:bg-red-50'}
                    `}>
                        <div className="flex items-center gap-3">
                            <Trash2 className="w-4 h-4 text-red-400" />
                            <span className="text-red-400">Delete Workspace</span>
                        </div>
                        <ChevronRight className={`w-4 h-4 ${isDark ? 'text-red-400/50' : 'text-red-400'}`} />
                    </button>
                </div>
            </SettingSection>

            {/* Integrations */}
            <SettingSection isDark={isDark} title="Integrations">
                <div className="grid grid-cols-2 gap-3">
                    {[
                        { name: 'Stripe', connected: false },
                        { name: 'Slack', connected: true },
                        { name: 'Google Calendar', connected: true },
                        { name: 'GitHub', connected: false },
                    ].map(integration => (
                        <button
                            key={integration.name}
                            className={`
                                p-4 rounded-xl border flex items-center justify-between
                                ${isDark
                                    ? 'border-white/5 hover:border-emerald-500/30'
                                    : 'border-gray-100 hover:border-emerald-200'
                                }
                            `}
                        >
                            <span className={isDark ? 'text-white' : 'text-gray-900'}>{integration.name}</span>
                            <span className={`text-xs font-medium ${integration.connected
                                    ? (isDark ? 'text-emerald-400' : 'text-emerald-600')
                                    : (isDark ? 'text-white/30' : 'text-gray-400')
                                }`}>
                                {integration.connected ? 'Connected' : 'Connect'}
                            </span>
                        </button>
                    ))}
                </div>
            </SettingSection>
        </div>
    );
};

export default SettingsPage;
