import { createClient } from '@/lib/supabase/server'

export interface AdaptiveConfig {
  preferredDifficulty: number // 1-5
  showHints: boolean
  timeMultiplier: number // <1 = faster, >1 = slower
  exerciseTypeWeights: Record<string, number> // type -> weight for selection
}

export async function getAdaptiveConfig(userId: string): Promise<AdaptiveConfig> {
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('skill_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  // Default config for new users or users with < 20 exercises
  if (!profile || profile.exercises_completed < 20) {
    return {
      preferredDifficulty: 2,
      showHints: true,
      timeMultiplier: 1.0,
      exerciseTypeWeights: {
        multiple_choice: 3,
        fill_blank: 2,
        matching: 2,
        reorder: 1,
        free_response: 1,
        audio: 1,
        conversation: 0,
      },
    }
  }

  const avgAccuracy = (
    profile.grammar_accuracy +
    profile.vocabulary_accuracy +
    profile.listening_accuracy +
    profile.pronunciation_accuracy
  ) / 4

  if (avgAccuracy > 85) {
    // High performer: harder exercises, less hints, faster timers
    return {
      preferredDifficulty: 4,
      showHints: false,
      timeMultiplier: 0.8,
      exerciseTypeWeights: {
        multiple_choice: 1,
        fill_blank: 2,
        matching: 1,
        reorder: 2,
        free_response: 3,
        audio: 2,
        conversation: 3,
      },
    }
  } else if (avgAccuracy < 60) {
    // Struggling: easier exercises, more hints, more time
    return {
      preferredDifficulty: 1,
      showHints: true,
      timeMultiplier: 1.3,
      exerciseTypeWeights: {
        multiple_choice: 4,
        fill_blank: 2,
        matching: 3,
        reorder: 1,
        free_response: 0,
        audio: 1,
        conversation: 0,
      },
    }
  }

  // Average performer
  return {
    preferredDifficulty: 2,
    showHints: true,
    timeMultiplier: 1.0,
    exerciseTypeWeights: {
      multiple_choice: 2,
      fill_blank: 2,
      matching: 2,
      reorder: 2,
      free_response: 2,
      audio: 1,
      conversation: 1,
    },
  }
}

export async function updateSkillProfile(userId: string): Promise<void> {
  const supabase = await createClient()

  // Get last 20 exercise attempts per skill area
  const { data: attempts } = await supabase
    .from('exercise_attempts')
    .select('score, exercise_id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100)

  if (!attempts || attempts.length === 0) return

  // Get exercise details to know skill_area
  const exerciseIds = [...new Set(attempts.map(a => a.exercise_id))]
  const { data: exercises } = await supabase
    .from('course_exercises')
    .select('id, skill_area')
    .in('id', exerciseIds)

  const exerciseMap = new Map(exercises?.map(e => [e.id, e.skill_area]) ?? [])

  // Group attempts by skill area and calculate averages
  const skillScores: Record<string, number[]> = {
    grammar: [],
    vocabulary: [],
    listening: [],
    pronunciation: [],
  }

  for (const attempt of attempts) {
    const area = exerciseMap.get(attempt.exercise_id) ?? 'grammar'
    if (skillScores[area] && skillScores[area].length < 20) {
      skillScores[area].push(attempt.score)
    }
  }

  const calcAvg = (scores: number[]) =>
    scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0

  await supabase
    .from('skill_profiles')
    .upsert({
      user_id: userId,
      grammar_accuracy: calcAvg(skillScores.grammar),
      vocabulary_accuracy: calcAvg(skillScores.vocabulary),
      listening_accuracy: calcAvg(skillScores.listening),
      pronunciation_accuracy: calcAvg(skillScores.pronunciation),
      exercises_completed: attempts.length,
      last_calculated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })
}
