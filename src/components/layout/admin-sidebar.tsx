'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  BarChart3,
  Settings,
} from 'lucide-react'

const adminLinks = [
  { href: '/admin', icon: LayoutDashboard, label: 'ダッシュボード' },
  { href: '/admin/users', icon: Users, label: 'ユーザー' },
  { href: '/admin/tutors', icon: GraduationCap, label: 'チューター' },
  { href: '/admin/courses', icon: BookOpen, label: 'コース' },
  { href: '/admin/analytics', icon: BarChart3, label: 'アナリティクス' },
  { href: '/admin/settings', icon: Settings, label: '設定' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-background">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/admin" className="text-lg font-bold text-primary">
          管理画面
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {adminLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href + '/'))
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
