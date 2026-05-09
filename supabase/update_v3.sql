-- =========================================================
-- PetMatch — Update v3: Social Network & Intelligent Matching
-- =========================================================

-- 1. Update Pets table with matching fields
ALTER TABLE public.pets 
ADD COLUMN IF NOT EXISTS temperament TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS activity_level INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS kids_friendly BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS housing TEXT DEFAULT 'both', -- 'apartment', 'house', 'both'
ADD COLUMN IF NOT EXISTS genetic_info TEXT,
ADD COLUMN IF NOT EXISTS behavior_prediction TEXT;

-- 2. Create Events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  category TEXT DEFAULT 'meetup', -- 'meetup', 'walk', 'training', 'other'
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location GEOGRAPHY(Point, 4326),
  location_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Event Participants
CREATE TABLE IF NOT EXISTS public.event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(event_id, profile_id)
);

-- 4. Community Posts (Socialization requests, alerts, etc.)
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  pet_id UUID REFERENCES public.pets(id) ON DELETE SET NULL, -- Optional: link to a specific pet
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general', -- 'socialization', 'alert', 'tip', 'question'
  image_url TEXT,
  location GEOGRAPHY(Point, 4326),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies for new tables

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Events
CREATE POLICY "Events are viewable by everyone" ON public.events FOR SELECT USING (true);
CREATE POLICY "Users can create events" ON public.events FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update their own events" ON public.events FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Users can delete their own events" ON public.events FOR DELETE USING (auth.uid() = creator_id);

-- Event Participants
CREATE POLICY "Participants are viewable by everyone" ON public.event_participants FOR SELECT USING (true);
CREATE POLICY "Users can join events" ON public.event_participants FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Users can leave events" ON public.event_participants FOR DELETE USING (auth.uid() = profile_id);

-- Community Posts
CREATE POLICY "Posts are viewable by everyone" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can delete their own posts" ON public.community_posts FOR DELETE USING (auth.uid() = author_id);
