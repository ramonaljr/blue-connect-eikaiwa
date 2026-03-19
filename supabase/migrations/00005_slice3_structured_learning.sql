-- Skill profiles for adaptive difficulty
CREATE TABLE IF NOT EXISTS public.skill_profiles (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  grammar_accuracy numeric(5,2) NOT NULL DEFAULT 0,
  vocabulary_accuracy numeric(5,2) NOT NULL DEFAULT 0,
  listening_accuracy numeric(5,2) NOT NULL DEFAULT 0,
  pronunciation_accuracy numeric(5,2) NOT NULL DEFAULT 0,
  fluency_score numeric(5,2) NOT NULL DEFAULT 0,
  exercises_completed integer NOT NULL DEFAULT 0,
  last_calculated_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Exercise attempts for tracking
CREATE TABLE IF NOT EXISTS public.exercise_attempts (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  exercise_id uuid REFERENCES public.course_exercises(id) ON DELETE CASCADE NOT NULL,
  score numeric(5,2) NOT NULL,
  time_spent_seconds integer NOT NULL DEFAULT 0,
  hints_used smallint NOT NULL DEFAULT 0,
  attempts smallint NOT NULL DEFAULT 1,
  answer_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Course ratings
CREATE TABLE IF NOT EXISTS public.course_ratings (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  rating smallint NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Add new columns to course_exercises
ALTER TABLE public.course_exercises ADD COLUMN IF NOT EXISTS skill_area text NOT NULL DEFAULT 'grammar';
ALTER TABLE public.course_exercises ADD COLUMN IF NOT EXISTS difficulty smallint NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 5);
ALTER TABLE public.course_exercises ADD COLUMN IF NOT EXISTS audio_url text;
ALTER TABLE public.course_exercises ADD COLUMN IF NOT EXISTS time_limit_seconds integer;

-- Add new exercise types to the enum
-- Note: PostgreSQL enums can be extended with ALTER TYPE ... ADD VALUE
ALTER TYPE exercise_type ADD VALUE IF NOT EXISTS 'audio';
ALTER TYPE exercise_type ADD VALUE IF NOT EXISTS 'conversation';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_skill_profiles_user ON public.skill_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_attempts_user ON public.exercise_attempts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exercise_attempts_exercise ON public.exercise_attempts(exercise_id);
CREATE INDEX IF NOT EXISTS idx_course_ratings_course ON public.course_ratings(course_id);

-- RLS
ALTER TABLE public.skill_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own skill profile" ON public.skill_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service can upsert skill profiles" ON public.skill_profiles
  FOR ALL USING (true);

CREATE POLICY "Users can CRUD own attempts" ON public.exercise_attempts
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own ratings" ON public.course_ratings
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Anyone can read ratings" ON public.course_ratings
  FOR SELECT USING (true);

-- Updated_at trigger for skill_profiles
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.skill_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
