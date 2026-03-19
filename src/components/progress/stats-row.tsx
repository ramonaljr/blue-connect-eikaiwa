'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Flame, Award, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { CEFRLevel } from '@/lib/types/database'

interface StatsRowProps {
  xp: number
  level: number
  streakDays: number
  longestStreak: number
  englishLevel: CEFRLevel
  monthlyXpEntries: number
}

function useCountUp(target: number, duration = 1000) {
  const [value, setValue] = useState(0)
  const ref = useRef<number | null>(null)

  useEffect(() => {
    const start = performance.now()
    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))
      if (progress < 1) {
        ref.current = requestAnimationFrame(animate)
      }
    }
    ref.current = requestAnimationFrame(animate)
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current)
    }
  }, [target, duration])

  return value
}

export function StatsRow({
  xp,
  level,
  streakDays,
  longestStreak,
  englishLevel,
  monthlyXpEntries,
}: StatsRowProps) {
  const animatedXp = useCountUp(xp, 1200)
  const animatedStreak = useCountUp(streakDays, 800)
  const isStreakActive = streakDays > 0

  // Approximate study time: each XP entry ~5 minutes
  const totalMinutes = monthlyXpEntries * 5
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  const CEFR_ORDER: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  const currentIndex = CEFR_ORDER.indexOf(englishLevel)
  const nextLevel = currentIndex < CEFR_ORDER.length - 1 ? CEFR_ORDER[currentIndex + 1] : null

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* XP + Level */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0 }}
      >
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
              <Star className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <div className="text-2xl font-bold tabular-nums">
                {animatedXp.toLocaleString()}
                <span className="ml-1 text-sm font-normal text-muted-foreground">XP</span>
              </div>
              <Badge variant="secondary" className="mt-0.5 text-xs">
                Level {level}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Streak */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <motion.div
                animate={
                  isStreakActive
                    ? {
                        scale: [1, 1.2, 1],
                      }
                    : {}
                }
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Flame
                  className={`h-5 w-5 ${
                    isStreakActive ? 'text-orange-500' : 'text-muted-foreground'
                  }`}
                />
              </motion.div>
            </div>
            <div>
              <div className="text-2xl font-bold tabular-nums">
                {animatedStreak}
                <span className="ml-1 text-sm font-normal text-muted-foreground">日連続</span>
              </div>
              <p className="text-xs text-muted-foreground">
                最長: {longestStreak}日
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* CEFR Level */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Award className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <div className="text-2xl font-bold">{englishLevel}</div>
              <p className="text-xs text-muted-foreground">
                {nextLevel
                  ? `${nextLevel}まであと少し！`
                  : '最高レベル達成！'}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Monthly Study Time */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Clock className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <div className="text-2xl font-bold tabular-nums">
                {hours > 0 ? (
                  <>
                    {hours}
                    <span className="text-sm font-normal text-muted-foreground">時間</span>
                    {minutes > 0 && (
                      <>
                        {' '}
                        {minutes}
                        <span className="text-sm font-normal text-muted-foreground">分</span>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {minutes}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">分</span>
                  </>
                )}
              </div>
              <p className="text-xs text-muted-foreground">今月の学習時間</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
