'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createGoal(data: {
  title: string
  targetValue: number
  goalType: string // 'study_days' | 'exercises' | 'voice_sessions' | 'ai_chats' | 'lessons'
  period: 'weekly' | 'monthly'
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const now = new Date()
  let startsAt: Date
  let endsAt: Date

  if (data.period === 'weekly') {
    // Start from Monday of current week
    const dayOfWeek = now.getDay()
    const monday = new Date(now)
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))
    monday.setHours(0, 0, 0, 0)
    startsAt = monday
    endsAt = new Date(monday)
    endsAt.setDate(endsAt.getDate() + 7)
  } else {
    // Start from first of current month
    startsAt = new Date(now.getFullYear(), now.getMonth(), 1)
    endsAt = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  }

  const { error } = await supabase.from('user_goals').insert({
    user_id: user.id,
    title: data.title,
    target_value: data.targetValue,
    current_value: 0,
    goal_type: data.goalType,
    period: data.period,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt.toISOString(),
    xp_reward: data.period === 'weekly' ? 50 : 100,
  })

  if (error) return { error: error.message }
  revalidatePath('/dashboard/progress')
  return { success: true }
}

export async function updateGoalProgress(userId: string, goalType: string, increment: number = 1) {
  const supabase = await createClient()

  // Get active goals matching this type
  const now = new Date().toISOString()
  const { data: goals } = await supabase
    .from('user_goals')
    .select('*')
    .eq('user_id', userId)
    .eq('goal_type', goalType)
    .is('completed_at', null)
    .lte('starts_at', now)
    .gte('ends_at', now)

  if (!goals || goals.length === 0) return

  for (const goal of goals) {
    const newValue = Math.min(goal.current_value + increment, goal.target_value)
    const completed = newValue >= goal.target_value

    await supabase
      .from('user_goals')
      .update({
        current_value: newValue,
        completed_at: completed ? new Date().toISOString() : null,
      })
      .eq('id', goal.id)

    // If goal just completed, award XP
    if (completed && !goal.completed_at) {
      // Import dynamically to avoid circular deps
      const { awardXP } = await import('./progress')
      await awardXP(userId, goal.xp_reward, goal.period === 'weekly' ? 'weekly_goal' : 'monthly_goal', goal.id)
    }
  }
}

export async function getActiveGoals(userId: string) {
  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data } = await supabase
    .from('user_goals')
    .select('*')
    .eq('user_id', userId)
    .lte('starts_at', now)
    .gte('ends_at', now)
    .order('created_at', { ascending: false })

  return data ?? []
}

export async function getCompletedGoals(userId: string, limit: number = 10) {
  const supabase = await createClient()

  const { data } = await supabase
    .from('user_goals')
    .select('*')
    .eq('user_id', userId)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(limit)

  return data ?? []
}

export async function suggestGoals(userId: string) {
  const supabase = await createClient()

  // Get recent activity counts
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { count: recentChats },
    { count: recentVoice },
    { count: recentExercises },
    { data: user },
  ] = await Promise.all([
    supabase.from('ai_conversations').select('id', { count: 'exact', head: true }).eq('user_id', userId).gte('created_at', weekAgo),
    supabase.from('ai_conversations').select('id', { count: 'exact', head: true }).eq('user_id', userId).neq('mode', 'text_chat').gte('created_at', weekAgo),
    supabase.from('exercise_attempts').select('id', { count: 'exact', head: true }).eq('user_id', userId).gte('created_at', weekAgo),
    supabase.from('users').select('streak_days').eq('id', userId).single(),
  ])

  const suggestions: Array<{ title: string; targetValue: number; goalType: string; period: 'weekly' }> = []

  // Suggest based on current activity (target slightly above current)
  const chatTarget = Math.max(5, Math.ceil(((recentChats ?? 0) + 3) / 5) * 5)
  suggestions.push({ title: `今週AIチャットを${chatTarget}回する`, targetValue: chatTarget, goalType: 'ai_chats', period: 'weekly' })

  if ((recentVoice ?? 0) > 0) {
    const voiceTarget = Math.max(3, Math.ceil(((recentVoice ?? 0) + 2) / 3) * 3)
    suggestions.push({ title: `今週音声セッションを${voiceTarget}回する`, targetValue: voiceTarget, goalType: 'voice_sessions', period: 'weekly' })
  }

  const exerciseTarget = Math.max(10, Math.ceil(((recentExercises ?? 0) + 5) / 10) * 10)
  suggestions.push({ title: `今週演習を${exerciseTarget}問解く`, targetValue: exerciseTarget, goalType: 'exercises', period: 'weekly' })

  // Streak-based suggestion
  const streakTarget = Math.max(5, (user?.streak_days ?? 0) + 2)
  suggestions.push({ title: `${streakTarget}日連続で学習する`, targetValue: streakTarget, goalType: 'study_days', period: 'weekly' })

  return suggestions.slice(0, 3) // Return top 3
}

export async function deleteGoal(goalId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('user_goals')
    .delete()
    .eq('id', goalId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/progress')
  return { success: true }
}
