import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, Lock, Check, Search, X, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { getUserAccessInfo } from '../../lib/modelAccessControl';
import { getModelCost, getTierBadgeColor } from '../../lib/modelTokenPricing';
import { AI_MODELS, AIModel, getXaiLogo } from '../../lib/aiModels';

// Helper to get theme-aware logo URL
const getThemeAwareLogo = (model: AIModel, isDark: boolean): string | undefined => {
  if ((model.provider === 'xAI' || model.id.includes('grok') || model.id.includes('x-ai')) && isDark) {
    return getXaiLogo(true);
  }
  return model.logoUrl;
};

interface CompactModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  category?: 'chat' | 'code' | 'image' | 'video' | 'audio';
}

export const CompactModelSelector: React.FC<CompactModelSelectorProps> = ({
  selectedModel,
  onModelChange,
  category = 'chat'
}) => {
  const { currentTheme } = useTheme();
  const isDark = currentTheme === 'cosmic-dark';
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [userType, setUserType] = useState<'free' | 'paid'>('free');
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (!currentUser) {
        setIsPremium(false);
        setUserType('free');
        return;
      }
      try {
        const accessInfo = await getUserAccessInfo(currentUser.id);
        if (accessInfo) {
          setIsPremium(accessInfo.isPremium);
          setUserType(accessInfo.userType);
        } else {
          setIsPremium(false);
          setUserType('free');
        }
      } catch (error) {
        console.error('Error checking user access:', error);
        setIsPremium(false);
        setUserType('free');
      }
    };
    checkAccess();
  }, [currentUser]);

  // Close dropdown when clicking outside  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Group models by Standard (FREE) and Premium (PAID)
  const { standardModels, premiumModels } = useMemo(() => {
    const filteredModels = AI_MODELS.filter(m => m.category === category);
    const searchLower = searchQuery.toLowerCase().trim();

    const searchFilter = (model: AIModel) => {
      if (!searchLower) return true;
      return model.name.toLowerCase().includes(searchLower) ||
        model.provider.toLowerCase().includes(searchLower) ||
        model.description.toLowerCase().includes(searchLower);
    };

    const standard = filteredModels.filter(m => m.tier === 'FREE' && searchFilter(m));
    const premium = filteredModels.filter(m => m.tier !== 'FREE' && searchFilter(m));

    return { standardModels: standard, premiumModels: premium };
  }, [category, searchQuery]);

  const selectedModelData = AI_MODELS.find(m => m.id === selectedModel);
  const selectedModelCost = selectedModelData ? getModelCost(selectedModelData.id) : null;

  const isModelLocked = (model: AIModel): boolean => {
    if (isPremium || userType === 'paid') return false;
    return model.tier !== 'FREE';
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Selector Button - Glassmorphic */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          group flex items-center gap-3 px-4 py-2.5 rounded-xl
          transition-all duration-300 ease-out
          ${isDark
            ? 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20'
            : 'bg-white/80 hover:bg-white border border-gray-200 hover:border-gray-300'}
          backdrop-blur-xl shadow-lg hover:shadow-xl
          ${isOpen ? isDark ? 'ring-2 ring-emerald-500/30' : 'ring-2 ring-emerald-500/20' : ''}
        `}
      >
        {/* Model Logo */}
        {selectedModelData && getThemeAwareLogo(selectedModelData, isDark) && (
          <img
            src={getThemeAwareLogo(selectedModelData, isDark)}
            alt={selectedModelData.provider}
            className="w-5 h-5 rounded-md object-contain flex-shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}

        {/* Model Name */}
        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {selectedModelData?.name || 'Select Model'}
        </span>

        {/* Tier Badge */}
        {selectedModelCost && (
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${getTierBadgeColor(selectedModelCost.tier)}`}>
            {selectedModelCost.tier === 'free' ? 'FREE' : selectedModelCost.tier.toUpperCase()}
          </span>
        )}

        {/* Dropdown Arrow */}
        <ChevronDown className={`
          w-4 h-4 transition-transform duration-300 
          ${isOpen ? 'rotate-180' : ''}
          ${isDark ? 'text-white/50' : 'text-gray-400'}
        `} />
      </button>

      {/* Dropdown Menu - Premium Glassmorphic */}
      {isOpen && (
        <div className={`
          absolute top-full left-0 mt-2 w-80 rounded-2xl overflow-hidden z-50
          backdrop-blur-2xl shadow-2xl
          ${isDark
            ? 'bg-black/80 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)]'
            : 'bg-white/95 border border-gray-200 shadow-xl'}
          animate-in fade-in-0 slide-in-from-top-2 duration-200
        `}>
          {/* Search Bar */}
          <div className={`
            sticky top-0 z-20 p-3 border-b
            ${isDark ? 'border-white/10 bg-black/40' : 'border-gray-100 bg-white/80'}
            backdrop-blur-xl
          `}>
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-white/40' : 'text-gray-400'}`} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search models..."
                className={`
                  w-full pl-10 pr-10 py-2.5 rounded-xl text-sm
                  transition-all duration-200 focus:outline-none
                  ${isDark
                    ? 'bg-white/5 text-white placeholder-white/40 focus:bg-white/10 focus:ring-2 focus:ring-emerald-500/30'
                    : 'bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-gray-100 focus:ring-2 focus:ring-emerald-500/20'}
                `}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={`
                    absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full
                    transition-colors duration-200
                    ${isDark ? 'text-white/40 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'}
                  `}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Models List */}
          <div className="max-h-80 overflow-y-auto p-2">
            {/* Header */}
            <div className={`px-3 py-2 text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
              Available Models
            </div>

            {/* Standard (Free) Models */}
            {standardModels.length > 0 && (
              <>
                <div className={`
                  px-3 py-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2
                  ${isDark ? 'text-emerald-400' : 'text-emerald-600'}
                `}>
                  <Sparkles className="w-3 h-3" />
                  Standard
                </div>
                {standardModels.map((model) => (
                  <ModelItem
                    key={model.id}
                    model={model}
                    isSelected={selectedModel === model.id}
                    isLocked={false}
                    isDark={isDark}
                    onSelect={() => {
                      onModelChange(model.id);
                      setIsOpen(false);
                    }}
                  />
                ))}
              </>
            )}

            {/* Premium Models */}
            {premiumModels.length > 0 && (
              <>
                <div className={`
                  px-3 py-2 mt-2 text-xs font-bold uppercase tracking-wider flex items-center gap-2
                  ${isDark ? 'text-purple-400' : 'text-purple-600'}
                `}>
                  <Lock className="w-3 h-3" />
                  Premium
                </div>
                {premiumModels.map((model) => {
                  const locked = isModelLocked(model);
                  return (
                    <ModelItem
                      key={model.id}
                      model={model}
                      isSelected={selectedModel === model.id}
                      isLocked={locked}
                      isDark={isDark}
                      onSelect={() => {
                        if (!locked) {
                          onModelChange(model.id);
                          setIsOpen(false);
                        }
                      }}
                    />
                  );
                })}
              </>
            )}

            {/* No Results */}
            {standardModels.length === 0 && premiumModels.length === 0 && (
              <div className="p-8 text-center">
                <Search className={`w-10 h-10 mx-auto mb-3 ${isDark ? 'text-white/20' : 'text-gray-300'}`} />
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  No models found
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                  Try a different search term
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Model Item Component
const ModelItem: React.FC<{
  model: AIModel;
  isSelected: boolean;
  isLocked: boolean;
  isDark: boolean;
  onSelect: () => void;
}> = ({ model, isSelected, isLocked, isDark, onSelect }) => {
  const modelCost = getModelCost(model.id);
  const logoUrl = getThemeAwareLogo(model, isDark);

  return (
    <button
      onClick={onSelect}
      disabled={isLocked}
      className={`
        w-full px-3 py-2.5 rounded-xl flex items-center gap-3
        transition-all duration-200
        ${isLocked
          ? 'opacity-50 cursor-not-allowed'
          : isSelected
            ? isDark ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-emerald-50 border border-emerald-200'
            : isDark ? 'hover:bg-white/5 border border-transparent' : 'hover:bg-gray-50 border border-transparent'}
      `}
    >
      {/* Logo */}
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={model.provider}
          className="w-6 h-6 rounded-lg object-contain"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      ) : (
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${isDark ? 'bg-white/10 text-white' : 'bg-gray-200 text-gray-700'}`}>
          {model.provider.charAt(0)}
        </div>
      )}

      {/* Model Info */}
      <div className="flex-1 text-left">
        <div className={`text-sm font-medium flex items-center gap-2 ${isSelected ? isDark ? 'text-emerald-400' : 'text-emerald-700' : isDark ? 'text-white' : 'text-gray-900'}`}>
          {model.name}
          {isLocked && <Lock className="w-3 h-3 text-amber-500" />}
        </div>
      </div>

      {/* Tier Badge */}
      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${getTierBadgeColor(modelCost.tier)}`}>
        {modelCost.tier === 'free' ? 'FREE' : modelCost.tier.toUpperCase()}
      </span>

      {/* Check Mark */}
      {isSelected && !isLocked && (
        <Check className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
      )}
    </button>
  );
};
