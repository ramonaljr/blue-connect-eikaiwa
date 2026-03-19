'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, XCircle, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { submitExerciseAttempt } from '@/lib/actions/exercises'
import type { CourseExercise } from '@/lib/types/database'

interface FreeResponseProps {
  exercise: CourseExercise
  locale: string
  onComplete: (score: number) => void
}

interface GradeError {
  original: string
  corrected: string
  type: 'grammar' | 'vocabulary' | 'usage'
}

interface GradeResult {
  score: number
  corrected: string
  errors: GradeError[]
  feedback: string
  feedback_ja: string
  praise: string
}

function getScoreColor(score: number) {
  if (score >= 70) return 'text-green-600 dark:text-green-400'
  if (score >= 50) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

function getScoreBg(score: number) {
  if (score >= 70) return 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800'
  if (score >= 50) return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20 dark:border-yellow-800'
  return 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800'
}

function getErrorBadgeVariant(type: string) {
  switch (type) {
    case 'grammar':
      return 'destructive' as const
    case 'vocabulary':
      return 'secondary' as const
    case 'usage':
      return 'outline' as const
    default:
      return 'outline' as const
  }
}

function renderStars(score: number) {
  const stars = Math.round(score / 20)
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < stars ? 'text-yellow-500' : 'text-muted-foreground/30'}>
      ★
    </span>
  ))
}

export function FreeResponse({ exercise, locale, onComplete }: FreeResponseProps) {
  const question =
    locale === 'ja' ? exercise.question_ja || exercise.question : exercise.question
  const explanation =
    locale === 'ja'
      ? exercise.explanation_ja || exercise.explanation
      : exercise.explanation

  const [answer, setAnswer] = useState('')
  const [grading, setGrading] = useState(false)
  const [result, setResult] = useState<GradeResult | null>(null)
  const [completed, setCompleted] = useState(false)

  const startTimeRef = useRef(Date.now())

  async function handleSubmit() {
    if (!answer.trim()) return

    setGrading(true)

    try {
      const response = await fetch('/api/ai/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answer: answer.trim(),
          question: exercise.question,
          referenceAnswer: exercise.correct_answer,
          level: 'B1',
        }),
      })

      if (!response.ok) {
        throw new Error('Grading failed')
      }

      const gradeResult: GradeResult = await response.json()
      setResult(gradeResult)

      if (gradeResult.score >= 70) {
        toast.success('よくできました!')
      } else if (gradeResult.score >= 50) {
        toast.info('もう少しです!')
      } else {
        toast.error('もう一度挑戦しましょう')
      }

      if (!completed) {
        setCompleted(true)
        const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000)

        const submitResult = await submitExerciseAttempt({
          exerciseId: exercise.id,
          score: gradeResult.score,
          timeSpentSeconds: timeSpent,
          hintsUsed: 0,
          attempts: 1,
          answerData: {
            answer: answer.trim(),
            gradeResult,
          },
        })

        if (submitResult.error) {
          toast.error('保存に失敗しました')
        }

        onComplete(gradeResult.score)
      }
    } catch {
      toast.error('採点に失敗しました。もう一度お試しください。')
    } finally {
      setGrading(false)
    }
  }

  function handleRetry() {
    setAnswer('')
    setResult(null)
    startTimeRef.current = Date.now()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Free Response</Badge>
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" />
            AI採点
          </Badge>
          {result && (
            result.score >= 70 ? (
              <Badge className="bg-green-500">
                <CheckCircle className="mr-1 h-3 w-3" /> 合格
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="mr-1 h-3 w-3" /> 再挑戦
              </Badge>
            )
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Question */}
        <p className="text-base font-medium">{question}</p>

        {/* Textarea for answer */}
        {!result && (
          <>
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={locale === 'ja' ? '英語で回答を入力してください...' : 'Type your answer in English...'}
              rows={5}
              disabled={grading}
              className="resize-none"
            />

            <Button onClick={handleSubmit} disabled={!answer.trim() || grading}>
              {grading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  AIが採点中...
                </>
              ) : (
                '回答する'
              )}
            </Button>
          </>
        )}

        {/* Grading results */}
        {result && (
          <div className="space-y-4">
            {/* Score */}
            <div className={`rounded-lg border p-4 ${getScoreBg(result.score)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">スコア</p>
                  <p className={`text-3xl font-bold ${getScoreColor(result.score)}`}>
                    {result.score}/100
                  </p>
                </div>
                <div className="text-2xl">
                  {renderStars(result.score)}
                </div>
              </div>
            </div>

            {/* Corrected version */}
            <div className="rounded-lg border p-4 space-y-2">
              <p className="text-sm font-medium text-muted-foreground">修正版:</p>
              <div className="space-y-1">
                <p className="text-sm line-through text-red-500 dark:text-red-400">
                  {answer}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {result.corrected}
                </p>
              </div>
            </div>

            {/* Error list */}
            {result.errors.length > 0 && (
              <div className="rounded-lg border p-4 space-y-2">
                <p className="text-sm font-medium text-muted-foreground">エラー:</p>
                <ul className="space-y-2">
                  {result.errors.map((error, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Badge variant={getErrorBadgeVariant(error.type)} className="text-xs shrink-0 mt-0.5">
                        {error.type}
                      </Badge>
                      <span>
                        <span className="line-through text-red-500 dark:text-red-400">
                          {error.original}
                        </span>
                        {' → '}
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          {error.corrected}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Feedback */}
            <div className="rounded-lg bg-muted p-4 text-sm space-y-2">
              <p className="font-medium">フィードバック:</p>
              <p>{result.feedback_ja || result.feedback}</p>
            </div>

            {/* Praise */}
            {result.praise && (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800 p-4 text-sm">
                <p className="font-medium text-yellow-700 dark:text-yellow-400">
                  {result.praise}
                </p>
              </div>
            )}

            {/* Explanation */}
            {explanation && (
              <div className="rounded-lg bg-muted p-4 text-sm">
                <p className="font-medium">解説:</p>
                <p>{explanation}</p>
              </div>
            )}

            {/* Retry button */}
            <Button variant="outline" onClick={handleRetry}>
              もう一度
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
