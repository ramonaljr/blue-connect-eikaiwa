'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { type ReactNode, useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

/** Deterministic reduced-motion read (framer's hook memoizes the query). */
function usePrefersReducedMotion() {
  const [reduce, setReduce] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduce(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
  return reduce
}

/**
 * A DOM card that tilts in 3D toward the pointer (CSS `preserve-3d` perspective).
 * Near-zero cost — used heavily on the dashboard where the WebGL budget is tight.
 * Honors `prefers-reduced-motion` by rendering a flat, static wrapper.
 */
export function TiltCard({
  children,
  className,
  intensity = 9,
}: {
  children: ReactNode
  className?: string
  intensity?: number
}) {
  const reduce = usePrefersReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const rotateX = useSpring(useTransform(py, [0, 1], [intensity, -intensity]), {
    stiffness: 150,
    damping: 17,
  })
  const rotateY = useSpring(useTransform(px, [0, 1], [-intensity, intensity]), {
    stiffness: 150,
    damping: 17,
  })

  if (reduce) {
    return (
      <div data-tilt="off" className={className}>
        {children}
      </div>
    )
  }

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    px.set((e.clientX - rect.left) / rect.width)
    py.set((e.clientY - rect.top) / rect.height)
  }

  const reset = () => {
    px.set(0.5)
    py.set(0.5)
  }

  return (
    <motion.div
      ref={ref}
      data-tilt="on"
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        transformPerspective: 900,
      }}
      className={cn('will-change-transform', className)}
    >
      {children}
    </motion.div>
  )
}
