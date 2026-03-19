import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: null, error: null })),
        })),
      })),
    })),
  })),
}))

describe('Adaptive Difficulty', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('should return beginner config for new users (no profile)', async () => {
    const { getAdaptiveConfig } = await import('@/lib/adaptive-difficulty')
    const config = await getAdaptiveConfig('new-user-id')
    expect(config.preferredDifficulty).toBe(2)
    expect(config.showHints).toBe(true)
    expect(config.timeMultiplier).toBe(1.0)
    expect(config.exerciseTypeWeights.multiple_choice).toBe(3)
    expect(config.exerciseTypeWeights.conversation).toBe(0)
  })

  it('should return beginner config for users with < 20 exercises', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockResolvedValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: { exercises_completed: 10 },
              error: null,
            })),
          })),
        })),
      })),
    } as unknown as Awaited<ReturnType<typeof createClient>>)

    const { getAdaptiveConfig } = await import('@/lib/adaptive-difficulty')
    const config = await getAdaptiveConfig('low-activity-user')
    expect(config.preferredDifficulty).toBe(2)
    expect(config.showHints).toBe(true)
    expect(config.timeMultiplier).toBe(1.0)
  })

  it('should return advanced config for high performers (avg accuracy > 85)', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockResolvedValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: {
                exercises_completed: 50,
                grammar_accuracy: 90,
                vocabulary_accuracy: 92,
                listening_accuracy: 88,
                pronunciation_accuracy: 86,
              },
              error: null,
            })),
          })),
        })),
      })),
    } as unknown as Awaited<ReturnType<typeof createClient>>)

    const { getAdaptiveConfig } = await import('@/lib/adaptive-difficulty')
    const config = await getAdaptiveConfig('high-performer')
    expect(config.preferredDifficulty).toBe(4)
    expect(config.showHints).toBe(false)
    expect(config.timeMultiplier).toBe(0.8)
    expect(config.exerciseTypeWeights.free_response).toBe(3)
    expect(config.exerciseTypeWeights.conversation).toBe(3)
  })

  it('should return easier config for struggling users (avg accuracy < 60)', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockResolvedValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: {
                exercises_completed: 30,
                grammar_accuracy: 50,
                vocabulary_accuracy: 55,
                listening_accuracy: 48,
                pronunciation_accuracy: 52,
              },
              error: null,
            })),
          })),
        })),
      })),
    } as unknown as Awaited<ReturnType<typeof createClient>>)

    const { getAdaptiveConfig } = await import('@/lib/adaptive-difficulty')
    const config = await getAdaptiveConfig('struggling-user')
    expect(config.preferredDifficulty).toBe(1)
    expect(config.showHints).toBe(true)
    expect(config.timeMultiplier).toBe(1.3)
    expect(config.exerciseTypeWeights.multiple_choice).toBe(4)
    expect(config.exerciseTypeWeights.free_response).toBe(0)
    expect(config.exerciseTypeWeights.conversation).toBe(0)
  })

  it('should return average config for mid-range users', async () => {
    const { createClient } = await import('@/lib/supabase/server')
    vi.mocked(createClient).mockResolvedValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => ({
              data: {
                exercises_completed: 40,
                grammar_accuracy: 70,
                vocabulary_accuracy: 75,
                listening_accuracy: 68,
                pronunciation_accuracy: 72,
              },
              error: null,
            })),
          })),
        })),
      })),
    } as unknown as Awaited<ReturnType<typeof createClient>>)

    const { getAdaptiveConfig } = await import('@/lib/adaptive-difficulty')
    const config = await getAdaptiveConfig('average-user')
    expect(config.preferredDifficulty).toBe(2)
    expect(config.showHints).toBe(true)
    expect(config.timeMultiplier).toBe(1.0)
    expect(config.exerciseTypeWeights.multiple_choice).toBe(2)
    expect(config.exerciseTypeWeights.free_response).toBe(2)
  })
})
