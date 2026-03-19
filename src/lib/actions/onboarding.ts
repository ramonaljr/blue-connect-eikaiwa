'use server'

import { createClient } from '@/lib/supabase/server'
import type { CEFRLevel, AIPersonality } from '@/lib/types/database'

interface OnboardingData {
  englishLevel: CEFRLevel
  dailyGoalMinutes: number
  preferredTopics: string[]
  aiPersonality: AIPersonality
}

export async function completeOnboarding(data: OnboardingData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('users')
    .update({
      english_level: data.englishLevel,
      daily_goal_minutes: data.dailyGoalMinutes,
      preferred_topics: data.preferredTopics,
      ai_personality: data.aiPersonality,
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) return { error: error.message }
  return { success: true }
}
