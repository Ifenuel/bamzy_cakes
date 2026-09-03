import { Router } from 'express'
import { requireAdmin } from '../middleware/auth.js'
import { optionalAuth } from '../middleware/optionalAuth.js'
import * as analyticsController from '../controllers/analyticsController.js'

const router = Router()

// Public: track events (optional auth — attaches user_id if logged in)
router.post('/events', optionalAuth, analyticsController.trackEvent)

// Admin only: analytics endpoints
router.get('/admin/overview', requireAdmin, analyticsController.getAnalyticsOverview)
router.get('/admin/revenue', requireAdmin, analyticsController.getRevenueAnalytics)
router.get('/admin/products', requireAdmin, analyticsController.getProductAnalytics)
router.get('/admin/orders', requireAdmin, analyticsController.getOrderAnalytics)
router.get('/admin/customers', requireAdmin, analyticsController.getCustomerAnalytics)
router.get('/admin/bookings', requireAdmin, analyticsController.getBookingAnalytics)
router.get('/admin/trainings', requireAdmin, analyticsController.getTrainingAnalytics)

export default router
