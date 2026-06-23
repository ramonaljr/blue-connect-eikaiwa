'use client'

import { Canvas } from '@react-three/fiber'
import { View, Preload } from '@react-three/drei'
import { useDepthCapability } from '@/lib/three/use-depth-capability'

/**
 * The single, global WebGL canvas for the whole app.
 *
 * Mounted once in the root layout (via SceneCanvasMount). It is a fixed,
 * full-viewport, pointer-events:none layer at z-index -1 — it sits in front of
 * the <html> background but behind body content, so every surface can reveal
 * 3D simply by keeping the relevant region transparent.
 *
 * Each surface declares `<View3D>` regions; drei's shared `<View.Port />`
 * renders all of them through this one renderer (one WebGL context).
 */
export function SceneCanvas() {
  const tier = useDepthCapability()

  // `off` (no WebGL / reduced motion) → never mount a context; surfaces fall
  // back to their static CSS backgrounds.
  if (tier === 'off') return null

  return (
    <Canvas
      eventSource={typeof document !== 'undefined' ? document.body : undefined}
      eventPrefix="client"
      frameloop="always"
      dpr={tier === 'lite' ? [1, 1.5] : [1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: -1,
      }}
    >
      <View.Port />
      <Preload all />
    </Canvas>
  )
}
