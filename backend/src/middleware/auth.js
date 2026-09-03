import { verifyToken } from '../utils/jwt.js'
import pool from '../config/db.js'
import { unauthorized } from '../utils/response.js'

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return unauthorized(res, 'Authentication required')
  }

  try {
    const token = header.split(' ')[1]
    const decoded = verifyToken(token)

    const result = await pool.query(
      'SELECT id, full_name, email, phone, role, is_active FROM users WHERE id = $1',
      [decoded.id]
    )

    if (result.rows.length === 0) {
      return unauthorized(res, 'User not found')
    }

    if (!result.rows[0].is_active) {
      return unauthorized(res, 'Account is deactivated')
    }

    req.user = result.rows[0]
    next()
  } catch (err) {
    return unauthorized(res, 'Invalid or expired token')
  }
}

export async function requireAdmin(req, res, next) {
  await requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      return forbidden(res, 'Admin access required')
    }
    next()
  })
}

function forbidden(res, message) {
  return res.status(403).json({ success: false, message })
}
