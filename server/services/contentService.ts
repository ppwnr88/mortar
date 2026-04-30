import type { Pool } from 'pg'
import { z } from 'zod'
import { ContentRepository } from '../repositories/contentRepository.js'
import type { Language, PublicContent } from '../types.js'

const imagePathSchema = z.string().refine((value) => {
  if (value.startsWith('/')) {
    return true
  }

  return z.string().url().safeParse(value).success
}, 'Must be an absolute URL or a site-relative asset path')

const siteContentSchema = z.object({
  brandName: z.string().min(1),
  heroTitle: z.string().min(1),
  heroSubtitle: z.string().min(1),
  heroImageUrl: imagePathSchema,
  primaryCtaLabel: z.string().min(1),
  secondaryCtaLabel: z.string().min(1),
  featuresTitle: z.string().min(1),
  productsTitle: z.string().min(1),
  productsSubtitle: z.string().min(1),
  testimonialsTitle: z.string().min(1),
  ctaTitle: z.string().min(1),
  ctaSubtitle: z.string().min(1),
  ctaButtonLabel: z.string().min(1),
  contactTitle: z.string().min(1),
  phone: z.string().min(1),
  lineId: z.string().min(1),
  email: z.string().email(),
  address: z.string().min(1),
  footerDescription: z.string().min(1),
})

const statSchema = z.object({
  id: z.number().int(),
  value: z.string().min(1),
  label: z.string().min(1),
  sortOrder: z.number().int(),
})

const featureSchema = z.object({
  id: z.number().int(),
  icon: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  sortOrder: z.number().int(),
})

const productSchema = z.object({
  id: z.number().int(),
  name: z.string().min(1),
  sizeLabel: z.string().min(1),
  price: z.number().nonnegative(),
  originalPrice: z.number().nonnegative(),
  imageUrl: imagePathSchema,
  description: z.string().min(1),
  inStock: z.boolean(),
  sortOrder: z.number().int(),
})

const testimonialSchema = z.object({
  id: z.number().int(),
  customerName: z.string().min(1),
  location: z.string().min(1),
  comment: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  sortOrder: z.number().int(),
})

const socialLinkSchema = z.object({
  id: z.number().int(),
  label: z.string().min(1),
  url: z.string().min(1),
  icon: z.string().min(1),
  sortOrder: z.number().int(),
})

const publicContentSchema = z.object({
  siteContent: siteContentSchema,
  stats: z.array(statSchema),
  features: z.array(featureSchema),
  products: z.array(productSchema),
  testimonials: z.array(testimonialSchema),
  socialLinks: z.array(socialLinkSchema),
})

export class ContentService {
  constructor(private readonly pool: Pool) {}

  async getDefaultLanguageCode(): Promise<string> {
    const repository = new ContentRepository(this.pool)
    return repository.getDefaultLanguageCode()
  }

  async getPublicContent(languageCode?: string): Promise<PublicContent> {
    const repository = new ContentRepository(this.pool)
    const code = languageCode ?? (await repository.getDefaultLanguageCode())
    return repository.getPublicContent(code)
  }

  async replaceAllContent(input: PublicContent, languageCode: string): Promise<PublicContent> {
    const data = publicContentSchema.parse(input)
    const client = await this.pool.connect()

    try {
      await client.query('BEGIN')
      const repository = new ContentRepository(client)

      // Verify language exists
      const exists = await repository.languageExists(languageCode)
      if (!exists) {
        throw new Error(`Language '${languageCode}' not found`)
      }

      await repository.upsertSiteContent(data.siteContent, languageCode)
      await repository.replaceStats(data.stats, languageCode)
      await repository.replaceFeatures(data.features, languageCode)
      await repository.replaceProducts(data.products, languageCode)
      await repository.replaceTestimonials(data.testimonials, languageCode)
      await repository.replaceSocialLinks(data.socialLinks, languageCode)
      await client.query('COMMIT')

      return repository.getPublicContent(languageCode)
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  async getLanguages(): Promise<Language[]> {
    const repository = new ContentRepository(this.pool)
    return repository.getLanguages()
  }

  async getActiveLanguages(): Promise<Language[]> {
    const repository = new ContentRepository(this.pool)
    return repository.getActiveLanguages()
  }

  async createLanguage(code: string, name: string, copyFrom?: string): Promise<Language> {
    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')
      const repository = new ContentRepository(client)

      const existing = await repository.languageExists(code)
      if (existing) {
        throw new Error(`Language '${code}' already exists`)
      }

      const allLanguages = await repository.getLanguages()
      const sortOrder = allLanguages.length + 1
      const language = await repository.createLanguage(code, name, sortOrder)

      if (copyFrom) {
        const sourceExists = await repository.languageExists(copyFrom)
        if (!sourceExists) {
          throw new Error(`Source language '${copyFrom}' not found`)
        }
        await repository.copyContentToLanguage(copyFrom, code)
      }

      await client.query('COMMIT')
      return language
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  async updateLanguage(code: string, patch: Partial<{ name: string; isActive: boolean; isDefault: boolean; sortOrder: number }>): Promise<Language> {
    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')
      const repository = new ContentRepository(client)

      if (patch.isDefault === true) {
        await repository.setDefaultLanguage(code)
        const rest: Partial<{ name: string; isActive: boolean; sortOrder: number }> = {
          ...(patch.name !== undefined ? { name: patch.name } : {}),
          ...(patch.isActive !== undefined ? { isActive: patch.isActive } : {}),
          ...(patch.sortOrder !== undefined ? { sortOrder: patch.sortOrder } : {}),
        }
        const result = await repository.updateLanguage(code, rest)
        await client.query('COMMIT')
        if (!result) throw new Error(`Language '${code}' not found`)
        return result
      }

      const result = await repository.updateLanguage(code, patch)
      await client.query('COMMIT')
      if (!result) throw new Error(`Language '${code}' not found`)
      return result
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  async deleteLanguage(code: string): Promise<void> {
    const client = await this.pool.connect()
    try {
      await client.query('BEGIN')
      const repository = new ContentRepository(client)

      const languages = await repository.getLanguages()
      const target = languages.find((l) => l.code === code)
      if (!target) throw new Error(`Language '${code}' not found`)
      if (target.isDefault) throw new Error('Cannot delete the default language')
      if (languages.length === 1) throw new Error('Cannot delete the only language')

      await repository.deleteLanguage(code)
      await client.query('COMMIT')
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }
}
