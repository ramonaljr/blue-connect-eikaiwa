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

const SPECIALTY_KEYS = [
  { value: 'all', labelKey: 'all' },
  { value: 'Conversation', labelKey: 'conversation' },
  { value: 'Business', labelKey: 'business' },
  { value: 'TOEIC', labelKey: 'toeic' },
  { value: 'EIKEN', labelKey: 'eiken' },
  { value: 'Pronunciation', labelKey: 'pronunciation' },
  { value: 'Grammar', labelKey: 'grammar' },
  { value: 'Travel', labelKey: 'travel' },
] as const

const RATING_OPTIONS = [
  { value: '0', labelKey: 'all' },
  { value: '3.0', label: '3.0+' },
  { value: '3.5', label: '3.5+' },
  { value: '4.0', label: '4.0+' },
  { value: '4.5', label: '4.5+' },
] as const

const SORT_KEYS = [
  { value: 'recommended', labelKey: 'recommended' },
  { value: 'rating', labelKey: 'rating' },
  { value: 'price_low', labelKey: 'priceLow' },
  { value: 'experienced', labelKey: 'experienced' },
] as const

const TUTOR_TYPE_KEYS = [
  { value: 'all', labelKey: 'allTutors' },
  { value: 'certified', labelKey: 'certifiedTutor' },
  { value: 'community', labelKey: 'communityTutor' },
] as const

export function TutorFilters({ onFilterChange }: TutorFiltersProps) {
  const t = useTranslations('filters')
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
          placeholder={t('searchTutors')}
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Tutor Type Toggle */}
        <div className="flex items-center gap-1.5">
          {TUTOR_TYPE_KEYS.map((type) => (
            <button
              key={type.value}
              onClick={() => setFilters(prev => ({ ...prev, tutorType: type.value }))}
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filters.tutorType === type.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {t(type.labelKey)}
            </button>
          ))}
        </div>

        {/* Specialty Dropdown */}
        <Select
          value={filters.specialty}
          onValueChange={(val) => setFilters(prev => ({ ...prev, specialty: val as string }))}
        >
          <SelectTrigger>
            <span>{t(SPECIALTY_KEYS.find(s => s.value === filters.specialty)?.labelKey ?? 'all')}</span>
          </SelectTrigger>
          <SelectContent>
            {SPECIALTY_KEYS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {t(s.labelKey)}
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
            <span>{(() => { const opt = RATING_OPTIONS.find(r => r.value === String(filters.minRating)); return opt && 'labelKey' in opt ? t(opt.labelKey) : opt?.label ?? t('all') })()}</span>
          </SelectTrigger>
          <SelectContent>
            {RATING_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {'labelKey' in opt ? t(opt.labelKey) : opt.label}
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
