'use client'

import { useMemo } from 'react'
import * as THREE from 'three'

/**
 * Soft additive glow sprite — our lightweight stand-in for bloom (real
 * postprocessing conflicts with drei's multi-View scissor rendering). Place
 * behind emissive objects to fake the luminous "bold" look.
 */
function makeRadialTexture(): THREE.Texture {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  gradient.addColorStop(0, 'rgba(255,255,255,1)')
  gradient.addColorStop(0.4, 'rgba(255,255,255,0.5)')
  gradient.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size, size)
  return new THREE.CanvasTexture(canvas)
}

export function Glow({
  position = [0, 0, -1],
  scale = 4,
  color,
  opacity = 0.5,
}: {
  position?: [number, number, number]
  scale?: number
  color: THREE.Color | string
  opacity?: number
}) {
  const texture = useMemo(() => makeRadialTexture(), [])

  return (
    <sprite position={position} scale={[scale, scale, 1]}>
      <spriteMaterial
        map={texture}
        color={color}
        blending={THREE.AdditiveBlending}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </sprite>
  )
}
