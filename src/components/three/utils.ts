import * as THREE from 'three'
import { type LinearRGB } from '@/lib/three/colors'

/** Build a THREE.Color from a linear-sRGB triple (matches the DOM tokens). */
export function linearColor([r, g, b]: LinearRGB): THREE.Color {
  return new THREE.Color().setRGB(r, g, b, THREE.LinearSRGBColorSpace)
}

/** Mutate an existing THREE.Color in place (avoids per-frame allocation). */
export function setLinear(target: THREE.Color, [r, g, b]: LinearRGB): void {
  target.setRGB(r, g, b, THREE.LinearSRGBColorSpace)
}
