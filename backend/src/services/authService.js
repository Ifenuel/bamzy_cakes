import bcrypt from 'bcrypt'
import crypto from 'crypto'
import pool from '../config/db.js'
import { generateToken } from '../utils/jwt.js'
import { sendPasswordResetEmail } from './emailService.js'

const SALT_ROUNDS = 10
const RESET_TOKEN_EXPIRY_MINUTES = 5

export async function register({ full_name, email, phone, password, role, avatar_url }) {
  const hash = await bcrypt.hash(password, SALT_ROUNDS)
  const userRole = role === 'admin' ? 'admin' : 'customer'
  const result = await pool.query(
    `INSERT INTO users (full_name, email, phone, password_hash, role, avatar_url)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, full_name, email, phone, role, avatar_url, created_at`,
    [full_name, email, phone || null, hash, userRole, avatar_url || null]
  )
  const user = result.rows[0]
  const token = generateToken(user)

  // Generate email verification token
  const rawToken = crypto.randomBytes(32).toString('hex')
  const tokenHash = await bcrypt.hash(rawToken, SALT_ROUNDS)
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  await pool.query(
    'INSERT INTO email_verifications (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [user.id, tokenHash, expiresAt]
  )
  console.log(`[EMAIL VERIFICATION] Email: ${email}, Token: ${rawToken}`)

  return { user, token }
}

export async function login({ email, password }) {
  const result = await pool.query(
    'SELECT id, full_name, email, phone, role, password_hash, is_active, avatar_url FROM users WHERE email = $1',
    [email]
  )
  if (result.rows.length === 0) return null

  const user = result.rows[0]
  if (!user.is_active) return null

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) return null

  // eslint-disable-next-line no-unused-vars
  const { password_hash, ...safe } = user
  const token = generateToken(safe)
  return { user: safe, token }
}

export async function getMe(userId) {
  const result = await pool.query(
    'SELECT id, full_name, email, phone, role, avatar_url, created_at FROM users WHERE id = $1',
    [userId]
  )
  return result.rows[0] || null
}

export async function updateProfile(userId, { full_name, phone, avatar_url }) {
  const result = await pool.query(
    `UPDATE users SET
       full_name = COALESCE($2, full_name),
       phone = COALESCE($3, phone),
       avatar_url = COALESCE($4, avatar_url),
       updated_at = NOW()
     WHERE id = $1
     RETURNING id, full_name, email, phone, role, avatar_url, created_at`,
    [userId, full_name, phone, avatar_url]
  )
  return result.rows[0] || null
}

export async function forgotPassword(email) {
  const result = await pool.query('SELECT id, email, full_name FROM users WHERE email = $1', [email])
  if (result.rows.length === 0) {
    // Email not found — tell the caller so frontend can show a helpful message
    return { sent: false, found: false }
  }
  const user = result.rows[0]

  // Invalidate any existing reset tokens for this user
  await pool.query('UPDATE password_resets SET used = true WHERE user_id = $1 AND used = false', [user.id])

  // Generate a random token, store its hash
  const rawToken = crypto.randomBytes(32).toString('hex')
  const tokenHash = await bcrypt.hash(rawToken, SALT_ROUNDS)
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000)

  await pool.query(
    'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [user.id, tokenHash, expiresAt]
  )

  // Send password reset email via Brevo
  const clientUrl = process.env.CLIENT_URL || 'https://bamzy-cakes.vercel.app'
  const resetLink = `${clientUrl}/reset-password?token=${rawToken}`
  const userName = user.full_name || ''
  
  let emailSent = false
  try {
    emailSent = await sendPasswordResetEmail(email, resetLink, userName)
  } catch (err) {
    console.error('[PASSWORD RESET] Email send error:', err.message)
  }
  
  console.log(`[PASSWORD RESET] Email: ${email}, Link: ${resetLink}, Sent: ${emailSent}`)
  return { sent: true, emailSent, resetToken: rawToken }
}

export async function verifyEmail(token) {
  const result = await pool.query(
    `SELECT ev.id, ev.user_id, ev.token_hash, ev.expires_at
     FROM email_verifications ev
     WHERE ev.verified = false AND ev.expires_at > NOW()
     ORDER BY ev.created_at DESC LIMIT 50`
  )
  for (const row of result.rows) {
    const match = await bcrypt.compare(token, row.token_hash)
    if (match) {
      await pool.query('UPDATE email_verifications SET verified = true WHERE id = $1', [row.id])
      // Mark user as verified (add column if not exists)
      await pool.query('UPDATE users SET updated_at = NOW() WHERE id = $1', [row.user_id])
      return true
    }
  }
  return false
}

export async function resendVerification(email) {
  const result = await pool.query('SELECT id, email FROM users WHERE email = $1', [email])
  if (result.rows.length === 0) return { sent: true }
  const user = result.rows[0]

  // Invalidate old tokens
  await pool.query('UPDATE email_verifications SET verified = true WHERE user_id = $1 AND verified = false', [user.id])

  // Generate new token
  const rawToken = crypto.randomBytes(32).toString('hex')
  const tokenHash = await bcrypt.hash(rawToken, SALT_ROUNDS)
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
  await pool.query(
    'INSERT INTO email_verifications (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [user.id, tokenHash, expiresAt]
  )
  console.log(`[EMAIL VERIFICATION RESENT] Email: ${email}, Token: ${rawToken}`)
  return { sent: true }
}

export async function resetPassword(token, newPassword) {
  // Find all recent unused tokens (we need to check bcrypt compare)
  const result = await pool.query(
    `SELECT pr.id, pr.user_id, pr.token_hash, pr.expires_at
     FROM password_resets pr
     WHERE pr.used = false AND pr.expires_at > NOW()
     ORDER BY pr.created_at DESC
     LIMIT 50`
  )

  for (const row of result.rows) {
    const match = await bcrypt.compare(token, row.token_hash)
    if (match) {
      // Mark token as used
      await pool.query('UPDATE password_resets SET used = true WHERE id = $1', [row.id])
      // Update password
      const hash = await bcrypt.hash(newPassword, SALT_ROUNDS)
      await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [hash, row.user_id])
      return true
    }
  }
  return false
}
