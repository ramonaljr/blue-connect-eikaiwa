'use client'

import { useState, useEffect } from 'react'

const FALLBACK_TIPS = [
  '毎日少しずつ練習することが上達の秘訣です！',
  '英語で独り言を言ってみましょう。スピーキング力がアップします！',
  '好きな英語の歌を聴いて、歌詞を読んでみましょう。',
  '英語の映画やドラマを字幕なしで観てみましょう。',
  '新しい単語を覚えたら、すぐに文を作って使ってみましょう。',
  'AIチャットで今日学んだ表現を使ってみましょう！',
  '発音は完璧でなくても大丈夫。大切なのは伝えようとする気持ちです。',
]

function getFallbackTip(): string {
  return FALLBACK_TIPS[new Date().getDay()]
}

export function DailyTip() {
  const [tip, setTip] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchTip() {
      try {
        const res = await fetch('/api/ai/tip')
        if (!res.ok) throw new Error('Failed to fetch tip')
        const data = await res.json()
        if (!cancelled) {
          setTip(data.tip || getFallbackTip())
        }
      } catch {
        // Non-critical — show a fallback tip on error
        if (!cancelled) {
          setTip(getFallbackTip())
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchTip()
    return () => { cancelled = true }
  }, [])

  if (!loading && !tip) return null

  return (
    <div className="mt-1">
      {loading ? (
        <div className="h-4 w-64 animate-pulse rounded bg-muted" />
      ) : (
        <p className="text-sm italic text-muted-foreground">{tip}</p>
      )}
    </div>
  )
}
