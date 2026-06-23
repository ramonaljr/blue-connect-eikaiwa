export type DepthTier = 'full' | 'lite' | 'off'

export interface CapabilitySignals {
  /** WebGL2 rendering context is available. */
  webgl2: boolean
  /** User prefers reduced motion. */
  reducedMotion: boolean
  /** Logical CPU cores (navigator.hardwareConcurrency); 0 when unknown. */
  cores: number
  /** Approximate device memory in GB (navigator.deviceMemory); 0 when unknown. */
  memory: number
  /** Coarse pointer, i.e. touch device. */
  coarse: boolean
}

/**
 * Map device/preference signals to a rendering tier.
 *
 * - `off`  → no canvas at all; surfaces use the static CSS fallback.
 * - `lite` → constrained devices: simpler geometry, no heavy postprocessing.
 * - `full` → capable desktops: full scenes + postprocessing.
 *
 * Unknown signals (cores/memory === 0) are treated as capable so we don't
 * needlessly downgrade browsers that omit the non-standard APIs.
 */
export function resolveTier(s: CapabilitySignals): DepthTier {
  if (!s.webgl2 || s.reducedMotion) return 'off'
  const lowCores = s.cores > 0 && s.cores <= 4
  const lowMemory = s.memory > 0 && s.memory <= 3
  if (lowCores || lowMemory || s.coarse) return 'lite'
  return 'full'
}
