ALTER TABLE invoices ADD COLUMN transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL;
