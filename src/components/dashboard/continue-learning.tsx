'use client'

import Link from 'next/link'
import { ChevronRight, MessageSquare, BookOpen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ContinueLearningProps {
  recentConversation: {
    id: string
    mode: string
    scenario: string | null
    created_at: string
    messages: { role: string; content: string }[] | null
  } | null
  recentCourseProgress: {
    id: string
    course_id: string
    completed_units: number
    total_units: number
    updated_at: string
    course: {
      title: string
      title_ja: string | null
      thumbnail_url: string | null
    } | null
  } | null
}

export function ContinueLearning({ recentConversation, recentCourseProgress }: ContinueLearningProps) {
  // Determine which is more recent
  const conversationDate = recentConversation?.created_at ? new Date(recentConversation.created_at) : null
  const courseDate = recentCourseProgress?.updated_at ? new Date(recentCourseProgress.updated_at) : null

  const showConversation = conversationDate && (!courseDate || conversationDate > courseDate)
  const showCourse = courseDate && (!conversationDate || courseDate >= conversationDate)

  const hasActivity = showConversation || showCourse

  // Get last message preview from conversation
  const lastMessage = recentConversation?.messages
    ? (() => {
        const msgs = Array.isArray(recentConversation.messages)
          ? recentConversation.messages
          : []
        const last = msgs[msgs.length - 1]
        if (!last?.content) return null
        return last.content.length > 60 ? last.content.slice(0, 60) + '...' : last.content
      })()
    : null

  // Calculate course progress percentage
  const courseProgressPercent = recentCourseProgress
    ? recentCourseProgress.total_units > 0
      ? Math.round((recentCourseProgress.completed_units / recentCourseProgress.total_units) * 100)
      : 0
    : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChevronRight className="size-5" />
          学習を続ける
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasActivity ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">
              まだ学習を始めていません。AI英会話から始めてみましょう！
            </p>
            <Link href="/dashboard/ai-chat">
              <Button size="sm">AI英会話を始める</Button>
            </Link>
          </div>
        ) : showConversation && recentConversation ? (
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MessageSquare className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">AI会話</p>
              {recentConversation.scenario && (
                <p className="text-xs text-muted-foreground">{recentConversation.scenario}</p>
              )}
              {lastMessage && (
                <p className="text-xs text-muted-foreground mt-1 truncate">{lastMessage}</p>
              )}
            </div>
            <Link href="/dashboard/ai-chat">
              <Button size="sm" variant="outline">続ける</Button>
            </Link>
          </div>
        ) : showCourse && recentCourseProgress?.course ? (
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <BookOpen className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                {recentCourseProgress.course.title_ja ?? recentCourseProgress.course.title}
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <div className="h-1.5 flex-1 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${courseProgressPercent}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{courseProgressPercent}%</span>
              </div>
            </div>
            <Link href={`/dashboard/courses/${recentCourseProgress.course_id}`}>
              <Button size="sm" variant="outline">続ける</Button>
            </Link>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
