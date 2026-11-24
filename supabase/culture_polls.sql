-- Culture Polls public voting storage with strict one-vote-per-user constraints
CREATE TABLE IF NOT EXISTS culture_poll_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id TEXT NOT NULL,
  option_id TEXT NOT NULL,
  voter_token TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (poll_id, voter_token)
);

ALTER TABLE culture_poll_votes ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS culture_poll_votes_poll_user_idx
  ON culture_poll_votes (poll_id, user_id)
  WHERE user_id IS NOT NULL;

ALTER TABLE culture_poll_votes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read culture_poll_votes" ON culture_poll_votes;
DROP POLICY IF EXISTS "Public insert culture_poll_votes" ON culture_poll_votes;
DROP POLICY IF EXISTS "Public update culture_poll_votes" ON culture_poll_votes;
DROP POLICY IF EXISTS "Public delete culture_poll_votes" ON culture_poll_votes;

CREATE POLICY "Public read culture_poll_votes"
  ON culture_poll_votes FOR SELECT TO public USING (true);

CREATE POLICY "Public insert culture_poll_votes"
  ON culture_poll_votes FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(trim(poll_id)) > 0 AND
    char_length(trim(option_id)) > 0 AND
    char_length(trim(voter_token)) >= 8
  );

CREATE POLICY "Admin delete culture_poll_votes"
  ON culture_poll_votes FOR DELETE TO authenticated USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE culture_poll_votes;
