'use server'

import { createClient } from '@/lib/supabase/server'

const XP_VALUES = {
  exercise: 20,
  ai_chat: 30,
  ai_voice: 50,
  lesson: 100,
} as const

export async function awardXP(userId: string, activity: keyof typeof XP_VALUES) {
  const supabase = await createClient()
  const xp = XP_VALUES[activity]
  const today = new Date().toISOString().split('T')[0]

  const { data: user } = await supabase
    .from('users')
    .select('xp, streak_days, last_activity_date')
    .eq('id', userId)
    .single()

  if (!user) return

  let newStreak = user.streak_days
  const lastDate = user.last_activity_date

  if (lastDate !== today) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    if (lastDate === yesterdayStr) {
      newStreak = user.streak_days + 1
    } else if (lastDate !== today) {
      newStreak = 1
    }
  }

  await supabase
    .from('users')
    .update({
      xp: user.xp + xp,
      streak_days: newStreak,
      last_activity_date: today,
    })
    .eq('id', userId)
}
