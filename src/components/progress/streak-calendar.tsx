'use client'

import { useMemo } from 'react'
import { Flame } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StreakCalendarProps {
  streakDays: number
  lastActivityDate: string | null
  longestStreak: number
}

export function StreakCalendar({
  streakDays,
  lastActivityDate,
  longestStreak,
}: StreakCalendarProps) {
  const days = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const lastActivity = lastActivityDate
      ? new Date(lastActivityDate)
      : null
    if (lastActivity) {
      lastActivity.setHours(0, 0, 0, 0)
    }

    // Determine which of the last 30 days had activity
    // Streak counts back consecutively from lastActivityDate
    const activeDates = new Set<string>()
    if (lastActivity && streakDays > 0) {
      for (let i = 0; i < streakDays; i++) {
        const d = new Date(lastActivity)
        d.setDate(d.getDate() - i)
        activeDates.add(d.toISOString().split('T')[0])
      }
    }

    const todayStr = today.toISOString().split('T')[0]
    const isActiveToday = activeDates.has(todayStr)

    const result: Array<{
      date: string
      label: string
      active: boolean
      isToday: boolean
    }> = []

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      result.push({
        date: dateStr,
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        active: activeDates.has(dateStr),
        isToday: i === 0,
      })
    }

    return { days: result, isActiveToday }
  }, [streakDays, lastActivityDate])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium">連続学習カレンダー</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1.5">
          {days.days.map((day) => (
            <div
              key={day.date}
              className="group relative flex items-center justify-center"
              title={`${day.label}${day.active ? ' ✓' : ''}`}
            >
              {day.isToday && days.isActiveToday ? (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-white">
                  <Flame className="h-4 w-4" />
                </div>
              ) : day.active ? (
                <div className="h-7 w-7 rounded-full bg-green-500 dark:bg-green-600" />
              ) : (
                <div className="h-7 w-7 rounded-full border-2 border-muted bg-transparent" />
              )}
            </div>
          ))}
        </div>

        <p className="mt-3 text-sm text-muted-foreground">
          最長記録: <span className="font-medium text-foreground">{longestStreak}日</span>
        </p>
      </CardContent>
    </Card>
  )
}
