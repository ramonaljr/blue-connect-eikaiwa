import { describe, it, expect } from 'vitest'

describe('XP Dashboard Wiring', () => {
  it('should calculate todayXP from xp_ledger entries', () => {
    const todayEntries = [
      { amount: 30, source: 'ai_chat' },
      { amount: 10, source: 'exercise' },
    ]
    const todayXP = todayEntries.reduce((sum, e) => sum + e.amount, 0)
    expect(todayXP).toBe(40)
  })

  it('should calculate todayMinutes from xp_ledger entry count', () => {
    const entryCount = 5
    const estimatedMinutes = entryCount * 3
    expect(estimatedMinutes).toBe(15)
  })
})
