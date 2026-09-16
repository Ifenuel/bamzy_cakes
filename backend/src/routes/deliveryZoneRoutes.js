import { Router } from 'express'
import pool from '../config/db.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { resolveDeliveryFee, getSupportedStatesWithActiveZones } from '../services/deliveryZoneService.js'

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

// GET /api/delivery-zones/calculate?city=xxx&state=xxx — resolves the fee for
// checkout from the ADMIN-CONFIGURED delivery_zones table. There is no default
// fee here on purpose: when no active zone matches, we return
// { available: false } and the customer is told delivery is unavailable —
// we never silently charge a made-up price.
router.get('/calculate', async (req, res) => {
  try {
    const { city, state } = req.query
    if (!city && !state) {
      return res.json({ success: true, data: { available: false } })
    }

    const match = await resolveDeliveryFee({ city, state })
    if (!match.matched) {
      return res.json({ success: true, data: { available: false } })
    }

    res.json({
      success: true,
      data: {
        available: true,
        fee: match.fee,
        zone: match.zoneName,
        zoneName: match.zoneName,
        zoneSlug: match.zoneSlug,
        estimatedHoursMin: match.hoursMin,
        estimatedHoursMax: match.hoursMax,
        hoursMin: match.hoursMin,
        hoursMax: match.hoursMax,
      },
    })
  } catch (err) {
    console.error('Error calculating delivery fee:', err.message)
    res.status(500).json({ success: false, message: 'Failed to calculate delivery fee' })
  }
})

// GET /api/delivery-zones/states — which supported states currently have an
// active zone (names only; fees always come from /calculate so admin edits
// apply instantly).
router.get('/states', async (req, res) => {
  try {
    const states = await getSupportedStatesWithActiveZones()
    res.json({ success: true, data: states })
  } catch (err) {
    console.error('Error fetching supported states:', err.message)
    res.status(500).json({ success: false, message: 'Failed to fetch supported states' })
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
