// Complete Supabase SQL script for ShopLink Kenya multi-tenant marketplace
export const SUPABASE_SETUP_SQL = `-- =========================================================================
-- ShopLink Kenya — Supabase PostgreSQL Schema with Auth, RLS & Triggers
-- =========================================================================
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Profiles Table linked with Supabase auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT DEFAULT '',
    role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'business_owner', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Businesses Table
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT DEFAULT '',
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    location TEXT NOT NULL DEFAULT 'Nairobi, Kenya',
    category TEXT NOT NULL DEFAULT 'General Merchandise',
    logo_url TEXT DEFAULT '',
    banner_url TEXT DEFAULT '',
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 200.00,
    settlement JSONB NOT NULL DEFAULT '{"settlement_type":"till","auto_payout_enabled":true,"verified":true}'::jsonb,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended')),
    subscription_plan_id TEXT NOT NULL DEFAULT 'plan_free',
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Products Table (Visible to everyone!)
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    sale_price NUMERIC(10, 2) CHECK (sale_price IS NULL OR sale_price >= 0),
    stock_quantity INTEGER NOT NULL DEFAULT 1 CHECK (stock_quantity >= 0),
    category TEXT NOT NULL DEFAULT 'General',
    image_url TEXT NOT NULL,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Orders Table
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
    delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    delivery_fee_status TEXT NOT NULL DEFAULT 'quoted' CHECK (delivery_fee_status IN ('pending_quote', 'quoted', 'free_pickup')),
    mpesa_phone TEXT NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
    total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
    currency TEXT NOT NULL DEFAULT 'KSh',
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'successful', 'failed')),
    order_status TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'paid', 'processing', 'dispatched', 'delivered', 'cancelled')),
    hashback_reference TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Products & Businesses are visible to EVERYONE
CREATE POLICY "Public businesses viewable by everyone" ON public.businesses FOR SELECT USING (TRUE);
CREATE POLICY "Public products viewable by everyone" ON public.products FOR SELECT USING (is_active = TRUE);

-- Merchants manage their own products
CREATE POLICY "Merchants can insert products" ON public.products FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.businesses WHERE businesses.id = products.business_id AND businesses.owner_id = auth.uid())
);
CREATE POLICY "Merchants can update products" ON public.products FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.businesses WHERE businesses.id = products.business_id AND businesses.owner_id = auth.uid())
);
CREATE POLICY "Merchants can delete products" ON public.products FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.businesses WHERE businesses.id = products.business_id AND businesses.owner_id = auth.uid())
);

-- Auto-create profile trigger on Supabase Auth Sign Up
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
        full_name = EXCLUDED.full_name,
        phone = EXCLUDED.phone,
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
`;
