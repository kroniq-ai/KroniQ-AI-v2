/**
 * Centralized Types for KroniQ AI
 * Re-exports types from supabaseClient for cleaner imports
 */

// Re-export all types from supabaseClient
export type {
    Project,
    Message,
    MessageAttachment,
    UserProfile
} from './lib/supabaseClient';

// Additional UI-specific types

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    model?: string;
    isStreaming?: boolean;
}

export interface Studio {
    id: string;
    name: string;
    icon: string;
    description: string;
    tier: 'FREE' | 'STARTER' | 'PRO' | 'PREMIUM';
}

export type ThemeType = 'pure-white' | 'ocean-dark' | 'cyber-dark' | 'midnight-purple';
