'use client'

import { useState, useEffect } from 'react'

export function DailyTip() {
  const [tip, setTip] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchTip() {
      try {
        const res = await fetch('/api/ai/tip')
        if (!res.ok) throw new Error('Failed to fetch tip')
        const data = await res.json()
        if (!cancelled) {
          setTip(data.tip ?? null)
        }
      } catch {
        // Non-critical — silently hide on error
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchTip()
    return () => { cancelled = true }
  }, [])

  if (!loading && !tip) return null

  return (
    <div className="mt-1">
      {loading ? (
        <div className="h-4 w-64 animate-pulse rounded bg-muted" />
      ) : (
        <p className="text-sm italic text-muted-foreground">{tip}</p>
      )}
    </div>
  )
}
