export type UserRole = 'customer' | 'business_owner' | 'admin';

export type PaymentStatus = 'pending' | 'processing' | 'successful' | 'failed' | 'cancelled' | 'refunded';

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'ready' | 'shipped' | 'delivered' | 'cancelled';

export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  created_at: string;
}

export type SettlementType = 'till' | 'paybill' | 'pochi' | 'hashback_split';

export interface BusinessSettlementConfig {
  settlement_type: SettlementType;
  // Safaricom Buy Goods Till
  till_number?: string;
  store_name?: string;
  // Safaricom Paybill
  paybill_number?: string;
  account_number_format?: string;
  // Pochi la Biashara or direct M-Pesa phone
  mpesa_phone?: string;
  // Hashback Sub-Account ID for automated merchant split
  hashback_subaccount_id?: string;
  // Direct settlement state
  auto_payout_enabled: boolean;
  verified: boolean;
  notes?: string;
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string;
  phone: string;
  email: string;
  location: string;
  category: string;
  logo_url: string;
  banner_url?: string;
  status: 'active' | 'suspended';
  is_featured: boolean;
  subscription_plan_id: string;
  created_at: string;
  delivery_fee: number;
  currency: string;
  settlement?: BusinessSettlementConfig;
}

export interface Product {
  id: string;
  business_id: string;
  name: string;
  description: string;
  price: number;
  sale_price?: number;
  stock_quantity: number;
  category: string;
  image_url: string;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Order {
  id: string;
  order_number: string;
  business_id: string;
  business_name?: string;
  customer_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_location: string;
  delivery_address: string;
  delivery_notes?: string;
  mpesa_phone: string;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  currency: string;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  hashback_reference?: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentTransaction {
  id: string;
  order_id: string;
  business_id: string;
  customer_id?: string;
  amount: number;
  currency: string;
  phone_number: string;
  gateway: 'hashback';
  gateway_transaction_id: string;
  status: PaymentStatus;
  settlement_destination?: string;
  settlement_status?: 'credited_to_seller' | 'pending' | 'failed';
  callback_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: 'FREE' | 'BUSINESS' | 'PRO';
  price: number;
  interval: 'month' | 'year';
  product_limit: number;
  features: string[];
  description: string;
  popular?: boolean;
}

export interface Subscription {
  id: string;
  business_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  current_period_end: string;
  created_at: string;
}

export interface CustomerRecord {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  email?: string;
  orders_count: number;
  total_spent: number;
  last_order_date: string;
  status: 'active' | 'vip' | 'inactive';
}

export interface CartItem {
  product: Product;
  quantity: number;
}
