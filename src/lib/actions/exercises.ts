'use server'

import { createClient } from '@/lib/supabase/server'

export async function submitExerciseAttempt(data: {
  exerciseId: string
  score: number
  timeSpentSeconds: number
  hintsUsed: number
  attempts: number
  answerData: Record<string, unknown>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('exercise_attempts').insert({
    user_id: user.id,
    exercise_id: data.exerciseId,
    score: data.score,
    time_spent_seconds: data.timeSpentSeconds,
    hints_used: data.hintsUsed,
    attempts: data.attempts,
    answer_data: data.answerData,
  })

  if (error) return { error: error.message }

  // Update skill profile (increment exercises_completed)
  const { data: profile } = await supabase
    .from('skill_profiles')
    .select('id, exercises_completed')
    .eq('user_id', user.id)
    .single()

  if (profile) {
    await supabase
      .from('skill_profiles')
      .update({ exercises_completed: profile.exercises_completed + 1 })
      .eq('id', profile.id)
  } else {
    await supabase.from('skill_profiles').insert({
      user_id: user.id,
      exercises_completed: 1,
    })
  }

  // Recalculate skill profile every 5 exercises
  if (profile && profile.exercises_completed % 5 === 0) {
    const { updateSkillProfile } = await import('@/lib/adaptive-difficulty')
    await updateSkillProfile(user.id)
  }

  return { success: true }
}
