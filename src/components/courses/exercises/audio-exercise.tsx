'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, XCircle, Volume2, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { submitExerciseAttempt } from '@/lib/actions/exercises'
import type { CourseExercise } from '@/lib/types/database'

interface AudioExerciseProps {
  exercise: CourseExercise
  locale: string
  testMode?: boolean
  onComplete: (score: number) => void
}

type SubType = 'comprehension' | 'dictation'

interface WordDiff {
  word: string
  correct: boolean
}

function determineSubType(exercise: CourseExercise): SubType {
  const options = exercise.options as unknown[]
  // If options has string items, it's comprehension (multiple choice after listening)
  if (
    Array.isArray(options) &&
    options.length > 0 &&
    typeof options[0] === 'string'
  ) {
    return 'comprehension'
  }
  // If correct_answer is long text and no MC options, it's dictation
  return 'dictation'
}

function normalizeText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
}

function computeWordDiff(userText: string, correctText: string): { diffs: WordDiff[]; score: number } {
  const correctWords = normalizeText(correctText)
  const userWords = normalizeText(userText)

  const diffs: WordDiff[] = correctWords.map((word, i) => ({
    word,
    correct: userWords[i] === word,
  }))

  const correctCount = diffs.filter((d) => d.correct).length
  const score = correctWords.length > 0 ? Math.round((correctCount / correctWords.length) * 100) : 0

  return { diffs, score }
}

export function AudioExercise({ exercise, locale, testMode: _testMode, onComplete }: AudioExerciseProps) {
  const subType = determineSubType(exercise)

  const [isPlaying, setIsPlaying] = useState(false)
  const [playCount, setPlayCount] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [completed, setCompleted] = useState(false)

  // Comprehension state
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState(false)
  const [attemptCount, setAttemptCount] = useState(1)

  // Dictation state
  const [dictationText, setDictationText] = useState('')
  const [wordDiffs, setWordDiffs] = useState<WordDiff[]>([])
  const [dictationScore, setDictationScore] = useState(0)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const startTimeRef = useRef(0)

  useEffect(() => {
    startTimeRef.current = Date.now()
  }, [])

  const question =
    locale === 'ja' ? exercise.question_ja || exercise.question : exercise.question
  const explanation =
    locale === 'ja'
      ? exercise.explanation_ja || exercise.explanation
      : exercise.explanation
  const options = exercise.options as string[]

  const playAudio = useCallback(() => {
    if (!exercise.audio_url) {
      toast.error('音声ファイルが見つかりません')
      return
    }

    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    const audio = new Audio(exercise.audio_url)
    audioRef.current = audio

    audio.onplay = () => setIsPlaying(true)
    audio.onended = () => {
      setIsPlaying(false)
      setPlayCount((prev) => prev + 1)
    }
    audio.onerror = () => {
      setIsPlaying(false)
      toast.error('音声の再生に失敗しました')
    }

    audio.play().catch(() => {
      setIsPlaying(false)
      toast.error('音声の再生に失敗しました')
    })
  }, [exercise.audio_url])

  const finalizeSubmission = useCallback(
    async (score: number) => {
      if (completed) return
      setCompleted(true)

      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000)

      const result = await submitExerciseAttempt({
        exerciseId: exercise.id,
        score,
        timeSpentSeconds: timeSpent,
        hintsUsed: 0,
        attempts: attemptCount,
        answerData: {
          subType,
          selectedAnswer: subType === 'comprehension' ? selectedAnswer : dictationText,
          isCorrect: score > 0,
          playCount,
        },
      })

      if (result.error) {
        toast.error('保存に失敗しました')
      }

      onComplete(score)
    },
    [completed, exercise.id, attemptCount, subType, selectedAnswer, dictationText, playCount, onComplete]
  )

  function handleComprehensionSubmit() {
    const correct =
      selectedAnswer?.toLowerCase() === exercise.correct_answer.toLowerCase()
    setIsCorrect(correct)
    setSubmitted(true)

    if (correct) {
      const score = attemptCount === 1 ? 100 : 50
      toast.success('正解!')
      void finalizeSubmission(score)
    } else if (attemptCount < 2) {
      toast.error('不正解')
    } else {
      toast.error('不正解')
      void finalizeSubmission(0)
    }
  }

  function handleComprehensionRetry() {
    setSelectedAnswer(null)
    setSubmitted(false)
    setIsCorrect(false)
    setAttemptCount((prev) => prev + 1)
  }

  function handleDictationSubmit() {
    const { diffs, score } = computeWordDiff(dictationText, exercise.correct_answer)
    setWordDiffs(diffs)
    setDictationScore(score)
    setSubmitted(true)

    if (score >= 80) {
      toast.success(`よくできました! ${score}%`)
    } else if (score >= 50) {
      toast.info(`まあまあです: ${score}%`)
    } else {
      toast.error(`もう少し頑張りましょう: ${score}%`)
    }

    void finalizeSubmission(score)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {subType === 'comprehension' ? 'Listening Comprehension' : 'Dictation'}
            </Badge>
            {submitted &&
              (subType === 'comprehension' ? (
                isCorrect ? (
                  <Badge className="bg-green-500">
                    <CheckCircle className="mr-1 h-3 w-3" /> 正解!
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle className="mr-1 h-3 w-3" /> 不正解
                  </Badge>
                )
              ) : (
                <Badge className={dictationScore >= 80 ? 'bg-green-500' : dictationScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'}>
                  {dictationScore}%
                </Badge>
              ))}
          </div>
        </div>
        <p className="text-base font-semibold pt-2">{question}</p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Audio controls */}
        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-4">
          <Button
            variant={isPlaying ? 'secondary' : 'default'}
            size="sm"
            onClick={playAudio}
            disabled={isPlaying}
          >
            <Volume2 className="mr-2 h-4 w-4" />
            {playCount === 0 ? '再生' : 'もう一度再生'}
          </Button>
          {playCount > 0 && (
            <span className="text-xs text-muted-foreground">
              再生回数: {playCount}
            </span>
          )}
        </div>

        {/* Comprehension: multiple choice */}
        {subType === 'comprehension' && (
          <>
            <div className="space-y-2">
              {options.map((option, i) => {
                const isSelected = selectedAnswer === option
                const isCorrectAnswer =
                  option.toLowerCase() === exercise.correct_answer.toLowerCase()

                return (
                  <button
                    key={i}
                    onClick={() => !submitted && setSelectedAnswer(option)}
                    disabled={submitted}
                    className={cn(
                      'w-full rounded-lg border p-3 text-left text-sm transition-colors',
                      !submitted && !isSelected && 'hover:bg-muted',
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
                  onClick={handleComprehensionSubmit}
                  disabled={!selectedAnswer || playCount === 0}
                >
                  回答する
                </Button>
              )}

              {submitted && !isCorrect && !completed && attemptCount < 2 && (
                <Button variant="outline" onClick={handleComprehensionRetry}>
                  <RotateCcw className="mr-1 h-4 w-4" />
                  もう一度
                </Button>
              )}
            </div>
          </>
        )}

        {/* Dictation: textarea */}
        {subType === 'dictation' && (
          <>
            {!submitted ? (
              <div className="space-y-3">
                <Textarea
                  value={dictationText}
                  onChange={(e) => setDictationText(e.target.value)}
                  placeholder="聞いた内容を入力してください"
                  rows={4}
                  disabled={completed}
                />
                <Button
                  onClick={handleDictationSubmit}
                  disabled={!dictationText.trim() || playCount === 0 || completed}
                >
                  回答する
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium mb-2">あなたの解答との比較:</p>
                  <div className="flex flex-wrap gap-1">
                    {wordDiffs.map((diff, i) => (
                      <span
                        key={i}
                        className={cn(
                          'rounded px-1.5 py-0.5 text-sm font-mono',
                          diff.correct
                            ? 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300 line-through'
                        )}
                      >
                        {diff.word}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg bg-muted p-4 text-sm">
                  <p className="font-medium">正解:</p>
                  <p className="mt-1">{exercise.correct_answer}</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Explanation */}
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
