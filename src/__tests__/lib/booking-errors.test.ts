import { describe, it, expect } from 'vitest'
import { mapBookingError } from '@/lib/booking-errors'

describe('mapBookingError', () => {
  it('maps INSUFFICIENT_CREDITS to the credits message', () => {
    const msg = mapBookingError('ERROR: INSUFFICIENT_CREDITS')
    expect(msg).toContain('クレジット')
  })

  it('maps SLOT_TAKEN to the slot-taken message', () => {
    const msg = mapBookingError('new row violates ... SLOT_TAKEN')
    expect(msg).toContain('既に予約')
  })

  it('maps TUTOR_NOT_FOUND', () => {
    expect(mapBookingError('TUTOR_NOT_FOUND')).toBe('講師が見つかりません')
  })

  it('maps SCHEDULED_IN_PAST', () => {
    expect(mapBookingError('SCHEDULED_IN_PAST')).toBe('過去の日時は予約できません')
  })

  it('falls back to a generic message for unknown errors', () => {
    expect(mapBookingError('some unexpected db error')).toBe('レッスンの予約に失敗しました')
  })
})
