CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('UNPAID', 'PAID')) NOT NULL DEFAULT 'UNPAID',
  xendit_invoice_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Store isolation for invoices" ON invoices;
CREATE POLICY "Store isolation for invoices" ON invoices
  FOR ALL USING (
    store_id IN (
      SELECT store_id FROM profiles WHERE auth_id = auth.uid()
    )
  );
