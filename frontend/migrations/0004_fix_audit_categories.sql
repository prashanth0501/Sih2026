-- Migration 0004: Categorize historical auth audit logs
-- Safe update query (NO DELETION, NO SCHEMA CHANGES)

UPDATE audit_logs 
SET action_category = 'AUTHENTICATION'
WHERE action IN (
  'LOGIN_SUCCESS',
  'LOGIN_FAILED',
  'LOGOUT_SUCCESS',
  'REGISTER_SUCCESS',
  'VERIFICATION_SENT',
  'EMAIL_VERIFIED',
  'PASSWORD_RESET_REQUESTED',
  'PASSWORD_RESET_COMPLETED'
) AND (action_category IS NULL OR action_category = 'GENERAL' OR action_category = '');
