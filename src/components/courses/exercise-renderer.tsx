'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle } from 'lucide-react'
import type { CourseExercise } from '@/lib/types/database'

interface ExerciseRendererProps {
  exercise: CourseExercise
  locale: string
  onComplete: (score: number) => void
}

export function ExerciseRenderer({ exercise, locale, onComplete }: ExerciseRendererProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [textAnswer, setTextAnswer] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const question = locale === 'ja' ? exercise.question_ja || exercise.question : exercise.question
  const explanation = locale === 'ja' ? exercise.explanation_ja || exercise.explanation : exercise.explanation

  function handleSubmit() {
    const answer = exercise.type === 'multiple_choice' ? selectedAnswer : textAnswer.trim()
    const correct = answer?.toLowerCase() === exercise.correct_answer.toLowerCase()
    setIsCorrect(correct)
    setSubmitted(true)
    onComplete(correct ? 100 : 0)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{exercise.type.replace('_', ' ')}</Badge>
          {submitted && (
            isCorrect
              ? <Badge className="bg-green-500"><CheckCircle className="mr-1 h-3 w-3" /> 正解</Badge>
              : <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" /> 不正解</Badge>
          )}
        </div>
        <CardTitle className="text-base">{question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {exercise.type === 'multiple_choice' && (
          <div className="space-y-2">
            {(exercise.options as string[]).map((option, i) => (
              <button
                key={i}
                onClick={() => !submitted && setSelectedAnswer(option)}
                className={`w-full rounded-lg border p-3 text-left text-sm transition-colors ${
                  submitted && option === exercise.correct_answer
                    ? 'border-green-500 bg-green-50'
                    : submitted && option === selectedAnswer && !isCorrect
                    ? 'border-destructive bg-destructive/10'
                    : selectedAnswer === option
                    ? 'border-primary bg-primary/10'
                    : 'hover:bg-muted'
                }`}
                disabled={submitted}
              >
                {option}
              </button>
            ))}
          </div>
        )}

        {(exercise.type === 'fill_blank' || exercise.type === 'free_response') && (
          <Input
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            placeholder="答えを入力..."
            disabled={submitted}
          />
        )}

        {!submitted && (
          <Button
            onClick={handleSubmit}
            disabled={!selectedAnswer && !textAnswer.trim()}
          >
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
