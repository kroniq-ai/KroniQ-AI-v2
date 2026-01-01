import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';

interface LandingNavbarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onGetStarted: () => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({ currentPage, onNavigate, onGetStarted }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const container = document.querySelector('.landing-scroll-container');
      if (container) {
        setIsScrolled(container.scrollTop > 50);
      } else {
        setIsScrolled(window.scrollY > 50);
      }
    };

    const container = document.querySelector('.landing-scroll-container');
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    window.addEventListener('scroll', handleScroll);

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navLinks = [
    { id: 'features', label: 'Features', page: 'features' },
    { id: 'pricing', label: 'Pricing', page: 'pricing' },
    { id: 'about', label: 'About', page: 'about' },
    { id: 'docs', label: 'Docs', page: 'docs' },
  ];

  const handleNavClick = (link: typeof navLinks[0]) => {
    if (link.page) {
      onNavigate(link.page);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 px-4 lg:px-8 transition-all duration-500 ${isScrolled ? 'py-3' : 'py-5'}`}>
      <div className="max-w-[1200px] mx-auto">
        {/* Floating Pill Container */}
        <div className="flex items-center justify-between">

          {/* Left: Logo Pill */}
          <button
            onClick={() => onNavigate('home')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full transition-all duration-300 ${isScrolled
              ? 'bg-[#0d0d15]/80 backdrop-blur-xl border border-white/10'
              : 'bg-transparent'
              }`}
          >
            <img
              src="/kroniq-logo-white.png"
              alt="KroniQ AI Logo"
              width={64}
              height={64}
              className="h-16 w-auto object-contain"
            />
          </button>

          {/* Center: Nav Links Pill (Desktop) */}
          <div className={`hidden md:flex items-center gap-1 px-2 py-1.5 rounded-full transition-all duration-300 ${isScrolled
            ? 'bg-[#0d0d15]/80 backdrop-blur-xl border border-white/10'
            : 'bg-white/5 backdrop-blur-sm border border-white/5'
            }`}>
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => handleNavClick(link)}
                className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 ${currentPage === link.id || currentPage === link.page
                  ? 'text-white bg-white/10'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right: CTA Button Pill */}
          <div className="flex items-center gap-3">
            {/* Animated Gradient Border Button */}
            <button
              onClick={onGetStarted}
              className="group relative hidden sm:flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold text-sm text-white overflow-hidden transition-all duration-300 hover:scale-105"
            >
              {/* Animated gradient border */}
              <span
                className="absolute inset-0 rounded-full p-[2px]"
                style={{
                  background: 'linear-gradient(90deg, #14B8A6, #06B6D4, #10B981, #14B8A6)',
                  backgroundSize: '300% 100%',
                  animation: 'gradient-shift 3s ease infinite',
                }}
              >
                <span className="block w-full h-full rounded-full bg-[#0d0d15]" />
              </span>

              {/* Inner gradient fill */}
              <span
                className="absolute inset-[2px] rounded-full opacity-90"
                style={{
                  background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.3) 0%, rgba(6, 182, 212, 0.2) 50%, rgba(16, 185, 129, 0.3) 100%)',
                }}
              />

              {/* Shimmer effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

              {/* Glow effect on hover */}
              <span
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ boxShadow: '0 0 25px rgba(20, 184, 166, 0.6), 0 0 50px rgba(6, 182, 212, 0.4)' }}
              />

              <span className="relative z-10">Log In</span>
              <ArrowRight className="relative z-10 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              className={`md:hidden p-2.5 rounded-full transition-all ${isScrolled
                ? 'bg-[#0d0d15]/80 backdrop-blur-xl border border-white/10'
                : 'bg-white/5 border border-white/5'
                }`}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute left-4 right-4 top-full mt-2 animate-fade-in">
          <div className="bg-[#0d0d15]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => handleNavClick(link)}
                  className={`w-full px-4 py-3 text-left rounded-xl transition-colors ${currentPage === link.id
                    ? 'bg-white/10 text-white'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  {link.label}
                </button>
              ))}

              <button
                onClick={() => {
                  onGetStarted();
                  setIsMobileMenuOpen(false);
                }}
                className="mt-2 w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                Log In
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
