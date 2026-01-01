/**
 * Presenton API Service
 * Uses Presenton.ai API for AI-powered presentation generation
 * API Docs: https://docs.presenton.ai/using-presenton-api
 */

// API Configuration
const PRESENTON_API_URL = 'https://api.presenton.ai/api/v1/ppt/presentation/generate';
const PRESENTON_API_KEY = 'sk-presenton-6c95d33e2dbd105dd3e981e5ce23561cde0ff4927f211bac26a75a3370c4fb52120efb6eaf09a675cca0130b0b0abcfe369749bf758379f9db35f4ba085358e2';

// Presenton template types
export type PresentonTemplate =
    | 'general'      // General purpose template
    | 'business'     // Business presentations
    | 'education'    // Educational content
    | 'creative'     // Creative/marketing
    | 'minimal';     // Clean minimal design

// Presenton supported languages
export type PresentonLanguage =
    | 'English'
    | 'Spanish'
    | 'French'
    | 'German'
    | 'Chinese'
    | 'Japanese'
    | 'Korean';

// Export formats
export type PresentonExport = 'pptx' | 'pdf';

// Request interface
export interface PresentonRequest {
    content: string;           // Topic or content for the presentation
    n_slides?: number;         // Number of slides (default: 5)
    language?: PresentonLanguage;
    template?: PresentonTemplate;
    export_as?: PresentonExport;
}

// Response interface
export interface PresentonResponse {
    presentation_id: string;
    path: string;              // URL to download the presentation
    edit_path: string;         // URL to edit in Presenton UI
    credits_consumed: number;
}

/**
 * Generate a presentation using Presenton API
 */
export async function generatePresentationWithPresenton(
    request: PresentonRequest
): Promise<PresentonResponse> {
    const payload = {
        content: request.content,
        n_slides: request.n_slides || 5,
        language: request.language || 'English',
        template: request.template || 'general',
        export_as: request.export_as || 'pptx'
    };

    console.log('📊 [Presenton] Generating presentation:', payload);

    const response = await fetch(PRESENTON_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${PRESENTON_API_KEY}`
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('📊 [Presenton] API Error:', response.status, errorText);
        throw new Error(`Presenton API Error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('📊 [Presenton] Generation complete:', result);

    return result as PresentonResponse;
}

/**
 * Download a presentation directly as a Blob
 */
export async function downloadPresentationBlob(downloadUrl: string): Promise<Blob> {
    const response = await fetch(downloadUrl);
    if (!response.ok) {
        throw new Error(`Failed to download presentation: ${response.status}`);
    }
    return await response.blob();
}

/**
 * Trigger browser download for a presentation
 */
export function triggerPresentationDownload(
    blob: Blob,
    filename: string = 'presentation.pptx'
): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * High-level function: Generate and optionally download a presentation
 */
export async function createPresentation(
    topic: string,
    options?: {
        slideCount?: number;
        template?: PresentonTemplate;
        language?: PresentonLanguage;
        exportFormat?: PresentonExport;
        autoDownload?: boolean;
    }
): Promise<PresentonResponse> {
    const response = await generatePresentationWithPresenton({
        content: topic,
        n_slides: options?.slideCount || 5,
        template: options?.template || 'general',
        language: options?.language || 'English',
        export_as: options?.exportFormat || 'pptx'
    });

    if (options?.autoDownload) {
        const blob = await downloadPresentationBlob(response.path);
        const filename = topic.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50) + '.pptx';
        triggerPresentationDownload(blob, filename);
    }

    return response;
}
