'use client'

import { Float, MeshTransmissionMaterial } from '@react-three/drei'
import { useIsDark, pickPalette } from '@/lib/three/colors'
import { useDepthCapability } from '@/lib/three/use-depth-capability'
import { linearColor } from './utils'

/**
 * A small constellation of floating, glassy primitives representing
 * "conversation." Uses expensive MeshTransmissionMaterial on `full`, and a
 * cheaper emissive standard material on `lite`.
 */
export function GlassObjects() {
  const isDark = useIsDark()
  const tier = useDepthCapability()
  const palette = pickPalette(isDark)
  const primary = linearColor(palette.primary)
  const accent = linearColor(palette.accent)
  const lite = tier !== 'full'

  return (
    <group>
      <Float speed={1.5} rotationIntensity={1} floatIntensity={1.6}>
        <mesh position={[1.5, 0.7, 0]}>
          <icosahedronGeometry args={[0.75, 0]} />
          {lite ? (
            <meshStandardMaterial
              color={primary}
              roughness={0.15}
              metalness={0.1}
              emissive={primary}
              emissiveIntensity={0.28}
            />
          ) : (
            <MeshTransmissionMaterial
              color={primary}
              thickness={0.7}
              roughness={0.08}
              transmission={1}
              ior={1.3}
              chromaticAberration={0.05}
              backside
            />
          )}
        </mesh>
      </Float>

      <Float speed={2} rotationIntensity={1.2} floatIntensity={2}>
        <mesh position={[-1.6, -0.3, -0.5]}>
          <torusGeometry args={[0.5, 0.2, 32, 80]} />
          <meshStandardMaterial
            color={accent}
            roughness={0.2}
            metalness={0.3}
            emissive={accent}
            emissiveIntensity={0.32}
          />
        </mesh>
      </Float>

      <Float speed={1.2} rotationIntensity={0.8} floatIntensity={1.1}>
        <mesh position={[0.1, -1.1, 0.4]}>
          <dodecahedronGeometry args={[0.42, 0]} />
          <meshStandardMaterial
            color={primary}
            roughness={0.25}
            metalness={0.2}
            emissive={primary}
            emissiveIntensity={0.22}
          />
        </mesh>
      </Float>
    </group>
  )
}
