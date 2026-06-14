'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trophy, Star, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface LevelUpModalProps {
  open: boolean
  onClose: () => void
  newLevel: number
  xp: number
}

export function LevelUpModal({ open, onClose, newLevel, xp }: LevelUpModalProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (open) {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center">
        <AnimatePresence>
          {showConfetti && (
            <motion.div
              className="absolute inset-0 pointer-events-none overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-2xl"
                  initial={{
                    x: '50%',
                    y: '50%',
                    scale: 0,
                  }}
                  animate={{
                    x: `${Math.random() * 100}%`,
                    y: `${Math.random() * 100}%`,
                    scale: [0, 1.5, 0],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.1,
                    ease: 'easeOut',
                  }}
                >
                  {['⭐', '🎉', '✨', '🏆', '🌟'][i % 5]}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="space-y-4 py-4"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
        >
          <motion.div
            className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: 2, duration: 0.5 }}
          >
            <Trophy className="h-12 w-12 text-white" />
          </motion.div>

          <div>
            <h2 className="text-2xl font-bold">レベルアップ!</h2>
            <div className="mt-2 flex items-center justify-center gap-2">
              <Badge className="text-lg px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                <Star className="mr-1 h-4 w-4" />
                Level {newLevel}
              </Badge>
            </div>
          </div>

          <p className="text-muted-foreground">
            おめでとうございます! 総XPが{xp}になりました。
            <br />この調子で頑張りましょう!
          </p>

          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            次のレベルまで: {1000 - (xp % 1000)} XP
          </div>

          <Button onClick={onClose} className="w-full">
            続ける
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
