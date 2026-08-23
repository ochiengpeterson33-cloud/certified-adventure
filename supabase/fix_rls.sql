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
