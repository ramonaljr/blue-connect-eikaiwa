import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/client'
import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { SubscriptionTier } from '@/lib/types/database'
import { captureException } from '@/lib/observability'

// Premium includes 4 certified-tutor lesson credits per billing cycle.
const PREMIUM_MONTHLY_CREDITS = 4
// 33 days gives slack so credits never lapse before the next monthly charge.
const CREDIT_VALIDITY_DAYS = 33

async function grantPremiumCredits(supabase: SupabaseClient, userId: string) {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + CREDIT_VALIDITY_DAYS)

  await supabase.from('credits').insert({
    user_id: userId,
    type: 'lesson_certified',
    amount: PREMIUM_MONTHLY_CREDITS,
    source: 'subscription',
    expires_at: expiresAt.toISOString(),
  })
}

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

  // Idempotency: claim the event id before processing. Stripe retries events,
  // and without this a retried checkout.session.completed would grant credits
  // multiple times.
  const { error: claimError } = await supabase
    .from('processed_stripe_events')
    .insert({ event_id: event.id })

  if (claimError) {
    // 23505 = unique violation => already processed, safe to ack.
    if (claimError.code === '23505') {
      return NextResponse.json({ received: true, duplicate: true })
    }
    // Unexpected error claiming the event: signal failure so Stripe retries.
    return NextResponse.json({ error: 'Failed to record event' }, { status: 500 })
  }

  try {
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

          // Initial grant for Premium. Renewals are handled by
          // invoice.payment_succeeded (billing_reason === 'subscription_cycle').
          if (tier === 'premium') {
            await grantPremiumCredits(supabase, userId)
          }
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        // Only re-grant on recurring cycles; the first invoice is covered by
        // checkout.session.completed to avoid a double grant.
        if (invoice.billing_reason !== 'subscription_cycle') break

        const customerId = invoice.customer as string
        const { data: user } = await supabase
          .from('users')
          .select('id, subscription_tier')
          .eq('stripe_customer_id', customerId)
          .single()

        if (user) {
          await supabase
            .from('users')
            .update({ subscription_status: 'active' })
            .eq('id', user.id)

          if (user.subscription_tier === 'premium') {
            await grantPremiumCredits(supabase, user.id)
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

      case 'account.updated': {
        // Stripe Connect: flip the tutor's payouts_enabled once their Express
        // account can both accept charges and receive payouts.
        const account = event.data.object
        const enabled = Boolean(account.charges_enabled) && Boolean(account.payouts_enabled)

        await supabase
          .from('tutor_profiles')
          .update({ payouts_enabled: enabled })
          .eq('stripe_connect_account_id', account.id)
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
  } catch (err) {
    // Release the claim so Stripe's retry can reprocess this event.
    await supabase.from('processed_stripe_events').delete().eq('event_id', event.id)
    captureException(err, { scope: 'stripe.webhook', eventId: event.id, eventType: event.type })
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
