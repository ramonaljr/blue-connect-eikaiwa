'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { mapBookingError } from '@/lib/booking-errors'

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

  // Credit check, double-booking guard, credit decrement, lesson insert, and
  // notifications all run atomically inside the book_lesson RPC. This removes
  // the read-then-write race that could double-spend a credit or let two
  // learners claim the same tutor slot.
  const { data: lessonId, error } = await supabase.rpc('book_lesson', {
    p_tutor_id: formData.tutorId,
    p_scheduled_at: formData.scheduledAt,
    p_duration_minutes: formData.durationMinutes,
  })

  if (error) {
    return { error: mapBookingError(error.message) }
  }

  revalidatePath('/dashboard/lessons')
  return { success: true, lessonId }
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
    const { data: tutor } = await supabase.from('public_profiles').select('role').eq('id', lesson.tutor_id).single()
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
