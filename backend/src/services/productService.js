import pool from '../config/db.js'

export async function getProducts({ category, search, availableToday, sort, page = 1, limit = 50 }) {
  let query = `
    SELECT p.id, p.name, p.slug, p.description, p.price, p.stock,
           p.available_today as "availableToday", p.status, p.image_url as "imageUrl",
           p.created_at as "createdAt",
           c.slug as category, c.label as "categoryLabel"
    FROM products p
    JOIN product_categories c ON p.category_id = c.id
    WHERE 1=1
  `
  const params = []
  let idx = 1

  if (category) {
    query += ` AND c.slug = $${idx++}`
    params.push(category)
  }
  if (search) {
    query += ` AND (LOWER(p.name) LIKE $${idx} OR LOWER(p.description) LIKE $${idx} OR LOWER(c.slug) LIKE $${idx})`
    params.push(`%${search.toLowerCase()}%`)
    idx++
  }
  if (availableToday === 'true') {
    query += ` AND p.available_today = true`
  }

  // Sort
  switch (sort) {
    case 'price_asc': query += ' ORDER BY p.price ASC'; break
    case 'price_desc': query += ' ORDER BY p.price DESC'; break
    case 'newest': query += ' ORDER BY p.created_at DESC'; break
    default: query += ' ORDER BY p.created_at DESC'; break
  }

  // Pagination
  const offset = (page - 1) * limit
  query += ` LIMIT $${idx++} OFFSET $${idx++}`
  params.push(limit, offset)

  const result = await pool.query(query, params)
  return result.rows
}

export async function getProductById(id) {
  const result = await pool.query(`
    SELECT p.id, p.name, p.slug, p.description, p.price, p.stock,
           p.available_today as "availableToday", p.status, p.image_url as "imageUrl",
           p.created_at as "createdAt", p.updated_at as "updatedAt",
           c.slug as category, c.label as "categoryLabel"
    FROM products p
    JOIN product_categories c ON p.category_id = c.id
    WHERE p.id = $1
  `, [id])
  return result.rows[0] || null
}

export async function getProductBySlug(slug) {
  const result = await pool.query(`
    SELECT p.id, p.name, p.slug, p.description, p.price, p.stock,
           p.available_today as "availableToday", p.status, p.image_url as "imageUrl",
           p.created_at as "createdAt",
           c.slug as category, c.label as "categoryLabel"
    FROM products p
    JOIN product_categories c ON p.category_id = c.id
    WHERE p.slug = $1
  `, [slug])
  return result.rows[0] || null
}

export async function getProductsAvailableToday() {
  const result = await pool.query(`
    SELECT p.id, p.name, p.slug, p.description, p.price, p.stock,
           p.available_today as "availableToday", p.status, p.image_url as "imageUrl",
           c.slug as category, c.label as "categoryLabel"
    FROM products p
    JOIN product_categories c ON p.category_id = c.id
    WHERE p.available_today = true AND p.status = 'active'
    ORDER BY p.created_at DESC
  `)
  return result.rows
}

export async function createProduct({ name, slug, description, price, category_id, stock, available_today, image_url }) {
  const result = await pool.query(`
    INSERT INTO products (name, slug, description, price, category_id, stock, available_today, image_url)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id, name, slug, description, price, stock, available_today as "availableToday",
              status, image_url as "imageUrl", created_at as "createdAt"
  `, [name, slug, description, price, category_id, stock || 0, available_today || false, image_url || null])
  return result.rows[0]
}

export async function updateProduct(id, updates) {
  const fields = []
  const values = []
  let idx = 1

  const allowed = ['name', 'slug', 'description', 'price', 'category_id', 'stock', 'available_today', 'status', 'image_url']
  for (const key of allowed) {
    if (updates[key] !== undefined) {
      fields.push(`${key} = $${idx++}`)
      values.push(updates[key])
    }
  }
  if (fields.length === 0) return getProductById(id)

  fields.push('updated_at = NOW()')
  values.push(id)

  const result = await pool.query(
    `UPDATE products SET ${fields.join(', ')} WHERE id = $${idx}
     RETURNING id, name, slug, description, price, stock, available_today as "availableToday",
               status, image_url as "imageUrl", created_at as "createdAt"`,
    values
  )
  return result.rows[0] || null
}

export async function deleteProduct(id) {
  await pool.query('DELETE FROM products WHERE id = $1', [id])
}

export async function getCategories() {
  const result = await pool.query('SELECT id, slug, label, sort_order as "sortOrder" FROM product_categories ORDER BY sort_order')
  return result.rows
}

export async function createCategory({ slug, label }) {
  const maxOrder = await pool.query('SELECT COALESCE(MAX(sort_order), 0) + 1 as next FROM product_categories')
  const sortOrder = maxOrder.rows[0].next
  const result = await pool.query(
    'INSERT INTO product_categories (slug, label, sort_order) VALUES ($1, $2, $3) RETURNING id, slug, label, sort_order as "sortOrder"',
    [slug, label, sortOrder]
  )
  return result.rows[0]
}

export async function updateCategory(id, { label }) {
  const result = await pool.query(
    'UPDATE product_categories SET label = $1 WHERE id = $2 RETURNING id, slug, label, sort_order as "sortOrder"',
    [label, id]
  )
  return result.rows[0] || null
}

export async function deleteCategory(id) {
  // Check if any products use this category
  const productCount = await pool.query('SELECT COUNT(*) FROM products WHERE category_id = $1', [id])
  if (parseInt(productCount.rows[0].count) > 0) {
    throw new Error('Cannot delete category with products. Move or delete products first.')
  }
  await pool.query('DELETE FROM product_categories WHERE id = $1', [id])
}
