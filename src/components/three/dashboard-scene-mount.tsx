'use client'

import dynamic from 'next/dynamic'

const DashboardScene = dynamic(
  () => import('./dashboard-scene').then((m) => m.DashboardScene),
  { ssr: false },
)

export function DashboardSceneMount() {
  return <DashboardScene />
}
