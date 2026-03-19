import { describe, it, expect, vi } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: null })),
        })),
      })),
      insert: vi.fn(() => ({ error: null })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({ error: null })),
      })),
    })),
    auth: {
      getUser: vi.fn(() => ({ data: { user: null } })),
    },
  })),
}))

describe('XP System', () => {
  it('getXPForActivity returns correct values for fixed activities', async () => {
    const { getXPForActivity } = await import('@/lib/actions/progress')
    expect(await getXPForActivity('ai_chat')).toBe(30)
    expect(await getXPForActivity('ai_voice')).toBe(50)
    expect(await getXPForActivity('lesson')).toBe(100)
    expect(await getXPForActivity('course_complete')).toBe(200)
    expect(await getXPForActivity('course_unit')).toBe(75)
    expect(await getXPForActivity('pronunciation_drill')).toBe(30)
    expect(await getXPForActivity('daily_goal')).toBe(50)
    expect(await getXPForActivity('weekly_goal')).toBe(100)
  })

  it('getXPForActivity returns 0 for unknown activity types', async () => {
    const { getXPForActivity } = await import('@/lib/actions/progress')
    expect(await getXPForActivity('unknown_activity')).toBe(0)
    expect(await getXPForActivity('')).toBe(0)
  })

  it('getXPForActivity scales exercises by difficulty', async () => {
    const { getXPForActivity } = await import('@/lib/actions/progress')
    expect(await getXPForActivity('exercise', 1)).toBe(20)  // base 10 + 1*10
    expect(await getXPForActivity('exercise', 2)).toBe(30)  // base 10 + 2*10
    expect(await getXPForActivity('exercise', 3)).toBe(40)  // base 10 + 3*10
    expect(await getXPForActivity('exercise', 4)).toBe(50)  // base 10 + 4*10
    expect(await getXPForActivity('exercise', 5)).toBe(60)  // base 10 + 5*10
  })

  it('getXPForActivity defaults to difficulty 1 when not specified', async () => {
    const { getXPForActivity } = await import('@/lib/actions/progress')
    expect(await getXPForActivity('exercise')).toBe(20)  // base 10 + 1*10 (default)
  })
})
