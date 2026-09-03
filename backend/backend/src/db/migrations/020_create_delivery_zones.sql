-- Delivery zones for location-based delivery fee calculation
CREATE TABLE IF NOT EXISTS delivery_zones (
  id SERIAL PRIMARY KEY,
  zone_name TEXT NOT NULL,
  zone_slug TEXT NOT NULL UNIQUE,
  delivery_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  estimated_hours_min INTEGER DEFAULT 2,
  estimated_hours_max INTEGER DEFAULT 4,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default delivery zones for Southwest Nigeria
INSERT INTO delivery_zones (zone_name, zone_slug, delivery_fee, estimated_hours_min, estimated_hours_max) VALUES
  ('Within Ibadan', 'ibadan', 1500, 2, 4),
  ('Lagos', 'lagos', 2500, 24, 48),
  ('Ogun State', 'ogun', 3000, 24, 48),
  ('Ondo State', 'ondo', 3500, 24, 48),
  ('Ekiti State', 'ekiti', 3500, 24, 48),
  ('Osun State', 'osun', 3500, 24, 48)
ON CONFLICT (zone_slug) DO NOTHING;

-- Add index
CREATE INDEX IF NOT EXISTS idx_delivery_zones_slug ON delivery_zones(zone_slug);
CREATE INDEX IF NOT EXISTS idx_delivery_zones_active ON delivery_zones(is_active);
