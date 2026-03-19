'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { TutorFilters, type TutorFilters as TutorFiltersType } from '@/components/tutors/tutor-filters'
import { TutorCard } from '@/components/tutors/tutor-card'

interface TutorsPageContentProps {
  tutors: Array<{
    id: string
    user_id: string
    bio: string
    bio_ja: string
    hourly_rate: number | null
    specialties: string[]
    average_rating: number
    total_lessons: number
    is_available: boolean
    certification_status: string
    user: {
      display_name: string
      avatar_url: string | null
      role: string
    }
  }>
  locale: string
}

export function TutorsPageContent({ tutors, locale }: TutorsPageContentProps) {
  const t = useTranslations('filters')
  const [filters, setFilters] = useState<TutorFiltersType>({
    specialty: 'all',
    tutorType: 'all',
    minRating: 0,
    search: '',
    sort: 'recommended',
  })

  const filteredTutors = useMemo(() => {
    let result = [...tutors]

    // Filter by search (name and bio)
    if (filters.search) {
      const query = filters.search.toLowerCase()
      result = result.filter((t) => {
        const name = t.user.display_name.toLowerCase()
        const bio = (locale === 'ja' ? t.bio_ja || t.bio : t.bio).toLowerCase()
        return name.includes(query) || bio.includes(query)
      })
    }

    // Filter by specialty
    if (filters.specialty !== 'all') {
      result = result.filter((t) =>
        t.specialties.some((s) => s.toLowerCase().includes(filters.specialty.toLowerCase()))
      )
    }

    // Filter by tutor type
    if (filters.tutorType === 'certified') {
      result = result.filter((t) => t.user.role === 'certified_tutor')
    } else if (filters.tutorType === 'community') {
      result = result.filter((t) => t.user.role !== 'certified_tutor')
    }

    // Filter by minimum rating
    if (filters.minRating > 0) {
      result = result.filter((t) => t.average_rating >= filters.minRating)
    }

    // Sort
    switch (filters.sort) {
      case 'rating':
        result.sort((a, b) => b.average_rating - a.average_rating)
        break
      case 'price_low':
        result.sort((a, b) => (a.hourly_rate ?? 0) - (b.hourly_rate ?? 0))
        break
      case 'experienced':
        result.sort((a, b) => b.total_lessons - a.total_lessons)
        break
      case 'recommended':
      default:
        // Default order: weighted by rating and lessons
        result.sort((a, b) => {
          const scoreA = a.average_rating * 0.7 + Math.min(a.total_lessons / 100, 1) * 0.3
          const scoreB = b.average_rating * 0.7 + Math.min(b.total_lessons / 100, 1) * 0.3
          return scoreB - scoreA
        })
        break
    }

    return result
  }, [tutors, filters, locale])

  return (
    <div className="space-y-6">
      <TutorFilters onFilterChange={setFilters} />

      {filteredTutors.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTutors.map((tutor) => (
            <TutorCard key={tutor.id} tutor={tutor} locale={locale} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-12">
          {t('noResults')}
        </p>
      )}
    </div>
  )
}
