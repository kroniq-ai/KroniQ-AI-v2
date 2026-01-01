import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Premium Grid Background component
const GridBackground: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <div className="absolute inset-0 overflow-hidden">
    {/* Grid pattern */}
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: isDark
          ? `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
             linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`
          : `linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
             linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
      }}
    />
    {/* Radial fade for grid edges */}
    <div
      className="absolute inset-0"
      style={{
        background: isDark
          ? 'radial-gradient(ellipse at center, transparent 20%, #0a0a0a 80%)'
          : 'radial-gradient(ellipse at center, transparent 20%, #f8fafc 80%)',
      }}
    />
  </div>
);

// Theme-aware error fallback component with premium KroniQ design
const ErrorFallback: React.FC<{ error: Error | null }> = ({ error }) => {
  // Check localStorage for theme preference
  const savedTheme = typeof window !== 'undefined'
    ? localStorage.getItem('kroniq-theme')
    : null;
  const isDark = !savedTheme || savedTheme === 'cosmic-dark';

  return (
    <div className={`flex items-center justify-center min-h-screen overflow-hidden relative ${isDark ? 'bg-[#0a0a0a]' : 'bg-gradient-to-b from-slate-50 to-white'
      }`}>
      {/* Grid Background */}
      <GridBackground isDark={isDark} />

      {/* Animated glowing orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Main emerald glow */}
        <div
          className={`absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full blur-[150px] animate-pulse ${isDark ? 'bg-emerald-500/15' : 'bg-emerald-400/20'
            }`}
          style={{ animationDuration: '4s' }}
        />
        {/* Secondary teal glow */}
        <div
          className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px] animate-pulse ${isDark ? 'bg-teal-500/10' : 'bg-teal-400/15'
            }`}
          style={{ animationDelay: '1s', animationDuration: '5s' }}
        />
        {/* Accent glow left */}
        <div
          className={`absolute top-1/4 left-1/4 w-72 h-72 rounded-full blur-[100px] animate-pulse ${isDark ? 'bg-cyan-500/8' : 'bg-cyan-400/12'
            }`}
          style={{ animationDelay: '2s', animationDuration: '6s' }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-1.5 h-1.5 rounded-full ${isDark ? 'bg-emerald-400/40' : 'bg-emerald-500/30'
              }`}
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              animation: `float-particle ${5 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Main error content */}
      <div className="relative z-10 max-w-md w-full mx-4">
        {/* Glassmorphism card */}
        <div className={`backdrop-blur-2xl rounded-3xl border p-8 shadow-2xl ${isDark
          ? 'bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-transparent border-white/10 shadow-black/30'
          : 'bg-gradient-to-br from-white/80 via-white/60 to-white/40 border-white/50 shadow-gray-300/30'
          }`}
          style={{
            boxShadow: isDark
              ? '0 25px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)'
              : '0 25px 50px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)'
          }}
        >
          {/* Glowing top accent line */}
          <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

          {/* KroniQ Logo Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              {/* Glow rings */}
              <div className={`absolute inset-0 w-24 h-24 rounded-full blur-xl animate-pulse ${isDark ? 'bg-emerald-500/30' : 'bg-emerald-400/40'
                }`} />
              <div className={`absolute inset-0 w-24 h-24 rounded-full border-2 animate-ping ${isDark ? 'border-emerald-500/20' : 'border-emerald-400/30'
                }`} style={{ animationDuration: '3s' }} />
              {/* Logo container with rocket image */}
              <div className={`relative w-24 h-24 rounded-full border-2 flex items-center justify-center ${isDark
                ? 'bg-gradient-to-br from-emerald-500/20 via-teal-500/15 to-cyan-500/10 border-emerald-500/30'
                : 'bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-50 border-emerald-300'
                }`}>
                <img
                  src="/assets/super-kroniq-rocket.png"
                  alt="KroniQ"
                  className="w-14 h-14 object-contain"
                  onError={(e) => {
                    // Fallback to text logo if image fails
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = '<span class="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">K</span>';
                  }}
                />
              </div>
            </div>
          </div>

          {/* Error message */}
          <h2 className={`text-2xl font-bold text-center mb-3 ${isDark ? 'text-white' : 'text-gray-900'
            }`}>
            Oops! Something went wrong
          </h2>
          <p className={`text-center mb-6 text-sm leading-relaxed ${isDark ? 'text-white/60' : 'text-gray-600'
            }`}>
            We encountered an unexpected error. Don't worry, your progress is safe. Please refresh the page to continue.
          </p>

          {/* Error details (collapsible) */}
          {error && (
            <details className="mb-6 group">
              <summary className={`cursor-pointer text-xs transition-colors flex items-center gap-2 ${isDark ? 'text-emerald-400/60 hover:text-emerald-400' : 'text-emerald-600/70 hover:text-emerald-600'
                }`}>
                <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                View technical details
              </summary>
              <div className={`mt-3 p-3 rounded-xl border overflow-auto max-h-32 ${isDark ? 'bg-black/30 border-white/5' : 'bg-gray-100/80 border-gray-200'
                }`}>
                <code className={`text-xs font-mono break-all ${isDark ? 'text-emerald-400/80' : 'text-emerald-700'
                  }`}>
                  {error.message}
                </code>
              </div>
            </details>
          )}

          {/* Refresh button - Premium gradient */}
          <button
            onClick={() => window.location.reload()}
            className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-semibold rounded-2xl hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group"
          >
            <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh Page
          </button>

          {/* Additional actions */}
          <div className="flex items-center justify-center gap-4 mt-5">
            <button
              onClick={() => window.history.back()}
              className={`text-xs transition-colors ${isDark ? 'text-white/40 hover:text-white/70' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Go back
            </button>
            <span className={isDark ? 'text-white/20' : 'text-gray-300'}>•</span>
            <a
              href="/"
              className={`text-xs transition-colors ${isDark ? 'text-white/40 hover:text-white/70' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Go to home
            </a>
          </div>

          {/* Contact support */}
          <p className={`text-center mt-5 text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
            If this persists, please contact{' '}
            <a href="mailto:support@kroniqai.com" className={`transition-colors underline ${isDark ? 'text-emerald-400/50 hover:text-emerald-400' : 'text-emerald-600/60 hover:text-emerald-600'
              }`}>
              support@kroniqai.com
            </a>
          </p>
        </div>

        {/* KroniQ branding with logo */}
        <div className="flex items-center justify-center gap-2 mt-8">
          <img
            src="/assets/super-kroniq-rocket.png"
            alt=""
            className="w-5 h-5 object-contain opacity-50"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <span className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent opacity-50">
            KroniQ
          </span>
        </div>
      </div>

      {/* CSS for animations */}
      <style>{`
        @keyframes float-particle {
          0%, 100% { 
            transform: translateY(0) scale(1); 
            opacity: 0.3; 
          }
          50% { 
            transform: translateY(-20px) scale(1.2); 
            opacity: 0.6; 
          }
        }
      `}</style>
    </div>
  );
};

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
