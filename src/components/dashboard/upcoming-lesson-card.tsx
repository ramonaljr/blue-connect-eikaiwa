'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

interface UpcomingLessonCardProps {
  lesson: {
    id: string
    scheduled_at: string
    duration_minutes: number
    tutor?: {
      display_name: string
      avatar_url: string | null
    } | null
  }
}

function formatCountdown(diffMs: number): string {
  if (diffMs <= 0) return '開始時間です'
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  if (hours > 0) return `あと${hours}時間${minutes}分`
  return `あと${minutes}分`
}

export function UpcomingLessonCard({ lesson }: UpcomingLessonCardProps) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(interval)
  }, [])

  const scheduledAt = new Date(lesson.scheduled_at)
  const diffMs = scheduledAt.getTime() - now.getTime()
  const canJoin = diffMs <= 5 * 60 * 1000 // 5 minutes before

  const formattedDate = scheduledAt.toLocaleString('ja-JP', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  const tutorName = lesson.tutor?.display_name ?? '講師'
  const tutorInitial = tutorName.charAt(0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="size-5" />
          次のレッスン
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-3">
          <Avatar>
            {lesson.tutor?.avatar_url ? (
              <AvatarImage src={lesson.tutor.avatar_url} alt={tutorName} />
            ) : null}
            <AvatarFallback>{tutorInitial}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{tutorName}</p>
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
          </div>
          <Badge variant="secondary">{lesson.duration_minutes}分</Badge>
        </div>

        <p className="text-sm font-medium text-primary">
          {formatCountdown(diffMs)}
        </p>

        <div className="flex gap-2">
          <Link href={`/dashboard/lessons/${lesson.id}`}>
            <Button size="sm" disabled={!canJoin}>
              参加する
            </Button>
          </Link>
          <Link href={`/dashboard/lessons/${lesson.id}#prepare`}>
            <Button size="sm" variant="outline">
              準備する
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
