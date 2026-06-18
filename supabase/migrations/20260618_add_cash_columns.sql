-- Add cash_amount and change_amount columns to transactions table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS cash_amount bigint DEFAULT null;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS change_amount bigint DEFAULT null;
