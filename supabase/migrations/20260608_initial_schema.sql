-- Create tables
CREATE TABLE stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID NOT NULL UNIQUE,
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'cashier')) NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  barcode TEXT,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  cost_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  min_stock_threshold INTEGER NOT NULL DEFAULT 5,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  cashier_id UUID REFERENCES profiles(id),
  total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_method TEXT CHECK (payment_method IN ('cash', 'qris', 'whatsapp_invoice')) NOT NULL,
  status TEXT CHECK (status IN ('completed', 'pending', 'cancelled')) DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE transaction_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  price_at_time DECIMAL(12,2) NOT NULL,
  cost_price_at_time DECIMAL(12,2) NOT NULL
);

-- Enable RLS
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own store" ON stores
  FOR ALL USING (auth.uid() = owner_id);

CREATE POLICY "Users can view their own profile" ON profiles
  FOR ALL USING (auth.uid() = auth_id);

CREATE POLICY "Store isolation for products" ON products
  FOR ALL USING (
    store_id IN (
      SELECT store_id FROM profiles WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Store isolation for transactions" ON transactions
  FOR ALL USING (
    store_id IN (
      SELECT store_id FROM profiles WHERE auth_id = auth.uid()
    )
  );

CREATE POLICY "Store isolation for transaction items" ON transaction_items
  FOR ALL USING (
    transaction_id IN (
      SELECT id FROM transactions WHERE store_id IN (
        SELECT store_id FROM profiles WHERE auth_id = auth.uid()
      )
    )
  );