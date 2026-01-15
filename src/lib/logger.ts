/**
 * Production-ready Logger
 * Centralizes all logging with environment-aware behavior
 * In production (or when VITE_PRODUCTION_LOGS is not set), logs are silenced
 */

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV || import.meta.env.VITE_ENABLE_LOGS === 'true';

/**
 * Production-safe logger that only outputs in development
 */
export const logger = {
    /**
     * Log informational messages (development only)
     */
    info: (...args: unknown[]): void => {
        if (isDevelopment) {
            console.log('[KroniQ]', ...args);
        }
    },

    /**
     * Log success messages (development only)
     */
    success: (...args: unknown[]): void => {
        if (isDevelopment) {
            console.log('✅ [KroniQ]', ...args);
        }
    },

    /**
     * Log warnings (development only)
     */
    warn: (...args: unknown[]): void => {
        if (isDevelopment) {
            console.warn('⚠️ [KroniQ]', ...args);
        }
    },

    /**
     * Log errors (always logged, but sanitized in production)
     */
    error: (message: string, error?: unknown): void => {
        if (isDevelopment) {
            console.error('❌ [KroniQ]', message, error);
        } else {
            // In production, only log sanitized error message
            console.error('[KroniQ Error]', message);
        }
    },

    /**
     * Log debug messages (development only)
     */
    debug: (...args: unknown[]): void => {
        if (isDevelopment) {
            console.debug('🔍 [KroniQ]', ...args);
        }
    },

    /**
     * Group related logs (development only)
     */
    group: (label: string): void => {
        if (isDevelopment) {
            console.group(`📦 [KroniQ] ${label}`);
        }
    },

    /**
     * End log group
     */
    groupEnd: (): void => {
        if (isDevelopment) {
            console.groupEnd();
        }
    },

    /**
     * Log timing for performance (development only)
     */
    time: (label: string): void => {
        if (isDevelopment) {
            console.time(`⏱️ [KroniQ] ${label}`);
        }
    },

    /**
     * End timing log
     */
    timeEnd: (label: string): void => {
        if (isDevelopment) {
            console.timeEnd(`⏱️ [KroniQ] ${label}`);
        }
    },

    /**
     * Log a table (development only)
     */
    table: (data: unknown): void => {
        if (isDevelopment) {
            console.table(data);
        }
    },
};

/**
 * Check if logging is enabled
 */
export const isLoggingEnabled = (): boolean => isDevelopment;

/**
 * Temporarily enable logging for debugging
 * Returns a function to restore previous state
 */
let temporaryLogging = false;
export const enableTemporaryLogging = (): (() => void) => {
    const wasEnabled = temporaryLogging;
    temporaryLogging = true;
    return () => {
        temporaryLogging = wasEnabled;
    };
};

export default logger;
