'use client'

import { useRef } from 'react'
import { Float, MeshDistortMaterial } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useIsDark, pickPalette } from '@/lib/three/colors'
import { useDepthCapability } from '@/lib/three/use-depth-capability'
import { linearColor } from './utils'

export type MotifVariant =
  | 'home'
  | 'chat'
  | 'voice'
  | 'assessment'
  | 'courses'
  | 'lessons'
  | 'tutors'
  | 'progress'
  | 'phrases'
  | 'onboarding'
  | 'settings'

/** A slowly self-rotating wrapper for motifs that read well spinning. */
function Spin({ children, speed = 0.2 }: { children: React.ReactNode; speed?: number }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * speed
  })
  return <group ref={ref}>{children}</group>
}

/**
 * Themed 3D motif for each dashboard surface. Geometry is intentionally light
 * (1–4 meshes) — these are ambient accents drawn through the global canvas.
 */
export function ModuleMotif({ variant }: { variant: MotifVariant }) {
  const isDark = useIsDark()
  const tier = useDepthCapability()
  const palette = pickPalette(isDark)
  const primary = linearColor(palette.primary)
  const accent = linearColor(palette.accent)
  const emerald = linearColor(palette.emerald)
  const lite = tier !== 'full'

  const glass = (color: THREE.Color) =>
    lite ? (
      <meshStandardMaterial color={color} roughness={0.15} metalness={0.2} emissive={color} emissiveIntensity={0.3} />
    ) : (
      <MeshTransmissionLike color={color} />
    )

  switch (variant) {
    case 'chat':
      return (
        <Float speed={1.4} rotationIntensity={0.5} floatIntensity={1.3}>
          <group>
            <mesh position={[0.4, 0.5, 0]}>
              <RoundedBoxGeo size={[1.3, 0.7, 0.25]} />
              {glass(primary)}
            </mesh>
            <mesh position={[-0.6, -0.4, 0.4]}>
              <RoundedBoxGeo size={[1, 0.55, 0.22]} />
              {glass(accent)}
            </mesh>
          </group>
        </Float>
      )
    case 'voice':
      return (
        <Float speed={1.6} rotationIntensity={0.8} floatIntensity={1.4}>
          <mesh>
            <sphereGeometry args={[1, 64, 64]} />
            <MeshDistortMaterial
              color={primary}
              emissive={primary}
              emissiveIntensity={0.35}
              roughness={0.2}
              metalness={0.3}
              distort={lite ? 0.25 : 0.45}
              speed={2.2}
            />
          </mesh>
        </Float>
      )
    case 'assessment':
      return (
        <Float speed={1.2} rotationIntensity={0.4} floatIntensity={1.1}>
          {/* Ring faces the camera (slight tilt); indicator bead orbits it. */}
          <group rotation={[0.45, 0, 0]}>
            <Spin speed={0.6}>
              <mesh>
                <torusGeometry args={[1, 0.18, 32, 80]} />
                <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.4} roughness={0.2} metalness={0.4} />
              </mesh>
              <mesh position={[1, 0, 0]}>
                <sphereGeometry args={[0.26, 24, 24]} />
                <meshStandardMaterial color={primary} emissive={primary} emissiveIntensity={0.5} roughness={0.2} metalness={0.3} />
              </mesh>
            </Spin>
          </group>
        </Float>
      )
    case 'courses':
      return (
        <Float speed={1.1} rotationIntensity={0.5} floatIntensity={1}>
          <group rotation={[0, -0.4, 0.1]}>
            {[0, 1, 2].map((i) => (
              <mesh key={i} position={[0, i * 0.32 - 0.4, 0]}>
                <RoundedBoxGeo size={[1.6, 0.26, 1.1]} />
                {i === 1 ? glass(accent) : glass(primary)}
              </mesh>
            ))}
          </group>
        </Float>
      )
    case 'lessons':
      return (
        <Spin speed={0.5}>
          {[0, 1, 2, 3, 4].map((i) => {
            const a = (i / 5) * Math.PI * 2
            return (
              <Float key={i} speed={1.5} floatIntensity={0.6}>
                <mesh position={[Math.cos(a) * 1.3, Math.sin(a) * 0.4, Math.sin(a) * 1.3]}>
                  <RoundedBoxGeo size={[0.45, 0.45, 0.12]} />
                  {glass(i % 2 ? accent : primary)}
                </mesh>
              </Float>
            )
          })}
        </Spin>
      )
    case 'tutors':
      return (
        <Spin speed={0.45}>
          {[0, 1, 2, 3].map((i) => {
            const a = (i / 4) * Math.PI * 2
            return (
              <mesh key={i} position={[Math.cos(a) * 1.3, Math.sin(a * 2) * 0.3, Math.sin(a) * 1.3]}>
                <sphereGeometry args={[0.42, 32, 32]} />
                {glass(i % 2 ? primary : emerald)}
              </mesh>
            )
          })}
        </Spin>
      )
    case 'progress':
      return (
        <Float speed={1} rotationIntensity={0.3} floatIntensity={0.8}>
          <group position={[0, -0.4, 0]}>
            {[0.6, 1.1, 0.85, 1.5].map((h, i) => (
              <mesh key={i} position={[i * 0.55 - 0.8, h / 2, 0]}>
                <boxGeometry args={[0.36, h, 0.36]} />
                <meshStandardMaterial color={i === 3 ? accent : primary} emissive={i === 3 ? accent : primary} emissiveIntensity={0.3} roughness={0.25} metalness={0.2} />
              </mesh>
            ))}
          </group>
        </Float>
      )
    case 'phrases':
      return (
        // Angled 3/4 flashcard view; Float gives a gentle flip-like wobble that
        // never lands fully edge-on.
        <Float speed={1.4} rotationIntensity={1.1} floatIntensity={1.1}>
          <mesh rotation={[0.12, -0.55, 0]}>
            <RoundedBoxGeo size={[1.5, 1, 0.14]} />
            {glass(primary)}
          </mesh>
        </Float>
      )
    case 'onboarding':
      return (
        <Float speed={1.2} rotationIntensity={0.5} floatIntensity={1.2}>
          <group rotation={[0, 0, -0.2]}>
            {[0, 1, 2, 3].map((i) => (
              <mesh key={i} position={[i * 0.7 - 1, Math.sin(i) * 0.3, 0]}>
                <sphereGeometry args={[0.3 + i * 0.04, 32, 32]} />
                {glass(i === 3 ? accent : primary)}
              </mesh>
            ))}
          </group>
        </Float>
      )
    case 'settings':
      return (
        <Float speed={0.8} rotationIntensity={0.3} floatIntensity={0.7}>
          {/* Gear-ish ring, faced toward camera with a slight tilt. */}
          <group rotation={[0.5, 0, 0.2]}>
            <Spin speed={0.4}>
              <mesh>
                <torusGeometry args={[0.95, 0.32, 16, 8]} />
                <meshStandardMaterial color={primary} roughness={0.4} metalness={0.5} emissive={primary} emissiveIntensity={0.18} />
              </mesh>
            </Spin>
          </group>
        </Float>
      )
    case 'home':
    default:
      return (
        <Float speed={1.4} rotationIntensity={0.7} floatIntensity={1.4}>
          <group>
            <mesh position={[0.3, 0.3, 0]}>
              <icosahedronGeometry args={[0.9, 0]} />
              {glass(primary)}
            </mesh>
            <mesh position={[-1, -0.5, 0.3]}>
              <torusGeometry args={[0.4, 0.16, 24, 48]} />
              {glass(accent)}
            </mesh>
          </group>
        </Float>
      )
  }
}

/** Box geometry slot used inside <mesh>{geo}{material}</mesh>. */
function RoundedBoxGeo({ size }: { size: [number, number, number] }) {
  return <boxGeometry args={size} />
}

/** Transmission material wrapper (full tier). */
function MeshTransmissionLike({ color }: { color: THREE.Color }) {
  return (
    <MeshDistortMaterial
      color={color}
      emissive={color}
      emissiveIntensity={0.18}
      roughness={0.12}
      metalness={0.25}
      distort={0.12}
      speed={1.2}
    />
  )
}
