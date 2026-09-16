/**
 * DEV-ONLY test for the delivery zone resolver (no database required).
 * Runs the REAL service logic with a mocked pg pool that simulates the
 * admin-configured delivery_zones table, then asserts the behaviours
 * required by the checkout spec.
 *
 * Usage: node scripts/test-delivery-resolver.js
 */

// Mock pg.Pool.query BEFORE the service module is imported. The service
// calls db.query(sql, params) (pool by default, client inside transactions),
// so mocking Pool.query exercises the real matching logic end-to-end without
// touching a database.
const pg = (await import('pg')).default
pg.Pool.prototype.query = async function (sql, params = []) {
  if (/FROM delivery_zones/i.test(String(sql)) && /is_active = true/i.test(String(sql))) {
    if (params[0] == null) return { rows: globalThis.__MOCK_ZONE_ROWS__.filter(r => r.is_active) }
    const slug = params[0]
    return { rows: globalThis.__MOCK_ZONE_ROWS__.filter(r => r.zone_slug === slug && r.is_active) }
  }
  return { rows: [] }
}

const svc = await import('../src/services/deliveryZoneService.js')

// Mock zones exactly as an admin might configure them (DIFFERENT fees)
globalThis.__MOCK_ZONE_ROWS__ = [
  { zone_slug: 'lagos', zone_name: 'Lagos', delivery_fee: 5000, is_active: true, estimated_hours_min: 24, estimated_hours_max: 48 },
  { zone_slug: 'ogun', zone_name: 'Ogun State', delivery_fee: 4000, is_active: true, estimated_hours_min: 24, estimated_hours_max: 48 },
  { zone_slug: 'ibadan', zone_name: 'Within Ibadan', delivery_fee: 1500, is_active: true, estimated_hours_min: 2, estimated_hours_max: 4 },
  { zone_slug: 'oyo', zone_name: 'Oyo State (outside Ibadan)', delivery_fee: 3500, is_active: true, estimated_hours_min: 24, estimated_hours_max: 48 },
  { zone_slug: 'osun', zone_name: 'Osun State', delivery_fee: 3500, is_active: true, estimated_hours_min: 24, estimated_hours_max: 48 },
  { zone_slug: 'ondo', zone_name: 'Ondo State', delivery_fee: 4500, is_active: true, estimated_hours_min: 24, estimated_hours_max: 48 },
  { zone_slug: 'ekiti', zone_name: 'Ekiti State', delivery_fee: 3800, is_active: true, estimated_hours_min: 24, estimated_hours_max: 48 },
]

let pass = 0, fail = 0
function check(name, cond, extra = '') {
  if (cond) { pass++; console.log(`  ✓ ${name}`) }
  else { fail++; console.log(`  ✗ ${name} ${extra}`) }
}

const fee = async (state, city) => {
  const r = await svc.resolveDeliveryFee({ state, city })
  return r.matched ? r.fee : null
}

console.log('\n— Per-state configured fees are respected —')
check('Lagos        → 5000', (await fee('lagos', '')) === 5000)
check('Lagos (mixed case + spaces)', (await fee('  LAGOS  ', '')) === 5000)
check('Lagos State  → 5000', (await fee('Lagos State', '')) === 5000)
check('Ogun         → 4000', (await fee('ogun', '')) === 4000)
check('Abeokuta city→ 4000', (await fee('', 'Abeokuta')) === 4000)
check('Oyo (dedicated zone active) → 3500', (await fee('oyo', '')) === 3500)
check('Osun         → 3500', (await fee('osun', '')) === 3500)
check('Ile-Ife city → 3500', (await fee('', 'Ile-Ife')) === 3500)
check('Ondo         → 4500', (await fee('ondo', '')) === 4500)
check('Akure city   → 4500', (await fee('', 'Akure')) === 4500)
check('Ekiti        → 3800', (await fee('ekiti', '')) === 3800)

console.log('\n— City beats state (Ibadan zone inside Oyo) —')
check('city=Ibadan, state=Oyo → 1500', (await fee('Oyo', 'Ibadan')) === 1500)

console.log('\n— Fallback when dedicated zone missing —')
{
  globalThis.__MOCK_ZONE_ROWS__ = globalThis.__MOCK_ZONE_ROWS__.filter(z => z.zone_slug !== 'oyo')
  const v = await fee('oyo', '')
  check('Oyo with NO oyo zone → Ibadan 1500', v === 1500, `got ${v}`)
  globalThis.__MOCK_ZONE_ROWS__.push({ zone_slug: 'oyo', zone_name: 'Oyo State (outside Ibadan)', delivery_fee: 3500, is_active: true })
}

console.log('\n— Unknown / unsupported states are REJECTED, not defaulted —')
check('Kano      → null (no zone)', (await fee('kano', '')) === null)
check('Kwara     → null (no zone)', (await fee('kwara', '')) === null)
check('empty     → null', (await fee('', '')) === null)
check('garbage   → null', (await fee('  !!!  ', '')) === null)

console.log('\n— Deactivated zone is not used —')
{
  const all = globalThis.__MOCK_ZONE_ROWS__
  globalThis.__MOCK_ZONE_ROWS__ = all.map(z => z.zone_slug === 'lagos' ? { ...z, is_active: false } : z)
  const v = await fee('lagos', '')
  check('Lagos zone inactive → null', v === null, `got ${v}`)
  globalThis.__MOCK_ZONE_ROWS__ = all
}

console.log('\n— getSupportedStatesWithActiveZones —')
const states = await svc.getSupportedStatesWithActiveZones()
check('returns all 6 SW states when all zones active',
  JSON.stringify(states) === JSON.stringify(['Lagos', 'Ogun', 'Oyo', 'Osun', 'Ondo', 'Ekiti']),
  JSON.stringify(states))

console.log(`\nRESULT: ${pass} passed, ${fail} failed`)
process.exit(fail > 0 ? 1 : 0)
