-- Seed: 3 courses for launch (Foundations A1, Daily Conversation A2, TOEIC B1)

-- Course 1: Foundations A1
INSERT INTO courses (id, title, title_ja, description, description_ja, level, category, is_published, sort_order)
VALUES (
  gen_random_uuid(),
  'English Foundations',
  '英語の基礎',
  'Build your core English skills from the ground up.',
  '基礎から英語力を身につけましょう。',
  'A1', 'Foundations', true, 1
);

-- Course 2: Daily Conversation A2
INSERT INTO courses (id, title, title_ja, description, description_ja, level, category, is_published, sort_order)
VALUES (
  gen_random_uuid(),
  'Daily Conversation',
  '日常会話',
  'Practice everyday English for real-life situations.',
  '日常のシーンで使える英会話を練習しましょう。',
  'A2', 'Daily Conversation', true, 2
);

-- Course 3: TOEIC Preparation B1
INSERT INTO courses (id, title, title_ja, description, description_ja, level, category, is_published, sort_order)
VALUES (
  gen_random_uuid(),
  'TOEIC Preparation',
  'TOEIC対策',
  'Prepare for the TOEIC exam with targeted practice.',
  'TOEICに向けた効率的な対策を行いましょう。',
  'B1', 'TOEIC', true, 3
);
