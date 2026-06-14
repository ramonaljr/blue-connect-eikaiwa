import { describe, it, expect } from 'vitest'

describe('generateLessonReviewExercises', () => {
  it('should format lesson data into exercise prompts', () => {
    const lessonData = {
      tutorNotes: 'Student struggles with past participles. Good vocabulary.',
      topics: 'Business meetings',
      vocabulary: ['agenda', 'stakeholder', 'deliverable'],
    }
    const prompt = `Based on lesson notes: ${lessonData.tutorNotes}\nTopic: ${lessonData.topics}\nVocabulary: ${lessonData.vocabulary.join(', ')}`
    expect(prompt).toContain('past participles')
    expect(prompt).toContain('agenda')
  })

  it('should generate fill_blank exercises from vocabulary', () => {
    const vocabulary = ['agenda', 'stakeholder']
    const exercises = vocabulary.map(word => ({
      type: 'fill_blank',
      question: `Complete: The _____ was discussed.`,
      correct_answer: word,
    }))
    expect(exercises).toHaveLength(2)
    expect(exercises[0].type).toBe('fill_blank')
  })
})
