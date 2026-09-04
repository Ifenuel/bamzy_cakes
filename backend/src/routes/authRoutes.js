import { Router } from 'express'
import { body } from 'express-validator'
import rateLimit from 'express-rate-limit'
import { validate } from '../middleware/validate.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import * as authController from '../controllers/authController.js'

const router = Router()

// Anti-bot: stricter rate limit on registration (3 per hour)
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: { success: false, message: 'Too many registration attempts. Please try again later.' },
})

// Anti-bot: stricter rate limit on OTP (5 per hour)
const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many OTP requests. Please try again later.' },
})

router.post('/register', registerLimiter, [
  body('full_name').notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], validate, authController.register)

// OTP verification endpoints
router.post('/send-otp', otpLimiter, [
  body('email').isEmail().withMessage('Valid email is required'),
], validate, authController.sendOtp)

router.post('/verify-otp', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('code').notEmpty().withMessage('Verification code is required'),
], validate, authController.verifyOtp)

router.post('/resend-otp', [
  body('email').isEmail().withMessage('Valid email is required'),
], validate, authController.resendOtp)

router.get('/verify-email', authController.verifyEmail)
router.post('/resend-verification', [
  body('email').isEmail().withMessage('Valid email is required'),
], validate, authController.resendVerification)

router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
], validate, authController.login)

router.post('/forgot-password', [
  body('email').isEmail().withMessage('Valid email is required'),
], validate, authController.forgotPassword)

router.post('/reset-password', [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], validate, authController.resetPassword)

router.get('/me', requireAuth, authController.me)
router.put('/me', requireAuth, authController.updateProfile)

// Admin-only: create admin accounts
router.post('/admin/register', requireAdmin, [
  body('full_name').notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], validate, authController.registerAdmin)

export default router
