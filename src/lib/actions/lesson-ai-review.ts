'use server'

import { createClient } from '@/lib/supabase/server'

interface ReviewExercise {
  type: 'fill_blank' | 'multiple_choice'
  question: string
  question_ja: string
  options: string[]
  correct_answer: string
  explanation: string
  explanation_ja: string
}

export async function generateLessonReviewExercises(
  lessonId: string
): Promise<{ error: string } | { data: ReviewExercise[] }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const [{ data: lesson }, { data: notes }, { data: prep }] = await Promise.all([
    supabase.from('lessons').select('*').eq('id', lessonId).eq('learner_id', user.id).single(),
    supabase.from('lesson_notes').select('*').eq('lesson_id', lessonId).single(),
    supabase.from('lesson_preparations').select('*').eq('lesson_id', lessonId).single(),
  ])

  if (!lesson) return { error: 'Lesson not found' }

  const context = [
    notes?.shared_notes && `Notes: ${notes.shared_notes}`,
    notes?.tutor_private_notes && `Tutor observations: ${notes.tutor_private_notes}`,
    prep?.topics && `Topic: ${prep.topics}`,
    prep?.vocabulary?.length && `Vocabulary: ${prep.vocabulary.join(', ')}`,
  ].filter(Boolean).join('\n')

  if (!context) return { data: [] }

  // MVP: static exercises from vocabulary. TODO: Claude API for dynamic generation
  const exercises: ReviewExercise[] = (prep?.vocabulary ?? []).slice(0, 3).map((word: string) => ({
    type: 'fill_blank' as const,
    question: `Complete the sentence using "${word}": The _____ was discussed in the meeting.`,
    question_ja: `「${word}」を使って文を完成させてください。`,
    options: [word, 'something', 'nothing', 'everything'],
    correct_answer: word,
    explanation: `"${word}" was a key vocabulary item from your lesson.`,
    explanation_ja: `「${word}」はレッスンで学んだ重要な語彙です。`,
  }))

  return { data: exercises }
}
