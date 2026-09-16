import pool from '../config/db.js'

/**
 * Delivery zone service — the SINGLE source of truth for matching a
 * customer's state/city to the admin-configured delivery fee.
 *
 * Rules:
 *  - Prices are NEVER stored here. Everything comes from delivery_zones.
 *  - Matching is normalized (" LAGOS ", "lagos", "Lagos State" all match).
 *  - Admin-created zones for other states (e.g. 'kwara') keep working via
 *    direct slug matching — no code change needed when admin adds a zone.
 */

// The Southwest states Bamzy delivers to (canonical order for the checkout list).
export const SUPPORTED_STATES = ['Lagos', 'Ogun', 'Oyo', 'Osun', 'Ondo', 'Ekiti']

// Alias → canonical zone slug. These are LOCATION names, not prices.
const STATE_ALIASES = {
  lagos: ['lagos', 'eko'],
  ogun: ['ogun', 'abeokuta', 'ijebu', 'sango'],
  oyo: ['oyo', 'ibadan'],
  osun: ['osun', 'osogbo', 'ile ife', 'ileife', 'ife'],
  ondo: ['ondo', 'akure'],
  ekiti: ['ekiti', 'ado ekiti', 'ado'],
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Normalize free text: lowercase, strip accents/punctuation, collapse spaces. */
export function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Return candidate zone slugs for a state/city, most specific first.
 *
 * Ordering rules:
 *  - City is checked before state, so city "Ibadan" in state "Oyo" hits the
 *    city-level 'ibadan' zone before the state-level 'oyo' zone.
 *  - An EXACT alias match prefers the alias slug itself (city "Ibadan" →
 *    'ibadan'), then its canonical zone ('oyo') as fallback.
 *  - A partial match (e.g. "Oyo State" contains "oyo") resolves to the
 *    canonical zone first, with the city-level zone as fallback.
 *  - Oyo always falls back to the Ibadan zone when no dedicated 'oyo' zone
 *    is active (historical default for the business's home state).
 */
export function zoneSlugCandidates({ state, city } = {}) {
  const candidates = []
  const push = (s) => {
    if (s && !candidates.includes(s)) candidates.push(s)
  }

  for (const raw of [normalize(city), normalize(state)]) {
    if (!raw) continue
    let matched = null // { alias, canonical }
    outer: for (const [canon, aliases] of Object.entries(STATE_ALIASES)) {
      for (const alias of aliases) {
        if (raw === alias || new RegExp(`\\b${escapeRe(alias)}\\b`).test(raw)) {
          matched = { alias, canonical: canon }
          break outer
        }
      }
    }
    if (matched) {
      if (raw === matched.alias) {
        // Exact match: the location-specific zone wins, canonical as fallback.
        push(matched.alias)
        push(matched.canonical)
      } else {
        // Partial match ("Oyo State", "Ile-Ife city"): canonical first.
        push(matched.canonical)
        if (matched.alias !== matched.canonical) push(matched.alias)
      }
      if (matched.canonical === 'oyo') push('ibadan') // Oyo → Ibadan fallback
    } else {
      // Not a known state — maybe the admin created a zone with this slug
      // (e.g. "Kwara" → 'kwara'). Let the DB decide; unmatched → no delivery.
      push(raw.replace(/\s+/g, '-'))
    }
  }
  return candidates
}

/** Find the first ACTIVE zone whose slug matches any candidate. */
export async function lookupActiveZone(db, slugs) {
  for (const slug of slugs) {
    const { rows } = await db.query(
      `SELECT zone_name, zone_slug, delivery_fee, estimated_hours_min, estimated_hours_max
       FROM delivery_zones
       WHERE zone_slug = $1 AND is_active = true
       LIMIT 1`,
      [slug]
    )
    if (rows[0]) return rows[0]
  }
  return null
}

/**
 * Resolve the delivery fee for a location from the database.
 * Returns { matched:false } when no active zone covers the location —
 * callers must NOT invent a default price.
 * @param {{state?: string, city?: string}} location
 * @param {import('pg').PoolClient|import('pg').Pool} db
 */
export async function resolveDeliveryFee({ state, city } = {}, db = pool) {
  const candidates = zoneSlugCandidates({ state, city })
  if (candidates.length === 0) return { matched: false, candidates }
  const zone = await lookupActiveZone(db, candidates)
  if (!zone) return { matched: false, candidates }
  return {
    matched: true,
    zoneSlug: zone.zone_slug,
    zoneName: zone.zone_name,
    fee: parseFloat(zone.delivery_fee),
    hoursMin: zone.estimated_hours_min,
    hoursMax: zone.estimated_hours_max,
    candidates,
  }
}

/**
 * Which supported states currently have an active zone? (names only —
 * never prices; checkout fetches fees live from /calculate).
 */
export async function getSupportedStatesWithActiveZones(db = pool) {
  const { rows } = await db.query(
    'SELECT zone_slug FROM delivery_zones WHERE is_active = true'
  )
  const activeSlugs = new Set(rows.map((r) => r.zone_slug))
  return SUPPORTED_STATES.filter((state) =>
    zoneSlugCandidates({ state }).some((slug) => activeSlugs.has(slug))
  )
}
