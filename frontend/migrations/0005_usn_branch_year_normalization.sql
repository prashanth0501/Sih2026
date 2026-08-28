-- Migration 0005: USN Whitespace Trimming, Department & Year Normalization
-- Safe data correction (NO DELETION, NO DATA LOSS)

-- 1. Trim trailing whitespace from team_members USNs and emails safely
UPDATE OR IGNORE team_members SET usn = TRIM(usn), email = TRIM(email);

-- 2. Trim trailing whitespace from teams leader_usn
UPDATE OR IGNORE teams SET leader_usn = TRIM(leader_usn);

-- 3. Trim trailing whitespace from users USN and emails
UPDATE OR IGNORE users SET usn = TRIM(usn), email = TRIM(email);

-- 4. Correct Year based on USN series (22/23 -> 4, 24 -> 3, 25 -> 2, 26 -> 1)
UPDATE team_members SET year = 4 WHERE TRIM(usn) LIKE '1NC22%' OR TRIM(usn) LIKE '1NC23%';
UPDATE team_members SET year = 3 WHERE TRIM(usn) LIKE '1NC24%';
UPDATE team_members SET year = 2 WHERE TRIM(usn) LIKE '1NC25%';
UPDATE team_members SET year = 1 WHERE TRIM(usn) LIKE '1NC26%';

UPDATE users SET year = 4 WHERE TRIM(usn) LIKE '1NC22%' OR TRIM(usn) LIKE '1NC23%';
UPDATE users SET year = 3 WHERE TRIM(usn) LIKE '1NC24%';
UPDATE users SET year = 2 WHERE TRIM(usn) LIKE '1NC25%';
UPDATE users SET year = 1 WHERE TRIM(usn) LIKE '1NC26%';

-- 5. Correct Department based on USN branch code
UPDATE team_members SET department = 'CSE' WHERE TRIM(usn) LIKE '%CS%';
UPDATE team_members SET department = 'ISE' WHERE TRIM(usn) LIKE '%IS%';
UPDATE team_members SET department = 'AI & ML' WHERE TRIM(usn) LIKE '%CI%' OR TRIM(usn) LIKE '%AI%';
UPDATE team_members SET department = 'ECE' WHERE TRIM(usn) LIKE '%EC%';
UPDATE team_members SET department = 'CIVIL' WHERE TRIM(usn) LIKE '%CV%';
UPDATE team_members SET department = 'MECH' WHERE TRIM(usn) LIKE '%ME%';
UPDATE team_members SET department = 'CSE' WHERE TRIM(usn) LIKE '%BC%';

UPDATE users SET department = 'CSE' WHERE TRIM(usn) LIKE '%CS%';
UPDATE users SET department = 'ISE' WHERE TRIM(usn) LIKE '%IS%';
UPDATE users SET department = 'AI & ML' WHERE TRIM(usn) LIKE '%CI%' OR TRIM(usn) LIKE '%AI%';
UPDATE users SET department = 'ECE' WHERE TRIM(usn) LIKE '%EC%';
UPDATE users SET department = 'CIVIL' WHERE TRIM(usn) LIKE '%CV%';
UPDATE users SET department = 'MECH' WHERE TRIM(usn) LIKE '%ME%';
UPDATE users SET department = 'CSE' WHERE TRIM(usn) LIKE '%BC%';
