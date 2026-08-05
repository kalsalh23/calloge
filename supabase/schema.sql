-- ============================================================================
-- "حلمك الجامعي" — Supabase Database Schema
-- PostgreSQL 15+ / Supabase
-- Design: scalable, relationship-aware, ready for multi-year admission data
-- ============================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- ROLES
-- ---------------------------------------------------------------------------
-- ROLES
-- ---------------------------------------------------------------------------
create table if not exists public.roles (
  id           serial primary key,
  name         text not null unique,
  description  text,
  created_at   timestamptz not null default now()
);

insert into public.roles (name, description) values
  ('student', 'مستخدم عادي - طالب'),
  ('editor', 'محرر محتوى - يمكنه إدارة المحتوى'),
  ('admin', 'مدير - يمكنه إدارة المحتوى والمستخدمين'),
  ('super_admin', 'مدير عام - صلاحيات كاملة')
on conflict (name) do nothing;

-- ---------------------------------------------------------------------------
-- GOVERNORATES
-- ---------------------------------------------------------------------------
create table if not exists public.governorates (
  id          serial primary key,
  name_ar     text not null unique,
  name_en     text,
  created_at  timestamptz not null default now()
);

insert into public.governorates (name_ar, name_en) values
  ('دمشق', 'Damascus'),
  ('حلب', 'Aleppo'),
  ('حمص', 'Homs'),
  ('حماة', 'Hama'),
  ('اللاذقية', 'Latakia'),
  ('طرطوس', 'Tartus'),
  ('إدلب', 'Idlib'),
  ('دير الزور', 'Deir ez-Zor'),
  ('الحسكة', 'Al-Hasakah'),
  ('الرقة', 'Raqqa'),
  ('درعا', 'Daraa'),
  ('السويداء', 'As-Suwayda'),
  ('القنيطرة', 'Quneitra'),
  ('ريف دمشق', 'Rif Dimashq')
on conflict (name_ar) do nothing;

-- ---------------------------------------------------------------------------
-- USERS (profiles linked to auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  role_id       int not null default 1 references public.roles(id),
  full_name     text,
  email         text,
  avatar_url    text,
  phone         text,
  governorate_id int references public.governorates(id),
  certificate_id int, -- optional, declared later via alter
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_users_role on public.users(role_id);

-- auto-create user profile on auth signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(coalesce(new.email, ''), '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- CERTIFICATES (types of secondary/vocational certificates)
-- ---------------------------------------------------------------------------
create table if not exists public.certificates (
  id          serial primary key,
  name_ar     text not null,
  name_en     text,
  slug        text not null unique,
  description text,
  icon        text,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- UNIVERSITIES
-- ---------------------------------------------------------------------------
create table if not exists public.universities (
  id             serial primary key,
  name_ar        text not null,
  name_en        text,
  slug           text not null unique,
  type           text not null check (type in ('government', 'private')) default 'government',
  logo_url       text,
  cover_url      text,
  description    text,
  website        text,
  address        text,
  governorate_id int references public.governorates(id),
  email          text,
  phone          text,
  facebook       text,
  instagram      text,
  youtube        text,
  founding_year  int,
  housing_available boolean not null default false,
  tuition_notes  text,
  rating         numeric(2,1) default 0,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists idx_universities_governorate on public.universities(governorate_id);
create index if not exists idx_universities_type on public.universities(type);

-- ---------------------------------------------------------------------------
-- COLLEGES / FACULTIES
-- ---------------------------------------------------------------------------
create table if not exists public.colleges (
  id            serial primary key,
  university_id int not null references public.universities(id) on delete cascade,
  name_ar       text not null,
  name_en       text,
  slug          text not null,
  description   text,
  cover_url     text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (university_id, slug)
);

create index if not exists idx_colleges_university on public.colleges(university_id);

-- ---------------------------------------------------------------------------
-- MAJORS (specializations)
-- ---------------------------------------------------------------------------
create table if not exists public.majors (
  id            serial primary key,
  college_id    int not null references public.colleges(id) on delete cascade,
  name_ar       text not null,
  name_en       text,
  slug          text not null unique,
  summary       text,
  description   text,
  degree        text default 'بكالوريوس',
  study_duration_years numeric(3,1) default 4,
  difficulty    int check (difficulty between 1 and 5) default 2,
  career_opportunities text[] default '{}',
  avg_salary    text,
  salary_min    numeric(10,0),
  salary_max    numeric(10,0),
  skills        text[] default '{}',
  subjects      text[] default '{}',
  study_nature  text,
  postgraduate_opportunities boolean default true,
  video_url     text,
  cover_url     text,
  rating        numeric(2,1) default 0,
  views         int not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_majors_college on public.majors(college_id);
create index if not exists idx_majors_active on public.majors(is_active);

-- ---------------------------------------------------------------------------
-- ADMISSION RULES (per certificate + optional university)
-- ---------------------------------------------------------------------------
create table if not exists public.admission_rules (
  id             serial primary key,
  certificate_id int not null references public.certificates(id) on delete cascade,
  university_id  int references public.universities(id) on delete cascade,
  title          text,
  body           text,
  conditions     jsonb not null default '{}'::jsonb,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists idx_admission_rules_cert on public.admission_rules(certificate_id);

-- ---------------------------------------------------------------------------
-- ADMISSION SCORES — the heart of the platform (multi-year ready)
-- ---------------------------------------------------------------------------
create table if not exists public.admission_scores (
  id                 serial primary key,
  year               int not null,
  university_id      int not null references public.universities(id) on delete cascade,
  college_id         int references public.colleges(id) on delete cascade,
  major_id           int not null references public.majors(id) on delete cascade,
  certificate_type_id int not null references public.certificates(id) on delete cascade,
  admission_type     text not null default 'general' check (admission_type in ('general', 'parallel', 'private', 'wafi', 'other')),
  minimum_score      numeric(7,2) not null,
  notes              text,
  is_published       boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (year, university_id, college_id, major_id, certificate_type_id, admission_type)
);

create index if not exists idx_scores_year on public.admission_scores(year);
create index if not exists idx_scores_major on public.admission_scores(major_id);
create index if not exists idx_scores_university on public.admission_scores(university_id);
create index if not exists idx_scores_cert on public.admission_scores(certificate_type_id);
create index if not exists idx_scores_min on public.admission_scores(minimum_score);

-- ---------------------------------------------------------------------------
-- MEDIA (images/videos attached to any entity)
-- ---------------------------------------------------------------------------
create table if not exists public.media (
  id          serial primary key,
  entity_type text not null check (entity_type in ('university', 'major', 'college', 'news', 'article', 'testimonial')),
  entity_id   int not null,
  url         text not null,
  media_type  text not null check (media_type in ('image', 'video')) default 'image',
  alt         text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists idx_media_entity on public.media(entity_type, entity_id);

-- ---------------------------------------------------------------------------
-- ARTICLES
-- ---------------------------------------------------------------------------
create table if not exists public.articles (
  id          serial primary key,
  title       text not null,
  slug        text not null unique,
  excerpt     text,
  content     text,
  cover_url   text,
  author_id   uuid references public.users(id) on delete set null,
  tags        text[] default '{}',
  is_published boolean not null default false,
  published_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- NEWS
-- ---------------------------------------------------------------------------
create table if not exists public.news (
  id           serial primary key,
  title        text not null,
  slug         text not null unique,
  excerpt      text,
  content      text,
  cover_url    text,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- FAQ
-- ---------------------------------------------------------------------------
create table if not exists public.faq (
  id        serial primary key,
  question  text not null,
  answer    text not null,
  category  text default 'عام',
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- FAVORITES
-- ---------------------------------------------------------------------------
create table if not exists public.favorites (
  id          serial primary key,
  user_id     uuid not null references public.users(id) on delete cascade,
  target_type text not null check (target_type in ('major', 'university')),
  target_id   int not null,
  created_at  timestamptz not null default now(),
  unique (user_id, target_type, target_id)
);

create index if not exists idx_favorites_user on public.favorites(user_id);

-- ---------------------------------------------------------------------------
-- COMPARISONS
-- ---------------------------------------------------------------------------
create table if not exists public.comparisons (
  id         serial primary key,
  user_id    uuid not null references public.users(id) on delete cascade,
  name       text default 'مقارنة التخصصات',
  major_ids  int[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_comparisons_user on public.comparisons(user_id);

-- ---------------------------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------------------------
create table if not exists public.notifications (
  id         serial primary key,
  user_id    uuid references public.users(id) on delete cascade, -- null = broadcast
  title      text not null,
  body       text,
  type       text default 'info',
  link       text,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_notifications_user on public.notifications(user_id);

-- ---------------------------------------------------------------------------
-- SETTINGS (key/value, JSONB)
-- ---------------------------------------------------------------------------
create table if not exists public.settings (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- TESTIMONIALS
-- ---------------------------------------------------------------------------
create table if not exists public.testimonials (
  id           serial primary key,
  student_name text not null,
  university   text,
  major        text,
  quote        text not null,
  avatar_url   text,
  rating       int check (rating between 1 and 5) default 5,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- HELPER FUNCTIONS (used by RLS) — created after tables
-- ---------------------------------------------------------------------------

create or replace function public.current_user_id()
returns uuid language sql stable security definer set search_path = public as $$
  select auth.uid();
$$;

create or replace function public.user_role()
returns text language sql stable security definer set search_path = public as $$
  select r.name
  from public.users u
  join public.roles r on r.id = u.role_id
  where u.id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.user_role() in ('editor', 'admin', 'super_admin'), false);
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.user_role() in ('admin', 'super_admin'), false);
$$;

create or replace function public.is_super_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.user_role() = 'super_admin', false);
$$;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- UPDATED_AT TRIGGERS
-- ---------------------------------------------------------------------------
create trigger trg_users_updated before update on public.users
  for each row execute function public.set_updated_at();
create trigger trg_certificates_updated before update on public.certificates
  for each row execute function public.set_updated_at();
create trigger trg_universities_updated before update on public.universities
  for each row execute function public.set_updated_at();
create trigger trg_colleges_updated before update on public.colleges
  for each row execute function public.set_updated_at();
create trigger trg_majors_updated before update on public.majors
  for each row execute function public.set_updated_at();
create trigger trg_admission_rules_updated before update on public.admission_rules
  for each row execute function public.set_updated_at();
create trigger trg_admission_scores_updated before update on public.admission_scores
  for each row execute function public.set_updated_at();
create trigger trg_articles_updated before update on public.articles
  for each row execute function public.set_updated_at();
create trigger trg_news_updated before update on public.news
  for each row execute function public.set_updated_at();
create trigger trg_settings_updated before update on public.settings
  for each row execute function public.set_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table public.roles enable row level security;
alter table public.users enable row level security;
alter table public.governorates enable row level security;
alter table public.certificates enable row level security;
alter table public.universities enable row level security;
alter table public.colleges enable row level security;
alter table public.majors enable row level security;
alter table public.admission_rules enable row level security;
alter table public.admission_scores enable row level security;
alter table public.media enable row level security;
alter table public.articles enable row level security;
alter table public.news enable row level security;
alter table public.faq enable row level security;
alter table public.favorites enable row level security;
alter table public.comparisons enable row level security;
alter table public.notifications enable row level security;
alter table public.settings enable row level security;
alter table public.testimonials enable row level security;

-- -------- Public content (read-only for everyone) --------------------------
create policy "governorates public read" on public.governorates
  for select using (true);

create policy "certificates public read" on public.certificates
  for select using (is_active or public.is_staff());
create policy "certificates staff write" on public.certificates
  for all using (public.is_staff()) with check (public.is_staff());

create policy "universities public read" on public.universities
  for select using (true);
create policy "universities staff write" on public.universities
  for all using (public.is_staff()) with check (public.is_staff());

create policy "colleges public read" on public.colleges
  for select using (true);
create policy "colleges staff write" on public.colleges
  for all using (public.is_staff()) with check (public.is_staff());

create policy "majors public read" on public.majors
  for select using (true);
create policy "majors staff write" on public.majors
  for all using (public.is_staff()) with check (public.is_staff());

create policy "admission_rules public read" on public.admission_rules
  for select using (true);
create policy "admission_rules staff write" on public.admission_rules
  for all using (public.is_staff()) with check (public.is_staff());

create policy "admission_scores public read" on public.admission_scores
  for select using (true);
create policy "admission_scores staff write" on public.admission_scores
  for all using (public.is_staff()) with check (public.is_staff());

create policy "media public read" on public.media
  for select using (true);
create policy "media staff write" on public.media
  for all using (public.is_staff()) with check (public.is_staff());

create policy "articles public read" on public.articles
  for select using (is_published or public.is_staff());
create policy "articles staff write" on public.articles
  for all using (public.is_staff()) with check (public.is_staff());

create policy "news public read" on public.news
  for select using (is_published or public.is_staff());
create policy "news staff write" on public.news
  for all using (public.is_staff()) with check (public.is_staff());

create policy "faq public read" on public.faq
  for select using (true);
create policy "faq staff write" on public.faq
  for all using (public.is_staff()) with check (public.is_staff());

create policy "testimonials public read" on public.testimonials
  for select using (true);
create policy "testimonials staff write" on public.testimonials
  for all using (public.is_staff()) with check (public.is_staff());

-- -------- Users ------------------------------------------------------------
create policy "users read own" on public.users
  for select using (id = auth.uid() or public.is_staff());
create policy "users update own" on public.users
  for update using (id = auth.uid()) with check (id = auth.uid());
create policy "users admin write" on public.users
  for all using (public.is_admin()) with check (public.is_admin());

-- -------- Favorites (own data) ---------------------------------------------
create policy "favorites own all" on public.favorites
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "favorites admin read" on public.favorites
  for select using (public.is_admin());

-- -------- Comparisons (own data) -------------------------------------------
create policy "comparisons own all" on public.comparisons
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- -------- Notifications ----------------------------------------------------
create policy "notifications own read" on public.notifications
  for select using (user_id = auth.uid() or (user_id is null and auth.uid() is not null));
create policy "notifications own update" on public.notifications
  for update using (user_id = auth.uid());
create policy "notifications staff write" on public.notifications
  for all using (public.is_staff()) with check (public.is_staff());

-- -------- Settings ---------------------------------------------------------
create policy "settings public read" on public.settings
  for select using (true);
create policy "settings staff write" on public.settings
  for all using (public.is_staff()) with check (public.is_staff());

-- -------- Roles ------------------------------------------------------------
create policy "roles public read" on public.roles
  for select using (true);
create policy "roles super_admin write" on public.roles
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- ============================================================================
-- SEED: default certificates
-- ============================================================================
insert into public.certificates (name_ar, slug, description, sort_order) values
  ('الثانوية العامة - دمشق', 'general-damascus', 'شهادة الثانوية العامة الصادرة عن وزارة التربية - الفرع العلمي والأدبي', 1),
  ('الثانوية العامة - دمشق (المنهاج الحديث)', 'general-damascus-modern', 'شهادة الثانوية العامة وفق المنهاج الحديث', 2),
  ('الثانوية العامة - إدلب', 'general-idlib', 'شهادة الثانوية العامة الصادرة في إدلب', 3),
  ('الثانوية المهنية - تقنيات حاسوب', 'vocational-computer', 'الثانوية المهنية - فرع تقنيات الحاسوب', 4),
  ('الثانوية المهنية - إلكترون', 'vocational-electronics', 'الثانوية المهنية - فرع الإلكترون', 5),
  ('الثانوية التجارية', 'commercial', 'شهادة التعليم الثانوي التجاري', 6),
  ('الثانوية الصناعية', 'industrial', 'شهادة التعليم الثانوي الصناعي', 7),
  ('الثانوية الزراعية', 'agricultural', 'شهادة التعليم الثانوي الزراعي', 8),
  ('الثانوية الشرعية', 'sharia', 'شهادة التعليم الثانوي الشرعي', 9)
on conflict (slug) do nothing;

-- Seed settings
insert into public.settings (key, value) values
  ('site', '{"name":"حلمك الجامعي","tagline":"دليلك الذكي نحو مستقبلك الجامعي","current_year":2025,"default_certificate":null,"hero_heading":"اكتشف مستقبلك الجامعي بذكاء","hero_subheading":"أدخل معدلك ونوع شهادتك واحصل على قائمة التخصصات والجامعات التي يحق لك التقديم إليها"}'),
  ('social', '{"facebook":"","instagram":"","telegram":"","youtube":""}')
on conflict (key) do nothing;
