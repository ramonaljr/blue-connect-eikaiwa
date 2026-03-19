import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/client'
import { createClient } from '@supabase/supabase-js'
import type { SubscriptionTier } from '@/lib/types/database'

export async function POST(request: NextRequest) {
  // Use service role for webhook (no user context)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  let event

  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object
      const userId = session.metadata?.supabase_user_id
      const tier = session.metadata?.tier as SubscriptionTier

      if (userId && tier) {
        await supabase
          .from('users')
          .update({
            subscription_tier: tier,
            subscription_status: 'active',
          })
          .eq('id', userId)

        // Grant monthly credits for Premium
        if (tier === 'premium') {
          const expiresAt = new Date()
          expiresAt.setDate(expiresAt.getDate() + 30)

          await supabase.from('credits').insert({
            user_id: userId,
            type: 'lesson_certified',
            amount: 4,
            source: 'subscription',
            expires_at: expiresAt.toISOString(),
          })
        }
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object
      const customerId = subscription.customer as string

      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single()

      if (user) {
        const status = subscription.status === 'active' ? 'active'
          : subscription.status === 'past_due' ? 'past_due'
          : 'canceled'

        await supabase
          .from('users')
          .update({ subscription_status: status })
          .eq('id', user.id)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object
      const customerId = subscription.customer as string

      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single()

      if (user) {
        await supabase
          .from('users')
          .update({
            subscription_tier: 'free',
            subscription_status: 'canceled',
          })
          .eq('id', user.id)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
