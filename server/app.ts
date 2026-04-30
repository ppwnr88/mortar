import cors from 'cors'
import express from 'express'
import { env } from './config/env'
import { initializeDatabase } from './db/init'
import { pool } from './db/pool'
import { errorHandler } from './middleware/errorHandler'
import { UserRepository } from './repositories/userRepository'
import { createAuthRoutes } from './routes/authRoutes'
import { createContentRoutes } from './routes/contentRoutes'
import { AuthService } from './services/authService'
import { ContentService } from './services/contentService'
import { GoogleAuthService } from './services/googleAuthService'

export const createApp = async () => {
  await initializeDatabase()

  const app = express()
  const googleAuthService = new GoogleAuthService()
  const userRepository = new UserRepository(pool)
  const authService = new AuthService(userRepository, googleAuthService)
  const contentService = new ContentService(pool)

  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  )
  app.use(express.json({ limit: '1mb' }))

  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok', env: env.NODE_ENV })
  })

  app.use('/api/auth', createAuthRoutes(authService, googleAuthService))
  app.use('/api', createContentRoutes(contentService, authService))

  app.use(errorHandler)

  return app
}