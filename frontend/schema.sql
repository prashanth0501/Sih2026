DROP TABLE IF EXISTS users;
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL,
    department TEXT NOT NULL,
    year INTEGER NOT NULL,
    usn TEXT,
    gender TEXT,
    github_url TEXT,
    photo_url TEXT,
    email_verified INTEGER NOT NULL DEFAULT 0,
    email_verified_at TEXT,
    verification_token TEXT,
    verification_expires_at TEXT,
    password_reset_token TEXT,
    password_reset_expires_at TEXT,
    is_disabled INTEGER NOT NULL DEFAULT 0,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TEXT,
    created_at TEXT NOT NULL
);

DROP TABLE IF EXISTS audit_logs;
CREATE TABLE audit_logs (
    id TEXT PRIMARY KEY,
    actor_id TEXT,
    actor_email TEXT,
    action TEXT NOT NULL,
    target_id TEXT,
    details_json TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT NOT NULL
);

DROP TABLE IF EXISTS teams;
CREATE TABLE teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    leader_usn TEXT NOT NULL,
    leader_github_url TEXT NOT NULL,
    theme TEXT,
    members_json TEXT NOT NULL,
    status TEXT NOT NULL,
    is_locked INTEGER NOT NULL DEFAULT 0,
    level1_status TEXT DEFAULT 'pending',
    level1_score INTEGER,
    level1_feedback TEXT,
    level1_submission_url TEXT,
    level1_reviewer_id TEXT,
    level1_reviewed_at TEXT,
    level2_status TEXT DEFAULT 'pending',
    level2_score INTEGER,
    level2_feedback TEXT,
    level2_submission_url TEXT,
    level2_reviewer_id TEXT,
    level2_reviewed_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

DROP TABLE IF EXISTS problem_statements;
CREATE TABLE problem_statements (
    id TEXT PRIMARY KEY,
    sih_id TEXT,
    title TEXT NOT NULL,
    organization TEXT,
    theme TEXT,
    category TEXT,
    description TEXT,
    difficulty TEXT
);

DROP TABLE IF EXISTS content_blocks;
CREATE TABLE content_blocks (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    payload_json TEXT NOT NULL
);

DROP TABLE IF EXISTS system_settings;
CREATE TABLE system_settings (
    id TEXT PRIMARY KEY,
    registration_open INTEGER NOT NULL DEFAULT 1,
    level1_open INTEGER NOT NULL DEFAULT 1,
    level2_open INTEGER NOT NULL DEFAULT 1,
    updated_at TEXT NOT NULL
);

DROP TABLE IF EXISTS promo_posts;
CREATE TABLE promo_posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    caption TEXT NOT NULL,
    hashtags_json TEXT NOT NULL,
    media_url TEXT,
    is_published INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
);

DROP TABLE IF EXISTS announcements;
CREATE TABLE announcements (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    date TEXT NOT NULL
);
DROP TABLE IF EXISTS promo_shares; CREATE TABLE promo_shares (id TEXT PRIMARY KEY, promo_post_id TEXT NOT NULL, student_name TEXT, name TEXT, usn TEXT NOT NULL, platform TEXT, post_url TEXT NOT NULL, is_public_on_wall INTEGER NOT NULL DEFAULT 1, submitted_at TEXT NOT NULL, count_for_post INTEGER DEFAULT 0);
DROP TABLE IF EXISTS team_members; CREATE TABLE team_members (id TEXT PRIMARY KEY, team_id TEXT NOT NULL, name TEXT NOT NULL, email TEXT, usn TEXT UNIQUE NOT NULL, gender TEXT NOT NULL, department TEXT NOT NULL, year INTEGER NOT NULL, role TEXT NOT NULL, github_url TEXT, created_at TEXT NOT NULL);

-- Default system settings
INSERT OR IGNORE INTO system_settings (id, registration_open, level1_open, level2_open, updated_at)
VALUES ('global_settings', 1, 1, 1, '2026-08-17T00:00:00.000Z');

-- Default accounts (admin/coordinator/demo - marked as verified)
INSERT OR IGNORE INTO users (id, name, email, password_hash, role, department, year, usn, gender, github_url, email_verified, email_verified_at, created_at)
VALUES 
('seed-user-1', 'Partha Shankar', 'parthashankar21@gmail.com', 'coordinator123', 'coordinator', 'CSE', 4, '1NC22CS001', 'Male', 'https://github.com/parthashankar', 1, '2026-08-17T00:00:00.000Z', '2026-08-17T00:00:00.000Z'),
('seed-user-2', 'Nirmith M Jain', 'nirmithmjain@gmail.com', 'coordinator123', 'coordinator', 'CSE', 4, '1NC22CS002', 'Male', 'https://github.com/nirmithmjain', 1, '2026-08-17T00:00:00.000Z', '2026-08-17T00:00:00.000Z'),
('seed-user-3', 'Dr. Bhargava R', 'dr.bhargava@ncetmail.com', 'spoc123', 'spoc', 'CSE', 4, '1NC20CS000', 'Male', 'https://github.com/drbhargava', 1, '2026-08-17T00:00:00.000Z', '2026-08-17T00:00:00.000Z'),
('seed-user-4', 'Demo Participant', 'participant@nagarjuna.edu', 'participant123', 'participant', 'CSE', 2, '1NC22CS005', 'Male', 'https://github.com/demoparticipant', 1, '2026-08-17T00:00:00.000Z', '2026-08-17T00:00:00.000Z');


