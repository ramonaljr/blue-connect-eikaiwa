'use client'

import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface WeekStats {
  totalXP: number
  exercises: number
  aiSessions: number
  lessons: number
  studyDays: number
}

export interface WeeklySummaryCardProps {
  thisWeek: WeekStats
  lastWeek: WeekStats
}

function formatDelta(current: number, previous: number): { text: string; positive: boolean } {
  if (previous === 0) return { text: current > 0 ? '+100%' : '\u2014', positive: current > 0 }
  const delta = Math.round(((current - previous) / previous) * 100)
  return { text: `${delta > 0 ? '+' : ''}${delta}%`, positive: delta >= 0 }
}

interface StatRowProps {
  label: string
  value: number | string
  current: number
  previous: number
}

function StatRow({ label, value, current, previous }: StatRowProps) {
  const { text, positive } = formatDelta(current, previous)
  const isNeutral = text === '\u2014'

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold">{value}</span>
        <span
          className={`flex items-center gap-0.5 text-xs font-medium ${
            isNeutral
              ? 'text-muted-foreground'
              : positive
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
          }`}
        >
          {!isNeutral &&
            (positive ? (
              <TrendingUp className="size-3" />
            ) : (
              <TrendingDown className="size-3" />
            ))}
          {isNeutral && <Minus className="size-3" />}
          {text}
        </span>
      </div>
    </div>
  )
}

export function WeeklySummaryCard({ thisWeek, lastWeek }: WeeklySummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>今週のまとめ</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-border">
        <StatRow
          label="獲得XP"
          value={thisWeek.totalXP.toLocaleString()}
          current={thisWeek.totalXP}
          previous={lastWeek.totalXP}
        />
        <StatRow
          label="演習完了"
          value={thisWeek.exercises}
          current={thisWeek.exercises}
          previous={lastWeek.exercises}
        />
        <StatRow
          label="AIセッション"
          value={thisWeek.aiSessions}
          current={thisWeek.aiSessions}
          previous={lastWeek.aiSessions}
        />
        <StatRow
          label="レッスン参加"
          value={thisWeek.lessons}
          current={thisWeek.lessons}
          previous={lastWeek.lessons}
        />
        <StatRow
          label="学習日数"
          value={`${thisWeek.studyDays}/7`}
          current={thisWeek.studyDays}
          previous={lastWeek.studyDays}
        />
      </CardContent>
    </Card>
  )
}
