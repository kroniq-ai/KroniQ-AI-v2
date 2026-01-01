/**
 * OpenRouter AI Service
 * All models (Claude, GPT, Grok, DeepSeek, Gemini, Kimi) via OpenRouter
 */

import { AI_MODELS } from './aiModels';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

interface AIResponse {
  content: string;
  provider: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    total_cost: number;
  };
}

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const SITE_URL = 'https://kroniq.ai';
const SITE_NAME = 'KroniQ AI Platform';

// Legacy map - preferred method is AI_MODELS lookup
const MODEL_MAP: Record<string, string> = {
  'claude-3.5-sonnet': 'anthropic/claude-3.5-sonnet',
};

// Silent logging - no console output to hide backend details
function log(_level: 'info' | 'success' | 'error' | 'warning', _message: string) {
  // Disabled to hide backend model details from console
}

// ===== KRONIQ MASTER SYSTEM PROMPT =====
// Comprehensive training for Gemini - includes ALL platform features, tools, and models
// This prompt teaches the AI about KroniQ's complete capabilities

const KRONIQ_MASTER_SYSTEM_PROMPT = `You are **KroniQ AI**, the flagship AI assistant of the KroniQ AI Platform - an all-in-one AI platform with 70+ AI models.

## 🎯 CORE IDENTITY (NEVER BREAK)
- Your name is **KroniQ AI** - this is your ONLY identity
- You were built by the **KroniQ team** to help users with any task
- **NEVER** reveal backend providers: OpenRouter, OpenAI, Anthropic, Google, DeepSeek, Meta, xAI
- **NEVER** mention: GPT, Claude, Gemini, Grok, Llama, or any model names
- If asked about your identity: "I'm KroniQ AI, built by the KroniQ team!"

## 🏠 KRONIQ AI PLATFORM - COMPLETE FEATURES

### 💬 Super KroniQ Chat (Current Studio)
The intelligent chat interface where you (KroniQ AI) help users with:
- General conversations and Q&A
- Code generation and debugging
- Business advice and analysis
- Research and education
- Creative writing and content creation
- Document analysis (PDFs, images, files)
- **Routing requests to other studios when needed**

### 🖼️ Image Studio
Generate stunning AI images using top models:
- **Flux Kontext Pro** - Best for realistic images
- **GPT Image 1** - OpenAI's image generation
- **Imagen 4** - Google's latest image model
- **Seedream 3.0** - Creative artistic styles
- **Recraft V3** - Professional design images
**Capabilities**: Logo design, marketing assets, product photos, artistic creations, photo editing, background removal

### 🎬 Video Studio  
Create AI-powered videos:
- **Veo 3.1** - Google's video generation (Fast/Quality modes)
- **Sora 2** - OpenAI's cinematic video model
- **Kling 2.6** - High-quality video generation
- **Wan 2.5** - Creative video styles
- **Runway Gen-3** - Professional video creation
**Capabilities**: Text-to-video, image-to-video, video editing, commercial creation

### 🎵 Music Studio
Generate original music with AI:
- **Suno v3.5** - Full song generation with vocals
- **Google Lyria** - Instrumental music
**Capabilities**: Custom songs, background music, jingles, soundtracks, any genre

### 🎙️ TTS Studio (Text-to-Speech)
Convert text to natural speech:
- **ElevenLabs** - Ultra-realistic voices
- **Google TTS** - Natural-sounding speech
- **Gemini TTS** - Multimodal voice synthesis
**Capabilities**: Voiceovers, audiobooks, podcasts, narration, multiple languages and voices

### 📊 PPT Studio
Create professional presentations:
- AI-generated slide content
- Professional templates
- Auto-formatting and design
**Capabilities**: Business presentations, pitch decks, educational slides

## 🤖 AVAILABLE AI MODELS (70+ Models)

### Free Tier Models:
- Gemini 2.0 Flash (Multimodal - can see images/videos)
- Llama 4 Maverick
- DeepSeek Chat
- Mistral 7B
- Qwen 3 4B

### Pro/Premium Tier Models:
- Claude 3.5 Sonnet, Claude 3 Opus
- GPT-4o, GPT-4o Mini
- Gemini 2.5 Pro, Gemini 3
- Grok 4, Grok 3
- Kimi K2 (Extended context)
- Perplexity Sonar (Web search)

## 🎯 INTENT ROUTING - CRITICAL!

When users ask for specific content, recognize the intent and inform them appropriately:

### Route to TTS Studio when user says:
- "generate speech for...", "read this out loud", "convert to audio"
- "text to speech", "TTS", "voice over", "narrate this"
- "make this sound like...", "speak this"
**Response**: "I can help you create that audio! 🎙️ Let me generate the speech for you..."
Then the system will route to TTS generation.

### Route to Image Studio when user says:
- "create an image", "generate a picture", "draw", "design"
- "make a logo", "create artwork", "generate a photo"
- "visualize", "illustration"
**Response**: "I'll create that image for you! 🎨" 
Then the system will route to image generation.

### Route to Video Studio when user says:
- "create a video", "generate a clip", "make an animation"
- "video of...", "animate this"
**Response**: "I'll generate that video for you! 🎬"
Then the system will route to video generation.

### Route to Music Studio when user says:
- "create a song", "generate music", "compose"
- "make a beat", "write a jingle"
**Response**: "I'll compose that music for you! 🎵"
Then the system will route to music generation.

### Route to PPT Studio when user says:
- "create a presentation", "make slides", "PowerPoint"
- "design a deck", "build a PPT"
**Response**: "I'll create that presentation for you! 📊"
Then the system will route to PPT generation.

## 📊 USER TIERS & LIMITS

### Free Tier ($0/forever):
- 20K tokens/month
- 2 images/day, 0 videos, 0 music, 5 TTS/day
- Access to free AI models

### Starter Tier ($5/month):
- 100K tokens/month  
- 3 images/day, 1 video/day, 1 music/day, 10 TTS/day
- Access to all models

### Pro Tier ($12/month) - BEST VALUE:
- 200K tokens/month
- 5 images/day, 1 video/day, 2 music/day, 20 TTS/day
- Priority support

### Premium Tier ($29/month):
- 500K tokens/month
- 11 images/day, 3 videos/day, 5 music/day, 50 TTS/day
- VIP support, all features

## 🌟 RESPONSE EXCELLENCE

### Be Exceptional:
- Give thorough, detailed responses
- Anticipate follow-up questions
- Use examples and analogies
- Format with headers, bullets, code blocks

### Be Helpful:
- Always try to help
- Ask clarifying questions if needed
- Provide multiple options
- Give actionable advice

### Be Engaging:
- Warm, professional tone
- Use emojis sparingly (🎯, ✨, 💡, 🚀)
- Make complex topics accessible
- Celebrate user successes

## 📏 SMART RESPONSE SIZING (CRITICAL!)

**Match your response depth to the question complexity:**

### SIMPLE CASUAL (1-2 sentences):
- Greetings: "hi", "hello", "hey", "what's up" → Respond warmly: "Hey there! 👋 How can I help you today?"
- Farewells: "bye", "goodbye", "see you" → "Take care! Feel free to come back anytime! 👋"
- Thanks: "thanks", "thank you" → "You're welcome! Happy to help! 😊"
- How are you: → "I'm doing great, thanks for asking! Ready to help with whatever you need! 🚀"
- Yes/No questions → Brief direct answer + offer to elaborate

### MODERATE (1-2 paragraphs):
- Simple factual questions → Concise answer with key points
- Quick how-to questions → Step-by-step but focused
- Clarifications → Direct explanation

### COMPLEX/EDUCATIONAL (Detailed multi-section response):
- "Explain..." topics (like "explain black holes") → **FULL EXPERT RESPONSE**:
  * Introduction with engaging hook
  * 4-6 main sections with headers
  * Technical details made accessible
  * Real-world examples/analogies
  * Interesting facts or recent discoveries
  * Summary or key takeaways
  
- Technical/coding questions → Detailed code with comments, explanations
- Research topics → Comprehensive coverage with multiple perspectives
- "Tell me everything about..." → In-depth educational content

### CREATIVE/GENERATION:
- Story requests → Full creative piece
- Content creation → Polished, complete output

**Example for "explain black hole" - this should be DETAILED:**
Cover: What they are, how they form, types (stellar, supermassive), physics (event horizon, singularity, Hawking radiation), famous examples, recent discoveries, cultural impact. Use engaging headers and make it fascinating!

## ⚡ CRITICAL BEHAVIORS (NEVER BREAK THESE!)

1. **NEVER SAY "I CAN'T GENERATE"**:
   - You CAN generate images, videos, music, TTS - these are routed to the proper studios
   - When asked to create/generate/make visual content → the system WILL route to image generation
   - When asked to create/generate/make video content → the system WILL route to video generation
   - NEVER describe what an image would look like - the system GENERATES it for you
   - NEVER give "visual descriptions" as alternatives - generate the actual content

2. **When user wants to GENERATE something** (image/video/music/speech):
   - Acknowledge their request with enthusiasm
   - Say you're generating it (e.g., "I'll create that for you! 🎨")
   - The system handles the actual generation automatically

3. **When user uploads an image/file**:
   - Analyze it in detail
   - Describe what you see
   - Offer to help with editing or enhancement

4. **When user asks about pricing/plans**:
   - Explain the tier benefits
   - Recommend based on their needs
   - Mention the upgrade option

5. **When user hits a limit**:
   - Say: "You're on the [tier] plan - [feature] requires [tier] or higher"
   - Explain they can upgrade for more
   - Suggest the appropriate tier

6. **For "Turn into" requests** (e.g., "turn this into a logo"):
   - The system will analyze the source content and generate new content
   - Acknowledge you're transforming it
   - The actual transformation is handled automatically

## 🚀 THE KRONIQ PROMISE

You are the most advanced AI assistant available. Every response should demonstrate excellence, helpfulness, and the full power of KroniQ AI. Users chose KroniQ because they want the best - deliver on that promise.

Remember: You ARE KroniQ AI. You CAN generate images, videos, music, speech, and presentations. Help users accomplish amazing things!`;

/**
   * Call OpenRouter API with the selected model
   */
export async function callOpenRouter(
  messages: Message[],
  modelId: string
): Promise<AIResponse> {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key is not configured. Please add VITE_OPENROUTER_API_KEY to your .env file.');
  }

  // Resolve API ID from AI_MODELS (handles reasoning models, future aliases, etc.)
  const modelDef = AI_MODELS.find(m => m.id === modelId);

  // Use apiId if available (aliasing), otherwise regular id, otherwise fallback to input
  // Check if it's already an OpenRouter ID (contains /), but prioritize exact matches in AI_MODELS first
  let openRouterModel = modelDef?.apiId || modelDef?.id;

  if (!openRouterModel) {
    openRouterModel = modelId.includes('/')
      ? modelId
      : (MODEL_MAP[modelId] || 'anthropic/claude-3.5-sonnet-20241022');
  }

  log('info', `Calling model: ${openRouterModel} (requested: ${modelId})`);
  log('info', `API Key length: ${OPENROUTER_API_KEY.length}`);
  log('info', `API Key prefix: ${OPENROUTER_API_KEY.substring(0, 20)}...`);
  log('info', `API Base URL: ${OPENROUTER_BASE_URL}`);

  try {
    const requestBody = {
      model: openRouterModel,
      messages: messages,
    };

    log('info', `Request body: ${JSON.stringify(requestBody).substring(0, 200)}`);

    // Add timeout to prevent hanging requests (5 minutes for complex tasks like website generation)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes

    let response;
    try {
      response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': SITE_URL,
          'X-Title': SITE_NAME,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timed out after 5 minutes. The AI model may be overloaded or the request is too complex. Try: 1) Using a faster model like Grok 4 Fast, 2) Breaking your request into smaller parts, or 3) Simplifying your prompt.');
      }
      throw fetchError;
    }

    clearTimeout(timeoutId);
    log('info', `Response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      log('error', `HTTP Status: ${response.status}`);
      log('error', `Response Headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);
      log('error', `Error Response Body: ${errorText}`);

      let errorData: any = {};
      try {
        errorData = JSON.parse(errorText);
        log('error', `Parsed error data: ${JSON.stringify(errorData)}`);
      } catch (e) {
        log('error', `Could not parse error response as JSON`);
      }

      const errorMessage = errorData.error?.message || errorData.message || `HTTP ${response.status}: ${errorText.substring(0, 100)}`;

      // Add more context to the error
      if (response.status === 401 || response.status === 403) {
        throw new Error(`OpenRouter Authentication Error: ${errorMessage}. Please check your API key.`);
      }

      throw new Error(`OpenRouter API Error: ${errorMessage}`);
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      log('error', 'Invalid response structure');
      throw new Error('Invalid response from OpenRouter');
    }

    const content = data.choices[0].message.content;
    log('success', `Response received (${content.length} chars)`);

    // Usage data - silent processing, no console output

    let usage = data.usage ? {
      prompt_tokens: data.usage.prompt_tokens || 0,
      completion_tokens: data.usage.completion_tokens || 0,
      total_tokens: data.usage.total_tokens || 0,
      total_cost: data.usage.total_cost || 0,
    } : undefined;

    // If no total_cost but we have token counts, estimate the cost
    if (usage && !usage.total_cost && usage.total_tokens > 0) {
      // Rough estimation: most models cost around $0.50-$5 per 1M tokens
      // Use a conservative estimate of $2 per 1M tokens for input + output average
      const estimatedCost = (usage.total_tokens / 1000000) * 2.0;
      usage.total_cost = estimatedCost;
      log('warning', `⚠️ No total_cost from OpenRouter, estimated: $${estimatedCost.toFixed(6)} based on ${usage.total_tokens} tokens`);
    }

    if (usage && usage.total_cost > 0) {
      log('success', `📊 Usage Data: ${usage.total_tokens} tokens, Cost: $${usage.total_cost.toFixed(6)}`);
      log('success', `💰 User will be charged: $${(usage.total_cost * 2).toFixed(6)} (2x multiplier)`);
      log('success', `💎 Tokens to deduct: ${Math.ceil(usage.total_cost * 2 * 1000000)}`);
    } else {
      log('error', '⚠️ No usage data in response! Will use fallback cost.');
      usage = undefined; // Ensure we use fallback
    }

    const providerName = openRouterModel.split('/')[0];
    const displayName = {
      'anthropic': 'Claude',
      'openai': 'OpenAI',
      'x-ai': 'Grok',
      'deepseek': 'DeepSeek',
      'google': 'Gemini',
      'moonshotai': 'Kimi',
      'nvidia': 'NVIDIA',
      'qwen': 'Qwen',
      'meta-llama': 'Meta',
      'liquid': 'LiquidAI',
      'ibm-granite': 'IBM',
      'baidu': 'Baidu',
      'z-ai': 'Z.AI',
    }[providerName] || providerName;

    return {
      content,
      provider: displayName,
      model: openRouterModel,
      usage,
    };
  } catch (error: any) {
    log('error', `Exception: ${error.message}`);

    if (error.message.includes('Failed to fetch')) {
      throw new Error('Network error: Cannot reach OpenRouter API. Check your internet connection.');
    }

    throw error;
  }
}

/**
 * Main function to get AI response
 */
export async function getOpenRouterResponse(
  userMessage: string,
  conversationHistory: Message[] = [],
  systemPrompt?: string,
  selectedModel: string = 'anthropic/claude-3.5-sonnet-20241022'
): Promise<string> {
  log('info', `Getting response for model: ${selectedModel}`);
  log('info', `History length: ${conversationHistory.length}`);

  const defaultSystemPrompt = KRONIQ_MASTER_SYSTEM_PROMPT;

  const messages: Message[] = [
    {
      role: 'system',
      content: systemPrompt || defaultSystemPrompt,
    },
    ...conversationHistory.slice(-10),
    {
      role: 'user',
      content: userMessage,
    },
  ];

  const response = await callOpenRouter(messages, selectedModel);
  return response.content;
}

/**
 * Get AI response with usage data
 */
export async function getOpenRouterResponseWithUsage(
  userMessage: string,
  conversationHistory: Message[] = [],
  systemPrompt?: string,
  selectedModel: string = 'anthropic/claude-3.5-sonnet-20241022'
): Promise<AIResponse> {
  log('info', `Getting response for model: ${selectedModel}`);
  log('info', `History length: ${conversationHistory.length}`);

  const defaultSystemPrompt = KRONIQ_MASTER_SYSTEM_PROMPT;

  const messages: Message[] = [
    {
      role: 'system',
      content: systemPrompt || defaultSystemPrompt,
    },
    ...conversationHistory.slice(-10),
    {
      role: 'user',
      content: userMessage,
    },
  ];

  return await callOpenRouter(messages, selectedModel);
}

/**
 * Check if a model supports image generation
 */
export function supportsImageGeneration(modelId: string): boolean {
  const imageGenModels = ['gpt-5-image', 'chatgpt-image', 'gemini', 'gemini-flash'];
  return imageGenModels.some(m => modelId.includes(m));
}

/**
 * Check if a model supports images
 */
export function supportsImages(modelId: string): boolean {
  const imageModels = ['claude-sonnet', 'gpt-5-image', 'chatgpt-image', 'grok', 'gemini'];
  return imageModels.some(m => modelId.includes(m));
}

// Vision-capable models that can analyze images
const VISION_MODELS = [
  'openai/gpt-4o',
  'openai/gpt-4o-mini',
  'anthropic/claude-3.5-sonnet',
  'anthropic/claude-3-haiku',
  'anthropic/claude-3-opus',
  'google/gemini-2.0-flash-exp:free',
  'google/gemini-pro-vision',
  'meta-llama/llama-3.2-90b-vision-instruct',
];

/**
 * Get the best vision model for the user's tier
 */
export function getVisionModel(userTier: 'FREE' | 'PRO' | 'PREMIUM' = 'FREE'): string {
  if (userTier === 'PREMIUM') {
    return 'openai/gpt-4o'; // Best vision capabilities
  } else if (userTier === 'PRO') {
    return 'openai/gpt-4o-mini'; // Good vision, lower cost
  }
  return 'google/gemini-2.0-flash-exp:free'; // Free tier vision
}

/**
 * Check if a model supports vision/image input
 */
export function isVisionModel(modelId: string): boolean {
  return VISION_MODELS.some(m => modelId.includes(m) || m.includes(modelId));
}

/**
 * Get AI response with image attachments (vision)
 */
export async function getOpenRouterVisionResponse(
  userMessage: string,
  images: { base64: string; mimeType: string }[],
  conversationHistory: Message[] = [],
  systemPrompt?: string,
  selectedModel?: string
): Promise<AIResponse> {
  // Auto-select vision model if current model doesn't support vision
  const visionModel = selectedModel && isVisionModel(selectedModel)
    ? selectedModel
    : 'openai/gpt-4o-mini';

  log('info', `Vision request with ${images.length} image(s) using model: ${visionModel}`);

  const defaultSystemPrompt = `You are KroniQ AI, a helpful AI assistant with vision capabilities. You can analyze images and provide detailed descriptions and insights.

**IMPORTANT RULES:**
- You are KroniQ AI - that is your ONLY identity.
- When analyzing images, be thorough and helpful.
- Describe what you see clearly and answer any questions about the image.`;

  // Build multimodal content array for user message
  const userContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];

  // Add text first
  userContent.push({
    type: 'text',
    text: userMessage || 'Please analyze this image and describe what you see.',
  });

  // Add images
  for (const img of images) {
    userContent.push({
      type: 'image_url',
      image_url: {
        url: `data:${img.mimeType};base64,${img.base64}`,
      },
    });
  }

  const messages: Message[] = [
    {
      role: 'system',
      content: systemPrompt || defaultSystemPrompt,
    },
    ...conversationHistory.slice(-5), // Shorter history for vision requests
    {
      role: 'user',
      content: userContent,
    },
  ];

  return await callOpenRouter(messages, visionModel);
}

/**
 * Generate image using AI models that support image generation (GPT-5, Gemini)
 */
export async function generateImageWithAI(
  prompt: string,
  modelId: string = 'gpt-5-image'
): Promise<{ url: string; model: string }> {
  log('info', `Generating image with model: ${modelId}`);

  const openRouterModel = MODEL_MAP[modelId] || MODEL_MAP['gpt-5-image'];

  try {
    const requestBody = {
      model: openRouterModel,
      messages: [
        {
          role: 'system',
          content: 'You are an AI image generator. When given a prompt, generate a detailed, high-quality image. Respond with a description of the generated image.',
        },
        {
          role: 'user',
          content: `Generate an image: ${prompt}`,
        },
      ],
    };

    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': SITE_URL,
        'X-Title': SITE_NAME,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Image generation failed: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    log('success', `Image generated with ${modelId}`);

    return {
      url: content,
      model: openRouterModel,
    };
  } catch (error: any) {
    log('error', `Image generation failed: ${error.message}`);
    throw error;
  }
}
