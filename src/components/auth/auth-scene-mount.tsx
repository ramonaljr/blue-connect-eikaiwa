'use client'

import dynamic from 'next/dynamic'
import { useDepthCapability } from '@/lib/three/use-depth-capability'

// Client-only + code-split so three never enters the server bundle of the
// (server-component) auth pages.
const AuthScene = dynamic(() => import('./auth-scene').then((m) => m.AuthScene), {
  ssr: false,
})

export function AuthSceneMount() {
  const tier = useDepthCapability()
  if (tier === 'off') return null
  return <AuthScene />
}
