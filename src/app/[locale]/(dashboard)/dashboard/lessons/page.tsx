import { requireAuth } from '@/lib/auth/guard'
import { createClient } from '@/lib/supabase/server'
import { LessonsPageContent } from '@/components/lessons/lessons-page-content'

export default async function LessonsPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: lessons } = await supabase
    .from('lessons')
    .select('*, tutor:users!lessons_tutor_id_fkey(display_name, avatar_url)')
    .eq('learner_id', user.id)
    .order('scheduled_at', { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">レッスン</h1>
      <LessonsPageContent lessons={lessons ?? []} />
    </div>
  )
}
