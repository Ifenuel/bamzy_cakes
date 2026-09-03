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

export async function deleteAccount(req, res) {
  try {
    const { reason } = req.body
    const userId = req.user.id

    // Log the deletion reason
    if (reason) {
      await pool.query(
        `INSERT INTO analytics_events (event_name, session_id, metadata)
         VALUES ('account_deletion', $1, $2)`,
        [userId, JSON.stringify({ reason, email: req.user.email })]
      )
    }

    // Delete user (cascades to orders, bookings, etc via FK constraints)
    await pool.query('DELETE FROM users WHERE id = $1', [userId])

    return success(res, { message: 'Account deleted successfully' })
  } catch (err) {
    return safeError(res, err, 'Failed to delete account', 500)
  }
}

export async function getNotifications(req, res) {
  try {
    const result = await pool.query(
      `SELECT id, title, message, type, reference_id as "referenceId",
              reference_type as "referenceType", is_read as "isRead", created_at as "createdAt"
       FROM notifications WHERE user_id = $1
       ORDER BY created_at DESC LIMIT 50`,
      [req.user.id]
    )
    return success(res, result.rows)
  } catch (err) {
    return safeError(res, err, 'Failed to load notifications', 500)
  }
}

export async function markNotificationRead(req, res) {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    )
    return success(res, { message: 'Marked as read' })
  } catch (err) {
    return safeError(res, err, 'Failed to update notification', 500)
  }
}

export async function markAllNotificationsRead(req, res) {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false',
      [req.user.id]
    )
    return success(res, { message: 'All marked as read' })
  } catch (err) {
    return safeError(res, err, 'Failed to update notifications', 500)
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
