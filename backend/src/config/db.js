import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config({ override: true })

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  allowExitOnIdle: false,
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err.message)
  // Don't crash the process — let it recover on next query
})

export default pool
