-- 018: Update products to real Bamzy catalog
-- First, delete existing products and their order items
DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE order_number LIKE 'BAM-%');
DELETE FROM products;

-- Update categories to match Bamzy's structure
-- The existing categories should already be: cakes, small-chops, pastries, tiger-nuts, drinks, treats
-- If not, add them:
INSERT INTO product_categories (slug, label, sort_order) VALUES
  ('cakes', 'Cakes', 1),
  ('pastries', 'Pastries', 2)
ON CONFLICT (slug) DO UPDATE SET label = EXCLUDED.label, sort_order = EXCLUDED.sort_order;

-- Insert real Bamzy Cakes products
INSERT INTO products (name, slug, description, price, category_id, stock, available_today, status)
SELECT p.name, p.slug, p.description, p.price, c.id, p.stock, p.today, 'active'
FROM (VALUES
  ('Foil Cake', 'foil-cake', 'A beautifully wrapped cake perfect for gifts and celebrations, featuring moist layers and signature Bamzy frosting.', 18000, 'cakes', 5, true),
  ('Vanilla Cake Loaf', 'vanilla-cake-loaf', 'Soft, moist vanilla cake loaf baked with real vanilla and butter. Perfect for everyday indulgence.', 5500, 'cakes', 8, true),
  ('Whipped Cream Cake', 'whipped-cream-cake', 'Light sponge cake layered and topped with clouds of fresh whipped cream. A Bamzy favourite.', 15000, 'cakes', 4, true),
  ('Cupcake', 'cupcake', 'Individual mini cakes topped with swirls of buttercream frosting. Available in vanilla, chocolate, and red velvet.', 1500, 'cakes', 30, true),
  ('Chocolate Cake Loaf', 'chocolate-cake-loaf', 'Rich, fudgy chocolate cake loaf made with premium cocoa. A chocolate lovers dream.', 6000, 'cakes', 6, true),
  ('Buttercream Cake', 'buttercream-cake', 'Classic celebration cake with silky buttercream frosting. Customisable colours and designs.', 20000, 'cakes', 3, true),
  ('Wedding Cake', 'wedding-cake', 'Elegant multi-tier wedding cake crafted to match your special day. Designs available upon consultation.', 80000, 'cakes', 2, false),
  ('Red Velvet Cake Loaf', 'red-velvet-cake-loaf', 'Distinctive red velvet cake loaf with a subtle cocoa flavour and cream cheese swirl.', 6500, 'cakes', 5, true),
  ('Fondant Themed Cake', 'fondant-themed-cake', 'Custom-designed fondant cake for birthdays, weddings and special occasions. Tell us your vision.', 45000, 'cakes', 2, false),
  ('Cake Parfait', 'cake-parfait', 'Layers of crumbled cake, cream, and toppings served in a cup. A Bamzy original.', 3500, 'cakes', 12, true)
) AS p(name, slug, description, price, cat_slug, stock, today)
JOIN product_categories c ON c.slug = p.cat_slug
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price,
  stock = EXCLUDED.stock, available_today = EXCLUDED.available_today, status = 'active';

-- Insert real Bamzy Pastries products
INSERT INTO products (name, slug, description, price, category_id, stock, available_today, status)
SELECT p.name, p.slug, p.description, p.price, c.id, p.stock, p.today, 'active'
FROM (VALUES
  ('Spring Roll', 'spring-roll', 'Crispy golden spring rolls filled with seasoned vegetables. Freshly fried to order.', 500, 'pastries', 50, true),
  ('Samosa', 'samosa', 'Crispy triangular pastry filled with spiced minced meat. A classic Bamzy snack.', 600, 'pastries', 40, true),
  ('Puff Puff', 'puff-puff', 'Soft, golden Nigerian puff puff — fluffy on the inside, lightly crispy outside.', 200, 'pastries', 60, true),
  ('Fish Roll', 'fish-roll', 'Golden pastry roll filled with seasoned fish and spices. Perfect as a snack or side.', 700, 'pastries', 25, true),
  ('Milky Doughnut', 'milky-doughnut', 'Soft, pillowy doughnut coated in a sweet milky glaze. Irresistibly delicious.', 500, 'pastries', 30, true),
  ('Plain Doughnut', 'plain-doughnut', 'Classic plain doughnut, freshly fried and lightly dusted with sugar.', 400, 'pastries', 35, true),
  ('Crunchy Meat Pie', 'crunchy-meat-pie', 'Flaky, golden pie crust filled with seasoned minced meat and vegetables. Crunchy and satisfying.', 800, 'pastries', 20, true),
  ('Chinchin', 'chinchin', 'Crunchy, golden chin chin — a beloved Nigerian snack. Available in sweet and savoury.', 1500, 'pastries', 25, true),
  ('Doughnut', 'doughnut', 'Classic ring doughnut, freshly made daily. Available glazed or sugar-coated.', 450, 'pastries', 40, true)
) AS p(name, slug, description, price, cat_slug, stock, today)
JOIN product_categories c ON c.slug = p.cat_slug
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name, description = EXCLUDED.description, price = EXCLUDED.price,
  stock = EXCLUDED.stock, available_today = EXCLUDED.available_today, status = 'active';

-- Update trainings to match Bamzy offerings
UPDATE trainings SET
  title = 'Cake Decorating Masterclass',
  description = 'Learn professional cake decorating techniques from fondant work to buttercream piping. Perfect your skills with hands-on practice.',
  what_you_will_learn = '["Fondant covering and smoothing", "Buttercream piping techniques", "Flower making and placement", "Colour mixing and matching", "Tool selection and care"]',
  requirements = '["No prior experience needed", "Apron and notebook", "All materials provided"]'
WHERE slug = 'cake-decorating-masterclass';

UPDATE trainings SET
  title = 'Small Chops & Finger Foods',
  description = 'Master the art of making perfect puff puff, spring rolls, samosa, fish roll and more. Great for starting a small business.',
  what_you_will_learn = '["Puff puff perfection", "Spring roll wrapping and frying", "Samosa folding techniques", "Fish roll preparation", "Chin chin cutting and frying", "Business tips for selling small chops"]',
  requirements = '["Wear comfortable clothes", "Bring containers for take-home", "All ingredients provided"]'
WHERE slug = 'small-chops-finger-foods';

UPDATE trainings SET
  title = 'Baking Basics for Beginners',
  description = 'The perfect starting point for anyone who wants to learn how to bake from scratch. Build your confidence in the kitchen.',
  what_you_will_learn = '["Measuring and mixing fundamentals", "Oven temperature control", "Basic cake recipes from scratch", "Frosting fundamentals", "Tips for consistent results"]',
  requirements = '["No experience required", "All ingredients provided", "Bring a notebook"]'
WHERE slug = 'baking-basics-beginners';
