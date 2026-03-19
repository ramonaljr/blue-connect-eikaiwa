'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  MessageSquare,
  Mic,
  BookOpen,
  Calendar,
  Users,
  TrendingUp,
  Settings,
} from 'lucide-react'

const learnerLinks = [
  { href: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
  { href: '/dashboard/ai-chat', icon: MessageSquare, labelKey: 'aiChat' },
  { href: '/dashboard/ai-voice', icon: Mic, labelKey: 'aiVoice' },
  { href: '/dashboard/courses', icon: BookOpen, labelKey: 'courses' },
  { href: '/dashboard/lessons', icon: Calendar, labelKey: 'lessons' },
  { href: '/dashboard/tutors', icon: Users, labelKey: 'tutors' },
  { href: '/dashboard/progress', icon: TrendingUp, labelKey: 'progress' },
  { href: '/dashboard/settings', icon: Settings, labelKey: 'settings' },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const t = useTranslations('nav')
  const tc = useTranslations('common')

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="text-lg font-bold text-primary">
          {tc('appName')}
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {learnerLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href + '/'))
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <link.icon className="h-4 w-4" />
              {t(link.labelKey)}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
