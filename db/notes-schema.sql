-- ============================================================
-- Startup OS – Notes Schema
-- ============================================================

-- Note Folders
CREATE TABLE IF NOT EXISTS note_folders (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  parent_id  UUID REFERENCES note_folders(id) ON DELETE CASCADE,
  name       VARCHAR(255) NOT NULL,
  position   INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER note_folders_updated_at
  BEFORE UPDATE ON note_folders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_note_folders_startup_id ON note_folders(startup_id);
CREATE INDEX IF NOT EXISTS idx_note_folders_parent_id  ON note_folders(parent_id);

-- Notes
CREATE TABLE IF NOT EXISTS notes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id UUID NOT NULL REFERENCES startups(id) ON DELETE CASCADE,
  folder_id  UUID REFERENCES note_folders(id) ON DELETE SET NULL,
  title      VARCHAR(255) NOT NULL DEFAULT 'Neue Notiz',
  content    TEXT NOT NULL DEFAULT '',
  position   INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_notes_startup_id ON notes(startup_id);
CREATE INDEX IF NOT EXISTS idx_notes_folder_id  ON notes(folder_id);
