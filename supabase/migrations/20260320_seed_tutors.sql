-- NOTE: This migration creates tutor_profiles for testing.
-- In production, tutors register through the tutor onboarding flow.
-- These profiles require corresponding entries in the auth.users and public.users tables.
-- Run AFTER creating test tutor accounts in Supabase Auth dashboard.

-- Placeholder: Insert tutor profiles for existing test accounts
-- Replace the user_id values with actual test tutor user IDs

-- Example structure (uncomment and fill with real IDs):
-- INSERT INTO tutor_profiles (user_id, bio, bio_ja, hourly_rate, languages_spoken, specialties, certification_status, is_available)
-- VALUES
--   ('TUTOR_USER_ID_1', 'Native English teacher with 5 years experience teaching Japanese students. Specializes in conversation and business English.', '5年の指導経験を持つネイティブ英語講師。会話とビジネス英語が専門です。', 3000, '["English", "Japanese"]'::jsonb, '["Conversation", "Business"]'::jsonb, 'approved', true),
--   ('TUTOR_USER_ID_2', 'TOEIC specialist with a perfect score. Helps students achieve their target scores efficiently.', 'TOEIC満点のスペシャリスト。効率的にスコアアップを支援します。', 4000, '["English", "Japanese"]'::jsonb, '["TOEIC", "EIKEN"]'::jsonb, 'approved', true),
--   ('TUTOR_USER_ID_3', 'Friendly conversation partner who makes learning fun. Great for beginners!', 'フレンドリーな会話パートナー。初心者の方にぴったりです！', 1500, '["English"]'::jsonb, '["Conversation", "Travel"]'::jsonb, 'approved', true);
