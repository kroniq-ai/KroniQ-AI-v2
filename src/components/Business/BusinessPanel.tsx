/**
 * Business Panel - Modular Agent Dashboard
 * Dashboard with agent boxes + individual agent workspaces
 */

import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useBusinessContext } from '../../contexts/BusinessContext';
import { useAuth } from '../../contexts/AuthContext';
import { SharedAgentProvider, useSharedAgentContext } from '../../contexts/SharedAgentContext';
import { ArrowLeft, Sparkles, Construction } from 'lucide-react';

// Components
import { BusinessOnboarding } from './BusinessOnboarding';
import { AgentDashboard } from './AgentDashboard';
import { AgentWorkspace } from './AgentWorkspace';

// Admin email for full access
const ADMIN_EMAIL = 'atirek.sd11@gmail.com';

// ===== LOADING STATE =====

const LoadingState: React.FC<{ isDark: boolean }> = ({ isDark }) => (
    <div className={`flex-1 flex items-center justify-center ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
        <div className="flex items-center gap-3">
            <div className={`
                w-8 h-8 border-2 rounded-full animate-spin
                ${isDark ? 'border-white/10 border-t-emerald-500' : 'border-gray-200 border-t-emerald-600'}
            `} />
            <span className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                Loading Business OS...
            </span>
        </div>
    </div>
);

// ===== MAIN CONTENT (uses SharedAgentContext) =====

interface MainContentProps {
    isDark: boolean;
    onBack: () => void;
}

const MainContent: React.FC<MainContentProps> = ({ isDark, onBack }) => {
    const { state } = useSharedAgentContext();

    // If an agent is open, show workspace
    if (state.currentAgent) {
        return <AgentWorkspace isDark={isDark} />;
    }

    // Otherwise show dashboard
    return <AgentDashboard isDark={isDark} />;
};

// ===== TOP BAR =====

interface TopBarProps {
    isDark: boolean;
    onBack: () => void;
    contextName?: string;
}

const TopBar: React.FC<TopBarProps> = ({ isDark, onBack, contextName }) => {
    const { state } = useSharedAgentContext();

    // Don't show top bar when in agent workspace (it has its own back button)
    if (state.currentAgent) {
        return null;
    }

    return (
        <div className={`
            flex items-center justify-between px-6 py-4 border-b
            ${isDark ? 'bg-[#0a0a0a] border-emerald-500/10' : 'bg-white border-gray-100'}
        `}>
            <button
                onClick={onBack}
                className={`
                    flex items-center gap-2 text-sm font-medium
                    transition-colors duration-200
                    ${isDark ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-700'}
                `}
            >
                <ArrowLeft className="w-4 h-4" />
                Back to KroniQ
            </button>

            {contextName && (
                <div className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-lg
                    ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}
                `}>
                    <Sparkles className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <span className={`text-xs font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                        {contextName}
                    </span>
                </div>
            )}
        </div>
    );
};

// ===== MAIN BUSINESS PANEL =====

interface BusinessPanelProps {
    onModeChange?: (mode: 'super' | 'business') => void;
}

export const BusinessPanel: React.FC<BusinessPanelProps> = ({ onModeChange }) => {
    const { currentTheme } = useTheme();
    const { user } = useAuth();
    const { activeContext, isLoading, contexts } = useBusinessContext();
    const isDark = currentTheme === 'cosmic-dark';

    // Check if user is admin
    const isAdmin = user?.email === ADMIN_EMAIL;

    // Onboarding state
    const [showOnboarding, setShowOnboarding] = useState(false);

    // Handle back to Super KroniQ
    const handleBack = () => {
        if (onModeChange) {
            onModeChange('super');
        }
    };

    // Show loading while checking access
    if (isLoading) {
        return (
            <div className={`flex-1 flex flex-col ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
                <LoadingState isDark={isDark} />
            </div>
        );
    }

    // Show onboarding if no context exists
    if (!activeContext && contexts.length === 0 && !showOnboarding) {
        // Auto-show onboarding for new users
        return (
            <div className={`flex-1 flex flex-col ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
                <BusinessOnboarding
                    isDark={isDark}
                    onComplete={() => setShowOnboarding(false)}
                    onClose={handleBack}
                />
            </div>
        );
    }

    // Show onboarding modal if triggered
    if (showOnboarding) {
        return (
            <div className={`flex-1 flex flex-col ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
                <BusinessOnboarding
                    isDark={isDark}
                    onComplete={() => setShowOnboarding(false)}
                    onClose={() => setShowOnboarding(false)}
                />
            </div>
        );
    }

    // Main panel with SharedAgentProvider
    return (
        <SharedAgentProvider>
            <div className={`flex-1 flex flex-col ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
                {/* Top Bar */}
                <TopBar
                    isDark={isDark}
                    onBack={handleBack}
                    contextName={activeContext?.name}
                />

                {/* Main Content */}
                <MainContent isDark={isDark} onBack={handleBack} />
            </div>
        </SharedAgentProvider>
    );
};

export default BusinessPanel;
