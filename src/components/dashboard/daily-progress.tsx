'use client'

import { motion } from 'framer-motion'
import { Star, Flame, Target } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface DailyProgressProps {
  xp: number
  streakDays: number
  dailyGoalMinutes: number
  todayMinutes: number
  todayXP?: number
}

export function DailyProgress({ xp, streakDays, dailyGoalMinutes, todayMinutes, todayXP = 0 }: DailyProgressProps) {
  const level = Math.floor(xp / 1000) + 1
  const radius = 18
  const circumference = 2 * Math.PI * radius
  const progress = dailyGoalMinutes > 0 ? Math.min(todayMinutes / dailyGoalMinutes, 1) : 0
  const offset = circumference - progress * circumference

  return (
    <div className="flex gap-3">
      {/* XP */}
      <Card size="sm" className="min-w-[100px]">
        <CardContent className="flex items-center gap-2">
          <Star className="size-5 text-yellow-500" />
          <div>
            <p className="text-lg font-bold leading-tight">{xp.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{todayXP > 0 ? `+${todayXP} 今日` : `Level ${level}`}</p>
          </div>
        </CardContent>
      </Card>

      {/* Streak */}
      <Card size="sm" className="min-w-[100px]">
        <CardContent className="flex items-center gap-2">
          {streakDays > 0 ? (
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Flame className="size-5 text-orange-500" />
            </motion.div>
          ) : (
            <Flame className="size-5 text-muted-foreground" />
          )}
          <div>
            <p className="text-lg font-bold leading-tight">{streakDays}</p>
            <p className="text-xs text-muted-foreground">日連続</p>
          </div>
        </CardContent>
      </Card>

      {/* Daily Goal */}
      <Card size="sm" className="min-w-[100px]">
        <CardContent className="flex items-center gap-2">
          <div className="relative">
            <svg width="48" height="48" className="-rotate-90">
              <circle
                cx="24"
                cy="24"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-muted"
              />
              <circle
                cx="24"
                cy="24"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-primary"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Target className="size-4 text-primary" />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">{todayMinutes}/{dailyGoalMinutes}</p>
            <p className="text-xs text-muted-foreground">分</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
