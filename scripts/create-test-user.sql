-- Create test user in Supabase Auth
-- Run this in your Supabase SQL Editor

-- First, create the user in auth.users (this might not work directly, use Supabase dashboard instead)
-- Instead, create via Supabase Dashboard > Authentication > Add User

-- After creating auth user (email: test@sentraops.com, password: test123456), run this:

-- Create store for test user
INSERT INTO stores (id, owner_id, name)
VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  '<AUTH_USER_ID_HERE>'::uuid,  -- Replace with actual auth user ID from dashboard
  'Toko Test SentraOps'
);

-- Create profile linked to auth user
INSERT INTO profiles (auth_id, store_id, role, name)
VALUES (
  '<AUTH_USER_ID_HERE>'::uuid,  -- Replace with actual auth user ID from dashboard
  '00000000-0000-0000-0000-000000000001'::uuid,
  'owner',
  'Test Owner'
);

-- Add sample products
INSERT INTO products (store_id, name, barcode, price, cost_price, stock_quantity, category)
VALUES 
  ('00000000-0000-0000-0000-000000000001'::uuid, 'Indomie Goreng', '8991234567890', 3500, 2500, 100, 'Makanan'),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'Aqua 600ml', '8992756123456', 5000, 3500, 50, 'Minuman'),
  ('00000000-0000-0000-0000-000000000001'::uuid, 'Pepsodent 75g', '8996001234567', 12000, 8000, 30, 'Kebersihan');
