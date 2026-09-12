-- =========================================================================
-- ShopLink Kenya — Complete Supabase PostgreSQL Schema with RLS
-- =========================================================================
-- This script creates all tables, constraints, indexes, triggers,
-- and Row Level Security (RLS) policies required for production deployment.
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'business_owner', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. SUBSCRIPTION PLANS
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    interval TEXT NOT NULL DEFAULT 'month',
    product_limit INT NOT NULL DEFAULT 10,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed Default Subscription Plans
INSERT INTO public.subscription_plans (id, name, price, interval, product_limit, features)
VALUES 
    ('plan_free', 'FREE', 0.00, 'month', 10, '["Up to 10 products", "Basic storefront", "Basic order tracking", "Standard WhatsApp sharing"]'::jsonb),
    ('plan_business', 'BUSINESS', 999.00, 'month', 100, '["Up to 100 products", "Unlimited orders", "Sales analytics", "Customer management", "Custom branding", "Priority support"]'::jsonb),
    ('plan_pro', 'PRO', 1999.00, 'month', 10000, '["Unlimited products", "Advanced analytics", "Featured marketplace placement", "Advanced marketing tools", "VIP priority support", "Custom domain ready"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 3. BUSINESSES TABLE
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    location TEXT NOT NULL,
    category TEXT NOT NULL,
    logo_url TEXT DEFAULT '',
    banner_url TEXT DEFAULT '',
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 200.00,
    currency TEXT NOT NULL DEFAULT 'KSh',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    subscription_plan_id TEXT NOT NULL DEFAULT 'plan_free' REFERENCES public.subscription_plans(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_businesses_slug ON public.businesses(slug);
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON public.businesses(owner_id);

-- 4. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed standard Kenyan commerce categories
INSERT INTO public.categories (name, slug, icon)
VALUES 
    ('Shoes & Footwear', 'shoes-footwear', 'Footprints'),
    ('Clothing & Fashion', 'clothing-fashion', 'Shirt'),
    ('Electronics & Gadgets', 'electronics-gadgets', 'Smartphone'),
    ('Beauty, Cosmetics & Hair', 'beauty-cosmetics-hair', 'Sparkles'),
    ('Food, Groceries & Produce', 'food-groceries', 'Apple'),
    ('Home & Kitchen Essentials', 'home-kitchen', 'Home'),
    ('Jewelry & Accessories', 'jewelry-accessories', 'Watch')
ON CONFLICT (slug) DO NOTHING;

-- 5. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    sale_price NUMERIC(12, 2) CHECK (sale_price IS NULL OR sale_price < price),
    stock_quantity INT NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    category TEXT NOT NULL,
    image_url TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_business ON public.products(business_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);

-- 6. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT NOT NULL UNIQUE,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    delivery_location TEXT NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_notes TEXT,
    mpesa_phone TEXT NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    currency TEXT NOT NULL DEFAULT 'KSh',
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'successful', 'failed', 'cancelled', 'refunded')),
    order_status TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'paid', 'processing', 'ready', 'shipped', 'delivered', 'cancelled')),
    hashback_reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_business ON public.orders(business_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(payment_status, order_status);

-- 7. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_image TEXT NOT NULL,
    price NUMERIC(12, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    total NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON public.order_items(order_id);

-- 8. PAYMENTS TABLE (Dedicated to Hashback transactions)
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    amount NUMERIC(12, 2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'KSh',
    phone_number TEXT NOT NULL,
    gateway TEXT NOT NULL DEFAULT 'hashback',
    gateway_transaction_id TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'successful', 'failed', 'cancelled', 'refunded')),
    callback_data JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_hashback_tx ON public.payments(gateway_transaction_id);

-- 9. CUSTOMERS TABLE (Store aggregated customer data for businesses)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    orders_count INT NOT NULL DEFAULT 1,
    total_spent NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    last_order_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'vip', 'inactive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_business_customer_phone UNIQUE(business_id, phone)
);

-- 10. SUBSCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL UNIQUE REFERENCES public.businesses(id) ON DELETE CASCADE,
    plan_id TEXT NOT NULL REFERENCES public.subscription_plans(id),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
    current_period_end TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================================
-- DATABASE FUNCTIONS & TRIGGERS
-- =========================================================================

-- Function: Reduce stock quantity when order payment is successful
CREATE OR REPLACE FUNCTION public.reduce_product_inventory_on_payment()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.payment_status = 'successful' AND OLD.payment_status != 'successful') THEN
        -- Reduce stock for all items in this order
        UPDATE public.products p
        SET stock_quantity = GREATEST(0, p.stock_quantity - oi.quantity)
        FROM public.order_items oi
        WHERE oi.order_id = NEW.id AND oi.product_id = p.id;

        -- Update order status to paid
        NEW.order_status := 'paid';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reduce_inventory ON public.orders;
CREATE TRIGGER trg_reduce_inventory
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.reduce_product_inventory_on_payment();

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Profiles: Users view/update own; Admins view all
CREATE POLICY "Public profile creation" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Businesses: Public read active; Owners manage own; Admins manage all
CREATE POLICY "Public view active businesses" ON public.businesses FOR SELECT USING (status = 'active' OR owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Owners insert business" ON public.businesses FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners update business" ON public.businesses FOR UPDATE USING (owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Products: Public view active products of active businesses; Owners manage own
CREATE POLICY "Public view active products" ON public.products FOR SELECT USING (
    (is_active = TRUE AND EXISTS (SELECT 1 FROM public.businesses WHERE id = products.business_id AND status = 'active'))
    OR EXISTS (SELECT 1 FROM public.businesses WHERE id = products.business_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Owners insert products" ON public.products FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.businesses WHERE id = products.business_id AND owner_id = auth.uid())
);
CREATE POLICY "Owners update products" ON public.products FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.businesses WHERE id = products.business_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Owners delete products" ON public.products FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.businesses WHERE id = products.business_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Orders: Public can place order (insert); Owners view their business's orders; Customer view their own
CREATE POLICY "Anyone can create order" ON public.orders FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "View orders" ON public.orders FOR SELECT USING (
    customer_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.businesses WHERE id = orders.business_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Update order status" ON public.orders FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.businesses WHERE id = orders.business_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Order items
CREATE POLICY "Anyone can insert order items" ON public.order_items FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "View order items" ON public.order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND (
        orders.customer_id = auth.uid()
        OR EXISTS (SELECT 1 FROM public.businesses WHERE id = orders.business_id AND owner_id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    ))
);

-- Payments
CREATE POLICY "View payments" ON public.payments FOR SELECT USING (
    customer_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.businesses WHERE id = payments.business_id AND owner_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Subscription plans: Public read
CREATE POLICY "Public read subscription plans" ON public.subscription_plans FOR SELECT USING (TRUE);
