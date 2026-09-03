import pool from '../config/db.js'

export async function createOrder({ customer_id, customer_name, customer_email, customer_phone, items, delivery_method, delivery_address, delivery_city, delivery_state, delivery_notes }) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Generate order number
    const countRes = await client.query('SELECT COUNT(*) FROM orders')
    const orderNum = 'BAM-' + String(100001 + parseInt(countRes.rows[0].count))

    let subtotal = 0
    const orderItems = []

    // Validate products and calculate prices server-side
    for (const item of items) {
      const prodRes = await client.query(
        'SELECT id, name, price, stock FROM products WHERE id = $1',
        [item.productId]
      )
      if (prodRes.rows.length === 0) {
        throw new Error(`Product not found: ${item.productId}`)
      }
      const prod = prodRes.rows[0]

      if (prod.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${prod.name}. Available: ${prod.stock}`)
      }

      const itemSubtotal = prod.price * item.quantity
      subtotal += itemSubtotal

      orderItems.push({
        product_id: prod.id,
        product_name_snapshot: prod.name,
        unit_price: prod.price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      })

      // Decrease stock with row-level locking
      const stockRes = await client.query(
        'UPDATE products SET stock = stock - $2, updated_at = NOW() WHERE id = $1 AND stock >= $2 RETURNING id',
        [prod.id, item.quantity]
      )
      if (stockRes.rows.length === 0) {
        throw new Error(`Stock changed for ${prod.name}. Please try again.`)
      }
    }

    // Calculate delivery fee based on location
    let deliveryFee = 0
    if (delivery_method === 'delivery') {
      const cityLower = (delivery_city || '').toLowerCase().trim()
      const stateLower = (delivery_state || '').toLowerCase().trim()

      // Determine zone slug
      let zoneSlug = 'ibadan'
      if (cityLower.includes('ibadan') || stateLower === 'oyo') {
        zoneSlug = 'ibadan'
      } else if (cityLower.includes('lagos') || stateLower === 'lagos') {
        zoneSlug = 'lagos'
      } else if (stateLower === 'ogun' || cityLower.includes('abeokuta') || cityLower.includes('ijebu')) {
        zoneSlug = 'ogun'
      } else if (stateLower === 'ondo' || cityLower.includes('akure')) {
        zoneSlug = 'ondo'
      } else if (stateLower === 'ekiti' || cityLower.includes('ado-ekiti')) {
        zoneSlug = 'ekiti'
      } else if (stateLower === 'osun' || cityLower.includes('osogbo') || cityLower.includes('ife')) {
        zoneSlug = 'osun'
      }

      const zoneRes = await client.query(
        'SELECT delivery_fee FROM delivery_zones WHERE zone_slug = $1 AND is_active = true',
        [zoneSlug]
      )
      deliveryFee = zoneRes.rows.length > 0 ? parseFloat(zoneRes.rows[0].delivery_fee) : 1500
    }
    const total = subtotal + deliveryFee

    // Create order
    const orderRes = await client.query(`
      INSERT INTO orders (customer_id, order_number, customer_name, customer_email, customer_phone,
        subtotal, delivery_fee, total, delivery_method, delivery_address, delivery_city, delivery_state, delivery_notes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id, order_number as "orderNumber", customer_name as "customerName",
                subtotal, delivery_fee as "deliveryFee", total, delivery_method as "deliveryMethod",
                payment_status as "paymentStatus", order_status as "orderStatus", created_at as "createdAt"
    `, [customer_id || null, orderNum, customer_name, customer_email, customer_phone,
        subtotal, deliveryFee, total, delivery_method,
        delivery_address, delivery_city, delivery_state, delivery_notes])

    const order = orderRes.rows[0]

    // Create order items
    for (const oi of orderItems) {
      await client.query(`
        INSERT INTO order_items (order_id, product_id, product_name_snapshot, unit_price, quantity, subtotal)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [order.id, oi.product_id, oi.product_name_snapshot, oi.unit_price, oi.quantity, oi.subtotal])
    }

    await client.query('COMMIT')

    // Fetch complete order with items
    return getOrderById(order.id)
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

export async function getOrderById(orderId) {
  const orderRes = await pool.query(`
    SELECT id, order_number as "orderNumber", customer_id as "customerId",
           customer_name as "customerName", customer_email as "customerEmail",
           customer_phone as "customerPhone",
           subtotal, delivery_fee as "deliveryFee", total,
           delivery_method as "deliveryMethod", delivery_address as "deliveryAddress",
           delivery_city as "deliveryCity", delivery_state as "deliveryState",
           delivery_notes as "deliveryNotes",
           payment_status as "paymentStatus", order_status as "orderStatus",
           created_at as "createdAt"
    FROM orders WHERE id = $1
  `, [orderId])

  if (orderRes.rows.length === 0) return null

  const order = orderRes.rows[0]

  const itemsRes = await pool.query(`
    SELECT oi.id, oi.product_id as "productId", oi.product_name_snapshot as "name",
           oi.unit_price as "unitPrice", oi.quantity, oi.subtotal,
           p.image_url as "imageUrl"
    FROM order_items oi
    LEFT JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = $1
  `, [orderId])

  return { ...order, items: itemsRes.rows }
}

export async function getCustomerOrders(customerId) {
  const result = await pool.query(`
    SELECT id, order_number as "orderNumber", customer_name as "customerName",
           subtotal, total, delivery_method as "deliveryMethod",
           payment_status as "paymentStatus", order_status as "orderStatus",
           created_at as "createdAt"
    FROM orders WHERE customer_id = $1
    ORDER BY created_at DESC
  `, [customerId])
  return result.rows
}

// getAllOrders
export async function getAllOrders({ search, status, page = 1, limit = 50 }) {
  let query = `
    SELECT o.id, o.order_number as "orderNumber", o.customer_id as "customerId",
           o.customer_name as "customerName", o.customer_email as "customerEmail",
           o.subtotal, o.total, o.delivery_method as "deliveryMethod",
           o.payment_status as "paymentStatus", o.order_status as "orderStatus",
           o.created_at as "createdAt"
    FROM orders o WHERE 1=1
  `
  const params = []
  let idx = 1

  if (status) {
    query += ` AND o.order_status = $${idx++}`
    params.push(status)
  }
  if (search) {
    query += ` AND (LOWER(o.customer_name) LIKE $${idx} OR LOWER(o.order_number) LIKE $${idx})`
    params.push(`%${search.toLowerCase()}%`)
    idx++
  }

  query += ' ORDER BY o.created_at DESC'

  const offset = (page - 1) * limit
  query += ` LIMIT $${idx++} OFFSET $${idx++}`
  params.push(limit, offset)

  const result = await pool.query(query, params)
  return result.rows
}

export async function updateOrderStatus(orderId, order_status) {
  const result = await pool.query(
    `UPDATE orders SET order_status = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING id, order_number as "orderNumber", order_status as "orderStatus", updated_at as "updatedAt"`,
    [orderId, order_status]
  )
  return result.rows[0] || null
}
