'use client'

import { View3D } from '@/components/three/view3d'
import { GlassObjects } from '@/components/three/glass-objects'
import { ParticleField } from '@/components/three/particle-field'
import { SceneLights } from '@/components/three/lighting'
import { ParallaxRig } from '@/components/three/rigs'
import { Glow } from '@/components/three/glow'
import { useIsDark, pickPalette } from '@/lib/three/colors'
import { linearColor } from '@/components/three/utils'

/**
 * Full-bleed landing hero scene: luminous shader backdrop + floating glass
 * objects + a parallaxing particle field. Drawn through the global canvas in
 * the region tracked by the View placeholder (positioned to fill the hero).
 */
export function HeroScene() {
  const isDark = useIsDark()
  const primary = linearColor(pickPalette(isDark).primary)
  const accent = linearColor(pickPalette(isDark).accent)

  return (
    // Transparent View layered over the CSS `bg-gradient-mesh`: glowing glass
    // objects + particles float over the brand gradient with no visible box.
    <View3D className="pointer-events-none absolute inset-0">
      <SceneLights />
      <Glow color={primary} position={[1.5, 0.7, -2]} scale={6} opacity={0.5} />
      <Glow color={accent} position={[-1.6, -0.4, -2]} scale={4.5} opacity={0.4} />
      <ParallaxRig factor={0.4}>
        <GlassObjects />
        <ParticleField radius={4} />
      </ParallaxRig>
    </View3D>
  )
}
