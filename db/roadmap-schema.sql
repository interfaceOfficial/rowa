-- ============================================================
-- Startup OS – Roadmap Schema
-- ============================================================

-- Roadmap Tasks
CREATE TABLE IF NOT EXISTS roadmap_tasks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id   UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  phase        VARCHAR(100) NOT NULL,
  phase_goal   TEXT,
  phase_order  INTEGER NOT NULL DEFAULT 999,
  title        VARCHAR(255) NOT NULL,
  description  TEXT,
  notes        TEXT,
  priority     VARCHAR(20) NOT NULL DEFAULT 'Medium'
               CHECK (priority IN ('High', 'Medium', 'Low')),
  status       VARCHAR(20) NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'in_progress', 'done', 'blocked')),
  start_date   DATE,
  end_date     DATE,
  position     INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER roadmap_tasks_updated_at
  BEFORE UPDATE ON roadmap_tasks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_roadmap_tasks_startup_id ON roadmap_tasks(startup_id);

-- Roadmap Task Documents
CREATE TABLE IF NOT EXISTS roadmap_documents (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id    UUID NOT NULL REFERENCES roadmap_tasks(id) ON DELETE CASCADE,
  name       VARCHAR(255) NOT NULL,
  file_path  TEXT NOT NULL,
  file_size  INTEGER,
  mime_type  VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roadmap_documents_task_id ON roadmap_documents(task_id);
