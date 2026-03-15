-- ============================================================
-- Startup OS – Database Schema (MVP)
-- ============================================================

-- Startups
-- Note: user_id hat keinen FK auf users solange Auth noch nicht integriert ist
CREATE TABLE IF NOT EXISTS startups (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL,
  name           VARCHAR(255) NOT NULL,
  industry       VARCHAR(100) NOT NULL,
  business_model VARCHAR(100) NOT NULL,
  stage          VARCHAR(50)  NOT NULL CHECK (stage IN ('idea', 'mvp', 'growth')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER startups_updated_at
  BEFORE UPDATE ON startups
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_startups_user_id ON startups(user_id);
