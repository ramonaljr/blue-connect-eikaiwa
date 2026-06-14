import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ExerciseRenderer } from '@/components/courses/exercise-renderer'
import type { CourseExercise, ExerciseType } from '@/lib/types/database'

// Mock child components to verify routing
vi.mock('@/components/courses/exercises/multiple-choice', () => ({
  MultipleChoice: () => <div data-testid="multiple-choice">MC</div>,
}))
vi.mock('@/components/courses/exercises/fill-blank', () => ({
  FillBlank: () => <div data-testid="fill-blank">FB</div>,
}))
vi.mock('@/components/courses/exercises/free-response', () => ({
  FreeResponse: () => <div data-testid="free-response">FR</div>,
}))
vi.mock('@/components/courses/exercises/audio-exercise', () => ({
  AudioExercise: () => <div data-testid="audio">Audio</div>,
}))
vi.mock('@/components/courses/exercises/conversation-exercise', () => ({
  ConversationExercise: () => <div data-testid="conversation">Conv</div>,
}))
vi.mock('@/components/courses/exercises/matching', () => ({
  Matching: () => <div data-testid="matching">Match</div>,
}))
vi.mock('@/components/courses/exercises/reorder', () => ({
  Reorder: () => <div data-testid="reorder">Reorder</div>,
}))

const baseExercise: CourseExercise = {
  id: '1',
  unit_id: '1',
  type: 'multiple_choice',
  question: 'Test',
  question_ja: 'テスト',
  options: [],
  correct_answer: 'a',
  explanation: '',
  explanation_ja: '',
  sort_order: 0,
  created_at: '',
  skill_area: 'grammar',
  difficulty: 1,
  audio_url: null,
  time_limit_seconds: null,
}

describe('ExerciseRenderer', () => {
  it('routes to MultipleChoice for multiple_choice type', () => {
    render(<ExerciseRenderer exercise={{ ...baseExercise, type: 'multiple_choice' }} locale="ja" onComplete={vi.fn()} />)
    expect(screen.getByTestId('multiple-choice')).toBeTruthy()
  })

  it('routes to FillBlank for fill_blank type', () => {
    render(<ExerciseRenderer exercise={{ ...baseExercise, type: 'fill_blank' }} locale="ja" onComplete={vi.fn()} />)
    expect(screen.getByTestId('fill-blank')).toBeTruthy()
  })

  it('routes to FreeResponse for free_response type', () => {
    render(<ExerciseRenderer exercise={{ ...baseExercise, type: 'free_response' }} locale="ja" onComplete={vi.fn()} />)
    expect(screen.getByTestId('free-response')).toBeTruthy()
  })

  it('routes to AudioExercise for audio type', () => {
    render(<ExerciseRenderer exercise={{ ...baseExercise, type: 'audio' }} locale="ja" onComplete={vi.fn()} />)
    expect(screen.getByTestId('audio')).toBeTruthy()
  })

  it('routes to ConversationExercise for conversation type', () => {
    render(<ExerciseRenderer exercise={{ ...baseExercise, type: 'conversation' }} locale="ja" onComplete={vi.fn()} />)
    expect(screen.getByTestId('conversation')).toBeTruthy()
  })

  it('routes to Matching for matching type', () => {
    render(<ExerciseRenderer exercise={{ ...baseExercise, type: 'matching' }} locale="ja" onComplete={vi.fn()} />)
    expect(screen.getByTestId('matching')).toBeTruthy()
  })

  it('routes to Reorder for reorder type', () => {
    render(<ExerciseRenderer exercise={{ ...baseExercise, type: 'reorder' }} locale="ja" onComplete={vi.fn()} />)
    expect(screen.getByTestId('reorder')).toBeTruthy()
  })

  it('shows placeholder for unknown type', () => {
    render(<ExerciseRenderer exercise={{ ...baseExercise, type: 'unknown' as unknown as ExerciseType }} locale="ja" onComplete={vi.fn()} />)
    expect(screen.getByText(/近日公開予定/)).toBeTruthy()
  })
})
