'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Timer, CheckCircle } from 'lucide-react'
import { ExerciseRenderer } from './exercise-renderer'
import type { CourseExercise } from '@/lib/types/database'

interface TestPrepModeProps {
  courseName: string
  exercises: CourseExercise[]
  locale: string
}

export function TestPrepMode({ courseName, exercises, locale }: TestPrepModeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [scores, setScores] = useState<number[]>([])
  const [startTime] = useState(Date.now())
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setElapsed(Date.now() - startTime), 1000)
    return () => clearInterval(timer)
  }, [startTime])

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000)
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`
  }

  if (currentIndex >= exercises.length) {
    const avgScore = scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0
    return (
      <div className="mx-auto max-w-lg space-y-6 py-12 text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
        <h1 className="text-2xl font-bold">テスト完了！</h1>
        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{avgScore}%</p>
            <p className="text-xs text-muted-foreground">平均スコア</p>
          </CardContent></Card>
          <Card><CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{exercises.length}</p>
            <p className="text-xs text-muted-foreground">問題数</p>
          </CardContent></Card>
          <Card><CardContent className="pt-6 text-center">
            <p className="text-2xl font-bold">{formatTime(elapsed)}</p>
            <p className="text-xs text-muted-foreground">所要時間</p>
          </CardContent></Card>
        </div>
        <Button onClick={() => { setCurrentIndex(0); setScores([]) }}>もう一度</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{courseName} — テストモード</h1>
        <div className="flex items-center gap-3">
          <Badge variant="outline"><Timer className="mr-1 h-3 w-3" /> {formatTime(elapsed)}</Badge>
          <Badge>{currentIndex + 1} / {exercises.length}</Badge>
        </div>
      </div>
      <ExerciseRenderer
        exercise={exercises[currentIndex]}
        locale={locale}
        testMode={true}
        onComplete={(score) => {
          setScores([...scores, score])
          setCurrentIndex(currentIndex + 1)
        }}
      />
    </div>
  )
}
