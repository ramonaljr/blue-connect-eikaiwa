-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Enum types
create type user_role as enum ('learner', 'community_tutor', 'certified_tutor', 'admin');
create type cefr_level as enum ('A1', 'A2', 'B1', 'B2', 'C1', 'C2');
create type subscription_tier as enum ('free', 'pro', 'premium');
create type subscription_status as enum ('active', 'canceled', 'past_due', 'trialing');
create type certification_status as enum ('pending', 'approved', 'rejected');
create type lesson_status as enum ('scheduled', 'in_progress', 'completed', 'canceled');
create type exercise_type as enum ('multiple_choice', 'fill_blank', 'matching', 'reorder', 'free_response');
create type progress_status as enum ('not_started', 'in_progress', 'completed');
create type ai_mode as enum ('text_chat', 'voice_chat', 'voice_immersive');
create type credit_type as enum ('lesson_certified', 'lesson_community', 'ai_voice');
create type credit_source as enum ('subscription', 'purchase');
create type notification_type as enum ('lesson_reminder', 'review_request', 'subscription', 'system');

-- Users table (extends Supabase auth.users)
create table public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text not null default '',
  display_name text not null default '',
  native_language text not null default 'ja',
  english_level cefr_level not null default 'A1',
  role user_role not null default 'learner',
  avatar_url text,
  stripe_customer_id text,
  subscription_tier subscription_tier not null default 'free',
  subscription_status subscription_status not null default 'active',
  xp integer not null default 0,
  streak_days integer not null default 0,
  last_activity_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tutor profiles
create table public.tutor_profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null unique,
  bio text not null default '',
  bio_ja text not null default '',
  hourly_rate integer,
  languages_spoken jsonb not null default '["en"]'::jsonb,
  specialties jsonb not null default '[]'::jsonb,
  certification_status certification_status not null default 'pending',
  average_rating numeric(3,2) not null default 0,
  total_lessons integer not null default 0,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tutor availability
create table public.tutor_availability (
  id uuid default uuid_generate_v4() primary key,
  tutor_id uuid references public.users(id) on delete cascade not null,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  timezone text not null default 'Asia/Tokyo',
  is_recurring boolean not null default true,
  created_at timestamptz not null default now()
);

-- Lessons
create table public.lessons (
  id uuid default uuid_generate_v4() primary key,
  learner_id uuid references public.users(id) on delete cascade not null,
  tutor_id uuid references public.users(id) on delete cascade not null,
  scheduled_at timestamptz not null,
  duration_minutes smallint not null default 25 check (duration_minutes in (25, 50)),
  status lesson_status not null default 'scheduled',
  daily_room_url text,
  recording_url text,
  tutor_notes text,
  learner_rating smallint check (learner_rating between 1 and 5),
  learner_review text,
  created_at timestamptz not null default now()
);

-- Courses
create table public.courses (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  title_ja text not null,
  description text not null default '',
  description_ja text not null default '',
  level cefr_level not null,
  category text not null,
  thumbnail_url text,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Course units
create table public.course_units (
  id uuid default uuid_generate_v4() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  title_ja text not null,
  content jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Course exercises
create table public.course_exercises (
  id uuid default uuid_generate_v4() primary key,
  unit_id uuid references public.course_units(id) on delete cascade not null,
  type exercise_type not null,
  question text not null,
  question_ja text not null default '',
  options jsonb not null default '[]'::jsonb,
  correct_answer text not null default '',
  explanation text not null default '',
  explanation_ja text not null default '',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Learner progress
create table public.learner_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  unit_id uuid references public.course_units(id) on delete cascade,
  status progress_status not null default 'not_started',
  score numeric(5,2),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(user_id, course_id, unit_id)
);

-- AI conversations
create table public.ai_conversations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  mode ai_mode not null,
  scenario text,
  messages jsonb not null default '[]'::jsonb,
  corrections jsonb not null default '[]'::jsonb,
  duration_seconds integer not null default 0,
  pronunciation_score numeric(5,2),
  created_at timestamptz not null default now()
);

-- Credits
create table public.credits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  type credit_type not null,
  amount integer not null default 1,
  source credit_source not null,
  stripe_payment_id text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- Notifications
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  type notification_type not null,
  title text not null,
  body text not null default '',
  is_read boolean not null default false,
  action_url text,
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_lessons_learner on public.lessons(learner_id);
create index idx_lessons_tutor on public.lessons(tutor_id);
create index idx_lessons_scheduled on public.lessons(scheduled_at);
create index idx_courses_published on public.courses(is_published, sort_order);
create index idx_course_units_course on public.course_units(course_id, sort_order);
create index idx_course_exercises_unit on public.course_exercises(unit_id, sort_order);
create index idx_learner_progress_user on public.learner_progress(user_id);
create index idx_ai_conversations_user on public.ai_conversations(user_id, created_at desc);
create index idx_credits_user on public.credits(user_id, expires_at);
create index idx_notifications_user on public.notifications(user_id, is_read, created_at desc);
create index idx_tutor_availability_tutor on public.tutor_availability(tutor_id);

-- Updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers
create trigger set_updated_at before update on public.users
  for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.tutor_profiles
  for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.courses
  for each row execute function public.handle_updated_at();
create trigger set_updated_at before update on public.learner_progress
  for each row execute function public.handle_updated_at();

-- Auto-create user profile on auth signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
