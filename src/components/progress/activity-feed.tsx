'use client'

import { useState, useMemo } from 'react'
import { MessageSquare, Mic, BookOpen, Video } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type ActivityType = 'ai_chat' | 'ai_voice' | 'exercise' | 'lesson'

interface Activity {
  type: ActivityType
  title: string
  detail: string
  score?: number
  xp: number
  created_at: string
}

export interface ActivityFeedProps {
  activities: Activity[]
}

const ACTIVITY_CONFIG: Record<ActivityType, { icon: typeof MessageSquare; color: string; label: string }> = {
  ai_chat: { icon: MessageSquare, color: 'text-blue-500', label: 'AIチャット' },
  ai_voice: { icon: Mic, color: 'text-green-500', label: 'AI音声' },
  exercise: { icon: BookOpen, color: 'text-purple-500', label: '演習' },
  lesson: { icon: Video, color: 'text-orange-500', label: 'レッスン' },
}

const FILTER_OPTIONS: Array<{ value: ActivityType | 'all'; label: string }> = [
  { value: 'all', label: 'すべて' },
  { value: 'ai_chat', label: 'AIチャット' },
  { value: 'ai_voice', label: 'AI音声' },
  { value: 'exercise', label: '演習' },
  { value: 'lesson', label: 'レッスン' },
]

const PAGE_SIZE = 20

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return 'たった今'
  if (diffMin < 60) return `${diffMin}分前`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours}時間前`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}日前`
  const diffWeeks = Math.floor(diffDays / 7)
  if (diffWeeks < 4) return `${diffWeeks}週間前`
  const diffMonths = Math.floor(diffDays / 30)
  return `${diffMonths}ヶ月前`
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const [filter, setFilter] = useState<ActivityType | 'all'>('all')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const filtered = useMemo(() => {
    if (filter === 'all') return activities
    return activities.filter((a) => a.type === filter)
  }, [activities, filter])

  const visible = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>アクティビティ</CardTitle>
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value as ActivityType | 'all')
              setVisibleCount(PAGE_SIZE)
            }}
            className="rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          >
            {FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {visible.length === 0 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            アクティビティがありません
          </p>
        )}

        {visible.map((activity, i) => {
          const config = ACTIVITY_CONFIG[activity.type]
          const Icon = config.icon

          return (
            <div
              key={`${activity.created_at}-${i}`}
              className="flex items-start gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/50"
            >
              <div className={`mt-0.5 shrink-0 ${config.color}`}>
                <Icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">{activity.title}</p>
                  {activity.score != null && (
                    <Badge variant="secondary" className="shrink-0 text-[10px]">
                      {activity.score}%
                    </Badge>
                  )}
                </div>
                <p className="truncate text-xs text-muted-foreground">{activity.detail}</p>
              </div>
              <div className="shrink-0 text-right">
                <Badge variant="outline" className="text-[10px]">
                  +{activity.xp} XP
                </Badge>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {timeAgo(activity.created_at)}
                </p>
              </div>
            </div>
          )
        })}

        {hasMore && (
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="mt-2 w-full rounded-lg py-2 text-center text-sm font-medium text-primary transition-colors hover:bg-muted/50"
          >
            もっと見る
          </button>
        )}
      </CardContent>
    </Card>
  )
}
