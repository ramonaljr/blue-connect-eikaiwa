'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function bookLesson(formData: {
  tutorId: string
  scheduledAt: string
  durationMinutes: 25 | 50
}) {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    return { error: 'Unauthorized' }
  }

  const { data: user } = await supabase
    .from('users')
    .select('id, subscription_tier')
    .eq('id', authUser.id)
    .single()

  if (!user) {
    return { error: 'User not found' }
  }

  const { data: tutor } = await supabase
    .from('users')
    .select('id, role')
    .eq('id', formData.tutorId)
    .single()

  if (!tutor) {
    return { error: 'Tutor not found' }
  }

  const creditType = tutor.role === 'certified_tutor' ? 'lesson_certified' : 'lesson_community'

  const { data: credits } = await supabase
    .from('credits')
    .select('id, amount')
    .eq('user_id', user.id)
    .eq('type', creditType)
    .gt('amount', 0)
    .gt('expires_at', new Date().toISOString())
    .order('expires_at')
    .limit(1)

  if (!credits?.length) {
    return { error: 'レッスンクレジットが足りません。クレジットを購入してください。' }
  }

  const credit = credits[0]
  await supabase
    .from('credits')
    .update({ amount: credit.amount - 1 })
    .eq('id', credit.id)

  const { data: lesson, error } = await supabase
    .from('lessons')
    .insert({
      learner_id: user.id,
      tutor_id: formData.tutorId,
      scheduled_at: formData.scheduledAt,
      duration_minutes: formData.durationMinutes,
    })
    .select()
    .single()

  if (error) {
    return { error: 'レッスンの予約に失敗しました' }
  }

  await supabase.from('notifications').insert([
    {
      user_id: user.id,
      type: 'lesson_reminder',
      title: 'レッスン予約完了',
      body: `レッスンが予約されました: ${new Date(formData.scheduledAt).toLocaleString('ja-JP')}`,
      action_url: `/dashboard/lessons/${lesson.id}`,
    },
    {
      user_id: formData.tutorId,
      type: 'lesson_reminder',
      title: '新しいレッスン予約',
      body: `新しいレッスンが予約されました: ${new Date(formData.scheduledAt).toLocaleString('ja-JP')}`,
      action_url: `/tutor/lessons/${lesson.id}`,
    },
  ])

  revalidatePath('/dashboard/lessons')
  return { success: true, lessonId: lesson.id }
}

export async function cancelLesson(lessonId: string, reason?: string) {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    return { error: 'Unauthorized' }
  }

  const { data: lesson } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single()

  if (!lesson) {
    return { error: 'Lesson not found' }
  }

  if (lesson.learner_id !== authUser.id && lesson.tutor_id !== authUser.id) {
    return { error: 'Unauthorized' }
  }

  if (lesson.status === 'canceled') {
    return { error: 'このレッスンは既にキャンセルされています' }
  }

  const hoursUntil = (new Date(lesson.scheduled_at).getTime() - Date.now()) / (1000 * 60 * 60)

  // Determine tiered refund amount
  let creditRefundAmount: number
  if (hoursUntil >= 24) {
    creditRefundAmount = 1 // Full refund
  } else if (hoursUntil >= 2) {
    creditRefundAmount = 0.5 // 50% refund
  } else {
    creditRefundAmount = 0 // No refund
  }

  await supabase
    .from('lessons')
    .update({
      status: 'canceled',
      cancellation_reason: reason ?? null,
      canceled_at: new Date().toISOString(),
      canceled_by: authUser.id,
      credit_refund_amount: creditRefundAmount,
    })
    .eq('id', lessonId)

  // Refund credit based on tiered policy
  if (creditRefundAmount > 0) {
    const { data: tutor } = await supabase.from('users').select('role').eq('id', lesson.tutor_id).single()
    const creditType = tutor?.role === 'certified_tutor' ? 'lesson_certified' : 'lesson_community'

    await supabase.from('credits').insert({
      user_id: lesson.learner_id,
      type: creditType,
      amount: 1, // Always refund 1 credit (credits are integers)
      source: 'subscription',
      expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    })
  }

  revalidatePath('/dashboard/lessons')
  return { success: true }
}
