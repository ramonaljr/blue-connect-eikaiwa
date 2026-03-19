'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { submitExerciseAttempt } from '@/lib/actions/exercises'
import type { CourseExercise } from '@/lib/types/database'

interface FillBlankProps {
  exercise: CourseExercise
  locale: string
  onComplete: (score: number) => void
}

export function FillBlank({ exercise, locale, onComplete }: FillBlankProps) {
  const question =
    locale === 'ja' ? exercise.question_ja || exercise.question : exercise.question
  const explanation =
    locale === 'ja'
      ? exercise.explanation_ja || exercise.explanation
      : exercise.explanation

  const parts = question.split('___')
  const blankCount = parts.length - 1

  // Options can be: string[] of word-bank words, or string[][] of acceptable answers per blank
  const options = exercise.options as (string | string[])[]
  const hasWordBank = options.length > 0 && typeof options[0] === 'string'
  const wordBankWords = hasWordBank ? (options as string[]) : []

  // Acceptable answers per blank: if options contains arrays, use them; otherwise derive from correct_answer
  const correctAnswers = exercise.correct_answer.split('|').map((a) => a.trim())
  const acceptablePerBlank: string[][] = correctAnswers.map((answer, i) => {
    if (!hasWordBank && Array.isArray(options[i])) {
      return options[i] as string[]
    }
    return [answer]
  })

  const [answers, setAnswers] = useState<string[]>(Array(blankCount).fill(''))
  const [submitted, setSubmitted] = useState(false)
  const [blankResults, setBlankResults] = useState<boolean[]>([])
  const [usedWords, setUsedWords] = useState<string[]>([])
  const [completed, setCompleted] = useState(false)

  const startTimeRef = useRef(Date.now())
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const allFilled = answers.every((a) => a.trim() !== '')

  const checkAnswer = useCallback(
    (answer: string, blankIndex: number): boolean => {
      const acceptable = acceptablePerBlank[blankIndex] ?? [
        correctAnswers[blankIndex],
      ]
      return acceptable.some(
        (acc) => acc.toLowerCase().trim() === answer.toLowerCase().trim()
      )
    },
    [acceptablePerBlank, correctAnswers]
  )

  async function handleSubmit() {
    const results = answers.map((answer, i) => checkAnswer(answer, i))
    setBlankResults(results)
    setSubmitted(true)

    const correctCount = results.filter(Boolean).length
    const score = Math.round((correctCount / blankCount) * 100)

    if (score === 100) {
      toast.success('正解!')
    } else if (score > 0) {
      toast.info(`${correctCount}/${blankCount} 正解`)
    } else {
      toast.error('不正解')
    }

    if (!completed) {
      setCompleted(true)
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000)

      const result = await submitExerciseAttempt({
        exerciseId: exercise.id,
        score,
        timeSpentSeconds: timeSpent,
        hintsUsed: 0,
        attempts: 1,
        answerData: {
          answers,
          blankResults: results,
          correctAnswers,
        },
      })

      if (result.error) {
        toast.error('保存に失敗しました')
      }

      onComplete(score)
    }
  }

  function updateAnswer(index: number, value: string) {
    setAnswers((prev) => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }

  function fillNextBlank(word: string) {
    const nextEmptyIndex = answers.findIndex((a) => a.trim() === '')
    if (nextEmptyIndex === -1) return

    updateAnswer(nextEmptyIndex, word)
    setUsedWords((prev) => [...prev, word])
  }

  function clearBlank(index: number) {
    const removedWord = answers[index]
    updateAnswer(index, '')
    if (hasWordBank && removedWord) {
      setUsedWords((prev) => {
        const i = prev.indexOf(removedWord)
        if (i === -1) return prev
        const next = [...prev]
        next.splice(i, 1)
        return next
      })
    }
    // Focus the cleared input
    inputRefs.current[index]?.focus()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Fill in the Blank</Badge>
          {submitted &&
            (blankResults.every(Boolean) ? (
              <Badge className="bg-green-500">
                <CheckCircle className="mr-1 h-3 w-3" /> 正解!
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="mr-1 h-3 w-3" /> 不正解
              </Badge>
            ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Word bank */}
        {hasWordBank && !submitted && (
          <div className="flex flex-wrap gap-2 mb-4">
            {wordBankWords.map((word, i) => (
              <button
                key={`${word}-${i}`}
                onClick={() => fillNextBlank(word)}
                disabled={usedWords.includes(word)}
                className={cn(
                  'rounded-full border px-3 py-1 text-sm transition-colors',
                  usedWords.includes(word)
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-muted cursor-pointer'
                )}
              >
                {word}
              </button>
            ))}
          </div>
        )}

        {/* Question with inline blanks */}
        <div className="flex flex-wrap items-center gap-1 text-base leading-loose">
          {parts.map((part, i) => (
            <span key={i} className="inline-flex items-center gap-1">
              <span>{part}</span>
              {i < blankCount && (
                <span className="inline-flex items-center gap-1">
                  {submitted ? (
                    <span
                      className={cn(
                        'inline-block rounded border px-2 py-0.5 text-sm font-medium min-w-[80px] text-center',
                        blankResults[i]
                          ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                          : 'border-red-500 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                      )}
                    >
                      {answers[i] || '—'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1">
                      <Input
                        ref={(el) => {
                          inputRefs.current[i] = el
                        }}
                        value={answers[i]}
                        onChange={(e) => updateAnswer(i, e.target.value)}
                        className="inline-block w-32 h-8 text-sm text-center"
                        placeholder="___"
                        disabled={submitted}
                      />
                      {hasWordBank && answers[i] && (
                        <button
                          onClick={() => clearBlank(i)}
                          className="text-xs text-muted-foreground hover:text-foreground"
                          aria-label="Clear"
                        >
                          x
                        </button>
                      )}
                    </span>
                  )}
                </span>
              )}
            </span>
          ))}
        </div>

        {/* Show correct answers after submission if wrong */}
        {submitted && !blankResults.every(Boolean) && (
          <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800 p-3 text-sm">
            <p className="font-medium text-green-700 dark:text-green-400 mb-1">
              正しい答え:
            </p>
            <p className="text-green-600 dark:text-green-300">
              {correctAnswers.join(', ')}
            </p>
          </div>
        )}

        {!submitted && (
          <Button onClick={handleSubmit} disabled={!allFilled}>
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
