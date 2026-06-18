-- Fix RLS policies to allow signup flow
-- Problem: stores table only had FOR ALL USING (view only), no INSERT allowed
-- Also profiles table needs INSERT policy for new user creation

-- Drop existing restrictive policy on stores
DROP POLICY IF EXISTS "Users can view their own store" ON stores;

-- Create new policy: allow SELECT/UPDATE/DELETE for store owner matching auth.uid()
CREATE POLICY "Users can manage their own store" ON stores
  FOR ALL USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Drop existing policy on profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Create new policy: allow INSERT during signup, SELECT/UPDATE for own profile
CREATE POLICY "Users can manage their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = auth_id);

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = auth_id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = auth_id)
  WITH CHECK (auth.uid() = auth_id);