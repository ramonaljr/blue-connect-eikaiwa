'use client'

import { ExerciseRenderer } from '@/components/courses/exercise-renderer'
import type { CourseExercise } from '@/lib/types/database'

interface UnitExercisesProps {
  exercises: CourseExercise[]
  locale: string
}

export function UnitExercises({ exercises, locale }: UnitExercisesProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">練習問題</h2>
      <div className="text-sm text-muted-foreground">
        {exercises.length}問
      </div>
      {exercises.map((exercise) => (
        <ExerciseRenderer
          key={exercise.id}
          exercise={exercise}
          locale={locale}
          onComplete={(score) => {
            // Score tracking handled by exercise components via server actions
          }}
        />
      ))}
    </div>
  )
}
