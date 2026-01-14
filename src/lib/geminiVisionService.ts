/**
 * Gemini Vision Service
 * Direct API call to Google's Gemini for image analysis
 * Uses VITE_GEMINI_API_KEY (same key as Google Lyria service)
 */

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

    console.log('🔍 [Gemini Vision] Analyzing image with Gemini 2.0 Flash');
    console.log('🔍 [Gemini Vision] Prompt:', prompt.substring(0, 100) + '...');
    console.log('🔍 [Gemini Vision] Images count:', images.length);

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
            console.error('❌ [Gemini Vision] API error:', response.status, errorText);
            throw new Error(`Gemini API Error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        console.log('✅ [Gemini Vision] Response received');

        // Extract text from response
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
            console.error('❌ [Gemini Vision] No text in response:', data);
            throw new Error('No content in Gemini response');
        }

        return {
            content: text,
            model: 'gemini-2.0-flash'
        };
    } catch (error: any) {
        console.error('❌ [Gemini Vision] Error:', error);
        throw error;
    }
}

/**
 * Check if Gemini Vision is properly configured
 */
export function isGeminiVisionConfigured(): boolean {
    return !!GEMINI_API_KEY;
}
