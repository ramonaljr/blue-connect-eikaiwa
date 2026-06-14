'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { getStripe } from '@/lib/stripe/client'
import { requireTutor } from '@/lib/auth/guard'
import { computeTutorPayoutJpy, lessonTierForRole } from '@/lib/payouts/config'
import { captureException, captureEvent } from '@/lib/observability'

// Service-role client for payout writes (tutor_payouts has no insert/update
// policy, so writes must bypass RLS like the Stripe webhook does).
function serviceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function appOrigin(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
}

// Creates (or reuses) the tutor's Stripe Express account and returns a hosted
// onboarding link. Stripe handles KYC/bank collection; account.updated then
// flips payouts_enabled via the webhook.
export async function createTutorConnectOnboardingLink(): Promise<{ url: string } | { error: string }> {
  const user = await requireTutor()

  if (!process.env.STRIPE_SECRET_KEY) {
    return { error: '決済設定が未完了です。管理者にお問い合わせください。' }
  }

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('tutor_profiles')
    .select('id, stripe_connect_account_id')
    .eq('user_id', user.id)
    .single()

  if (!profile) return { error: '講師プロフィールが見つかりません' }

  try {
    const stripe = getStripe()
    let accountId: string | null = profile.stripe_connect_account_id

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'JP',
        email: user.email,
        business_type: 'individual',
        capabilities: { transfers: { requested: true } },
        metadata: { supabase_user_id: user.id },
      })
      accountId = account.id
      // Tutors can update their own tutor_profiles row (RLS allows it).
      await supabase
        .from('tutor_profiles')
        .update({ stripe_connect_account_id: accountId })
        .eq('user_id', user.id)
    }

    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${appOrigin()}/tutor?connect=refresh`,
      return_url: `${appOrigin()}/tutor?connect=done`,
      type: 'account_onboarding',
    })

    return { url: link.url }
  } catch (err) {
    captureException(err, { scope: 'createTutorConnectOnboardingLink', userId: user.id })
    return { error: '決済設定の開始に失敗しました' }
  }
}

// Tutor-facing earnings summary for the dashboard.
export async function getTutorEarnings() {
  const user = await requireTutor()
  const supabase = await createClient()

  const [{ data: payouts }, { data: profile }] = await Promise.all([
    supabase
      .from('tutor_payouts')
      .select('amount, status, created_at, lesson_id')
      .eq('tutor_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('tutor_profiles')
      .select('payouts_enabled, stripe_connect_account_id')
      .eq('user_id', user.id)
      .single(),
  ])

  const rows = payouts ?? []
  const paidTotal = rows.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0)
  const pendingTotal = rows.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0)

  return {
    paidTotal,
    pendingTotal,
    payoutsEnabled: Boolean(profile?.payouts_enabled),
    onboardingStarted: Boolean(profile?.stripe_connect_account_id),
    recent: rows.slice(0, 10),
  }
}

// Creates the tutor payout for a completed lesson. Idempotent (one row per
// lesson_id) and defensive: it never throws, so it cannot break lesson
// completion. If the tutor isn't onboarded yet the payout is recorded as
// 'pending' and can be swept once they connect.
export async function payoutForLesson(lessonId: string): Promise<void> {
  const svc = serviceClient()
  try {
    const { data: lesson } = await svc
      .from('lessons')
      .select('id, tutor_id, duration_minutes, status')
      .eq('id', lessonId)
      .single()

    if (!lesson || lesson.status !== 'completed') return

    const { data: tutorProfile } = await svc
      .from('tutor_profiles')
      .select('stripe_connect_account_id, payouts_enabled')
      .eq('user_id', lesson.tutor_id)
      .single()

    const { data: tutorUser } = await svc
      .from('users')
      .select('role')
      .eq('id', lesson.tutor_id)
      .single()

    const tier = lessonTierForRole(tutorUser?.role)
    const amount = computeTutorPayoutJpy(tier, lesson.duration_minutes)

    // Insert the pending payout first; the unique lesson_id makes this the
    // idempotency guard (a duplicate completion is a no-op).
    const { data: inserted, error: insErr } = await svc
      .from('tutor_payouts')
      .insert({ tutor_id: lesson.tutor_id, lesson_id: lessonId, amount, status: 'pending' })
      .select('id')
      .single()

    if (insErr || !inserted) return // unique violation => already paid out

    captureEvent('tutor_payout_accrued', { lessonId, tutorId: lesson.tutor_id, amount, tier })

    const canTransfer =
      Boolean(tutorProfile?.stripe_connect_account_id) &&
      Boolean(tutorProfile?.payouts_enabled) &&
      Boolean(process.env.STRIPE_SECRET_KEY)

    if (!canTransfer) return // stays pending until onboarding completes

    try {
      const stripe = getStripe()
      const transfer = await stripe.transfers.create(
        {
          amount,
          currency: 'jpy',
          destination: tutorProfile!.stripe_connect_account_id!,
          transfer_group: `lesson_${lessonId}`,
          metadata: { lesson_id: lessonId, tutor_id: lesson.tutor_id },
        },
        { idempotencyKey: `payout_${lessonId}` }
      )

      await svc
        .from('tutor_payouts')
        .update({ status: 'paid', stripe_transfer_id: transfer.id, paid_at: new Date().toISOString() })
        .eq('id', inserted.id)

      captureEvent('tutor_payout_paid', { lessonId, tutorId: lesson.tutor_id, amount })
    } catch (err) {
      captureException(err, { scope: 'payoutForLesson.transfer', lessonId })
      await svc.from('tutor_payouts').update({ status: 'failed' }).eq('id', inserted.id)
    }
  } catch (err) {
    captureException(err, { scope: 'payoutForLesson', lessonId })
  }
}
