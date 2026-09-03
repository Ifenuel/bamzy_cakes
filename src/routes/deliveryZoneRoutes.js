import { Router } from 'express'
import pool from '../config/db.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()

// =============================================
// PUBLIC ROUTES (no auth needed)
// =============================================

// GET /api/delivery-zones — returns all active zones for customers
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, zone_name as "zoneName", zone_slug as "zoneSlug", delivery_fee as "deliveryFee", estimated_hours_min as "estimatedHoursMin", estimated_hours_max as "estimatedHoursMax" FROM delivery_zones WHERE is_active = true ORDER BY delivery_fee ASC'
    )
    res.json({ success: true, data: result.rows })
  } catch (err) {
    console.error('Error fetching delivery zones:', err.message)
    res.status(500).json({ success: false, message: 'Failed to fetch delivery zones' })
  }
})

// GET /api/delivery-zones/calculate?city=xxx&state=xxx — calculates fee for checkout
router.get('/calculate', async (req, res) => {
  try {
    const { city, state } = req.query
    if (!city && !state) {
      return res.json({ success: true, data: { fee: 1500, zone: 'Within Ibadan', estimatedHoursMin: 2, estimatedHoursMax: 4 } })
    }

    const cityLower = (city || '').toLowerCase().trim()
    const stateLower = (state || '').toLowerCase().trim()

    let zoneSlug = 'ibadan'
    if (cityLower.includes('ibadan') || stateLower === 'oyo' || stateLower === 'ibadan') {
      zoneSlug = 'ibadan'
    } else if (cityLower.includes('lagos') || stateLower === 'lagos') {
      zoneSlug = 'lagos'
    } else if (stateLower === 'ogun' || cityLower.includes('abeokuta') || cityLower.includes('ijebu') || cityLower.includes('sango')) {
      zoneSlug = 'ogun'
    } else if (stateLower === 'ondo' || cityLower.includes('akure') || cityLower.includes('ondo')) {
      zoneSlug = 'ondo'
    } else if (stateLower === 'ekiti' || cityLower.includes('ado-ekiti') || cityLower.includes('ekiti')) {
      zoneSlug = 'ekiti'
    } else if (stateLower === 'osun' || cityLower.includes('osogbo') || cityLower.includes('ife') || cityLower.includes('osun')) {
      zoneSlug = 'osun'
    }

    const result = await pool.query(
      'SELECT zone_name as "zoneName", delivery_fee as "deliveryFee", estimated_hours_min as "estimatedHoursMin", estimated_hours_max as "estimatedHoursMax" FROM delivery_zones WHERE zone_slug = $1 AND is_active = true',
      [zoneSlug]
    )

    if (result.rows.length === 0) {
      return res.json({ success: true, data: { fee: 1500, zone: 'Within Ibadan', estimatedHoursMin: 2, estimatedHoursMax: 4 } })
    }

    res.json({ success: true, data: result.rows[0] })
  } catch (err) {
    console.error('Error calculating delivery fee:', err.message)
    res.status(500).json({ success: false, message: 'Failed to calculate delivery fee' })
  }
})

// =============================================
// ADMIN ROUTES (auth + admin required)
// =============================================

// GET /api/delivery-zones/admin/all — admin sees all zones including inactive
router.get('/admin/all', requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, zone_name as "zoneName", zone_slug as "zoneSlug", delivery_fee as "deliveryFee", estimated_hours_min as "estimatedHoursMin", estimated_hours_max as "estimatedHoursMax", is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt" FROM delivery_zones ORDER BY delivery_fee ASC'
    )
    res.json({ success: true, data: result.rows })
  } catch (err) {
    console.error('Error fetching admin delivery zones:', err.message)
    res.status(500).json({ success: false, message: 'Failed to fetch delivery zones' })
  }
})

// POST /api/delivery-zones/admin — create a new delivery zone
router.post('/admin', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { zoneName, zoneSlug, deliveryFee, estimatedHoursMin, estimatedHoursMax } = req.body
    if (!zoneName || !zoneSlug || deliveryFee === undefined) {
      return res.status(400).json({ success: false, message: 'Zone name, slug, and delivery fee are required' })
    }
    const slug = zoneSlug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const result = await pool.query(
      `INSERT INTO delivery_zones (zone_name, zone_slug, delivery_fee, estimated_hours_min, estimated_hours_max)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, zone_name as "zoneName", zone_slug as "zoneSlug", delivery_fee as "deliveryFee",
                 estimated_hours_min as "estimatedHoursMin", estimated_hours_max as "estimatedHoursMax", is_active as "isActive"`,
      [zoneName, slug, deliveryFee, estimatedHoursMin || 2, estimatedHoursMax || 4]
    )
    res.status(201).json({ success: true, data: result.rows[0] })
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: 'A zone with this slug already exists' })
    }
    console.error('Error creating delivery zone:', err.message)
    res.status(500).json({ success: false, message: 'Failed to create delivery zone' })
  }
})

// PUT /api/delivery-zones/admin/:id — update a zone's fee, hours, or active status
router.put('/admin/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { deliveryFee, estimatedHoursMin, estimatedHoursMax, isActive } = req.body
    const result = await pool.query(
      `UPDATE delivery_zones SET
        delivery_fee = COALESCE($1, delivery_fee),
        estimated_hours_min = COALESCE($2, estimated_hours_min),
        estimated_hours_max = COALESCE($3, estimated_hours_max),
        is_active = COALESCE($4, is_active),
        updated_at = NOW()
       WHERE id = $5
       RETURNING id, zone_name as "zoneName", zone_slug as "zoneSlug", delivery_fee as "deliveryFee",
                 estimated_hours_min as "estimatedHoursMin", estimated_hours_max as "estimatedHoursMax", is_active as "isActive"`,
      [deliveryFee, estimatedHoursMin, estimatedHoursMax, isActive, id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Zone not found' })
    }
    res.json({ success: true, data: result.rows[0] })
  } catch (err) {
    console.error('Error updating delivery zone:', err.message)
    res.status(500).json({ success: false, message: 'Failed to update delivery zone' })
  }
})

// DELETE /api/delivery-zones/admin/:id — deactivate a zone (soft delete)
router.delete('/admin/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query(
      `UPDATE delivery_zones SET is_active = false, updated_at = NOW() WHERE id = $1
       RETURNING id, zone_name as "zoneName", is_active as "isActive"`,
      [id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Zone not found' })
    }
    res.json({ success: true, data: result.rows[0], message: 'Zone deactivated' })
  } catch (err) {
    console.error('Error deactivating delivery zone:', err.message)
    res.status(500).json({ success: false, message: 'Failed to deactivate zone' })
  }
})

export default router
