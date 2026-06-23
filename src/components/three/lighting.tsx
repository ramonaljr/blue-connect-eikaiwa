'use client'

/** Shared three-point-ish lighting for scenes using lit materials. */
export function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 5, 5]} intensity={1.3} />
      <pointLight position={[-5, -3, 2]} intensity={0.7} />
    </>
  )
}
