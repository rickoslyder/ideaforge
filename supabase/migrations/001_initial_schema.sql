-- IdeaForge Database Schema
-- Run this migration in Supabase SQL editor

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  default_model TEXT DEFAULT 'gemini/gemini-2.5-flash-preview-05-20',
  theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_preferences_clerk_id ON user_preferences(clerk_user_id);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  initial_idea TEXT,
  current_phase TEXT DEFAULT 'request' CHECK (current_phase IN ('request', 'spec', 'plan')),
  request_content TEXT,
  spec_content TEXT,
  spec_config JSONB,
  plan_content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  local_id TEXT,
  sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'conflict')),
  last_synced_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_projects_sync ON projects(sync_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_projects_updated ON projects(updated_at);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase TEXT NOT NULL CHECK (phase IN ('request', 'spec', 'plan')),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  model TEXT,
  provider TEXT,
  input_tokens INTEGER,
  output_tokens INTEGER,
  cost DECIMAL(10, 6),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  local_id TEXT,
  sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending'))
);

CREATE INDEX IF NOT EXISTS idx_messages_project_phase ON messages(project_id, phase);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);

-- Attachments Table
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('file', 'url', 'text')),
  name TEXT NOT NULL,
  original_filename TEXT,
  mime_type TEXT,
  size_bytes INTEGER,
  storage_path TEXT,
  source_url TEXT,
  extracted_content TEXT,
  extraction_status TEXT DEFAULT 'pending' CHECK (extraction_status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  local_id TEXT,
  sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending'))
);

CREATE INDEX IF NOT EXISTS idx_attachments_project ON attachments(project_id);

-- API Keys Table (encrypted)
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic', 'google', 'ollama', 'custom')),
  name TEXT,
  encrypted_key TEXT NOT NULL,
  endpoint_url TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_api_keys_user_provider ON api_keys(clerk_user_id, provider, name);
CREATE INDEX IF NOT EXISTS idx_api_keys_user ON api_keys(clerk_user_id);

-- Project Snapshots Table
CREATE TABLE IF NOT EXISTS project_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  trigger TEXT NOT NULL CHECK (trigger IN ('auto', 'manual')),
  phase_at_snapshot TEXT NOT NULL CHECK (phase_at_snapshot IN ('request', 'spec', 'plan')),
  snapshot_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_snapshots_project ON project_snapshots(project_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_created ON project_snapshots(created_at DESC);

-- Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_snapshots ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies should be created based on your auth setup
-- These are placeholder policies - adjust based on how Clerk user ID is passed

-- For service role access (used by the app server), RLS is bypassed
-- For direct client access, you would need to set up proper policies

-- Example placeholder policies (uncomment and adjust as needed):
-- CREATE POLICY "Users can view own preferences" ON user_preferences
--   FOR SELECT USING (clerk_user_id = current_setting('app.clerk_user_id', true));

-- CREATE POLICY "Users can view own projects" ON projects
--   FOR SELECT USING (clerk_user_id = current_setting('app.clerk_user_id', true));
