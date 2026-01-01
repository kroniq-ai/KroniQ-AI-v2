export interface AIModel {
  id: string;
  apiId?: string; // Real OpenRouter ID if different from id (for future/aliased models)
  name: string;
  provider: string;
  description: string;
  category: 'chat' | 'code' | 'image' | 'video' | 'audio';
  tier?: 'FREE' | 'BUDGET' | 'MID' | 'PREMIUM' | 'ULTRA_PREMIUM';
  paidOnly?: boolean;
  logoUrl?: string;
}

// Provider logo URLs - prefer local logos from /logos/ folder
const LOGOS = {
  anthropic: '/logos/claude.png',
  openai: '/icons/openai-logo.png',
  google: '/logos/gemini.png',
  meta: '/logos/meta.png',
  deepseek: '/logos/deepseek.png',
  mistral: '/logos/mistral.png',
  qwen: '/logos/qwen.png',
  xai: '/logos/grok.png',
  xaiDark: '/grok-logo-dark.png',
  perplexity: '/logos/perplexity.png',
  nvidia: 'https://upload.wikimedia.org/wikipedia/sco/2/21/Nvidia_logo.svg', // No local, use CDN
  cohere: 'https://registry.npmmirror.com/@lobehub/icons-static-png/1.43.0/files/dark/cohere-color.png',
  microsoft: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg',
  kieai: '/favicon-logo.png',
  elevenlabs: '/logos/elevenlabs.png',
  moonshot: 'https://registry.npmmirror.com/@lobehub/icons-static-png/1.43.0/files/dark/moonshot.png', // No local
  amazon: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', // No local
  minimax: 'https://registry.npmmirror.com/@lobehub/icons-static-png/1.43.0/files/dark/minimax-color.png', // No local
  bytedance: '/logos/bytedance.png',
  runway: '/logos/runway.png',
  kling: '/logos/kling.png',
  sora: '/logos/sora.png',
  flux: '/logos/flux.png',
  imagen: '/logos/imagen.png',
};

// Helper to get xAI logo based on theme
export const getXaiLogo = (isDark: boolean): string => {
  return isDark ? LOGOS.xaiDark : LOGOS.xai;
};

// ============================================================
// VERIFIED WORKING OpenRouter model IDs - Tested Dec 2024
// Synced with Studio view - matching provider model counts
// ============================================================
export const AI_MODELS: AIModel[] = [
  // ===== FREE TIER MODELS (Accessible to ALL users) =====
  // Each provider has one free model

  // --- Meta (Llama 3.3 70B free) ---
  { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B', provider: 'Meta', description: 'Powerful 70B model - Free', category: 'chat', tier: 'FREE', logoUrl: LOGOS.meta },

  // --- Google (Gemini 2.0 Flash free) ---
  { id: 'google/gemma-3-27b-it:free', name: 'Gemma 3 27B', provider: 'Google', description: 'Best Gemma model - Free', category: 'chat', tier: 'FREE', logoUrl: LOGOS.google },
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash', provider: 'Google', description: 'Fast Gemini 2.0 - Free', category: 'chat', tier: 'FREE', logoUrl: LOGOS.google },

  // --- Mistral (Mistral 7B free) ---
  { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B', provider: 'Mistral', description: 'Fast & efficient - Free', category: 'chat', tier: 'FREE', logoUrl: LOGOS.mistral },

  // --- NVIDIA (Nemotron Nano 9B free) ---
  { id: 'nvidia/nemotron-nano-9b-v2:free', name: 'Nemotron Nano 9B V2', provider: 'NVIDIA', description: 'NVIDIA efficient model - Free', category: 'chat', tier: 'FREE', logoUrl: LOGOS.nvidia },

  // --- MoonshotAI (Kimi K2 0711 free) ---
  { id: 'moonshotai/kimi-k2:free', name: 'Kimi K2 0711', provider: 'MoonshotAI', description: 'Kimi K2 - Free', category: 'chat', tier: 'FREE', logoUrl: LOGOS.moonshot },

  // --- Qwen (Qwen3 4B free) ---
  { id: 'qwen/qwen3-4b:free', name: 'Qwen3 4B', provider: 'Qwen', description: 'Fast Qwen 3 - Free', category: 'chat', tier: 'FREE', logoUrl: LOGOS.qwen },

  // --- xAI (Grok 4 Fast free) ---
  { id: 'x-ai/grok-4-fast', name: 'Grok 4 Fast', provider: 'xAI', description: 'Fast Grok 4 - Free', category: 'chat', tier: 'FREE', logoUrl: LOGOS.xai },

  // --- Anthropic (Claude 3 Haiku free) ---
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', description: 'Fast Claude 3 - Free', category: 'chat', tier: 'FREE', logoUrl: LOGOS.anthropic },

  // --- OpenAI (GPT-5 Nano simulated free) ---
  { id: 'openai/gpt-5-nano', apiId: 'openai/gpt-4o-mini', name: 'GPT-5 Nano', provider: 'OpenAI', description: 'Compact GPT-5 - Free', category: 'chat', tier: 'FREE', logoUrl: LOGOS.openai },

  // --- DeepSeek (DeepSeek Chat free) ---
  { id: 'deepseek/deepseek-chat:free', apiId: 'deepseek/deepseek-chat', name: 'DeepSeek Chat', provider: 'DeepSeek', description: 'Advanced reasoning - Free', category: 'chat', tier: 'FREE', logoUrl: LOGOS.deepseek },

  // --- Amazon (Nova 2 Lite free) ---
  { id: 'amazon/nova-2-lite-v1:free', name: 'Nova 2 Lite', provider: 'Amazon', description: 'Amazon Nova 2 Lite - Free', category: 'chat', tier: 'FREE', logoUrl: LOGOS.amazon },

  // ===== META MODELS (PAID) =====
  { id: 'meta-llama/llama-4-maverick', name: 'Llama 4 Maverick', provider: 'Meta', description: 'Latest Llama 4 multimodal', category: 'chat', tier: 'PREMIUM', paidOnly: true, logoUrl: LOGOS.meta },
  { id: 'meta-llama/llama-4-scout', name: 'Llama 4 Scout', provider: 'Meta', description: 'Llama 4 multimodal scout', category: 'chat', tier: 'MID', paidOnly: true, logoUrl: LOGOS.meta },
  { id: 'meta-llama/llama-3.2-90b-vision-instruct', name: 'Llama 3.2 90B Vision', provider: 'Meta', description: 'Vision-capable Llama 3.2', category: 'chat', tier: 'PREMIUM', paidOnly: true, logoUrl: LOGOS.meta },
  { id: 'meta-llama/llama-guard-4', apiId: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama Guard 4', provider: 'Meta', description: 'Safety-focused model', category: 'chat', tier: 'MID', paidOnly: true, logoUrl: LOGOS.meta },
  { id: 'meta-llama/llama-guard-3', apiId: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama Guard 3', provider: 'Meta', description: 'Content moderation', category: 'chat', tier: 'BUDGET', paidOnly: true, logoUrl: LOGOS.meta },

  // ===== MISTRAL MODELS (PAID) =====
  { id: 'mistralai/ministral-14b-2512', name: 'Ministral 3 14B', provider: 'Mistral', description: 'Ministral 14B multimodal', category: 'chat', tier: 'MID', paidOnly: true, logoUrl: LOGOS.mistral },
  { id: 'mistralai/ministral-8b-2512', name: 'Ministral 3 8B', provider: 'Mistral', description: 'Ministral 8B multimodal', category: 'chat', tier: 'BUDGET', paidOnly: true, logoUrl: LOGOS.mistral },
  { id: 'mistralai/ministral-3b-2512', name: 'Ministral 3 3B', provider: 'Mistral', description: 'Ministral 3B multimodal', category: 'chat', tier: 'BUDGET', paidOnly: true, logoUrl: LOGOS.mistral },
  { id: 'mistralai/ministral-8b', name: 'Ministral 8B', provider: 'Mistral', description: 'Fast Ministral 8B', category: 'chat', tier: 'BUDGET', paidOnly: true, logoUrl: LOGOS.mistral },
  { id: 'mistralai/devstral', apiId: 'mistralai/ministral-8b', name: 'Devstral', provider: 'Mistral', description: 'Developer-focused Mistral', category: 'chat', tier: 'MID', paidOnly: true, logoUrl: LOGOS.mistral },
  { id: 'mistralai/mistral-3-8b', apiId: 'mistralai/ministral-8b', name: 'Mistral 3 8B', provider: 'Mistral', description: 'Latest Mistral 3 8B', category: 'chat', tier: 'BUDGET', paidOnly: true, logoUrl: LOGOS.mistral },

  // ===== MOONSHOTAI MODELS (PAID) =====
  { id: 'moonshotai/kimi-k2-thinking', name: 'Kimi K2 Thinking', provider: 'MoonshotAI', description: 'Reasoning with thinking tokens', category: 'chat', tier: 'PREMIUM', paidOnly: true, logoUrl: LOGOS.moonshot },
  { id: 'moonshotai/kimi-k2-0905', name: 'Kimi K2 0905', provider: 'MoonshotAI', description: 'Latest Kimi K2', category: 'chat', tier: 'MID', paidOnly: true, logoUrl: LOGOS.moonshot },

  // ===== NVIDIA MODELS (PAID) =====
  { id: 'nvidia/llama-3.3-nemotron-super-49b-v1.5', name: 'Nemotron Super 49B', provider: 'NVIDIA', description: 'Large Nemotron model', category: 'chat', tier: 'PREMIUM', paidOnly: true, logoUrl: LOGOS.nvidia },

  // ===== OPENAI MODELS (PAID) =====
  { id: 'openai/gpt-5.1-codex-max', apiId: 'openai/chatgpt-4o-latest', name: 'GPT 5.1 Codex Max', provider: 'OpenAI', description: 'Ultimate coding flagship', category: 'chat', tier: 'ULTRA_PREMIUM', paidOnly: true, logoUrl: LOGOS.openai },
  { id: 'openai/gpt-5.2-pro', name: 'GPT 5.2 Pro', provider: 'OpenAI', description: 'Latest GPT-5.2 reasoning', category: 'chat', tier: 'ULTRA_PREMIUM', paidOnly: true, logoUrl: LOGOS.openai },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', description: 'Fast multimodal GPT', category: 'chat', tier: 'MID', paidOnly: true, logoUrl: LOGOS.openai },
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'OpenAI', description: 'Omni multimodal', category: 'chat', tier: 'PREMIUM', paidOnly: true, logoUrl: LOGOS.openai },
  { id: 'openai/chatgpt-4o-latest', name: 'ChatGPT-4o Latest', provider: 'OpenAI', description: 'Latest ChatGPT', category: 'chat', tier: 'PREMIUM', paidOnly: true, logoUrl: LOGOS.openai },

  // ===== QWEN MODELS (PAID) =====
  { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B', provider: 'Qwen', description: 'Large multilingual', category: 'chat', tier: 'BUDGET', paidOnly: true, logoUrl: LOGOS.qwen },
  { id: 'qwen/qwen3-vl-8b', apiId: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen3 VL 8B', provider: 'Qwen', description: 'Vision-language model', category: 'chat', tier: 'MID', paidOnly: true, logoUrl: LOGOS.qwen },
  { id: 'qwen/qwen3-coder-plus', apiId: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen3 Coder Plus', provider: 'Qwen', description: 'Advanced code model', category: 'chat', tier: 'PREMIUM', paidOnly: true, logoUrl: LOGOS.qwen },
  { id: 'qwen/qwen3-embedding-8b', name: 'Qwen3 Embedding 8B', provider: 'Qwen', description: 'Embeddings model', category: 'chat', tier: 'BUDGET', paidOnly: true, logoUrl: LOGOS.qwen },
  { id: 'qwen/qwen-plus-2025-07-28', name: 'Qwen Plus 0728', provider: 'Qwen', description: 'Latest Qwen Plus', category: 'chat', tier: 'MID', paidOnly: true, logoUrl: LOGOS.qwen },
  { id: 'qwen/qwen-plus-2025-07-28:thinking', name: 'Qwen Plus 0728 Thinking', provider: 'Qwen', description: 'Qwen Plus with reasoning', category: 'chat', tier: 'PREMIUM', paidOnly: true, logoUrl: LOGOS.qwen },
  { id: 'qwen/qwen-turbo', name: 'Qwen Turbo', provider: 'Qwen', description: 'Fast Qwen model', category: 'chat', tier: 'BUDGET', paidOnly: true, logoUrl: LOGOS.qwen },

  // ===== DEEPSEEK MODELS (PAID) =====
  { id: 'deepseek/deepseek-chat-v3.2', name: 'DeepSeek V3.2', provider: 'DeepSeek', description: 'Latest DeepSeek V3.2', category: 'chat', tier: 'PREMIUM', paidOnly: true, logoUrl: LOGOS.deepseek },
  { id: 'deepseek/deepseek-chat-v3.1', name: 'DeepSeek V3.1', provider: 'DeepSeek', description: 'DeepSeek V3.1', category: 'chat', tier: 'MID', paidOnly: true, logoUrl: LOGOS.deepseek },
  { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', provider: 'DeepSeek', description: 'Reasoning model', category: 'chat', tier: 'BUDGET', paidOnly: true, logoUrl: LOGOS.deepseek },
  { id: 'deepseek/deepseek-coder', apiId: 'deepseek/deepseek-chat', name: 'DeepSeek Coder', provider: 'DeepSeek', description: 'Code specialist', category: 'chat', tier: 'BUDGET', paidOnly: true, logoUrl: LOGOS.deepseek },

  // ===== GOOGLE MODELS (PAID) =====
  { id: 'google/gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', provider: 'Google', description: 'Fast multimodal Gemini', category: 'chat', tier: 'MID', paidOnly: true, logoUrl: LOGOS.google },
  { id: 'google/gemini-3-pro-preview', name: 'Gemini 3 Pro Preview', provider: 'Google', description: 'Latest Gemini 3', category: 'chat', tier: 'PREMIUM', paidOnly: true, logoUrl: LOGOS.google },
  { id: 'google/gemini-3', apiId: 'google/gemini-2.0-flash-exp', name: 'Gemini 3', provider: 'Google', description: 'Latest Gemini flagship', category: 'chat', tier: 'ULTRA_PREMIUM', paidOnly: true, logoUrl: LOGOS.google },

  // ===== ANTHROPIC MODELS (PAID) =====
  { id: 'anthropic/claude-3.5-haiku', name: 'Claude 3.5 Haiku', provider: 'Anthropic', description: 'Fast Claude 3.5', category: 'chat', tier: 'MID', paidOnly: true, logoUrl: LOGOS.anthropic },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', description: 'Advanced balanced Claude', category: 'chat', tier: 'PREMIUM', paidOnly: true, logoUrl: LOGOS.anthropic },
  { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', description: 'Most powerful Claude', category: 'chat', tier: 'ULTRA_PREMIUM', paidOnly: true, logoUrl: LOGOS.anthropic },
  { id: 'anthropic/claude-sonnet-4', apiId: 'anthropic/claude-3.5-sonnet', name: 'Sonnet 4', provider: 'Anthropic', description: 'Latest Sonnet generation', category: 'chat', tier: 'PREMIUM', paidOnly: true, logoUrl: LOGOS.anthropic },
  { id: 'anthropic/claude-opus-4.1', apiId: 'anthropic/claude-3-opus', name: 'Opus 4.1', provider: 'Anthropic', description: 'Ultimate Claude flagship', category: 'chat', tier: 'ULTRA_PREMIUM', paidOnly: true, logoUrl: LOGOS.anthropic },

  // ===== xAI MODELS (PAID) =====
  { id: 'x-ai/grok-4', apiId: 'x-ai/grok-4-fast', name: 'Grok 4', provider: 'xAI', description: 'Latest flagship Grok', category: 'chat', tier: 'ULTRA_PREMIUM', paidOnly: true, logoUrl: LOGOS.xai },
  { id: 'x-ai/grok-4.1-fast', name: 'Grok 4.1 Fast', provider: 'xAI', description: 'Latest Grok 4.1 - Premium', category: 'chat', tier: 'PREMIUM', paidOnly: true, logoUrl: LOGOS.xai },
  { id: 'x-ai/grok-3-mini-beta', name: 'Grok 3 Mini', provider: 'xAI', description: 'Fast Grok model', category: 'chat', tier: 'MID', paidOnly: true, logoUrl: LOGOS.xai },
  { id: 'x-ai/grok-3-beta', name: 'Grok 3', provider: 'xAI', description: 'Grok flagship', category: 'chat', tier: 'PREMIUM', paidOnly: true, logoUrl: LOGOS.xai },

  // ===== AMAZON MODELS (PAID) =====
  { id: 'amazon/nova-2-lite-v1', name: 'Nova 2 Lite', provider: 'Amazon', description: 'Amazon Nova 2 Lite', category: 'chat', tier: 'BUDGET', paidOnly: true, logoUrl: LOGOS.amazon },
  { id: 'amazon/nova-premier-v1', name: 'Nova Premier 1.0', provider: 'Amazon', description: 'Amazon Nova Premier multimodal', category: 'chat', tier: 'PREMIUM', paidOnly: true, logoUrl: LOGOS.amazon },

  // ===== MINIMAX MODELS (PAID) =====
  { id: 'minimax/minimax-m1', name: 'MiniMax M1', provider: 'MiniMax', description: 'Fast MiniMax model', category: 'chat', tier: 'MID', paidOnly: true, logoUrl: LOGOS.minimax },
  { id: 'minimax/minimax-01', name: 'MiniMax-01', provider: 'MiniMax', description: 'MiniMax multimodal', category: 'chat', tier: 'MID', paidOnly: true, logoUrl: LOGOS.minimax },

  // ===== PERPLEXITY MODELS (PAID) =====
  { id: 'perplexity/sonar-pro-search', name: 'Sonar Pro Search', provider: 'Perplexity', description: 'Pro search with reasoning', category: 'chat', tier: 'PREMIUM', paidOnly: true, logoUrl: LOGOS.perplexity },
  { id: 'perplexity/sonar-reasoning-pro', name: 'Sonar Reasoning Pro', provider: 'Perplexity', description: 'Advanced reasoning multimodal', category: 'chat', tier: 'PREMIUM', paidOnly: true, logoUrl: LOGOS.perplexity },
  { id: 'perplexity/sonar-reasoning', apiId: 'perplexity/sonar-reasoning-pro', name: 'Sonar Reasoning', provider: 'Perplexity', description: 'Reasoning AI search', category: 'chat', tier: 'MID', paidOnly: true, logoUrl: LOGOS.perplexity },
  { id: 'perplexity/sonar-deep-research', name: 'Sonar Deep Research', provider: 'Perplexity', description: 'Deep research AI', category: 'chat', tier: 'ULTRA_PREMIUM', paidOnly: true, logoUrl: LOGOS.perplexity },

  // ===== COHERE MODELS (PAID) =====
  { id: 'cohere/command-a', name: 'Command A', provider: 'Cohere', description: 'Latest Cohere model', category: 'chat', tier: 'MID', paidOnly: true, logoUrl: LOGOS.cohere },
  { id: 'cohere/command-r7b-12-2024', name: 'Command R7B', provider: 'Cohere', description: 'Compact Command R', category: 'chat', tier: 'BUDGET', paidOnly: true, logoUrl: LOGOS.cohere },
  { id: 'cohere/command-r-08-2024', name: 'Command R', provider: 'Cohere', description: 'Command R Aug 2024', category: 'chat', tier: 'BUDGET', paidOnly: true, logoUrl: LOGOS.cohere },
  { id: 'cohere/command-r-plus-08-2024', name: 'Command R+', provider: 'Cohere', description: 'Command R+ Aug 2024', category: 'chat', tier: 'MID', paidOnly: true, logoUrl: LOGOS.cohere },

  // ===== CODE MODELS (separate category) =====
  { id: 'deepseek-coder', apiId: 'deepseek/deepseek-chat', name: 'DeepSeek Coder', provider: 'DeepSeek', description: 'Code specialist', category: 'code', tier: 'BUDGET', logoUrl: LOGOS.deepseek },
  { id: 'gpt-codex-5.1', apiId: 'openai/chatgpt-4o-latest', name: 'GPT Codex 5.1', provider: 'OpenAI', description: 'Ultimate coding', category: 'code', tier: 'PREMIUM', logoUrl: LOGOS.openai },

  // ===== IMAGE MODELS =====
  { id: 'flux-kontext-pro', name: 'Flux Kontext Pro', provider: 'Kie AI', description: 'High-quality generation', category: 'image', tier: 'MID', logoUrl: LOGOS.kieai },
  { id: '4o-image', name: 'GPT-4o Image', provider: 'OpenAI', description: 'GPT-4o image generation', category: 'image', tier: 'PREMIUM', logoUrl: LOGOS.openai },
  { id: 'google/imagen4-ultra', name: 'Imagen 4 Ultra', provider: 'Google', description: 'Ultra-realistic images', category: 'image', tier: 'PREMIUM', logoUrl: LOGOS.google },
  { id: 'seedreem/seedreem-4.5', apiId: 'flux-kontext-pro', name: 'Seedreem 4.5', provider: 'Kie AI', description: 'Advanced image synthesis', category: 'image', tier: 'PREMIUM', logoUrl: LOGOS.kieai },

  // ===== VIDEO MODELS =====
  { id: 'veo3_fast', name: 'Veo 3.1 Fast', provider: 'Google', description: 'Fast video generation', category: 'video', tier: 'PREMIUM', logoUrl: LOGOS.google },
  { id: 'veo3', name: 'Veo 3.1 Quality', provider: 'Google', description: 'High quality video', category: 'video', tier: 'PREMIUM', logoUrl: LOGOS.google },
  { id: 'sora-2-text-to-video', name: 'Sora 2', provider: 'OpenAI', description: 'Cinematic video', category: 'video', tier: 'ULTRA_PREMIUM', paidOnly: true, logoUrl: LOGOS.sora },
  { id: 'wan/2-5-text-to-video', name: 'Wan 2.5', provider: 'Wan', description: 'Creative video', category: 'video', tier: 'PREMIUM', logoUrl: LOGOS.bytedance },
  { id: 'kling-2.6/text-to-video', name: 'Kling 2.6', provider: 'Kling', description: 'Realistic video', category: 'video', tier: 'PREMIUM', logoUrl: LOGOS.kling },
  { id: 'runway-gen3', name: 'Runway Gen-3', provider: 'Runway', description: 'Professional video', category: 'video', tier: 'PREMIUM', logoUrl: LOGOS.runway },

  // ===== AUDIO MODELS =====
  { id: 'suno-v3.5', name: 'Suno v3.5', provider: 'Kie AI', description: 'Music generation', category: 'audio', tier: 'MID', logoUrl: LOGOS.kieai },
  { id: 'eleven-labs', name: 'ElevenLabs TTS', provider: 'ElevenLabs', description: 'Natural voice synthesis', category: 'audio', tier: 'MID', logoUrl: LOGOS.elevenlabs },
];

export const getModelsByCategory = (category: 'chat' | 'code' | 'image' | 'video' | 'audio') => {
  return AI_MODELS.filter(m => m.category === category);
};

export const getModelById = (id: string) => {
  return AI_MODELS.find(m => m.id === id);
};

export const getModelLogoUrl = (modelId: string): string | undefined => {
  const model = getModelById(modelId);
  if (model?.logoUrl) return model.logoUrl;

  // Case-insensitive fallback matching
  const lowerModelId = modelId.toLowerCase();
  if (lowerModelId.includes('anthropic') || lowerModelId.includes('claude') || lowerModelId.includes('sonnet') || lowerModelId.includes('opus') || lowerModelId.includes('haiku')) return LOGOS.anthropic;
  if (lowerModelId.includes('openai') || lowerModelId.includes('gpt') || lowerModelId.includes('chatgpt')) return LOGOS.openai;
  if (lowerModelId.includes('google') || lowerModelId.includes('gemini') || lowerModelId.includes('gemma')) return LOGOS.google;
  if (lowerModelId.includes('meta') || lowerModelId.includes('llama')) return LOGOS.meta;
  if (lowerModelId.includes('deepseek')) return LOGOS.deepseek;
  if (lowerModelId.includes('mistral') || lowerModelId.includes('ministral')) return LOGOS.mistral;
  if (lowerModelId.includes('qwen')) return LOGOS.qwen;
  if (lowerModelId.includes('x-ai') || lowerModelId.includes('grok')) return LOGOS.xai;
  if (lowerModelId.includes('perplexity') || lowerModelId.includes('sonar')) return LOGOS.perplexity;
  if (lowerModelId.includes('cohere') || lowerModelId.includes('command')) return LOGOS.cohere;
  if (lowerModelId.includes('nvidia') || lowerModelId.includes('nemotron')) return LOGOS.nvidia;
  if (lowerModelId.includes('moonshot') || lowerModelId.includes('kimi')) return LOGOS.moonshot;
  if (lowerModelId.includes('amazon') || lowerModelId.includes('nova')) return LOGOS.amazon;
  if (lowerModelId.includes('minimax')) return LOGOS.minimax;
  if (lowerModelId.includes('super kroniq') || lowerModelId.includes('kroniq')) return LOGOS.kieai;

  return undefined;
};

export const searchModels = (query: string, category?: 'chat' | 'code' | 'image' | 'video' | 'audio') => {
  const lowerQuery = query.toLowerCase();
  let models = AI_MODELS;

  if (category) {
    models = models.filter(m => m.category === category);
  }

  return models.filter(m =>
    m.name.toLowerCase().includes(lowerQuery) ||
    m.provider.toLowerCase().includes(lowerQuery) ||
    m.description.toLowerCase().includes(lowerQuery)
  );
};

// Helper to get the actual API model ID for a given model
export const getApiModelId = (modelId: string): string => {
  const model = getModelById(modelId);
  return model?.apiId || model?.id || modelId;
};

// ===== TIER-BASED MODEL ACCESS =====
// Defines which model tiers each subscription tier can access

export type SubscriptionTier = 'FREE' | 'STARTER' | 'PRO' | 'PREMIUM';
export type ModelTier = 'FREE' | 'BUDGET' | 'MID' | 'PREMIUM' | 'ULTRA_PREMIUM';

// Map subscription tier to allowed model tiers
const TIER_ACCESS: Record<SubscriptionTier, ModelTier[]> = {
  FREE: ['FREE'],
  STARTER: ['FREE', 'BUDGET'],
  PRO: ['FREE', 'BUDGET', 'MID'],
  PREMIUM: ['FREE', 'BUDGET', 'MID', 'PREMIUM', 'ULTRA_PREMIUM'],
};

// Get models accessible for a given subscription tier
export const getModelsForUserTier = (
  subscriptionTier: SubscriptionTier,
  category?: 'chat' | 'code' | 'image' | 'video' | 'audio'
): AIModel[] => {
  const allowedModelTiers = TIER_ACCESS[subscriptionTier];

  let models = AI_MODELS.filter(m =>
    m.tier && allowedModelTiers.includes(m.tier)
  );

  if (category) {
    models = models.filter(m => m.category === category);
  }

  return models;
};

// Check if a specific model is allowed for a subscription tier
export const isModelAllowedForTier = (
  modelId: string,
  subscriptionTier: SubscriptionTier
): boolean => {
  const model = getModelById(modelId);
  if (!model || !model.tier) return false;

  const allowedModelTiers = TIER_ACCESS[subscriptionTier];
  return allowedModelTiers.includes(model.tier);
};

// Get the best available model for a tier (for auto-selection)
export const getBestModelForTier = (
  subscriptionTier: SubscriptionTier,
  category: 'chat' | 'code' | 'image' | 'video' | 'audio' = 'chat'
): AIModel | undefined => {
  const models = getModelsForUserTier(subscriptionTier, category);
  if (models.length === 0) return undefined;

  // Return the "best" model - the one with highest tier they can access
  const tierPriority: ModelTier[] = ['ULTRA_PREMIUM', 'PREMIUM', 'MID', 'BUDGET', 'FREE'];
  for (const tier of tierPriority) {
    const model = models.find(m => m.tier === tier);
    if (model) return model;
  }

  return models[0];
};

// Get default free model for fallback
export const getDefaultFreeModel = (): string => {
  return 'deepseek/deepseek-chat:free';
};
