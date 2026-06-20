-- Create expenses table for tracking business expenses
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  amount NUMERIC(15,0) NOT NULL CHECK (amount > 0),
  category VARCHAR(50) NOT NULL CHECK (category IN ('operasional', 'gaji', 'logistik', 'lain-lain')),
  description TEXT,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Store members can view their store's expenses
DROP POLICY IF EXISTS "Members can view expenses" ON expenses;
CREATE POLICY "Members can view expenses"
  ON expenses FOR SELECT
  USING (store_id IN (
    SELECT store_id FROM profiles WHERE auth_id = auth.uid()
  ));

-- Store members can insert expenses
DROP POLICY IF EXISTS "Members can insert expenses" ON expenses;
CREATE POLICY "Members can insert expenses"
  ON expenses FOR INSERT
  WITH CHECK (store_id IN (
    SELECT store_id FROM profiles WHERE auth_id = auth.uid()
  ));

-- Store members can delete their store's expenses
DROP POLICY IF EXISTS "Members can delete expenses" ON expenses;
CREATE POLICY "Members can delete expenses"
  ON expenses FOR DELETE
  USING (store_id IN (
    SELECT store_id FROM profiles WHERE auth_id = auth.uid()
  ));

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_expenses_store_id_date ON expenses (store_id, expense_date DESC);
