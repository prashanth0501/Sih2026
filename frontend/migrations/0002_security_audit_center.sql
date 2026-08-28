-- Migration: 0002_security_audit_center.sql
-- Description: Production-Grade Security Audit Center schema upgrade
-- Compatible with SQLite & Cloudflare D1. Zero data loss.

CREATE TABLE IF NOT EXISTS audit_logs_v2 (
    id TEXT PRIMARY KEY,
    session_id TEXT,
    user_id TEXT,
    user_name TEXT,
    user_email TEXT,
    user_role TEXT,
    department TEXT,
    year TEXT,
    team_id TEXT,
    team_name TEXT,
    action TEXT NOT NULL,
    action_category TEXT NOT NULL DEFAULT 'GENERAL',
    resource_type TEXT,
    resource_id TEXT,
    http_method TEXT,
    path TEXT,
    status_code INTEGER,
    ip_address TEXT,
    country TEXT,
    state TEXT,
    city TEXT,
    isp TEXT,
    browser TEXT,
    browser_version TEXT,
    os TEXT,
    os_version TEXT,
    device_type TEXT,
    screen_resolution TEXT,
    timezone TEXT,
    language TEXT,
    user_agent TEXT,
    referer TEXT,
    duration_ms INTEGER,
    details_json TEXT,
    created_at TEXT NOT NULL
);

INSERT INTO audit_logs_v2 (id, user_id, user_email, action, resource_id, details_json, ip_address, user_agent, created_at)
SELECT id, actor_id, actor_email, action, target_id, details_json, ip_address, user_agent, created_at
FROM audit_logs
WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='audit_logs');

DROP TABLE IF EXISTS audit_logs;
ALTER TABLE audit_logs_v2 RENAME TO audit_logs;

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_session_id ON audit_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_category ON audit_logs(action_category);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
