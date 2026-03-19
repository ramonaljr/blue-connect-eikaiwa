import { requireAuth } from '@/lib/auth/guard'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { TestPrepMode } from '@/components/courses/test-prep-mode'
import type { CourseExercise } from '@/lib/types/database'

export default async function TestPrepPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>
}) {
  const { id, locale } = await params
  await requireAuth()
  const supabase = await createClient()

  const { data: course } = await supabase
    .from('courses')
    .select('title, title_ja, units:course_units(exercises:course_exercises(*))')
    .eq('id', id)
    .single()

  if (!course) notFound()

  const allExercises = (course.units ?? [])
    .flatMap((u: { exercises: CourseExercise[] }) => u.exercises ?? []) as CourseExercise[]

  return (
    <TestPrepMode
      courseName={locale === 'ja' ? course.title_ja : course.title}
      exercises={allExercises}
      locale={locale}
    />
  )
}
