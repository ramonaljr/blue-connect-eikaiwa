'use client'

import dynamic from 'next/dynamic'

// Client-only + code-split so three never enters the server bundle of the
// (server-component) auth pages.
const AuthScene = dynamic(() => import('./auth-scene').then((m) => m.AuthScene), {
  ssr: false,
})

export function AuthSceneMount() {
  return <AuthScene />
}
