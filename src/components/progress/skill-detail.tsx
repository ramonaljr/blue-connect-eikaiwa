'use client'

import { Card, CardContent } from '@/components/ui/card'

export interface SkillDetailProps {
  skillName: string
  skillNameJa: string
  accuracy: number
  exercisesCompleted: number
}

function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 80) return 'text-green-600 dark:text-green-400'
  if (accuracy >= 60) return 'text-yellow-600 dark:text-yellow-400'
  return 'text-red-600 dark:text-red-400'
}

function getBarColor(accuracy: number): string {
  if (accuracy >= 80) return 'bg-green-500'
  if (accuracy >= 60) return 'bg-yellow-500'
  return 'bg-red-500'
}

function getRecommendation(accuracy: number): string {
  if (accuracy >= 80) return 'この分野は順調です。さらに上を目指しましょう！'
  if (accuracy >= 60) return 'もう少し練習すると、さらに上達できます。'
  return 'この分野を重点的に練習することをお勧めします。'
}

export function SkillDetail({ skillName, skillNameJa, accuracy, exercisesCompleted }: SkillDetailProps) {
  return (
    <Card size="sm">
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{skillNameJa}</p>
            <p className="text-xs text-muted-foreground">{skillName}</p>
          </div>
          <span className={`text-lg font-bold ${getAccuracyColor(accuracy)}`}>
            {accuracy}%
          </span>
        </div>

        {/* Accuracy bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${getBarColor(accuracy)}`}
            style={{ width: `${Math.min(accuracy, 100)}%` }}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          演習完了: {exercisesCompleted}問
        </p>

        <p className="text-xs text-muted-foreground/80 italic">
          {getRecommendation(accuracy)}
        </p>
      </CardContent>
    </Card>
  )
}
