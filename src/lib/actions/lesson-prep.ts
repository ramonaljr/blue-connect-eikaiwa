'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function saveLessonPrep(data: {
  lessonId: string
  topics: string
  vocabulary: string[]
  goals: string[]
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Verify user is participant
  const { data: lesson } = await supabase
    .from('lessons')
    .select('learner_id, tutor_id')
    .eq('id', data.lessonId)
    .single()

  if (!lesson || (lesson.learner_id !== user.id && lesson.tutor_id !== user.id)) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('lesson_preparations')
    .upsert({
      lesson_id: data.lessonId,
      topics: data.topics,
      vocabulary: data.vocabulary,
      goals: data.goals,
    }, { onConflict: 'lesson_id' })

  if (error) return { error: error.message }
  revalidatePath(`/dashboard/lessons/${data.lessonId}`)
  return { success: true }
}

export async function getLessonPrep(lessonId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { prep: null }

  const { data } = await supabase
    .from('lesson_preparations')
    .select('*')
    .eq('lesson_id', lessonId)
    .single()

  return { prep: data }
}
