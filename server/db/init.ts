import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import argon2 from 'argon2'
import { env } from '../config/env'
import { defaultContent } from './defaultContent'
import { pool } from './pool'
import { ContentRepository } from '../repositories/contentRepository'
import { UserRepository } from '../repositories/userRepository'

let initialized = false

export async function initializeDatabase(): Promise<void> {
  if (initialized) {
    return
  }

  const schemaPath = join(process.cwd(), 'server', 'db', 'schema.sql')
  const schemaSql = await readFile(schemaPath, 'utf8')
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    await client.query(schemaSql)

    const contentRepository = new ContentRepository(client)

    // Seed default Thai language
    const langCount = await client.query('SELECT COUNT(*)::int AS count FROM languages')
    if (Number(langCount.rows[0]?.count ?? 0) === 0) {
      await client.query(
        `INSERT INTO languages (code, name, is_default, is_active, sort_order) VALUES ($1, $2, TRUE, TRUE, 1)`,
        ['th', 'ภาษาไทย'],
      )
    }

    const contentExistsResult = await client.query('SELECT COUNT(*)::int AS count FROM site_content')
    if (Number(contentExistsResult.rows[0]?.count ?? 0) === 0) {
      await contentRepository.upsertSiteContent(defaultContent.siteContent, 'th')
      await contentRepository.replaceStats(defaultContent.stats, 'th')
      await contentRepository.replaceFeatures(defaultContent.features, 'th')
      await contentRepository.replaceProducts(defaultContent.products, 'th')
      await contentRepository.replaceTestimonials(defaultContent.testimonials, 'th')
      await contentRepository.replaceSocialLinks(defaultContent.socialLinks, 'th')
    }

    const users = new UserRepository(client)
    if ((await users.countUsers()) === 0) {
      const passwordHash = await argon2.hash(env.ADMIN_PASSWORD)
      await users.createUser({
        username: env.ADMIN_USERNAME,
        displayName: env.ADMIN_DISPLAY_NAME,
        passwordHash,
      })
    }

    await client.query('COMMIT')
    initialized = true
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
