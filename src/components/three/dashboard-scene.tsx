'use client'

import { usePathname } from 'next/navigation'
import { View3D } from './view3d'
import { ParticleField } from './particle-field'
import { SceneLights } from './lighting'
import { Glow } from './glow'
import { ParallaxRig } from './rigs'
import { ModuleMotif, type MotifVariant } from './module-motif'
import { useIsDark, pickPalette } from '@/lib/three/colors'
import { linearColor } from './utils'

/** Map a dashboard pathname to its themed motif variant. */
function variantForPath(pathname: string): MotifVariant {
  const p = pathname
  if (p.includes('/dashboard/ai-chat')) return 'chat'
  if (p.includes('/dashboard/ai-voice')) return 'voice'
  if (p.includes('/dashboard/assessment')) return 'assessment'
  if (p.includes('/dashboard/courses')) return 'courses'
  if (p.includes('/dashboard/lessons')) return 'lessons'
  if (p.includes('/dashboard/tutors')) return 'tutors'
  if (p.includes('/dashboard/progress')) return 'progress'
  if (p.includes('/dashboard/phrases')) return 'phrases'
  if (p.includes('/dashboard/onboarding')) return 'onboarding'
  if (p.includes('/dashboard/settings')) return 'settings'
  return 'home'
}

/**
 * One ambient scene for the whole dashboard, mounted in the layout. Reads the
 * route and swaps a themed motif (positioned upper-right), over a faint
 * particle field. Sidebar/header/cards are opaque and paint over it; the 3D
 * shows through the content gaps. Persists across client navigations.
 */
export function DashboardScene() {
  const pathname = usePathname()
  const variant = variantForPath(pathname)
  const isDark = useIsDark()
  const palette = pickPalette(isDark)
  const primary = linearColor(palette.primary)

  return (
    <View3D className="pointer-events-none fixed inset-0">
      <SceneLights />
      <ParticleField radius={6} />
      <Glow color={primary} position={[3, 1.6, -2]} scale={5} opacity={0.3} />
      <ParallaxRig factor={0.2}>
        <group position={[3, 1.4, 0]} scale={0.85}>
          <ModuleMotif variant={variant} />
        </group>
      </ParallaxRig>
    </View3D>
  )
}
