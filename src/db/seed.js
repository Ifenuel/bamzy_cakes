import bcrypt from 'bcrypt'
import pool from '../config/db.js'

const SALT_ROUNDS = 10

async function seed() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // 1. Admin user (password: admin123)
    const adminHash = await bcrypt.hash('admin123', SALT_ROUNDS)
    await client.query(`
      INSERT INTO users (full_name, email, phone, password_hash, role)
      VALUES ($1, $2, $3, $4, 'admin')
      ON CONFLICT (email) DO NOTHING
    `, ['Bamzy Admin', 'admin@bamzycakes.com', '+2348012345678', adminHash])

    // 2. Sample customer (password: customer123)
    const custHash = await bcrypt.hash('customer123', SALT_ROUNDS)
    await client.query(`
      INSERT INTO users (full_name, email, phone, password_hash, role)
      VALUES ($1, $2, $3, $4, 'customer')
      ON CONFLICT (email) DO NOTHING
    `, ['Ada Okafor', 'ada@example.com', '+2348023456789', custHash])

    // 3. Get category IDs
    const cats = await client.query('SELECT id, slug FROM product_categories')
    const catMap = {}
    cats.rows.forEach(c => { catMap[c.slug] = c.id })

    // 4. Products — Bamzy real catalog
    const products = [
      // === CAKES ===
      { name: 'Foil Cake', slug: 'foil-cake', desc: 'A beautifully wrapped cake perfect for gifts and celebrations, featuring moist layers and signature Bamzy frosting.', price: 18000, cat: 'cakes', stock: 5, today: true },
      { name: 'Vanilla Cake Loaf', slug: 'vanilla-cake-loaf', desc: 'Soft, moist vanilla cake loaf baked with real vanilla and butter. Perfect for everyday indulgence.', price: 5500, cat: 'cakes', stock: 8, today: true },
      { name: 'Whipped Cream Cake', slug: 'whipped-cream-cake', desc: 'Light sponge cake layered and topped with clouds of fresh whipped cream. A Bamzy favourite.', price: 15000, cat: 'cakes', stock: 4, today: true },
      { name: 'Cupcake', slug: 'cupcake', desc: 'Individual mini cakes topped with swirls of buttercream frosting. Available in vanilla, chocolate, and red velvet.', price: 1500, cat: 'cakes', stock: 30, today: true },
      { name: 'Chocolate Cake Loaf', slug: 'chocolate-cake-loaf', desc: 'Rich, fudgy chocolate cake loaf made with premium cocoa. A chocolate lover\'s dream.', price: 6000, cat: 'cakes', stock: 6, today: true },
      { name: 'Buttercream Cake', slug: 'buttercream-cake', desc: 'Classic celebration cake with silky buttercream frosting. Customisable colours and designs.', price: 20000, cat: 'cakes', stock: 3, today: true },
      { name: 'Wedding Cake', slug: 'wedding-cake', desc: 'Elegant multi-tier wedding cake crafted to match your special day. Designs available upon consultation.', price: 80000, cat: 'cakes', stock: 2, today: false },
      { name: 'Red Velvet Cake Loaf', slug: 'red-velvet-cake-loaf', desc: 'Distinctive red velvet cake loaf with a subtle cocoa flavour and cream cheese swirl.', price: 6500, cat: 'cakes', stock: 5, today: true },
      { name: 'Fondant Themed Cake', slug: 'fondant-themed-cake', desc: 'Custom-designed fondant cake for birthdays, weddings and special occasions. Tell us your vision.', price: 45000, cat: 'cakes', stock: 2, today: false },
      { name: 'Cake Parfait', slug: 'cake-parfait', desc: 'Layers of crumbled cake, cream, and toppings served in a cup. A Bamzy original.', price: 3500, cat: 'cakes', stock: 12, today: true },
      // === PASTRIES ===
      { name: 'Spring Roll', slug: 'spring-roll', desc: 'Crispy golden spring rolls filled with seasoned vegetables. Freshly fried to order.', price: 500, cat: 'pastries', stock: 50, today: true },
      { name: 'Samosa', slug: 'samosa', desc: 'Crispy triangular pastry filled with spiced minced meat. A classic Bamzy snack.', price: 600, cat: 'pastries', stock: 40, today: true },
      { name: 'Puff Puff', slug: 'puff-puff', desc: 'Soft, golden Nigerian puff puff — fluffy on the inside, lightly crispy outside.', price: 200, cat: 'pastries', stock: 60, today: true },
      { name: 'Fish Roll', slug: 'fish-roll', desc: 'Golden pastry roll filled with seasoned fish and spices. Perfect as a snack or side.', price: 700, cat: 'pastries', stock: 25, today: true },
      { name: 'Milky Doughnut', slug: 'milky-doughnut', desc: 'Soft, pillowy doughnut coated in a sweet milky glaze. Irresistibly delicious.', price: 500, cat: 'pastries', stock: 30, today: true },
      { name: 'Plain Doughnut', slug: 'plain-doughnut', desc: 'Classic plain doughnut, freshly fried and lightly dusted with sugar.', price: 400, cat: 'pastries', stock: 35, today: true },
      { name: 'Crunchy Meat Pie', slug: 'crunchy-meat-pie', desc: 'Flaky, golden pie crust filled with seasoned minced meat and vegetables. Crunchy and satisfying.', price: 800, cat: 'pastries', stock: 20, today: true },
      { name: 'Chinchin', slug: 'chinchin', desc: 'Crunchy, golden chin chin — a beloved Nigerian snack. Available in sweet and savoury.', price: 1500, cat: 'pastries', stock: 25, today: true },
      { name: 'Doughnut', slug: 'doughnut', desc: 'Classic ring doughnut, freshly made daily. Available glazed or sugar-coated.', price: 450, cat: 'pastries', stock: 40, today: true },
    ]

    for (const p of products) {
      await client.query(`
        INSERT INTO products (name, slug, description, price, category_id, stock, available_today, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
        ON CONFLICT (slug) DO NOTHING
      `, [p.name, p.slug, p.desc, p.price, catMap[p.cat], p.stock, p.today])
    }

    // 5. Trainings
    const trainings = [
      {
        title: 'Cake Decorating Masterclass', slug: 'cake-decorating-masterclass',
        desc: 'Learn professional cake decorating techniques from fondant work to buttercream piping.',
        date: '2026-09-15', start: '10:00', end: '14:00', loc: 'Bamzy Kitchen Studio, Lekki',
        price: 35000, cap: 15, spaces: 12,
        learn: ['Fondant covering', 'Buttercream piping', 'Flower making', 'Colour mixing'],
        req: ['No prior experience needed', 'Apron and notebook'],
      },
      {
        title: 'Small Chops & Finger Foods', slug: 'small-chops-finger-foods',
        desc: 'Master the art of making perfect puff puff, spring rolls, samosa and more.',
        date: '2026-09-22', start: '09:00', end: '13:00', loc: 'Bamzy Kitchen Studio, Lekki',
        price: 25000, cap: 20, spaces: 18,
        learn: ['Puff puff perfection', 'Spring roll wrapping', 'Samosa folding', 'Chin chin cutting'],
        req: ['Wear comfortable clothes', 'Bring containers for take-home'],
      },
      {
        title: 'Baking Basics for Beginners', slug: 'baking-basics-beginners',
        desc: 'The perfect starting point for anyone who wants to learn how to bake from scratch.',
        date: '2026-10-05', start: '10:00', end: '15:00', loc: 'Bamzy Kitchen Studio, Lekki',
        price: 20000, cap: 10, spaces: 8,
        learn: ['Measuring and mixing', 'Oven temperature control', 'Basic cake recipes', 'Frosting fundamentals'],
        req: ['No experience required', 'All ingredients provided'],
      },
    ]

    for (const t of trainings) {
      await client.query(`
        INSERT INTO trainings (title, slug, description, date, start_time, end_time, location, price, capacity, available_spaces, what_you_will_learn, requirements)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT (slug) DO NOTHING
      `, [t.title, t.slug, t.desc, t.date, t.start, t.end, t.loc, t.price, t.cap, t.spaces, JSON.stringify(t.learn), JSON.stringify(t.req)])
    }

    // 6. Sample orders
    const adminResult = await client.query("SELECT id FROM users WHERE email = 'admin@bamzycakes.com'")
    const adminId = adminResult.rows[0]?.id

    if (adminId) {
      const orderNum = 'BAM-100001'
      const orderRes = await client.query(`
        INSERT INTO orders (customer_id, order_number, customer_name, customer_email, customer_phone, subtotal, delivery_fee, total, delivery_method, delivery_address, delivery_city, delivery_state, payment_status, order_status)
        VALUES ($1, $2, $3, $4, $5, 27000, 1500, 28500, 'delivery', '12 Admiralty Way, Lekki', 'Lagos', 'Lagos', 'pending', 'confirmed')
        ON CONFLICT (order_number) DO NOTHING
        RETURNING id
      `, [adminId, orderNum, 'Bamzy Admin', 'admin@bamzycakes.com', '+2348012345678'])

      if (orderRes.rows.length > 0) {
        const orderId = orderRes.rows[0].id
        // Get a product for the order item
        const prodRes = await client.query("SELECT id, name, price FROM products WHERE slug = 'red-velvet-celebration-cake'")
        if (prodRes.rows.length > 0) {
          const prod = prodRes.rows[0]
          await client.query(`
            INSERT INTO order_items (order_id, product_id, product_name_snapshot, unit_price, quantity, subtotal)
            VALUES ($1, $2, $3, $4, 1, $5)
          `, [orderId, prod.id, prod.name, prod.price, prod.price])
        }
      }
    }

    await client.query('COMMIT')
    console.log('✅ Seed complete!')
    console.log('')
    console.log('Test credentials:')
    console.log('  Admin:    admin@bamzycakes.com / admin123')
    console.log('  Customer: ada@example.com / customer123')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

seed().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
