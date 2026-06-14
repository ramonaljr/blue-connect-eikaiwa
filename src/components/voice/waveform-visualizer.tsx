'use client'

import { motion } from 'framer-motion'
import { Mic, Volume2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WaveformVisualizerProps {
  isRecording: boolean
  isAISpeaking: boolean
}

export function WaveformVisualizer({
  isRecording,
  isAISpeaking,
}: WaveformVisualizerProps) {
  const isActive = isRecording || isAISpeaking

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer pulse ring */}
      {isActive && (
        <motion.div
          animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className={cn(
            'absolute h-56 w-56 rounded-full',
            isRecording ? 'bg-blue-500/10' : 'bg-green-500/10'
          )}
        />
      )}

      {/* Middle pulse ring */}
      {isActive && (
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.1, 0.4] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.3,
          }}
          className={cn(
            'absolute h-52 w-52 rounded-full',
            isRecording ? 'bg-blue-500/15' : 'bg-green-500/15'
          )}
        />
      )}

      {/* Main circle */}
      <motion.div
        animate={{
          scale: isActive ? [1, 1.08, 1] : 1,
        }}
        transition={{
          duration: 1.5,
          repeat: isActive ? Infinity : 0,
          ease: 'easeInOut',
        }}
        className={cn(
          'flex h-48 w-48 items-center justify-center rounded-full border-2 transition-colors duration-300',
          isRecording
            ? 'border-blue-500 bg-blue-500/20'
            : isAISpeaking
              ? 'border-green-500 bg-green-500/20'
              : 'border-muted-foreground/20 bg-muted'
        )}
      >
        {isAISpeaking ? (
          <Volume2
            className={cn(
              'h-12 w-12 transition-colors duration-300',
              'text-green-500'
            )}
          />
        ) : (
          <Mic
            className={cn(
              'h-12 w-12 transition-colors duration-300',
              isRecording ? 'text-blue-500' : 'text-muted-foreground'
            )}
          />
        )}
      </motion.div>

      {/* Status text */}
      <div className="absolute -bottom-8 text-sm text-muted-foreground">
        {isRecording
          ? '録音中...'
          : isAISpeaking
            ? 'AIが話しています...'
            : 'マイクボタンを押して話しましょう'}
      </div>
    </div>
  )
}
