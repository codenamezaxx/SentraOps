export type Role = 'owner' | 'cashier';
export type PaymentMethod = 'cash' | 'qris' | 'whatsapp_invoice' | 'invoice';
export type TransactionStatus = 'completed' | 'pending' | 'cancelled';

export interface Store {
  id: string;
  owner_id: string;
  name: string;
  created_at: string;
}

export interface Profile {
  id: string;
  auth_id: string;
  store_id: string;
  role: Role;
  name: string | null;
}

export interface Product {
  id: string;
  store_id: string | null;
  name: string;
  barcode: string | null;
  price: number;
  cost_price: number;
  stock_quantity: number;
  min_stock_threshold: number;
  category: string | null;
  image_url: string | null;
  active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface Transaction {
  id: string;
  store_id: string;
  cashier_id: string;
  total_amount: number;
  payment_method: PaymentMethod;
  status: TransactionStatus;
  cash_amount: number | null;
  change_amount: number | null;
  created_at: string;
}

export interface TransactionItem {
  id: string;
  transaction_id: string;
  product_id: string;
  quantity: number;
  price_at_time: number;
  cost_price_at_time: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Invoice {
  id: string;
  store_id: string;
  customer_name: string;
  customer_phone: string | null;
  amount: number;
  due_date: string;
  status: 'UNPAID' | 'PAID';
  xendit_invoice_url: string | null;
  transaction_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface DashboardMetrics {
  todaySales: number;
  lowStockCount: number;
  overdueInvoices: number;
}

export interface FinancialSummary {
  grossRevenue: number;
  cogs: number;
  netProfit: number;
  profitMargin: number;
}