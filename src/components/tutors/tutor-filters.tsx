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

export interface TutorFilters {
  specialty: string
  tutorType: string
  minRating: number
  search: string
  sort: string
}

interface TutorFiltersProps {
  onFilterChange: (filters: TutorFilters) => void
}

const SPECIALTIES = [
  { value: 'all', label: 'すべて' },
  { value: 'Conversation', label: '会話' },
  { value: 'Business', label: 'ビジネス' },
  { value: 'TOEIC', label: 'TOEIC' },
  { value: 'EIKEN', label: '英検' },
  { value: 'Pronunciation', label: '発音' },
  { value: 'Grammar', label: '文法' },
  { value: 'Travel', label: '旅行' },
]

const RATING_OPTIONS = [
  { value: '0', label: 'すべて' },
  { value: '3.0', label: '3.0+' },
  { value: '3.5', label: '3.5+' },
  { value: '4.0', label: '4.0+' },
  { value: '4.5', label: '4.5+' },
]

const SORT_OPTIONS = [
  { value: 'recommended', label: 'おすすめ' },
  { value: 'rating', label: '評価順' },
  { value: 'price_low', label: '料金安い順' },
  { value: 'experienced', label: '経験豊富' },
]

const TUTOR_TYPES = [
  { value: 'all', label: 'すべて' },
  { value: 'certified', label: '認定講師' },
  { value: 'community', label: 'コミュニティ' },
] as const

export function TutorFilters({ onFilterChange }: TutorFiltersProps) {
  const [filters, setFilters] = useState<TutorFilters>({
    specialty: 'all',
    tutorType: 'all',
    minRating: 0,
    search: '',
    sort: 'recommended',
  })

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isFirstRender = useRef(true)

  // Notify parent when non-search filters change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    onFilterChange(filters)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.specialty, filters.tutorType, filters.minRating, filters.sort])

  const handleSearchChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      onFilterChange({ ...filters, search: value })
    }, 300)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.specialty, filters.tutorType, filters.minRating, filters.sort])

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="講師を検索..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Tutor Type Toggle */}
        <div className="flex items-center gap-1.5">
          {TUTOR_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setFilters(prev => ({ ...prev, tutorType: type.value }))}
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filters.tutorType === type.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>

        {/* Specialty Dropdown */}
        <Select
          value={filters.specialty}
          onValueChange={(val) => setFilters(prev => ({ ...prev, specialty: val as string }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="専門分野" />
          </SelectTrigger>
          <SelectContent>
            {SPECIALTIES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Minimum Rating Dropdown */}
        <Select
          value={String(filters.minRating)}
          onValueChange={(val) => setFilters(prev => ({ ...prev, minRating: parseFloat(val as string) }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="最低評価" />
          </SelectTrigger>
          <SelectContent>
            {RATING_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
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
