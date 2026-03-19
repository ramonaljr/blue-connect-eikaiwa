'use server'

import { createClient } from '@/lib/supabase/server'

interface LearningRecommendation {
  type: 'course' | 'ai_chat' | 'ai_voice' | 'tutor' | 'exercise'
  title: string
  title_ja: string
  reason_ja: string
  href: string
  priority: number
}

export async function getAdaptivePath(): Promise<
  { error: string } | { data: LearningRecommendation[] }
> {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return { error: 'Unauthorized' }

  const [
    { data: user },
    { data: skillProfile },
    { data: recentExercises },
    { data: recentChats },
    { data: courses },
    { data: progress },
  ] = await Promise.all([
    supabase.from('users').select('english_level, xp, streak_days').eq('id', authUser.id).single(),
    supabase.from('skill_profiles').select('*').eq('user_id', authUser.id).single(),
    supabase.from('exercise_attempts').select('score, created_at')
      .eq('user_id', authUser.id).order('created_at', { ascending: false }).limit(20),
    supabase.from('ai_conversations').select('id, mode, created_at')
      .eq('user_id', authUser.id).order('created_at', { ascending: false }).limit(10),
    supabase.from('courses').select('id, title, title_ja, level, category').eq('is_published', true),
    supabase.from('learner_progress').select('course_id, status').eq('user_id', authUser.id),
  ])

  const recommendations: LearningRecommendation[] = []
  const completedCourseIds = new Set((progress ?? []).filter(p => p.status === 'completed').map(p => p.course_id))
  const inProgressCourseIds = new Set((progress ?? []).filter(p => p.status === 'in_progress').map(p => p.course_id))

  // 1. Continue in-progress courses
  const inProgressCourses = (courses ?? []).filter(c => inProgressCourseIds.has(c.id))
  inProgressCourses.forEach(c => {
    recommendations.push({
      type: 'course', title: c.title, title_ja: c.title_ja,
      reason_ja: '学習中のコースを続けましょう',
      href: `/dashboard/courses/${c.id}`, priority: 1,
    })
  })

  // 2. Suggest new courses at user's level
  const availableCourses = (courses ?? []).filter(c =>
    !completedCourseIds.has(c.id) && !inProgressCourseIds.has(c.id) && c.level === user?.english_level
  )
  availableCourses.slice(0, 2).forEach(c => {
    recommendations.push({
      type: 'course', title: c.title, title_ja: c.title_ja,
      reason_ja: `あなたのレベル (${c.level}) に合ったコースです`,
      href: `/dashboard/courses/${c.id}`, priority: 2,
    })
  })

  // 3. If low exercise scores, suggest practice
  const avgScore = recentExercises?.length
    ? Math.round((recentExercises.reduce((s, e) => s + e.score, 0)) / recentExercises.length)
    : null
  if (avgScore !== null && avgScore < 70) {
    recommendations.push({
      type: 'exercise', title: 'Practice Exercises', title_ja: '練習問題で復習',
      reason_ja: `最近のスコアが${avgScore}%です。復習で定着させましょう`,
      href: '/dashboard/courses', priority: 2,
    })
  }

  // 4. If no recent AI chats, suggest one
  const recentChatCount = recentChats?.length ?? 0
  if (recentChatCount < 3) {
    recommendations.push({
      type: 'ai_chat', title: 'AI Conversation', title_ja: 'AI英会話で実践練習',
      reason_ja: '会話練習でスピーキング力を鍛えましょう',
      href: '/dashboard/ai-chat', priority: 3,
    })
  }

  // 5. Weak skill-based suggestions
  if (skillProfile) {
    const skills = [
      { name: 'grammar', score: skillProfile.grammar_accuracy, label: '文法' },
      { name: 'vocabulary', score: skillProfile.vocabulary_accuracy, label: '語彙' },
      { name: 'pronunciation', score: skillProfile.pronunciation_accuracy, label: '発音' },
    ]
    const weakest = skills.sort((a, b) => a.score - b.score)[0]
    if (weakest.score < 60) {
      recommendations.push({
        type: weakest.name === 'pronunciation' ? 'ai_voice' : 'ai_chat',
        title: `Focus on ${weakest.name}`, title_ja: `${weakest.label}を強化しましょう`,
        reason_ja: `${weakest.label}のスコアが${weakest.score}%です`,
        href: weakest.name === 'pronunciation' ? '/dashboard/ai-voice' : '/dashboard/ai-chat',
        priority: 2,
      })
    }
  }

  // Sort by priority
  return { data: recommendations.sort((a, b) => a.priority - b.priority).slice(0, 5) }
}
