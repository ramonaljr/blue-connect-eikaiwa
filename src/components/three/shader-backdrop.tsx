'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useIsDark, pickPalette } from '@/lib/three/colors'
import { setLinear } from './utils'

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uPointer;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorBg;
  varying vec2 vUv;

  vec2 hash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(dot(hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
          dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
      mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
          dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
      u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }
  void main() {
    vec2 uv = vUv;
    vec2 p = uv * 3.0 + uPointer * 0.6;
    float t = uTime * 0.05;
    float f = fbm(p + vec2(t, t * 0.7));
    float f2 = fbm(p * 1.6 - vec2(t * 0.8, t));
    vec3 col = mix(uColorBg, uColorA, smoothstep(0.05, 0.7, f));
    col = mix(col, uColorB, smoothstep(0.4, 0.95, f2) * 0.55);
    float d = distance(uv, vec2(0.5));
    col *= 1.0 - d * 0.55;
    gl_FragColor = vec4(col, 1.0);
  }
`

/**
 * Full-view animated fbm mesh-gradient plane in brand colors. Slowly drifts and
 * parallaxes toward the pointer. Sits behind the rest of the scene (z = -5).
 */
export function ShaderBackdrop() {
  const isDark = useIsDark()
  const { viewport } = useThree()
  const materialRef = useRef<THREE.ShaderMaterial>(null)

  // Stable initial uniforms (memoized value is safe to pass into JSX). All
  // mutation happens through the material ref in effects/frames, never on this
  // object directly — which is what the compiler lint requires.
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uColorA: { value: new THREE.Color() },
      uColorB: { value: new THREE.Color() },
      uColorBg: { value: new THREE.Color() },
    }),
    [],
  )

  // Recolor on theme change (via the material ref, outside render).
  useEffect(() => {
    const m = materialRef.current
    if (!m) return
    const palette = pickPalette(isDark)
    setLinear(m.uniforms.uColorA.value, palette.primary)
    setLinear(m.uniforms.uColorB.value, palette.accent)
    setLinear(m.uniforms.uColorBg.value, palette.bg)
  }, [isDark])

  useFrame((state) => {
    const m = materialRef.current
    if (!m) return
    m.uniforms.uTime.value = state.clock.elapsedTime
    m.uniforms.uPointer.value.lerp(state.pointer, 0.04)
  })

  return (
    <mesh scale={[viewport.width * 1.6, viewport.height * 1.6, 1]} position={[0, 0, -5]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
      />
    </mesh>
  )
}
