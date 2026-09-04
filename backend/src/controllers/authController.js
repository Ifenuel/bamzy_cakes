import * as authService from '../services/authService.js'
import * as otpService from '../services/otpService.js'
import { sendWelcomeEmail } from '../services/emailService.js'
import pool from '../config/db.js'
import { success, created, error, notFound } from '../utils/response.js'
import { sanitizeObject } from '../utils/sanitize.js'
import { safeError } from '../utils/safeError.js'

export async function register(req, res) {
  try {
    const { full_name, email, phone, password, avatar_url, otp } = req.body

    // SECURITY: Never allow public registration as admin
    const result = await authService.register({ full_name, email, phone, password, role: 'customer', avatar_url })

    // Send welcome email (non-blocking)
    sendWelcomeEmail(email, full_name).catch(() => {})

    return created(res, result)
  } catch (err) {
    if (err.code === '23505') {
      return error(res, 'Email already registered', 409)
    }
    console.error('Register error:', err.message)
    return error(res, 'Registration failed. Please try again.', 500)
  }
}

/**
 * Send OTP to email for registration verification
 */
export async function sendOtp(req, res) {
  try {
    const { email, full_name } = req.body
    if (!email) return error(res, 'Email is required', 400)

    // Check if email is already registered
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email])
    if (existing.rows.length > 0) {
      return error(res, 'Email already registered. Please log in.', 409)
    }

    await otpService.sendRegistrationOtp(email, full_name)
    return success(res, { message: 'Verification code sent to your email.' })
  } catch (err) {
    console.error('SendOtp error:', err.message)
    return safeError(res, err, 'Failed to send verification code', 500)
  }
}

/**
 * Verify OTP code during registration
 */
export async function verifyOtp(req, res) {
  try {
    const { email, code } = req.body
    if (!email || !code) return error(res, 'Email and code are required', 400)

    const result = await otpService.verifyRegistrationOtp(email, code)
    if (!result.verified) {
      return error(res, result.reason || 'Invalid verification code', 400)
    }
    return success(res, { message: 'Email verified successfully.' })
  } catch (err) {
    console.error('VerifyOtp error:', err.message)
    return safeError(res, err, 'Verification failed', 500)
  }
}

/**
 * Resend OTP to email
 */
export async function resendOtp(req, res) {
  try {
    const { email, full_name } = req.body
    if (!email) return error(res, 'Email is required', 400)

    await otpService.resendRegistrationOtp(email, full_name)
    return success(res, { message: 'A new verification code has been sent.' })
  } catch (err) {
    console.error('ResendOtp error:', err.message)
    return safeError(res, err, 'Failed to resend code', 500)
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body
    const result = await authService.login({ email, password })
    if (!result) {
      return error(res, 'Invalid email or password', 401)
    }
    return success(res, result)
  } catch (err) {
    console.error('Login error:', err.message)
    return error(res, 'Login failed. Please try again.', 500)
  }
}

export async function me(req, res) {
  try {
    const user = await authService.getMe(req.user.id)
    if (!user) return notFound(res, 'User not found')
    return success(res, user)
  } catch (err) {
    console.error('GetMe error:', err.message)
    return error(res, 'Failed to load profile', 500)
  }
}

export async function updateProfile(req, res) {
  try {
    const sanitized = sanitizeObject(req.body)
    const user = await authService.updateProfile(req.user.id, sanitized)
    if (!user) return notFound(res, 'User not found')
    return success(res, user)
  } catch (err) {
    console.error('UpdateProfile error:', err.message)
    return error(res, 'Failed to update profile', 500)
  }
}

export async function registerAdmin(req, res) {
  try {
    const { full_name, email, phone, password, avatar_url } = req.body
    const result = await authService.register({ full_name, email, phone, password, role: 'admin', avatar_url })
    return created(res, result)
  } catch (err) {
    if (err.code === '23505') {
      return error(res, 'Email already registered', 409)
    }
    console.error('RegisterAdmin error:', err.message)
    return error(res, 'Admin registration failed. Please try again.', 500)
  }
}

export async function verifyEmail(req, res) {
  try {
    const { token } = req.query
    if (!token) return error(res, 'Verification token is required', 400)
    const verified = await authService.verifyEmail(token)
    if (!verified) return error(res, 'Invalid or expired verification link', 400)
    return success(res, { message: 'Email verified successfully! You can now use all features.' })
  } catch (err) {
    console.error('VerifyEmail error:', err.message)
    return error(res, 'Verification failed. Please try again.', 500)
  }
}

export async function resendVerification(req, res) {
  try {
    const { email } = req.body
    if (!email) return error(res, 'Email is required', 400)
    await authService.resendVerification(email)
    return success(res, { message: 'If an account exists, a new verification link has been sent.' })
  } catch (err) {
    return safeError(res, err, 'Failed to resend verification', 500)
  }
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body
    if (!email) return error(res, 'Email is required', 400)
    const result = await authService.forgotPassword(email)
    if (!result.found) {
      return error(res, 'No account found with this email. Please register first.', 404)
    }
    return success(res, { message: 'A password reset link has been sent to your email. Check your inbox (and spam folder).' })
  } catch (err) {
    return safeError(res, err, 'Failed to process password reset', 500)
  }
}

export async function resetPassword(req, res) {
  try {
    const { token, password } = req.body
    if (!token || !password) return error(res, 'Token and password are required', 400)
    if (password.length < 6) return error(res, 'Password must be at least 6 characters', 400)
    const success2 = await authService.resetPassword(token, password)
    if (!success2) return error(res, 'Invalid or expired reset token', 400)
    return success(res, { message: 'Password reset successful. You can now log in.' })
  } catch (err) {
    return safeError(res, err, 'Internal server error', 500)
  }
}
