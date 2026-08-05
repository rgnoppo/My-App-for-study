-- =====================================================================
-- Study OS Plus — Supabase Schema (Sync Layer)
-- =====================================================================
-- شغّل هذا الكود بالكامل في: Supabase Dashboard > SQL Editor > New query
-- كل جدول فيه نفس الأعمدة الموجودة في IndexedDB + user_id + عمود
-- deleted (soft delete) عشان نقدر نزامن عمليات الحذف بين الأجهزة.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) SUBJECTS
-- ---------------------------------------------------------------------
create table if not exists public.subjects (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null,
  icon text not null,
  "order" integer not null default 0,
  created_at bigint not null,
  updated_at bigint not null default 0,
  deleted boolean not null default false
);

alter table public.subjects enable row level security;

create policy "subjects_select_own" on public.subjects
  for select using (auth.uid() = user_id);
create policy "subjects_insert_own" on public.subjects
  for insert with check (auth.uid() = user_id);
create policy "subjects_update_own" on public.subjects
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "subjects_delete_own" on public.subjects
  for delete using (auth.uid() = user_id);

create index if not exists subjects_user_id_idx on public.subjects(user_id);


-- ---------------------------------------------------------------------
-- 2) NODES (units / lessons tree)
-- ---------------------------------------------------------------------
create table if not exists public.nodes (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id text not null,
  parent_id text,
  type text not null check (type in ('unit', 'lesson')),
  title text not null,
  status text check (status in ('not_started', 'in_progress', 'done', 'reviewed')),
  notes text not null default '',
  "order" integer not null default 0,
  created_at bigint not null,
  updated_at bigint not null default 0,
  deleted boolean not null default false
);

alter table public.nodes enable row level security;

create policy "nodes_select_own" on public.nodes
  for select using (auth.uid() = user_id);
create policy "nodes_insert_own" on public.nodes
  for insert with check (auth.uid() = user_id);
create policy "nodes_update_own" on public.nodes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "nodes_delete_own" on public.nodes
  for delete using (auth.uid() = user_id);

create index if not exists nodes_user_id_idx on public.nodes(user_id);
create index if not exists nodes_subject_id_idx on public.nodes(subject_id);


-- ---------------------------------------------------------------------
-- 3) HOMEWORK
-- ---------------------------------------------------------------------
create table if not exists public.homework (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id text not null,
  title text not null,
  due_date text not null,
  done boolean not null default false,
  created_at bigint not null,
  updated_at bigint not null default 0,
  deleted boolean not null default false
);

alter table public.homework enable row level security;

create policy "homework_select_own" on public.homework
  for select using (auth.uid() = user_id);
create policy "homework_insert_own" on public.homework
  for insert with check (auth.uid() = user_id);
create policy "homework_update_own" on public.homework
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "homework_delete_own" on public.homework
  for delete using (auth.uid() = user_id);

create index if not exists homework_user_id_idx on public.homework(user_id);


-- ---------------------------------------------------------------------
-- 4) EXAMS
-- ---------------------------------------------------------------------
create table if not exists public.exams (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id text not null,
  title text not null,
  date text not null,
  type text not null check (type in ('exam', 'quiz', 'final_review')),
  created_at bigint not null,
  updated_at bigint not null default 0,
  deleted boolean not null default false
);

alter table public.exams enable row level security;

create policy "exams_select_own" on public.exams
  for select using (auth.uid() = user_id);
create policy "exams_insert_own" on public.exams
  for insert with check (auth.uid() = user_id);
create policy "exams_update_own" on public.exams
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "exams_delete_own" on public.exams
  for delete using (auth.uid() = user_id);

create index if not exists exams_user_id_idx on public.exams(user_id);


-- ---------------------------------------------------------------------
-- 5) MISTAKES (knowledge gaps)
-- ---------------------------------------------------------------------
create table if not exists public.mistakes (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id text not null,
  lesson_id text,
  question text not null,
  my_answer text not null default '',
  correct_answer text not null default '',
  reason text not null default '',
  understood boolean not null default false,
  created_at bigint not null,
  updated_at bigint not null default 0,
  deleted boolean not null default false
);

alter table public.mistakes enable row level security;

create policy "mistakes_select_own" on public.mistakes
  for select using (auth.uid() = user_id);
create policy "mistakes_insert_own" on public.mistakes
  for insert with check (auth.uid() = user_id);
create policy "mistakes_update_own" on public.mistakes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "mistakes_delete_own" on public.mistakes
  for delete using (auth.uid() = user_id);

create index if not exists mistakes_user_id_idx on public.mistakes(user_id);


-- =====================================================================
-- ملاحظات:
-- 1. كل الجداول فيها RLS مفعّل، يعني حتى لو حد قدر ياخد الـ anon key بتاعك
--    مش هيقدر يشوف أو يعدل بيانات غير بياناته هو (auth.uid() = user_id).
-- 2. عمود deleted هو "soft delete": بدل ما نمسح الصف فعليًا، بنعلّمه
--    كـ deleted=true عشان باقي الأجهزة تعرف إنه اتمسح وتمسحه هي كمان
--    من IndexedDB بتاعها.
-- 3. عمود updated_at (بالميلي ثانية، زي Date.now() في JS) هو أساس
--    حل التعارض: آخر تعديل (الأحدث) هو اللي بيكسب عند المزامنة.
-- 4. بعد ما تشغل السكريبت ده، روح Authentication > Users في Supabase
--    وأضف حسابك بنفسك (بإيميلك) — التطبيق مصمم إن التسجيل مقفول
--    (shouldCreateUser: false) فمحدش تاني يقدر يعمل حساب من جوه التطبيق.
-- =====================================================================
