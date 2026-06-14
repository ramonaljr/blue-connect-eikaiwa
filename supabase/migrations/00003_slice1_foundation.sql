-- New columns on users table for settings
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS daily_goal_minutes smallint NOT NULL DEFAULT 15;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS preferred_topics jsonb NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS ai_personality text NOT NULL DEFAULT 'friendly';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS ai_correction_level text NOT NULL DEFAULT 'moderate';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'Asia/Tokyo';

-- Daily tips table
CREATE TABLE IF NOT EXISTS public.daily_tips (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  tip_text text NOT NULL,
  generated_for date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, generated_for)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_daily_tips_user ON public.daily_tips(user_id, generated_for);

-- RLS for daily_tips
ALTER TABLE public.daily_tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own tips" ON public.daily_tips
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert tips" ON public.daily_tips
  FOR INSERT WITH CHECK (true);
