'use client'

import { View } from '@react-three/drei'
import { type ReactNode } from 'react'
import { useDepthCapability } from '@/lib/three/use-depth-capability'

/**
 * Declares a DOM region whose pixels are drawn by the global SceneCanvas.
 *
 * `className` styles the tracked placeholder div (size/position it where the
 * 3D should appear — e.g. `absolute inset-0` for a section background).
 * `children` are the R3F scene contents (meshes, lights, effects).
 *
 * When the capability tier is `off` (no WebGL / reduced motion / SSR + first
 * paint) it renders `fallback` instead and never mounts R3F elements — which
 * also keeps these elements out of server rendering.
 *
 * NOTE: only ever import this through a `dynamic(..., { ssr: false })` scene
 * wrapper so three/drei stay client-only and code-split per surface.
 */
export function View3D({
  className,
  children,
  fallback = null,
}: {
  className?: string
  children: ReactNode
  fallback?: ReactNode
}) {
  const tier = useDepthCapability()

  if (tier === 'off') return <>{fallback}</>

  return <View className={className}>{children}</View>
}
