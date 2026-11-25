-- ============================================================================
-- CERTIFIED ADVENTURES — SECURE, ATOMIC, FREE-TIER OPTIMIZED VOTING MIGRATION
-- Non-destructive & idempotent: preserves all existing votes and reconciles tallies.
-- ============================================================================

-- 1. Ensure votes table exists with strict uniqueness constraints
CREATE TABLE IF NOT EXISTS public.culture_poll_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id TEXT NOT NULL,
  option_id TEXT NOT NULL,
  voter_token TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (poll_id, voter_token)
);

ALTER TABLE public.culture_poll_votes
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Enforce 1 vote per authenticated user per poll as well as 1 vote per voter_token per poll
CREATE UNIQUE INDEX IF NOT EXISTS culture_poll_votes_poll_user_idx
  ON public.culture_poll_votes (poll_id, user_id)
  WHERE user_id IS NOT NULL;

-- Fast lookup indexes for tallies, voter verification, and cross-device sync
CREATE INDEX IF NOT EXISTS culture_poll_votes_poll_option_idx
  ON public.culture_poll_votes (poll_id, option_id);

CREATE INDEX IF NOT EXISTS culture_poll_votes_voter_token_idx
  ON public.culture_poll_votes (voter_token);

CREATE INDEX IF NOT EXISTS culture_poll_votes_user_idx
  ON public.culture_poll_votes (user_id)
  WHERE user_id IS NOT NULL;

-- 2. Lightweight pre-aggregated tally table (eliminates full-table downloads & 1,000-row cap)
CREATE TABLE IF NOT EXISTS public.culture_poll_tallies (
  poll_id TEXT NOT NULL,
  option_id TEXT NOT NULL,
  vote_count BIGINT NOT NULL DEFAULT 0 CHECK (vote_count >= 0),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (poll_id, option_id)
);

-- 3. Non-destructive backfill/reconciliation from existing legitimate votes
INSERT INTO public.culture_poll_tallies (poll_id, option_id, vote_count, updated_at)
SELECT poll_id, option_id, COUNT(*)::BIGINT, NOW()
FROM public.culture_poll_votes
GROUP BY poll_id, option_id
ON CONFLICT (poll_id, option_id)
DO UPDATE SET
  vote_count = EXCLUDED.vote_count,
  updated_at = NOW();

-- 4. Atomic trigger keeping culture_poll_tallies reconciled with culture_poll_votes
CREATE OR REPLACE FUNCTION public.sync_culture_poll_tallies()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.culture_poll_tallies (poll_id, option_id, vote_count, updated_at)
    VALUES (NEW.poll_id, NEW.option_id, 1, NOW())
    ON CONFLICT (poll_id, option_id)
    DO UPDATE SET
      vote_count = public.culture_poll_tallies.vote_count + 1,
      updated_at = NOW();
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.culture_poll_tallies
    SET vote_count = GREATEST(vote_count - 1, 0),
        updated_at = NOW()
    WHERE poll_id = OLD.poll_id AND option_id = OLD.option_id;
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    IF (OLD.poll_id IS DISTINCT FROM NEW.poll_id OR OLD.option_id IS DISTINCT FROM NEW.option_id) THEN
      UPDATE public.culture_poll_tallies
      SET vote_count = GREATEST(vote_count - 1, 0),
          updated_at = NOW()
      WHERE poll_id = OLD.poll_id AND option_id = OLD.option_id;

      INSERT INTO public.culture_poll_tallies (poll_id, option_id, vote_count, updated_at)
      VALUES (NEW.poll_id, NEW.option_id, 1, NOW())
      ON CONFLICT (poll_id, option_id)
      DO UPDATE SET
        vote_count = public.culture_poll_tallies.vote_count + 1,
        updated_at = NOW();
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_culture_poll_tallies ON public.culture_poll_votes;
CREATE TRIGGER trg_sync_culture_poll_tallies
  AFTER INSERT OR UPDATE OR DELETE ON public.culture_poll_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_culture_poll_tallies();

-- 5. Transactional, server-validated vote submission RPC
CREATE OR REPLACE FUNCTION public.cast_culture_vote(
  p_poll_id TEXT,
  p_option_id TEXT,
  p_voter_token TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_poll_id TEXT := trim(COALESCE(p_poll_id, ''));
  v_option_id TEXT := trim(COALESCE(p_option_id, ''));
  v_token TEXT := trim(COALESCE(p_voter_token, ''));
  v_user_id UUID := auth.uid();
  v_raw_desc TEXT;
  v_polls JSONB;
  v_poll JSONB;
  v_closes_at TIMESTAMPTZ;
  v_existing_option TEXT;
  v_tallies JSONB;
BEGIN
  IF char_length(v_poll_id) = 0 OR char_length(v_option_id) = 0 THEN
    RETURN jsonb_build_object('ok', false, 'invalid_option', true, 'error', 'Poll and option are required.');
  END IF;

  IF char_length(v_token) < 8 OR char_length(v_token) > 128 THEN
    RETURN jsonb_build_object('ok', false, 'invalid_token', true, 'error', 'Invalid voter session token.');
  END IF;

  SELECT description INTO v_raw_desc
  FROM public.categories
  WHERE slug = 'homepage-culture-polls'
  LIMIT 1;

  IF v_raw_desc IS NULL OR char_length(trim(v_raw_desc)) = 0 THEN
    RETURN jsonb_build_object('ok', false, 'invalid_poll', true, 'error', 'No active polls found.');
  END IF;

  BEGIN
    v_polls := v_raw_desc::jsonb;
  EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object('ok', false, 'invalid_poll', true, 'error', 'Poll configuration is invalid.');
  END;

  IF jsonb_typeof(v_polls) <> 'array' THEN
    RETURN jsonb_build_object('ok', false, 'invalid_poll', true, 'error', 'Poll configuration is invalid.');
  END IF;

  SELECT elem INTO v_poll
  FROM jsonb_array_elements(v_polls) AS elem
  WHERE elem->>'id' = v_poll_id
  LIMIT 1;

  IF v_poll IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'invalid_poll', true, 'error', 'Poll not found.');
  END IF;

  -- Server-side active & status check
  IF COALESCE(v_poll->>'is_active', 'true') = 'false' OR COALESCE(v_poll->>'status', '') = 'closed' THEN
    RETURN jsonb_build_object('ok', false, 'expired', true, 'error', 'This poll is closed.');
  END IF;

  -- Server-side UTC deadline check (cannot be bypassed by client clock manipulation)
  IF NULLIF(trim(COALESCE(v_poll->>'closes_at', '')), '') IS NOT NULL THEN
    BEGIN
      v_closes_at := (v_poll->>'closes_at')::timestamptz;
      IF NOW() >= v_closes_at THEN
        RETURN jsonb_build_object('ok', false, 'expired', true, 'error', 'Voting deadline has passed.');
      END IF;
    EXCEPTION WHEN OTHERS THEN
      -- Ignore malformed optional timestamp rather than breaking active poll
      NULL;
    END;
  END IF;

  -- Server-side option membership check
  IF NOT EXISTS (
    SELECT 1
    FROM jsonb_array_elements(COALESCE(v_poll->'options', '[]'::jsonb)) AS opt
    WHERE opt->>'id' = v_option_id
      AND char_length(trim(COALESCE(opt->>'title', ''))) > 0
  ) THEN
    RETURN jsonb_build_object('ok', false, 'invalid_option', true, 'error', 'Invalid voting option.');
  END IF;

  -- Check if this voter (token or authenticated user) has already voted in this poll
  SELECT option_id INTO v_existing_option
  FROM public.culture_poll_votes
  WHERE poll_id = v_poll_id
    AND (
      voter_token = v_token
      OR (v_user_id IS NOT NULL AND user_id = v_user_id)
    )
  LIMIT 1;

  IF v_existing_option IS NOT NULL THEN
    SELECT COALESCE(
      jsonb_agg(jsonb_build_object('poll_id', poll_id, 'option_id', option_id, 'vote_count', vote_count)),
      '[]'::jsonb
    ) INTO v_tallies
    FROM public.culture_poll_tallies
    WHERE poll_id = v_poll_id;

    RETURN jsonb_build_object(
      'ok', false,
      'already_voted', true,
      'voted_option_id', v_existing_option,
      'tallies', v_tallies
    );
  END IF;

  -- Insert atomically; trigger increments culture_poll_tallies in the same transaction
  BEGIN
    INSERT INTO public.culture_poll_votes (poll_id, option_id, voter_token, user_id)
    VALUES (v_poll_id, v_option_id, v_token, v_user_id);
  EXCEPTION WHEN unique_violation THEN
    SELECT option_id INTO v_existing_option
    FROM public.culture_poll_votes
    WHERE poll_id = v_poll_id
      AND (
        voter_token = v_token
        OR (v_user_id IS NOT NULL AND user_id = v_user_id)
      )
    LIMIT 1;

    SELECT COALESCE(
      jsonb_agg(jsonb_build_object('poll_id', poll_id, 'option_id', option_id, 'vote_count', vote_count)),
      '[]'::jsonb
    ) INTO v_tallies
    FROM public.culture_poll_tallies
    WHERE poll_id = v_poll_id;

    RETURN jsonb_build_object(
      'ok', false,
      'already_voted', true,
      'voted_option_id', COALESCE(v_existing_option, v_option_id),
      'tallies', v_tallies
    );
  END;

  SELECT COALESCE(
    jsonb_agg(jsonb_build_object('poll_id', poll_id, 'option_id', option_id, 'vote_count', vote_count)),
    '[]'::jsonb
  ) INTO v_tallies
  FROM public.culture_poll_tallies
  WHERE poll_id = v_poll_id;

  RETURN jsonb_build_object(
    'ok', true,
    'already_voted', false,
    'voted_option_id', v_option_id,
    'tallies', v_tallies
  );
END;
$$;

-- 6. Lightweight public tally + caller-own-votes reader (zero raw voter exposure)
CREATE OR REPLACE FUNCTION public.get_culture_poll_state(p_voter_token TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token TEXT := NULLIF(trim(COALESCE(p_voter_token, '')), '');
  v_user_id UUID := auth.uid();
  v_tallies JSONB;
  v_my_votes JSONB;
BEGIN
  SELECT COALESCE(
    jsonb_agg(jsonb_build_object('poll_id', poll_id, 'option_id', option_id, 'vote_count', vote_count)),
    '[]'::jsonb
  ) INTO v_tallies
  FROM public.culture_poll_tallies;

  IF (v_token IS NOT NULL AND char_length(v_token) >= 8) OR v_user_id IS NOT NULL THEN
    SELECT COALESCE(jsonb_object_agg(poll_id, option_id), '{}'::jsonb)
    INTO v_my_votes
    FROM (
      SELECT DISTINCT ON (poll_id) poll_id, option_id
      FROM public.culture_poll_votes
      WHERE (v_token IS NOT NULL AND char_length(v_token) >= 8 AND voter_token = v_token)
         OR (v_user_id IS NOT NULL AND user_id = v_user_id)
      ORDER BY poll_id, created_at ASC
    ) s;
  ELSE
    v_my_votes := '{}'::jsonb;
  END IF;

  RETURN jsonb_build_object(
    'tallies', v_tallies,
    'my_votes', v_my_votes
  );
END;
$$;

-- 7. Admin-only poll vote reset & tally reconciliation functions
CREATE OR REPLACE FUNCTION public.reset_culture_poll_votes(p_poll_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin BOOLEAN := false;
  v_poll_id TEXT := trim(COALESCE(p_poll_id, ''));
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role::text IN ('Super Admin', 'Admin')
  ) INTO v_is_admin;

  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Only administrators can reset poll votes.' USING ERRCODE = '42501';
  END IF;

  DELETE FROM public.culture_poll_votes WHERE poll_id = v_poll_id;
  DELETE FROM public.culture_poll_tallies WHERE poll_id = v_poll_id;

  RETURN jsonb_build_object('ok', true, 'poll_id', v_poll_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.reconcile_culture_poll_tallies()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_admin BOOLEAN := false;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role::text IN ('Super Admin', 'Admin')
  ) INTO v_is_admin;

  IF NOT v_is_admin AND current_user NOT IN ('postgres', 'supabase_admin') THEN
    RAISE EXCEPTION 'Only administrators can reconcile poll tallies.' USING ERRCODE = '42501';
  END IF;

  DELETE FROM public.culture_poll_tallies t
  WHERE NOT EXISTS (
    SELECT 1 FROM public.culture_poll_votes v
    WHERE v.poll_id = t.poll_id AND v.option_id = t.option_id
  );

  INSERT INTO public.culture_poll_tallies (poll_id, option_id, vote_count, updated_at)
  SELECT poll_id, option_id, COUNT(*)::BIGINT, NOW()
  FROM public.culture_poll_votes
  GROUP BY poll_id, option_id
  ON CONFLICT (poll_id, option_id)
  DO UPDATE SET
    vote_count = EXCLUDED.vote_count,
    updated_at = NOW();

  RETURN jsonb_build_object('ok', true);
END;
$$;

-- 8. Lock down RLS on culture_poll_votes & culture_poll_tallies
ALTER TABLE public.culture_poll_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.culture_poll_tallies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read culture_poll_votes" ON public.culture_poll_votes;
DROP POLICY IF EXISTS "Public insert culture_poll_votes" ON public.culture_poll_votes;
DROP POLICY IF EXISTS "Public update culture_poll_votes" ON public.culture_poll_votes;
DROP POLICY IF EXISTS "Public delete culture_poll_votes" ON public.culture_poll_votes;
DROP POLICY IF EXISTS "Admin delete culture_poll_votes" ON public.culture_poll_votes;
DROP POLICY IF EXISTS "Admin read culture_poll_votes" ON public.culture_poll_votes;

-- Only Admins can read or delete raw vote rows; public interacts strictly via RPC & tallies
CREATE POLICY "Admin read culture_poll_votes"
  ON public.culture_poll_votes FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role::text IN ('Super Admin', 'Admin')
    )
  );

CREATE POLICY "Admin delete culture_poll_votes"
  ON public.culture_poll_votes FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role::text IN ('Super Admin', 'Admin')
    )
  );

DROP POLICY IF EXISTS "Public read culture_poll_tallies" ON public.culture_poll_tallies;
CREATE POLICY "Public read culture_poll_tallies"
  ON public.culture_poll_tallies FOR SELECT TO public
  USING (true);

GRANT EXECUTE ON FUNCTION public.cast_culture_vote(TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_culture_poll_state(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reset_culture_poll_votes(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.reconcile_culture_poll_tallies() TO authenticated;

-- 9. Remove high-churn tables from supabase_realtime CDC to save Free-tier WAL/CPU
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime DROP TABLE public.culture_poll_votes;
EXCEPTION
  WHEN undefined_object THEN NULL;
  WHEN invalid_parameter_value THEN NULL;
END $$;
