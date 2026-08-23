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
