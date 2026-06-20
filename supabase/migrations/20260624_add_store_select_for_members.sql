-- Allow all store members (owners + cashiers) to SELECT the store
-- The existing "Users can manage their own store" policy only allows the owner
-- to do ALL operations. Store members need to at least read the store name.

-- Drop the restrictive FOR ALL policy
DROP POLICY IF EXISTS "Users can manage their own store" ON stores;

-- Owner: full access (INSERT, SELECT, UPDATE, DELETE)
CREATE POLICY "Store owner full access" ON stores
  FOR ALL USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Store members: SELECT only (read store name, etc.)
CREATE POLICY "Store members can view store" ON stores
  FOR SELECT USING (
    id IN (SELECT store_id FROM profiles WHERE auth_id = auth.uid())
  );
