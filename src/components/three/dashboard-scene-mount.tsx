'use client'

import dynamic from 'next/dynamic'
import { useDepthCapability } from '@/lib/three/use-depth-capability'

const DashboardScene = dynamic(
  () => import('./dashboard-scene').then((m) => m.DashboardScene),
  { ssr: false },
)

export function DashboardSceneMount() {
  const tier = useDepthCapability()
  if (tier === 'off') return null
  return <DashboardScene />
}
