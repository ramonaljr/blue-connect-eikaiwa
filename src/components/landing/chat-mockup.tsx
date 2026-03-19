'use client'

import { motion } from 'framer-motion'

export function ChatMockup() {
  return (
    <div className="glass rounded-2xl p-4 shadow-elevated">
      <div className="mb-3 flex items-center gap-2 border-b border-border/50 pb-3">
        <div className="size-3 rounded-full bg-destructive/60" />
        <div className="size-3 rounded-full bg-accent/60" />
        <div className="size-3 rounded-full bg-[oklch(0.65_0.18_155)]/60" />
        <span className="ml-2 text-xs font-medium text-muted-foreground">AI English Chat</span>
      </div>
      <div className="space-y-3">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="ml-auto max-w-[75%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-primary-foreground"
        >
          How do I introduce myself at a business meeting?
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="max-w-[80%] rounded-2xl rounded-bl-md bg-muted px-4 py-2.5 text-sm"
        >
          Great question! Here&apos;s a natural way: &ldquo;Hello, I&apos;m [name] from [company]. It&apos;s a pleasure to meet you.&rdquo;
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
  )
}
