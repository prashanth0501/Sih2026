-- Migration 0006: Auto-correct USN-based Academic Years and Department Branches
-- 23 Series => 4th Year (year = 4)
-- 24 Series => 3rd Year (year = 3)
-- 25 Series => 2nd Year (year = 2)
-- 26 Series => 1st Year (year = 1)
-- CS => CSE, IS => ISE, EC => ECE, CD => Data Science, CI => AIML, BC/BCA => BCA, CV => Civil, ME => Mechanical

-- 1. Year Corrections in team_members
UPDATE team_members SET year = 4 WHERE UPPER(TRIM(usn)) LIKE '%1NC23%';
UPDATE team_members SET year = 3 WHERE UPPER(TRIM(usn)) LIKE '%1NC24%';
UPDATE team_members SET year = 2 WHERE UPPER(TRIM(usn)) LIKE '%1NC25%';
UPDATE team_members SET year = 1 WHERE UPPER(TRIM(usn)) LIKE '%1NC26%';

-- 2. Year Corrections in users
UPDATE users SET year = 4 WHERE UPPER(TRIM(usn)) LIKE '%1NC23%';
UPDATE users SET year = 3 WHERE UPPER(TRIM(usn)) LIKE '%1NC24%';
UPDATE users SET year = 2 WHERE UPPER(TRIM(usn)) LIKE '%1NC25%';
UPDATE users SET year = 1 WHERE UPPER(TRIM(usn)) LIKE '%1NC26%';

-- 3. Department / Branch Corrections in team_members
UPDATE team_members SET department = 'CSE' WHERE UPPER(TRIM(usn)) LIKE '%1NC__CS%';
UPDATE team_members SET department = 'ISE' WHERE UPPER(TRIM(usn)) LIKE '%1NC__IS%';
UPDATE team_members SET department = 'ECE' WHERE UPPER(TRIM(usn)) LIKE '%1NC__EC%';
UPDATE team_members SET department = 'Data Science' WHERE UPPER(TRIM(usn)) LIKE '%1NC__CD%';
UPDATE team_members SET department = 'AIML' WHERE UPPER(TRIM(usn)) LIKE '%1NC__CI%';
UPDATE team_members SET department = 'BCA' WHERE UPPER(TRIM(usn)) LIKE '%1NC__BC%' OR UPPER(TRIM(usn)) LIKE '%1NC__BCA%';
UPDATE team_members SET department = 'Civil' WHERE UPPER(TRIM(usn)) LIKE '%1NC__CV%';
UPDATE team_members SET department = 'Mechanical' WHERE UPPER(TRIM(usn)) LIKE '%1NC__ME%';

-- Fallback check if 1NC prefix was omitted in team_members
UPDATE team_members SET department = 'CSE' WHERE UPPER(TRIM(usn)) NOT LIKE '%1NC%' AND UPPER(TRIM(usn)) LIKE '%CS%';
UPDATE team_members SET department = 'ISE' WHERE UPPER(TRIM(usn)) NOT LIKE '%1NC%' AND UPPER(TRIM(usn)) LIKE '%IS%';
UPDATE team_members SET department = 'ECE' WHERE UPPER(TRIM(usn)) NOT LIKE '%1NC%' AND UPPER(TRIM(usn)) LIKE '%EC%';
UPDATE team_members SET department = 'Data Science' WHERE UPPER(TRIM(usn)) NOT LIKE '%1NC%' AND UPPER(TRIM(usn)) LIKE '%CD%';
UPDATE team_members SET department = 'AIML' WHERE UPPER(TRIM(usn)) NOT LIKE '%1NC%' AND UPPER(TRIM(usn)) LIKE '%CI%';
UPDATE team_members SET department = 'BCA' WHERE UPPER(TRIM(usn)) NOT LIKE '%1NC%' AND (UPPER(TRIM(usn)) LIKE '%BC%' OR UPPER(TRIM(usn)) LIKE '%BCA%');

-- 4. Department / Branch Corrections in users
UPDATE users SET department = 'CSE' WHERE UPPER(TRIM(usn)) LIKE '%1NC__CS%';
UPDATE users SET department = 'ISE' WHERE UPPER(TRIM(usn)) LIKE '%1NC__IS%';
UPDATE users SET department = 'ECE' WHERE UPPER(TRIM(usn)) LIKE '%1NC__EC%';
UPDATE users SET department = 'Data Science' WHERE UPPER(TRIM(usn)) LIKE '%1NC__CD%';
UPDATE users SET department = 'AIML' WHERE UPPER(TRIM(usn)) LIKE '%1NC__CI%';
UPDATE users SET department = 'BCA' WHERE UPPER(TRIM(usn)) LIKE '%1NC__BC%' OR UPPER(TRIM(usn)) LIKE '%1NC__BCA%';
UPDATE users SET department = 'Civil' WHERE UPPER(TRIM(usn)) LIKE '%1NC__CV%';
UPDATE users SET department = 'Mechanical' WHERE UPPER(TRIM(usn)) LIKE '%1NC__ME%';

-- Fallback check if 1NC prefix was omitted in users
UPDATE users SET department = 'CSE' WHERE UPPER(TRIM(usn)) NOT LIKE '%1NC%' AND UPPER(TRIM(usn)) LIKE '%CS%';
UPDATE users SET department = 'ISE' WHERE UPPER(TRIM(usn)) NOT LIKE '%1NC%' AND UPPER(TRIM(usn)) LIKE '%IS%';
UPDATE users SET department = 'ECE' WHERE UPPER(TRIM(usn)) NOT LIKE '%1NC%' AND UPPER(TRIM(usn)) LIKE '%EC%';
UPDATE users SET department = 'Data Science' WHERE UPPER(TRIM(usn)) NOT LIKE '%1NC%' AND UPPER(TRIM(usn)) LIKE '%CD%';
UPDATE users SET department = 'AIML' WHERE UPPER(TRIM(usn)) NOT LIKE '%1NC%' AND UPPER(TRIM(usn)) LIKE '%CI%';
UPDATE users SET department = 'BCA' WHERE UPPER(TRIM(usn)) NOT LIKE '%1NC%' AND (UPPER(TRIM(usn)) LIKE '%BC%' OR UPPER(TRIM(usn)) LIKE '%BCA%');
