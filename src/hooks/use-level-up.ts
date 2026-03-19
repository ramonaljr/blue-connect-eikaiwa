'use client'

import { useState, useEffect, useCallback } from 'react'

export function useLevelUp(currentLevel: number) {
  const [showLevelUp, setShowLevelUp] = useState(false)
  const [previousLevel, setPreviousLevel] = useState<number | null>(null)

  useEffect(() => {
    const storedLevel = sessionStorage.getItem('lastKnownLevel')
    if (storedLevel) {
      const prev = parseInt(storedLevel, 10)
      if (currentLevel > prev) {
        setPreviousLevel(prev)
        setShowLevelUp(true)
      }
    }
    sessionStorage.setItem('lastKnownLevel', String(currentLevel))
  }, [currentLevel])

  const dismiss = useCallback(() => {
    setShowLevelUp(false)
  }, [])

  return { showLevelUp, previousLevel, dismiss }
}
