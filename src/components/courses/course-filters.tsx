'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CEFRLevel } from '@/lib/types/database'

export interface CourseFilters {
  levels: string[]
  category: string
  status: string
  search: string
  sort: string
}

interface CourseFiltersProps {
  onFilterChange: (filters: CourseFilters) => void
  initialFilters?: Partial<CourseFilters>
}

const CEFR_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

const CATEGORY_KEYS = [
  { value: 'all', labelKey: 'all' },
  { value: 'Foundations', labelKey: 'foundations' },
  { value: 'Daily Conversation', labelKey: 'dailyConversation' },
  { value: 'Business English', labelKey: 'businessEnglish' },
  { value: 'TOEIC Prep', labelKey: 'toeicPrep' },
  { value: 'EIKEN Prep', labelKey: 'eikenPrep' },
  { value: 'Travel English', labelKey: 'travelEnglish' },
  { value: 'Advanced Discussion', labelKey: 'advancedDiscussion' },
] as const

const STATUS_KEYS = [
  { value: 'all', labelKey: 'all' },
  { value: 'not_started', labelKey: 'notStarted' },
  { value: 'in_progress', labelKey: 'inProgress' },
  { value: 'completed', labelKey: 'completed' },
] as const

const SORT_KEYS = [
  { value: 'recommended', labelKey: 'recommended' },
  { value: 'newest', labelKey: 'newest' },
  { value: 'difficulty', labelKey: 'difficulty' },
] as const

export function CourseFilters({ onFilterChange, initialFilters }: CourseFiltersProps) {
  const t = useTranslations('filters')
  const [filters, setFilters] = useState<CourseFilters>({
    levels: initialFilters?.levels ?? [],
    category: initialFilters?.category ?? 'all',
    status: initialFilters?.status ?? 'all',
    search: initialFilters?.search ?? '',
    sort: initialFilters?.sort ?? 'recommended',
  })

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstRender = useRef(true)

  // Notify parent when filters change (except search, which is debounced)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    onFilterChange(filters)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.levels, filters.category, filters.status, filters.sort])

  const handleSearchChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onFilterChange({ ...filters, search: value })
    }, 300)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.levels, filters.category, filters.status, filters.sort])

  const toggleLevel = (level: string) => {
    setFilters(prev => ({
      ...prev,
      levels: prev.levels.includes(level)
        ? prev.levels.filter(l => l !== level)
        : [...prev.levels, level],
    }))
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder={t('searchCourses')}
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* CEFR Level Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground mr-1">{t('level')}:</span>
          {CEFR_LEVELS.map((level) => (
            <button
              key={level}
              onClick={() => toggleLevel(level)}
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                filters.levels.includes(level)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Category Dropdown */}
        <Select
          value={filters.category}
          onValueChange={(val) => setFilters(prev => ({ ...prev, category: val as string }))}
        >
          <SelectTrigger>
            <span>{t(CATEGORY_KEYS.find(c => c.value === filters.category)?.labelKey ?? 'all')}</span>
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_KEYS.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {t(cat.labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Dropdown */}
        <Select
          value={filters.status}
          onValueChange={(val) => setFilters(prev => ({ ...prev, status: val as string }))}
        >
          <SelectTrigger>
            <span>{t(STATUS_KEYS.find(s => s.value === filters.status)?.labelKey ?? 'all')}</span>
          </SelectTrigger>
          <SelectContent>
            {STATUS_KEYS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {t(s.labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort Dropdown */}
        <Select
          value={filters.sort}
          onValueChange={(val) => setFilters(prev => ({ ...prev, sort: val as string }))}
        >
          <SelectTrigger>
            <span>{t(SORT_KEYS.find(o => o.value === filters.sort)?.labelKey ?? 'recommended')}</span>
          </SelectTrigger>
          <SelectContent>
            {SORT_KEYS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {t(opt.labelKey)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
