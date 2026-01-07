export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  currencySymbol: string;
  mode: 'subscription' | 'payment';
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_starter',
    priceId: 'price_1Skd0CFBTh5tg3ftUqapwbFS', // Starter Plan
    name: 'Starter Plan',
    description: 'Unlimited AI chat, images, videos & TTS. Access to 70+ AI models including GPT-4o, Claude, Gemini, and more. Smart model routing for best quality.',
    price: 5,
    currency: 'usd',
    currencySymbol: '$',
    mode: 'subscription'
  },
  {
    id: 'prod_pro',
    priceId: 'price_1Skd4YFBTh5tg3ftMYD6xjBg', // Pro Plan
    name: 'Pro Plan',
    description: 'Unlimited everything with premium models. Claude Sonnet, Seedream V4, Sora 2 for video, and more. Priority queue access.',
    price: 12,
    currency: 'usd',
    currencySymbol: '$',
    mode: 'subscription'
  },
  {
    id: 'prod_premium',
    priceId: 'price_1Sld4AFBTh5tg3ftFmsbmBpO', // Premium Plan
    name: 'Premium Plan',
    description: 'Unlimited everything with the best models. Sora 2, Imagen 4 Ultra, GPT-4o, Claude Opus. Priority support & early access to new features.',
    price: 24,
    currency: 'usd',
    currencySymbol: '$',
    mode: 'subscription'
  }
];

export function getProductByPriceId(priceId: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.priceId === priceId);
}

export function getProductById(id: string): StripeProduct | undefined {
  return stripeProducts.find(product => product.id === id);
}