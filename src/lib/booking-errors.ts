// Maps the error codes raised by the book_lesson RPC to user-facing messages.
// Kept in its own module (not the 'use server' actions file) so it can be unit
// tested and reused.
export function mapBookingError(message: string): string {
  if (message.includes('INSUFFICIENT_CREDITS')) {
    return 'レッスンクレジットが足りません。クレジットを購入してください。'
  }
  if (message.includes('SLOT_TAKEN')) {
    return 'この時間帯は既に予約されています。別の時間を選んでください。'
  }
  if (message.includes('TUTOR_NOT_FOUND')) {
    return '講師が見つかりません'
  }
  if (message.includes('SCHEDULED_IN_PAST')) {
    return '過去の日時は予約できません'
  }
  return 'レッスンの予約に失敗しました'
}
