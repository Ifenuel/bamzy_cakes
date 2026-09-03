-- 011: Customer addresses
CREATE TABLE customer_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label TEXT DEFAULT 'home',
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT,
  phone TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_addresses_customer ON customer_addresses(customer_id);
