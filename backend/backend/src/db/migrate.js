import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import pool from '../config/db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const MIGRATIONS_DIR = path.join(__dirname, 'migrations')

async function migrate() {
  const client = await pool.connect()
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename TEXT NOT NULL UNIQUE,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    const applied = await client.query('SELECT filename FROM migrations ORDER BY id')
    const appliedSet = new Set(applied.rows.map(r => r.filename))

    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort()

    if (files.length === 0) {
      console.log('No migration files found in', MIGRATIONS_DIR)
    }

    for (const file of files) {
      if (appliedSet.has(file)) {
        console.log('Already applied: ' + file)
        continue
      }

      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8')
      console.log('Applying: ' + file)
      await client.query('BEGIN')
      try {
        await client.query(sql)
        await client.query('INSERT INTO migrations (filename) VALUES ($1)', [file])
        await client.query('COMMIT')
        console.log('Applied: ' + file)
      } catch (err) {
        await client.query('ROLLBACK')
        console.error('Failed: ' + file)
        throw err
      }
    }

    console.log('\nAll migrations complete!')
  } finally {
    client.release()
    await pool.end()
  }
}

migrate().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
