
-- ENUMS
CREATE TYPE user_role AS ENUM (
  'Super Admin', 
  'Admin', 
  'Editor', 
  'Content Manager', 
  'Bookings Manager', 
  'Marketing Manager', 
  'Customer Support', 
  'Viewer'
);

-- PROFILES
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  role user_role DEFAULT 'Viewer',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- FUNCTION TO AUTO-CREATE PROFILE
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'first_name', new.raw_user_meta_data->>'last_name', 'Viewer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- SHARED POLICIES (Assuming only Admins+ can insert/update/delete)
-- To keep it simple in this script, we'll create a function to check if user has admin-level access
CREATE OR REPLACE FUNCTION public.has_role(allowed_roles user_role[]) 
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = ANY(allowed_roles)
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- WEBSITE SETTINGS
CREATE TABLE website_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_name TEXT DEFAULT 'Certified Adventures',
  tagline TEXT,
  phone TEXT,
  email TEXT,
  whatsapp TEXT,
  facebook TEXT,
  instagram TEXT,
  youtube TEXT,
  tiktok TEXT,
  linkedin TEXT,
  address TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  footer_logo TEXT,
  hero_video TEXT,
  primary_color TEXT DEFAULT '#E67A3A',
  secondary_color TEXT DEFAULT '#29492F',
  accent_color TEXT DEFAULT '#08121B',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON website_settings FOR SELECT USING (true);
CREATE POLICY "Admin write" ON website_settings FOR ALL USING (has_role(ARRAY['Super Admin', 'Admin']::user_role[]));

-- HERO SLIDES
CREATE TABLE hero_slides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  button_text TEXT,
  button_link TEXT,
  secondary_button_text TEXT,
  secondary_button_link TEXT,
  image_url TEXT,
  overlay_opacity NUMERIC DEFAULT 0.5,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON hero_slides FOR SELECT USING (is_active = true);
CREATE POLICY "Admin read" ON hero_slides FOR SELECT USING (has_role(ARRAY['Super Admin', 'Admin', 'Editor', 'Content Manager']::user_role[]));
CREATE POLICY "Admin write" ON hero_slides FOR ALL USING (has_role(ARRAY['Super Admin', 'Admin', 'Editor', 'Content Manager']::user_role[]));

-- CATEGORIES
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON categories FOR SELECT USING (true);
CREATE POLICY "Admin write" ON categories FOR ALL USING (has_role(ARRAY['Super Admin', 'Admin', 'Editor', 'Content Manager']::user_role[]));

-- DESTINATIONS
CREATE TABLE destinations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  county TEXT,
  country TEXT DEFAULT 'Kenya',
  description TEXT,
  hero_image TEXT,
  gallery TEXT[],
  price_from NUMERIC,
  rating NUMERIC DEFAULT 5.0,
  featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON destinations FOR SELECT USING (active = true);
CREATE POLICY "Admin read" ON destinations FOR SELECT USING (has_role(ARRAY['Super Admin', 'Admin', 'Editor', 'Content Manager']::user_role[]));
CREATE POLICY "Admin write" ON destinations FOR ALL USING (has_role(ARRAY['Super Admin', 'Admin', 'Editor', 'Content Manager']::user_role[]));

-- TRAVEL PACKAGES
CREATE TABLE packages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC,
  duration TEXT,
  destination_id UUID REFERENCES destinations(id) ON DELETE CASCADE,
  image TEXT,
  featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON packages FOR SELECT USING (active = true);
CREATE POLICY "Admin read" ON packages FOR SELECT USING (has_role(ARRAY['Super Admin', 'Admin', 'Editor', 'Content Manager']::user_role[]));
CREATE POLICY "Admin write" ON packages FOR ALL USING (has_role(ARRAY['Super Admin', 'Admin', 'Editor', 'Content Manager']::user_role[]));

-- ROAD TRIPS
CREATE TABLE road_trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC,
  duration TEXT,
  image TEXT,
  featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE road_trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON road_trips FOR SELECT USING (active = true);
CREATE POLICY "Admin read" ON road_trips FOR SELECT USING (has_role(ARRAY['Super Admin', 'Admin', 'Editor', 'Content Manager']::user_role[]));
CREATE POLICY "Admin write" ON road_trips FOR ALL USING (has_role(ARRAY['Super Admin', 'Admin', 'Editor', 'Content Manager']::user_role[]));

-- GALLERY
CREATE TABLE gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  image_url TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON gallery FOR SELECT USING (true);
CREATE POLICY "Admin write" ON gallery FOR ALL USING (has_role(ARRAY['Super Admin', 'Admin', 'Editor', 'Content Manager']::user_role[]));

-- TESTIMONIALS
CREATE TABLE testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  content TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  avatar_url TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON testimonials FOR SELECT USING (is_published = true);
CREATE POLICY "Admin read" ON testimonials FOR SELECT USING (has_role(ARRAY['Super Admin', 'Admin', 'Editor', 'Content Manager', 'Marketing Manager']::user_role[]));
CREATE POLICY "Admin write" ON testimonials FOR ALL USING (has_role(ARRAY['Super Admin', 'Admin', 'Editor', 'Content Manager', 'Marketing Manager']::user_role[]));

-- FAQS
CREATE TABLE faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON faqs FOR SELECT USING (is_active = true);
CREATE POLICY "Admin read" ON faqs FOR SELECT USING (has_role(ARRAY['Super Admin', 'Admin', 'Editor', 'Content Manager']::user_role[]));
CREATE POLICY "Admin write" ON faqs FOR ALL USING (has_role(ARRAY['Super Admin', 'Admin', 'Editor', 'Content Manager']::user_role[]));

-- TEAM MEMBERS
CREATE TABLE team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  image_url TEXT,
  facebook TEXT,
  twitter TEXT,
  instagram TEXT,
  linkedin TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON team_members FOR SELECT USING (is_active = true);
CREATE POLICY "Admin read" ON team_members FOR SELECT USING (has_role(ARRAY['Super Admin', 'Admin', 'Editor', 'Content Manager']::user_role[]));
CREATE POLICY "Admin write" ON team_members FOR ALL USING (has_role(ARRAY['Super Admin', 'Admin', 'Editor', 'Content Manager']::user_role[]));

-- BLOG POSTS
CREATE TABLE blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON blog_posts FOR SELECT USING (is_published = true);
CREATE POLICY "Admin read" ON blog_posts FOR SELECT USING (has_role(ARRAY['Super Admin', 'Admin', 'Editor', 'Content Manager', 'Marketing Manager']::user_role[]));
CREATE POLICY "Admin write" ON blog_posts FOR ALL USING (has_role(ARRAY['Super Admin', 'Admin', 'Editor', 'Content Manager', 'Marketing Manager']::user_role[]));

-- PARTNERS
CREATE TABLE partners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON partners FOR SELECT USING (is_active = true);
CREATE POLICY "Admin read" ON partners FOR SELECT USING (has_role(ARRAY['Super Admin', 'Admin', 'Editor', 'Content Manager']::user_role[]));
CREATE POLICY "Admin write" ON partners FOR ALL USING (has_role(ARRAY['Super Admin', 'Admin', 'Editor', 'Content Manager']::user_role[]));

-- SPONSORS
CREATE TABLE sponsors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON sponsors FOR SELECT USING (is_active = true);
CREATE POLICY "Admin read" ON sponsors FOR SELECT USING (has_role(ARRAY['Super Admin', 'Admin', 'Editor', 'Content Manager']::user_role[]));
CREATE POLICY "Admin write" ON sponsors FOR ALL USING (has_role(ARRAY['Super Admin', 'Admin', 'Editor', 'Content Manager']::user_role[]));

-- EVENTS
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  location TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON events FOR SELECT USING (is_active = true);
CREATE POLICY "Admin read" ON events FOR SELECT USING (has_role(ARRAY['Super Admin', 'Admin', 'Editor', 'Content Manager']::user_role[]));
CREATE POLICY "Admin write" ON events FOR ALL USING (has_role(ARRAY['Super Admin', 'Admin', 'Editor', 'Content Manager']::user_role[]));

-- BOOKINGS
CREATE TYPE booking_status AS ENUM ('pending', 'approved', 'rejected', 'paid', 'cancelled');
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
  road_trip_id UUID REFERENCES road_trips(id) ON DELETE SET NULL,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  date DATE NOT NULL,
  guests INTEGER DEFAULT 1,
  total_amount NUMERIC,
  status booking_status DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
-- Users can read own bookings
CREATE POLICY "Users can read own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read" ON bookings FOR SELECT USING (has_role(ARRAY['Super Admin', 'Admin', 'Bookings Manager', 'Customer Support']::user_role[]));
CREATE POLICY "Admin write" ON bookings FOR UPDATE USING (has_role(ARRAY['Super Admin', 'Admin', 'Bookings Manager', 'Customer Support']::user_role[]));
CREATE POLICY "Admin delete" ON bookings FOR DELETE USING (has_role(ARRAY['Super Admin', 'Admin']::user_role[]));

-- NEWSLETTER SUBSCRIBERS
CREATE TABLE newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert" ON newsletter_subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read" ON newsletter_subscribers FOR SELECT USING (has_role(ARRAY['Super Admin', 'Admin', 'Marketing Manager']::user_role[]));
CREATE POLICY "Admin write" ON newsletter_subscribers FOR ALL USING (has_role(ARRAY['Super Admin', 'Admin', 'Marketing Manager']::user_role[]));

-- CONTACT MESSAGES
CREATE TYPE message_status AS ENUM ('unread', 'read', 'replied');
CREATE TABLE contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status message_status DEFAULT 'unread',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read" ON contact_messages FOR SELECT USING (has_role(ARRAY['Super Admin', 'Admin', 'Customer Support']::user_role[]));
CREATE POLICY "Admin write" ON contact_messages FOR ALL USING (has_role(ARRAY['Super Admin', 'Admin', 'Customer Support']::user_role[]));

-- REALTIME REPLICATION
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE hero_slides, packages, road_trips, gallery, testimonials, events, destinations, website_settings;

-- STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('hero-images', 'hero-images', true),
  ('destination-images', 'destination-images', true),
  ('trip-images', 'trip-images', true),
  ('gallery-images', 'gallery-images', true),
  ('package-images', 'package-images', true),
  ('team-images', 'team-images', true),
  ('testimonial-images', 'testimonial-images', true),
  ('blog-images', 'blog-images', true),
  ('event-images', 'event-images', true),
  ('sponsor-images', 'sponsor-images', true),
  ('partner-logos', 'partner-logos', true),
  ('website-assets', 'website-assets', true),
  ('logos', 'logos', true),
  ('icons', 'icons', true),
  ('documents', 'documents', true),
  ('videos', 'videos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- STORAGE POLICIES
-- Public Read for all these buckets
CREATE POLICY "Public read all buckets" ON storage.objects FOR SELECT USING (bucket_id IN ('hero-images', 'destination-images', 'trip-images', 'gallery-images', 'package-images', 'team-images', 'testimonial-images', 'blog-images', 'event-images', 'sponsor-images', 'partner-logos', 'website-assets', 'logos', 'icons', 'documents', 'videos'));

-- Admin write for all these buckets
CREATE POLICY "Admin write all buckets" ON storage.objects FOR ALL USING (
  has_role(ARRAY['Super Admin', 'Admin', 'Editor', 'Content Manager', 'Marketing Manager']::user_role[])
);

-- TRIGGERS FOR UPDATED_AT
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_profiles BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_website_settings BEFORE UPDATE ON website_settings FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_hero_slides BEFORE UPDATE ON hero_slides FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_categories BEFORE UPDATE ON categories FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_destinations BEFORE UPDATE ON destinations FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_packages BEFORE UPDATE ON packages FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_road_trips BEFORE UPDATE ON road_trips FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_gallery BEFORE UPDATE ON gallery FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_testimonials BEFORE UPDATE ON testimonials FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_faqs BEFORE UPDATE ON faqs FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_team_members BEFORE UPDATE ON team_members FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_blog_posts BEFORE UPDATE ON blog_posts FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_partners BEFORE UPDATE ON partners FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_sponsors BEFORE UPDATE ON sponsors FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_events BEFORE UPDATE ON events FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
CREATE TRIGGER set_timestamp_bookings BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- Fix bookings permissions for anonymous users
DROP POLICY IF EXISTS "Users can create bookings" ON bookings;
CREATE POLICY "Public can create bookings" ON bookings FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Storage Buckets for Media Library
INSERT INTO storage.buckets (id, name, public) VALUES 
('hero-images', 'hero-images', true),
('gallery-images', 'gallery-images', true),
('destination-images', 'destination-images', true),
('trip-images', 'trip-images', true),
('package-images', 'package-images', true),
('team-images', 'team-images', true),
('blog-images', 'blog-images', true),
('website-assets', 'website-assets', true),
('logos', 'logos', true),
('videos', 'videos', true),
('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies (Public Read, Admin Write)
-- We'll allow public to read all of these
CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT TO public USING (bucket_id IN (
  'hero-images', 'gallery-images', 'destination-images', 'trip-images', 
  'package-images', 'team-images', 'blog-images', 'website-assets', 
  'logos', 'videos', 'documents'
));

CREATE POLICY "Admin Insert Access" ON storage.objects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admin Update Access" ON storage.objects FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Admin Delete Access" ON storage.objects FOR DELETE TO authenticated USING (true);

-- Media Files Table
CREATE TABLE media_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  bucket_name TEXT NOT NULL,
  public_url TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  file_size BIGINT,
  mime_type TEXT,
  alt_text TEXT,
  category TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read media_files" ON media_files FOR SELECT TO public USING (true);
CREATE POLICY "Authenticated insert media_files" ON media_files FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated update media_files" ON media_files FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated delete media_files" ON media_files FOR DELETE TO authenticated USING (true);
-- Allow anon to upload files and write to media_files for the admin panel in development
DROP POLICY IF EXISTS "Authenticated insert media_files" ON media_files;
DROP POLICY IF EXISTS "Authenticated update media_files" ON media_files;
DROP POLICY IF EXISTS "Authenticated delete media_files" ON media_files;

CREATE POLICY "Public insert media_files" ON media_files FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public update media_files" ON media_files FOR UPDATE TO public USING (true);
CREATE POLICY "Public delete media_files" ON media_files FOR DELETE TO public USING (true);

DROP POLICY IF EXISTS "Admin Insert Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Access" ON storage.objects;

CREATE POLICY "Public Insert Access" ON storage.objects FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public Update Access" ON storage.objects FOR UPDATE TO public USING (true);
CREATE POLICY "Public Delete Access" ON storage.objects FOR DELETE TO public USING (true);
-- DEVELOPMENT ONLY: Allow public access to all tables so the admin panel works without login
CREATE POLICY "Public full access hero_slides" ON hero_slides FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public full access packages" ON packages FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public full access road_trips" ON road_trips FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public full access gallery" ON gallery FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public full access testimonials" ON testimonials FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public full access events" ON events FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public full access destinations" ON destinations FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public full access contact_messages" ON contact_messages FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public full access bookings" ON bookings FOR ALL TO public USING (true) WITH CHECK (true);
CREATE POLICY "Public full access media_files" ON media_files FOR ALL TO public USING (true) WITH CHECK (true);

-- Allow public access to all storage buckets
CREATE POLICY "Public Storage full access" ON storage.objects FOR ALL TO public USING (true) WITH CHECK (true);

-- MERCH
CREATE TABLE merch (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE merch ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON merch FOR SELECT USING (is_active = true);
CREATE POLICY "Admin write" ON merch FOR ALL USING (has_role(ARRAY['Super Admin', 'Admin', 'Editor', 'Content Manager']::user_role[]));
CREATE POLICY "Public full access merch" ON merch FOR ALL TO public USING (true) WITH CHECK (true);
CREATE TRIGGER set_timestamp_merch BEFORE UPDATE ON merch FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

INSERT INTO storage.buckets (id, name, public) VALUES ('merch-images', 'merch-images', true) ON CONFLICT (id) DO UPDATE SET public = true;
