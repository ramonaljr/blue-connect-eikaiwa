'use client'

import { useMemo, useRef } from 'react'
import { Points, PointMaterial } from '@react-three/drei'
import { inSphere } from 'maath/random'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useDepthCapability } from '@/lib/three/use-depth-capability'
import { useIsDark, pickPalette } from '@/lib/three/colors'
import { linearColor } from './utils'

/** Instanced point cloud — depth "motes." Count scales with the tier. */
export function ParticleField({ radius = 4 }: { radius?: number }) {
  const tier = useDepthCapability()
  const count = tier === 'full' ? 1400 : 400
  const ref = useRef<THREE.Points>(null)
  const isDark = useIsDark()
  const color = linearColor(pickPalette(isDark).primary)

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    inSphere(arr, { radius })
    return arr
  }, [count, radius])

  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.rotation.y += delta * 0.03
    ref.current.rotation.x += delta * 0.01
  })

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={0.025}
        sizeAttenuation
        depthWrite={false}
        opacity={0.7}
      />
    </Points>
  )
}
