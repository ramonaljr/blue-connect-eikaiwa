'use client'

import { toast } from 'sonner'
import { Trophy } from 'lucide-react'

export function showAchievementUnlockToast(achievement: {
  title_ja: string
  icon: string
  xp_reward: number
}) {
  toast.custom(
    () => (
      <div className="flex items-center gap-3 rounded-lg border border-yellow-300 bg-card p-4 shadow-lg dark:border-yellow-700">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/40">
          <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">
            {'🏆 '}{achievement.title_ja}
          </p>
          <p className="text-sm text-muted-foreground">
            +{achievement.xp_reward} XP
          </p>
        </div>
      </div>
    ),
    { duration: 5000 }
  )
}
