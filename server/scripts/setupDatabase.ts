import { initializeDatabase } from '../db/init'
import { pool } from '../db/pool'

initializeDatabase()
  .then(async () => {
    console.log('Database schema and seed data are ready.')
    await pool.end()
  })
  .catch(async (error: unknown) => {
    console.error(error)
    await pool.end()
    process.exit(1)
  })