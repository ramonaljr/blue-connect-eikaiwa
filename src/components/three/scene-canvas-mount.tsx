'use client'

import dynamic from 'next/dynamic'
import { useDepthCapability } from '@/lib/three/use-depth-capability'

// Client-only boundary: keeps three/r3f/drei out of the server bundle entirely.
// `ssr: false` is only permitted inside a client component, hence this wrapper.
const SceneCanvas = dynamic(
  () => import('./scene-canvas').then((m) => m.SceneCanvas),
  { ssr: false },
)

export function SceneCanvasMount() {
  // On `off` tier (no WebGL / reduced motion / low-end) never render the scene,
  // so the heavy three/r3f chunk is never even fetched on those devices.
  const tier = useDepthCapability()
  if (tier === 'off') return null
  return <SceneCanvas />
}
