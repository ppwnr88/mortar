import { createHash } from 'node:crypto'
import argon2 from 'argon2'
import { V3 } from 'paseto'
import { env } from '../config/env.js'
import { toSafeAdminUser, UserRepository } from '../repositories/userRepository.js'
import type { AuthSession, AuthTokenPayload, SafeAdminUser } from '../types.js'
import type { GoogleAuthService } from './googleAuthService.js'

export class AuthService {
  private readonly tokenKey = createHash('sha256').update(env.PASETO_SECRET).digest()

  constructor(
    private readonly users: UserRepository,
    private readonly googleAuthService: GoogleAuthService,
  ) {}

  async login(username: string, password: string): Promise<AuthSession> {
    const user = await this.users.findByUsername(username)
    if (!user) {
      throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
    }

    const isValid = await argon2.verify(user.passwordHash, password)
    if (!isValid) {
      throw new Error('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง')
    }

    return this.createSession(toSafeAdminUser(user))
  }

  async loginWithGoogle(idToken: string): Promise<AuthSession> {
    const googleProfile = await this.googleAuthService.verifyIdToken(idToken)
    const user = await this.users.findByGoogleEmail(googleProfile.email)
    if (!user) {
      throw new Error('ยังไม่มีสิทธิ์สำหรับบัญชี Google นี้')
    }

    return this.createSession(toSafeAdminUser(user))
  }

  async getProfile(token: string): Promise<SafeAdminUser> {
    const payload = await V3.decrypt<AuthTokenPayload>(token, this.tokenKey)
    return {
      id: Number(payload.sub),
      username: payload.username,
      displayName: payload.displayName,
      role: payload.role,
      googleEmail: null,
    }
  }

  private async createSession(user: SafeAdminUser): Promise<AuthSession> {
    const token = await V3.encrypt(
      {
        sub: String(user.id),
        username: user.username,
        displayName: user.displayName,
        role: user.role,
      },
      this.tokenKey,
      {
        issuer: 'mortar-backoffice',
        audience: 'mortar-admin',
        expiresIn: '12 hours',
      },
    )

    return { token, user }
  }
}