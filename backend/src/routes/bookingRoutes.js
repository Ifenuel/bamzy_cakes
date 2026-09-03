import { Router } from 'express'
import { body } from 'express-validator'
import { validate } from '../middleware/validate.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import * as bookingController from '../controllers/bookingController.js'

const router = Router()

// IMPORTANT: Admin routes MUST come before /:id to avoid route conflicts
router.get('/admin/all', requireAdmin, bookingController.getAllBookings)
router.patch('/admin/:id/status', requireAdmin, [
  body('status').isIn(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'])
    .withMessage('Invalid booking status'),
], validate, bookingController.updateBookingStatus)

// Public — anyone can submit a booking request with validation
router.post('/', [
  body('full_name').trim().notEmpty().withMessage('Name is required').isLength({ max: 200 }),
  body('phone').trim().notEmpty().withMessage('Phone is required').isLength({ max: 20 }),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Invalid email'),
  body('event_type').trim().notEmpty().withMessage('Event type is required').isLength({ max: 50 }),
  body('event_date').isISO8601().withMessage('Valid event date is required'),
  body('event_location').trim().notEmpty().withMessage('Location is required').isLength({ max: 300 }),
  body('guest_count').isInt({ min: 1, max: 10000 }).withMessage('Guest count must be 1-10000'),
  body('services_requested').optional().isArray(),
  body('notes').optional({ checkFalsy: true }).trim().isLength({ max: 1000 }),
], validate, bookingController.createBooking)

router.get('/:id', bookingController.getBooking)

export default router
