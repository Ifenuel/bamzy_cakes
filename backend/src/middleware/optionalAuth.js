import { verifyToken } from '../utils/jwt.js'
import pool from '../config/db.js'

export async function optionalAuth(req, _res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return next()
  }
  try {
    const token = header.split(' ')[1]
    const decoded = verifyToken(token)
    const result = await pool.query(
      'SELECT id, full_name, email, phone, role FROM users WHERE id = $1',
      [decoded.id]
    )
    if (result.rows.length > 0) {
      req.user = result.rows[0]
    }
  } catch {
    // Token invalid — continue as guest
  }
  next()
}
