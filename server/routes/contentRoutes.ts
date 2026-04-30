import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/requireAuth.js'
import type { AuthService } from '../services/authService.js'
import type { ContentService } from '../services/contentService.js'

const publicContentSchema = z.object({
  siteContent: z.object({
    brandName: z.string(),
    heroTitle: z.string(),
    heroSubtitle: z.string(),
    heroImageUrl: z.string(),
    primaryCtaLabel: z.string(),
    secondaryCtaLabel: z.string(),
    featuresTitle: z.string(),
    productsTitle: z.string(),
    productsSubtitle: z.string(),
    testimonialsTitle: z.string(),
    ctaTitle: z.string(),
    ctaSubtitle: z.string(),
    ctaButtonLabel: z.string(),
    contactTitle: z.string(),
    phone: z.string(),
    lineId: z.string(),
    email: z.string(),
    address: z.string(),
    footerDescription: z.string(),
  }),
  stats: z.array(z.object({ id: z.number(), value: z.string(), label: z.string(), sortOrder: z.number() })),
  features: z.array(z.object({ id: z.number(), icon: z.string(), title: z.string(), description: z.string(), sortOrder: z.number() })),
  products: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      sizeLabel: z.string(),
      price: z.number(),
      originalPrice: z.number(),
      imageUrl: z.string(),
      description: z.string(),
      inStock: z.boolean(),
      sortOrder: z.number(),
    }),
  ),
  testimonials: z.array(
    z.object({ id: z.number(), customerName: z.string(), location: z.string(), comment: z.string(), rating: z.number(), sortOrder: z.number() }),
  ),
  socialLinks: z.array(z.object({ id: z.number(), label: z.string(), url: z.string(), icon: z.string(), sortOrder: z.number() })),
})

const createLanguageSchema = z.object({
  code: z.string().min(2).max(10).regex(/^[a-z0-9_-]+$/, 'Code must be lowercase letters, numbers, hyphens, or underscores'),
  name: z.string().min(1),
  copyFrom: z.string().optional(),
})

const updateLanguageSchema = z.object({
  name: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
  isDefault: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
})

type ContentRoutesDependency = Pick<ContentService, 'getPublicContent' | 'replaceAllContent' | 'getLanguages' | 'getActiveLanguages' | 'createLanguage' | 'updateLanguage' | 'deleteLanguage'>
type ContentAuthDependency = Pick<AuthService, 'getProfile'>

export const createContentRoutes = (contentService: ContentRoutesDependency, authService: ContentAuthDependency) => {
  const router = Router()

  // ── Public ──────────────────────────────────────────────────────────────────

  router.get('/public/languages', async (_request, response, next) => {
    try {
      const languages = await contentService.getActiveLanguages()
      response.json(languages)
    } catch (error) {
      next(error)
    }
  })

  router.get('/public/content', async (request, response, next) => {
    try {
      const lang = typeof request.query.lang === 'string' ? request.query.lang : undefined
      const content = await contentService.getPublicContent(lang)
      response.json(content)
    } catch (error) {
      next(error)
    }
  })

  // ── Admin ───────────────────────────────────────────────────────────────────

  router.get('/admin/languages', requireAuth(authService), async (_request, response, next) => {
    try {
      const languages = await contentService.getLanguages()
      response.json(languages)
    } catch (error) {
      next(error)
    }
  })

  router.post('/admin/languages', requireAuth(authService), async (request, response, next) => {
    try {
      const { code, name, copyFrom } = createLanguageSchema.parse(request.body)
      const language = await contentService.createLanguage(code, name, copyFrom)
      response.status(201).json(language)
    } catch (error) {
      next(error)
    }
  })

  router.put('/admin/languages/:code', requireAuth(authService), async (request, response, next) => {
    try {
      const code = String(request.params.code)
      const patch = updateLanguageSchema.parse(request.body)
      const language = await contentService.updateLanguage(code, patch)
      response.json(language)
    } catch (error) {
      next(error)
    }
  })

  router.delete('/admin/languages/:code', requireAuth(authService), async (request, response, next) => {
    try {
      const code = String(request.params.code)
      await contentService.deleteLanguage(code)
      response.status(204).send()
    } catch (error) {
      next(error)
    }
  })

  router.get('/admin/content', requireAuth(authService), async (request, response, next) => {
    try {
      const lang = typeof request.query.lang === 'string' ? request.query.lang : undefined
      const content = await contentService.getPublicContent(lang)
      response.json(content)
    } catch (error) {
      next(error)
    }
  })

  router.put('/admin/content', requireAuth(authService), async (request, response, next) => {
    try {
      const lang = typeof request.query.lang === 'string' ? request.query.lang : undefined
      if (!lang) {
        response.status(400).json({ message: 'lang query parameter is required' })
        return
      }
      const content = publicContentSchema.parse(request.body)
      const updated = await contentService.replaceAllContent(content, lang)
      response.json(updated)
    } catch (error) {
      next(error)
    }
  })

  return router
}
