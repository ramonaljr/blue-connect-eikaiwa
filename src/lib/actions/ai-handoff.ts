'use server'

import { createClient } from '@/lib/supabase/server'
import type { AICorrection } from '@/lib/types/database'

interface WeaknessAnalysis {
  primaryWeakness: string
  correctionCount: number
  categories: Record<string, number>
  suggestedTopics: string
  suggestedVocabulary: string[]
  suggestedGoals: string[]
}

export async function analyzeConversationWeaknesses(
  conversationId: string
): Promise<{ error: string } | { data: WeaknessAnalysis }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: conversation } = await supabase
    .from('ai_conversations')
    .select('corrections, scenario, messages')
    .eq('id', conversationId)
    .eq('user_id', user.id)
    .single()

  if (!conversation) return { error: 'Conversation not found' }

  const corrections: AICorrection[] = conversation.corrections ?? []
  const categories: Record<string, number> = {}
  const vocabulary: string[] = []

  corrections.forEach(c => {
    categories[c.type] = (categories[c.type] || 0) + 1
    if (c.type === 'vocabulary') vocabulary.push(c.corrected)
  })

  const sorted = Object.entries(categories).sort(([, a], [, b]) => b - a)
  const primaryWeakness = sorted[0]?.[0] ?? 'general'

  const topicMap: Record<string, string> = {
    grammar: '文法の基礎を復習しましょう',
    vocabulary: '語彙力を強化しましょう',
    pronunciation: '発音を集中的に練習しましょう',
    usage: '自然な表現を身につけましょう',
  }

  return {
    data: {
      primaryWeakness,
      correctionCount: corrections.length,
      categories,
      suggestedTopics: topicMap[primaryWeakness] ?? '英会話の総合力を高めましょう',
      suggestedVocabulary: vocabulary.slice(0, 10),
      suggestedGoals: [`${primaryWeakness}のスキルを向上させる`],
    },
  }
}

export async function createLessonPrepFromConversation(
  conversationId: string,
  lessonId: string
): Promise<{ error: string } | { success: true }> {
  const result = await analyzeConversationWeaknesses(conversationId)
  if ('error' in result) return { error: result.error }

  const supabase = await createClient()
  const { error } = await supabase.from('lesson_preparations').upsert({
    lesson_id: lessonId,
    topics: result.data.suggestedTopics,
    vocabulary: result.data.suggestedVocabulary,
    goals: result.data.suggestedGoals,
  }, { onConflict: 'lesson_id' })

  if (error) return { error: error.message }
  return { success: true }
}
