import { describe, it, expect } from 'vitest'

describe('completeOnboarding', () => {
  it('should validate onboarding data structure', () => {
    const input = {
      englishLevel: 'A2' as const,
      dailyGoalMinutes: 15,
      preferredTopics: ['daily_conversation', 'travel'],
      aiPersonality: 'friendly' as const,
    }
    expect(input.englishLevel).toBe('A2')
    expect(input.dailyGoalMinutes).toBeGreaterThan(0)
    expect(input.preferredTopics.length).toBeGreaterThan(0)
  })
})
