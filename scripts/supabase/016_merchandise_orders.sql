-- Create merchandise_orders table
CREATE TABLE IF NOT EXISTS merchandise_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number TEXT UNIQUE NOT NULL,
    store TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'nuovo',
    eta DATE,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create merchandise_order_items table
CREATE TABLE IF NOT EXISTS merchandise_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES merchandise_orders(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    qty INTEGER NOT NULL DEFAULT 1,
    item_status TEXT NOT NULL DEFAULT 'pending',
    item_eta DATE,
    category TEXT NOT NULL,
    brand TEXT,
    sub_category TEXT,
    sub_cat TEXT,
    channel TEXT,
    phone_brand TEXT,
    phone_model TEXT,
    phone_capacity TEXT,
    phone_color TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE merchandise_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchandise_order_items ENABLE ROW LEVEL SECURITY;

-- Policies for merchandise_orders
CREATE POLICY "Enable all for authenticated users" ON merchandise_orders
    FOR ALL USING (auth.role() = 'authenticated');

-- Policies for merchandise_order_items
CREATE POLICY "Enable all for authenticated users" ON merchandise_order_items
    FOR ALL USING (auth.role() = 'authenticated');

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_merchandise_orders_updated_at
    BEFORE UPDATE ON merchandise_orders
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
