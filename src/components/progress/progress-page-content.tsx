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
import { SkillsRadarChart } from '@/components/progress/skills-radar-chart'
import type { SkillsRadarChartProps } from '@/components/progress/skills-radar-chart'
import { ActivityFeed } from '@/components/progress/activity-feed'
import type { ActivityFeedProps } from '@/components/progress/activity-feed'
import { WeeklySummaryCard } from '@/components/progress/weekly-summary-card'
import type { WeeklySummaryCardProps } from '@/components/progress/weekly-summary-card'
import { AchievementsGrid } from '@/components/progress/achievements-grid'
import type { AchievementsGridProps } from '@/components/progress/achievements-grid'
import { GoalsSection } from '@/components/progress/goals-section'
import type { GoalsSectionProps } from '@/components/progress/goals-section'
import { Leaderboard } from '@/components/progress/leaderboard'
import type { LeaderboardProps } from '@/components/progress/leaderboard'
import { PronunciationTab } from '@/components/progress/pronunciation-tab'
import type { CEFRLevel } from '@/lib/types/database'

const DEFAULT_SKILLS: SkillsRadarChartProps['current'] = {
  grammar: 0,
  vocabulary: 0,
  listening: 0,
  pronunciation: 0,
  fluency: 0,
}

const DEFAULT_WEEK_STATS: WeeklySummaryCardProps['thisWeek'] = {
  totalXP: 0,
  exercises: 0,
  aiSessions: 0,
  lessons: 0,
  studyDays: 0,
}

interface ProgressPageContentProps {
  user: {
    id: string
    xp: number
    level: number
    streakDays: number
    longestStreak: number
    englishLevel: CEFRLevel
    lastActivityDate: string | null
  }
  heatmapData: Array<{ date: string; value: number }>
  monthlyXpEntries: number
  skillScores?: SkillsRadarChartProps['current']
  previousSkillScores?: SkillsRadarChartProps['current']
  activities?: ActivityFeedProps['activities']
  thisWeek?: WeeklySummaryCardProps['thisWeek']
  lastWeek?: WeeklySummaryCardProps['lastWeek']
  achievements?: AchievementsGridProps['achievements']
  initialGoals?: GoalsSectionProps['initialGoals']
  leaderboardOptedIn?: LeaderboardProps['optedIn']
}

export function ProgressPageContent({
  user,
  heatmapData,
  monthlyXpEntries,
  skillScores = DEFAULT_SKILLS,
  previousSkillScores,
  activities = [],
  thisWeek = DEFAULT_WEEK_STATS,
  lastWeek = DEFAULT_WEEK_STATS,
  achievements = [],
  initialGoals = [],
  leaderboardOptedIn = false,
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
          <TabsTrigger value="pronunciation">発音</TabsTrigger>
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
          <div className="space-y-6">
            <SkillsRadarChart current={skillScores} previous={previousSkillScores} />
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <div className="grid gap-6 lg:grid-cols-2">
            <ActivityFeed activities={activities} />
            <WeeklySummaryCard thisWeek={thisWeek} lastWeek={lastWeek} />
          </div>
        </TabsContent>

        <TabsContent value="achievements">
          <AchievementsGrid achievements={achievements} />
        </TabsContent>

        <TabsContent value="goals">
          <div className="grid gap-6 lg:grid-cols-2">
            <GoalsSection userId={user.id} initialGoals={initialGoals} />
            <Leaderboard userId={user.id} optedIn={leaderboardOptedIn} />
          </div>
        </TabsContent>

        <TabsContent value="pronunciation">
          <PronunciationTab userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
