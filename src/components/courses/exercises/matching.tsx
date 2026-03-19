'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Timer } from 'lucide-react'
import { toast } from 'sonner'
import { submitExerciseAttempt } from '@/lib/actions/exercises'
import type { CourseExercise } from '@/lib/types/database'

interface MatchingProps {
  exercise: CourseExercise
  locale: string
  testMode?: boolean
  onComplete: (score: number) => void
}

interface MatchPair {
  left: string
  right: string
}

const MATCH_COLORS = [
  'border-blue-500 bg-blue-50',
  'border-green-500 bg-green-50',
  'border-purple-500 bg-purple-50',
  'border-orange-500 bg-orange-50',
  'border-pink-500 bg-pink-50',
  'border-teal-500 bg-teal-50',
]

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function Matching({ exercise, locale, testMode: _testMode, onComplete }: MatchingProps) {
  const pairs = exercise.options as MatchPair[]
  const shuffledRight = useMemo(
    () => shuffleArray(pairs.map((p) => p.right)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [exercise.id]
  )
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [matches, setMatches] = useState<Map<string, string>>(new Map())
  const [submitted, setSubmitted] = useState(false)
  const [results, setResults] = useState<Map<string, boolean>>(new Map())
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

  const handleSubmitRef = useRef<() => void>(() => {})

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || submitted) return
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval)
          // Auto-submit on next tick when timer expires
          setTimeout(() => handleSubmitRef.current(), 0)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [timeLeft, submitted])

  function getMatchColorIndex(left: string): number {
    const matchedLefts = Array.from(matches.keys())
    return matchedLefts.indexOf(left) % MATCH_COLORS.length
  }

  function getMatchColorForRight(right: string): number {
    for (const [left, matchedRight] of matches) {
      if (matchedRight === right) {
        return getMatchColorIndex(left)
      }
    }
    return -1
  }

  function handleLeftClick(left: string) {
    if (submitted) return

    // If this left item is already matched, unmatch it
    if (matches.has(left)) {
      const newMatches = new Map(matches)
      newMatches.delete(left)
      setMatches(newMatches)
      setSelectedLeft(null)
      return
    }

    setSelectedLeft(selectedLeft === left ? null : left)
  }

  function handleRightClick(right: string) {
    if (submitted || selectedLeft === null) return

    // If this right item is already matched to something else, unmatch that first
    const newMatches = new Map(matches)
    for (const [left, matchedRight] of newMatches) {
      if (matchedRight === right) {
        newMatches.delete(left)
        break
      }
    }

    newMatches.set(selectedLeft, right)
    setMatches(newMatches)
    setSelectedLeft(null)
  }

  const handleSubmit = useCallback(() => {
    if (submitted) return

    const correctMap = new Map<string, string>()
    for (const pair of pairs) {
      correctMap.set(pair.left, pair.right)
    }

    const resultMap = new Map<string, boolean>()
    let correctCount = 0

    for (const pair of pairs) {
      const userMatch = matches.get(pair.left)
      const isCorrect = userMatch === correctMap.get(pair.left)
      resultMap.set(pair.left, isCorrect)
      if (isCorrect) correctCount++
    }

    const score = Math.round((correctCount / pairs.length) * 100)
    setResults(resultMap)
    setSubmitted(true)

    if (score === 100) {
      toast.success(locale === 'ja' ? '全問正解！' : 'All correct!')
    } else if (score > 0) {
      toast.info(
        locale === 'ja'
          ? `${correctCount}/${pairs.length} 正解`
          : `${correctCount}/${pairs.length} correct`
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
      answerData: Object.fromEntries(matches),
    }).catch(() => {
      // silently handle tracking errors
    })

    onComplete(score)
  }, [submitted, pairs, matches, locale, exercise, timeLeft, onComplete])

  handleSubmitRef.current = handleSubmit

  const allMatched = matches.size === pairs.length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Badge variant="outline">matching</Badge>
          {submitted && (
            results.size > 0 &&
            Array.from(results.values()).every(Boolean) ? (
              <Badge className="bg-green-500">
                <CheckCircle className="mr-1 h-3 w-3" /> 正解
              </Badge>
            ) : submitted ? (
              <Badge variant="destructive">
                <XCircle className="mr-1 h-3 w-3" /> 不正解
              </Badge>
            ) : null
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
        <div className="grid grid-cols-2 gap-4">
          {/* Left column */}
          <div className="space-y-2">
            {pairs.map((pair) => {
              const isMatched = matches.has(pair.left)
              const isSelected = selectedLeft === pair.left
              const colorIndex = isMatched ? getMatchColorIndex(pair.left) : -1
              const isCorrect = results.get(pair.left)

              let className =
                'w-full rounded-lg border-2 p-3 text-left text-sm transition-colors '

              if (submitted && isCorrect === true) {
                className += 'border-green-500 bg-green-50'
              } else if (submitted && isCorrect === false) {
                className += 'border-red-500 bg-red-50'
              } else if (isSelected) {
                className += 'border-primary bg-primary/10'
              } else if (isMatched && colorIndex >= 0) {
                className += MATCH_COLORS[colorIndex]
              } else {
                className += 'border-muted hover:bg-muted'
              }

              return (
                <button
                  key={pair.left}
                  onClick={() => handleLeftClick(pair.left)}
                  className={className}
                  disabled={submitted}
                >
                  {pair.left}
                </button>
              )
            })}
          </div>

          {/* Right column */}
          <div className="space-y-2">
            {shuffledRight.map((right) => {
              const colorIndex = getMatchColorForRight(right)
              const isMatched = colorIndex >= 0

              // Find the left item matched to this right item for result checking
              let matchedLeft: string | null = null
              for (const [left, matchedRight] of matches) {
                if (matchedRight === right) {
                  matchedLeft = left
                  break
                }
              }
              const isCorrect = matchedLeft ? results.get(matchedLeft) : undefined

              let className =
                'w-full rounded-lg border-2 p-3 text-left text-sm transition-colors '

              if (submitted && isCorrect === true) {
                className += 'border-green-500 bg-green-50'
              } else if (submitted && isCorrect === false) {
                className += 'border-red-500 bg-red-50'
              } else if (isMatched && colorIndex >= 0) {
                className += MATCH_COLORS[colorIndex]
              } else if (selectedLeft !== null && !isMatched) {
                className += 'border-muted hover:border-primary hover:bg-primary/10 cursor-pointer'
              } else {
                className += 'border-muted'
              }

              return (
                <button
                  key={right}
                  onClick={() => handleRightClick(right)}
                  className={className}
                  disabled={submitted}
                >
                  {right}
                </button>
              )
            })}
          </div>
        </div>

        {!submitted && (
          <Button onClick={handleSubmit} disabled={!allMatched}>
            回答する
          </Button>
        )}

        {submitted && explanation && (
          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="font-medium">解説:</p>
            <p>{explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
