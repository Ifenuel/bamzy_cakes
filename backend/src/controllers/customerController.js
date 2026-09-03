import pool from '../config/db.js'
import * as authService from '../services/authService.js'
import * as orderService from '../services/orderService.js'
import * as bookingService from '../services/bookingService.js'
import { success, error } from '../utils/response.js'
import { safeError } from '../utils/safeError.js'

export async function getAccount(req, res) {
  try {
    const user = await authService.getMe(req.user.id)
    const orders = await orderService.getCustomerOrders(req.user.id)

    const bookingsRes = await pool.query(
      `SELECT id, event_type as "eventType", event_date as "eventDate", status, created_at as "createdAt"
       FROM event_bookings WHERE customer_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    )

    const trainingRes = await pool.query(
      `SELECT tr.id, t.title as "trainingTitle", tr.number_of_students as "numberOfStudents",
              tr.amount, tr.status as "registrationStatus", tr.created_at as "createdAt"
       FROM training_registrations tr
       JOIN trainings t ON tr.training_id = t.id
       WHERE tr.customer_id = $1
       ORDER BY tr.created_at DESC`,
      [req.user.id]
    )

    return success(res, {
      user,
      orders,
      bookings: bookingsRes.rows,
      trainingRegistrations: trainingRes.rows,
    })
  } catch (err) {
    return safeError(res, err, 'Internal server error', 500)
  }
}

export async function updateAccount(req, res) {
  try {
    const user = await authService.updateProfile(req.user.id, req.body)
    return success(res, user)
  } catch (err) {
    return safeError(res, err, 'Internal server error', 500)
  }
}

export async function getCustomers(_req, res) {
  try {
    const result = await pool.query(`
      SELECT u.id, u.full_name as "fullName", u.email, u.phone, u.created_at as "createdAt",
             COUNT(DISTINCT o.id) as "orderCount",
             COALESCE(SUM(o.total), 0) as "totalSpent"
      FROM users u
      LEFT JOIN orders o ON o.customer_id = u.id
      WHERE u.role = 'customer'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `)
    return success(res, result.rows)
  } catch (err) {
    return safeError(res, err, 'Internal server error', 500)
  }
}
