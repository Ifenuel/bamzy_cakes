import crypto from 'crypto'
import pool from '../config/db.js'
import { sendOtpEmail } from './emailService.js'

const OTP_EXPIRY_MINUTES = 10
const OTP_LENGTH = 6
const MAX_ATTEMPTS = 5

/**
 * Generate a 6-digit OTP code
 */
function generateOtpCode() {
  // Generate a 6-digit code (100000 to 999999)
  return crypto.randomInt(100000, 999999).toString()
}

/**
 * Send OTP to email for registration verification
 */
export async function sendRegistrationOtp(email, userName) {
  // Generate 6-digit code
  const code = generateOtpCode()
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

  // Invalidate any existing OTPs for this email
  await pool.query(
    "UPDATE otp_codes SET used = true WHERE email = $1 AND purpose = 'registration' AND used = false",
    [email]
  )

  // Store OTP in database
  await pool.query(
    'INSERT INTO otp_codes (email, code, purpose, expires_at) VALUES ($1, $2, $3, $4)',
    [email, code, 'registration', expiresAt]
  )

  // Send email
  await sendOtpEmail(email, code, userName)

  return { sent: true, expiresAt }
}

/**
 * Verify OTP code for registration
 */
export async function verifyRegistrationOtp(email, code) {
  // Find the most recent unused OTP for this email
  const result = await pool.query(
    `SELECT id, code, attempts, max_attempts, expires_at
     FROM otp_codes
     WHERE email = $1 AND purpose = 'registration' AND used = false
     ORDER BY created_at DESC LIMIT 1`,
    [email]
  )

  if (result.rows.length === 0) {
    return { verified: false, reason: 'No verification code found. Please request a new one.' }
  }

  const otp = result.rows[0]

  // Check expiry
  if (new Date(otp.expires_at) < new Date()) {
    await pool.query('UPDATE otp_codes SET used = true WHERE id = $1', [otp.id])
    return { verified: false, reason: 'Verification code has expired. Please request a new one.' }
  }

  // Check max attempts
  if (otp.attempts >= otp.max_attempts) {
    await pool.query('UPDATE otp_codes SET used = true WHERE id = $1', [otp.id])
    return { verified: false, reason: 'Too many failed attempts. Please request a new code.' }
  }

  // Increment attempts
  await pool.query('UPDATE otp_codes SET attempts = attempts + 1 WHERE id = $1', [otp.id])

  // Compare codes (constant-time comparison)
  const storedCode = otp.code
  const providedCode = code.toString()

  if (storedCode.length !== providedCode.length) {
    return { verified: false, reason: 'Invalid verification code.' }
  }

  let mismatch = 0
  for (let i = 0; i < storedCode.length; i++) {
    mismatch |= storedCode.charCodeAt(i) ^ providedCode.charCodeAt(i)
  }

  if (mismatch !== 0) {
    return { verified: false, reason: 'Invalid verification code.' }
  }

  // Mark OTP as used
  await pool.query('UPDATE otp_codes SET used = true WHERE id = $1', [otp.id])

  return { verified: true }
}

/**
 * Resend OTP to email
 */
export async function resendRegistrationOtp(email, userName) {
  // Invalidate existing OTPs
  await pool.query(
    "UPDATE otp_codes SET used = true WHERE email = $1 AND purpose = 'registration' AND used = false",
    [email]
  )

  // Generate and send new OTP
  return sendRegistrationOtp(email, userName)
}
