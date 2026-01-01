/**
 * Firebase Configuration (Legacy)
 * 
 * NOTE: The main app has been migrated to Supabase.
 * Firebase is only used for the waitlist feature (waitlistService.ts)
 * which uses a SEPARATE Firebase project with its own config.
 * 
 * This file exports null stubs to prevent import errors from legacy code.
 */

// Export null stubs - Firebase is no longer used
// waitlistService.ts has its own Firebase config
export const auth = null as any;
export const db = null as any;
export const storage = null as any;

// Log warning if any code still tries to use this
console.warn('⚠️ firebase.ts: Main Firebase disabled - app uses Supabase. Waitlist uses separate Firebase project.');
