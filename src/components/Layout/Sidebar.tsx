import React, { useState, useEffect } from 'react';
import { FolderOpen, CreditCard, Settings, LogOut, BarChart3, Sparkles, Mic, Menu, X, Presentation, User, Database } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { TokenBalanceDisplay } from '../Common/TokenBalanceDisplay';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const { signOut, userTier } = useAuth();
  const { currentTheme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const isLight = currentTheme === 'pure-white';

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMenuItemClick = (view: string) => {
    onViewChange(view);
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleSignOut = async () => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
    await signOut();
  };

  const menuItems = [
    { id: 'chat', label: 'AI Chat', icon: Sparkles },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'voice', label: 'Voice & Music Studio', icon: Mic },
    { id: 'ppt', label: 'PPT Studio', icon: Presentation },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  if (userTier === 'PREMIUM') {
    menuItems.push({ id: 'admin', label: 'Admin', icon: Database });
  }

  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={`md:hidden fixed top-4 left-4 z-50 p-3 rounded-xl backdrop-blur-xl border transition-all ${isLight
          ? 'bg-white/80 border-gray-200 text-gray-700 hover:bg-white'
          : 'bg-black/40 border-white/10 text-white hover:bg-black/60'}`}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isMobile && isMobileMenuOpen && (
        <div
          className={`fixed inset-0 backdrop-blur-sm z-40 md:hidden ${isLight ? 'bg-black/30' : 'bg-black/60'}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div
        className={`fixed left-0 top-0 h-screen backdrop-blur-xl border-r transition-all duration-300 z-50 ${isLight
          ? 'bg-white/95 border-gray-200'
          : 'bg-black/20 border-white/10'} ${isMobile
            ? `${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} w-64`
            : isExpanded ? 'w-64' : 'w-16'
          }`}
        onMouseEnter={() => !isMobile && setIsExpanded(true)}
        onMouseLeave={() => !isMobile && setIsExpanded(false)}
      >
        <div className="flex flex-col h-full">
          <div className={`p-4 border-b flex items-center gap-3 cursor-pointer ${isLight ? 'border-gray-200' : 'border-white/10'}`} onClick={() => onViewChange('chat')}>
            <img src={isLight ? "/kroniq-logo-light.png" : "/kroniq-logo-white.png"} alt="KroniQ AI Logo" width={128} height={128} className={`flex-shrink-0 object-contain transition-all ${isLight ? 'w-32 h-32' : 'w-20 h-20 drop-shadow-[0_0_20px_rgba(0,255,240,0.9)]'}`}
              onError={(e) => { (e.target as HTMLImageElement).src = '/kroniq-logo-white.png'; }} />
            {(isExpanded || isMobile) && (
              <div className="overflow-hidden">
                <p className={`font-bold text-sm whitespace-nowrap ${isLight ? 'text-gray-900' : 'text-white'}`}>KroniQ</p>
                <p className={`text-xs whitespace-nowrap ${isLight ? 'text-gray-500' : 'text-white/60'}`}>AI Studio</p>
              </div>
            )}
          </div>

          <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuItemClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative ${isActive
                    ? isLight
                      ? 'bg-emerald-100 text-emerald-800 shadow-md'
                      : 'bg-white/20 text-white shadow-lg'
                    : isLight
                      ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 active:scale-95'
                      : 'text-white/70 hover:bg-white/10 hover:text-white active:scale-95'
                    }`}
                  title={!isExpanded && !isMobile ? item.label : undefined}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'scale-110' : ''} transition-transform`} />
                  {(isExpanded || isMobile) && (
                    <span className="font-medium text-sm whitespace-nowrap">{item.label}</span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className={`p-3 border-t space-y-2 ${isLight ? 'border-gray-200' : 'border-white/10'}`}>
            {(isExpanded || isMobile) && (
              <div className="mb-2">
                <TokenBalanceDisplay
                  isExpanded={true}
                  showDetails={true}
                  onPurchaseClick={() => handleMenuItemClick('billing')}
                />
              </div>
            )}

            <button
              onClick={() => handleMenuItemClick('profile')}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all active:scale-95 ${currentView === 'profile'
                ? isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-white/20 text-white'
                : isLight ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              title={!isExpanded && !isMobile ? 'Profile' : undefined}
            >
              <User className="w-5 h-5 flex-shrink-0" />
              {(isExpanded || isMobile) && <span className="font-medium text-sm whitespace-nowrap">Profile</span>}
            </button>

            <button
              onClick={() => handleMenuItemClick('backup')}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all active:scale-95 ${currentView === 'backup'
                ? isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-white/20 text-white'
                : isLight ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              title={!isExpanded && !isMobile ? 'Backup' : undefined}
            >
              <Database className="w-5 h-5 flex-shrink-0" />
              {(isExpanded || isMobile) && <span className="font-medium text-sm whitespace-nowrap">Backup</span>}
            </button>

            <button
              onClick={() => handleMenuItemClick('settings')}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all active:scale-95 ${currentView === 'settings'
                ? isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-white/20 text-white'
                : isLight ? 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              title={!isExpanded && !isMobile ? 'Settings' : undefined}
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              {(isExpanded || isMobile) && <span className="font-medium text-sm whitespace-nowrap">Settings</span>}
            </button>

            <button
              onClick={handleSignOut}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all active:scale-95 ${isLight
                ? 'text-red-600 hover:bg-red-50'
                : 'text-red-400 hover:bg-red-500/10'}`}
              title={!isExpanded && !isMobile ? 'Sign Out' : undefined}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {(isExpanded || isMobile) && <span className="font-medium text-sm whitespace-nowrap">Sign Out</span>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
