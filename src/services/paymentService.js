import pool from '../config/db.js'

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_API = 'https://api.paystack.co'

// Idempotency: check if there's already a pending payment for this order
async function findExistingPendingPayment(orderId) {
  if (!orderId) return null
  const result = await pool.query(
    "SELECT id, reference, status FROM payments WHERE order_id = $1 AND status = 'pending' ORDER BY created_at DESC LIMIT 1",
    [orderId]
  )
  return result.rows[0] || null
}

// Initialize a Paystack transaction with idempotency
export async function initializePayment({ email, amount, order_id, training_registration_id, metadata = {} }) {
  // Check for existing pending payment (idempotency)
  if (order_id) {
    const existing = await findExistingPendingPayment(order_id)
    if (existing) {
      // Return the existing payment reference instead of creating a duplicate
      return {
        reference: existing.reference,
        message: 'Existing payment found',
      }
    }
  }

  // Amount must be in kobo (Naira x 100)
  const amountInKobo = Math.round(amount * 100)

  const response = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      amount: amountInKobo,
      currency: 'NGN',
      metadata: {
        order_id: order_id || null,
        training_registration_id: training_registration_id || null,
        ...metadata,
      },
    }),
  })

  const result = await response.json()

  if (!result.status) {
    throw new Error(result.message || 'Payment initialization failed')
  }

  // Save payment record
  const reference = result.data.reference
  const dbResult = await pool.query(`
    INSERT INTO payments (order_id, training_registration_id, reference, amount, currency, provider, status)
    VALUES ($1, $2, $3, $4, 'NGN', 'paystack', 'pending')
    RETURNING id, reference, status
  `, [order_id || null, training_registration_id || null, reference, amount])

  return {
    authorization_url: result.data.authorization_url,
    reference,
    access_code: result.data.access_code,
    payment: dbResult.rows[0],
  }
}

// Verify a Paystack transaction (idempotent — safe to call multiple times)
export async function verifyPayment(reference) {
  const response = await fetch(`${PAYSTACK_API}/transaction/verify/${reference}`, {
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
    },
  })

  const result = await response.json()

  if (!result.status) {
    throw new Error(result.message || 'Payment verification failed')
  }

  const tx = result.data
  const paymentStatus = tx.status === 'success' ? 'successful' : 'failed'

  // Check if already updated (idempotency)
  const existingPayment = await pool.query(
    'SELECT status FROM payments WHERE reference = $1',
    [reference]
  )
  if (existingPayment.rows[0]?.status === 'successful') {
    // Already verified — return existing result
    return {
      status: 'successful',
      reference,
      amount: tx.amount / 100,
      metadata: tx.metadata,
    }
  }

  // Update payment record
  await pool.query(`
    UPDATE payments SET status = $2, provider_response = $3, updated_at = NOW()
    WHERE reference = $1
  `, [reference, paymentStatus, JSON.stringify(tx)])

  // If payment is for an order, update the order payment status and order status
  if (tx.metadata?.order_id) {
    await pool.query(`
      UPDATE orders SET payment_status = $2, order_status = CASE WHEN $2 = 'successful' THEN 'confirmed' ELSE order_status END, updated_at = NOW()
      WHERE id = $1
    `, [tx.metadata.order_id, paymentStatus])

    // Send order confirmation email if payment successful
    if (paymentStatus === 'successful') {
      try {
        const { sendOrderConfirmation } = await import('./emailService.js')
        const orderResult = await pool.query(
          `SELECT id, customer_name, customer_email, customer_phone, total, order_number,
                  delivery_method, delivery_address, delivery_city
           FROM orders WHERE id = $1`,
          [tx.metadata.order_id]
        )
        const orderItems = await pool.query(
          `SELECT product_name_snapshot as product_name, quantity, unit_price, subtotal as total_price
           FROM order_items WHERE order_id = $1`,
          [tx.metadata.order_id]
        )
        if (orderResult.rows[0]) {
          await sendOrderConfirmation(orderResult.rows[0].customer_email, {
            ...orderResult.rows[0],
            items: orderItems.rows,
          })
        }
      } catch (emailErr) {
        console.error('[EMAIL] Failed to send order confirmation:', emailErr.message)
      }
    }
  }

  // If payment is for training registration, update it
  if (tx.metadata?.training_registration_id) {
    await pool.query(`
      UPDATE training_registrations SET payment_status = $2
      WHERE id = $1
    `, [tx.metadata.training_registration_id, paymentStatus])
  }

  return {
    status: paymentStatus,
    reference,
    amount: tx.amount / 100, // Convert from kobo to Naira
    metadata: tx.metadata,
  }
}

// Handle Paystack webhook (with signature verification)
export async function handleWebhook(payload, signature) {
  // Verify webhook signature
  const crypto = await import('crypto')
  const hash = crypto.createHmac('sha512', PAYSTACK_SECRET).update(JSON.stringify(payload)).digest('base64')

  if (hash !== signature) {
    throw new Error('Invalid webhook signature')
  }

  const { event, data } = payload

  if (event === 'charge.success') {
    const reference = data.reference
    await verifyPayment(reference)
  }

  // Log webhook event for audit trail
  try {
    await pool.query(`
      INSERT INTO analytics_events (event_name, session_id, metadata)
      VALUES ('payment_webhook', 'system', $1)
    `, [JSON.stringify({ event, reference: data?.reference })])
  } catch {
    // Don't fail webhook processing if analytics logging fails
  }

  return { received: true }
}

// Get payment by reference
export async function getPaymentByReference(reference) {
  const result = await pool.query(
    'SELECT * FROM payments WHERE reference = $1',
    [reference]
  )
  return result.rows[0] || null
}

// Get all payments (admin)
export async function getPayments({ page = 1, limit = 50 }) {
  const offset = (page - 1) * limit
  const result = await pool.query(`
    SELECT p.id, p.reference, p.amount, p.currency, p.provider, p.status,
           p.created_at as "createdAt",
           o.order_number as "orderNumber", o.customer_name as "customerName"
    FROM payments p
    LEFT JOIN orders o ON p.order_id = o.id
    ORDER BY p.created_at DESC
    LIMIT $1 OFFSET $2
  `, [limit, offset])
  return result.rows
}
