'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Lightbulb, Timer, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { submitExerciseAttempt } from '@/lib/actions/exercises'
import type { CourseExercise } from '@/lib/types/database'

interface MultipleChoiceProps {
  exercise: CourseExercise
  locale: string
  testMode?: boolean
  onComplete: (score: number) => void
}

export function MultipleChoice({ exercise, locale, testMode, onComplete }: MultipleChoiceProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [eliminatedOptions, setEliminatedOptions] = useState<string[]>([])
  const [attemptCount, setAttemptCount] = useState(1)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(
    exercise.time_limit_seconds ?? null
  )
  const [completed, setCompleted] = useState(false)

  const startTimeRef = useRef(Date.now())
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const question =
    locale === 'ja' ? exercise.question_ja || exercise.question : exercise.question
  const explanation =
    locale === 'ja'
      ? exercise.explanation_ja || exercise.explanation
      : exercise.explanation
  const options = exercise.options as string[]

  const calculateScore = useCallback(
    (correct: boolean) => {
      if (!correct) return 0
      let maxScore = 100
      // Hints penalty
      if (hintsUsed >= 2) maxScore = Math.min(maxScore, 40)
      else if (hintsUsed === 1) maxScore = Math.min(maxScore, 70)
      // Retry penalty
      if (attemptCount >= 2) maxScore = Math.min(maxScore, 50)
      return maxScore
    },
    [hintsUsed, attemptCount]
  )

  const finalizeSubmission = useCallback(
    async (score: number) => {
      if (completed) return
      setCompleted(true)

      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000)

      const result = await submitExerciseAttempt({
        exerciseId: exercise.id,
        score,
        timeSpentSeconds: timeSpent,
        hintsUsed,
        attempts: attemptCount,
        answerData: { selectedAnswer, isCorrect: score > 0 },
      })

      if (result.error) {
        toast.error('保存に失敗しました')
      }

      onComplete(score)
    },
    [completed, exercise.id, hintsUsed, attemptCount, selectedAnswer, onComplete]
  )

  // Timer countdown
  useEffect(() => {
    if (timeRemaining === null || completed) return

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [completed, timeRemaining === null])

  // Auto-submit on timeout
  useEffect(() => {
    if (timeRemaining === 0 && !submitted) {
      handleSubmit()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining])

  const maxAttempts = testMode ? 1 : 2
  const maxHints = testMode ? 0 : 2

  function handleSubmit() {
    const correct =
      selectedAnswer?.toLowerCase() === exercise.correct_answer.toLowerCase()
    setIsCorrect(correct)
    setSubmitted(true)

    const score = calculateScore(correct)

    if (correct) {
      toast.success('正解!')
    } else if (attemptCount < maxAttempts) {
      toast.error('不正解')
    } else {
      toast.error('不正解')
      void finalizeSubmission(0)
    }

    if (correct) {
      void finalizeSubmission(score)
    }
  }

  function handleRetry() {
    setSelectedAnswer(null)
    setSubmitted(false)
    setIsCorrect(false)
    setAttemptCount((prev) => prev + 1)
  }

  function handleHint() {
    if (hintsUsed >= maxHints) return

    const wrongOptions = options.filter(
      (opt) =>
        opt.toLowerCase() !== exercise.correct_answer.toLowerCase() &&
        !eliminatedOptions.includes(opt)
    )

    if (wrongOptions.length === 0) return

    const toEliminate = wrongOptions[Math.floor(Math.random() * wrongOptions.length)]
    setEliminatedOptions((prev) => [...prev, toEliminate])
    setHintsUsed((prev) => prev + 1)

    // Clear selection if the eliminated option was selected
    if (selectedAnswer === toEliminate) {
      setSelectedAnswer(null)
    }

    const maxAfterHint = hintsUsed === 0 ? 70 : 40
    toast.info(`ヒント使用 (最大スコア: ${maxAfterHint}%)`)
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Multiple Choice</Badge>
            {submitted &&
              (isCorrect ? (
                <Badge className="bg-green-500">
                  <CheckCircle className="mr-1 h-3 w-3" /> 正解!
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="mr-1 h-3 w-3" /> 不正解
                </Badge>
              ))}
          </div>
          <div className="flex items-center gap-2">
            {!submitted && !completed && maxHints > 0 && hintsUsed < maxHints && (
              <Button variant="ghost" size="sm" onClick={handleHint}>
                <Lightbulb className="mr-1 h-4 w-4" />
                ヒントを見る ({maxHints - hintsUsed})
              </Button>
            )}
            {timeRemaining !== null && (
              <Badge
                variant={timeRemaining <= 10 ? 'destructive' : 'secondary'}
                className="tabular-nums"
              >
                <Timer className="mr-1 h-3 w-3" />
                {formatTime(timeRemaining)}
              </Badge>
            )}
          </div>
        </div>
        <p className="text-base font-semibold pt-2">{question}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {options.map((option, i) => {
            const isEliminated = eliminatedOptions.includes(option)
            const isSelected = selectedAnswer === option
            const isCorrectAnswer =
              option.toLowerCase() === exercise.correct_answer.toLowerCase()

            return (
              <button
                key={i}
                onClick={() =>
                  !submitted && !isEliminated && setSelectedAnswer(option)
                }
                disabled={submitted || isEliminated}
                className={cn(
                  'w-full rounded-lg border p-3 text-left text-sm transition-colors',
                  isEliminated && 'opacity-50 line-through cursor-not-allowed',
                  !submitted &&
                    !isEliminated &&
                    !isSelected &&
                    'hover:bg-muted',
                  !submitted && isSelected && 'border-primary bg-primary/10',
                  submitted &&
                    isCorrectAnswer &&
                    'border-green-500 bg-green-50 dark:bg-green-950/30',
                  submitted &&
                    isSelected &&
                    !isCorrectAnswer &&
                    'border-red-500 bg-red-50 dark:bg-red-950/30'
                )}
              >
                {option}
              </button>
            )
          })}
        </div>

        <div className="flex gap-2">
          {!submitted && !completed && (
            <Button
              onClick={handleSubmit}
              disabled={!selectedAnswer}
            >
              回答する
            </Button>
          )}

          {submitted && !isCorrect && !completed && attemptCount < maxAttempts && (
            <Button variant="outline" onClick={handleRetry}>
              <RotateCcw className="mr-1 h-4 w-4" />
              もう一度
            </Button>
          )}
        </div>

        {submitted && explanation && !testMode && (
          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="font-medium">解説:</p>
            <p>{explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
