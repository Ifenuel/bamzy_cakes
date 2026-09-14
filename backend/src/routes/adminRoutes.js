import { Router } from 'express'
import { requireAdmin } from '../middleware/auth.js'
import * as adminController from '../controllers/adminController.js'
import * as customerController from '../controllers/customerController.js'
import pool from '../config/db.js'
import { success, error } from '../utils/response.js'

const router = Router()

router.get('/dashboard', requireAdmin, adminController.getDashboard)
router.get('/customers', requireAdmin, customerController.getCustomers)

// Admin: Mark notification as read
router.put('/notifications/:id/read', requireAdmin, async (req, res) => {
  try {
    // Try marking in admin_notifications table (numeric ID)
    const numId = parseInt(req.params.id)
    if (!isNaN(numId)) {
      await pool.query('UPDATE admin_notifications SET is_read = true WHERE id = $1', [numId])
    }
    // Also try old admin_notification_reads table (string key)
    await pool.query(
      `INSERT INTO admin_notification_reads (notification_key, admin_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [req.params.id, req.user.id]
    ).catch(() => {})
    return success(res, { message: 'Marked as read' })
  } catch (err) {
    return success(res, { message: 'Marked as read' })
  }
})

router.put('/notifications/read-all', requireAdmin, async (req, res) => {
  try {
    // Mark all admin notifications as read
    await pool.query('UPDATE admin_notifications SET is_read = true WHERE is_read = false').catch(() => {})
    // Also store in old table for compatibility
    await pool.query(
      `INSERT INTO admin_notification_reads (notification_key, admin_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      ['all-' + new Date().toISOString().split('T')[0], req.user.id]
    ).catch(() => {})
    return success(res, { message: 'All marked as read' })
  } catch (err) {
    return success(res, { message: 'All marked as read' })
  }
})

// Admin: Clear ALL notifications (frees DB space)
router.delete('/notifications', requireAdmin, async (req, res) => {
  try {
    const r = await pool.query('DELETE FROM admin_notifications')
    await pool.query('DELETE FROM admin_notification_reads').catch(() => {})
    return success(res, { message: 'All notifications cleared', deleted: r.rowCount })
  } catch (err) {
    console.error('Clear notifications error:', err.message)
    return error(res, 'Failed to clear notifications', 500)
  }
})

// Admin: Delete a single notification
router.delete('/notifications/:id', requireAdmin, async (req, res) => {
  try {
    const numId = parseInt(req.params.id)
    if (isNaN(numId)) return error(res, 'Invalid notification id', 400)
    await pool.query('DELETE FROM admin_notifications WHERE id = $1', [numId])
    return success(res, { message: 'Notification deleted' })
  } catch (err) {
    console.error('Delete notification error:', err.message)
    return error(res, 'Failed to delete notification', 500)
  }
})

// Admin: Recent activity feed (orders, bookings, training registrations)
router.get('/activity', requireAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20
    const [recentOrders, recentBookings, recentTrainings, recentReviews, dbNotifications] = await Promise.all([
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
      pool.query(
        `SELECT id, type, title, message, detail, reference_id as "referenceId",
                reference_type as "referenceType", is_read as "isRead",
                created_at as "createdAt"
         FROM admin_notifications ORDER BY created_at DESC LIMIT $1`, [limit]
      ).catch(() => ({ rows: [] })),
    ])
    return success(res, {
      orders: recentOrders.rows,
      bookings: recentBookings.rows,
      trainings: recentTrainings.rows,
      reviews: recentReviews.rows,
      notifications: dbNotifications.rows,
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
// POST /admin/cleanup — remove ONLY fake/test data.
// REAL accounts (gmail/yahoo/outlook/etc. and admin@bamzycakes.com) and ALL
// their orders/bookings/reviews are preserved. Only content belonging to
// fake-mail users (test.com/example.com/mailinator etc. or test/fake/example
// in the address) is removed.
const FAKE_EMAIL_SQL = `
  email ~* '(test|fake|example|temp|dummy|spam)'
  OR email ~* '@(test\.com|example\.com|example\.org|mailinator\.com|yopmail\.com|guerrillamail\.com|10minutemail\.com|tempmail\.(com|io)|throwaway\.mail|fakeinbox\.com|sharklasers\.com|trashmail\.(com|de)|getnada\.com|dispostable\.com|maildrop\.cc)$'
  OR email ~* '\.(test|fake|invalid)$'
`
const REAL_DOMAIN_SQL = `email ~* '@(gmail\.com|googlemail\.com|yahoo\.(com|co\.uk|co\.in)|ymail\.com|hotmail\.(com|co\.uk)|outlook\.com|live\.com|icloud\.com|me\.com|aol\.com|protonmail\.com|proton\.me|zoho\.com|gmx\.(com|de)|mail\.com)$' OR email = 'admin@bamzycakes.com' OR email LIKE '%@bamzycakes.com'`

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
    // ids of fake users (never touches real providers or @bamzycakes.com)
    const fakeUsers = await pool.query(
      `SELECT id FROM users WHERE role != 'admin' AND NOT (${REAL_DOMAIN_SQL}) AND (${FAKE_EMAIL_SQL})`
    )
    const fakeIds = fakeUsers.rows.map(r => r.id)
    const inFake = fakeIds.length > 0
    const ph = (start, n) => Array.from({ length: n }, (_, i) => `$${start + i}`).join(', ')

    // 1. Payments tied to fake-owned orders/registrations, then orphans
    await safeDelete('payments_fake_orders', inFake
      ? `DELETE FROM payments WHERE order_id IN (SELECT id FROM orders WHERE customer_id IN (${ph(1, fakeIds.length)})) OR training_registration_id IN (SELECT id FROM training_registrations WHERE customer_id IN (${ph(1 + fakeIds.length, fakeIds.length)}))`
      : 'DELETE FROM payments WHERE false', fakeIds.concat(fakeIds))
    await safeDelete('payments_orphan', `
      DELETE FROM payments p WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.id = p.order_id)
      AND NOT EXISTS (SELECT 1 FROM training_registrations tr WHERE tr.id = p.training_registration_id)`)

    // 2. Order items for fake orders
    await safeDelete('order_items_fake', inFake
      ? `DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE customer_id IN (${ph(1, fakeIds.length)}))`
      : 'DELETE FROM order_items WHERE false', fakeIds)

    // 3. Fake orders
    await safeDelete('orders_fake', inFake
      ? `DELETE FROM orders WHERE customer_id IN (${ph(1, fakeIds.length)})`
      : 'DELETE FROM orders WHERE false', fakeIds)

    // 4. Fake training registrations
    await safeDelete('training_registrations_fake', inFake
      ? `DELETE FROM training_registrations WHERE customer_id IN (${ph(1, fakeIds.length)})`
      : 'DELETE FROM training_registrations WHERE false', fakeIds)

    // 5. Fake reviews (incl. anonymous fake-name reviews without an account)
    await safeDelete('reviews_fake_users', inFake
      ? `DELETE FROM reviews WHERE customer_id IN (${ph(1, fakeIds.length)})`
      : 'DELETE FROM reviews WHERE false', fakeIds)
    await safeDelete('reviews_fake_names', `DELETE FROM reviews WHERE customer_name ~* '(test|fake|example|admin)' AND customer_id IS NULL`)

    // 6. Notifications for fake users
    await safeDelete('notifications_fake', inFake
      ? `DELETE FROM notifications WHERE user_id IN (${ph(1, fakeIds.length)})`
      : 'DELETE FROM notifications WHERE false', fakeIds)

    // 7. Fake wishlists
    await safeDelete('wishlists_fake', inFake
      ? `DELETE FROM wishlists WHERE customer_id IN (${ph(1, fakeIds.length)})`
      : 'DELETE FROM wishlists WHERE false', fakeIds)

    // 8. Fake event bookings (guest bookings with fake emails too)
    await safeDelete('event_bookings_fake', `
      DELETE FROM event_bookings WHERE
      (customer_id IS NOT NULL AND customer_id IN (SELECT id FROM users WHERE role != 'admin' AND NOT (${REAL_DOMAIN_SQL}) AND (${FAKE_EMAIL_SQL})))
      OR (customer_id IS NULL AND email IS NOT NULL AND (${FAKE_EMAIL_SQL}))`)

    // 9. Fake newsletter subscribers
    await safeDelete('newsletter_fake', `DELETE FROM newsletter_subscribers WHERE (${FAKE_EMAIL_SQL.replace(/email/g, 'email')}) AND NOT (${REAL_DOMAIN_SQL.replace(/email/g, 'email')})`)

    // 10. Fake contact messages
    await safeDelete('contacts_fake', `DELETE FROM contact_messages WHERE email IS NOT NULL AND (${FAKE_EMAIL_SQL})`)

    // 11. Fake analytics events
    await safeDelete('analytics_fake_users', inFake
      ? `DELETE FROM analytics_events WHERE user_id IN (${ph(1, fakeIds.length)})`
      : 'DELETE FROM analytics_events WHERE false', fakeIds)

    // 12. Delete the fake user accounts themselves (admins always kept)
    await safeDelete('users_fake', inFake
      ? `DELETE FROM users WHERE id IN (${ph(1, fakeIds.length)})`
      : 'DELETE FROM users WHERE false', fakeIds)

    return success(res, {
      message: `Cleanup complete — fake data removed. Real customers (Gmail/Yahoo/etc.) and admin@bamzycakes.com are untouched.`,
      deleted,
      fakeAccountsRemoved: fakeIds.length,
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
              c.label as "productCategory",
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
