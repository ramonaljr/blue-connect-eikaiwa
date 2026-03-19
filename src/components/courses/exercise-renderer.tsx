'use client'

import type { CourseExercise } from '@/lib/types/database'
import { MultipleChoice } from './exercises/multiple-choice'
import { FillBlank } from './exercises/fill-blank'
import { FreeResponse } from './exercises/free-response'
// Future imports for matching, reorder, audio, conversation

interface ExerciseRendererProps {
  exercise: CourseExercise
  locale: string
  onComplete: (score: number) => void
}

export function ExerciseRenderer({ exercise, locale, onComplete }: ExerciseRendererProps) {
  switch (exercise.type) {
    case 'multiple_choice':
      return <MultipleChoice exercise={exercise} locale={locale} onComplete={onComplete} />
    case 'fill_blank':
      return <FillBlank exercise={exercise} locale={locale} onComplete={onComplete} />
    case 'free_response':
      return <FreeResponse exercise={exercise} locale={locale} onComplete={onComplete} />
    default:
      return (
        <div className="rounded-lg border p-6 text-center text-muted-foreground">
          この練習問題タイプ（{exercise.type}）は近日公開予定です
        </div>
      )
  }
}
