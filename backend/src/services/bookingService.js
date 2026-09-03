import pool from '../config/db.js'

export async function createBooking({ customer_id, full_name, phone, email, event_type, event_date, event_location, guest_count, services_requested, notes }) {
  const result = await pool.query(`
    INSERT INTO event_bookings (customer_id, full_name, phone, email, event_type, event_date, event_location, guest_count, services_requested, notes)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING id, full_name as "fullName", event_type as "eventType",
              event_date as "eventDate", status, created_at as "createdAt"
  `, [customer_id || null, full_name, phone, email, event_type, event_date, event_location, guest_count, JSON.stringify(services_requested || []), notes])
  return result.rows[0]
}

export async function getBookingById(id) {
  const result = await pool.query(`
    SELECT id, customer_id as "customerId", full_name as "fullName", phone, email,
           event_type as "eventType", event_date as "eventDate",
           event_location as "eventLocation", guest_count as "guestCount",
           services_requested as "servicesRequested", notes, status,
           created_at as "createdAt"
    FROM event_bookings WHERE id = $1
  `, [id])
  return result.rows[0] || null
}

export async function getCustomerBookings(customerId) {
  const result = await pool.query(`
    SELECT id, event_type as "eventType", event_date as "eventDate",
           event_location as "eventLocation", status, created_at as "createdAt"
    FROM event_bookings WHERE customer_id = $1
    ORDER BY created_at DESC
  `, [customerId])
  return result.rows
}

export async function getAllBookings({ status, page = 1, limit = 50 }) {
  let query = `
    SELECT id, full_name as "fullName", phone, email,
           event_type as "eventType", event_date as "eventDate",
           event_location as "eventLocation", guest_count as "guestCount",
           status, created_at as "createdAt"
    FROM event_bookings WHERE 1=1
  `
  const params = []
  let idx = 1

  if (status) {
    query += ` AND status = $${idx++}`
    params.push(status)
  }

  query += ' ORDER BY created_at DESC'
  const offset = (page - 1) * limit
  query += ` LIMIT $${idx++} OFFSET $${idx++}`
  params.push(limit, offset)

  const result = await pool.query(query, params)
  return result.rows
}

export async function updateBookingStatus(bookingId, status) {
  const result = await pool.query(
    `UPDATE event_bookings SET status = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING id, status, updated_at as "updatedAt"`,
    [bookingId, status]
  )
  return result.rows[0] || null
}
