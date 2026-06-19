-- Add 'invoice' as a valid payment method for transactions
ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_payment_method_check;
ALTER TABLE transactions ADD CONSTRAINT transactions_payment_method_check
  CHECK (payment_method IN ('cash', 'qris', 'whatsapp_invoice', 'invoice'));
