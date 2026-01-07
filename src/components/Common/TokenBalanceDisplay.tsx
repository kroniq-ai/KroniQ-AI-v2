import React, { useState, useEffect } from 'react';
import { Coins, Zap, Crown, Sparkles, TrendingUp, Star, Gem } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase, getUserProfile } from '../../lib/supabaseClient';

interface TokenBalanceDisplayProps {
  isExpanded?: boolean;
  showDetails?: boolean;
  onPurchaseClick?: () => void;
}

// Tier configuration with colors and icons
const TIER_CONFIG = {
  free: {
    label: 'Free',
    icon: Zap,
    iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
  },
  starter: {
    label: 'Starter',
    icon: Star,
    iconBg: 'bg-gradient-to-br from-teal-400 to-cyan-500',
  },
  pro: {
    label: 'Pro',
    icon: Gem,
    iconBg: 'bg-gradient-to-br from-purple-500 to-pink-500',
  },
  premium: {
    label: 'Premium',
    icon: Crown,
    iconBg: 'bg-gradient-to-br from-amber-400 to-yellow-500',
  },
};

export const TokenBalanceDisplay: React.FC<TokenBalanceDisplayProps> = ({
  onPurchaseClick
}) => {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const [tier, setTier] = useState<string>('free');
  const [tokensRemaining, setTokensRemaining] = useState(15000);
  const [tokensLimit, setTokensLimit] = useState(15000);
  const [isLoading, setIsLoading] = useState(true);

  // ROBUST dark/light mode detection
  const isDark = currentTheme !== 'pure-white';

  const tierConfig = TIER_CONFIG[tier.toLowerCase() as keyof typeof TIER_CONFIG] || TIER_CONFIG.free;
  const TierIcon = tierConfig.icon;

  // Calculate usage percentage
  const usagePercent = tokensLimit > 0 ? Math.max(0, Math.min(100, (tokensRemaining / tokensLimit) * 100)) : 0;

  const fetchUsage = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const profile = await getUserProfile(user.id);
      if (profile) {
        const plan = profile.plan || 'free';
        setTier(plan);
        const used = profile.tokens_used || 0;
        const limit = profile.tokens_limit || 15000;
        setTokensLimit(limit);
        setTokensRemaining(Math.max(0, limit - used));
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, [user]);

  useEffect(() => {
    const handleTokenUpdate = () => fetchUsage();
    window.addEventListener('tokenBalanceUpdated', handleTokenUpdate);
    return () => window.removeEventListener('tokenBalanceUpdated', handleTokenUpdate);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`sidebar-${user.id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${user.id}`,
      }, () => fetchUsage())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  if (!user || isLoading) return null;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  // ========== DARK MODE ==========
  if (isDark) {
    return (
      <div className="relative overflow-hidden rounded-2xl p-4 bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border border-white/10">
        {/* Decorative orb */}
        <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-30 bg-gradient-to-br from-emerald-500 to-teal-600" />

        {/* Tier Badge */}
        <div className="relative flex items-center gap-3 mb-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tierConfig.iconBg} shadow-lg`}>
            <TierIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {tierConfig.label}
            </h3>
            {tier.toLowerCase() !== 'premium' && (
              <button
                onClick={onPurchaseClick}
                className="text-xs font-semibold text-white/50 hover:text-white/80 flex items-center gap-1"
              >
                Upgrade <span className="text-[10px]">→</span>
              </button>
            )}
          </div>
        </div>

        {/* Token Section */}
        <div className="rounded-xl p-3 bg-black/20 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-emerald-500/20">
                <Coins className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-white/50">Tokens</span>
            </div>
            <span className="text-2xl font-bold text-emerald-400">
              {formatNumber(tokensRemaining)}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 rounded-full overflow-hidden bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"
              style={{ width: `${usagePercent}%` }}
            />
          </div>

          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-white/30">{formatNumber(tokensRemaining)} remaining</span>
            <span className="text-[10px] text-white/30">{formatNumber(tokensLimit)} daily</span>
          </div>
        </div>
      </div>
    );
  }

  // ========== LIGHT MODE ==========
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-4 border-2 shadow-lg"
      style={{
        backgroundColor: '#ffffff',
        borderColor: '#10b981',
        boxShadow: '0 10px 40px -10px rgba(16, 185, 129, 0.3)'
      }}
    >
      {/* Decorative orb - light green */}
      <div
        className="absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl"
        style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}
      />

      {/* Tier Badge */}
      <div className="relative flex items-center gap-3 mb-4">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center ${tierConfig.iconBg}`}
          style={{ boxShadow: '0 8px 24px -4px rgba(16, 185, 129, 0.4)' }}
        >
          <TierIcon className="w-5 h-5 text-white" />
        </div>
        <div>
          {/* TIER NAME - DARK TEXT FOR LIGHT MODE */}
          <h3
            className="text-base font-bold tracking-tight"
            style={{ color: '#1f2937' }}
          >
            {tierConfig.label}
          </h3>
          {tier.toLowerCase() !== 'premium' && (
            <button
              onClick={onPurchaseClick}
              className="text-xs font-semibold flex items-center gap-1 hover:gap-1.5 transition-all"
              style={{ color: '#059669' }}
            >
              Upgrade <span className="text-[10px]">→</span>
            </button>
          )}
        </div>
      </div>

      {/* Token Section */}
      <div
        className="rounded-xl p-3 border"
        style={{
          background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdfa 100%)',
          borderColor: '#a7f3d0'
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#10b981' }}
            >
              <Coins className="w-3.5 h-3.5 text-white" />
            </div>
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{ color: '#047857' }}
            >
              Tokens
            </span>
          </div>
          <span
            className="text-2xl font-bold"
            style={{ color: '#059669' }}
          >
            {formatNumber(tokensRemaining)}
          </span>
        </div>

        {/* Progress Bar */}
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: '#a7f3d0' }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${usagePercent}%`,
              background: 'linear-gradient(90deg, #10b981, #14b8a6)'
            }}
          />
        </div>

        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] font-medium" style={{ color: '#059669' }}>
            {formatNumber(tokensRemaining)} remaining
          </span>
          <span className="text-[10px] font-medium" style={{ color: '#059669' }}>
            {formatNumber(tokensLimit)} daily
          </span>
        </div>
      </div>
    </div>
  );
};

export default TokenBalanceDisplay;
