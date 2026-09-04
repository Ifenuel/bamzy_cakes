import { Router } from 'express'
import { requireAdmin } from '../middleware/auth.js'
import * as adminController from '../controllers/adminController.js'
import * as customerController from '../controllers/customerController.js'
import pool from '../config/db.js'
import { success, error } from '../utils/response.js'

const router = Router()

router.get('/dashboard', requireAdmin, adminController.getDashboard)
router.get('/customers', requireAdmin, customerController.getCustomers)

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
    const [orderStats, revenueStats, customerStats] = await Promise.all([
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
      pool.query(
        `SELECT COUNT(DISTINCT customer_id) as unique_customers
         FROM orders WHERE ${dateFilter}`
      ),
    ])
    return success(res, {
      period,
      date: dateParam,
      orders: orderStats.rows[0],
      revenue: revenueStats.rows[0],
      customers: customerStats.rows[0],
    })
  } catch (err) {
    console.error('Report error:', err.message)
    return error(res, 'Failed to generate report', 500)
  }
})

// Admin: Clean database — remove all test/fake data, keep real accounts
router.post('/cleanup', requireAdmin, async (req, res) => {
  try {
    // Keep these real emails — NEVER delete them
    const keepEmails = [
      'admin@bamzycakes.com',
      'Bamzycakes621@gmail.com',
      'bamzycakes621@gmail.com',
    ]
    
    // 1. Get IDs of users to keep (all non-test users)
    const keepUsers = await pool.query(
      `SELECT id FROM users WHERE email = ANY($1) 
       OR (email NOT LIKE '%test%' AND email NOT LIKE '%fake%' AND email NOT LIKE '%example.com' AND role != 'admin')`,
      [keepEmails]
    )
    const keepIds = keepUsers.rows.map(r => r.id)
    
    // 2. Delete payments for fake orders
    await pool.query(
      'DELETE FROM payments WHERE order_id IN (SELECT id FROM orders WHERE customer_id != ALL($1))',
      [keepIds]
    )
    
    // 3. Delete order_items for fake orders
    await pool.query(
      'DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE customer_id != ALL($1))',
      [keepIds]
    )
    
    // 4. Delete fake orders
    const deletedOrders = await pool.query(
      'DELETE FROM orders WHERE customer_id != ALL($1)',
      [keepIds]
    )
    
    // 5. Delete fake reviews
    await pool.query(
      'DELETE FROM reviews WHERE customer_id != ALL($1)',
      [keepIds]
    )
    
    // 6. Delete notifications for fake users
    await pool.query(
      'DELETE FROM notifications WHERE user_id != ALL($1)',
      [keepIds]
    )
    
    // 5. Delete all bookings with test emails
    await pool.query(
      "DELETE FROM event_bookings WHERE email LIKE '%@test.com' OR email LIKE '%test%'"
    )
    
    // 6. Delete training registrations for fake users
    await pool.query(
      'DELETE FROM training_registrations WHERE customer_id != ALL($1)',
      [keepIds]
    )
    
    // 7. Delete newsletter subscribers with test emails
    await pool.query(
      "DELETE FROM newsletter_subscribers WHERE email LIKE '%@test.com' OR email LIKE '%test%'"
    )
    
    // 7b. Delete wishlists for fake users
    await pool.query(
      'DELETE FROM wishlists WHERE customer_id != ALL($1)',
      [keepIds]
    )
    
    // 8. Delete only fake/test users (keep all real users)
    const deletedUsers = await pool.query(
      "DELETE FROM users WHERE (email LIKE '%test%' OR email LIKE '%fake%' OR email = 'test@example.com') AND role != 'admin'"
    )
    
    return success(res, {
      message: 'Database cleaned successfully!',
      deleted: {
        orders: deletedOrders.rowCount,
        users: deletedUsers.rowCount,
      },
      kept: keepEmails,
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
              p.image_url as "productImage", p.category as "productCategory",
              u.id as "customerId", u.full_name as "customerName",
              u.email as "customerEmail", u.phone as "customerPhone"
       FROM wishlists w
       JOIN products p ON w.product_id = p.id
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
