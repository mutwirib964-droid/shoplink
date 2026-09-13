-- =========================================================================
-- ShopLink Kenya — Complete Supabase PostgreSQL Schema with Auth & RLS
-- =========================================================================
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql).
-- It creates:
--   1. Public profiles linked to Supabase auth.users with auto-creation trigger
--   2. Businesses with M-Pesa direct settlement config (visible to everyone)
--   3. Products posted by merchants (visible to everyone, editable by store owner)
--   4. Orders, order items, and M-Pesa / Hashback payments
--   5. Full Row Level Security (RLS) policies allowing public browsing & secure merchant control
-- =========================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================================
-- 1. PROFILES TABLE (Linked with auth.users)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT DEFAULT '',
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'business_owner', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================================
-- 2. AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- =========================================================================
-- Whenever a user creates an account via Supabase Auth, this trigger automatically
-- writes their metadata (full_name, phone, role) into public.profiles.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, phone, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), public.profiles.full_name),
        phone = COALESCE(NULLIF(EXCLUDED.phone, ''), public.profiles.phone),
        role = COALESCE(NULLIF(EXCLUDED.role, ''), public.profiles.role),
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- 3. SUBSCRIPTION PLANS
-- =========================================================================
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

-- Seed default plans
INSERT INTO public.subscription_plans (id, name, price, interval, product_limit, features)
VALUES 
    ('plan_free', 'FREE', 0.00, 'month', 10, '["Up to 10 products", "Dedicated store link", "Order notifications", "WhatsApp sharing"]'::jsonb),
    ('plan_business', 'BUSINESS', 999.00, 'month', 100, '["Up to 100 products", "Lipa na M-Pesa direct settlement", "Customer CRM", "Analytics"]'::jsonb),
    ('plan_pro', 'PRO', 1999.00, 'month', 10000, '["Unlimited products", "Priority marketplace placement", "Custom domain", "VIP WhatsApp support"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- 4. BUSINESSES TABLE (Stores)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    location TEXT NOT NULL,
    county TEXT DEFAULT 'Nairobi',
    exact_location TEXT DEFAULT '',
    category TEXT NOT NULL,
    logo_url TEXT DEFAULT '',
    banner_url TEXT DEFAULT '',
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 200.00,
    currency TEXT NOT NULL DEFAULT 'KSh',
    settlement JSONB DEFAULT '{"settlement_type":"till","enabled_methods":["till"],"auto_payout_enabled":true,"verified":true}'::jsonb,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    subscription_plan_id TEXT NOT NULL DEFAULT 'plan_free' REFERENCES public.subscription_plans(id),
    trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Ensure incremental updates for existing databases
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS county TEXT DEFAULT 'Nairobi';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS exact_location TEXT DEFAULT '';
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days');

CREATE INDEX IF NOT EXISTS idx_businesses_slug ON public.businesses(slug);
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON public.businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_county ON public.businesses(county);

-- =========================================================================
-- 5. PRODUCTS TABLE (Visible to everyone!)
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    sale_price NUMERIC(12, 2) CHECK (sale_price IS NULL OR sale_price < price),
    stock_quantity INT NOT NULL DEFAULT 10 CHECK (stock_quantity >= 0),
    category TEXT NOT NULL,
    image_url TEXT NOT NULL,
    images JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_business ON public.products(business_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON public.products(is_active);

-- =========================================================================
-- 6. ORDERS TABLE
-- =========================================================================
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
    delivery_type TEXT NOT NULL DEFAULT 'delivery' CHECK (delivery_type IN ('delivery', 'pickup')),
    delivery_fee_status TEXT NOT NULL DEFAULT 'quoted' CHECK (delivery_fee_status IN ('pending_quote', 'quoted', 'free_pickup')),
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    mpesa_phone TEXT NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
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

-- =========================================================================
-- 7. ORDER ITEMS TABLE
-- =========================================================================
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

-- =========================================================================
-- 8. PAYMENTS TABLE (M-Pesa / Hashback Gateway Logs)
-- =========================================================================
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
CREATE INDEX IF NOT EXISTS idx_payments_business ON public.payments(business_id);

-- =========================================================================
-- 9. INVENTORY REDUCTION TRIGGER ON PAYMENT CONFIRMATION
-- =========================================================================
CREATE OR REPLACE FUNCTION public.reduce_product_inventory_on_payment()
RETURNS TRIGGER AS $$
BEGIN
    IF (NEW.payment_status = 'successful' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'successful')) THEN
        UPDATE public.products p
        SET stock_quantity = GREATEST(0, p.stock_quantity - oi.quantity)
        FROM public.order_items oi
        WHERE oi.order_id = NEW.id AND oi.product_id = p.id;

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
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Profiles:
-- Anyone can view their own profile or public merchant names; user can update their own
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Public profile insert on signup" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Subscription Plans:
-- Visible to everyone
CREATE POLICY "Public read subscription plans" ON public.subscription_plans
    FOR SELECT USING (TRUE);

-- Businesses:
-- VISIBLE TO EVERYONE (Shoppers and merchants can see all active businesses)
CREATE POLICY "Businesses are visible to everyone" ON public.businesses
    FOR SELECT USING (TRUE);

CREATE POLICY "Owners can insert their business" ON public.businesses
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their business" ON public.businesses
    FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their business" ON public.businesses
    FOR DELETE USING (auth.uid() = owner_id);

-- Products:
-- VISIBLE TO EVERYONE (Shoppers can browse any merchant's products)
CREATE POLICY "Products are visible to everyone" ON public.products
    FOR SELECT USING (TRUE);

CREATE POLICY "Merchants can insert products into their business" ON public.products
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.businesses
            WHERE businesses.id = products.business_id
            AND businesses.owner_id = auth.uid()
        )
    );

CREATE POLICY "Merchants can update their business products" ON public.products
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.businesses
            WHERE businesses.id = products.business_id
            AND businesses.owner_id = auth.uid()
        )
    );

CREATE POLICY "Merchants can delete their business products" ON public.products
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.businesses
            WHERE businesses.id = products.business_id
            AND businesses.owner_id = auth.uid()
        )
    );

-- Orders:
-- Anyone can create an order (both logged-in users and guest shoppers)
CREATE POLICY "Anyone can create order" ON public.orders
    FOR INSERT WITH CHECK (TRUE);

-- Shoppers view their own orders, Merchants view orders placed with their business
CREATE POLICY "View orders" ON public.orders
    FOR SELECT USING (
        customer_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.businesses
            WHERE businesses.id = orders.business_id
            AND businesses.owner_id = auth.uid()
        )
    );

-- Merchants can update orders for their business (e.g. set delivery fee, mark processing/shipped)
CREATE POLICY "Merchants can update orders" ON public.orders
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.businesses
            WHERE businesses.id = orders.business_id
            AND businesses.owner_id = auth.uid()
        )
    );

-- Order Items:
CREATE POLICY "Anyone can insert order items" ON public.order_items
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "View order items" ON public.order_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.orders
            WHERE orders.id = order_items.order_id
            AND (
                orders.customer_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.businesses
                    WHERE businesses.id = orders.business_id
                    AND businesses.owner_id = auth.uid()
                )
            )
        )
    );

-- Payments:
CREATE POLICY "Anyone can record payment transaction" ON public.payments
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "View payments" ON public.payments
    FOR SELECT USING (
        customer_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.businesses
            WHERE businesses.id = payments.business_id
            AND businesses.owner_id = auth.uid()
        )
    );
