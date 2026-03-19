'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'

export function ChatMockup() {
  const t = useTranslations('landing.chatMockup')

  return (
    <div className="relative">
      {/* Floating badge */}
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -right-2 -top-3 z-10 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-lg"
      >
        {t('badge')}
      </motion.div>

      <div className="glass rounded-2xl p-5 shadow-elevated rotate-1 transition-transform duration-500 hover:rotate-0">
        <div className="mb-3 flex items-center gap-2 border-b border-border/50 pb-3">
          <div className="size-3 rounded-full bg-destructive/60" />
          <div className="size-3 rounded-full bg-accent/60" />
          <div className="size-3 rounded-full bg-[oklch(0.65_0.18_155)]/60" />
          <span className="ml-2 text-xs font-medium text-muted-foreground">{t('header')}</span>
        </div>
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground"
          >
            {t('userMessage')}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="max-w-[85%] rounded-2xl rounded-bl-md bg-muted px-4 py-2.5 text-sm"
          >
            {t('aiMessage')}
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 1.3, duration: 0.3 }}
            className="flex gap-1.5 px-2"
          >
            <span className="size-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: '0ms' }} />
            <span className="size-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: '150ms' }} />
            <span className="size-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: '300ms' }} />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
