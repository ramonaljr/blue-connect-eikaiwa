import { requireAuth } from '@/lib/auth/guard'
import { createClient } from '@/lib/supabase/server'
import { fetchPublicProfiles } from '@/lib/public-profiles'
import { notFound } from 'next/navigation'
import { LessonRoom } from '@/components/lessons/lesson-room'
import { RecordingPlayer } from '@/components/lessons/recording-player'
import { Badge } from '@/components/ui/badge'

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: lessonRow } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', id)
    .single()

  if (!lessonRow) notFound()

  if (lessonRow.learner_id !== user.id && lessonRow.tutor_id !== user.id) {
    notFound()
  }

  // Merge tutor/learner display info from public_profiles.
  const profiles = await fetchPublicProfiles(supabase, [lessonRow.tutor_id, lessonRow.learner_id])
  const lesson = {
    ...lessonRow,
    tutor: profiles.get(lessonRow.tutor_id) ?? null,
    learner: profiles.get(lessonRow.learner_id) ?? null,
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

      <LessonRoom
        lessonId={lesson.id}
        roomUrl={lesson.daily_room_url}
        userId={user.id}
        userName={user.display_name ?? 'ユーザー'}
        tutorName={(lesson.tutor as { display_name: string } | null)?.display_name ?? '講師'}
        scheduledAt={lesson.scheduled_at}
        durationMinutes={lesson.duration_minutes}
        prepNotes={lesson.prep_notes ?? null}
      />

      {lesson.status === 'completed' && lesson.recording_url && (
        <RecordingPlayer
          recordingUrl={lesson.recording_url}
          lessonDate={lesson.scheduled_at}
          tutorName={(lesson.tutor as { display_name: string } | null)?.display_name ?? '講師'}
        />
      )}
    </div>
  )
}
