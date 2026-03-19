import { requireAuth } from '@/lib/auth/guard'
import { createClient } from '@/lib/supabase/server'
import { CoursesPageContent } from '@/components/courses/courses-page-content'

export default async function CoursesPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  // Fetch courses with unit count
  const { data: courses } = await supabase
    .from('courses')
    .select('*, course_units(id)')
    .eq('is_published', true)
    .order('sort_order')

  // Add unit_count to each course
  const coursesWithCount = (courses ?? []).map((c) => ({
    ...c,
    unit_count: (c.course_units as unknown[])?.length ?? 0,
    course_units: undefined, // remove the join data
  }))

  const { data: progress } = await supabase
    .from('learner_progress')
    .select('course_id, status, score')
    .eq('user_id', user.id)

  // Build progress map as plain object (serializable for client component)
  const progressMap: Record<string, number> = {}
  if (progress) {
    for (const p of progress) {
      if (p.status === 'completed') {
        progressMap[p.course_id] = 100
      } else if (p.score) {
        progressMap[p.course_id] = Math.round(p.score)
      }
    }
  }

  return (
    <CoursesPageContent
      courses={coursesWithCount}
      progressMap={progressMap}
      userLevel={user.english_level}
    />
  )
}
