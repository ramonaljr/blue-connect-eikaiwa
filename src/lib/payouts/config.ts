// Tutor payout economics. The tutor receives a share of the lesson's value;
// the platform keeps the remainder. Values are in JPY (zero-decimal currency,
// so Stripe amounts are passed as-is, not in cents).

export const TUTOR_REVENUE_SHARE = 0.7

// Reference lesson value (50-minute lesson). 25-minute lessons are prorated to
// half. Certified mirrors the à-la-carte certified-lesson credit price (¥2,500);
// community has no à-la-carte SKU, so it uses a configurable baseline.
const LESSON_VALUE_JPY: Record<'certified' | 'community', number> = {
  certified: 2500,
  community: 1000,
}

export type LessonTier = 'certified' | 'community'

// Tier is derived from the tutor's role at completion time.
export function lessonTierForRole(role: string | null | undefined): LessonTier {
  return role === 'certified_tutor' ? 'certified' : 'community'
}

// Returns the tutor's payout for a lesson, in whole yen.
export function computeTutorPayoutJpy(tier: LessonTier, durationMinutes: number): number {
  const base = LESSON_VALUE_JPY[tier]
  const prorated = durationMinutes <= 25 ? base / 2 : base
  return Math.round(prorated * TUTOR_REVENUE_SHARE)
}
