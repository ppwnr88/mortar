import type { NextFunction, Request, Response } from 'express'
import type { SafeAdminUser } from '../types'

export type AuthenticatedRequest = Request & {
  user?: SafeAdminUser
}

export type AuthVerifier = {
  getProfile: (token: string) => Promise<SafeAdminUser>
}

export const requireAuth = (authService: AuthVerifier) => {
  return async (request: AuthenticatedRequest, response: Response, next: NextFunction) => {
    const header = request.headers.authorization
    if (!header?.startsWith('Bearer ')) {
      response.status(401).json({ message: 'Unauthorized' })
      return
    }

    try {
      const token = header.slice('Bearer '.length)
      request.user = await authService.getProfile(token)
      next()
    } catch {
      response.status(401).json({ message: 'Unauthorized' })
    }
  }
}