/**
 * Gemini Vision Service
 * Direct API call to Google's Gemini for image analysis
 * Uses VITE_GEMINI_API_KEY (same key as Google Lyria service)
 */

import { logger } from './logger';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface GeminiVisionResponse {
    content: string;
    model: string;
}

/**
 * Analyze an image using Gemini Vision API directly
 */
export async function analyzeImageWithGemini(
    prompt: string,
    images: { base64: string; mimeType: string }[]
): Promise<GeminiVisionResponse> {
    if (!GEMINI_API_KEY) {
        throw new Error('Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.');
    }

    logger.info('Analyzing image with Gemini 2.0 Flash');
    logger.debug('Prompt:', prompt.substring(0, 100) + '...');
    logger.debug('Images count:', images.length);

    // Build the parts array with text and images
    const parts: any[] = [
        { text: prompt || 'Please analyze this image and describe what you see in detail.' }
    ];

    // Add each image as inline data
    for (const img of images) {
        parts.push({
            inline_data: {
                mime_type: img.mimeType,
                data: img.base64
            }
        });
    }

    const requestBody = {
        contents: [
            {
                parts: parts
            }
        ],
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192
        },
        safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' }
        ]
    };

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            logger.error('Gemini Vision API error', { status: response.status, error: errorText });
            throw new Error(`Gemini API Error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        logger.success('Gemini Vision response received');

        // Extract text from response
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
            logger.error('No text in Gemini response', data);
            throw new Error('No content in Gemini response');
        }

        return {
            content: text,
            model: 'gemini-2.0-flash'
        };
    } catch (error: any) {
        logger.error('Gemini Vision error', error);
        throw error;
    }
}

/**
 * Check if Gemini Vision is properly configured
 */
export function isGeminiVisionConfigured(): boolean {
    return !!GEMINI_API_KEY;
}

/**
 * Generate a concise, descriptive chat title based on the conversation
 * Uses Gemini to understand the context and create a short title
 */
export async function generateChatTitle(
    userMessage: string,
    aiResponse?: string
): Promise<string> {
    if (!GEMINI_API_KEY) {
        // Fallback to truncated message if no API key
        return userMessage.slice(0, 40) + (userMessage.length > 40 ? '...' : '');
    }

    try {
        const prompt = `Generate a very short, concise title (max 5 words) for this conversation. 
The title should capture the main topic or intent.
Return ONLY the title, no quotes, no explanation.

User's message: "${userMessage.slice(0, 500)}"
${aiResponse ? `AI's response preview: "${aiResponse.slice(0, 200)}"` : ''}

Title:`;

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 20
                }
            })
        });

        if (!response.ok) {
            throw new Error('Gemini title generation failed');
        }

        const data = await response.json();
        const title = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (title && title.length > 0 && title.length <= 60) {
            return title;
        }

        // Fallback to truncated message
        return userMessage.slice(0, 40) + (userMessage.length > 40 ? '...' : '');
    } catch (error) {
        logger.warn('Chat title generation failed, using fallback', error);
        return userMessage.slice(0, 40) + (userMessage.length > 40 ? '...' : '');
    }
}
