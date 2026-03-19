-- Lesson preparations (pre-lesson prep shared with tutor)
CREATE TABLE IF NOT EXISTS public.lesson_preparations (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL UNIQUE,
  topics text NOT NULL DEFAULT '',
  vocabulary jsonb NOT NULL DEFAULT '[]'::jsonb,
  goals jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Lesson notes (shared notes + AI summary)
CREATE TABLE IF NOT EXISTS public.lesson_notes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL UNIQUE,
  shared_notes text NOT NULL DEFAULT '',
  tutor_private_notes text NOT NULL DEFAULT '',
  ai_summary text NOT NULL DEFAULT '',
  transcript_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Lesson chats (in-session text messages)
CREATE TABLE IF NOT EXISTS public.lesson_chats (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  lesson_id uuid REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add columns to lessons table
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS learner_review_categories jsonb;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS cancellation_reason text;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS canceled_at timestamptz;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS canceled_by uuid REFERENCES public.users(id);
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS credit_refund_amount numeric(5,2);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lesson_preparations_lesson ON public.lesson_preparations(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_notes_lesson ON public.lesson_notes(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_chats_lesson ON public.lesson_chats(lesson_id, created_at);

-- RLS
ALTER TABLE public.lesson_preparations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_chats ENABLE ROW LEVEL SECURITY;

-- Lesson participants can access preparations
CREATE POLICY "Lesson participants can access preparations" ON public.lesson_preparations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.lessons
      WHERE lessons.id = lesson_preparations.lesson_id
      AND (lessons.learner_id = auth.uid() OR lessons.tutor_id = auth.uid())
    )
  );

-- Lesson participants can access notes (but tutor_private_notes handled at app level)
CREATE POLICY "Lesson participants can access notes" ON public.lesson_notes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.lessons
      WHERE lessons.id = lesson_notes.lesson_id
      AND (lessons.learner_id = auth.uid() OR lessons.tutor_id = auth.uid())
    )
  );

-- Lesson participants can access chats
CREATE POLICY "Lesson participants can access chats" ON public.lesson_chats
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.lessons
      WHERE lessons.id = lesson_chats.lesson_id
      AND (lessons.learner_id = auth.uid() OR lessons.tutor_id = auth.uid())
    )
  );

-- Updated_at triggers
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.lesson_preparations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.lesson_notes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to update tutor average_rating when a lesson review is submitted
CREATE OR REPLACE FUNCTION public.update_tutor_rating()
RETURNS trigger AS $$
BEGIN
  IF NEW.learner_rating IS NOT NULL AND (OLD.learner_rating IS NULL OR OLD.learner_rating != NEW.learner_rating) THEN
    UPDATE public.tutor_profiles
    SET average_rating = (
      SELECT COALESCE(AVG(learner_rating), 0)
      FROM public.lessons
      WHERE tutor_id = NEW.tutor_id
      AND learner_rating IS NOT NULL
    ),
    total_lessons = (
      SELECT COUNT(*)
      FROM public.lessons
      WHERE tutor_id = NEW.tutor_id
      AND status = 'completed'
    )
    WHERE user_id = NEW.tutor_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tutor_rating_on_review
  AFTER UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.update_tutor_rating();
