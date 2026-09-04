import { Router } from 'express'
import { requireAdmin } from '../middleware/auth.js'
import * as adminController from '../controllers/adminController.js'
import * as customerController from '../controllers/customerController.js'
import pool from '../config/db.js'
import { success, error } from '../utils/response.js'

const router = Router()

router.get('/dashboard', requireAdmin, adminController.getDashboard)
router.get('/customers', requireAdmin, customerController.getCustomers)

// Admin: Clean database — remove all test data except admin and Ada
router.post('/cleanup', requireAdmin, async (req, res) => {
  try {
    // Keep these emails
    const keepEmails = ['admin@bamzycakes.com', 'ada@example.com']
    
    // 1. Get IDs of users to keep
    const keepUsers = await pool.query(
      'SELECT id FROM users WHERE email = ANY($1)',
      [keepEmails]
    )
    const keepIds = keepUsers.rows.map(r => r.id)
    
    // 2. Delete order_items for fake orders
    await pool.query(
      'DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE customer_id != ALL($1))',
      [keepIds]
    )
    
    // 3. Delete fake orders
    const deletedOrders = await pool.query(
      'DELETE FROM orders WHERE customer_id != ALL($1)',
      [keepIds]
    )
    
    // 4. Delete fake reviews
    await pool.query(
      'DELETE FROM reviews WHERE customer_id != ALL($1)',
      [keepIds]
    )
    
    // 5. Delete all bookings with test emails
    await pool.query(
      "DELETE FROM bookings WHERE email LIKE '%@test.com' OR email LIKE '%test%'"
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
    
    // 8. Delete fake users (except admin and Ada)
    const deletedUsers = await pool.query(
      'DELETE FROM users WHERE id != ALL($1) AND role != $2',
      [keepIds, 'admin']
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

export default router
