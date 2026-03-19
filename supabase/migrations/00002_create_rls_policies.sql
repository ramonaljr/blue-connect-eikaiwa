-- Enable RLS on all tables
alter table public.users enable row level security;
alter table public.tutor_profiles enable row level security;
alter table public.tutor_availability enable row level security;
alter table public.lessons enable row level security;
alter table public.courses enable row level security;
alter table public.course_units enable row level security;
alter table public.course_exercises enable row level security;
alter table public.learner_progress enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.credits enable row level security;
alter table public.notifications enable row level security;

-- Helper: check if current user is admin
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- Users policies
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);
create policy "Public can view basic user info" on public.users
  for select using (true);
create policy "Admins can manage all users" on public.users
  for all using (public.is_admin());

-- Tutor profiles policies
create policy "Anyone can view available tutor profiles" on public.tutor_profiles
  for select using (is_available = true or user_id = auth.uid());
create policy "Tutors can update own profile" on public.tutor_profiles
  for update using (user_id = auth.uid());
create policy "Tutors can insert own profile" on public.tutor_profiles
  for insert with check (user_id = auth.uid());
create policy "Admins can manage tutor profiles" on public.tutor_profiles
  for all using (public.is_admin());

-- Tutor availability policies
create policy "Anyone can view tutor availability" on public.tutor_availability
  for select using (true);
create policy "Tutors can manage own availability" on public.tutor_availability
  for all using (tutor_id = auth.uid());

-- Lessons policies
create policy "Users can view own lessons" on public.lessons
  for select using (learner_id = auth.uid() or tutor_id = auth.uid());
create policy "Learners can create lessons" on public.lessons
  for insert with check (learner_id = auth.uid());
create policy "Participants can update lessons" on public.lessons
  for update using (learner_id = auth.uid() or tutor_id = auth.uid());
create policy "Admins can manage all lessons" on public.lessons
  for all using (public.is_admin());

-- Courses policies (published courses are public)
create policy "Anyone can view published courses" on public.courses
  for select using (is_published = true);
create policy "Admins can manage courses" on public.courses
  for all using (public.is_admin());

-- Course units policies
create policy "Anyone can view units of published courses" on public.course_units
  for select using (
    exists (
      select 1 from public.courses
      where courses.id = course_units.course_id and courses.is_published = true
    )
  );
create policy "Admins can manage course units" on public.course_units
  for all using (public.is_admin());

-- Course exercises policies
create policy "Anyone can view exercises of published courses" on public.course_exercises
  for select using (
    exists (
      select 1 from public.course_units
      join public.courses on courses.id = course_units.course_id
      where course_units.id = course_exercises.unit_id and courses.is_published = true
    )
  );
create policy "Admins can manage exercises" on public.course_exercises
  for all using (public.is_admin());

-- Learner progress policies
create policy "Users can view own progress" on public.learner_progress
  for select using (user_id = auth.uid());
create policy "Users can manage own progress" on public.learner_progress
  for all using (user_id = auth.uid());

-- AI conversations policies
create policy "Users can view own conversations" on public.ai_conversations
  for select using (user_id = auth.uid());
create policy "Users can create own conversations" on public.ai_conversations
  for insert with check (user_id = auth.uid());
create policy "Users can update own conversations" on public.ai_conversations
  for update using (user_id = auth.uid());

-- Credits policies
create policy "Users can view own credits" on public.credits
  for select using (user_id = auth.uid());
create policy "Admins can manage credits" on public.credits
  for all using (public.is_admin());

-- Notifications policies
create policy "Users can view own notifications" on public.notifications
  for select using (user_id = auth.uid());
create policy "Users can update own notifications" on public.notifications
  for update using (user_id = auth.uid());
