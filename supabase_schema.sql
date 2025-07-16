-- Enable the UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table: Core user identity and role. Linked to Supabase Auth users.
CREATE TABLE users (
    id UUID PRIMARY KEY, -- This should be the same as auth.users.id
    email VARCHAR(255) UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('cliente', 'freelancer', 'empresa')),
    plan_type TEXT DEFAULT 'free',
    plan_status TEXT DEFAULT 'inactive', -- e.g., 'active', 'inactive', 'past_due'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Profiles Table: Shared profile information for all user types.
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    avatar_url TEXT,
    contact_phone VARCHAR(50),
    linkedin_url TEXT,
    github_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Company Profiles Table: Specific profile information for users with the 'empresa' role.
CREATE TABLE company_profiles (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    company_logo_url TEXT,
    sector VARCHAR(100),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Freelancer Profiles Table: Specific profile information for users with the 'freelancer' role.
CREATE TABLE freelancer_profiles (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100),
    location VARCHAR(100),
    status TEXT DEFAULT 'OFF' CHECK (status IN ('ON', 'OFF')),
    portfolio TEXT[], -- Array of URLs to portfolio items
    description TEXT,
    website TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    phone VARCHAR(20),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products Table: Stores products or services offered by users.
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    cost_price NUMERIC(10, 2) NOT NULL,
    sale_price NUMERIC(10, 2) NOT NULL,
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sales Table: Logs sales transactions.
CREATE TABLE sales (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    date TIMESTAMPTZ DEFAULT NOW(),
    total NUMERIC(10, 2) NOT NULL
);

-- Requests Table: Manages service requests between clients and freelancers.
CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    freelancer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    date TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'completed'
    suggested_value NUMERIC(10, 2)
);

-- Subscriptions Table: Tracks user subscriptions, including Stripe details.
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL, -- 'free', 'pro_local', 'pro_global', 'ultra_pro'
    status TEXT NOT NULL, -- 'active', 'canceled', 'past_due'
    stripe_id VARCHAR(255) UNIQUE,
    next_due TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact Messages Table: Stores messages from the contact form.
CREATE TABLE contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS POLICIES

-- Enable RLS on all relevant tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelancer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see their own user record.
CREATE POLICY "Users can view their own data" ON users
FOR SELECT USING (auth.uid() = id);

-- Policy: Public profiles, but only owners can edit.
CREATE POLICY "Profiles are public" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- Policy: Company profiles are public, but only owners can edit.
CREATE POLICY "Company profiles are public" ON company_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own company profile" ON company_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own company profile" ON company_profiles FOR UPDATE USING (auth.uid() = id);

-- Policy: Freelancer profiles are public, but only owners can edit.
CREATE POLICY "Freelancer profiles are public" ON freelancer_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own freelancer profile" ON freelancer_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own freelancer profile" ON freelancer_profiles FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can manage their own products, sales, and subscriptions.
CREATE POLICY "Users can manage their own products" ON products FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own sales" ON sales FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own subscriptions" ON subscriptions FOR ALL USING (auth.uid() = user_id);

-- Policy: Involved parties can manage requests.
CREATE POLICY "Users can manage their own requests" ON requests FOR ALL USING (auth.uid() = client_id OR auth.uid() = freelancer_id);

-- Policy: Anyone can send a contact message.
CREATE POLICY "Anyone can send contact messages" ON contact_messages FOR INSERT WITH CHECK (true);

-- =====================================================================================
-- INVOICING MODULE
-- =====================================================================================

-- Invoices Table: Main table to store invoice records.
-- This table is a prerequisite for the 'invoice_items' table.
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'void')),
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON TABLE public.invoices IS 'Stores header information for each invoice, linking to a user.';
COMMENT ON COLUMN public.invoices.status IS 'The current status of the invoice (e.g., draft, sent, paid).';

--
-- Name: invoice_items; Type: TABLE; Schema: public; Owner: -
--
-- This creates the `invoice_items` table, which is designed to store the individual line items
-- associated with an invoice. Each row represents a specific product or service being billed.
-- This table is essential for creating detailed, customizable invoices.
--
-- Dependencies: This table has a foreign key relationship with the `invoices` table.
--

CREATE TABLE public.invoice_items (
    -- Unique identifier for the invoice item, generated automatically.
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Foreign key linking this item to a specific invoice in the `invoices` table.
    -- ON DELETE CASCADE ensures that if an invoice is deleted, all its associated items are also deleted.
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,

    -- A detailed description of the product or service being billed.
    description TEXT NOT NULL,

    -- The quantity of the product or service. Defaults to 1.
    quantity INTEGER NOT NULL DEFAULT 1,

    -- The price per unit of the product or service.
    unit_price NUMERIC(10, 2) NOT NULL,

    -- Timestamp for when the invoice item was created. Defaults to the current time.
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add comments to the columns for better schema understanding.
COMMENT ON TABLE public.invoice_items IS 'Stores individual line items for each invoice.';
COMMENT ON COLUMN public.invoice_items.id IS 'Primary key for the invoice item (UUID).';
COMMENT ON COLUMN public.invoice_items.invoice_id IS 'Foreign key to the associated invoice in the invoices table.';
COMMENT ON COLUMN public.invoice_items.description IS 'Description of the service or product provided.';
COMMENT ON COLUMN public.invoice_items.quantity IS 'Quantity of the item or service.';
COMMENT ON COLUMN public.invoice_items.unit_price IS 'Price per unit for the item or service.';
COMMENT ON COLUMN public.invoice_items.created_at IS 'Timestamp of when the invoice item was created.';


-- RLS POLICIES FOR INVOICING MODULE

-- Enable RLS on new tables
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- Policy: Users can manage their own invoices.
CREATE POLICY "Users can manage their own invoices" ON public.invoices
FOR ALL USING (auth.uid() = user_id);

-- Policy: Users can manage items for invoices they own.
CREATE POLICY "Users can manage items on their own invoices" ON public.invoice_items
FOR ALL USING ( (SELECT invoices.user_id FROM public.invoices WHERE invoices.id = invoice_items.invoice_id) = auth.uid() );
