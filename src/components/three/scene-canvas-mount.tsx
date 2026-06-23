'use client'

import dynamic from 'next/dynamic'

// Client-only boundary: keeps three/r3f/drei out of the server bundle entirely.
// `ssr: false` is only permitted inside a client component, hence this wrapper.
const SceneCanvas = dynamic(
  () => import('./scene-canvas').then((m) => m.SceneCanvas),
  { ssr: false },
)

export function SceneCanvasMount() {
  return <SceneCanvas />
}
