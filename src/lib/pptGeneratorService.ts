/**
 * PowerPoint Generator Service - Using Presenton API
 * 
 * Generates professional presentations using Presenton API
 * with automatic download functionality
 */

// ===== TYPES =====

export interface SlidePreview {
    title: string;
    bullets?: string[];
    subtitle?: string;
}

export interface PPTGenerationResult {
    success: boolean;
    downloadUrl?: string;
    fileName?: string;
    error?: string;
    templateUsed?: string;
    presentationId?: string;
    slides?: SlidePreview[];
}

// ===== API CONFIGURATION =====

const PRESENTON_API_BASE = 'https://api.presenton.ai/api/v1/ppt';

const getApiKey = () => {
    return (import.meta as any).env?.VITE_PRESENTON_API_KEY || '';
};

// ===== TEMPLATE OPTIONS =====

export const TEMPLATE_LIST = [
    { id: 'general', name: 'General', category: 'general' },
    { id: 'modern', name: 'Modern', category: 'business' },
    { id: 'standard', name: 'Standard', category: 'general' },
    { id: 'swift', name: 'Swift', category: 'minimal' },
];

export const THEME_LIST = [
    { id: 'professional-blue', name: 'Professional Blue' },
    { id: 'professional-dark', name: 'Professional Dark' },
    { id: 'edge-yellow', name: 'Edge Yellow' },
    { id: 'light-rose', name: 'Light Rose' },
    { id: 'mint-blue', name: 'Mint Blue' },
];

// ===== MAIN GENERATION FUNCTION =====

export async function generatePresentation(
    topic: string,
    options: {
        slideCount?: number;
        template?: string;
        theme?: string;
        tone?: string;
    } = {}
): Promise<PPTGenerationResult> {
    const apiKey = getApiKey();
    const slideCount = Math.min(Math.max(options.slideCount || 8, 3), 15);

    console.log('📊 [PPT] Starting Presenton generation for:', topic);
    console.log('📊 [PPT] Slide count:', slideCount);

    if (!apiKey) {
        console.error('📊 [PPT] No API key found, using fallback client-side generation');
        return fallbackClientSideGeneration(topic, slideCount);
    }

    try {
        // Call Presenton API to generate presentation synchronously
        const response = await fetch(`${PRESENTON_API_BASE}/presentation/generate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                content: topic,
                n_slides: slideCount,
                template: options.template || 'modern',
                theme: options.theme || 'professional-blue',
                tone: options.tone || 'professional',
                verbosity: 'standard',
                markdown_emphasis: true,
                image_type: 'stock',
                language: 'English',
                include_title_slide: true,
                export_as: 'pptx',
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('📊 [PPT] API Error:', response.status, errorText);
            throw new Error(`Presenton API error: ${response.status}`);
        }

        const result = await response.json();
        console.log('📊 [PPT] Generation result:', result);

        if (result.path) {
            // The API returns a path which is the download URL
            const downloadUrl = result.path;
            const fileName = `${topic.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)}_presentation.pptx`;

            // Trigger download
            console.log('📊 [PPT] Triggering download from:', downloadUrl);
            await downloadFile(downloadUrl, fileName);

            return {
                success: true,
                downloadUrl,
                fileName,
                templateUsed: options.template || 'Modern',
                presentationId: result.presentation_id,
            };
        }

        throw new Error('No download path in API response');

    } catch (error: any) {
        console.error('📊 [PPT] API generation failed, using fallback:', error.message);
        return fallbackClientSideGeneration(topic, slideCount);
    }
}

// ===== DOWNLOAD HELPER =====

async function downloadFile(url: string, fileName: string): Promise<void> {
    try {
        const response = await fetch(url);
        const blob = await response.blob();

        // Create download link
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();

        // Cleanup
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl);
        }, 1000);

        console.log('📊 [PPT] Download triggered successfully');
    } catch (error) {
        console.error('📊 [PPT] Download failed, opening in new tab:', error);
        window.open(url, '_blank');
    }
}

// ===== FALLBACK CLIENT-SIDE GENERATION =====

async function fallbackClientSideGeneration(
    topic: string,
    slideCount: number
): Promise<PPTGenerationResult> {
    try {
        // Dynamic import PptxGenJS for fallback
        const PptxGenJS = (await import('pptxgenjs')).default;

        console.log('📊 [PPT] Using fallback client-side generation...');

        // Generate slide content using LLM
        const slides = await generateSlideContent(topic, slideCount);

        // Build presentation
        const pptx = new PptxGenJS();
        pptx.author = 'KroniQ AI';
        pptx.title = topic;
        pptx.company = 'KroniQ AI';

        const primaryColor = '1a1a2e';
        const accentColor = '7c3aed';
        const textColor = '333333';

        for (let i = 0; i < slides.length; i++) {
            const slideData = slides[i];
            const slide = pptx.addSlide();
            slide.background = { color: 'ffffff' };

            if (i === 0) {
                // Title slide
                slide.addText(slideData.title, {
                    x: 0.5, y: '35%', w: '90%', h: 1.2,
                    fontSize: 44, bold: true, color: primaryColor, align: 'center', fontFace: 'Arial'
                });
                slide.addShape('rect' as any, {
                    x: '35%', y: '48%', w: '30%', h: 0.04, fill: { color: accentColor }
                });
                if (slideData.subtitle) {
                    slide.addText(slideData.subtitle, {
                        x: 0.5, y: '55%', w: '90%', h: 0.6,
                        fontSize: 20, color: accentColor, align: 'center', fontFace: 'Arial'
                    });
                }
            } else if (i === slides.length - 1) {
                // Closing slide
                slide.addText(slideData.title || 'Thank You', {
                    x: 0.5, y: '40%', w: '90%', h: 1,
                    fontSize: 42, bold: true, color: primaryColor, align: 'center', fontFace: 'Arial'
                });
            } else {
                // Content slide
                slide.addText(slideData.title, {
                    x: 0.6, y: 0.5, w: '90%', h: 0.8,
                    fontSize: 32, bold: true, color: primaryColor, fontFace: 'Arial'
                });
                slide.addShape('rect' as any, {
                    x: 0.6, y: 1.25, w: 2, h: 0.04, fill: { color: accentColor }
                });
                if (slideData.bullets && slideData.bullets.length > 0) {
                    let yPos = 1.7;
                    for (const bullet of slideData.bullets.slice(0, 5)) {
                        slide.addShape('ellipse' as any, {
                            x: 0.6, y: yPos + 0.12, w: 0.12, h: 0.12, fill: { color: accentColor }
                        });
                        slide.addText(bullet, {
                            x: 0.9, y: yPos, w: '80%', h: 0.5,
                            fontSize: 18, color: textColor, fontFace: 'Arial'
                        });
                        yPos += 0.65;
                    }
                }
            }
        }

        const fileName = `${topic.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)}_presentation.pptx`;

        // Trigger download
        await pptx.writeFile({ fileName });

        return {
            success: true,
            fileName,
            templateUsed: 'KroniQ Modern',
            slides: slides,
        };

    } catch (error: any) {
        console.error('📊 [PPT] Fallback generation failed:', error);
        return {
            success: false,
            error: error.message || 'Generation failed',
        };
    }
}

// ===== SLIDE CONTENT GENERATION =====

interface SlideContent {
    title: string;
    bullets?: string[];
    subtitle?: string;
}

async function generateSlideContent(topic: string, slideCount: number): Promise<SlideContent[]> {
    const OPENROUTER_API_KEY = (import.meta as any).env?.VITE_OPENROUTER_API_KEY || '';

    const prompt = `Create content for a ${slideCount}-slide presentation about: "${topic}"

Return a JSON array of slides:
[
  {"title": "Main Title", "subtitle": "Subtitle here"},
  {"title": "Introduction", "bullets": ["Point 1", "Point 2", "Point 3"]},
  {"title": "Key Topic", "bullets": ["Detail 1", "Detail 2"]},
  {"title": "Conclusion", "subtitle": "Thank you"}
]

Rules:
- First slide: title + subtitle only
- Content slides: title + 3-4 bullets max
- Last slide: conclusion/thank you
- Keep bullets under 10 words each
- Return ONLY the JSON array`;

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://kroniq.ai',
                'X-Title': 'KroniQ AI Platform',
            },
            body: JSON.stringify({
                model: 'google/gemini-2.0-flash-001',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 2000,
            }),
        });

        if (!response.ok) {
            throw new Error(`LLM API error: ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        const jsonMatch = content.match(/\[[\s\S]*\]/);

        if (!jsonMatch) {
            throw new Error('Failed to parse JSON from LLM');
        }

        return JSON.parse(jsonMatch[0]) as SlideContent[];
    } catch (error) {
        console.error('📊 [PPT] LLM generation failed, using default slides');
        // Return default slides as fallback
        return [
            { title: topic, subtitle: 'Presentation by KroniQ AI' },
            { title: 'Overview', bullets: ['Introduction to the topic', 'Key concepts', 'Important details'] },
            { title: 'Key Points', bullets: ['Main point 1', 'Main point 2', 'Main point 3'] },
            { title: 'Details', bullets: ['Supporting information', 'Examples and cases', 'Additional context'] },
            { title: 'Thank You', subtitle: 'Questions?' },
        ];
    }
}

// ===== HELPERS =====

export function getTemplates() {
    return TEMPLATE_LIST;
}

export function getThemes() {
    return THEME_LIST;
}

export function downloadPresentation(url: string, fileName: string): void {
    downloadFile(url, fileName);
}
