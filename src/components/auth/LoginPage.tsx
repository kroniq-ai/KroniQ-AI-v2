import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, Check, X, ArrowRight } from 'lucide-react';
import { PromoService } from '../../lib/promoService';
import PromoBanner from '../Promo/PromoBanner';
import PromoSuccessModal from '../Promo/PromoSuccessModal';
import OfferExpiredModal from '../Promo/OfferExpiredModal';
import { trackSignupPageView, trackSignupComplete, trackEvent } from '../../lib/analyticsService';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [showPromoSuccess, setShowPromoSuccess] = useState(false);
  const [promoTokensAwarded, setPromoTokensAwarded] = useState(0);
  const [showOfferExpired, setShowOfferExpired] = useState(false);
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);
  const { signIn, signUp, signInWithGoogle, currentUser } = useAuth();

  const getPasswordStrength = () => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const passedChecks = Object.values(checks).filter(Boolean).length;

    return {
      checks,
      strength: passedChecks === 5 ? 'strong' : passedChecks >= 3 ? 'medium' : 'weak',
      percentage: (passedChecks / 5) * 100
    };
  };

  const passwordStrength = password && !isLogin ? getPasswordStrength() : null;

  useEffect(() => {
    setMounted(true);
    trackSignupPageView();

    const searchParams = new URLSearchParams(window.location.search);
    const promo = searchParams.get('promo');

    if (promo) {
      setPromoCode(promo);
      PromoService.storePromoCodeInSession(promo);
      setIsLogin(false);

      PromoService.checkCampaignStatus(promo).then(status => {
        if (!status.isValid) {
          setShowOfferExpired(true);
        }
      });
    } else {
      const storedPromo = PromoService.getPromoCodeFromSession();
      if (storedPromo) {
        setPromoCode(storedPromo);
        setIsLogin(false);
      }
    }
  }, []);

  const handlePromoRedemption = async (userId: string, userEmail: string) => {
    if (!promoCode) return;

    try {
      const ipAddress = await PromoService.getUserIpAddress();
      const userAgent = PromoService.getUserAgent();

      const result = await PromoService.redeemPromoCode(
        userId,
        promoCode,
        userEmail,
        ipAddress || undefined,
        userAgent
      );

      if (result.success) {
        setPromoTokensAwarded(result.tokensAwarded);
        setShowPromoSuccess(true);
        PromoService.clearPromoCodeFromSession();
      } else {
        if (result.message.includes('claimed')) {
          setShowOfferExpired(true);
        }
      }
    } catch (_error) {
      // Error redeeming promo
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const timeoutId = setTimeout(() => {
      setLoading(false);
      setError('Request timed out. Please check your connection and try again.');
    }, 30000);

    try {
      if (isLogin) {
        await signIn(email, password);
        trackEvent({ eventType: 'auth', eventName: 'login_success', pageName: 'signup' });
      } else {
        const strength = getPasswordStrength();
        if (strength.strength === 'weak') {
          clearTimeout(timeoutId);
          setError('Password is too weak. Please include: 8+ characters, uppercase, lowercase, number, and special character.');
          setLoading(false);
          return;
        }
        await signUp(email, password, displayName);

        // Track signup - currentUser will be set after signUp completes
        if (currentUser) {
          await trackSignupComplete(currentUser.id);
          if (promoCode) {
            await handlePromoRedemption(currentUser.id, email);
          }
        }
      }

      clearTimeout(timeoutId);

      // On successful login, redirect to app (or returnTo URL)
      if (isLogin) {
        const returnTo = searchParams.get('returnTo') || '/app';
        navigate(returnTo, { replace: true });
      }

      setLoading(false);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error('Auth error:', err);

      // Check if email confirmation is required
      if (err.message === 'CONFIRMATION_REQUIRED' || err.requiresConfirmation) {
        setShowConfirmationMessage(true);
        setLoading(false);
        return;
      }

      const errorMessage = err.message || 'Authentication failed';
      if (errorMessage.includes('Invalid login credentials')) {
        setError('Invalid email or password.');
      } else if (errorMessage.includes('email-already-in-use') || errorMessage.includes('already registered')) {
        setError('This email is already registered. Please sign in instead.');
      } else if (errorMessage.includes('user-not-found')) {
        setError('No account found with this email. Please sign up first.');
      } else if (errorMessage.includes('wrong-password') || errorMessage.includes('invalid-credential')) {
        setError('Invalid email or password. Please try again.');
      } else if (errorMessage.includes('Email not confirmed')) {
        setError('Please confirm your email before signing in. Check your inbox.');
      } else {
        setError(errorMessage);
      }
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      await signInWithGoogle();
      setTimeout(() => setLoading(false), 1000);
    } catch (err: any) {
      console.error('Google auth error:', err);
      setError(err.message || 'Google authentication failed');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser && promoCode && !isLogin && email) {
      handlePromoRedemption(currentUser.id, email);
    }
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      {/* AI Fiesta Style Grid Background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Teal glow at top center */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-teal-500/30 via-teal-500/5 to-transparent blur-3xl" />

        {/* Perspective Grid Lines */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
            maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
          }}
        />

        {/* Scattered dark rectangles for depth */}
        {[
          { top: '15%', left: '8%', w: 60, h: 80, opacity: 0.4 },
          { top: '25%', left: '15%', w: 40, h: 50, opacity: 0.3 },
          { top: '60%', left: '5%', w: 50, h: 70, opacity: 0.35 },
          { top: '45%', left: '20%', w: 35, h: 45, opacity: 0.25 },
          { top: '70%', left: '12%', w: 55, h: 65, opacity: 0.3 },
          { top: '20%', right: '10%', w: 45, h: 60, opacity: 0.35 },
          { top: '35%', right: '5%', w: 55, h: 75, opacity: 0.4 },
          { top: '55%', right: '15%', w: 40, h: 55, opacity: 0.3 },
          { top: '75%', right: '8%', w: 50, h: 65, opacity: 0.35 },
          { top: '40%', right: '22%', w: 35, h: 45, opacity: 0.25 },
        ].map((rect, i) => (
          <div
            key={i}
            className="absolute rounded-lg bg-white/5 border border-white/5"
            style={{
              top: rect.top,
              left: rect.left,
              right: rect.right,
              width: rect.w,
              height: rect.h,
              opacity: rect.opacity,
            }}
          />
        ))}

        {/* Scattered dots/particles */}
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/20"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.1 + Math.random() * 0.3,
            }}
          />
        ))}
      </div>

      {/* Login Form Container */}
      <div className={`w-full max-w-md px-6 relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-block p-5 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 mb-6">
            <img
              src="/favicon-logo.png"
              alt="KroniQ AI Logo"
              width={80}
              height={80}
              className="h-20 w-auto object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome to KroniQ</h1>
          <p className="text-white/50 text-sm">Choose how you would like to sign in</p>
        </div>

        {/* Promo Banner */}
        {!isLogin && promoCode && <PromoBanner campaignCode={promoCode} />}

        {/* Email Confirmation Success Message */}
        {showConfirmationMessage && (
          <div className="mb-6 p-6 rounded-2xl bg-gradient-to-br from-teal-500/20 to-cyan-500/10 border border-teal-500/30 text-center animate-fade-in-up">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-teal-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Check Your Email! 📧</h3>
            <p className="text-white/70 text-sm mb-4">
              We've sent a confirmation link to <strong className="text-teal-400">{email}</strong>.
              <br />Click the link in your email to activate your account.
            </p>
            <button
              onClick={() => {
                setShowConfirmationMessage(false);
                setIsLogin(true);
              }}
              className="text-teal-400 hover:text-teal-300 text-sm font-medium underline"
            >
              Already confirmed? Sign in here
            </button>
          </div>
        )}

        {/* Google Sign In - Primary */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full bg-white hover:bg-gray-50 text-gray-800 py-3.5 px-4 rounded-xl font-medium border border-gray-200 focus:outline-none transition-all disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-3 text-sm mb-6"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/30 text-xs font-medium uppercase tracking-wider">Or continue with your email</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-6 p-1 bg-white/5 rounded-xl border border-white/10">
          {['Sign In', 'Sign Up'].map((tab, idx) => (
            <button
              key={tab}
              onClick={() => {
                setIsLogin(idx === 0);
                setError('');
              }}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-300 ${(idx === 0 ? isLogin : !isLogin)
                ? 'bg-white/10 text-white'
                : 'text-white/40 hover:text-white/60'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="animate-fade-in-up">
              <label className="block text-sm font-medium text-white/70 mb-2">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-teal-500/50 transition-all"
                placeholder="John Doe"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-teal-500/50 transition-all"
              placeholder="Enter your email address"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-11 bg-transparent border border-white/20 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-teal-500/50 transition-all"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {passwordStrength && (
            <div className="space-y-3 p-4 rounded-xl bg-white/5 border border-white/10 animate-fade-in-up">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-white/50">Password Strength</span>
                <span className={`text-xs font-bold ${passwordStrength.strength === 'strong' ? 'text-teal-400' :
                  passwordStrength.strength === 'medium' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                  {passwordStrength.strength.charAt(0).toUpperCase() + passwordStrength.strength.slice(1)}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${passwordStrength.strength === 'strong' ? 'bg-teal-500' :
                    passwordStrength.strength === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                  style={{ width: `${passwordStrength.percentage}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { check: 'length', label: '8+ chars' },
                  { check: 'uppercase', label: 'Uppercase' },
                  { check: 'lowercase', label: 'Lowercase' },
                  { check: 'number', label: 'Number' },
                  { check: 'special', label: 'Special char' },
                ].map(({ check, label }) => (
                  <div key={check} className={`flex items-center gap-1.5 text-xs ${passwordStrength.checks[check as keyof typeof passwordStrength.checks] ? 'text-teal-400' : 'text-white/30'}`}>
                    {passwordStrength.checks[check as keyof typeof passwordStrength.checks] ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <X className="w-3 h-3" />
                    )}
                    {label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white hover:bg-white/20"
          >
            {loading ? (
              <>
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Switch Auth Mode */}
        <div className="mt-6 text-center">
          <p className="text-sm text-white/40">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/20 text-xs">KroniQ © 2025</p>
        </div>
      </div>

      {/* Modals */}
      {showPromoSuccess && (
        <PromoSuccessModal
          tokensAwarded={promoTokensAwarded}
          onClose={() => { setShowPromoSuccess(false); window.location.href = '/'; }}
        />
      )}

      {showOfferExpired && (
        <OfferExpiredModal onClose={() => setShowOfferExpired(false)} />
      )}
    </div>
  );
};
