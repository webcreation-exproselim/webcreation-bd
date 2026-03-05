
-- Allow multiple merchants per user (multi-domain support)
ALTER TABLE merchants DROP CONSTRAINT IF EXISTS merchants_user_id_key;

-- Add store_name column to merchants for domain identification
ALTER TABLE merchants ADD COLUMN IF NOT EXISTS store_name text;

-- Add store_name column to courier_check_subscriptions
ALTER TABLE courier_check_subscriptions ADD COLUMN IF NOT EXISTS store_name text;
