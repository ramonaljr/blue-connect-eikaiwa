'use server'

import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

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
  // Privileged: writes xp_ledger + users.xp/level/streak. Runs as the service
  // role so these tables can deny direct writes from the authenticated role
  // (anti-forgery). Callers always pass the acting user's own id.
  const supabase = createServiceClient()

  // 1. Insert into xp_ledger. When a sourceId is supplied the (user, source,
  //    source_id) unique index makes this idempotent: a duplicate award (e.g.
  //    the same AI conversation hitting the threshold on every message) is
  //    rejected here and we return before mutating the user's XP/streak.
  const { error: ledgerError } = await supabase.from('xp_ledger').insert({
    user_id: userId,
    amount,
    source,
    source_id: sourceId ?? null,
  })

  // 23505 = unique-constraint violation: this (user, source, source_id) was
  // already awarded, so stop here to avoid double-applying XP (this is what
  // closes the AI-chat farming exploit). Other insert errors (e.g. a
  // non-UUID source_id such as a generated daily-mission id) are tolerated so
  // those awards keep working as before.
  if (ledgerError?.code === '23505') {
    return
  }

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

export async function getXPForActivity(
  activity: string,
  difficulty?: number
): Promise<number> {
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
  // Privileged: inserts user_achievements + updates users.xp. Service role.
  const supabase = createServiceClient()

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

export async function getWeeklyLeaderboard(userId: string) {
  const supabase = await createClient()
  const mondayOfWeek = new Date()
  mondayOfWeek.setDate(mondayOfWeek.getDate() - ((mondayOfWeek.getDay() + 6) % 7))
  mondayOfWeek.setHours(0, 0, 0, 0)

  const { data: entries } = await supabase
    .from('xp_ledger')
    .select('user_id, amount')
    .gte('created_at', mondayOfWeek.toISOString())
    .limit(1000)

  if (!entries) return { rankings: [], userRank: 0 }

  // Group by user
  const totals = new Map<string, number>()
  for (const e of entries) {
    totals.set(e.user_id, (totals.get(e.user_id) ?? 0) + e.amount)
  }

  // Sort and rank
  const sorted = [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 50)

  // Get display names for top users
  const topUserIds = sorted.map(([id]) => id)
  if (topUserIds.length === 0) return { rankings: [], userRank: 0 }

  const { data: users } = await supabase
    .from('public_profiles')
    .select('id, display_name, avatar_url, leaderboard_opt_in')
    .in('id', topUserIds)

  const userMap = new Map(users?.map((u) => [u.id, u]) ?? [])

  const rankings = sorted.map(([id, xp], i) => {
    const user = userMap.get(id)
    return {
      rank: i + 1,
      userId: id,
      displayName: user?.leaderboard_opt_in ? (user?.display_name ?? '匿名') : '匿名',
      avatarUrl: user?.leaderboard_opt_in ? user?.avatar_url : null,
      xp,
      isCurrentUser: id === userId,
    }
  })

  const userRank = rankings.findIndex((r) => r.isCurrentUser) + 1

  return { rankings, userRank }
}

export async function toggleLeaderboardOptIn(optIn: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  await supabase.from('users').update({ leaderboard_opt_in: optIn }).eq('id', user.id)
  return { success: true }
}

// Helper for updating streak without awarding XP (for daily check)
export async function updateStreak(userId: string) {
  // Same streak logic as in awardXP but without XP change
  // Used by daily cron to detect broken streaks. Privileged (writes
  // users.streak fields), so it runs as the service role.
  const supabase = createServiceClient()
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
