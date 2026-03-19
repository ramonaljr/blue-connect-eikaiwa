-- Saved phrases table (learner's personal phrase bank)
CREATE TABLE IF NOT EXISTS public.saved_phrases (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  phrase text NOT NULL,
  translation text NOT NULL DEFAULT '',
  context text NOT NULL DEFAULT '',
  source_conversation_id uuid REFERENCES public.ai_conversations(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Pronunciation scores table (per-utterance data)
CREATE TABLE IF NOT EXISTS public.pronunciation_scores (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  conversation_id uuid REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  utterance_text text NOT NULL,
  overall_score numeric(5,2) NOT NULL,
  phoneme_scores jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Add columns to ai_conversations
ALTER TABLE public.ai_conversations ADD COLUMN IF NOT EXISTS scenario_key text;
ALTER TABLE public.ai_conversations ADD COLUMN IF NOT EXISTS title text;
ALTER TABLE public.ai_conversations ADD COLUMN IF NOT EXISTS recording_url text;
ALTER TABLE public.ai_conversations ADD COLUMN IF NOT EXISTS summary jsonb;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_saved_phrases_user ON public.saved_phrases(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pronunciation_scores_user ON public.pronunciation_scores(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pronunciation_scores_conv ON public.pronunciation_scores(conversation_id);

-- RLS
ALTER TABLE public.saved_phrases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pronunciation_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own phrases" ON public.saved_phrases
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can read own pronunciation scores" ON public.pronunciation_scores
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service can insert pronunciation scores" ON public.pronunciation_scores
  FOR INSERT WITH CHECK (true);
