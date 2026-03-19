export type UserRole = 'learner' | 'community_tutor' | 'certified_tutor' | 'admin'
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
export type SubscriptionTier = 'free' | 'pro' | 'premium'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing'
export type CertificationStatus = 'pending' | 'approved' | 'rejected'
export type LessonStatus = 'scheduled' | 'in_progress' | 'completed' | 'canceled'
export type ExerciseType = 'multiple_choice' | 'fill_blank' | 'matching' | 'reorder' | 'free_response'
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed'
export type AIMode = 'text_chat' | 'voice_chat' | 'voice_immersive'
export type CreditType = 'lesson_certified' | 'lesson_community' | 'ai_voice'
export type CreditSource = 'subscription' | 'purchase'
export type NotificationType = 'lesson_reminder' | 'review_request' | 'subscription' | 'system'

export interface User {
  id: string
  email: string
  full_name: string
  display_name: string
  native_language: string
  english_level: CEFRLevel
  role: UserRole
  avatar_url: string | null
  stripe_customer_id: string | null
  subscription_tier: SubscriptionTier
  subscription_status: SubscriptionStatus
  xp: number
  streak_days: number
  last_activity_date: string | null
  created_at: string
  updated_at: string
}

export interface TutorProfile {
  id: string
  user_id: string
  bio: string
  bio_ja: string
  hourly_rate: number | null
  languages_spoken: string[]
  specialties: string[]
  certification_status: CertificationStatus
  average_rating: number
  total_lessons: number
  is_available: boolean
  created_at: string
  updated_at: string
}

export interface TutorAvailability {
  id: string
  tutor_id: string
  day_of_week: number
  start_time: string
  end_time: string
  timezone: string
  is_recurring: boolean
  created_at: string
}

export interface Lesson {
  id: string
  learner_id: string
  tutor_id: string
  scheduled_at: string
  duration_minutes: 25 | 50
  status: LessonStatus
  daily_room_url: string | null
  recording_url: string | null
  tutor_notes: string | null
  learner_rating: number | null
  learner_review: string | null
  created_at: string
}

export interface Course {
  id: string
  title: string
  title_ja: string
  description: string
  description_ja: string
  level: CEFRLevel
  category: string
  thumbnail_url: string | null
  is_published: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface CourseUnit {
  id: string
  course_id: string
  title: string
  title_ja: string
  content: Record<string, unknown>
  sort_order: number
  created_at: string
}

export interface CourseExercise {
  id: string
  unit_id: string
  type: ExerciseType
  question: string
  question_ja: string
  options: unknown[]
  correct_answer: string
  explanation: string
  explanation_ja: string
  sort_order: number
  created_at: string
}

export interface LearnerProgress {
  id: string
  user_id: string
  course_id: string
  unit_id: string | null
  status: ProgressStatus
  score: number | null
  completed_at: string | null
  updated_at: string
}

export interface AIConversation {
  id: string
  user_id: string
  mode: AIMode
  scenario: string | null
  messages: AIMessage[]
  corrections: AICorrection[]
  duration_seconds: number
  pronunciation_score: number | null
  created_at: string
}

export interface AIMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface AICorrection {
  original: string
  corrected: string
  explanation: string
  explanation_ja: string
  type: 'grammar' | 'vocabulary' | 'pronunciation' | 'usage'
}

export interface Credit {
  id: string
  user_id: string
  type: CreditType
  amount: number
  source: CreditSource
  stripe_payment_id: string | null
  expires_at: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string
  is_read: boolean
  action_url: string | null
  created_at: string
}
