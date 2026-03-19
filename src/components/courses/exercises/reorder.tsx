'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Timer, ArrowUp, ArrowDown } from 'lucide-react'
import { toast } from 'sonner'
import { submitExerciseAttempt } from '@/lib/actions/exercises'
import type { CourseExercise } from '@/lib/types/database'

interface ReorderProps {
  exercise: CourseExercise
  locale: string
  onComplete: (score: number) => void
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function Reorder({ exercise, locale, onComplete }: ReorderProps) {
  const correctOrder = exercise.correct_answer.split('|')
  const [items, setItems] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [positionResults, setPositionResults] = useState<boolean[]>([])
  const [timeLeft, setTimeLeft] = useState<number | null>(
    exercise.time_limit_seconds ?? null
  )

  const question =
    locale === 'ja'
      ? exercise.question_ja || exercise.question
      : exercise.question
  const explanation =
    locale === 'ja'
      ? exercise.explanation_ja || exercise.explanation
      : exercise.explanation

  useEffect(() => {
    setItems(shuffleArray(exercise.options as string[]))
  }, [exercise.options])

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || submitted) return
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [timeLeft, submitted])

  function handleItemClick(index: number) {
    if (submitted) return

    if (selectedIndex === null) {
      setSelectedIndex(index)
    } else if (selectedIndex === index) {
      setSelectedIndex(null)
    } else {
      // Swap the two items
      const newItems = [...items]
      ;[newItems[selectedIndex], newItems[index]] = [
        newItems[index],
        newItems[selectedIndex],
      ]
      setItems(newItems)
      setSelectedIndex(null)
    }
  }

  function moveItem(index: number, direction: 'up' | 'down') {
    if (submitted) return

    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= items.length) return

    const newItems = [...items]
    ;[newItems[index], newItems[targetIndex]] = [
      newItems[targetIndex],
      newItems[index],
    ]
    setItems(newItems)
    setSelectedIndex(null)
  }

  const handleSubmit = useCallback(() => {
    if (submitted) return

    const results = items.map((item, i) => item === correctOrder[i])
    const correctCount = results.filter(Boolean).length
    const score = Math.round((correctCount / items.length) * 100)

    setPositionResults(results)
    setSubmitted(true)

    if (score === 100) {
      toast.success(locale === 'ja' ? '全問正解！' : 'Perfect order!')
    } else if (score > 0) {
      toast.info(
        locale === 'ja'
          ? `${correctCount}/${items.length} 正しい位置`
          : `${correctCount}/${items.length} in correct position`
      )
    } else {
      toast.error(locale === 'ja' ? '不正解' : 'Incorrect')
    }

    submitExerciseAttempt({
      exerciseId: exercise.id,
      score,
      timeSpentSeconds: exercise.time_limit_seconds
        ? exercise.time_limit_seconds - (timeLeft ?? 0)
        : 0,
      hintsUsed: 0,
      attempts: 1,
      answerData: { order: items },
    }).catch(() => {
      // silently handle tracking errors
    })

    onComplete(score)
  }, [submitted, items, correctOrder, locale, exercise, timeLeft, onComplete])

  // Auto-submit when timer expires
  useEffect(() => {
    if (timeLeft === 0 && !submitted) {
      handleSubmit()
    }
  }, [timeLeft, submitted, handleSubmit])

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Badge variant="outline">reorder</Badge>
          {submitted && (
            positionResults.every(Boolean) ? (
              <Badge className="bg-green-500">
                <CheckCircle className="mr-1 h-3 w-3" /> 正解
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="mr-1 h-3 w-3" /> 不正解
              </Badge>
            )
          )}
          {timeLeft !== null && !submitted && (
            <Badge variant="secondary" className="ml-auto">
              <Timer className="mr-1 h-3 w-3" />
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </Badge>
          )}
        </div>
        <CardTitle className="text-base">{question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {items.map((item, index) => {
            const isSelected = selectedIndex === index
            const isCorrectPosition = positionResults[index]

            let className =
              'flex w-full items-center gap-2 rounded-lg border-2 p-3 text-sm transition-colors '

            if (submitted && isCorrectPosition === true) {
              className += 'border-green-500 bg-green-50'
            } else if (submitted && isCorrectPosition === false) {
              className += 'border-red-500 bg-red-50'
            } else if (isSelected) {
              className += 'border-primary bg-primary/10'
            } else {
              className += 'border-muted hover:bg-muted'
            }

            return (
              <div key={`${item}-${index}`} className={className}>
                <button
                  onClick={() => handleItemClick(index)}
                  className="flex-1 text-left"
                  disabled={submitted}
                >
                  <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {index + 1}
                  </span>
                  {item}
                </button>

                {!submitted && (
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        moveItem(index, 'up')
                      }}
                      disabled={index === 0}
                      className="rounded p-0.5 hover:bg-muted disabled:opacity-30"
                      aria-label="Move up"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        moveItem(index, 'down')
                      }}
                      disabled={index === items.length - 1}
                      className="rounded p-0.5 hover:bg-muted disabled:opacity-30"
                      aria-label="Move down"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {submitted && (
                  <span>
                    {isCorrectPosition ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {!submitted && (
          <Button onClick={handleSubmit}>回答する</Button>
        )}

        {submitted && explanation && (
          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="font-medium">解説:</p>
            <p>{explanation}</p>
          </div>
        )}

        {submitted && !positionResults.every(Boolean) && (
          <div className="rounded-lg border border-muted p-4 text-sm">
            <p className="font-medium">
              {locale === 'ja' ? '正しい順番:' : 'Correct order:'}
            </p>
            <p className="mt-1">{correctOrder.join(' → ')}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
