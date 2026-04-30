import { OAuth2Client } from 'google-auth-library'
import { allowedGoogleEmails, env } from '../config/env'
import type { GoogleProfile } from '../types'

export class GoogleAuthService {
  private readonly client = env.GOOGLE_CLIENT_ID ? new OAuth2Client(env.GOOGLE_CLIENT_ID) : null

  isEnabled(): boolean {
    return Boolean(this.client)
  }

  async verifyIdToken(idToken: string): Promise<GoogleProfile> {
    if (!this.client || !env.GOOGLE_CLIENT_ID) {
      throw new Error('Google login is not configured')
    }

    const ticket = await this.client.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()
    if (!payload?.email || !payload.name) {
      throw new Error('Google account does not include required profile information')
    }

    const normalizedEmail = payload.email.toLowerCase()
    if (allowedGoogleEmails.size > 0 && !allowedGoogleEmails.has(normalizedEmail)) {
      throw new Error('This Google account is not allowed to access backoffice')
    }

    return {
      email: normalizedEmail,
      name: payload.name,
      picture: payload.picture,
    }
  }
}