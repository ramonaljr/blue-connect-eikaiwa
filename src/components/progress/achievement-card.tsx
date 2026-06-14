'use client'

import { type LucideIcon, Flame, MessageSquare, Mic, Volume2, BookOpen, Video, Star, Bookmark, Zap, TrendingUp, Trophy, Lock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { Achievement } from '@/lib/types/database'

const ICON_MAP: Record<string, LucideIcon> = {
  flame: Flame,
  'message-square': MessageSquare,
  mic: Mic,
  'volume-2': Volume2,
  'book-open': BookOpen,
  video: Video,
  star: Star,
  bookmark: Bookmark,
  zap: Zap,
  'trending-up': TrendingUp,
  trophy: Trophy,
}

export interface AchievementCardProps {
  achievement: Achievement & { unlocked: boolean; unlocked_at?: string; progress?: number }
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  const Icon = ICON_MAP[achievement.icon] ?? Trophy
  const unlocked = achievement.unlocked

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all',
        unlocked
          ? 'border-yellow-400 bg-gradient-to-br from-yellow-50/50 to-amber-50/30 dark:from-yellow-950/20 dark:to-amber-950/10'
          : 'opacity-60'
      )}
    >
      <CardContent className="flex items-start gap-3 p-4">
        {/* Icon */}
        <div
          className={cn(
            'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full',
            unlocked
              ? 'bg-yellow-100 dark:bg-yellow-900/40'
              : 'bg-muted'
          )}
        >
          <Icon
            className={cn(
              'h-6 w-6',
              unlocked ? 'text-yellow-600 dark:text-yellow-400' : 'text-muted-foreground'
            )}
          />
          {!unlocked && (
            <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground/80">
              <Lock className="h-3 w-3 text-background" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-1">
          <p className={cn('text-sm font-semibold leading-tight', unlocked ? 'text-foreground' : 'text-muted-foreground')}>
            {achievement.title_ja}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {achievement.description_ja}
          </p>

          {unlocked && achievement.unlocked_at && (
            <div className="flex items-center gap-2 pt-1">
              <span className="text-xs text-muted-foreground">
                {new Date(achievement.unlocked_at).toLocaleDateString('ja-JP')}
              </span>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400 text-xs px-1.5 py-0">
                +{achievement.xp_reward} XP
              </Badge>
            </div>
          )}

          {!unlocked && achievement.progress != null && achievement.progress > 0 && (
            <div className="space-y-1 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {Math.round(achievement.progress * achievement.requirement_value)}/{achievement.requirement_value}
                </span>
              </div>
              <Progress value={achievement.progress * 100} className="h-1.5" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
