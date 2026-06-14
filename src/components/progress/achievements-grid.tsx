'use client'

import { useState, useMemo } from 'react'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AchievementCard } from './achievement-card'
import type { Achievement } from '@/lib/types/database'

const CATEGORY_TABS = [
  { value: 'all', label: 'すべて' },
  { value: 'streak', label: '継続' },
  { value: 'ai_chat', label: 'AI練習' },
  { value: 'pronunciation', label: '発音' },
  { value: 'course', label: 'コース' },
  { value: 'lesson', label: 'レッスン' },
  { value: 'xp', label: 'XP' },
  { value: 'cefr', label: 'CEFR' },
] as const

export interface AchievementsGridProps {
  achievements: Array<Achievement & { unlocked: boolean; unlocked_at?: string; progress?: number }>
}

export function AchievementsGrid({ achievements }: AchievementsGridProps) {
  const [category, setCategory] = useState('all')

  const filtered = useMemo(() => {
    if (category === 'all') return achievements
    return achievements.filter((a) => a.category === category)
  }, [achievements, category])

  const unlockedCount = achievements.filter((a) => a.unlocked).length

  return (
    <div className="space-y-4">
      {/* Header with count */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          {unlockedCount} / {achievements.length} 達成
        </p>
      </div>

      {/* Category filter tabs */}
      <Tabs value={category} onValueChange={setCategory}>
        <TabsList className="flex h-auto flex-wrap gap-1">
          {CATEGORY_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="text-xs px-3 py-1.5">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="py-8 text-center text-sm text-muted-foreground">
          このカテゴリの実績はありません
        </p>
      )}
    </div>
  )
}
