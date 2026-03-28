-- Newsletter/email subscribers from footer signup
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscribers_created_at ON subscribers(created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscribers_email_lower ON subscribers(LOWER(TRIM(email)));
