'use server'

import { getStripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'
import { STRIPE_PLANS, CREDIT_PRODUCTS } from '@/lib/stripe/config'
import { headers } from 'next/headers'

export async function createCheckoutSession(tier: 'pro' | 'premium') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  const stripe = getStripe()
  const origin = (await headers()).get('origin')
  const plan = STRIPE_PLANS[tier]

  const session = await stripe.checkout.sessions.create({
    customer: profile?.stripe_customer_id ?? undefined,
    mode: 'subscription',
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${origin}/dashboard/settings?success=true`,
    cancel_url: `${origin}/dashboard/settings`,
    metadata: { supabase_user_id: user.id, tier },
  })

  return { url: session.url }
}

export async function createCustomerPortalSession() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: profile } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  if (!profile?.stripe_customer_id) return { error: 'No Stripe customer' }

  const stripe = getStripe()
  const origin = (await headers()).get('origin')

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${origin}/dashboard/settings`,
  })

  return { url: session.url }
}

export async function purchaseCredits(productKey: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const product = CREDIT_PRODUCTS[productKey as keyof typeof CREDIT_PRODUCTS]
  if (!product) return { error: 'Invalid product' }

  const stripe = getStripe()
  const origin = (await headers()).get('origin')

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [{ price: product.priceId, quantity: 1 }],
    success_url: `${origin}/dashboard/settings?credits=purchased`,
    cancel_url: `${origin}/dashboard/settings`,
    metadata: {
      supabase_user_id: user.id,
      credit_type: product.type,
      credit_amount: product.credits.toString(),
    },
  })

  return { url: session.url }
}
