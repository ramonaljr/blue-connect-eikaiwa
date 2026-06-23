'use client'

import { useEffect, useState } from 'react'

/** Linear-sRGB triple in the 0..1 range, ready for THREE.Color.setRGB(...). */
export type LinearRGB = readonly [number, number, number]

export interface Palette {
  primary: LinearRGB
  accent: LinearRGB
  emerald: LinearRGB
  bg: LinearRGB
}

/**
 * Brand colors from `src/app/globals.css`, converted from OKLCH to linear sRGB
 * (via the OKLab transform) so they can be fed directly to THREE.Color with
 * THREE.LinearSRGBColorSpace and match the DOM exactly.
 */
export const BRAND: { light: Palette; dark: Palette } = {
  light: {
    primary: [0, 0.165, 0.7403],
    accent: [0.8593, 0.3195, 0],
    emerald: [0, 0.42, 0.1049],
    bg: [0.9352, 0.9593, 0.9858],
  },
  dark: {
    primary: [0.0441, 0.3347, 0.9225],
    accent: [0.7285, 0.2918, 0],
    emerald: [0.0143, 0.4572, 0.1462],
    bg: [0.0016, 0.0029, 0.0048],
  },
}

export function pickPalette(isDark: boolean): Palette {
  return isDark ? BRAND.dark : BRAND.light
}

/**
 * Track the hand-rolled `.dark` class on <html> (set by the inline script in
 * the root layout). Returns false during SSR/first paint.
 */
export function useIsDark(): boolean {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    const update = () => setIsDark(root.classList.contains('dark'))
    update()
    const observer = new MutationObserver(update)
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return isDark
}
