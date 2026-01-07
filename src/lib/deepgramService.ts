/**
 * Deepgram Text-to-Speech Service
 * Uses Deepgram's Aura-2 TTS API for high-quality voice synthesis
 */

const DEEPGRAM_API_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY;
const DEEPGRAM_BASE_URL = 'https://api.deepgram.com/v1/speak';

// Available Deepgram Aura voices
export const DEEPGRAM_VOICES = {
    // English (US)
    'aura-2-thalia-en': { name: 'Thalia', language: 'English (US)', gender: 'Female', description: 'Natural and warm' },
    'aura-2-arcas-en': { name: 'Arcas', language: 'English (US)', gender: 'Male', description: 'Deep and authoritative' },
    'aura-2-luna-en': { name: 'Luna', language: 'English (US)', gender: 'Female', description: 'Soft and friendly' },
    'aura-2-orion-en': { name: 'Orion', language: 'English (US)', gender: 'Male', description: 'Clear and professional' },
    'aura-2-stella-en': { name: 'Stella', language: 'English (US)', gender: 'Female', description: 'Energetic and bright' },
    'aura-2-helios-en': { name: 'Helios', language: 'English (US)', gender: 'Male', description: 'Calm and reassuring' },
    'aura-2-athena-en': { name: 'Athena', language: 'English (US)', gender: 'Female', description: 'Confident and clear' },
    'aura-2-zeus-en': { name: 'Zeus', language: 'English (US)', gender: 'Male', description: 'Powerful and commanding' },
};

export type DeepgramVoice = keyof typeof DEEPGRAM_VOICES;

/**
 * Check if Deepgram is configured
 */
export function isDeepgramConfigured(): boolean {
    return !!DEEPGRAM_API_KEY;
}

/**
 * Generate speech from text using Deepgram TTS
 * @param text - The text to convert to speech
 * @param voice - The voice model to use (default: aura-2-thalia-en)
 * @returns Audio blob URL for playback
 */
export async function generateSpeech(
    text: string,
    voice: DeepgramVoice = 'aura-2-thalia-en'
): Promise<string> {
    console.log('🔊 Generating speech with Deepgram:', { textLength: text.length, voice });

    if (!DEEPGRAM_API_KEY) {
        throw new Error('Deepgram API Key is missing. Please add VITE_DEEPGRAM_API_KEY to your .env file.');
    }

    if (!text || text.trim().length === 0) {
        throw new Error('Text is required for speech generation');
    }

    // Limit text to 3000 characters (Deepgram limit)
    const truncatedText = text.length > 3000 ? text.substring(0, 3000) : text;

    try {
        const response = await fetch(`${DEEPGRAM_BASE_URL}?model=${voice}`, {
            method: 'POST',
            headers: {
                'Authorization': `Token ${DEEPGRAM_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: truncatedText,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Deepgram TTS error:', response.status, errorText);
            throw new Error(`Deepgram TTS failed: ${response.status} - ${errorText}`);
        }

        // Get audio data as blob
        const audioBlob = await response.blob();

        // Create blob URL for playback
        const audioUrl = URL.createObjectURL(audioBlob);
        console.log('✅ Speech generated successfully');

        return audioUrl;
    } catch (error) {
        console.error('❌ Deepgram TTS generation error:', error);
        throw error;
    }
}

/**
 * Generate speech and return as downloadable audio file
 * @param text - The text to convert to speech
 * @param voice - The voice model to use
 * @param filename - Name for the downloaded file (without extension)
 */
export async function downloadSpeech(
    text: string,
    voice: DeepgramVoice = 'aura-2-thalia-en',
    filename: string = 'speech'
): Promise<void> {
    const audioUrl = await generateSpeech(text, voice);

    // Create download link
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${filename}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up blob URL after download
    setTimeout(() => URL.revokeObjectURL(audioUrl), 1000);
}

/**
 * Get list of available voices
 */
export function getAvailableVoices() {
    return Object.entries(DEEPGRAM_VOICES).map(([id, info]) => ({
        id,
        ...info,
    }));
}
