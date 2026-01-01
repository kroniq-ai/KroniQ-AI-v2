import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { useNavigation } from '../../contexts/NavigationContext';
import { supabase } from '../../lib/supabase';
import { X, Zap, ChevronRight, Settings } from 'lucide-react';

interface ProfilePageProps {
  onClose: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onClose }) => {
  const { currentUser, signOut } = useAuth();
  const { currentTheme } = useTheme();
  const { navigateTo } = useNavigation();
  const { showToast } = useToast();

  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [saving, setSaving] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [tokensLimit, setTokensLimit] = useState(100000);
  const [tier, setTier] = useState('free');

  const isDark = currentTheme === 'cosmic-dark';

  useEffect(() => {
    if (currentUser?.user_metadata?.full_name) {
      setDisplayName(currentUser.user_metadata.full_name);
    } else if (currentUser?.user_metadata?.name) {
      setDisplayName(currentUser.user_metadata.name);
    }
    if (currentUser?.user_metadata?.avatar_url) {
      setPhotoURL(currentUser.user_metadata.avatar_url);
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!currentUser?.id) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('tokens_balance, tokens_limit, current_tier, is_premium, photo_url, display_name')
          .eq('id', currentUser.id)
          .maybeSingle();

        if (!error && data) {
          setTokenBalance(data.tokens_balance || 0);
          setTokensLimit(data.tokens_limit || 100000);
          setTier(data.is_premium ? 'premium' : data.current_tier || 'free');

          // Load saved display name and photo
          if (data.display_name) {
            setDisplayName(data.display_name);
          }
          if (data.photo_url) {
            setPhotoURL(data.photo_url);
          } else if (currentUser?.user_metadata?.avatar_url) {
            // Fallback to user_metadata for Google sign-in avatars
            setPhotoURL(currentUser.user_metadata.avatar_url);
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };
    fetchProfileData();
  }, [currentUser]);

  const handleSave = async () => {
    if (!currentUser || !displayName.trim()) return;

    setSaving(true);
    try {
      await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim(),
          photo_url: photoURL || '',
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      showToast('success', 'Saved', 'Profile updated successfully');
      setTimeout(() => onClose(), 400);
    } catch (error: any) {
      showToast('error', 'Error', error?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name?: string) => {
    if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    return currentUser?.email?.[0]?.toUpperCase() || 'U';
  };

  const formatTokens = (n: number) => n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : n.toString();

  if (!currentUser) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 backdrop-blur-md bg-black/20"
        onClick={onClose}
      />

      {/* Glassmorphism Modal */}
      <div className={`
        relative w-full max-w-md mx-4 rounded-3xl overflow-hidden
        ${isDark
          ? 'bg-white/10 border border-white/20'
          : 'bg-white/40 border border-white/50'}
        backdrop-blur-2xl shadow-2xl
      `}>
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
          <span className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Profile</span>
          <button onClick={onClose} className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-white/60' : 'hover:bg-gray-100 text-gray-500'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Profile Info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={`
                w-16 h-16 rounded-full flex items-center justify-center overflow-hidden
                ${isDark ? 'bg-emerald-600' : 'bg-emerald-500'}
              `}>
                {photoURL ? (
                  <img src={photoURL} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-white">{getInitials(displayName)}</span>
                )}
              </div>
            </div>
            <div className="flex-1">
              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{displayName || 'User'}</p>
              <p className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>{currentUser.email}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${tier === 'premium'
                ? 'bg-amber-500/20 text-amber-500'
                : isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-700'
                }`}>
                {tier === 'premium' ? 'Premium' : 'Free'} Plan
              </span>
            </div>
          </div>

          {/* Token Balance */}
          <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Zap className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <span className={`text-sm ${isDark ? 'text-white/70' : 'text-gray-600'}`}>Tokens</span>
              </div>
              <span className={`font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{formatTokens(tokenBalance)}</span>
            </div>
            <div className={`h-1.5 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}>
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min((tokenBalance / tokensLimit) * 100, 100)}%` }} />
            </div>
            <p className={`text-xs mt-1 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{formatTokens(tokenBalance)} / {formatTokens(tokensLimit)}</p>
          </div>

          {/* Display Name */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white/80' : 'text-gray-700'}`}>Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className={`w-full px-4 py-3 rounded-xl ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-gray-50 border-gray-200 text-gray-900'} border focus:outline-none focus:border-emerald-500`}
            />
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <button
              onClick={() => { onClose(); navigateTo('settings'); }}
              className={`w-full flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-white/5 hover:bg-white/10' : 'bg-gray-50 hover:bg-gray-100'} transition-colors`}
            >
              <div className="flex items-center gap-3">
                <Settings className={`w-4 h-4 ${isDark ? 'text-white/70' : 'text-gray-600'}`} />
                <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-700'}`}>Settings</span>
              </div>
              <ChevronRight className={`w-4 h-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
            </button>

            <button
              onClick={async () => { await signOut(); onClose(); }}
              className={`w-full flex items-center p-3 rounded-xl text-red-500 ${isDark ? 'bg-red-500/10 hover:bg-red-500/20' : 'bg-red-50 hover:bg-red-100'} transition-colors`}
            >
              <img src="/logout-icon.png" alt="" className="w-4 h-4 mr-3 opacity-80" />
              <span className="text-sm">Log out</span>
            </button>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
