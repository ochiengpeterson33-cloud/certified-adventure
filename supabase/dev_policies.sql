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
