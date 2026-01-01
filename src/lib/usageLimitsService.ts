/**
 * Usage Limits Service
 * Manages tier-based usage limits with token cost system
 * 
 * HYBRID APPROACH:
 * - Base limits per feature type (messages, images, videos, PPT)
 * - Token costs reduce remaining usage (expensive models cost more)
 * - Resets: daily for messages, weekly for images/videos, monthly for PPT
 */

export type UserTier = 'FREE' | 'PRO' | 'PREMIUM';
export type FeatureType = 'message' | 'image' | 'video' | 'ppt';

// ===== TIER LIMITS =====
export const TIER_LIMITS: Record<UserTier, Record<FeatureType, number>> = {
  FREE: {
    message: 5,    // per day
    image: 2,      // total (lifetime for free)
    video: 0,      // disabled
    ppt: 0,        // disabled
  },
  PRO: {
    message: 30,   // per day
    image: 5,      // per week
    video: 3,      // per week
    ppt: 5,        // per month
  },
  PREMIUM: {
    message: 70,   // per day
    image: 12,     // per week
    video: 6,      // per week
    ppt: 12,       // per month
  },
};

// ===== MODEL TOKEN COSTS =====
// Higher cost = more expensive API calls = reduces usage faster
export const MODEL_COSTS: Record<string, number> = {
  // Chat models - Base cost 1
  'deepseek-r1': 1,
  'gpt-4o-mini': 1,
  'gemini-2.0-flash': 1,
  'llama-3.3': 1,
  'mistral-small': 1,

  // Chat models - Medium cost 2
  'gpt-4o': 2,
  'claude-3.5-sonnet': 2,
  'gemini-2.5-pro': 2,

  // Chat models - High cost 3
  'gpt-5': 3,
  'claude-4-opus': 3,
  'gemini-3-pro': 3,

  // Image models
  'flux-dev': 1,
  'flux-pro': 2,
  'flux-max': 3,
  'gpt-4o-image': 3,
  'google/imagen4-ultra': 4,
  'midjourney/v6': 4,
  'dalle-3': 3,

  // Video models
  'veo3_fast': 2,
  'veo3': 4,
  'sora-2-text-to-video': 5,
  'kling-2.6/text-to-video': 3,
  'runway-gen3': 4,
};

// Get cost for a model (default to 1 if unknown)
export function getModelCost(modelId: string): number {
  return MODEL_COSTS[modelId] || 1;
}

// ===== USAGE TRACKING =====

interface UsageData {
  tier: UserTier;
  messages_today: number;
  images_this_period: number;
  videos_this_period: number;
  ppt_this_period: number;
  total_tokens_used: number;
  last_message_reset: string;   // ISO date
  last_image_reset: string;
  last_video_reset: string;
  last_ppt_reset: string;
}

const USAGE_KEY = 'kroniq_usage_data';

// Get current usage from localStorage
export function getUsageData(): UsageData {
  const stored = localStorage.getItem(USAGE_KEY);
  if (stored) {
    const data = JSON.parse(stored) as UsageData;
    return checkAndResetPeriods(data);
  }
  return createDefaultUsage();
}

// Save usage data
function saveUsageData(data: UsageData): void {
  localStorage.setItem(USAGE_KEY, JSON.stringify(data));
}

// Create default usage data
function createDefaultUsage(): UsageData {
  const now = new Date().toISOString();
  return {
    tier: 'FREE',
    messages_today: 0,
    images_this_period: 0,
    videos_this_period: 0,
    ppt_this_period: 0,
    total_tokens_used: 0,
    last_message_reset: now,
    last_image_reset: now,
    last_video_reset: now,
    last_ppt_reset: now,
  };
}

// Check if periods need reset
function checkAndResetPeriods(data: UsageData): UsageData {
  const now = new Date();
  const today = now.toDateString();

  // Reset messages daily
  if (new Date(data.last_message_reset).toDateString() !== today) {
    data.messages_today = 0;
    data.last_message_reset = now.toISOString();
  }

  // Reset images/videos weekly
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (new Date(data.last_image_reset) < weekAgo) {
    data.images_this_period = 0;
    data.last_image_reset = now.toISOString();
  }
  if (new Date(data.last_video_reset) < weekAgo) {
    data.videos_this_period = 0;
    data.last_video_reset = now.toISOString();
  }

  // Reset PPT monthly
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  if (new Date(data.last_ppt_reset) < monthAgo) {
    data.ppt_this_period = 0;
    data.last_ppt_reset = now.toISOString();
  }

  saveUsageData(data);
  return data;
}

// ===== CHECK & RECORD USAGE =====

export interface UsageCheckResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  reason?: string;
}

// Check if user can use a feature
export function canUseFeature(
  tier: UserTier,
  feature: FeatureType,
  modelId?: string
): UsageCheckResult {
  const limits = TIER_LIMITS[tier];
  const limit = limits[feature];
  const usage = getUsageData();

  // Feature disabled for tier
  if (limit === 0) {
    return {
      allowed: false,
      remaining: 0,
      limit: 0,
      reason: `${feature} generation requires ${feature === 'video' || feature === 'ppt' ? 'Pro' : 'an upgraded'} subscription`,
    };
  }

  // Get current usage
  let currentUsage = 0;
  switch (feature) {
    case 'message': currentUsage = usage.messages_today; break;
    case 'image': currentUsage = usage.images_this_period; break;
    case 'video': currentUsage = usage.videos_this_period; break;
    case 'ppt': currentUsage = usage.ppt_this_period; break;
  }

  const remaining = Math.max(0, limit - currentUsage);

  // Calculate cost with model multiplier
  const cost = modelId ? getModelCost(modelId) : 1;

  if (remaining < cost) {
    return {
      allowed: false,
      remaining,
      limit,
      reason: `You've used your ${feature} limit for this period. Upgrade for more!`,
    };
  }

  return { allowed: true, remaining, limit };
}

// Record usage after successful operation
export function recordUsage(
  feature: FeatureType,
  modelId?: string
): void {
  const data = getUsageData();
  const cost = modelId ? getModelCost(modelId) : 1;

  switch (feature) {
    case 'message':
      data.messages_today += cost;
      break;
    case 'image':
      data.images_this_period += cost;
      break;
    case 'video':
      data.videos_this_period += cost;
      break;
    case 'ppt':
      data.ppt_this_period += cost;
      break;
  }

  data.total_tokens_used += cost;
  saveUsageData(data);
}

// Update tier
export function updateUserTier(tier: UserTier): void {
  const data = getUsageData();
  data.tier = tier;
  saveUsageData(data);
  localStorage.setItem('kroniq_user_tier', tier);
}

// Get usage summary for sidebar
export function getUsageSummary(tier: UserTier): {
  messages: { used: number; limit: number; period: string };
  images: { used: number; limit: number; period: string };
  videos: { used: number; limit: number; period: string };
  ppt: { used: number; limit: number; period: string };
} {
  const usage = getUsageData();
  const limits = TIER_LIMITS[tier];

  return {
    messages: {
      used: usage.messages_today,
      limit: limits.message,
      period: 'day',
    },
    images: {
      used: usage.images_this_period,
      limit: limits.image,
      period: tier === 'FREE' ? 'total' : 'week',
    },
    videos: {
      used: usage.videos_this_period,
      limit: limits.video,
      period: 'week',
    },
    ppt: {
      used: usage.ppt_this_period,
      limit: limits.ppt,
      period: 'month',
    },
  };
}
