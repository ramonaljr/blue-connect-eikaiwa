import { describe, it, expect } from 'vitest'
import { BRAND, pickPalette } from '../colors'

describe('brand palette', () => {
  it('exposes 0..1 linear-rgb triples for every swatch', () => {
    const swatches = [
      ...Object.values(BRAND.light),
      ...Object.values(BRAND.dark),
    ]
    for (const c of swatches) {
      expect(c).toHaveLength(3)
      for (const channel of c) {
        expect(channel).toBeGreaterThanOrEqual(0)
        expect(channel).toBeLessThanOrEqual(1)
      }
    }
  })

  it('pickPalette switches on dark mode', () => {
    expect(pickPalette(true)).toBe(BRAND.dark)
    expect(pickPalette(false)).toBe(BRAND.light)
  })

  it('light and dark primaries differ (theme actually changes color)', () => {
    expect(BRAND.light.primary).not.toEqual(BRAND.dark.primary)
  })
})
