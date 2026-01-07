/**
 * Pixazo Free Image Generation Service
 * Uses Flux-1 Schnell model - 100% FREE for all resolutions!
 * 
 * This is used as a FREE fallback when KIE API budget is exhausted
 */

// SECURITY: No fallback - API key MUST be in environment
const PIXAZO_API_KEY = import.meta.env.VITE_PIXAZO_API_KEY || '';
const PIXAZO_BASE_URL = 'https://gateway.pixazo.ai/flux-1-schnell/v1';

export interface PixazoImageRequest {
    prompt: string;
    num_steps?: number; // 1-8, default 4
    seed?: number;
    height?: number; // default 1024
    width?: number; // default 1024
}

export interface PixazoImageResponse {
    output?: string;
    job_set_id?: string;
    error?: string;
}

/**
 * Generate an image using Pixazo Flux Schnell (FREE!)
 * @param prompt - Text description of the image to generate
 * @param width - Image width (default 1024)
 * @param height - Image height (default 1024)
 * @returns URL of the generated image
 */
export async function generatePixazoImage(
    prompt: string,
    width: number = 1024,
    height: number = 1024
): Promise<string> {
    console.log('🖼️ Generating FREE image with Pixazo Flux Schnell:', { prompt: prompt.substring(0, 50) + '...' });

    if (!PIXAZO_API_KEY) {
        throw new Error('Pixazo API Key is missing. Please add VITE_PIXAZO_API_KEY to your .env file.');
    }

    try {
        const response = await fetch(`${PIXAZO_BASE_URL}/getData`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                'Ocp-Apim-Subscription-Key': PIXAZO_API_KEY
            },
            body: JSON.stringify({
                prompt,
                num_steps: 4,
                height,
                width
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Pixazo error:', response.status, errorText);
            throw new Error(`Pixazo API error: ${response.status}`);
        }

        const data: PixazoImageResponse = await response.json();

        // If we get a direct output URL, return it
        if (data.output) {
            console.log('✅ Pixazo image generated successfully');
            return data.output;
        }

        // If we get a job_set_id, poll for results
        if (data.job_set_id) {
            return await pollPixazoResult(data.job_set_id);
        }

        throw new Error('No output or job_set_id in Pixazo response');
    } catch (error) {
        console.error('❌ Pixazo image generation error:', error);
        throw error;
    }
}

/**
 * Poll for Pixazo generation results
 */
async function pollPixazoResult(jobSetId: string, maxAttempts: number = 30): Promise<string> {
    console.log('⏳ Polling Pixazo for results...');

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between polls

        const response = await fetch(`${PIXAZO_BASE_URL}/getGenerationResults`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache',
                'Ocp-Apim-Subscription-Key': PIXAZO_API_KEY
            },
            body: JSON.stringify({ job_set_id: jobSetId })
        });

        if (!response.ok) continue;

        const data = await response.json();

        if (data.status === 'completed' && data.output) {
            console.log('✅ Pixazo image ready');
            return data.output;
        }

        if (data.status === 'failed') {
            throw new Error('Pixazo generation failed');
        }
    }

    throw new Error('Pixazo polling timeout');
}

/**
 * Check if Pixazo is configured and ready
 */
export function isPixazoConfigured(): boolean {
    return !!PIXAZO_API_KEY;
}
