export type UserRole = 'learner' | 'community_tutor' | 'certified_tutor' | 'admin'
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
export type SubscriptionTier = 'free' | 'pro' | 'premium'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing'
export type CertificationStatus = 'pending' | 'approved' | 'rejected'
export type LessonStatus = 'scheduled' | 'in_progress' | 'completed' | 'canceled'
export type ExerciseType = 'multiple_choice' | 'fill_blank' | 'matching' | 'reorder' | 'free_response' | 'audio' | 'conversation'
export type ProgressStatus = 'not_started' | 'in_progress' | 'completed'
export type AIMode = 'text_chat' | 'voice_chat' | 'voice_immersive'
export type CreditType = 'lesson_certified' | 'lesson_community' | 'ai_voice'
export type CreditSource = 'subscription' | 'purchase'
export type NotificationType = 'lesson_reminder' | 'review_request' | 'subscription' | 'system'
export type AIPersonality = 'friendly' | 'strict' | 'balanced'
export type AICorrectionLevel = 'gentle' | 'moderate' | 'thorough'

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
  level: number
  streak_freezes_remaining: number
  longest_streak: number
  leaderboard_opt_in: boolean
  weekly_email_opt_in: boolean
  created_at: string
  updated_at: string
  daily_goal_minutes: number
  preferred_topics: string[]
  ai_personality: AIPersonality
  ai_correction_level: AICorrectionLevel
  timezone: string
}

export interface Achievement {
  id: string
  key: string
  title: string
  title_ja: string
  description: string
  description_ja: string
  category: string
  icon: string
  xp_reward: number
  requirement_type: string
  requirement_value: number
  sort_order: number
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  unlocked_at: string
}

export interface UserGoal {
  id: string
  user_id: string
  title: string
  target_value: number
  current_value: number
  goal_type: string
  period: string
  starts_at: string
  ends_at: string
  completed_at: string | null
  xp_reward: number
  created_at: string
}

export interface XPLedgerEntry {
  id: string
  user_id: string
  amount: number
  source: string
  source_id: string | null
  created_at: string
}

export interface DailyTip {
  id: string
  user_id: string
  tip_text: string
  generated_for: string
  created_at: string
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
  learner_review_categories: Record<string, number> | null
  cancellation_reason: string | null
  canceled_at: string | null
  canceled_by: string | null
  credit_refund_amount: number | null
}

export interface LessonPreparation {
  id: string
  lesson_id: string
  topics: string
  vocabulary: string[]
  goals: string[]
  created_at: string
  updated_at: string
}

export interface LessonNote {
  id: string
  lesson_id: string
  shared_notes: string
  tutor_private_notes: string
  ai_summary: string
  transcript_url: string | null
  created_at: string
  updated_at: string
}

export interface LessonChat {
  id: string
  lesson_id: string
  user_id: string
  message: string
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
  skill_area: string
  difficulty: number
  audio_url: string | null
  time_limit_seconds: number | null
  created_at: string
}

export interface SkillProfile {
  id: string
  user_id: string
  grammar_accuracy: number
  vocabulary_accuracy: number
  listening_accuracy: number
  pronunciation_accuracy: number
  fluency_score: number
  exercises_completed: number
  last_calculated_at: string
  updated_at: string
}

export interface ExerciseAttempt {
  id: string
  user_id: string
  exercise_id: string
  score: number
  time_spent_seconds: number
  hints_used: number
  attempts: number
  answer_data: Record<string, unknown>
  created_at: string
}

export interface CourseRating {
  id: string
  user_id: string
  course_id: string
  rating: number
  review: string
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
  scenario_key: string | null
  title: string | null
  recording_url: string | null
  summary: Record<string, unknown> | null
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

export interface SavedPhrase {
  id: string
  user_id: string
  phrase: string
  translation: string
  context: string
  source_conversation_id: string | null
  created_at: string
}

export interface PronunciationScore {
  id: string
  user_id: string
  conversation_id: string | null
  utterance_text: string
  overall_score: number
  phoneme_scores: PhonemeScore[]
  created_at: string
}

export interface PhonemeScore {
  phoneme: string
  score: number
  offset: number
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
