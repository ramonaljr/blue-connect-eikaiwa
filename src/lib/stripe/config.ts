export const STRIPE_PLANS = {
  free: {
    name: 'Free',
    name_ja: 'フリー',
    price: 0,
    priceId: null,
  },
  pro: {
    name: 'Pro',
    name_ja: 'プロ',
    price: 2980,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
  },
  premium: {
    name: 'Premium',
    name_ja: 'プレミアム',
    price: 6980,
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID!,
  },
} as const

export const CREDIT_PRODUCTS = {
  ai_voice_10: {
    name: 'AI Voice Sessions (10-pack)',
    name_ja: 'AI音声セッション（10回パック）',
    price: 980,
    priceId: process.env.STRIPE_AI_VOICE_PACK_PRICE_ID!,
    credits: 10,
    type: 'ai_voice' as const,
  },
  lesson_certified: {
    name: 'Certified Tutor Lesson',
    name_ja: '認定講師レッスン',
    price: 2500,
    priceId: process.env.STRIPE_CERTIFIED_LESSON_PRICE_ID!,
    credits: 1,
    type: 'lesson_certified' as const,
  },
} as const
