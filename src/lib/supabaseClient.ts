/**
 * Supabase Client - Direct Supabase Implementation
 * Replaces Firebase for all auth and data operations
 */

import { createClient, User, Session } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wejqcyjthgxkjvzqiybk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlanFjeWp0aGd4a2p2enFpeWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYzNDMwNzEsImV4cCI6MjA4MTkxOTA3MX0.00lLN5vb1dZgZ3N-qDwAfoOaowBPOBEJ7CJuAPUsxNY';

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Re-export types for compatibility
export type { User, Session };

// Helper to set user context (for RLS policies)
export const setSupabaseUserContext = async () => {
  // With Supabase RLS, auth context is automatic
};

// ==================== TYPES ====================

export interface Project {
  id: string;
  user_id: string;
  name: string;
  type: 'chat' | 'code' | 'design' | 'video' | 'image' | 'music' | 'voice' | 'ppt' | 'tts';
  description?: string;
  ai_model?: string;
  status?: string;
  session_state?: any;
  created_at?: string;
  updated_at?: string;
  mode?: 'playground' | 'super'; // Track if Super KroniQ or Playground mode
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface Message {
  id: string;
  project_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, any>;
  file_attachments?: any[];
  created_at?: string;
  generating?: boolean;
  generationType?: 'image' | 'video' | 'audio' | 'text';
  generationProgress?: number;
  generatedContent?: {
    type: 'image' | 'video' | 'audio';
    url: string;
    prompt?: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  photo_url: string | null;
  plan: 'free' | 'starter' | 'pro' | 'premium' | 'enterprise';
  tokens_used: number;
  tokens_limit: number;
  paid_tokens_balance: number;
  // Usage tracking fields
  messages_used: number;
  images_used: number;
  videos_used: number;
  music_used: number;
  tts_used: number;
  ppt_used: number;
  last_usage_reset_at: string | null;
  // AI settings
  ai_personality: string;
  ai_creativity_level: number;
  ai_response_length: string;
  stripe_customer_id: string | null;
  last_token_reset_at: string | null;
  created_at: string;
  updated_at: string;
}

// ==================== AUTH HELPERS ====================

export const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: displayName,
        display_name: displayName,
      },
    },
  });

  if (error) throw error;
  return data;
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
    },
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getCurrentSession = async (): Promise<Session | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// ==================== PROFILE OPERATIONS ====================

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
};

export const createUserProfile = async (
  userId: string,
  email: string,
  displayName?: string,
  photoUrl?: string,
  initialTokens: number = 15000  // Free tier: 15K tokens
): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email,
      display_name: displayName || null,
      photo_url: photoUrl || null,
      tokens_limit: initialTokens,
      tokens_used: 0,
      paid_tokens_balance: 0,
      plan: 'free',
      ai_personality: 'balanced',
      ai_creativity_level: 5,
      ai_response_length: 'medium',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating profile:', error);
    throw error;
  }

  return data;
};

export const updateUserProfile = async (
  userId: string,
  updates: Partial<UserProfile>
): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export const deductTokens = async (userId: string, amount: number): Promise<boolean> => {
  const { data, error } = await supabase.rpc('deduct_tokens', {
    p_user_id: userId,
    p_amount: amount,
  });

  if (error) {
    // Fallback: manual deduction
    const profile = await getUserProfile(userId);
    if (!profile) return false;

    await updateUserProfile(userId, {
      tokens_used: (profile.tokens_used || 0) + amount,
    });
    return true;
  }

  return data?.success ?? true;
};

export const addTokens = async (userId: string, amount: number): Promise<boolean> => {
  const profile = await getUserProfile(userId);
  if (!profile) return false;

  await updateUserProfile(userId, {
    tokens_limit: (profile.tokens_limit || 0) + amount,
  });
  return true;
};

// ==================== PROJECT OPERATIONS ====================

export const createProject = async (
  name: string,
  type: Project['type'],
  description: string = '',
  aiModel: string = 'default',
  sessionState?: any
): Promise<Project | null> => {
  const user = await getCurrentUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      name,
      type,
      description,
      ai_model: aiModel,
      status: 'active',
      session_state: sessionState || {},
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating project:', error);
    throw error;
  }

  return data;
};

export const getProjects = async (type?: Project['type']): Promise<Project[]> => {
  const user = await getCurrentUser();
  if (!user) return [];

  let query = supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }

  return data || [];
};

export const getProject = async (projectId: string): Promise<Project | null> => {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) {
    console.error('Error fetching project:', error);
    return null;
  }

  return data;
};

export const updateProject = async (
  projectId: string,
  updates: Partial<Project>
): Promise<void> => {
  const { error } = await supabase
    .from('projects')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', projectId);

  if (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

export const deleteProject = async (projectId: string): Promise<void> => {
  // Messages will be cascade deleted due to FK constraint
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);

  if (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

// ==================== MESSAGE OPERATIONS ====================

export const createMessage = async (
  projectId: string,
  role: Message['role'],
  content: string,
  metadata?: Record<string, any>
): Promise<Message | null> => {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      project_id: projectId,
      role,
      content,
      metadata: metadata || {},
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating message:', error);
    throw error;
  }

  // Update project timestamp
  await updateProject(projectId, {});

  return data;
};

export const getMessages = async (projectId: string): Promise<Message[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return data || [];
};

export const updateMessage = async (
  messageId: string,
  updates: Partial<Pick<Message, 'content' | 'metadata'>>
): Promise<void> => {
  const { error } = await supabase
    .from('messages')
    .update(updates)
    .eq('id', messageId);

  if (error) {
    console.error('Error updating message:', error);
    throw error;
  }
};

// ==================== ANALYTICS ====================

export const trackEvent = async (event: {
  event_type: string;
  event_name: string;
  event_data?: Record<string, any>;
  page_name?: string;
}): Promise<void> => {
  const user = await getCurrentUser();

  await supabase.from('analytics').insert({
    user_id: user?.id || null,
    ...event,
  });
};

// ==================== TOKEN PACKS ====================

export const getTokenPacks = async () => {
  const { data, error } = await supabase
    .from('token_packs')
    .select('*')
    .eq('active', true)
    .order('price_usd', { ascending: true });

  if (error || !data?.length) {
    // Return defaults if none in DB
    return [
      { id: 'starter', name: 'Starter', tokens: 400000, price_usd: 2, popular: false, bonus_tokens: 0, active: true },
      { id: 'popular', name: 'Popular', tokens: 1000000, price_usd: 5, popular: true, bonus_tokens: 0, active: true },
      { id: 'power', name: 'Power User', tokens: 2000000, price_usd: 10, popular: false, bonus_tokens: 0, active: true },
    ];
  }

  return data;
};

// ==================== REAL-TIME SUBSCRIPTIONS ====================

export const subscribeToProjects = (
  callback: (projects: Project[]) => void,
  type?: Project['type']
) => {
  const fetchProjects = async () => {
    const projects = await getProjects(type);
    callback(projects);
  };

  // Initial fetch
  fetchProjects();

  // Subscribe to changes
  const channel = supabase
    .channel('projects-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'projects',
      },
      () => {
        fetchProjects();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const subscribeToMessages = (
  projectId: string,
  callback: (messages: Message[]) => void
) => {
  const fetchMessages = async () => {
    const messages = await getMessages(projectId);
    callback(messages);
  };

  // Initial fetch
  fetchMessages();

  // Subscribe to changes
  const channel = supabase
    .channel(`messages-${projectId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `project_id=eq.${projectId}`,
      },
      () => {
        fetchMessages();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

// ==================== STATS ====================

export const getAppStats = async () => {
  const { count: userCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { count: analyticsCount } = await supabase
    .from('analytics')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'generation');

  return {
    activeUsers: userCount || 0,
    aiGenerations: analyticsCount || 0,
    uptime: '99.9%',
    userRating: '4.8/5',
  };
};

// ==================== USAGE TRACKING ====================

export const incrementUsage = async (
  userId: string,
  featureType: 'images' | 'videos' | 'music' | 'tts' | 'ppt' | 'tokens',
  amount: number = 1
): Promise<boolean> => {
  try {
    // Get current profile
    const profile = await getUserProfile(userId);
    if (!profile) {
      console.error('[Usage] No profile found for user:', userId);
      return false;
    }

    // Build the update object
    const fieldMap: Record<string, string> = {
      images: 'images_used',
      videos: 'videos_used',
      music: 'music_used',
      tts: 'tts_used',
      ppt: 'ppt_used',
      tokens: 'tokens_used',
    };

    const fieldName = fieldMap[featureType];
    if (!fieldName) {
      console.error('[Usage] Unknown feature type:', featureType);
      return false;
    }

    // Get current value and increment
    const currentValue = (profile as any)[fieldName] || 0;
    const newValue = currentValue + amount;

    // Update the profile
    const { error } = await supabase
      .from('profiles')
      .update({
        [fieldName]: newValue,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('[Usage] Error updating usage:', error);
      return false;
    }

    console.log(`✅ [Usage] Incremented ${featureType} for user: ${currentValue} → ${newValue}`);

    // Also track in analytics for historical data
    await trackEvent({
      event_type: 'generation',
      event_name: `${featureType}_generated`,
      event_data: { amount, user_id: userId, total: newValue },
    });

    return true;
  } catch (error) {
    console.error('[Usage] Error in incrementUsage:', error);
    return false;
  }
};

// Check if user has remaining usage for a feature
export const checkUsageLimit = async (
  userId: string,
  featureType: 'images' | 'videos' | 'music' | 'tts' | 'ppt' | 'tokens'
): Promise<{ allowed: boolean; used: number; limit: number; remaining: number }> => {
  const profile = await getUserProfile(userId);
  if (!profile) {
    return { allowed: false, used: 0, limit: 0, remaining: 0 };
  }

  // Import limits dynamically to avoid circular dependency
  const { USAGE_LIMITS } = await import('./smartRouterService');
  const tier = (profile.plan || 'free').toUpperCase() as keyof typeof USAGE_LIMITS;
  const limits = USAGE_LIMITS[tier] || USAGE_LIMITS.FREE;

  const fieldMap: Record<string, string> = {
    images: 'images_used',
    videos: 'videos_used',
    music: 'music_used',
    tts: 'tts_used',
    ppt: 'ppt_used',
    tokens: 'tokens_used',
  };

  const usedField = fieldMap[featureType];
  const used = (profile as any)[usedField] || 0;
  const limit = (limits as any)[featureType] || 0;
  const remaining = Math.max(0, limit - used);

  return {
    allowed: remaining > 0,
    used,
    limit,
    remaining,
  };
};

// Reset daily usage (should be called by a cron job or on first request of the day)
export const resetDailyUsage = async (userId: string): Promise<boolean> => {
  try {
    const profile = await getUserProfile(userId);
    if (!profile) return false;

    // Check if we need to reset (last reset was on a different day)
    const lastReset = profile.last_usage_reset_at ? new Date(profile.last_usage_reset_at) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (lastReset && lastReset >= today) {
      // Already reset today
      return false;
    }

    // Reset all usage counters
    const { error } = await supabase
      .from('profiles')
      .update({
        images_used: 0,
        videos_used: 0,
        music_used: 0,
        tts_used: 0,
        ppt_used: 0,
        last_usage_reset_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      console.error('[Usage] Error resetting daily usage:', error);
      return false;
    }

    console.log('🔄 [Usage] Daily usage reset for user:', userId);
    return true;
  } catch (error) {
    console.error('[Usage] Error in resetDailyUsage:', error);
    return false;
  }
};
