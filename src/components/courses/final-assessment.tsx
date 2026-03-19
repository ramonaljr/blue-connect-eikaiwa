'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Timer, PlayCircle } from 'lucide-react'
import { ExerciseRenderer } from './exercise-renderer'
import { AssessmentResults } from './assessment-results'
import type { CourseExercise } from '@/lib/types/database'

interface FinalAssessmentProps {
  exercises: CourseExercise[]
  courseId: string
  locale: string
  onComplete: (passed: boolean, score: number) => void
}

const TIME_LIMIT_SECONDS = 30 * 60 // 30 minutes
const PASSING_SCORE = 70

export function FinalAssessment({
  exercises,
  courseId,
  locale,
  onComplete,
}: FinalAssessmentProps) {
  const [phase, setPhase] = useState<'start' | 'active' | 'results'>('start')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [scores, setScores] = useState<number[]>([])
  const [startTime, setStartTime] = useState<number>(0)
  const [timeRemaining, setTimeRemaining] = useState(TIME_LIMIT_SECONDS)
  const [timeTaken, setTimeTaken] = useState(0)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const finishAssessment = useCallback(
    (finalScores: number[]) => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      const elapsed = Math.round((Date.now() - startTime) / 1000)
      setTimeTaken(elapsed)
      setScores(finalScores)
      setPhase('results')
    },
    [startTime]
  )

  // Timer countdown
  useEffect(() => {
    if (phase !== 'active') return

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up: fill remaining scores with 0 and finish
          const remaining = exercises.length - scores.length
          const finalScores = [
            ...scores,
            ...Array<number>(remaining).fill(0),
          ]
          finishAssessment(finalScores)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [phase, scores, exercises.length, finishAssessment])

  function handleStart() {
    setPhase('active')
    setStartTime(Date.now())
    setCurrentIndex(0)
    setScores([])
    setTimeRemaining(TIME_LIMIT_SECONDS)
  }

  function handleExerciseComplete(score: number) {
    const newScores = [...scores, score]
    setScores(newScores)

    if (newScores.length >= exercises.length) {
      finishAssessment(newScores)
    } else {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  function handleRetake() {
    setPhase('start')
    setCurrentIndex(0)
    setScores([])
    setTimeRemaining(TIME_LIMIT_SECONDS)
    setTimeTaken(0)
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // Start screen
  if (phase === 'start') {
    return (
      <Card className="mx-auto max-w-lg">
        <CardHeader className="text-center">
          <h2 className="text-2xl font-bold">最終テスト</h2>
          <p className="text-muted-foreground">
            コースの総合理解度を確認します
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3 rounded-lg bg-muted p-4 text-sm">
            <div className="flex justify-between">
              <span>問題数</span>
              <span className="font-medium">{exercises.length}問</span>
            </div>
            <div className="flex justify-between">
              <span>制限時間</span>
              <span className="font-medium">30分</span>
            </div>
            <div className="flex justify-between">
              <span>合格基準</span>
              <span className="font-medium">70%以上</span>
            </div>
          </div>
          <Button onClick={handleStart} className="w-full" size="lg">
            <PlayCircle className="mr-2 h-5 w-5" />
            開始
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Results screen
  if (phase === 'results') {
    const avgScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0
    const passed = avgScore >= PASSING_SCORE

    return (
      <AssessmentResults
        scores={scores}
        exercises={exercises}
        timeTaken={timeTaken}
        passingScore={PASSING_SCORE}
        onRetake={handleRetake}
        onComplete={() => onComplete(passed, avgScore)}
        courseId={courseId}
      />
    )
  }

  // Active assessment
  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          問題 {currentIndex + 1}/{exercises.length}
        </span>
        <Badge
          variant={timeRemaining <= 60 ? 'destructive' : 'secondary'}
          className="tabular-nums text-sm"
        >
          <Timer className="mr-1 h-4 w-4" />
          {formatTime(timeRemaining)}
        </Badge>
      </div>

      {/* Progress bar */}
      <Progress
        value={(currentIndex / exercises.length) * 100}
        className="h-2"
      />

      {/* Current exercise */}
      <ExerciseRenderer
        key={exercises[currentIndex].id}
        exercise={exercises[currentIndex]}
        locale={locale}
        onComplete={handleExerciseComplete}
      />
    </div>
  )
}
