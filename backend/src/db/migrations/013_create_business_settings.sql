-- 013: Business settings
CREATE TABLE business_settings (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO business_settings (key, value) VALUES
  ('business_name', '"Bamzy Cakes & Confectionery"'),
  ('phone', '"+234 801 234 5678"'),
  ('email', '"hello@bamzycakes.com"'),
  ('address', '"12 Admiralty Way, Lekki, Lagos, Nigeria"'),
  ('delivery_fee', '1500'),
  ('business_hours', '{"monday_friday": "8am - 7pm", "saturday": "9am - 6pm", "sunday": "12pm - 5pm"}'),
  ('social_links', '{"instagram": "https://instagram.com/bamzycakes", "facebook": "https://facebook.com/bamzycakes", "whatsapp": "+2347033374470"}');
