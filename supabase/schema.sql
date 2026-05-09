-- =========================================================
-- PetMatch — Schema SQL completo v2
-- Ejecutar en Supabase SQL Editor
-- =========================================================

-- Enable PostGIS for geolocation
CREATE EXTENSION IF NOT EXISTS postgis;

-- =====================
-- 1. Profiles
-- =====================
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  email TEXT,
  short_id TEXT UNIQUE,
  role public.app_role DEFAULT 'user',
  location GEOGRAPHY(Point, 4326),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Function to generate short unique IDs (6 chars)
CREATE OR REPLACE FUNCTION generate_short_id() RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
  i INTEGER := 0;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================
-- 2. Pets
-- =====================
CREATE TYPE public.pet_gender AS ENUM ('male', 'female');

CREATE TABLE IF NOT EXISTS public.pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  species TEXT DEFAULT 'other',           -- dog, cat, rabbit, bird, other
  breed TEXT,
  age INTEGER,
  gender pet_gender NOT NULL,
  photos TEXT[] DEFAULT '{}',
  bio TEXT,
  vaccinated BOOLEAN DEFAULT false,
  size TEXT DEFAULT 'medium',             -- small, medium, large
  pedigree BOOLEAN DEFAULT false,
  medical_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- If pets table already exists, add the species column:
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS species TEXT DEFAULT 'other';

-- =====================
-- 3. Swipes
-- =====================
CREATE TYPE public.swipe_action AS ENUM ('like', 'dislike');

CREATE TABLE IF NOT EXISTS public.swipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  swiper_pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  swiped_pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  action swipe_action NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (swiper_pet_id, swiped_pet_id)
);

-- =====================
-- 4. Matches
-- =====================
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet1_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  pet2_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE (pet1_id, pet2_id)
);

-- =====================
-- 5. Messages
-- =====================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================
-- 6. Reports (NEW)
-- =====================
CREATE TYPE IF NOT EXISTS public.report_reason AS ENUM (
  'spam',
  'inappropriate_content',
  'fake_profile',
  'abusive_behavior',
  'other'
);

CREATE TYPE IF NOT EXISTS public.report_status AS ENUM (
  'pending',
  'reviewed',
  'dismissed',
  'actioned'
);

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reported_pet_id UUID REFERENCES public.pets(id) ON DELETE CASCADE NOT NULL,
  reason report_reason NOT NULL,
  description TEXT,
  status report_status DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================
-- Row Level Security
-- =====================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY IF NOT EXISTS "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY IF NOT EXISTS "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Pets
CREATE POLICY IF NOT EXISTS "Pets are viewable by everyone" ON public.pets FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Users can insert own pets" ON public.pets FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY IF NOT EXISTS "Users can update own pets" ON public.pets FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY IF NOT EXISTS "Users can delete own pets" ON public.pets FOR DELETE USING (auth.uid() = owner_id);

-- Swipes
CREATE POLICY IF NOT EXISTS "Users can manage swipes for their pets" ON public.swipes
  FOR ALL USING (
    swiper_pet_id IN (SELECT id FROM public.pets WHERE owner_id = auth.uid())
  );

-- Matches
CREATE POLICY IF NOT EXISTS "Users can manage matches for their pets" ON public.matches
  FOR ALL USING (
    pet1_id IN (SELECT id FROM public.pets WHERE owner_id = auth.uid()) OR
    pet2_id IN (SELECT id FROM public.pets WHERE owner_id = auth.uid())
  );

-- Messages
CREATE POLICY IF NOT EXISTS "Users can manage messages in their matches" ON public.messages
  FOR ALL USING (
    match_id IN (
      SELECT id FROM public.matches
      WHERE pet1_id IN (SELECT id FROM public.pets WHERE owner_id = auth.uid()) OR
            pet2_id IN (SELECT id FROM public.pets WHERE owner_id = auth.uid())
    )
  );

-- Reports: users can create reports; admins see all (use service role for admin queries)
CREATE POLICY IF NOT EXISTS "Users can create reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY IF NOT EXISTS "Users can see their own reports" ON public.reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- =====================
-- Function: handle new user
-- =====================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, email, short_id, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email,
    generate_short_id(),
    'user'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =====================
-- Storage Buckets
-- =====================
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('pets', 'pets', true) ON CONFLICT DO NOTHING;

CREATE POLICY IF NOT EXISTS "Avatar images are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY IF NOT EXISTS "Users can upload avatars." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');
CREATE POLICY IF NOT EXISTS "Pet images are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'pets');
CREATE POLICY IF NOT EXISTS "Users can upload pet images." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'pets' AND auth.role() = 'authenticated');

-- =====================
-- Admin: Allow service role to manage reports
-- =====================
-- NOTE: For the admin panel to UPDATE reports status, run queries using
-- the Supabase service_role key (server-side only, never expose to client).
-- The updateReportStatus server action uses createClient() which uses the
-- anon key + user session. For a production admin, use createAdminClient()
-- with SUPABASE_SERVICE_ROLE_KEY.
