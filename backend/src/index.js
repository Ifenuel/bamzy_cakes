import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { createServer } from 'net'
import { errorHandler } from './middleware/errorHandler.js'
import { logInfo } from './utils/logger.js'

import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import bookingRoutes from './routes/bookingRoutes.js'
import trainingRoutes from './routes/trainingRoutes.js'
import customerRoutes from './routes/customerRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import analyticsRoutes from './routes/analyticsRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import settingsRoutes from './routes/settingsRoutes.js'
import newsletterRoutes from './routes/newsletterRoutes.js'
import productImageRoutes from './routes/productImageRoutes.js'
import deliveryZoneRoutes from './routes/deliveryZoneRoutes.js'

dotenv.config({ override: true })

const app = express()
const PORT = process.env.PORT || 5000
const __dirname = path.dirname(fileURLToPath(import.meta.url))

const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:', 'http:'],
      scriptSrc: ["'self'", 'https://js.paystack.co'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      connectSrc: ["'self'", clientUrl, 'https://api.paystack.co'],
    },
  },
}))
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))

// General rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(limiter)

// Auth rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

// Password reset limiter
app.use('/api/auth/forgot-password', rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many reset attempts. Please try again later.' },
}))

// Payment rate limiter
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many payment attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Static files for uploaded images
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

// Also serve from project root uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// =============================================
// ROUTES
// =============================================
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Bamzy API is running' })
})

app.use('/api/auth', authLimiter, authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/trainings', trainingRoutes)
app.use('/api/customers', customerRoutes)
app.use('/api/payments', paymentLimiter, paymentRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/newsletter', newsletterRoutes)
app.use('/api/product-images', productImageRoutes)
app.use('/api/delivery-zones', deliveryZoneRoutes)

// Contact form with validation + rate limit
import pool from './config/db.js'
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many messages. Please try again later.' },
})
app.post('/api/contact', contactLimiter, async (req, res) => {
  try {
    const { name, email, phone, message } = req.body
    if (!name || !message) {
      return res.status(400).json({ success: false, message: 'Name and message are required' })
    }

    // Sanitize: strip any HTML tags
    const sanitize = (s) => s ? s.replace(/<[^>]*>/g, '').trim() : null
    await pool.query(
      'INSERT INTO contact_messages (name, email, phone, message) VALUES ($1, $2, $3, $4)',
      [sanitize(name), sanitize(email), sanitize(phone), sanitize(message)]
    )
    res.json({ success: true, data: { message: 'Message sent successfully' } })
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to send message' })
  }
})

app.use(errorHandler)

function isPortFree(port) {
  return new Promise((resolve) => {
    const server = createServer()
    server.once('error', () => resolve(false))
    server.once('listening', () => { server.close(); resolve(true) })
    server.listen(port)
  })
}

async function start() {
  // Check if port is already in use by another process
  const free = await isPortFree(PORT)
  if (!free) {
    console.error(`[startup] Port ${PORT} is already in use by another process.`)
    console.error(`[startup] To fix this, close any terminal running the backend, then run: npm run dev`)
    console.error(`[startup] Or run this first: node -e "require('child_process').execSync('npx kill-port ${PORT}')"`)
    process.exit(1)
  }

  // Start the server
  app.listen(PORT, () => {
    logInfo(`Bamzy Cakes API running on http://localhost:${PORT}`)
    logInfo(`Environment: ${process.env.NODE_ENV || 'development'}`)
    logInfo(`Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}`)
  })
}

start()
