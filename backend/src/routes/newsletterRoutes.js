import { Router } from 'express'
import pool from '../config/db.js'
import { requireAdmin } from '../middleware/auth.js'
import { success, error } from '../utils/response.js'
import { upsertContact, removeContact, sendNewsletter, checkBrevoStatus } from '../services/emailService.js'

const router = Router()

// =============================================
// PUBLIC ROUTES
// =============================================

// POST /api/newsletter/subscribe — subscribe to newsletter + sync to Brevo
router.post('/subscribe', async (req, res) => {
  try {
    const { email, full_name } = req.body
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return error(res, 'A valid email address is required', 400)
    }

    const cleanEmail = email.toLowerCase().trim()
    const sanitize = (s) => s ? s.replace(/<[^>]*>/g, '').trim() : null
    const cleanName = sanitize(full_name)

    // Check if already subscribed
    const existing = await pool.query(
      'SELECT id, is_active FROM newsletter_subscribers WHERE email = $1',
      [cleanEmail]
    )

    if (existing.rows.length > 0) {
      if (existing.rows[0].is_active) {
        return success(res, { message: 'You are already subscribed!' })
      }
      // Re-activate
      await pool.query(
        'UPDATE newsletter_subscribers SET is_active = true, unsubscribed_at = NULL, full_name = COALESCE($2, full_name) WHERE email = $1',
        [cleanEmail, cleanName]
      )
    } else {
      await pool.query(
        'INSERT INTO newsletter_subscribers (email, full_name) VALUES ($1, $2)',
        [cleanEmail, cleanName]
      )
    }

    // Sync to Brevo (non-blocking — don't fail the subscription if Brevo is down)
    upsertContact({ email: cleanEmail, name: cleanName }).catch((err) => {
      console.warn('Brevo sync failed for', cleanEmail, err.message)
    })

    return success(res, { message: 'Successfully subscribed to the Bamzy newsletter!' }, 201)
  } catch (err) {
    console.error('Newsletter subscribe error:', err.message)
    return error(res, 'Failed to subscribe. Please try again.', 500)
  }
})

// GET /api/newsletter/unsubscribe — unsubscribe
router.get('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.query
    if (!email) return error(res, 'Email is required', 400)

    const cleanEmail = email.toLowerCase().trim()
    await pool.query(
      'UPDATE newsletter_subscribers SET is_active = false, unsubscribed_at = NOW() WHERE email = $1',
      [cleanEmail]
    )

    // Also remove from Brevo (non-blocking)
    removeContact(cleanEmail).catch(() => {})

    return success(res, { message: 'You have been unsubscribed.' })
  } catch (err) {
    console.error('Newsletter unsubscribe error:', err.message)
    return error(res, 'Failed to unsubscribe', 500)
  }
})

// =============================================
// ADMIN ROUTES
// =============================================

// GET /api/newsletter/admin/stats — subscriber stats
router.get('/admin/subscribers', requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE is_active = true) as active FROM newsletter_subscribers'
    )

    // Check Brevo status
    const brevoStatus = await checkBrevoStatus()

    return success(res, {
      total: parseInt(result.rows[0].total),
      active: parseInt(result.rows[0].active),
      brevo: brevoStatus,
    })
  } catch (err) {
    console.error('Newsletter stats error:', err.message)
    return error(res, 'Failed to load subscribers', 500)
  }
})

// GET /api/newsletter/admin/list — get all subscribers
router.get('/admin/list', requireAdmin, async (_req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, is_active, subscribed_at, unsubscribed_at FROM newsletter_subscribers ORDER BY subscribed_at DESC'
    )
    return success(res, result.rows)
  } catch (err) {
    console.error('Newsletter list error:', err.message)
    return error(res, 'Failed to load subscribers', 500)
  }
})

// POST /api/newsletter/admin/send — send newsletter via Brevo
router.post('/admin/send', requireAdmin, async (req, res) => {
  try {
    const { subject, message } = req.body
    if (!subject || !subject.trim()) return error(res, 'Subject is required', 400)
    if (!message || !message.trim()) return error(res, 'Message is required', 400)

    // Check if Brevo is configured
    const brevoStatus = await checkBrevoStatus()
    if (!brevoStatus.configured) {
      return error(res, 'Brevo email service is not configured. Please set BREVO_API_KEY in your environment variables.', 400)
    }

    // Get active subscribers
    const subscribers = await pool.query(
      'SELECT email FROM newsletter_subscribers WHERE is_active = true'
    )

    if (subscribers.rows.length === 0) {
      return error(res, 'No active subscribers to send to', 400)
    }

    const subscriberEmails = subscribers.rows.map(r => r.email)

    // Send via Brevo
    const result = await sendNewsletter({
      subject: subject.trim(),
      message: message.trim(),
      subscriberEmails,
    })

    return success(res, {
      message: `Newsletter sent to ${result.sent} subscribers${result.failed > 0 ? ` (${result.failed} failed)` : ''}`,
      sent: result.sent,
      failed: result.failed,
      total: result.total,
    })
  } catch (err) {
    console.error('Newsletter send error:', err.message)
    return error(res, 'Failed to send newsletter', 500)
  }
})

// GET /api/newsletter/admin/brevo-status — check Brevo connection
router.get('/admin/brevo-status', requireAdmin, async (_req, res) => {
  try {
    const status = await checkBrevoStatus()
    return success(res, status)
  } catch (err) {
    return error(res, 'Failed to check Brevo status', 500)
  }
})

export default router
