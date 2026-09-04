import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import * as customerController from '../controllers/customerController.js'
import pool from '../config/db.js'
import { success, error } from '../utils/response.js'

const router = Router()

router.get('/', requireAuth, customerController.getAccount)
router.put('/', requireAuth, customerController.updateAccount)
router.delete('/', requireAuth, customerController.deleteAccount)
router.get('/notifications', requireAuth, customerController.getNotifications)
router.put('/notifications/:id/read', requireAuth, customerController.markNotificationRead)
router.put('/notifications/read-all', requireAuth, customerController.markAllNotificationsRead)

// ── Wishlist ──
router.get('/wishlist', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT w.id, w.created_at, w.product_id,
              p.name, p.price, p.image_url, p.status, p.stock, c.name as "categoryName"
       FROM wishlists w
       JOIN products p ON w.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE w.customer_id = $1
       ORDER BY w.created_at DESC`,
      [req.user.id]
    )
    return success(res, result.rows)
  } catch (err) {
    console.error('Wishlist get error:', err.message)
    return error(res, 'Failed to load wishlist', 500)
  }
})

router.post('/wishlist/:productId', requireAuth, async (req, res) => {
  try {
    const { productId } = req.params
    // Check product exists
    const product = await pool.query('SELECT id, name FROM products WHERE id = $1', [productId])
    if (product.rows.length === 0) return error(res, 'Product not found', 404)
    // Add to wishlist (ignore if already exists)
    await pool.query(
      'INSERT INTO wishlists (customer_id, product_id) VALUES ($1, $2) ON CONFLICT (customer_id, product_id) DO NOTHING',
      [req.user.id, productId]
    )
    return success(res, { message: `${product.rows[0].name} added to your wishlist` })
  } catch (err) {
    console.error('Wishlist add error:', err.message)
    return error(res, 'Failed to add to wishlist', 500)
  }
})

router.delete('/wishlist/:productId', requireAuth, async (req, res) => {
  try {
    const { productId } = req.params
    await pool.query(
      'DELETE FROM wishlists WHERE customer_id = $1 AND product_id = $2',
      [req.user.id, productId]
    )
    return success(res, { message: 'Removed from wishlist' })
  } catch (err) {
    console.error('Wishlist remove error:', err.message)
    return error(res, 'Failed to remove from wishlist', 500)
  }
})

router.get('/wishlist/check/:productId', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id FROM wishlists WHERE customer_id = $1 AND product_id = $2',
      [req.user.id, req.params.productId]
    )
    return success(res, { isWishlisted: result.rows.length > 0 })
  } catch (err) {
    return success(res, { isWishlisted: false })
  }
})

export default router
