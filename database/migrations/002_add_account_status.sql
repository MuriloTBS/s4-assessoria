-- Migration 002: Add account_status column to S4_USERS
-- Replaces the logo_url hack used as a status flag

-- 1. Add the new column with default 'active'
ALTER TABLE s4_users ADD account_status VARCHAR2(20) DEFAULT 'active';

-- 2. Backfill: mark existing PENDING accounts
UPDATE s4_users SET account_status = 'PENDING' WHERE logo_url = 'PENDING';

-- 3. Ensure active accounts are set correctly
UPDATE s4_users SET account_status = 'active' WHERE logo_url IS NULL OR logo_url != 'PENDING';

-- 4. Add check constraint
ALTER TABLE s4_users ADD CONSTRAINT chk_account_status
  CHECK (account_status IN ('active', 'PENDING', 'suspended'));

COMMIT;

-- After verifying data is correct, logo_url can be freed for actual logo use:
-- ALTER TABLE s4_users MODIFY logo_url NULL;
-- UPDATE s4_users SET logo_url = NULL WHERE logo_url = 'PENDING';
