import type { Pool, PoolClient } from 'pg'
import type { AdminUser, SafeAdminUser } from '../types'

type Queryable = Pool | PoolClient

const mapAdminUser = (row: Record<string, unknown>): AdminUser => ({
  id: Number(row.id),
  username: String(row.username),
  displayName: String(row.display_name),
  role: 'admin',
  googleEmail: row.google_email ? String(row.google_email) : null,
  passwordHash: String(row.password_hash),
})

export const toSafeAdminUser = (user: AdminUser): SafeAdminUser => ({
  id: user.id,
  username: user.username,
  displayName: user.displayName,
  role: user.role,
  googleEmail: user.googleEmail,
})

export class UserRepository {
  constructor(private readonly db: Queryable) {}

  async findByUsername(username: string): Promise<AdminUser | null> {
    const result = await this.db.query('SELECT * FROM admin_users WHERE username = $1', [username])
    return result.rows[0] ? mapAdminUser(result.rows[0] as Record<string, unknown>) : null
  }

  async findByGoogleEmail(email: string): Promise<AdminUser | null> {
    const result = await this.db.query('SELECT * FROM admin_users WHERE google_email = $1', [email])
    return result.rows[0] ? mapAdminUser(result.rows[0] as Record<string, unknown>) : null
  }

  async countUsers(): Promise<number> {
    const result = await this.db.query('SELECT COUNT(*)::int AS count FROM admin_users')
    return Number(result.rows[0]?.count ?? 0)
  }

  async createUser(input: {
    username: string
    displayName: string
    passwordHash: string
    googleEmail?: string | null
  }): Promise<AdminUser> {
    const result = await this.db.query(
      `INSERT INTO admin_users (username, display_name, password_hash, google_email)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [input.username, input.displayName, input.passwordHash, input.googleEmail ?? null],
    )

    return mapAdminUser(result.rows[0] as Record<string, unknown>)
  }
}