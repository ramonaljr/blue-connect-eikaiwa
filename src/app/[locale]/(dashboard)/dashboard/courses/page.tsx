import { requireAuth } from '@/lib/auth/guard'
import { createClient } from '@/lib/supabase/server'
import { CourseCard } from '@/components/courses/course-card'

export default async function CoursesPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .order('sort_order')

  const { data: progress } = await supabase
    .from('learner_progress')
    .select('course_id, status, score')
    .eq('user_id', user.id)

  const progressMap = new Map<string, number>()
  if (progress) {
    for (const p of progress) {
      if (p.status === 'completed') {
        progressMap.set(p.course_id, 100)
      } else if (p.score) {
        progressMap.set(p.course_id, Math.round(p.score))
      }
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">コース一覧</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses?.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            progress={progressMap.get(course.id)}
          />
        ))}
        {!courses?.length && (
          <p className="text-muted-foreground col-span-full text-center py-12">
            コースはまだありません
          </p>
        )}
      </div>
    </div>
  )
}
