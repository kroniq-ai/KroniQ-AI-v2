import React, { useState, useEffect } from 'react';
import { Cookie, X, Shield, Check } from 'lucide-react';

export const CookieConsent: React.FC = () => {
  const [show, setShow] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      setTimeout(() => {
        setShow(true);
        setIsAnimating(true);
      }, 2000);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    setIsAnimating(false);
    setTimeout(() => setShow(false), 300);
  };

  const declineCookies = () => {
    localStorage.setItem('cookie_consent', 'declined');
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    setIsAnimating(false);
    setTimeout(() => setShow(false), 300);
  };

  if (!show) return null;

  return (
    <div
      className={`fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:max-w-md z-50 transition-all duration-500 ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
    >
      {/* Glowing background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 rounded-2xl blur-xl animate-pulse" />

      {/* Main container */}
      <div
        className="relative bg-[#0a0f12]/95 backdrop-blur-xl rounded-2xl p-6 border border-emerald-500/30 shadow-2xl overflow-hidden"
        style={{
          boxShadow: '0 0 40px rgba(16, 185, 129, 0.15), 0 0 80px rgba(20, 184, 166, 0.1), inset 0 0 60px rgba(16, 185, 129, 0.03)',
        }}
      >
        {/* Top glowing line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />

        {/* Animated corner accents */}
        <div className="absolute top-0 left-0 w-12 h-12 border-l-2 border-t-2 border-emerald-500/50 rounded-tl-2xl" />
        <div className="absolute bottom-0 right-0 w-12 h-12 border-r-2 border-b-2 border-teal-500/50 rounded-br-2xl" />

        {/* Content */}
        <div className="flex items-start gap-4 relative z-10">
          {/* Icon with glow */}
          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-emerald-500/30 rounded-xl blur-lg animate-pulse" />
            <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg"
              style={{
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.5), 0 4px 15px rgba(16, 185, 129, 0.3)',
              }}
            >
              <Cookie className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
              <span>Cookie Preferences</span>
              <Shield className="w-4 h-4 text-emerald-400" />
            </h3>
            <p className="text-white/60 text-sm mb-5 leading-relaxed">
              We use cookies to enhance your experience, analyze site traffic, and personalize content. Your privacy matters to us.
            </p>

            {/* Buttons with enhanced styling */}
            <div className="flex gap-3">
              <button
                onClick={acceptCookies}
                className="group relative px-6 py-3 rounded-xl font-semibold text-white text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%)',
                  boxShadow: '0 0 20px rgba(16, 185, 129, 0.4), 0 4px 15px rgba(16, 185, 129, 0.3)',
                }}
              >
                {/* Shine effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                <span className="relative flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Accept All
                </span>
              </button>

              <button
                onClick={declineCookies}
                className="group px-6 py-3 rounded-xl font-semibold text-white/80 hover:text-white text-sm transition-all duration-300 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/40"
              >
                <span className="relative flex items-center gap-2">
                  <X className="w-4 h-4" />
                  Decline
                </span>
              </button>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={() => {
              setIsAnimating(false);
              setTimeout(() => setShow(false), 300);
            }}
            className="text-white/40 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Privacy link */}
        <div className="mt-4 pt-4 border-t border-white/5">
          <a
            href="/privacy"
            className="text-emerald-400/70 hover:text-emerald-400 text-xs transition-colors flex items-center gap-1"
          >
            <Shield className="w-3 h-3" />
            Learn more about our Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
};
