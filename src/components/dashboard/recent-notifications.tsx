'use client'

import Link from 'next/link'
import { Bell } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Notification {
  id: string
  title: string
  body: string | null
  action_url: string | null
  created_at: string
}

interface RecentNotificationsProps {
  notifications: Notification[]
}

function timeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMinutes < 1) return 'たった今'
  if (diffMinutes < 60) return `${diffMinutes}分前`
  if (diffHours < 24) return `${diffHours}時間前`
  return `${diffDays}日前`
}

export function RecentNotifications({ notifications }: RecentNotificationsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Bell className="size-5" />
            通知
          </span>
          <span className="text-xs font-normal text-muted-foreground cursor-not-allowed">
            すべて見る
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            新しい通知はありません
          </p>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const body = notification.body
                ? notification.body.length > 80
                  ? notification.body.slice(0, 80) + '...'
                  : notification.body
                : null

              const content = (
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{notification.title}</p>
                    {body && (
                      <p className="text-xs text-muted-foreground mt-0.5">{body}</p>
                    )}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {timeAgo(notification.created_at)}
                  </span>
                </div>
              )

              if (notification.action_url) {
                return (
                  <Link
                    key={notification.id}
                    href={notification.action_url}
                    className="block rounded-lg p-2 transition-colors hover:bg-muted"
                  >
                    {content}
                  </Link>
                )
              }

              return (
                <div key={notification.id} className="rounded-lg p-2">
                  {content}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
