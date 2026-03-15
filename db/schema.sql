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

-- Tasks (Kanban)
CREATE TABLE IF NOT EXISTS tasks (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  title       VARCHAR(255) NOT NULL,
  description TEXT,
  tags        TEXT[] NOT NULL DEFAULT '{}',
  due_date   DATE,
  status     VARCHAR(50) NOT NULL DEFAULT 'ideen'
             CHECK (status IN ('ideen', 'backlog', 'working', 'onhold', 'done')),
  position   INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_tasks_startup_id ON tasks(startup_id);
