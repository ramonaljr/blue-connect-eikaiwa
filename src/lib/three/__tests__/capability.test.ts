import { describe, it, expect } from 'vitest'
import { resolveTier } from '../capability'

describe('resolveTier', () => {
  it('returns "off" when reduced motion is preferred', () => {
    expect(
      resolveTier({ webgl2: true, reducedMotion: true, cores: 8, memory: 8, coarse: false }),
    ).toBe('off')
  })

  it('returns "off" when WebGL2 is unavailable', () => {
    expect(
      resolveTier({ webgl2: false, reducedMotion: false, cores: 8, memory: 8, coarse: false }),
    ).toBe('off')
  })

  it('returns "lite" on low-core devices', () => {
    expect(
      resolveTier({ webgl2: true, reducedMotion: false, cores: 2, memory: 4, coarse: true }),
    ).toBe('lite')
  })

  it('returns "lite" when deviceMemory is low', () => {
    expect(
      resolveTier({ webgl2: true, reducedMotion: false, cores: 8, memory: 2, coarse: false }),
    ).toBe('lite')
  })

  it('treats unknown memory/cores (0) as capable, not low', () => {
    expect(
      resolveTier({ webgl2: true, reducedMotion: false, cores: 0, memory: 0, coarse: false }),
    ).toBe('full')
  })

  it('returns "full" on a capable desktop', () => {
    expect(
      resolveTier({ webgl2: true, reducedMotion: false, cores: 8, memory: 8, coarse: false }),
    ).toBe('full')
  })
})
