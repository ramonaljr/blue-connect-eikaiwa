'use client'

import { Float, MeshTransmissionMaterial } from '@react-three/drei'
import { View3D } from '@/components/three/view3d'
import { ShaderBackdrop } from '@/components/three/shader-backdrop'
import { ParticleField } from '@/components/three/particle-field'
import { SceneLights } from '@/components/three/lighting'
import { Glow } from '@/components/three/glow'
import { ParallaxRig } from '@/components/three/rigs'
import { useIsDark, pickPalette } from '@/lib/three/colors'
import { useDepthCapability } from '@/lib/three/use-depth-capability'
import { linearColor } from '@/components/three/utils'

/**
 * Auth brand-panel scene: a luminous shader field with a slowly rotating glass
 * orb and drifting motes. Fills the panel rectangle edge-to-edge, so the opaque
 * shader backdrop reads as a designed surface (no visible seam).
 */
export function AuthScene() {
  const isDark = useIsDark()
  const tier = useDepthCapability()
  const palette = pickPalette(isDark)
  const primary = linearColor(palette.primary)
  const accent = linearColor(palette.accent)

  return (
    <View3D className="absolute inset-0">
      <SceneLights />
      <ShaderBackdrop />
      <Glow color={primary} position={[0.2, 0.3, -1]} scale={7} opacity={0.55} />
      <Glow color={accent} position={[-1.4, -1, -1]} scale={3.5} opacity={0.35} />
      <ParallaxRig factor={0.25}>
        <Float speed={1.1} rotationIntensity={0.9} floatIntensity={1.2}>
          <mesh>
            <icosahedronGeometry args={[1.15, 1]} />
            {tier === 'full' ? (
              <MeshTransmissionMaterial
                color={primary}
                thickness={1}
                roughness={0.06}
                transmission={1}
                ior={1.4}
                chromaticAberration={0.06}
                backside
              />
            ) : (
              <meshStandardMaterial
                color={primary}
                roughness={0.12}
                metalness={0.2}
                emissive={primary}
                emissiveIntensity={0.3}
              />
            )}
          </mesh>
        </Float>
        <ParticleField radius={3.2} />
      </ParallaxRig>
    </View3D>
  )
}
