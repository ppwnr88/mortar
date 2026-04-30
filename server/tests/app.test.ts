import express from 'express'
import request from 'supertest'
import { describe, expect, it, vi } from 'vitest'
import { errorHandler } from '../middleware/errorHandler'
import { createAuthRoutes } from '../routes/authRoutes'
import { createContentRoutes } from '../routes/contentRoutes'
import type { AuthService } from '../services/authService'
import type { ContentService } from '../services/contentService'
import type { GoogleAuthService } from '../services/googleAuthService'
import { defaultContent } from '../db/defaultContent'

const createTestApp = () => {
  const adminUser = { id: 1, username: 'admin', displayName: 'Admin', role: 'admin' as const, googleEmail: null }

  const authService: Pick<AuthService, 'login' | 'loginWithGoogle' | 'getProfile'> = {
    login: vi.fn(async () => ({ token: 'token-123', user: adminUser })),
    loginWithGoogle: vi.fn(async () => ({ token: 'token-456', user: adminUser })),
    getProfile: vi.fn(async () => adminUser),
  }

  const googleAuthService: Pick<GoogleAuthService, 'isEnabled'> = {
    isEnabled: vi.fn(() => false),
  }

  const contentService: Pick<ContentService, 'getPublicContent' | 'replaceAllContent' | 'getLanguages' | 'getActiveLanguages' | 'createLanguage' | 'updateLanguage' | 'deleteLanguage'> = {
    getPublicContent: vi.fn(async () => defaultContent),
    replaceAllContent: vi.fn(async (payload) => payload),
    getLanguages: vi.fn(async () => []),
    getActiveLanguages: vi.fn(async () => []),
    createLanguage: vi.fn(async () => ({ code: 'en', name: 'English', isDefault: false, isActive: true, sortOrder: 2 })),
    updateLanguage: vi.fn(async () => ({ code: 'en', name: 'English', isDefault: false, isActive: true, sortOrder: 2 })),
    deleteLanguage: vi.fn(async () => undefined),
  }

  const app = express()
  app.use(express.json())
  app.use('/api/auth', createAuthRoutes(authService, googleAuthService))
  app.use('/api', createContentRoutes(contentService, authService))
  app.use(errorHandler)

  return { app, authService, contentService }
}

describe('API routes', () => {
  it('returns public content', async () => {
    const { app } = createTestApp()

    const response = await request(app).get('/api/public/content')

    expect(response.status).toBe(200)
    expect(response.body.siteContent.brandName).toBe(defaultContent.siteContent.brandName)
  })

  it('logs in with username and password', async () => {
    const { app, authService } = createTestApp()

    const response = await request(app).post('/api/auth/login').send({ username: 'admin', password: 'secret' })

    expect(response.status).toBe(200)
    expect(response.body.token).toBe('token-123')
    expect(authService.login).toHaveBeenCalledWith('admin', 'secret')
  })

  it('blocks admin content without token', async () => {
    const { app } = createTestApp()

    const response = await request(app).get('/api/admin/content')

    expect(response.status).toBe(401)
  })

  it('updates admin content with token', async () => {
    const { app, contentService } = createTestApp()

    const response = await request(app)
      .put('/api/admin/content')
      .set('Authorization', 'Bearer token-123')
      .send(defaultContent)

    expect(response.status).toBe(200)
    expect(contentService.replaceAllContent).toHaveBeenCalled()
  })
})