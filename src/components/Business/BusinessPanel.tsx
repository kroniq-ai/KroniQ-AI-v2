/**
 * Business Panel - AI COO Operating System
 * The main container for the full Business Operating System
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useBusinessContext } from '../../contexts/BusinessContext';

// Navigation & Command Bar
import { BusinessNav, type BusinessPage } from './BusinessNav';
import { BusinessCommandBar } from './BusinessCommandBar';

// Pages
import { OverviewPage } from './pages/OverviewPage';
import { GoalsPage } from './pages/GoalsPage';
import { TasksPage } from './pages/TasksPage';
import {
    AssetsPage,
    DecisionsPage,
    AnalyticsPage,
    CompetitorsPage,
    MarketPage,
    ReportsPage,
    UpdatesPage,
    ContextPage,
    TeamPage
} from './pages/PlaceholderPages';

// Legacy components for context form
import { BusinessContextForm } from './BusinessContextForm';

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

// ===== MAIN BUSINESS PANEL =====

export const BusinessPanel: React.FC = () => {
    const { currentTheme } = useTheme();
    const { activeContext, isLoading } = useBusinessContext();
    const isDark = currentTheme === 'cosmic-dark';

    // Page navigation state
    const [activePage, setActivePage] = useState<BusinessPage>('overview');
    const [isProcessingCommand, setIsProcessingCommand] = useState(false);
    const [showContextForm, setShowContextForm] = useState(false);

    // Handle AI command from command bar
    const handleCommand = async (command: string) => {
        console.log('🤖 [BusinessPanel] AI Command:', command, 'on page:', activePage);
        setIsProcessingCommand(true);

        // Simulate AI processing
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsProcessingCommand(false);
        // TODO: Integrate with actual AI service
    };

    // Render active page
    const renderPage = () => {
        const pageProps = { isDark, contextName: activeContext?.name };

        switch (activePage) {
            case 'overview':
                return <OverviewPage {...pageProps} />;
            case 'goals':
                return <GoalsPage isDark={isDark} />;
            case 'tasks':
                return <TasksPage isDark={isDark} />;
            case 'assets':
                return <AssetsPage isDark={isDark} />;
            case 'decisions':
                return <DecisionsPage isDark={isDark} />;
            case 'analytics':
                return <AnalyticsPage isDark={isDark} />;
            case 'competitors':
                return <CompetitorsPage isDark={isDark} />;
            case 'market':
                return <MarketPage isDark={isDark} />;
            case 'reports':
                return <ReportsPage isDark={isDark} />;
            case 'updates':
                return <UpdatesPage isDark={isDark} />;
            case 'context':
                return <ContextPage isDark={isDark} />;
            case 'team':
                return <TeamPage isDark={isDark} />;
            default:
                return <OverviewPage {...pageProps} />;
        }
    };

    // Show loading
    if (isLoading) {
        return <LoadingState isDark={isDark} />;
    }

    return (
        <div className={`flex-1 flex h-full ${isDark ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
            {/* Left Navigation Sidebar */}
            <BusinessNav
                isDark={isDark}
                activePage={activePage}
                onPageChange={setActivePage}
                contextName={activeContext?.name}
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

            {/* Context Form Modal */}
            {showContextForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className={`
                        max-w-xl w-full max-h-[90vh] overflow-y-auto rounded-2xl
                        ${isDark ? 'bg-[#0d0d0d]' : 'bg-white'}
                    `}>
                        <BusinessContextForm
                            isDark={isDark}
                            onClose={() => setShowContextForm(false)}
                            onSuccess={() => setShowContextForm(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessPanel;
