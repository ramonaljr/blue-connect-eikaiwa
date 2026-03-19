import { requireAuth } from '@/lib/auth/guard'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { LessonRoom } from '@/components/lessons/lesson-room'
import { Badge } from '@/components/ui/badge'

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: lesson } = await supabase
    .from('lessons')
    .select(`
      *,
      tutor:users!lessons_tutor_id_fkey(display_name, avatar_url),
      learner:users!lessons_learner_id_fkey(display_name, avatar_url)
    `)
    .eq('id', id)
    .single()

  if (!lesson) notFound()

  if (lesson.learner_id !== user.id && lesson.tutor_id !== user.id) {
    notFound()
  }

  const scheduledDate = new Date(lesson.scheduled_at).toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">レッスン</h1>
          <p className="text-muted-foreground">{scheduledDate} ({lesson.duration_minutes}分)</p>
        </div>
        <Badge>{lesson.status}</Badge>
      </div>

      <LessonRoom lessonId={lesson.id} roomUrl={lesson.daily_room_url} />
    </div>
  )
}
