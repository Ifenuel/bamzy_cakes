import { Router } from 'express'
import { requireAdmin } from '../middleware/auth.js'
import * as paymentController from '../controllers/paymentController.js'

const router = Router()

// Initialize payment (customer calls this)
router.post('/initialize', paymentController.initializePayment)

// Verify payment (customer calls this after popup closes)
router.get('/verify/:reference', paymentController.verifyPayment)

// Webhook (Paystack calls this server-to-server)
router.post('/webhook', paymentController.handleWebhook)

// Check payment status
router.get('/status/:reference', paymentController.getPaymentStatus)

// Admin: list all payments
router.get('/', requireAdmin, paymentController.getPayments)

export default router
