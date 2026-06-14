'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Sparkles, BookOpen, Video, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ChatMockup } from './chat-mockup'
import { CourseMockup } from './course-mockup'
import { VideoMockup } from './video-mockup'

const tabs = [
  { key: 'ai' as const, icon: Sparkles, mockup: ChatMockup },
  { key: 'courses' as const, icon: BookOpen, mockup: CourseMockup },
  { key: 'tutors' as const, icon: Video, mockup: VideoMockup },
] as const

export function FeatureTabs() {
  const [active, setActive] = useState(0)
  const t = useTranslations('landing')

  const ActiveMockup = tabs[active].mockup

  return (
    <div>
      {/* Tab buttons */}
      <div className="mb-8 flex justify-center gap-2">
        {tabs.map(({ key, icon: Icon }, i) => (
          <button
            key={key}
            onClick={() => setActive(i)}
            className={cn(
              'relative flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-300',
              active === i
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {active === i && (
              <motion.div
                layoutId="feature-tab-bg"
                className="absolute inset-0 rounded-full bg-primary/10"
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              />
            )}
            <Icon className="relative size-4" />
            <span className="relative">{t(`features.${key}.title`)}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex flex-col items-center gap-8 md:flex-row md:gap-12">
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="mb-3 text-2xl font-bold md:text-3xl">
                {t(`features.${tabs[active].key}.title`)}
              </h3>
              <p className="mb-6 text-lg text-muted-foreground">
                {t(`features.${tabs[active].key}.description`)}
              </p>
              <ul className="space-y-3">
                {[1, 2, 3, 4].map((n) => (
                  <li key={n} className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Check className="size-3 text-primary" />
                    </div>
                    <span className="text-sm">{t(`featureTabs.${tabs[active].key}.bullets.${n}`)}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="w-full max-w-md flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border border-border/50 bg-background/50 p-2 shadow-elevated"
            >
              <ActiveMockup />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
