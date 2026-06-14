'use server'

import { createClient } from '@/lib/supabase/server'

interface DailyMission {
  id: string
  type: string
  title: string
  title_ja: string
  target: number
  current: number
  xpReward: number
  completed: boolean
}

export async function getDailyMissions(): Promise<
  { error: string } | { data: DailyMission[] }
> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const today = new Date().toISOString().split('T')[0]

  const [
    { count: chatCount },
    { count: exerciseCount },
    { count: phraseCount },
  ] = await Promise.all([
    supabase.from('ai_conversations').select('*', { count: 'exact', head: true })
      .eq('user_id', user.id).gte('created_at', `${today}T00:00:00`),
    supabase.from('exercise_attempts').select('*', { count: 'exact', head: true })
      .eq('user_id', user.id).gte('created_at', `${today}T00:00:00`),
    supabase.from('saved_phrases').select('*', { count: 'exact', head: true })
      .eq('user_id', user.id).gte('created_at', `${today}T00:00:00`),
  ])

  const missions: DailyMission[] = [
    {
      id: `${today}-chat`,
      type: 'ai_chat',
      title: 'Have an AI conversation',
      title_ja: 'AI英会話を1回する',
      target: 1,
      current: Math.min(chatCount ?? 0, 1),
      xpReward: 25,
      completed: (chatCount ?? 0) >= 1,
    },
    {
      id: `${today}-exercise`,
      type: 'exercise',
      title: 'Complete 3 exercises',
      title_ja: '練習問題を3つ解く',
      target: 3,
      current: Math.min(exerciseCount ?? 0, 3),
      xpReward: 25,
      completed: (exerciseCount ?? 0) >= 3,
    },
    {
      id: `${today}-phrases`,
      type: 'phrases',
      title: 'Save 2 new phrases',
      title_ja: 'フレーズを2つ保存する',
      target: 2,
      current: Math.min(phraseCount ?? 0, 2),
      xpReward: 25,
      completed: (phraseCount ?? 0) >= 2,
    },
  ]

  return { data: missions }
}

export async function claimMissionReward(
  missionId: string
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const result = await getDailyMissions()
  if ('error' in result) return { error: result.error }

  const mission = result.data.find(m => m.id === missionId)
  if (!mission) return { error: 'Mission not found' }
  if (!mission.completed) return { error: 'Mission not yet completed' }

  const { awardXP } = await import('./progress')
  await awardXP(user.id, mission.xpReward, 'daily_mission', missionId)

  return { success: true }
}
