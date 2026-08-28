-- Migration 0003: Add problem_statement_id and deleted_teams table
-- Safe additive migration (NO DROP, NO DELETION, NO DATA LOSS)

ALTER TABLE teams ADD COLUMN problem_statement_id TEXT;

CREATE TABLE IF NOT EXISTS deleted_teams (
    id TEXT PRIMARY KEY,
    original_id TEXT NOT NULL,
    name TEXT NOT NULL,
    leader_usn TEXT NOT NULL,
    theme TEXT,
    original_data_json TEXT NOT NULL,
    deleted_by TEXT NOT NULL,
    deleted_at TEXT NOT NULL,
    reason TEXT,
    audit_reference TEXT
);

CREATE INDEX IF NOT EXISTS idx_deleted_teams_original_id ON deleted_teams(original_id);
CREATE INDEX IF NOT EXISTS idx_deleted_teams_deleted_at ON deleted_teams(deleted_at DESC);
