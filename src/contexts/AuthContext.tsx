/**
 * AuthContext - Clean Slate Version
 * Simplified authentication context for v2 rebuild
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import {
  supabase,
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle as supabaseGoogleSignIn,
  signOut as supabaseSignOut,
} from '../lib/supabaseClient';

export type SubscriptionTier = 'FREE' | 'STARTER' | 'PRO' | 'PREMIUM';

interface AuthContextType {
  currentUser: User | null;
  user: User | null;
  session: Session | null;
  loading: boolean;
  userTier: SubscriptionTier;
  setUserTier: (tier: SubscriptionTier) => void;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize tier from localStorage OR from URL params (for immediate payment redirect)
  const [userTier, setUserTierState] = useState<SubscriptionTier>(() => {
    // Check URL params FIRST (for payment redirect)
    const urlParams = new URLSearchParams(window.location.search);
    const paymentSuccess = urlParams.get('payment_success');
    const tierParam = urlParams.get('tier');

    if (paymentSuccess === 'true' && (tierParam === 'PRO' || tierParam === 'PREMIUM' || tierParam === 'STARTER')) {
      // Immediately save to localStorage
      localStorage.setItem('kroniq_user_tier', tierParam);
      // Clear URL params
      window.history.replaceState({}, '', window.location.pathname);
      return tierParam;
    }

    // Otherwise check localStorage
    const stored = localStorage.getItem('kroniq_user_tier');
    if (stored === 'PRO' || stored === 'PREMIUM' || stored === 'STARTER') return stored;
    return 'FREE';
  });

  // Wrapper to also update localStorage
  const setUserTier = (tier: SubscriptionTier) => {
    localStorage.setItem('kroniq_user_tier', tier);
    setUserTierState(tier);
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (password.length < 6) {
      throw new Error('Password should be at least 6 characters');
    }

    const { user, error } = await signUpWithEmail(email, password, displayName);
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabaseGoogleSignIn();
    if (error) throw error;
  };

  const signIn = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const { user, error } = await signInWithEmail(email, password);
    if (error) throw error;
  };

  const signOut = async () => {
    await supabaseSignOut();
    setCurrentUser(null);
    setSession(null);
    // Clear tier on logout
    localStorage.removeItem('kroniq_user_tier');
    setUserTierState('FREE');
  };

  useEffect(() => {
    // Function to fetch tier from Supabase - non-blocking with timeout
    const fetchTierFromDB = async (userId: string) => {
      console.log('🔍 [AuthContext] Starting tier fetch for userId:', userId);

      // IMPORTANT: Check localStorage FIRST for pending sync
      // (This handles the case where payment succeeded but DB wasn't updated due to no session)
      const pendingTier = localStorage.getItem('kroniq_pending_tier_sync');
      const storedTier = localStorage.getItem('kroniq_user_tier');

      if (pendingTier === 'PRO' || pendingTier === 'PREMIUM' || pendingTier === 'STARTER') {
        console.log(`🔄 [AuthContext] Found pending tier sync: ${pendingTier}. Syncing to DB...`);
        try {
          const { error } = await supabase
            .from('profiles')
            .upsert({
              id: userId,
              plan: pendingTier.toLowerCase(),  // Use 'plan' column
            }, { onConflict: 'id' });

          if (!error) {
            console.log(`✅ [AuthContext] Synced pending tier ${pendingTier} to DB!`);
            localStorage.removeItem('kroniq_pending_tier_sync');
            localStorage.setItem('kroniq_user_tier', pendingTier);
            setUserTierState(pendingTier as SubscriptionTier);
            return;
          } else {
            console.error('❌ [AuthContext] Failed to sync pending tier:', error.message);
          }
        } catch (err) {
          console.error('❌ [AuthContext] Exception syncing pending tier:', err);
        }
      }

      try {
        // Add timeout to prevent hanging
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        console.log('🔍 [AuthContext] Querying profiles table...');
        const { data, error } = await supabase
          .from('profiles')
          .select('plan')  // Use 'plan' column
          .eq('id', userId)
          .maybeSingle();

        clearTimeout(timeoutId);

        console.log('🔍 [AuthContext] Query result:', { data, error: error?.message });

        if (error) {
          console.error('❌ [AuthContext] Supabase query error:', error);
        }

        if (data) {
          console.log('📊 [AuthContext] Profile data found:');
          console.log('   - plan:', data.plan);

          if (data.plan) {
            const tier = data.plan.toUpperCase();
            console.log('   - Checking tier value:', tier);

            if (tier === 'PRO' || tier === 'PREMIUM' || tier === 'STARTER') {
              console.log(`✅ [AuthContext] Restored tier from DB: ${tier}`);
              localStorage.setItem('kroniq_user_tier', tier);
              setUserTierState(tier as SubscriptionTier);
              return;
            } else if (tier === 'FREE') {
              console.log('ℹ️ [AuthContext] Tier is FREE');
            } else {
              console.log('⚠️ [AuthContext] Unknown tier value:', tier);
            }
          } else {
            console.log('⚠️ [AuthContext] plan column is null or empty');
          }
        } else {
          console.log('⚠️ [AuthContext] No profile data found for user');
        }

        // If no paid tier in DB, check localStorage as fallback
        console.log('📦 [AuthContext] localStorage tier:', storedTier);

        if (storedTier === 'PRO' || storedTier === 'PREMIUM' || storedTier === 'STARTER') {
          console.log('🔄 [AuthContext] localStorage has paid tier but DB does not. Syncing to DB...');

          // Sync localStorage tier to DB
          try {
            const { error: syncError } = await supabase
              .from('profiles')
              .upsert({
                id: userId,
                plan: storedTier.toLowerCase(),  // Use 'plan' column
              }, { onConflict: 'id' });

            if (!syncError) {
              console.log(`✅ [AuthContext] Synced localStorage tier ${storedTier} to DB!`);
            } else {
              console.error('❌ [AuthContext] Failed to sync localStorage tier to DB:', syncError.message);
            }
          } catch (syncErr) {
            console.error('❌ [AuthContext] Exception syncing tier to DB:', syncErr);
          }

          setUserTierState(storedTier as SubscriptionTier);
        } else {
          console.log('ℹ️ [AuthContext] Setting tier to FREE');
          setUserTierState('FREE');
        }
      } catch (err) {
        console.error('❌ [AuthContext] Tier fetch exception:', err);
        // Fallback to localStorage
        const fallbackTier = localStorage.getItem('kroniq_user_tier');
        if (fallbackTier === 'PRO' || fallbackTier === 'PREMIUM' || fallbackTier === 'STARTER') {
          setUserTierState(fallbackTier as SubscriptionTier);
        }
      }
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCurrentUser(session?.user ?? null);
      setLoading(false); // Always stop loading immediately

      // Fetch tier in background (non-blocking)
      if (session?.user?.id) {
        fetchTierFromDB(session.user.id);
      }
    }).catch(() => {
      setLoading(false); // Ensure loading stops even on error
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setCurrentUser(session?.user ?? null);
        setLoading(false);

        // Fetch tier in background when user signs in (non-blocking)
        if (event === 'SIGNED_IN' && session?.user?.id) {
          fetchTierFromDB(session.user.id);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Check for payment success on mount
  useEffect(() => {
    const checkPayment = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentSuccess = urlParams.get('payment_success');
      const tierParam = urlParams.get('tier');

      if (paymentSuccess === 'true' && (tierParam === 'PRO' || tierParam === 'PREMIUM' || tierParam === 'STARTER')) {
        setUserTier(tierParam as SubscriptionTier);
        // Clear URL
        window.history.replaceState({}, '', window.location.pathname);
      }
    };
    checkPayment();
  }, []);

  const value: AuthContextType = {
    currentUser,
    user: currentUser,
    session,
    loading,
    userTier,
    setUserTier,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  };

  // Optimized KroniQ loading screen - minimal for fast LCP
  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#070b14] flex flex-col items-center justify-center">
        {/* Simple gradient background - no blur for performance */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#070b14] via-[#0a1628] to-[#070b14]" />

        {/* Main loading content */}
        <div className="relative z-10 flex flex-col items-center gap-6">
          {/* Simple spinner */}
          <div className="w-16 h-16 rounded-full border-4 border-[#00FFF0]/20 border-t-[#00FFF0] animate-spin" />

          {/* KroniQ Logo Text */}
          <h1 className="text-2xl font-bold text-[#00FFF0]">KroniQ</h1>
          <p className="text-white/40 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

