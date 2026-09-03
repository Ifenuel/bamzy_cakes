-- 002: Product categories
CREATE TABLE product_categories (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO product_categories (slug, label, sort_order) VALUES
  ('cakes', 'Cakes', 1),
  ('small-chops', 'Small Chops', 2),
  ('pastries', 'Pastries', 3),
  ('tiger-nuts', 'Tiger Nuts', 4),
  ('drinks', 'Drinks', 5),
  ('treats', 'Treats', 6);
