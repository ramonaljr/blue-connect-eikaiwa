'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitLessonReview(data: {
  lessonId: string
  rating: number
  review?: string
  categories?: Record<string, number>
  reflection?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Verify user is the learner
  const { data: lesson } = await supabase
    .from('lessons')
    .select('learner_id, status')
    .eq('id', data.lessonId)
    .single()

  if (!lesson || lesson.learner_id !== user.id) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('lessons')
    .update({
      learner_rating: data.rating,
      learner_review: data.review ?? null,
      learner_review_categories: data.categories ?? null,
    })
    .eq('id', data.lessonId)

  if (error) return { error: error.message }

  // Award XP for completed lesson
  const { awardXP } = await import('./progress')
  const { updateGoalProgress } = await import('./goals')
  await awardXP(user.id, 100, 'lesson', data.lessonId)
  await updateGoalProgress(user.id, 'lessons', 1)

  revalidatePath('/dashboard/lessons')
  return { success: true }
}

export async function getLessonSummary(lessonId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const [{ data: lesson }, { data: notes }, { data: prep }] = await Promise.all([
    supabase
      .from('lessons')
      .select('*, tutor:users!lessons_tutor_id_fkey(display_name, avatar_url)')
      .eq('id', lessonId)
      .single(),
    supabase
      .from('lesson_notes')
      .select('*')
      .eq('lesson_id', lessonId)
      .single(),
    supabase
      .from('lesson_preparations')
      .select('*')
      .eq('lesson_id', lessonId)
      .single(),
  ])

  if (!lesson) return { error: 'Lesson not found' }

  // Check user is participant
  if (lesson.learner_id !== user.id && lesson.tutor_id !== user.id) {
    return { error: 'Unauthorized' }
  }

  return { lesson, notes, prep }
}
