import { Router } from 'express'
import { z } from 'zod'
import type { AuthService } from '../services/authService.js'
import type { GoogleAuthService } from '../services/googleAuthService.js'
import { requireAuth } from '../middleware/requireAuth.js'
import type { AuthenticatedRequest, AuthVerifier } from '../middleware/requireAuth.js'

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

const googleSchema = z.object({
  credential: z.string().min(1),
})

type AuthRoutesDependency = Pick<AuthService, 'login' | 'loginWithGoogle' | 'getProfile'>
type GoogleAuthRoutesDependency = Pick<GoogleAuthService, 'isEnabled'>

export const createAuthRoutes = (authService: AuthRoutesDependency, googleAuthService: GoogleAuthRoutesDependency) => {
  const router = Router()

  router.post('/login', async (request, response, next) => {
    try {
      const data = loginSchema.parse(request.body)
      const session = await authService.login(data.username, data.password)
      response.json(session)
    } catch (error) {
      next(error)
    }
  })

  router.post('/google', async (request, response, next) => {
    try {
      if (!googleAuthService.isEnabled()) {
        response.status(501).json({ message: 'Google login is not configured yet' })
        return
      }

      const data = googleSchema.parse(request.body)
      const session = await authService.loginWithGoogle(data.credential)
      response.json(session)
    } catch (error) {
      next(error)
    }
  })

  router.get('/me', requireAuth(authService as AuthVerifier), async (request: AuthenticatedRequest, response) => {
    response.json({ user: request.user })
  })

  return router
}