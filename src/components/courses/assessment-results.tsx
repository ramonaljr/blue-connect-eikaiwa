'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Trophy,
  RotateCcw,
  PartyPopper,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CourseExercise } from '@/lib/types/database'

interface AssessmentResultsProps {
  scores: number[]
  exercises: CourseExercise[]
  timeTaken: number
  passingScore: number
  onRetake: () => void
  onComplete: () => void
  courseId: string
}

const COOLDOWN_KEY_PREFIX = 'assessment_last_attempt_'
const COOLDOWN_HOURS = 24

export function AssessmentResults({
  scores,
  exercises,
  timeTaken,
  passingScore,
  onRetake,
  onComplete,
  courseId,
}: AssessmentResultsProps) {
  const [showDetails, setShowDetails] = useState(false)

  const averageScore = useMemo(() => {
    if (scores.length === 0) return 0
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  }, [scores])

  const passed = averageScore >= passingScore

  // Skill area breakdown
  const skillBreakdown = useMemo(() => {
    const grouped: Record<string, { total: number; count: number }> = {}
    exercises.forEach((ex, i) => {
      const area = ex.skill_area || 'general'
      if (!grouped[area]) grouped[area] = { total: 0, count: 0 }
      grouped[area].total += scores[i] ?? 0
      grouped[area].count += 1
    })
    return Object.entries(grouped).map(([area, { total, count }]) => ({
      area,
      average: Math.round(total / count),
    }))
  }, [exercises, scores])

  // Cooldown check for retake
  const nowRef = useRef(0)
  const [cooldownActive, setCooldownActive] = useState(false)

  useEffect(() => {
    nowRef.current = Date.now()
    const key = COOLDOWN_KEY_PREFIX + courseId
    const lastAttempt = localStorage.getItem(key)
    if (lastAttempt) {
      const elapsed = nowRef.current - parseInt(lastAttempt, 10)
      setCooldownActive(elapsed < COOLDOWN_HOURS * 60 * 60 * 1000)
    }
  }, [courseId])

  // Save attempt timestamp when results are shown (for failed attempts)
  useEffect(() => {
    if (!passed && typeof window !== 'undefined') {
      localStorage.setItem(
        COOLDOWN_KEY_PREFIX + courseId,
        (nowRef.current || Date.now()).toString()
      )
    }
  }, [passed, courseId])

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Score card */}
      <Card>
        <CardHeader className="text-center">
          {passed ? (
            <div className="flex flex-col items-center gap-2">
              <PartyPopper className="h-12 w-12 text-yellow-500" />
              <Badge className="bg-green-500 text-lg px-4 py-1">合格!</Badge>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <XCircle className="h-12 w-12 text-red-500" />
              <Badge variant="destructive" className="text-lg px-4 py-1">
                不合格
              </Badge>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall score */}
          <div className="text-center">
            <span
              className={cn(
                'text-6xl font-bold tabular-nums',
                averageScore >= passingScore
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              )}
            >
              {averageScore}%
            </span>
            <p className="mt-1 text-sm text-muted-foreground">
              合格基準: {passingScore}%
            </p>
          </div>

          {/* Time taken */}
          <div className="text-center text-sm text-muted-foreground">
            所要時間: {formatTime(timeTaken)}
          </div>

          {/* Skill area breakdown */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">スキル別スコア</h3>
            {skillBreakdown.map(({ area, average }) => (
              <div key={area} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="capitalize">{area}</span>
                  <span
                    className={cn(
                      'font-medium tabular-nums',
                      average >= passingScore
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    )}
                  >
                    {average}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      average >= passingScore ? 'bg-green-500' : 'bg-red-500'
                    )}
                    style={{ width: `${Math.min(100, average)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Per-exercise details (collapsible) */}
          <div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex w-full items-center justify-between rounded-lg border p-3 text-sm hover:bg-muted transition-colors"
            >
              <span className="font-medium">問題別の結果</span>
              {showDetails ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
            {showDetails && (
              <div className="mt-2 space-y-2">
                {exercises.map((ex, i) => {
                  const score = scores[i] ?? 0
                  const isPass = score >= passingScore
                  return (
                    <div
                      key={ex.id}
                      className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        {isPass ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="truncate max-w-[300px]">
                          {i + 1}. {ex.question_ja || ex.question}
                        </span>
                      </div>
                      <span
                        className={cn(
                          'font-medium tabular-nums',
                          isPass
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        )}
                      >
                        {score}%
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {passed ? (
              <Button onClick={onComplete} size="lg" className="w-full">
                <Trophy className="mr-2 h-5 w-5" />
                コースを完了する
              </Button>
            ) : (
              <div className="space-y-2">
                <Button
                  onClick={onRetake}
                  size="lg"
                  className="w-full"
                  disabled={cooldownActive}
                >
                  <RotateCcw className="mr-2 h-5 w-5" />
                  再挑戦
                </Button>
                {cooldownActive && (
                  <p className="text-center text-sm text-muted-foreground">
                    24時間後に再挑戦できます
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
