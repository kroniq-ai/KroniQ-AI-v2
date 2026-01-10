/**
 * Business Panel - AI COO Operating System
 * The main container for the full Business Operating System (Simplified)
 */

import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useBusinessContext } from '../../contexts/BusinessContext';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft, Sparkles, Construction, Plus, Settings } from 'lucide-react';

// Navigation & Command Bar
import { BusinessNav, type BusinessPage } from './BusinessNav';
import { BusinessCommandBar } from './BusinessCommandBar';
import { BusinessOnboarding } from './BusinessOnboarding';

// Pages (Simplified - 6 Core Pages Only)
import { OverviewPage } from './pages/OverviewPage';
import { GoalsPage } from './pages/GoalsPage';
import { TasksPage } from './pages/TasksPage';
import { DecisionsPage } from './pages/PlaceholderPages';
import { RunwayPage } from './pages/RunwayPage';

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

// ===== COMING SOON STATE =====

const ComingSoonState: React.FC<{ isDark: boolean; onBack?: () => void }> = ({ isDark, onBack }) => (
    <div className={`flex-1 flex items-center justify-center ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
        <div className="max-w-md text-center px-6">
            <div className={`
                w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center
                ${isDark ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/10' : 'bg-emerald-50'}
            `}>
                <Construction className={`w-8 h-8 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>
            <h1 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Business OS Coming Soon
            </h1>
            <p className={`text-sm mb-6 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                We're building something powerful. The AI COO that understands your business
                better than you do. Early access coming to founders soon.
            </p>
            <div className={`
                inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm
                ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}
            `}>
                <Sparkles className="w-4 h-4" />
                Join the waitlist for early access
            </div>
            {onBack && (
                <button
                    onClick={onBack}
                    className={`
                        flex items-center gap-2 mx-auto mt-6 text-sm
                        ${isDark ? 'text-white/50 hover:text-white' : 'text-gray-500 hover:text-gray-700'}
                    `}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Super KroniQ
                </button>
            )}
        </div>
    </div>
);

// ===== MAIN BUSINESS PANEL =====

interface BusinessPanelProps {
    onModeChange?: (mode: 'super' | 'business') => void;
}

export const BusinessPanel: React.FC<BusinessPanelProps> = ({ onModeChange }) => {
    const { currentTheme } = useTheme();
    const { user } = useAuth();
    const { activeContext, isLoading } = useBusinessContext();
    const isDark = currentTheme === 'cosmic-dark';

    // Check if user is admin
    const isAdmin = user?.email === ADMIN_EMAIL;

    // Page navigation state
    const [activePage, setActivePage] = useState<BusinessPage>('overview');
    const [isProcessingCommand, setIsProcessingCommand] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);

    // Handle AI command from command bar
    const handleCommand = async (command: string) => {
        console.log('🤖 [BusinessPanel] AI Command:', command, 'on page:', activePage);
        setIsProcessingCommand(true);

        // Simulate AI processing
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsProcessingCommand(false);
        // TODO: Integrate with actual AI service
    };

    // Handle back to Super KroniQ
    const handleBack = () => {
        if (onModeChange) {
            onModeChange('super');
        }
    };

    // Render active page (6 Core Pages Only)
    const renderPage = () => {
        const pageProps = { isDark, contextName: activeContext?.name };

        switch (activePage) {
            case 'overview':
                return <OverviewPage {...pageProps} />;
            case 'goals':
                return <GoalsPage isDark={isDark} />;
            case 'tasks':
                return <TasksPage isDark={isDark} />;
            case 'decisions':
                return <DecisionsPage isDark={isDark} />;
            case 'runway':
                return <RunwayPage isDark={isDark} />;
            case 'settings':
                return <SettingsPlaceholder isDark={isDark} />;
            default:
                return <OverviewPage {...pageProps} />;
        }
    };

    // Simple settings placeholder
    const SettingsPlaceholder: React.FC<{ isDark: boolean }> = ({ isDark }) => (
        <div className={`flex-1 flex items-center justify-center ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
            <div className="max-w-md text-center px-6">
                <div className={`
                    w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center
                    ${isDark ? 'bg-emerald-500/10' : 'bg-emerald-50'}
                `}>
                    <Settings className={`w-8 h-8 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                </div>
                <h1 className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    Settings
                </h1>
                <p className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                    Business context configuration coming soon.
                </p>
            </div>
        </div>
    );

    // Show loading
    if (isLoading) {
        return <LoadingState isDark={isDark} />;
    }

    // Show Coming Soon for non-admin users
    if (!isAdmin) {
        return <ComingSoonState isDark={isDark} onBack={handleBack} />;
    }

    // Show onboarding if no context exists
    const needsOnboarding = !activeContext;

    // Empty state when no context
    const NoContextState = () => (
        <div className={`flex-1 flex items-center justify-center ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
            <div className="max-w-md text-center px-6">
                <div
                    className={`
                        w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center
                        ${isDark ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10' : 'bg-emerald-50'}
                    `}
                    style={{ boxShadow: isDark ? '0 0 30px rgba(16, 185, 129, 0.2)' : 'none' }}
                >
                    <Sparkles className={`w-8 h-8 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                </div>
                <h1
                    className={`text-2xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                >
                    Welcome to Business OS
                </h1>
                <p className={`text-sm mb-6 ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                    Set up your business context to get started with your AI COO.
                </p>
                <button
                    onClick={() => setShowOnboarding(true)}
                    className={`
                        inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold
                        bg-emerald-500 text-white hover:bg-emerald-400
                        transition-all duration-200
                    `}
                    style={{
                        fontFamily: 'Inter, system-ui, sans-serif',
                        boxShadow: isDark ? '0 0 20px rgba(16, 185, 129, 0.3)' : '0 4px 12px rgba(16, 185, 129, 0.3)'
                    }}
                >
                    <Plus className="w-4 h-4" />
                    Setup My Business
                </button>
                <button
                    onClick={handleBack}
                    className={`
                        flex items-center gap-2 mx-auto mt-4 text-sm
                        ${isDark ? 'text-white/40 hover:text-white/60' : 'text-gray-400 hover:text-gray-600'}
                    `}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Super KroniQ
                </button>
            </div>
        </div>
    );

    // Show no-context state if user hasn't set up a business yet
    if (needsOnboarding && !showOnboarding) {
        return (
            <>
                <NoContextState />
            </>
        );
    }

    return (
        <div className={`flex-1 flex h-full ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
            {/* Onboarding Modal */}
            {showOnboarding && (
                <BusinessOnboarding
                    isDark={isDark}
                    onComplete={() => setShowOnboarding(false)}
                    onClose={() => setShowOnboarding(false)}
                />
            )}

            {/* Left Navigation Sidebar */}
            <BusinessNav
                isDark={isDark}
                activePage={activePage}
                onPageChange={setActivePage}
                contextName={activeContext?.name}
                onBack={handleBack}
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Page Content */}
                {renderPage()}

                {/* Global AI Command Bar */}
                <BusinessCommandBar
                    isDark={isDark}
                    currentPage={activePage}
                    contextName={activeContext?.name}
                    onCommand={handleCommand}
                    isProcessing={isProcessingCommand}
                />
            </div>
        </div>
    );
};

export default BusinessPanel;

