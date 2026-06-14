import { requireAuth } from '@/lib/auth/guard'
import { createClient } from '@/lib/supabase/server'
import { fetchPublicProfiles } from '@/lib/public-profiles'
import { LessonsPageContent } from '@/components/lessons/lessons-page-content'

export default async function LessonsPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: lessonRows } = await supabase
    .from('lessons')
    .select('*')
    .eq('learner_id', user.id)
    .order('scheduled_at', { ascending: false })

  // Merge tutor display info from public_profiles (users is not readable for
  // other users).
  const tutors = await fetchPublicProfiles(supabase, (lessonRows ?? []).map((l) => l.tutor_id))
  const lessons = (lessonRows ?? []).map((l) => ({ ...l, tutor: tutors.get(l.tutor_id) ?? null }))

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">レッスン</h1>
      <LessonsPageContent lessons={lessons} />
    </div>
  )
}
