import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { NavigationProvider, useNavigation } from './contexts/NavigationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { StudioModeProvider } from './contexts/StudioModeContext';
import { BusinessContextProvider } from './contexts/BusinessContext';
import { FontProvider } from './contexts/FontContext';
import { CookieConsent } from './components/Common/CookieConsent';
import { ErrorBoundary } from './components/Common/ErrorBoundary';
import { HelmetProvider } from 'react-helmet-async';

// Lazy load heavy components for better code splitting
const LandingContent = lazy(() => import('./components/Landing/LandingRouter').then(m => ({ default: m.LandingContent })));
const LoginPage = lazy(() => import('./components/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const AppShell = lazy(() => import('./components/Layout/AppShell').then(m => ({ default: m.AppShell })));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen bg-[#0a0e27] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-3 border-[#00FFF0]/20 border-t-[#00FFF0] rounded-full animate-spin" />
      <p className="text-white/60 text-sm">Loading...</p>
    </div>
  </div>
);

// URL sync component for authenticated users
const UrlSync: React.FC = () => {
  const location = useLocation();
  const { navigateTo, setActiveProject, activeProject } = useNavigation();

  useEffect(() => {
    const path = location.pathname;

    // Parse /chat/:projectId
    const chatMatch = path.match(/^\/chat\/([^/]+)$/);
    if (chatMatch) {
      const projectId = chatMatch[1];
      // Only update if different from current
      if (!activeProject || activeProject.id !== projectId) {
        // Load project info from localStorage or trigger load
        const saved = localStorage.getItem('kroniq_active_project');
        if (saved) {
          const project = JSON.parse(saved);
          if (project.id === projectId) {
            setActiveProject(project);
          }
        }
      }
    }
  }, [location.pathname, activeProject, setActiveProject]);

  return null;
};

const MainApp: React.FC = () => {
  const { currentUser } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Check if we're on a landing page route
  const isLandingRoute = ['/', '/about', '/features', '/pricing', '/contact', '/services', '/careers', '/docs', '/privacy', '/terms', '/cookies', '/security', '/promo'].includes(location.pathname);

  // Show public landing page for non-authenticated users
  if (!currentUser) {
    if (showLogin) {
      return (
        <Suspense fallback={<LoadingFallback />}>
          <LoginPage />
        </Suspense>
      );
    }
    // For non-authenticated users, show landing pages
    return (
      <Suspense fallback={<LoadingFallback />}>
        <LandingContent onGetStarted={() => setShowLogin(true)} />
      </Suspense>
    );
  }

  // Authenticated users - redirect from landing routes to app
  if (isLandingRoute && location.pathname !== '/') {
    // Stay on app, URL will be handled by NavigationContext
  }

  // Authenticated users see the app shell
  return (
    <Suspense fallback={<LoadingFallback />}>
      <UrlSync />
      <AppShell />
    </Suspense>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <BrowserRouter>
          <ThemeProvider>
            <AuthProvider>
              <ToastProvider>
                <NavigationProvider>
                  <StudioModeProvider>
                    <BusinessContextProvider>
                      <FontProvider>
                        <MainApp />
                        <CookieConsent />
                      </FontProvider>
                    </BusinessContextProvider>
                  </StudioModeProvider>
                </NavigationProvider>
              </ToastProvider>
            </AuthProvider>
          </ThemeProvider>
        </BrowserRouter>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;

