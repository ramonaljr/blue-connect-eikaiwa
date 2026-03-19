'use client'

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'
import { StatsRow } from '@/components/progress/stats-row'
import { ActivityHeatmap } from '@/components/progress/activity-heatmap'
import { StreakCalendar } from '@/components/progress/streak-calendar'
import type { CEFRLevel } from '@/lib/types/database'

interface ProgressPageContentProps {
  user: {
    xp: number
    level: number
    streakDays: number
    longestStreak: number
    englishLevel: CEFRLevel
    lastActivityDate: string | null
  }
  heatmapData: Array<{ date: string; value: number }>
  monthlyXpEntries: number
}

export function ProgressPageContent({
  user,
  heatmapData,
  monthlyXpEntries,
}: ProgressPageContentProps) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">学習進捗</h1>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">概要</TabsTrigger>
          <TabsTrigger value="skills">スキル</TabsTrigger>
          <TabsTrigger value="activity">アクティビティ</TabsTrigger>
          <TabsTrigger value="achievements">実績</TabsTrigger>
          <TabsTrigger value="goals">目標</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">
            <StatsRow
              xp={user.xp}
              level={user.level}
              streakDays={user.streakDays}
              longestStreak={user.longestStreak}
              englishLevel={user.englishLevel}
              monthlyXpEntries={monthlyXpEntries}
            />

            <div className="grid gap-6 lg:grid-cols-2">
              <ActivityHeatmap data={heatmapData} />
              <StreakCalendar
                streakDays={user.streakDays}
                lastActivityDate={user.lastActivityDate}
                longestStreak={user.longestStreak}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="skills">
          <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed p-8">
            <p className="text-muted-foreground">スキル分析は準備中です</p>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed p-8">
            <p className="text-muted-foreground">アクティビティ詳細は準備中です</p>
          </div>
        </TabsContent>

        <TabsContent value="achievements">
          <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed p-8">
            <p className="text-muted-foreground">実績は準備中です</p>
          </div>
        </TabsContent>

        <TabsContent value="goals">
          <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed p-8">
            <p className="text-muted-foreground">目標は準備中です</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
