import React from 'react';
import { Helmet } from 'react-helmet-async';

interface PageMetaProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: string;
}

export const PageMeta: React.FC<PageMetaProps> = ({
  title,
  description,
  keywords = 'AI, artificial intelligence, all in one AI, AI platform, ChatGPT alternative, ChatGPT free, Claude AI, Gemini AI, best AI chatbot, AI chat, AI image generator, AI video generator, AI music generator, free AI tools, AI aggregator, multiple AI models, GPT-4, GPT-4o, GPT-5, Llama, Mistral, AI studio, AI writing, AI coding, AI assistant, unified AI platform, KroniQ, KroniQ AI, best AI tool 2025, AI tools online, chat AI free, image AI free, video AI, text to image AI, text to video AI, AI art generator, AI photo generator, AI picture generator, DALL-E alternative, Midjourney alternative, Stable Diffusion, Flux AI, Imagen AI, AI creativity, AI content creator, AI content generation, AI text generator, AI copywriting, AI marketing, AI for business, AI productivity, AI automation, AI workflow, best free AI, top AI tools, AI comparison, compare AI models, AI model aggregator, multi AI platform, OpenAI alternative, Anthropic Claude, Google Gemini, Meta Llama, DeepSeek AI, Qwen AI, Perplexity alternative, AI search, AI research, AI for students, AI for developers, AI coding assistant, AI programming, code with AI, AI pair programming, AI code generation, AI debug, Copilot alternative, Cursor alternative, AI voice generator, text to speech AI, TTS AI, ElevenLabs alternative, AI voiceover, AI narration, AI video creation, Sora alternative, Runway alternative, Kling AI, Veo AI, AI video editing, AI movie maker, AI music creation, AI song generator, AI beat maker, AI composer, AI presentation, AI PowerPoint, AI slides, AI PPT generator, best AI website, AI web app, AI online free, no signup AI, instant AI, fast AI, powerful AI, advanced AI, next gen AI, future AI, AI 2025, trending AI, popular AI tools, AI hub, AI workspace, AI dashboard, one stop AI, everything AI, complete AI solution, ultimate AI platform, premium AI, pro AI tools, enterprise AI, AI for teams, collaborative AI, affordable AI, free ChatGPT, unlimited AI, conversational AI, generative AI, GenAI, large language model, LLM, multimodal AI, AI image editing, AI photo editing, AI background remover, AI upscaler, AI enhance, image to video AI, AI avatar, AI face generator, AI storytelling, AI blog writer, AI essay writer, AI article generator, AI summarizer, AI translator, AI grammar, AI rewriter, AI paraphraser',
  canonical,
  ogImage = '/kroniq-logo-white.png',
  ogType = 'website'
}) => {
  const fullTitle = `${title} | KroniQ AI`;
  const baseUrl = 'http://localhost:5173';
  const canonicalUrl = canonical || baseUrl;
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:site_name" content="KroniQ AI" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullOgImage} />

      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="KroniQ AI" />
    </Helmet>
  );
};
