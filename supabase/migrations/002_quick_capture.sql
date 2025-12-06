-- Quick Capture System Schema
-- Adds API tokens for external access and quick captures inbox

-- API Tokens Table (for external Quick Capture access)
CREATE TABLE IF NOT EXISTS api_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  token_prefix TEXT NOT NULL,        -- First 8 chars (e.g., "idfc_abc1") for identification
  token_hash TEXT NOT NULL,          -- SHA-256 hash of full token (never store raw)
  scopes TEXT[] NOT NULL DEFAULT '{capture:write}',
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,            -- Optional expiration
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ             -- Soft revoke (null = active)
);

CREATE INDEX IF NOT EXISTS idx_api_tokens_user ON api_tokens(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_api_tokens_prefix ON api_tokens(token_prefix);
CREATE INDEX IF NOT EXISTS idx_api_tokens_hash ON api_tokens(token_hash);

-- Quick Captures Inbox Table
CREATE TABLE IF NOT EXISTS quick_captures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  idea TEXT,
  source_url TEXT,
  source_title TEXT,                 -- Page title where captured
  selected_text TEXT,                -- Highlighted text when captured
  source_type TEXT NOT NULL DEFAULT 'api' CHECK (source_type IN ('api', 'extension', 'pwa', 'share')),
  tags TEXT[],
  metadata JSONB,                    -- Flexible additional data
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,  -- Linked after conversion
  created_at TIMESTAMPTZ DEFAULT NOW(),
  converted_at TIMESTAMPTZ           -- When converted to project
);

CREATE INDEX IF NOT EXISTS idx_quick_captures_user ON quick_captures(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_quick_captures_unconverted ON quick_captures(clerk_user_id)
  WHERE project_id IS NULL AND converted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_quick_captures_created ON quick_captures(created_at DESC);

-- Enable Row Level Security
ALTER TABLE api_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_captures ENABLE ROW LEVEL SECURITY;

-- Note: RLS policies are bypassed when using service role key
-- The app server uses service role, so these are for reference/direct access

-- Trigger for updated_at on api_tokens (if we add an updated_at column later)
-- Currently not needed as tokens are immutable after creation (only revoked_at changes)
