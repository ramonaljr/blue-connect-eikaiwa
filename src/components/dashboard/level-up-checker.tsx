'use client'

import { useLevelUp } from '@/hooks/use-level-up'
import { LevelUpModal } from '@/components/progress/level-up-modal'

interface LevelUpCheckerProps {
  currentLevel: number
  xp: number
}

export function LevelUpChecker({ currentLevel, xp }: LevelUpCheckerProps) {
  const { showLevelUp, dismiss } = useLevelUp(currentLevel)

  return (
    <LevelUpModal
      open={showLevelUp}
      onClose={dismiss}
      newLevel={currentLevel}
      xp={xp}
    />
  )
}
