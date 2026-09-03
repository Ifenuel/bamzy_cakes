import pool from '../config/db.js'

export async function getTrainings({ status, page = 1, limit = 50 }) {
  let query = `
    SELECT id, title, slug, description, image_url as "imageUrl",
           date, start_time as "startTime", end_time as "endTime", location,
           price, capacity, available_spaces as "availableSpaces",
           what_you_will_learn as "whatYouWillLearn", requirements,
           status as "trainingStatus", created_at as "createdAt"
    FROM trainings WHERE 1=1
  `
  const params = []
  let idx = 1

  if (status) {
    query += ` AND status = $${idx++}`
    params.push(status)
  }

  query += ' ORDER BY date ASC'
  const offset = (page - 1) * limit
  query += ` LIMIT $${idx++} OFFSET $${idx++}`
  params.push(limit, offset)

  const result = await pool.query(query, params)
  return result.rows
}

export async function getTrainingById(id) {
  const result = await pool.query(`
    SELECT id, title, slug, description, image_url as "imageUrl",
           date, start_time as "startTime", end_time as "endTime", location,
           price, capacity, available_spaces as "availableSpaces",
           what_you_will_learn as "whatYouWillLearn", requirements,
           status as "trainingStatus", created_at as "createdAt"
    FROM trainings WHERE id = $1
  `, [id])
  return result.rows[0] || null
}

export async function createTraining(data) {
  const result = await pool.query(`
    INSERT INTO trainings (title, slug, description, date, start_time, end_time, location, price, capacity, available_spaces, what_you_will_learn, requirements, image_url)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING id, title, slug, price, capacity, available_spaces as "availableSpaces", status as "trainingStatus", image_url as "imageUrl"
  `, [data.title, data.slug, data.description, data.date, data.start_time, data.end_time,
      data.location, data.price, data.capacity, data.capacity,
      JSON.stringify(data.what_you_will_learn || []),
      JSON.stringify(data.requirements || []),
      data.image_url || null])
  return result.rows[0]
}

export async function updateTraining(id, updates) {
  const fields = []
  const values = []
  let idx = 1

  const allowed = ['title', 'slug', 'description', 'date', 'start_time', 'end_time', 'location', 'price', 'capacity', 'available_spaces', 'what_you_will_learn', 'requirements', 'status', 'image_url']
  for (const key of allowed) {
    if (updates[key] !== undefined) {
      const val = (key === 'what_you_will_learn' || key === 'requirements') ? JSON.stringify(updates[key]) : updates[key]
      fields.push(`${key} = $${idx++}`)
      values.push(val)
    }
  }
  if (fields.length === 0) return getTrainingById(id)

  fields.push('updated_at = NOW()')
  values.push(id)

  const result = await pool.query(
    `UPDATE trainings SET ${fields.join(', ')} WHERE id = $${idx}
     RETURNING id, title, slug, price, capacity, available_spaces as "availableSpaces", status as "trainingStatus", image_url as "imageUrl"`,
    values
  )
  return result.rows[0] || null
}

export async function deleteTraining(id) {
  await pool.query('DELETE FROM trainings WHERE id = $1', [id])
}

export async function registerForTraining(trainingId, { customer_id, full_name, phone, email, number_of_students }) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const trainingRes = await client.query(
      'SELECT id, price, available_spaces FROM trainings WHERE id = $1 FOR UPDATE',
      [trainingId]
    )
    if (trainingRes.rows.length === 0) throw new Error('Training not found')

    const training = trainingRes.rows[0]
    if (training.available_spaces < number_of_students) {
      throw new Error(`Only ${training.available_spaces} spaces available`)
    }

    const amount = training.price * number_of_students

    await client.query(
      'UPDATE trainings SET available_spaces = available_spaces - $2, updated_at = NOW() WHERE id = $1',
      [trainingId, number_of_students]
    )

    const regRes = await client.query(`
      INSERT INTO training_registrations (training_id, customer_id, full_name, phone, email, number_of_students, amount)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, full_name as "fullName", number_of_students as "numberOfStudents",
                amount, status, created_at as "createdAt"
    `, [trainingId, customer_id || null, full_name, phone, email, number_of_students, amount])

    await client.query('COMMIT')
    return regRes.rows[0]
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
