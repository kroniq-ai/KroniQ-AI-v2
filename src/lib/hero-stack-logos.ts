export type HeroStackLogo = {
    src: string;
    alt: string;
    width?: number;
    height?: number;
};

/** SVG wordmarks / icons (svgl + simpleicons) — light assets, inverted in LogoCloud for dark UI */
export const HERO_STACK_LOGOS: HeroStackLogo[] = [
    { src: "https://svgl.app/library/openai_wordmark_light.svg", alt: "OpenAI" },
    { src: "https://svgl.app/library/claude-ai-wordmark-icon_light.svg", alt: "Claude" },
    { src: "https://svgl.app/library/supabase_wordmark_light.svg", alt: "Supabase" },
    { src: "https://svgl.app/library/vercel_wordmark.svg", alt: "Vercel" },
    { src: "https://cdn.simpleicons.org/nextdotjs/22d3ee", alt: "Next.js" },
    { src: "https://svgl.app/library/stripe_wordmark.svg", alt: "Stripe" },
    { src: "https://svgl.app/library/linkedin.svg", alt: "LinkedIn" },
    { src: "https://svgl.app/library/linear.svg", alt: "Integrations" },
];
