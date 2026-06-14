'use client'

import { useState, useEffect, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Mic, TrendingUp, AlertTriangle } from 'lucide-react'
import { getPronunciationHistory } from '@/lib/actions/pronunciation'

export function PronunciationTab({ userId }: { userId: string }) {
  const [data, setData] = useState<{
    overallTrend: Array<{ date: string; score: number }>
    weakPhonemes: Array<{ phoneme: string; averageScore: number; practiceCount: number }>
    totalSessions: number
    averageScore: number
    bestScore: number
  } | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      const result = await getPronunciationHistory()
      if ('data' in result) setData(result.data)
    })
  }, [userId])

  if (!data) return <div className="text-center py-8 text-muted-foreground">読み込み中...</div>

  if (data.totalSessions === 0) {
    return (
      <div className="text-center py-12 space-y-4">
        <Mic className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="font-medium">発音データがありません</p>
        <p className="text-sm text-muted-foreground">AI音声で練習すると、発音スコアがここに表示されます</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold">{data.averageScore}</p>
          <p className="text-sm text-muted-foreground">平均スコア</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold">{data.bestScore}</p>
          <p className="text-sm text-muted-foreground">最高スコア</p>
        </CardContent></Card>
        <Card><CardContent className="pt-6 text-center">
          <p className="text-3xl font-bold">{data.totalSessions}</p>
          <p className="text-sm text-muted-foreground">練習回数</p>
        </CardContent></Card>
      </div>

      {data.weakPhonemes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              苦手な発音（日本人学習者向け）
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.weakPhonemes.slice(0, 5).map(p => (
              <div key={p.phoneme} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">{p.phoneme}</Badge>
                    <span className="text-sm text-muted-foreground">{p.practiceCount}回練習</span>
                  </div>
                  <span className="text-sm font-medium">{p.averageScore}%</span>
                </div>
                <Progress value={p.averageScore} />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {data.overallTrend.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5" />
              スコア推移
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-32">
              {data.overallTrend.slice(-30).map((d, i) => (
                <div key={i} className="flex-1 bg-blue-500 rounded-t" style={{ height: `${d.score}%` }} title={`${d.date}: ${d.score}%`} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
