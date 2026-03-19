'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import {
  MessageSquare, Users, BookOpen, Calendar,
  Flame, Clock, GraduationCap, ArrowRight,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { ProgressRing, AnimatedCounter, StaggerContainer, StaggerItem, SectionReveal } from '@/components/ui/motion'
import { cn } from '@/lib/utils'

const statCards = [
  { key: 'studyTime', icon: Clock, value: 12, suffix: 'h', color: 'text-primary', borderColor: 'border-t-primary' },
  { key: 'lessonsCompleted', icon: GraduationCap, value: 24, suffix: '', color: 'text-[oklch(0.65_0.18_155)]', borderColor: 'border-t-[oklch(0.65_0.18_155)]' },
  { key: 'wordsLearned', icon: BookOpen, value: 340, suffix: '', color: 'text-accent', borderColor: 'border-t-accent' },
  { key: 'nextLesson', icon: Calendar, value: 0, suffix: '', color: 'text-[oklch(0.55_0.15_300)]', borderColor: 'border-t-[oklch(0.55_0.15_300)]' },
]

const quickActions = [
  { key: 'aiChat', icon: MessageSquare, href: '/dashboard/ai-chat', color: 'bg-primary/10 text-primary' },
  { key: 'findTutor', icon: Users, href: '/dashboard/tutors', color: 'bg-accent/10 text-accent' },
  { key: 'browseCourses', icon: BookOpen, href: '/dashboard/courses', color: 'bg-[oklch(0.65_0.18_155)]/10 text-[oklch(0.65_0.18_155)]' },
]

function getGreetingKey(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
}

export function DashboardContent({ userName }: { userName: string }) {
  const t = useTranslations('dashboard')

  return (
    <div className="space-y-6">
      {/* Welcome + Daily Goal */}
      <SectionReveal>
        <div className="rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">
              {t(`welcome.${getGreetingKey()}`)}
              <span className="text-primary">、{userName}</span>
              さん
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <ProgressRing progress={60} size={64} strokeWidth={5}>
              <span className="text-xs font-semibold">3/5</span>
            </ProgressRing>
            <div>
              <p className="text-sm font-medium">{t('dailyGoal')}</p>
              <p className="text-xs text-muted-foreground">{t('activitiesCompleted', { count: 3, total: 5 })}</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5">
              <Flame className="size-4 text-accent" />
              <span className="text-sm font-bold text-accent">7</span>
              <span className="text-xs text-muted-foreground">{t('streak')}</span>
            </div>
          </div>
        </div>
        </div>
      </SectionReveal>

      {/* Stat Cards */}
      <StaggerContainer className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map(({ key, icon: Icon, value, suffix, color, borderColor }) => (
          <StaggerItem key={key}>
            <Card className={cn('border-t-2 glass shadow-elevated', borderColor)}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <Icon className={cn('size-5', color)} />
                  {key === 'studyTime' && (
                    <span className="text-xs text-muted-foreground">{t('stats.thisWeek')}</span>
                  )}
                </div>
                <p className="mt-2 text-2xl font-bold">
                  {value > 0 ? <AnimatedCounter target={value} suffix={suffix} /> : '—'}
                </p>
                <p className="text-xs text-muted-foreground">{t(`stats.${key}`)}</p>
              </CardContent>
            </Card>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Quick Actions */}
      <SectionReveal>
        <h2 className="mb-3 text-lg font-semibold">{t('sections.quickActions')}</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {quickActions.map(({ key, icon: Icon, href, color }) => (
            <Link key={key} href={href}>
              <Card className="cursor-pointer border-l-4 border-l-transparent transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover hover:border-l-primary">
                <CardContent className="flex items-center gap-4 py-4">
                  <div className={cn('flex size-10 items-center justify-center rounded-xl', color)}>
                    <Icon className="size-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{t(`quickActions.${key}`)}</p>
                  </div>
                  <ArrowRight className="size-4 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </SectionReveal>

      {/* Upcoming Lessons */}
      <SectionReveal>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t('sections.upcomingLessons')}</h2>
          <Link
            href="/dashboard/lessons"
            className={buttonVariants({ variant: 'ghost', size: 'sm' })}
          >
            {t('viewAll')}
          </Link>
        </div>
        <Card className="mt-3">
          <CardContent className="flex items-center justify-center py-8 text-muted-foreground">
            <Calendar className="mr-2 size-4" />
            <span className="text-sm">{t('noUpcoming')}</span>
          </CardContent>
        </Card>
      </SectionReveal>

      {/* Recent Activity */}
      <SectionReveal>
        <h2 className="mb-3 text-lg font-semibold">{t('sections.recentActivity')}</h2>
        <Card>
          <CardContent className="divide-y">
            {[
              { icon: MessageSquare, textKey: 'activity.aiPractice', timeKey: 'activity.timeAgo2h', color: 'text-primary' },
              { icon: BookOpen, textKey: 'activity.courseFinished', timeKey: 'activity.timeAgo1d', color: 'text-[oklch(0.65_0.18_155)]' },
              { icon: GraduationCap, textKey: 'activity.badgeEarned', timeKey: 'activity.timeAgo2d', color: 'text-accent' },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-3 py-3 first:pt-4 last:pb-4">
                <div className={cn('flex size-8 items-center justify-center rounded-lg bg-muted', activity.color)}>
                  <activity.icon className="size-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">{t(activity.textKey)}</p>
                </div>
                <span className="text-xs text-muted-foreground">{t(activity.timeKey)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </SectionReveal>
    </div>
  )
}
