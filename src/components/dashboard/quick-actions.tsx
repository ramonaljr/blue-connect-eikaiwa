'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { MessageSquare, Mic, BookOpen, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const actions = [
  { icon: MessageSquare, label: 'AI英会話を始める', href: '/dashboard/ai-chat', color: 'text-primary bg-primary/10' },
  { icon: Mic, label: '音声で練習する', href: '/dashboard/ai-voice', color: 'text-orange-500 bg-orange-500/10' },
  { icon: BookOpen, label: 'コースを見る', href: '/dashboard/courses', color: 'text-emerald-500 bg-emerald-500/10' },
  { icon: Users, label: '講師を探す', href: '/dashboard/tutors', color: 'text-violet-500 bg-violet-500/10' },
]

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {actions.map(({ icon: Icon, label, href, color }) => (
        <Link key={href} href={href}>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col items-center gap-2 py-4 text-center">
                <div className={`flex size-10 items-center justify-center rounded-xl ${color}`}>
                  <Icon className="size-5" />
                </div>
                <p className="text-sm font-medium">{label}</p>
              </CardContent>
            </Card>
          </motion.div>
        </Link>
      ))}
    </div>
  )
}
