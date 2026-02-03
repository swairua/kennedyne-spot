-- Enable leaked password protection
ALTER ROLE authenticator SET pgrst_check_for_leaked_passwords = true;

-- Update configuration to enable leaked password protection
UPDATE auth.config SET value = 'true' WHERE parameter = 'check_for_leaked_passwords';