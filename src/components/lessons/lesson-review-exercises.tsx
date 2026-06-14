'use client'

import { useState, useEffect, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, CheckCircle, ArrowRight } from 'lucide-react'
import { generateLessonReviewExercises } from '@/lib/actions/lesson-ai-review'

interface LessonReviewExercisesProps {
  lessonId: string
}

export function LessonReviewExercises({ lessonId }: LessonReviewExercisesProps) {
  const [exercises, setExercises] = useState<Array<{
    type: string; question: string; question_ja: string
    options: string[]; correct_answer: string
    explanation: string; explanation_ja: string
  }>>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      const result = await generateLessonReviewExercises(lessonId)
      if ('data' in result) setExercises(result.data)
    })
  }, [lessonId])

  if (exercises.length === 0) return null

  const isComplete = currentIndex >= exercises.length

  if (isComplete) {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="pt-6 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-3" />
          <p className="font-medium">復習完了！</p>
          <p className="text-sm text-muted-foreground mt-1">
            レッスンで学んだことを定着させました
          </p>
        </CardContent>
      </Card>
    )
  }

  const current = exercises[currentIndex]
  const isCorrect = selectedAnswer === current.correct_answer

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BookOpen className="h-5 w-5" />
          レッスン復習 ({currentIndex + 1}/{exercises.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="font-medium">{current.question}</p>
        <p className="text-sm text-muted-foreground">{current.question_ja}</p>
        <div className="space-y-2">
          {current.options.map((opt) => (
            <Button
              key={opt}
              variant={
                selectedAnswer === opt
                  ? isCorrect ? 'default' : 'destructive'
                  : 'outline'
              }
              className="w-full justify-start"
              disabled={showExplanation}
              onClick={() => { setSelectedAnswer(opt); setShowExplanation(true) }}
            >
              {opt}
            </Button>
          ))}
        </div>
        {showExplanation && (
          <div className="rounded-md bg-muted p-3 text-sm">
            <p>{isCorrect ? '正解！' : '不正解'}</p>
            <p className="text-muted-foreground mt-1">{current.explanation_ja}</p>
            <Button
              size="sm" className="mt-2"
              onClick={() => { setCurrentIndex(currentIndex + 1); setSelectedAnswer(null); setShowExplanation(false) }}
            >
              次へ <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
