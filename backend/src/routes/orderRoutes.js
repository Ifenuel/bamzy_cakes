import { Router } from 'express'
import { body } from 'express-validator'
import { validate } from '../middleware/validate.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { optionalAuth } from '../middleware/optionalAuth.js'
import * as orderController from '../controllers/orderController.js'

const router = Router()

// IMPORTANT: Admin routes MUST come before /:id to avoid route conflicts
router.get('/admin/all', requireAdmin, orderController.getAllOrders)
router.patch('/admin/:id/status', requireAdmin, [
  body('order_status').isIn(['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'completed', 'cancelled'])
    .withMessage('Invalid order status'),
], validate, orderController.updateOrderStatus)
router.delete('/admin/:id', requireAdmin, async (req, res) => {
  try {
    const pool = (await import('../config/db.js')).default
    await pool.query('DELETE FROM order_items WHERE order_id = $1', [req.params.id])
    await pool.query('DELETE FROM payments WHERE order_id = $1', [req.params.id])
    await pool.query('DELETE FROM orders WHERE id = $1', [req.params.id])
    return res.json({ success: true, data: { message: 'Order deleted' } })
  } catch (err) {
    console.error('Delete order error:', err.message)
    return res.status(500).json({ success: false, message: 'Failed to delete order' })
  }
})

// Create order with validation
router.post('/', optionalAuth, [
  body('customer_name').trim().notEmpty().withMessage('Name is required').isLength({ max: 200 }),
  body('customer_email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email'),
  body('customer_phone').trim().notEmpty().withMessage('Phone is required').isLength({ max: 20 }),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.productId').notEmpty().withMessage('Product ID is required'),
  body('items.*.quantity').isInt({ min: 1, max: 100 }).withMessage('Quantity must be 1-100'),
  body('delivery_method').isIn(['delivery', 'pickup']).withMessage('Delivery method is required'),
  body('delivery_address').optional({ checkFalsy: true }).trim().isLength({ max: 500 }),
  body('delivery_city').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body('delivery_state').optional({ checkFalsy: true }).trim().isLength({ max: 100 }),
  body('delivery_notes').optional({ checkFalsy: true }).trim().isLength({ max: 500 }),
], validate, orderController.createOrder)

router.get('/', requireAuth, orderController.getMyOrders)
router.get('/:id', optionalAuth, orderController.getOrder)

export default router
