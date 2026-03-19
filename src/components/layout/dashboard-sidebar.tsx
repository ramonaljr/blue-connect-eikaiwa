'use client'

import { useState } from 'react'
import { Link, usePathname } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, MessageSquare, Mic, BookOpen, BookMarked,
  Calendar, Users, TrendingUp, Settings,
  ChevronLeft, Flame,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const navGroups = [
  {
    labelKey: 'learn',
    items: [
      { href: '/dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
      { href: '/dashboard/ai-chat', icon: MessageSquare, labelKey: 'aiChat' },
      { href: '/dashboard/ai-voice', icon: Mic, labelKey: 'aiVoice' },
      { href: '/dashboard/courses', icon: BookOpen, labelKey: 'courses' },
      { href: '/dashboard/phrases', icon: BookMarked, labelKey: 'phrases' },
    ],
  },
  {
    labelKey: 'connect',
    items: [
      { href: '/dashboard/lessons', icon: Calendar, labelKey: 'lessons' },
      { href: '/dashboard/tutors', icon: Users, labelKey: 'tutors' },
    ],
  },
  {
    labelKey: 'track',
    items: [
      { href: '/dashboard/progress', icon: TrendingUp, labelKey: 'progress' },
      { href: '/dashboard/settings', icon: Settings, labelKey: 'settings' },
    ],
  },
]

interface DashboardSidebarProps {
  streakDays?: number
}

export function DashboardSidebar({ streakDays = 0 }: DashboardSidebarProps) {
  const pathname = usePathname()
  const t = useTranslations('nav')
  const tg = useTranslations('nav.sidebarGroups')
  const td = useTranslations('dashboard')
  const tc = useTranslations('common')
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col border-r bg-sidebar transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!collapsed && (
          <Link href="/dashboard" className="text-lg font-bold text-primary">
            {tc('appName')}
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(collapsed && 'mx-auto')}
        >
          <ChevronLeft className={cn('size-4 transition-transform', collapsed && 'rotate-180')} />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        {navGroups.map((group, gi) => (
          <div key={gi} className={cn(gi > 0 && 'mt-4')}>
            {!collapsed && group.labelKey && (
              <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                {tg(group.labelKey)}
              </p>
            )}
            {collapsed && gi > 0 && (
              <div className="mx-auto my-2 h-px w-8 bg-border" />
            )}
            <div className="space-y-0.5">
              {group.items.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== '/dashboard' && pathname.startsWith(link.href + '/'))
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    title={collapsed ? t(link.labelKey) : undefined}
                    className={cn(
                      'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200',
                      collapsed && 'justify-center px-0',
                      isActive
                        ? 'bg-primary/10 font-medium text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary"
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                      />
                    )}
                    <link.icon className="size-4 shrink-0" />
                    {!collapsed && <span>{t(link.labelKey)}</span>}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Streak indicator */}
      {!collapsed && (
        <div className="border-t p-4">
          <div className="flex items-center gap-2 rounded-lg bg-accent/10 px-3 py-2">
            <Flame className="size-5 text-accent" />
            <div>
              <p className="text-sm font-semibold text-accent">{streakDays}</p>
              <p className="text-xs text-muted-foreground">{td('streak')}</p>
            </div>
          </div>
        </div>
      )}
      {collapsed && (
        <div className="border-t p-2">
          <div className="flex items-center justify-center rounded-lg bg-accent/10 p-2" title={streakDays + " " + td('streak')}>
            <Flame className="size-5 text-accent" />
          </div>
        </div>
      )}
    </aside>
  )
}
