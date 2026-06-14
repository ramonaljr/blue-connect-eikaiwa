'use server'

import { createClient } from '@/lib/supabase/server'

const JA_DIFFICULT_PHONEMES = ['l', 'r', 'th', 'v', 'f', 'si', 'zi', 'w', 'dʒ', 'æ']

interface PronunciationHistory {
  overallTrend: Array<{ date: string; score: number }>
  weakPhonemes: Array<{ phoneme: string; averageScore: number; practiceCount: number }>
  totalSessions: number
  averageScore: number
  bestScore: number
}

export async function getPronunciationHistory(): Promise<
  { error: string } | { data: PronunciationHistory }
> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: scores } = await supabase
    .from('pronunciation_scores')
    .select('overall_score, phoneme_scores, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (!scores || scores.length === 0) {
    return {
      data: { overallTrend: [], weakPhonemes: [], totalSessions: 0, averageScore: 0, bestScore: 0 },
    }
  }

  const trendMap = new Map<string, number[]>()
  scores.forEach(s => {
    const date = s.created_at.split('T')[0]
    if (!trendMap.has(date)) trendMap.set(date, [])
    trendMap.get(date)!.push(s.overall_score)
  })
  const overallTrend = Array.from(trendMap.entries()).map(([date, vals]) => ({
    date,
    score: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
  }))

  const phonemeMap = new Map<string, number[]>()
  scores.forEach(s => {
    (s.phoneme_scores ?? []).forEach((ps: { phoneme: string; score: number }) => {
      if (!phonemeMap.has(ps.phoneme)) phonemeMap.set(ps.phoneme, [])
      phonemeMap.get(ps.phoneme)!.push(ps.score)
    })
  })

  const weakPhonemes = Array.from(phonemeMap.entries())
    .map(([phoneme, vals]) => ({
      phoneme,
      averageScore: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length),
      practiceCount: vals.length,
    }))
    .filter(p => JA_DIFFICULT_PHONEMES.includes(p.phoneme))
    .sort((a, b) => a.averageScore - b.averageScore)

  const allScores = scores.map(s => s.overall_score)

  return {
    data: {
      overallTrend,
      weakPhonemes,
      totalSessions: scores.length,
      averageScore: Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length),
      bestScore: Math.max(...allScores),
    },
  }
}
