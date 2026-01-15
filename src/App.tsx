import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
  const { setActiveProject, activeProject } = useNavigation();

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

// Protected Route wrapper - requires authentication
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Still loading auth state
  if (loading) {
    return <LoadingFallback />;
  }

  // Not authenticated - redirect to login
  if (!currentUser) {
    // Save the intended destination for post-login redirect
    const returnTo = location.pathname + location.search;
    return <Navigate to={`/login?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }

  return <>{children}</>;
};

// Public Route wrapper - accessible to all, but authenticated users may be redirected
const PublicRoute: React.FC<{ children: React.ReactNode; redirectIfAuth?: boolean }> = ({
  children,
  redirectIfAuth = false
}) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Still loading auth state
  if (loading) {
    return <LoadingFallback />;
  }

  // If authenticated and this route should redirect auth users
  if (currentUser && redirectIfAuth) {
    // Check for returnTo parameter
    const searchParams = new URLSearchParams(location.search);
    const returnTo = searchParams.get('returnTo');
    return <Navigate to={returnTo || '/app'} replace />;
  }

  return <>{children}</>;
};

// Main routing component
const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public landing pages */}
        <Route path="/" element={
          <PublicRoute>
            <LandingContent onGetStarted={() => window.location.href = '/login'} />
          </PublicRoute>
        } />
        <Route path="/about" element={
          <PublicRoute>
            <LandingContent onGetStarted={() => window.location.href = '/login'} />
          </PublicRoute>
        } />
        <Route path="/features" element={
          <PublicRoute>
            <LandingContent onGetStarted={() => window.location.href = '/login'} />
          </PublicRoute>
        } />
        <Route path="/pricing" element={
          <PublicRoute>
            <LandingContent onGetStarted={() => window.location.href = '/login'} />
          </PublicRoute>
        } />
        <Route path="/contact" element={
          <PublicRoute>
            <LandingContent onGetStarted={() => window.location.href = '/login'} />
          </PublicRoute>
        } />
        <Route path="/services" element={
          <PublicRoute>
            <LandingContent onGetStarted={() => window.location.href = '/login'} />
          </PublicRoute>
        } />
        <Route path="/careers" element={
          <PublicRoute>
            <LandingContent onGetStarted={() => window.location.href = '/login'} />
          </PublicRoute>
        } />
        <Route path="/docs" element={
          <PublicRoute>
            <LandingContent onGetStarted={() => window.location.href = '/login'} />
          </PublicRoute>
        } />
        <Route path="/privacy" element={
          <PublicRoute>
            <LandingContent onGetStarted={() => window.location.href = '/login'} />
          </PublicRoute>
        } />
        <Route path="/terms" element={
          <PublicRoute>
            <LandingContent onGetStarted={() => window.location.href = '/login'} />
          </PublicRoute>
        } />
        <Route path="/cookies" element={
          <PublicRoute>
            <LandingContent onGetStarted={() => window.location.href = '/login'} />
          </PublicRoute>
        } />
        <Route path="/security" element={
          <PublicRoute>
            <LandingContent onGetStarted={() => window.location.href = '/login'} />
          </PublicRoute>
        } />
        <Route path="/promo" element={
          <PublicRoute>
            <LandingContent onGetStarted={() => window.location.href = '/login'} />
          </PublicRoute>
        } />

        {/* Auth routes - redirect to app if already logged in */}
        <Route path="/login" element={
          <PublicRoute redirectIfAuth={true}>
            <LoginPage />
          </PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute redirectIfAuth={true}>
            <LoginPage />
          </PublicRoute>
        } />

        {/* Protected app routes */}
        <Route path="/app" element={
          <ProtectedRoute>
            <UrlSync />
            <AppShell />
          </ProtectedRoute>
        } />
        <Route path="/app/*" element={
          <ProtectedRoute>
            <UrlSync />
            <AppShell />
          </ProtectedRoute>
        } />
        <Route path="/chat/*" element={
          <ProtectedRoute>
            <UrlSync />
            <AppShell />
          </ProtectedRoute>
        } />
        <Route path="/studio/*" element={
          <ProtectedRoute>
            <UrlSync />
            <AppShell />
          </ProtectedRoute>
        } />

        {/* Catch-all for authenticated users - show app, for others show landing */}
        <Route path="*" element={
          <PublicRoute>
            <LandingContent onGetStarted={() => window.location.href = '/login'} />
          </PublicRoute>
        } />
      </Routes>
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
                        <AppRoutes />
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
