'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  Users,
  UserCircle,
  Wallet,
} from 'lucide-react'

const tutorLinks = [
  { href: '/tutor', icon: LayoutDashboard, label: 'ダッシュボード' },
  { href: '/tutor/schedule', icon: CalendarDays, label: 'スケジュール' },
  { href: '/tutor/lessons', icon: BookOpen, label: 'レッスン' },
  { href: '/tutor/students', icon: Users, label: '生徒' },
  { href: '/tutor/profile', icon: UserCircle, label: 'プロフィール' },
  { href: '/tutor/earnings', icon: Wallet, label: '収益' },
]

export function TutorSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/tutor" className="text-lg font-bold text-primary">
          講師画面
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {tutorLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/tutor' && pathname.startsWith(link.href + '/'))
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
              {link.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
