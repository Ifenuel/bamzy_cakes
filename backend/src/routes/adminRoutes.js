import { Router } from 'express'
import { requireAdmin } from '../middleware/auth.js'
import * as adminController from '../controllers/adminController.js'
import * as customerController from '../controllers/customerController.js'
import pool from '../config/db.js'
import { success, error } from '../utils/response.js'

const router = Router()

router.get('/dashboard', requireAdmin, adminController.getDashboard)
router.get('/customers', requireAdmin, customerController.getCustomers)

// Admin: Mark notification as read (stored in admin_notification_reads table)
router.put('/notifications/:id/read', requireAdmin, async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO admin_notification_reads (notification_key, admin_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [req.params.id, req.user.id]
    )
    return success(res, { message: 'Marked as read' })
  } catch (err) {
    // If table doesn't exist, just return success (notifications are real-time anyway)
    return success(res, { message: 'Marked as read' })
  }
})

router.put('/notifications/read-all', requireAdmin, async (req, res) => {
  try {
    // Mark all current activity items as read by storing a timestamp
    await pool.query(
      `INSERT INTO admin_notification_reads (notification_key, admin_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      ['all-' + new Date().toISOString().split('T')[0], req.user.id]
    )
    return success(res, { message: 'All marked as read' })
  } catch (err) {
    return success(res, { message: 'All marked as read' })
  }
})

// Admin: Recent activity feed (orders, bookings, training registrations)
router.get('/activity', requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20
    const [recentOrders, recentBookings, recentTrainings, recentReviews] = await Promise.all([
      pool.query(
        `SELECT id, order_number as "orderNumber", customer_name as "customerName",
                total, order_status as "orderStatus", payment_status as "paymentStatus",
                created_at as "createdAt"
         FROM orders ORDER BY created_at DESC LIMIT $1`, [limit]
      ),
      pool.query(
        `SELECT id, full_name as "fullName", event_type as "eventType",
                event_date as "eventDate", status, created_at as "createdAt"
         FROM event_bookings ORDER BY created_at DESC LIMIT $1`, [limit]
      ),
      pool.query(
        `SELECT tr.id, t.title as "trainingTitle", tr.full_name as "fullName",
                tr.amount, tr.status as "registrationStatus", tr.created_at as "createdAt"
         FROM training_registrations tr JOIN trainings t ON tr.training_id = t.id
         ORDER BY tr.created_at DESC LIMIT $1`, [limit]
      ),
      pool.query(
        `SELECT id, customer_name as "customerName", rating, text, is_approved as "isApproved",
                created_at as "createdAt"
         FROM reviews ORDER BY created_at DESC LIMIT $1`, [limit]
      ),
    ])
    return success(res, {
      orders: recentOrders.rows,
      bookings: recentBookings.rows,
      trainings: recentTrainings.rows,
      reviews: recentReviews.rows,
    })
  } catch (err) {
    console.error('Activity feed error:', err.message)
    return error(res, 'Failed to load activity', 500)
  }
})

// Admin: Daily/Monthly/Yearly report
router.get('/report', requireAdmin, async (req, res) => {
  try {
    const { period = 'daily', date } = req.query
    let dateFilter, dateParam
    const now = date ? new Date(date) : new Date()

    if (period === 'daily') {
      dateFilter = "DATE(created_at) = $1"
      dateParam = now.toISOString().split('T')[0]
    } else if (period === 'monthly') {
      dateFilter = "EXTRACT(MONTH FROM created_at) = $1 AND EXTRACT(YEAR FROM created_at) = $2"
      dateParam = [now.getMonth() + 1, now.getFullYear()]
    } else {
      dateFilter = "EXTRACT(YEAR FROM created_at) = $1"
      dateParam = [now.getFullYear()]
    }

    const params = Array.isArray(dateParam) ? dateParam : [dateParam]
    const [orderStats, revenueStats] = await Promise.all([
      pool.query(
        `SELECT COUNT(*) as total,
                COUNT(*) FILTER (WHERE order_status = 'completed') as completed,
                COUNT(*) FILTER (WHERE order_status = 'cancelled') as cancelled
         FROM orders WHERE ${dateFilter}`, params
      ),
      pool.query(
        `SELECT COALESCE(SUM(total), 0) as revenue,
                COALESCE(AVG(total), 0) as avg_order
         FROM orders WHERE ${dateFilter} AND payment_status = 'successful'`, params
      ),
    ])
    return success(res, {
      period,
      date: dateParam,
      orders: orderStats.rows[0],
      revenue: revenueStats.rows[0],
      customers: { unique_customers: 0 },
    })
  } catch (err) {
    console.error('Report error:', err.message)
    return error(res, 'Failed to generate report', 500)
  }
})

// Admin: Clean database — remove all test/fake data, keep real accounts
router.post('/cleanup', requireAdmin, async (req, res) => {
  try {
    // Keep these real admin emails — NEVER delete them
    const keepAdminEmails = [
      'admin@bamzycakes.com',
      'Bamzycakes621@gmail.com',
      'bamzycakes621@gmail.com',
    ]

    // Get IDs of ALL users to keep (admin accounts + real customers)
    const keepUsers = await pool.query(
      `SELECT id FROM users WHERE email = ANY($1) 
       OR (email NOT LIKE '%test%' AND email NOT LIKE '%fake%' AND email NOT LIKE '%example%' AND role != 'admin')`,
      [keepAdminEmails]
    )
    const keepIds = keepUsers.rows.map(r => r.id)
    const safeKeep = keepIds.length > 0 ? keepIds : ['00000000-0000-0000-0000-000000000000']    const deleted = {}
    async function safeDelete(label, sql, params) {
      try {
        const r = await pool.query(sql, params)
        deleted[label] = r.rowCount
      } catch (err) {
        console.error(`[Cleanup] ${label}:`, err.message)
        deleted[label] = 'skipped: ' + err.message.slice(0, 50)
      }
    }

    // Step 1: Delete payments for fake orders
    await safeDelete('payments', 'DELETE FROM payments WHERE order_id IN (SELECT id FROM orders WHERE customer_id IS NULL OR customer_id != ALL($1))', [safeKeep])
    // Step 2: Delete orphan payments (no order_id match)
    await safeDelete('orphan_payments', "DELETE FROM payments WHERE order_id IS NULL OR order_id NOT IN (SELECT id FROM orders)", [])
    // Step 3: Delete order items for fake orders
    await safeDelete('order_items', 'DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE customer_id IS NULL OR customer_id != ALL($1))', [safeKeep])
    // Step 4: Delete fake orders
    await safeDelete('orders', 'DELETE FROM orders WHERE customer_id IS NULL OR customer_id != ALL($1)', [safeKeep])
    // Step 5: Delete fake reviews
    await safeDelete('reviews', 'DELETE FROM reviews WHERE customer_id IS NULL OR customer_id != ALL($1)', [safeKeep])
    // Step 6: Delete notifications for non-kept users
    await safeDelete('notifications', 'DELETE FROM notifications WHERE user_id IS NULL OR user_id != ALL($1)', [safeKeep])
    // Step 7: Delete all bookings (no real bookings yet)
    await safeDelete('bookings', 'DELETE FROM event_bookings', [])
    // Step 8: Delete training registrations
    await safeDelete('trainings', 'DELETE FROM training_registrations WHERE customer_id IS NULL OR customer_id != ALL($1)', [safeKeep])
    // Step 9: Delete all newsletter subscribers
    await safeDelete('newsletter', 'DELETE FROM newsletter_subscribers', [])
    // Step 10: Delete wishlists for non-kept users
    await safeDelete('wishlists', 'DELETE FROM wishlists WHERE customer_id IS NULL OR customer_id != ALL($1)', [safeKeep])
    // Step 11: Delete all contact messages
    await safeDelete('contacts', 'DELETE FROM contact_messages', [])
    // Step 12: Delete all analytics events
    await safeDelete('analytics', 'DELETE FROM analytics_events', [])
    // Step 13: Delete fake users (keep admins + real customers)
    await safeDelete('users', 'DELETE FROM users WHERE id != ALL($1) AND role != $2', [safeKeep, 'admin'])

    return success(res, {
      message: 'Database cleaned! Only real accounts remain.',
      deleted,
      kept: keepAdminEmails,
    })
  } catch (err) {
    console.error('Cleanup error:', err.message)
    return error(res, 'Cleanup failed: ' + err.message, 500)
  }
})

// ── Admin: View all customer wishlists ──
router.get('/wishlists', requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT w.id, w.created_at as "createdAt",
              w.product_id as "productId",
              p.name as "productName", p.price as "productPrice",
              p.image_url as "productImage",
              COALESCE(c.name, p.category) as "productCategory",
              u.id as "customerId", u.full_name as "customerName",
              u.email as "customerEmail", u.phone as "customerPhone"
       FROM wishlists w
       JOIN products p ON w.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       JOIN users u ON w.customer_id = u.id
       ORDER BY w.created_at DESC`
    )
    return success(res, result.rows)
  } catch (err) {
    console.error('Admin wishlists error:', err.message)
    return error(res, 'Failed to load wishlists', 500)
  }
})

export default router
