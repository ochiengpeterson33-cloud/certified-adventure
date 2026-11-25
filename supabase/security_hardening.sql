-- ============================================================================
-- CERTIFIED ADVENTURES — PRODUCTION RLS & ROLE ESCALATION SECURITY HARDENING
-- Non-destructive & idempotent: removes permissive dev policies and secures PII/Admin tables.
-- ============================================================================

-- 1. Remove dangerous development-only "Public full access" policies if present
DROP POLICY IF EXISTS "Public full access hero_slides" ON public.hero_slides;
DROP POLICY IF EXISTS "Public full access packages" ON public.packages;
DROP POLICY IF EXISTS "Public full access road_trips" ON public.road_trips;
DROP POLICY IF EXISTS "Public full access gallery" ON public.gallery;
DROP POLICY IF EXISTS "Public full access testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Public full access events" ON public.events;
DROP POLICY IF EXISTS "Public full access destinations" ON public.destinations;
DROP POLICY IF EXISTS "Public full access contact_messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Public full access bookings" ON public.bookings;
DROP POLICY IF EXISTS "Public full access media_files" ON public.media_files;
DROP POLICY IF EXISTS "Public full access merch" ON public.merch;

DROP POLICY IF EXISTS "Public insert media_files" ON public.media_files;
DROP POLICY IF EXISTS "Public update media_files" ON public.media_files;
DROP POLICY IF EXISTS "Public delete media_files" ON public.media_files;
DROP POLICY IF EXISTS "Authenticated insert media_files" ON public.media_files;
DROP POLICY IF EXISTS "Authenticated update media_files" ON public.media_files;
DROP POLICY IF EXISTS "Authenticated delete media_files" ON public.media_files;
DROP POLICY IF EXISTS "Admin write media_files" ON public.media_files;

DROP POLICY IF EXISTS "Public Storage full access" ON storage.objects;
DROP POLICY IF EXISTS "Public Insert Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Access" ON storage.objects;

-- 2. Restore strict Admin/Content role write protection on media_files & storage.objects
CREATE POLICY "Admin write media_files"
  ON public.media_files FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role::text IN ('Super Admin', 'Admin', 'Editor', 'Content Manager', 'Marketing Manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role::text IN ('Super Admin', 'Admin', 'Editor', 'Content Manager', 'Marketing Manager')
    )
  );

DROP POLICY IF EXISTS "Admin write all buckets" ON storage.objects;
CREATE POLICY "Admin write all buckets"
  ON storage.objects FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role::text IN ('Super Admin', 'Admin', 'Editor', 'Content Manager', 'Marketing Manager')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role::text IN ('Super Admin', 'Admin', 'Editor', 'Content Manager', 'Marketing Manager')
    )
  );

-- 3. Prevent self-privilege escalation on profiles (users cannot promote themselves to Admin)
CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_caller_is_admin BOOLEAN := false;
BEGIN
  -- Allow database superuser / Auth signup trigger context (no active JWT)
  IF auth.uid() IS NULL OR current_user IN ('postgres', 'supabase_admin', 'supabase_auth_admin') THEN
    RETURN NEW;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role::text IN ('Super Admin', 'Admin')
  ) INTO v_caller_is_admin;

  IF NOT v_caller_is_admin THEN
    IF TG_OP = 'INSERT' THEN
      NEW.role := 'Viewer';
    ELSIF TG_OP = 'UPDATE' AND NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Only administrators may change user roles.' USING ERRCODE = '42501';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_profile_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_role_escalation
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_role_escalation();

DROP POLICY IF EXISTS "Users can insert own profile." ON public.profiles;
CREATE POLICY "Users can insert own profile."
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update any profile." ON public.profiles;
CREATE POLICY "Admins can update any profile."
  ON public.profiles FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role::text IN ('Super Admin', 'Admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role::text IN ('Super Admin', 'Admin')
    )
  );

-- 4. Tighten bookings & contact_messages INSERT checks so malformed payloads are rejected
DROP POLICY IF EXISTS "Public can create bookings" ON public.bookings;
CREATE POLICY "Public can create bookings"
  ON public.bookings FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(trim(COALESCE(first_name, ''))) > 0 AND
    char_length(trim(COALESCE(email, ''))) > 3 AND
    char_length(trim(COALESCE(phone, ''))) >= 6 AND
    COALESCE(guests, 1) BETWEEN 1 AND 200
  );

DROP POLICY IF EXISTS "Public insert" ON public.contact_messages;
CREATE POLICY "Public insert"
  ON public.contact_messages FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(trim(COALESCE(name, ''))) > 0 AND
    char_length(trim(COALESCE(email, ''))) > 3 AND
    char_length(trim(COALESCE(message, ''))) > 0
  );

-- 5. Trim realtime publication on high-churn / static public tables to preserve Free-tier quotas
DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'public.hero_slides',
    'public.packages',
    'public.road_trips',
    'public.gallery',
    'public.testimonials',
    'public.events',
    'public.destinations',
    'public.website_settings',
    'public.categories',
    'public.culture_poll_votes'
  ]
  LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime DROP TABLE %s', t);
    EXCEPTION
      WHEN undefined_object THEN NULL;
      WHEN invalid_parameter_value THEN NULL;
    END;
  END LOOP;
END $$;
