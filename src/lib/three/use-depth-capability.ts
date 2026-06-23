'use client'

import { useEffect, useState } from 'react'
import { resolveTier, type DepthTier } from './capability'

function detectWebGL2(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return !!canvas.getContext('webgl2')
  } catch {
    return false
  }
}

/**
 * Resolve the live rendering tier for the current device/session.
 *
 * SSR-safe: starts as `off` so nothing 3D renders during hydration; upgrades
 * once we can probe the browser. Re-evaluates if the reduced-motion preference
 * changes mid-session.
 */
export function useDepthCapability(): DepthTier {
  const [tier, setTier] = useState<DepthTier>('off')

  useEffect(() => {
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const coarse = window.matchMedia('(pointer: coarse)').matches
    const cores = navigator.hardwareConcurrency ?? 0
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 0
    const webgl2 = detectWebGL2()

    const evaluate = () =>
      setTier(
        resolveTier({
          webgl2,
          reducedMotion: reducedMotionQuery.matches,
          cores,
          memory,
          coarse,
        }),
      )

    evaluate()
    reducedMotionQuery.addEventListener('change', evaluate)
    return () => reducedMotionQuery.removeEventListener('change', evaluate)
  }, [])

  return tier
}
