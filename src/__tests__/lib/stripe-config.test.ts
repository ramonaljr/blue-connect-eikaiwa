import { describe, it, expect } from 'vitest'

describe('Stripe Configuration', () => {
  it('STRIPE_PLANS has correct tier names', async () => {
    const { STRIPE_PLANS } = await import('@/lib/stripe/config')
    expect(STRIPE_PLANS.free.name).toBe('Free')
    expect(STRIPE_PLANS.free.name_ja).toBe('フリー')
    expect(STRIPE_PLANS.pro.name).toBe('Pro')
    expect(STRIPE_PLANS.pro.name_ja).toBe('プロ')
    expect(STRIPE_PLANS.premium.name).toBe('Premium')
    expect(STRIPE_PLANS.premium.name_ja).toBe('プレミアム')
  })

  it('STRIPE_PLANS has correct prices', async () => {
    const { STRIPE_PLANS } = await import('@/lib/stripe/config')
    expect(STRIPE_PLANS.free.price).toBe(0)
    expect(STRIPE_PLANS.free.priceId).toBeNull()
    expect(STRIPE_PLANS.pro.price).toBe(2980)
    expect(STRIPE_PLANS.premium.price).toBe(6980)
  })

  it('CREDIT_PRODUCTS has correct ai_voice_10 product', async () => {
    const { CREDIT_PRODUCTS } = await import('@/lib/stripe/config')
    expect(CREDIT_PRODUCTS.ai_voice_10.credits).toBe(10)
    expect(CREDIT_PRODUCTS.ai_voice_10.type).toBe('ai_voice')
    expect(CREDIT_PRODUCTS.ai_voice_10.price).toBe(980)
  })

  it('CREDIT_PRODUCTS has correct lesson_certified product', async () => {
    const { CREDIT_PRODUCTS } = await import('@/lib/stripe/config')
    expect(CREDIT_PRODUCTS.lesson_certified.credits).toBe(1)
    expect(CREDIT_PRODUCTS.lesson_certified.type).toBe('lesson_certified')
    expect(CREDIT_PRODUCTS.lesson_certified.price).toBe(2500)
  })
})
