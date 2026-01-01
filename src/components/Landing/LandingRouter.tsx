import React, { useRef, useEffect } from 'react';
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom';
import { LandingNavbar } from './LandingNavbar';
import { FloatingElements } from './FloatingElements';
import { CosmicBackground } from '../Layout/CosmicBackground';
import { useTheme } from '../../contexts/ThemeContext';
import { LandingRoutes } from '../../routes/LandingRoutes';
import { HelmetProvider } from 'react-helmet-async';

interface LandingRouterProps {
  onGetStarted: () => void;
}

const ScrollToTop: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const container = document.querySelector('.landing-scroll-container');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname]);

  return null;
};

export const LandingContent: React.FC<LandingRouterProps> = ({ onGetStarted }) => {
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleNavigate = (page: string) => {
    const routes: Record<string, string> = {
      'home': '/',
      'about': '/about',
      'features': '/features',
      'pricing': '/pricing',
      'contact': '/contact',
      'services': '/services',
      'careers': '/careers',
      'docs': '/docs',
      'privacy': '/privacy',
      'terms': '/terms',
      'cookies': '/cookies',
      'security': '/security',
      'promo': '/promo'
    };
    navigate(routes[page] || '/');
  };

  const getCurrentPage = (): string => {
    const path = location.pathname;
    if (path === '/') return 'home';
    return path.substring(1);
  };

  return (
    <div className="h-screen w-screen overflow-hidden gradient-background">
      <CosmicBackground />
      <FloatingElements />
      <ScrollToTop />

      <div
        ref={scrollContainerRef}
        className="landing-scroll-container h-full w-full overflow-y-auto overflow-x-hidden relative z-10"
        style={{ scrollBehavior: 'smooth' }}
      >
        <LandingNavbar
          currentPage={getCurrentPage()}
          onNavigate={handleNavigate}
          onGetStarted={onGetStarted}
        />

        <div className="relative">
          <LandingRoutes onGetStarted={onGetStarted} />
        </div>
      </div>
    </div>
  );
};

export const LandingRouter: React.FC<LandingRouterProps> = ({ onGetStarted }) => {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <LandingContent onGetStarted={onGetStarted} />
      </BrowserRouter>
    </HelmetProvider>
  );
};
