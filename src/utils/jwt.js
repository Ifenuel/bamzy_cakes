import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret'
const JWT_EXPIRES = '7d'

export function generateToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  )
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET)
}
