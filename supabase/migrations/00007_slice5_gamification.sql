-- Achievements definitions
CREATE TABLE IF NOT EXISTS public.achievements (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  title text NOT NULL,
  title_ja text NOT NULL,
  description text NOT NULL DEFAULT '',
  description_ja text NOT NULL DEFAULT '',
  category text NOT NULL,
  icon text NOT NULL DEFAULT 'trophy',
  xp_reward integer NOT NULL DEFAULT 25,
  requirement_type text NOT NULL,
  requirement_value integer NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);

-- User achievements (unlocked)
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id uuid REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- User goals
CREATE TABLE IF NOT EXISTS public.user_goals (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  target_value integer NOT NULL,
  current_value integer NOT NULL DEFAULT 0,
  goal_type text NOT NULL,
  period text NOT NULL DEFAULT 'weekly',
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  completed_at timestamptz,
  xp_reward integer NOT NULL DEFAULT 50,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- XP ledger (transaction history)
CREATE TABLE IF NOT EXISTS public.xp_ledger (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL,
  source text NOT NULL,
  source_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add columns to users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS level integer NOT NULL DEFAULT 1;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS streak_freezes_remaining smallint NOT NULL DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS longest_streak integer NOT NULL DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS leaderboard_opt_in boolean NOT NULL DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS weekly_email_opt_in boolean NOT NULL DEFAULT true;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_user ON public.user_goals(user_id, ends_at);
CREATE INDEX IF NOT EXISTS idx_xp_ledger_user ON public.xp_ledger(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_xp_ledger_date ON public.xp_ledger(user_id, created_at);

-- RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read achievements" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Users can read own unlocked achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service can insert achievements" ON public.user_achievements FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can CRUD own goals" ON public.user_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can read own XP ledger" ON public.xp_ledger FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service can insert XP entries" ON public.xp_ledger FOR INSERT WITH CHECK (true);

-- Seed achievement definitions (~30 achievements)
INSERT INTO public.achievements (key, title, title_ja, description, description_ja, category, icon, xp_reward, requirement_type, requirement_value, sort_order) VALUES
-- Consistency
('streak_7', '7-Day Streak', '7日連続学習', 'Study for 7 consecutive days', '7日間連続で学習しましょう', 'consistency', 'flame', 50, 'streak', 7, 1),
('streak_30', '30-Day Streak', '30日連続学習', 'Study for 30 consecutive days', '30日間連続で学習しましょう', 'consistency', 'flame', 200, 'streak', 30, 2),
('streak_100', '100-Day Streak', '100日連続学習', 'Study for 100 consecutive days', '100日間連続で学習しましょう', 'consistency', 'flame', 500, 'streak', 100, 3),
('streak_365', '365-Day Streak', '365日連続学習', 'Study for a full year', '1年間毎日学習しましょう', 'consistency', 'flame', 1000, 'streak', 365, 4),
-- AI Practice
('first_chat', 'First Conversation', '初めてのAI会話', 'Complete your first AI chat', '初めてのAIチャットを完了しましょう', 'ai_practice', 'message-square', 25, 'ai_chats', 1, 5),
('chat_10', 'Chatterbox', 'おしゃべり好き', 'Complete 10 AI chats', 'AIチャットを10回完了しましょう', 'ai_practice', 'message-square', 50, 'ai_chats', 10, 6),
('chat_100', 'Conversation Master', '会話の達人', 'Complete 100 AI chats', 'AIチャットを100回完了しましょう', 'ai_practice', 'message-square', 200, 'ai_chats', 100, 7),
('first_voice', 'First Voice Session', '初めての音声セッション', 'Complete your first voice session', '初めての音声セッションを完了しましょう', 'ai_practice', 'mic', 25, 'voice_sessions', 1, 8),
('voice_50', 'Voice Pro', '音声プロ', 'Complete 50 voice sessions', '音声セッションを50回完了しましょう', 'ai_practice', 'mic', 200, 'voice_sessions', 50, 9),
-- Pronunciation
('pronunciation_80', 'Good Pronunciation', '良い発音', 'Score 80+ in pronunciation', '発音スコア80以上を達成しましょう', 'pronunciation', 'volume-2', 50, 'pronunciation_score', 80, 10),
('pronunciation_90', 'Great Pronunciation', '素晴らしい発音', 'Score 90+ in pronunciation', '発音スコア90以上を達成しましょう', 'pronunciation', 'volume-2', 100, 'pronunciation_score', 90, 11),
('pronunciation_95', 'Perfect Pronunciation', '完璧な発音', 'Score 95+ in pronunciation', '発音スコア95以上を達成しましょう', 'pronunciation', 'volume-2', 200, 'pronunciation_score', 95, 12),
-- Courses
('first_course', 'First Course Complete', '初めてのコース完了', 'Complete your first course', '初めてのコースを完了しましょう', 'courses', 'book-open', 100, 'courses_completed', 1, 13),
('courses_5', 'Dedicated Learner', '熱心な学習者', 'Complete 5 courses', 'コースを5つ完了しましょう', 'courses', 'book-open', 300, 'courses_completed', 5, 14),
('courses_all', 'Course Champion', 'コースチャンピオン', 'Complete all courses in a category', 'カテゴリ内の全コースを完了しましょう', 'courses', 'book-open', 500, 'courses_completed', 10, 15),
-- Lessons
('first_lesson', 'First Live Lesson', '初めてのライブレッスン', 'Attend your first live lesson', '初めてのライブレッスンに参加しましょう', 'lessons', 'video', 50, 'lessons_completed', 1, 16),
('lessons_10', 'Regular Student', 'レギュラー受講生', 'Attend 10 live lessons', 'ライブレッスンを10回受けましょう', 'lessons', 'video', 200, 'lessons_completed', 10, 17),
('lessons_50', 'Lesson Veteran', 'レッスンベテラン', 'Attend 50 live lessons', 'ライブレッスンを50回受けましょう', 'lessons', 'video', 500, 'lessons_completed', 50, 18),
('first_review', 'First Review', '初めてのレビュー', 'Leave your first tutor review', '初めてのレビューを書きましょう', 'lessons', 'star', 25, 'reviews_given', 1, 19),
-- Social
('phrases_100', 'Phrase Collector', 'フレーズコレクター', 'Save 100 phrases', 'フレーズを100個保存しましょう', 'social', 'bookmark', 100, 'saved_phrases', 100, 20),
-- XP
('level_5', 'Level 5', 'レベル5', 'Reach level 5', 'レベル5に到達しましょう', 'xp', 'zap', 100, 'level', 5, 21),
('level_10', 'Level 10', 'レベル10', 'Reach level 10', 'レベル10に到達しましょう', 'xp', 'zap', 200, 'level', 10, 22),
('level_25', 'Level 25', 'レベル25', 'Reach level 25', 'レベル25に到達しましょう', 'xp', 'zap', 500, 'level', 25, 23),
('level_50', 'Level 50', 'レベル50', 'Reach level 50', 'レベル50に到達しましょう', 'xp', 'zap', 1000, 'level', 50, 24),
-- CEFR
('cefr_a2', 'Reached A2', 'A2到達', 'Reach CEFR A2 level', 'CEFRレベルA2に到達しましょう', 'cefr', 'trending-up', 100, 'cefr_level', 2, 25),
('cefr_b1', 'Reached B1', 'B1到達', 'Reach CEFR B1 level', 'CEFRレベルB1に到達しましょう', 'cefr', 'trending-up', 200, 'cefr_level', 3, 26),
('cefr_b2', 'Reached B2', 'B2到達', 'Reach CEFR B2 level', 'CEFRレベルB2に到達しましょう', 'cefr', 'trending-up', 300, 'cefr_level', 4, 27),
('cefr_c1', 'Reached C1', 'C1到達', 'Reach CEFR C1 level', 'CEFRレベルC1に到達しましょう', 'cefr', 'trending-up', 500, 'cefr_level', 5, 28),
('cefr_c2', 'Reached C2', 'C2到達', 'Reach CEFR C2 level', 'CEFRレベルC2に到達しましょう', 'cefr', 'trending-up', 1000, 'cefr_level', 6, 29)
ON CONFLICT (key) DO NOTHING;
