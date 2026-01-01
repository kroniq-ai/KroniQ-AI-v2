/**
 * Font Context - Manages font preferences across the app
 * Supports single global font or dynamic fonts per content type
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

// Available fonts organized by category
export const FONT_LIBRARY = {
    // Sans-serif fonts (modern, clean)
    'Inter': { family: 'Inter, sans-serif', category: 'sans-serif', description: 'Modern & readable' },
    'Roboto': { family: 'Roboto, sans-serif', category: 'sans-serif', description: 'Clean & professional' },
    'Open Sans': { family: '"Open Sans", sans-serif', category: 'sans-serif', description: 'Friendly & legible' },
    'Poppins': { family: 'Poppins, sans-serif', category: 'sans-serif', description: 'Geometric & stylish' },
    'Nunito': { family: 'Nunito, sans-serif', category: 'sans-serif', description: 'Rounded & warm' },
    'Lato': { family: 'Lato, sans-serif', category: 'sans-serif', description: 'Elegant & stable' },
    'Outfit': { family: 'Outfit, sans-serif', category: 'sans-serif', description: 'Fresh & contemporary' },

    // Serif fonts (classic, professional)
    'Merriweather': { family: 'Merriweather, serif', category: 'serif', description: 'Classic & readable' },
    'Playfair Display': { family: '"Playfair Display", serif', category: 'serif', description: 'Elegant & sophisticated' },
    'Lora': { family: 'Lora, serif', category: 'serif', description: 'Contemporary serif' },
    'Source Serif Pro': { family: '"Source Serif Pro", serif', category: 'serif', description: 'Balanced & professional' },

    // Monospace fonts (code)
    'JetBrains Mono': { family: '"JetBrains Mono", monospace', category: 'monospace', description: 'Coding-optimized' },
    'Fira Code': { family: '"Fira Code", monospace', category: 'monospace', description: 'Ligature-enabled code' },
    'Source Code Pro': { family: '"Source Code Pro", monospace', category: 'monospace', description: 'Clean code font' },

    // Display fonts (creative)
    'Space Grotesk': { family: '"Space Grotesk", sans-serif', category: 'display', description: 'Bold & modern' },
    'Bebas Neue': { family: '"Bebas Neue", sans-serif', category: 'display', description: 'Impactful headlines' },

    // System fonts
    'System': { family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', category: 'system', description: 'Native system font' },
};

// Content types that can have different fonts
export type ContentType = 'general' | 'headers' | 'code' | 'creative' | 'business' | 'math';

// Default font assignments for dynamic mode
export const DEFAULT_CONTENT_FONTS: Record<ContentType, string> = {
    general: 'Inter',
    headers: 'Poppins',
    code: 'JetBrains Mono',
    creative: 'Space Grotesk',
    business: 'Roboto',
    math: 'Source Code Pro',
};

export interface FontSettings {
    mode: 'single' | 'dynamic'; // Single font for all, or different fonts per content type
    singleFont: string; // Font to use when mode is 'single'
    contentFonts: Record<ContentType, string>; // Fonts per content type when mode is 'dynamic'
}

interface FontContextType {
    fontSettings: FontSettings;
    setFontMode: (mode: 'single' | 'dynamic') => void;
    setSingleFont: (font: string) => void;
    setContentFont: (contentType: ContentType, font: string) => void;
    getFontForContent: (contentType: ContentType) => string;
    getFontFamily: (fontName: string) => string;
    saveSettings: () => Promise<void>;
    loading: boolean;
}

const defaultSettings: FontSettings = {
    mode: 'single',
    singleFont: 'Inter',
    contentFonts: { ...DEFAULT_CONTENT_FONTS },
};

const FontContext = createContext<FontContextType | undefined>(undefined);

export const FontProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { currentUser } = useAuth();
    const [fontSettings, setFontSettings] = useState<FontSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);

    // Load settings from database
    useEffect(() => {
        const loadSettings = async () => {
            if (!currentUser?.id) {
                setLoading(false);
                return;
            }

            try {
                const { data } = await supabase
                    .from('user_preferences')
                    .select('font_settings')
                    .eq('user_id', currentUser.id)
                    .maybeSingle();

                if (data?.font_settings) {
                    setFontSettings({
                        ...defaultSettings,
                        ...data.font_settings,
                    });
                }
            } catch (error) {
                console.error('Failed to load font settings:', error);
            } finally {
                setLoading(false);
            }
        };

        loadSettings();
    }, [currentUser]);

    // Apply font to document
    useEffect(() => {
        const font = fontSettings.mode === 'single'
            ? FONT_LIBRARY[fontSettings.singleFont as keyof typeof FONT_LIBRARY]?.family
            : FONT_LIBRARY[fontSettings.contentFonts.general as keyof typeof FONT_LIBRARY]?.family;

        if (font) {
            document.documentElement.style.setProperty('--font-primary', font);
        }
    }, [fontSettings]);

    const setFontMode = (mode: 'single' | 'dynamic') => {
        setFontSettings(prev => ({ ...prev, mode }));
    };

    const setSingleFont = (font: string) => {
        setFontSettings(prev => ({ ...prev, singleFont: font }));
    };

    const setContentFont = (contentType: ContentType, font: string) => {
        setFontSettings(prev => ({
            ...prev,
            contentFonts: { ...prev.contentFonts, [contentType]: font },
        }));
    };

    const getFontForContent = (contentType: ContentType): string => {
        if (fontSettings.mode === 'single') {
            return FONT_LIBRARY[fontSettings.singleFont as keyof typeof FONT_LIBRARY]?.family || FONT_LIBRARY['Inter'].family;
        }
        const fontName = fontSettings.contentFonts[contentType] || DEFAULT_CONTENT_FONTS[contentType];
        return FONT_LIBRARY[fontName as keyof typeof FONT_LIBRARY]?.family || FONT_LIBRARY['Inter'].family;
    };

    const getFontFamily = (fontName: string): string => {
        return FONT_LIBRARY[fontName as keyof typeof FONT_LIBRARY]?.family || FONT_LIBRARY['Inter'].family;
    };

    const saveSettings = async () => {
        if (!currentUser?.id) return;

        try {
            await supabase.from('user_preferences').upsert({
                user_id: currentUser.id,
                font_settings: fontSettings,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });
        } catch (error) {
            console.error('Failed to save font settings:', error);
            throw error;
        }
    };

    return (
        <FontContext.Provider value={{
            fontSettings,
            setFontMode,
            setSingleFont,
            setContentFont,
            getFontForContent,
            getFontFamily,
            saveSettings,
            loading,
        }}>
            {children}
        </FontContext.Provider>
    );
};

export const useFont = () => {
    const context = useContext(FontContext);
    if (!context) {
        throw new Error('useFont must be used within a FontProvider');
    }
    return context;
};

export default FontContext;
