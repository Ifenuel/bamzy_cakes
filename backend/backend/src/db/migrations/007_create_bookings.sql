-- 007: Event bookings
CREATE TABLE event_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES users(id),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('birthday', 'wedding', 'bridal_shower', 'baby_shower', 'corporate', 'outdoor', 'private_event', 'other')),
  event_date DATE NOT NULL,
  event_location TEXT,
  guest_count INT,
  services_requested JSONB DEFAULT '[]',
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bookings_customer ON event_bookings(customer_id);
CREATE INDEX idx_bookings_status ON event_bookings(status);
CREATE INDEX idx_bookings_date ON event_bookings(event_date);
