'use client'

import { useMemo } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { LessonCard } from './lesson-card'
import { Calendar, History, XCircle } from 'lucide-react'

interface LessonWithTutor {
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

interface LessonsPageContentProps {
  lessons: LessonWithTutor[]
}

export function LessonsPageContent({ lessons }: LessonsPageContentProps) {
  const now = useMemo(() => new Date(), [])

  const upcoming = useMemo(
    () =>
      lessons.filter(
        (l) => l.status === 'scheduled' && new Date(l.scheduled_at) > now
      ),
    [lessons, now]
  )

  const past = useMemo(
    () =>
      lessons.filter(
        (l) =>
          l.status === 'completed' ||
          (l.status === 'scheduled' && new Date(l.scheduled_at) <= now)
      ),
    [lessons, now]
  )

  const canceled = useMemo(
    () => lessons.filter((l) => l.status === 'canceled'),
    [lessons]
  )

  return (
    <Tabs defaultValue="upcoming" className="space-y-4">
      <TabsList>
        <TabsTrigger value="upcoming">
          <Calendar className="mr-1.5 size-4" />
          予定 ({upcoming.length})
        </TabsTrigger>
        <TabsTrigger value="past">
          <History className="mr-1.5 size-4" />
          過去 ({past.length})
        </TabsTrigger>
        <TabsTrigger value="canceled">
          <XCircle className="mr-1.5 size-4" />
          キャンセル済み ({canceled.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="upcoming">
        {upcoming.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            予定されているレッスンはありません
          </p>
        ) : (
          <div className="space-y-3">
            {upcoming.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} variant="upcoming" />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="past">
        {past.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            過去のレッスンはありません
          </p>
        ) : (
          <div className="space-y-3">
            {past.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} variant="past" />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="canceled">
        {canceled.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            キャンセルされたレッスンはありません
          </p>
        ) : (
          <div className="space-y-3">
            {canceled.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} variant="canceled" />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
