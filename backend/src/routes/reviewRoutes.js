import { Router } from 'express'
import pool from '../config/db.js'
import { requireAuth } from '../middleware/auth.js'
import { success, error } from '../utils/response.js'
import { stripHtml } from '../utils/sanitize.js'

const router = Router()

// Public: get approved reviews
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, customer_name, rating, text, created_at FROM reviews WHERE is_approved = true ORDER BY created_at DESC LIMIT 20"
    )
    return success(res, result.rows)
  } catch (err) {
    return error(res, 'Failed to load reviews')
  }
})

// Admin: get all reviews
router.get('/admin/all', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return error(res, 'Admin access required', 403)
    const result = await pool.query(
      'SELECT id, customer_name as "customerName", rating, text, is_approved as "isApproved", created_at as "createdAt" FROM reviews ORDER BY created_at DESC'
    )
    return success(res, result.rows)
  } catch (err) {
    return error(res, 'Failed to load reviews')
  }
})

// Admin: toggle approval
router.patch('/admin/:id/approve', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return error(res, 'Admin access required', 403)
    const { is_approved } = req.body
    await pool.query('UPDATE reviews SET is_approved = $1 WHERE id = $2', [is_approved, req.params.id])
    return success(res, { message: 'Review updated' })
  } catch (err) {
    return error(res, 'Failed to update review')
  }
})

// Admin: delete review
router.delete('/admin/:id', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return error(res, 'Admin access required', 403)
    await pool.query('DELETE FROM reviews WHERE id = $1', [req.params.id])
    return success(res, { message: 'Review deleted' })
  } catch (err) {
    return error(res, 'Failed to delete review')
  }
})

// Authenticated: submit a review
router.post('/', requireAuth, async (req, res) => {
  try {
    const { rating, text, order_id } = req.body
    const customer_name = req.user.full_name

    if (!rating || rating < 1 || rating > 5) {
      return error(res, 'Rating must be between 1 and 5', 400)
    }
    if (!text || text.trim().length < 5) {
      return error(res, 'Review text must be at least 5 characters', 400)
    }

    const result = await pool.query(
      'INSERT INTO reviews (customer_id, order_id, customer_name, rating, text) VALUES ($1, $2, $3, $4, $5) RETURNING id, customer_name, rating, text, created_at',
      [req.user.id, order_id || null, customer_name, rating, stripHtml(text)]
    )

    return success(res, result.rows[0], 201)
  } catch (err) {
    return error(res, 'Failed to submit review')
  }
})

export default router
