'use client'

import { Float } from '@react-three/drei'
import { useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/** Gentle idle bobbing/rotation for hero objects. */
export function FloatRig({
  children,
  speed = 1.5,
  rotationIntensity = 0.6,
  floatIntensity = 1.2,
}: {
  children: ReactNode
  speed?: number
  rotationIntensity?: number
  floatIntensity?: number
}) {
  return (
    <Float speed={speed} rotationIntensity={rotationIntensity} floatIntensity={floatIntensity}>
      {children}
    </Float>
  )
}

/** Rotates its contents toward the pointer for a parallax/depth effect. */
export function ParallaxRig({
  children,
  factor = 0.3,
}: {
  children: ReactNode
  factor?: number
}) {
  const group = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!group.current) return
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      state.pointer.x * factor,
      0.05,
    )
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      -state.pointer.y * factor,
      0.05,
    )
  })

  return <group ref={group}>{children}</group>
}
