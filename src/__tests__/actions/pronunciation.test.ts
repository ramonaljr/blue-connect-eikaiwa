import { describe, it, expect } from 'vitest'

describe('Pronunciation Analysis', () => {
  it('should identify weakest phonemes from scores', () => {
    const phonemeScores = [
      { phoneme: 'l', score: 45 },
      { phoneme: 'r', score: 40 },
      { phoneme: 'th', score: 55 },
      { phoneme: 'v', score: 50 },
      { phoneme: 'b', score: 85 },
    ]
    const weakest = phonemeScores.sort((a, b) => a.score - b.score).slice(0, 3)
    expect(weakest[0].phoneme).toBe('r')
    expect(weakest[1].phoneme).toBe('l')
  })

  it('should calculate trend from time-series scores', () => {
    const scores = [
      { date: '2026-03-01', score: 60 },
      { date: '2026-03-08', score: 65 },
      { date: '2026-03-15', score: 72 },
    ]
    const trend = scores[scores.length - 1].score - scores[0].score
    expect(trend).toBe(12)
  })
})
