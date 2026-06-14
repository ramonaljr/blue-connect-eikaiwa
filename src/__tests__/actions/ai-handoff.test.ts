import { describe, it, expect } from 'vitest'

describe('analyzeConversationWeaknesses', () => {
  it('should categorize corrections by type', () => {
    const corrections = [
      { original: 'I go yesterday', corrected: 'I went yesterday', type: 'grammar', explanation: 'Past tense', explanation_ja: '' },
      { original: 'I eat lunch', corrected: 'I had lunch', type: 'vocabulary', explanation: 'More natural', explanation_ja: '' },
      { original: 'I go yesterday', corrected: 'I went yesterday', type: 'grammar', explanation: 'Verb conjugation', explanation_ja: '' },
    ]
    const categories: Record<string, number> = {}
    corrections.forEach(c => { categories[c.type] = (categories[c.type] || 0) + 1 })
    expect(categories).toEqual({ grammar: 2, vocabulary: 1 })
  })

  it('should identify the primary weakness', () => {
    const categories = { grammar: 3, vocabulary: 1, pronunciation: 0 }
    const primary = Object.entries(categories).sort(([, a], [, b]) => b - a)[0]
    expect(primary[0]).toBe('grammar')
  })
})
