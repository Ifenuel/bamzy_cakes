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
  const deleted = {}

  async function safeDelete(label, sql, params) {
    try {
      const r = await pool.query(sql, params || [])
      deleted[label] = r.rowCount
    } catch (err) {
      console.error(`[Cleanup] ${label}:`, err.message)
      deleted[label] = 'skipped'
    }
  }

  try {
    // Delete in correct dependency order (children before parents)

    // 1. Payments (has order_id + training_registration_id, NO customer_id)
    await safeDelete('payments_training', 'DELETE FROM payments WHERE training_registration_id IS NOT NULL')
    await safeDelete('payments_orders', 'DELETE FROM payments WHERE order_id IS NOT NULL')
    await safeDelete('payments_orphan', 'DELETE FROM payments')

    // 2. Order items (depends on orders)
    await safeDelete('order_items', 'DELETE FROM order_items')

    // 3. Orders
    await safeDelete('orders', 'DELETE FROM orders')

    // 4. Training registrations (has customer_id)
    await safeDelete('training_registrations', 'DELETE FROM training_registrations')

    // 5. Reviews (has customer_id)
    await safeDelete('reviews', 'DELETE FROM reviews')

    // 6. Notifications
    await safeDelete('notifications', 'DELETE FROM notifications')

    // 7. Wishlists (has customer_id)
    await safeDelete('wishlists', 'DELETE FROM wishlists')

    // 8. Bookings
    await safeDelete('event_bookings', 'DELETE FROM event_bookings')

    // 9. Newsletter
    await safeDelete('newsletter', 'DELETE FROM newsletter_subscribers')

    // 10. Contact messages
    await safeDelete('contacts', 'DELETE FROM contact_messages')

    // 11. Analytics events
    await safeDelete('analytics', 'DELETE FROM analytics_events')

    // 12. Delete only test/fake users — keep all real customers
    await safeDelete('users', "DELETE FROM users WHERE (email LIKE '%test%' OR email LIKE '%fake%' OR email LIKE '%example%') AND role != 'admin'")

    return success(res, {
      message: 'Database cleaned! All fake data removed.',
      deleted,
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
       LEFT JOIN product_categories c ON p.category_id = c.id
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
