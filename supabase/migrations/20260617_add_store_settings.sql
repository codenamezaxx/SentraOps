-- Add store-level settings columns
ALTER TABLE IF EXISTS public.stores
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS receipt_footer text,
ADD COLUMN IF NOT EXISTS payment_methods jsonb DEFAULT '{"cash":true,"qris":true,"whatsapp":true}' ::jsonb,
ADD COLUMN IF NOT EXISTS default_stock_threshold int DEFAULT 5;

COMMENT ON COLUMN public.stores.payment_methods IS '{"cash":bool,"qris":bool,"whatsapp":bool}';