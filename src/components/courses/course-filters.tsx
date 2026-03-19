'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
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

const CATEGORIES = [
  { value: 'all', label: 'すべて' },
  { value: 'Foundations', label: 'Foundations' },
  { value: 'Daily Conversation', label: 'Daily Conversation' },
  { value: 'Business English', label: 'Business English' },
  { value: 'TOEIC Prep', label: 'TOEIC Prep' },
  { value: 'EIKEN Prep', label: 'EIKEN Prep' },
  { value: 'Travel English', label: 'Travel English' },
  { value: 'Advanced Discussion', label: 'Advanced Discussion' },
]

const STATUSES = [
  { value: 'all', label: 'すべて' },
  { value: 'not_started', label: '未開始' },
  { value: 'in_progress', label: '学習中' },
  { value: 'completed', label: '完了' },
]

const SORT_OPTIONS = [
  { value: 'recommended', label: 'おすすめ' },
  { value: 'newest', label: '新着' },
  { value: 'difficulty', label: '難易度' },
]

export function CourseFilters({ onFilterChange, initialFilters }: CourseFiltersProps) {
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
          placeholder="コースを検索..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* CEFR Level Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-muted-foreground mr-1">レベル:</span>
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
            <SelectValue placeholder="カテゴリ" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
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
            <SelectValue placeholder="ステータス" />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
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
            <SelectValue placeholder="並び替え" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
