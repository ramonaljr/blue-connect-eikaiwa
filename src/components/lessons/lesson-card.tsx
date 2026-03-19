'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { CancelLessonDialog } from './cancel-lesson-dialog'
import { Clock, Star, FileText, RefreshCw } from 'lucide-react'

interface LessonCardProps {
  lesson: {
    id: string
    scheduled_at: string
    duration_minutes: number
    status: string
    learner_rating: number | null
    cancellation_reason: string | null
    credit_refund_amount: number | null
    tutor_id: string
    tutor: { display_name: string; avatar_url: string | null }
  }
  variant: 'upcoming' | 'past' | 'canceled'
}

function formatCountdown(diffMs: number): string {
  if (diffMs <= 0) return '開始時間です'
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  if (days > 0) return `あと${days}日${hours}時間`
  if (hours > 0) return `あと${hours}時間${minutes}分`
  return `あと${minutes}分`
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`size-4 ${
            i < rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-muted-foreground/30'
          }`}
        />
      ))}
    </div>
  )
}

export function LessonCard({ lesson, variant }: LessonCardProps) {
  const [now, setNow] = useState(() => new Date())
  const [cancelOpen, setCancelOpen] = useState(false)

  useEffect(() => {
    if (variant !== 'upcoming') return
    const interval = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(interval)
  }, [variant])

  const scheduledAt = new Date(lesson.scheduled_at)
  const diffMs = scheduledAt.getTime() - now.getTime()
  const canJoin = diffMs <= 5 * 60 * 1000

  const formattedDate = scheduledAt.toLocaleString('ja-JP', {
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })

  const tutorName = lesson.tutor?.display_name ?? '講師'
  const tutorInitial = tutorName.charAt(0)

  const statusBadge = {
    scheduled: <Badge variant="secondary">予定</Badge>,
    completed: <Badge variant="default">完了</Badge>,
    canceled: <Badge variant="destructive">キャンセル</Badge>,
    in_progress: <Badge variant="secondary">進行中</Badge>,
  }[lesson.status] ?? <Badge variant="outline">{lesson.status}</Badge>

  return (
    <>
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Left: tutor info + date */}
          <div className="flex items-center gap-3">
            <Avatar>
              {lesson.tutor?.avatar_url ? (
                <AvatarImage src={lesson.tutor.avatar_url} alt={tutorName} />
              ) : null}
              <AvatarFallback>{tutorInitial}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-medium">{tutorName}</p>
              <p className="text-xs text-muted-foreground">{formattedDate}</p>
              {variant === 'upcoming' && (
                <p className="text-xs font-medium text-primary">
                  <Clock className="mr-1 inline size-3" />
                  {formatCountdown(diffMs)}
                </p>
              )}
            </div>
          </div>

          {/* Center: badges */}
          <div className="flex items-center gap-2">
            <Badge variant="outline">{lesson.duration_minutes}分</Badge>
            {statusBadge}
            {variant === 'past' && lesson.learner_rating != null && (
              <RatingStars rating={lesson.learner_rating} />
            )}
          </div>

          {/* Right: actions */}
          <div className="flex flex-wrap items-center gap-2">
            {variant === 'upcoming' && (
              <>
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
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setCancelOpen(true)}
                >
                  キャンセル
                </Button>
              </>
            )}

            {variant === 'past' && (
              <>
                {lesson.learner_rating == null && (
                  <Link href={`/dashboard/lessons/${lesson.id}#review`}>
                    <Button size="sm" variant="outline">
                      <Star className="mr-1 size-3.5" />
                      レビューを書く
                    </Button>
                  </Link>
                )}
                <Link href={`/dashboard/lessons/${lesson.id}`}>
                  <Button size="sm" variant="outline">
                    <FileText className="mr-1 size-3.5" />
                    ノートを見る
                  </Button>
                </Link>
                <Link href={`/dashboard/tutors/${lesson.tutor_id}`}>
                  <Button size="sm" variant="secondary">
                    <RefreshCw className="mr-1 size-3.5" />
                    再予約
                  </Button>
                </Link>
              </>
            )}

            {variant === 'canceled' && (
              <>
                {lesson.cancellation_reason && (
                  <p className="text-xs text-muted-foreground">
                    理由: {lesson.cancellation_reason}
                  </p>
                )}
                <span className="text-xs text-muted-foreground">
                  {lesson.credit_refund_amount === 1
                    ? '全額返金済み'
                    : lesson.credit_refund_amount === 0.5
                      ? '50%返金済み'
                      : '返金なし'}
                </span>
                <Link href={`/dashboard/tutors/${lesson.tutor_id}`}>
                  <Button size="sm" variant="secondary">
                    <RefreshCw className="mr-1 size-3.5" />
                    再予約
                  </Button>
                </Link>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {variant === 'upcoming' && (
        <CancelLessonDialog
          lessonId={lesson.id}
          scheduledAt={lesson.scheduled_at}
          open={cancelOpen}
          onOpenChange={setCancelOpen}
        />
      )}
    </>
  )
}
