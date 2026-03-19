'use server'

import { createClient } from '@/lib/supabase/server'

// XP values by activity type and optional difficulty
const XP_VALUES: Record<string, number | { base: number; perDifficulty: number }> = {
  exercise: { base: 10, perDifficulty: 10 }, // 10-50 by difficulty 1-5
  ai_chat: 30,
  ai_voice: 50,
  pronunciation_drill: 30,
  lesson: 100,
  course_unit: 75,
  course_complete: 200,
  daily_goal: 50,
  weekly_goal: 100,
}

export async function awardXP(
  userId: string,
  amount: number,
  source: string,
  sourceId?: string
) {
  const supabase = await createClient()

  // 1. Insert into xp_ledger
  await supabase.from('xp_ledger').insert({
    user_id: userId,
    amount,
    source,
    source_id: sourceId ?? null,
  })

  // 2. Get current user state
  const { data: user } = await supabase
    .from('users')
    .select('xp, level, streak_days, last_activity_date, streak_freezes_remaining, longest_streak')
    .eq('id', userId)
    .single()

  if (!user) return

  // 3. Calculate new XP and level
  const newXP = user.xp + amount
  const newLevel = Math.floor(newXP / 1000) + 1

  // 4. Update streak
  const today = new Date().toISOString().split('T')[0]
  let newStreak = user.streak_days
  let newFreezes = user.streak_freezes_remaining
  const lastDate = user.last_activity_date

  if (lastDate !== today) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    if (lastDate === yesterdayStr) {
      // Consecutive day
      newStreak = user.streak_days + 1
    } else if (lastDate && lastDate < yesterdayStr) {
      // Gap detected
      if (newFreezes > 0) {
        // Use streak freeze
        newFreezes -= 1
        newStreak = user.streak_days + 1
      } else {
        // Reset streak
        newStreak = 1
      }
    } else if (!lastDate) {
      // First activity ever
      newStreak = 1
    }
  }

  const newLongestStreak = Math.max(user.longest_streak, newStreak)

  // 5. Update user
  await supabase
    .from('users')
    .update({
      xp: newXP,
      level: newLevel,
      streak_days: newStreak,
      last_activity_date: today,
      streak_freezes_remaining: newFreezes,
      longest_streak: newLongestStreak,
    })
    .eq('id', userId)

  // 6. Check achievements
  await checkAchievements(userId, source, newStreak, newLevel)
}

export function getXPForActivity(
  activity: string,
  difficulty?: number
): number {
  const value = XP_VALUES[activity]
  if (!value) return 0
  if (typeof value === 'number') return value
  return value.base + (difficulty ?? 1) * value.perDifficulty
}

async function checkAchievements(
  userId: string,
  trigger: string,
  currentStreak: number,
  currentLevel: number
) {
  const supabase = await createClient()

  // Get all achievements not yet unlocked by this user
  const { data: allAchievements } = await supabase
    .from('achievements')
    .select('*')

  const { data: unlocked } = await supabase
    .from('user_achievements')
    .select('achievement_id')
    .eq('user_id', userId)

  const unlockedIds = new Set(unlocked?.map(u => u.achievement_id) ?? [])
  const locked = (allAchievements ?? []).filter(a => !unlockedIds.has(a.id))

  if (locked.length === 0) return

  // Get user stats for checking
  const [
    { count: chatCount },
    { count: voiceCount },
    { count: lessonCount },
    { count: reviewCount },
    { count: phraseCount },
    { count: courseCount },
  ] = await Promise.all([
    supabase.from('ai_conversations').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('mode', 'text_chat'),
    supabase.from('ai_conversations').select('id', { count: 'exact', head: true }).eq('user_id', userId).neq('mode', 'text_chat'),
    supabase.from('lessons').select('id', { count: 'exact', head: true }).eq('learner_id', userId).eq('status', 'completed'),
    supabase.from('lessons').select('id', { count: 'exact', head: true }).eq('learner_id', userId).not('learner_rating', 'is', null),
    supabase.from('saved_phrases').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('learner_progress').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'completed'),
  ])

  // Get best pronunciation score
  const { data: bestPronunciation } = await supabase
    .from('pronunciation_scores')
    .select('overall_score')
    .eq('user_id', userId)
    .order('overall_score', { ascending: false })
    .limit(1)
    .single()

  const stats: Record<string, number> = {
    streak: currentStreak,
    level: currentLevel,
    ai_chats: chatCount ?? 0,
    voice_sessions: voiceCount ?? 0,
    lessons_completed: lessonCount ?? 0,
    reviews_given: reviewCount ?? 0,
    saved_phrases: phraseCount ?? 0,
    courses_completed: courseCount ?? 0,
    pronunciation_score: bestPronunciation?.overall_score ?? 0,
  }

  // Check each locked achievement
  const newlyUnlocked: typeof locked = []
  for (const achievement of locked) {
    const statValue = stats[achievement.requirement_type] ?? 0
    if (statValue >= achievement.requirement_value) {
      newlyUnlocked.push(achievement)
    }
  }

  if (newlyUnlocked.length === 0) return

  // Insert unlocked achievements
  await supabase.from('user_achievements').insert(
    newlyUnlocked.map(a => ({
      user_id: userId,
      achievement_id: a.id,
    }))
  )

  // Award XP for each achievement
  for (const achievement of newlyUnlocked) {
    await supabase.from('xp_ledger').insert({
      user_id: userId,
      amount: achievement.xp_reward,
      source: 'achievement',
      source_id: achievement.id,
    })
  }

  // Update user XP with total achievement rewards
  const { data: currentUser } = await supabase
    .from('users')
    .select('xp')
    .eq('id', userId)
    .single()

  if (currentUser) {
    const totalReward = newlyUnlocked.reduce((sum, a) => sum + a.xp_reward, 0)
    await supabase
      .from('users')
      .update({
        xp: currentUser.xp + totalReward,
        level: Math.floor((currentUser.xp + totalReward) / 1000) + 1,
      })
      .eq('id', userId)
  }

  // Create notification for each achievement
  await supabase.from('notifications').insert(
    newlyUnlocked.map(a => ({
      user_id: userId,
      type: 'system' as const,
      title: `🏆 ${a.title_ja}`,
      body: a.description_ja,
    }))
  )
}

// Helper for updating streak without awarding XP (for daily check)
export async function updateStreak(userId: string) {
  // Same streak logic as in awardXP but without XP change
  // Used by daily cron to detect broken streaks
  const supabase = await createClient()
  const { data: user } = await supabase
    .from('users')
    .select('streak_days, last_activity_date, streak_freezes_remaining, longest_streak')
    .eq('id', userId)
    .single()

  if (!user) return

  const today = new Date().toISOString().split('T')[0]
  if (user.last_activity_date === today) return // Already active today

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  if (user.last_activity_date && user.last_activity_date < yesterdayStr) {
    // Streak broken (gap > 1 day)
    if (user.streak_freezes_remaining > 0) {
      await supabase
        .from('users')
        .update({ streak_freezes_remaining: user.streak_freezes_remaining - 1 })
        .eq('id', userId)
    } else {
      await supabase
        .from('users')
        .update({ streak_days: 0 })
        .eq('id', userId)
    }
  }
}
