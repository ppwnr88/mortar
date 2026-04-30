import type { Pool, PoolClient } from 'pg'
import type { Feature, Language, Product, PublicContent, SiteContent, SiteStat, SocialLink, Testimonial } from '../types.js'

type Queryable = Pool | PoolClient

const mapLanguage = (row: Record<string, unknown>): Language => ({
  code: String(row.code),
  name: String(row.name),
  isDefault: Boolean(row.is_default),
  isActive: Boolean(row.is_active),
  sortOrder: Number(row.sort_order),
})

const mapSiteContent = (row: Record<string, string>): SiteContent => ({
  brandName: row.brand_name,
  heroTitle: row.hero_title,
  heroSubtitle: row.hero_subtitle,
  heroImageUrl: row.hero_image_url,
  primaryCtaLabel: row.primary_cta_label,
  secondaryCtaLabel: row.secondary_cta_label,
  featuresTitle: row.features_title,
  productsTitle: row.products_title,
  productsSubtitle: row.products_subtitle,
  testimonialsTitle: row.testimonials_title,
  ctaTitle: row.cta_title,
  ctaSubtitle: row.cta_subtitle,
  ctaButtonLabel: row.cta_button_label,
  contactTitle: row.contact_title,
  phone: row.phone,
  lineId: row.line_id,
  email: row.email,
  address: row.address,
  footerDescription: row.footer_description,
})

const mapStat = (row: Record<string, string | number>): SiteStat => ({
  id: Number(row.id),
  value: String(row.value),
  label: String(row.label),
  sortOrder: Number(row.sort_order),
})

const mapFeature = (row: Record<string, string | number>): Feature => ({
  id: Number(row.id),
  icon: String(row.icon),
  title: String(row.title),
  description: String(row.description),
  sortOrder: Number(row.sort_order),
})

const mapProduct = (row: Record<string, string | number | boolean>): Product => ({
  id: Number(row.id),
  name: String(row.name),
  sizeLabel: String(row.size_label),
  price: Number(row.price),
  originalPrice: Number(row.original_price),
  imageUrl: String(row.image_url),
  description: String(row.description),
  inStock: Boolean(row.in_stock),
  sortOrder: Number(row.sort_order),
})

const mapTestimonial = (row: Record<string, string | number>): Testimonial => ({
  id: Number(row.id),
  customerName: String(row.customer_name),
  location: String(row.location),
  comment: String(row.comment),
  rating: Number(row.rating),
  sortOrder: Number(row.sort_order),
})

const mapSocialLink = (row: Record<string, string | number>): SocialLink => ({
  id: Number(row.id),
  label: String(row.label),
  url: String(row.url),
  icon: String(row.icon),
  sortOrder: Number(row.sort_order),
})

export class ContentRepository {
  constructor(private readonly db: Queryable) {}

  // ── Language Methods ────────────────────────────────────────────────────────

  async getLanguages(): Promise<Language[]> {
    const result = await this.db.query('SELECT * FROM languages ORDER BY sort_order, code')
    return result.rows.map((row: unknown) => mapLanguage(row as Record<string, unknown>))
  }

  async getActiveLanguages(): Promise<Language[]> {
    const result = await this.db.query('SELECT * FROM languages WHERE is_active = TRUE ORDER BY sort_order, code')
    return result.rows.map((row: unknown) => mapLanguage(row as Record<string, unknown>))
  }

  async getDefaultLanguageCode(): Promise<string> {
    const result = await this.db.query("SELECT code FROM languages WHERE is_default = TRUE LIMIT 1")
    return String(result.rows[0]?.code ?? 'th')
  }

  async languageExists(code: string): Promise<boolean> {
    const result = await this.db.query('SELECT 1 FROM languages WHERE code = $1', [code])
    return result.rows.length > 0
  }

  async createLanguage(code: string, name: string, sortOrder: number): Promise<Language> {
    const result = await this.db.query(
      'INSERT INTO languages (code, name, is_default, is_active, sort_order) VALUES ($1, $2, FALSE, TRUE, $3) RETURNING *',
      [code, name, sortOrder],
    )
    return mapLanguage(result.rows[0] as Record<string, unknown>)
  }

  async updateLanguage(code: string, patch: Partial<{ name: string; isActive: boolean; isDefault: boolean; sortOrder: number }>): Promise<Language | null> {
    const fields: string[] = []
    const values: unknown[] = []
    let idx = 1

    if (patch.name !== undefined) { fields.push(`name = $${idx++}`); values.push(patch.name) }
    if (patch.isActive !== undefined) { fields.push(`is_active = $${idx++}`); values.push(patch.isActive) }
    if (patch.isDefault !== undefined) { fields.push(`is_default = $${idx++}`); values.push(patch.isDefault) }
    if (patch.sortOrder !== undefined) { fields.push(`sort_order = $${idx++}`); values.push(patch.sortOrder) }

    if (fields.length === 0) {
      const result = await this.db.query('SELECT * FROM languages WHERE code = $1', [code])
      return result.rows.length > 0 ? mapLanguage(result.rows[0] as Record<string, unknown>) : null
    }

    values.push(code)
    const result = await this.db.query(
      `UPDATE languages SET ${fields.join(', ')} WHERE code = $${idx} RETURNING *`,
      values,
    )
    return result.rows.length > 0 ? mapLanguage(result.rows[0] as Record<string, unknown>) : null
  }

  async setDefaultLanguage(code: string): Promise<void> {
    await this.db.query('UPDATE languages SET is_default = FALSE')
    await this.db.query('UPDATE languages SET is_default = TRUE WHERE code = $1', [code])
  }

  async deleteLanguage(code: string): Promise<void> {
    await this.db.query('DELETE FROM site_content WHERE language_code = $1', [code])
    await this.db.query('DELETE FROM site_stats WHERE language_code = $1', [code])
    await this.db.query('DELETE FROM features WHERE language_code = $1', [code])
    await this.db.query('DELETE FROM products WHERE language_code = $1', [code])
    await this.db.query('DELETE FROM testimonials WHERE language_code = $1', [code])
    await this.db.query('DELETE FROM social_links WHERE language_code = $1', [code])
    await this.db.query('DELETE FROM languages WHERE code = $1', [code])
  }

  async copyContentToLanguage(fromCode: string, toCode: string): Promise<void> {
    // Copy site_content
    await this.db.query(
      `INSERT INTO site_content
        (language_code, brand_name, hero_title, hero_subtitle, hero_image_url,
         primary_cta_label, secondary_cta_label, features_title, products_title,
         products_subtitle, testimonials_title, cta_title, cta_subtitle,
         cta_button_label, contact_title, phone, line_id, email, address,
         footer_description, updated_at)
       SELECT $2, brand_name, hero_title, hero_subtitle, hero_image_url,
         primary_cta_label, secondary_cta_label, features_title, products_title,
         products_subtitle, testimonials_title, cta_title, cta_subtitle,
         cta_button_label, contact_title, phone, line_id, email, address,
         footer_description, NOW()
       FROM site_content WHERE language_code = $1
       ON CONFLICT (language_code) DO NOTHING`,
      [fromCode, toCode],
    )

    // Copy collection tables
    await this.db.query(
      `INSERT INTO site_stats (value, label, sort_order, language_code)
       SELECT value, label, sort_order, $2 FROM site_stats WHERE language_code = $1`,
      [fromCode, toCode],
    )
    await this.db.query(
      `INSERT INTO features (icon, title, description, sort_order, language_code)
       SELECT icon, title, description, sort_order, $2 FROM features WHERE language_code = $1`,
      [fromCode, toCode],
    )
    await this.db.query(
      `INSERT INTO products (name, size_label, price, original_price, image_url, description, in_stock, sort_order, language_code)
       SELECT name, size_label, price, original_price, image_url, description, in_stock, sort_order, $2
       FROM products WHERE language_code = $1`,
      [fromCode, toCode],
    )
    await this.db.query(
      `INSERT INTO testimonials (customer_name, location, comment, rating, sort_order, language_code)
       SELECT customer_name, location, comment, rating, sort_order, $2 FROM testimonials WHERE language_code = $1`,
      [fromCode, toCode],
    )
    await this.db.query(
      `INSERT INTO social_links (label, url, icon, sort_order, language_code)
       SELECT label, url, icon, sort_order, $2 FROM social_links WHERE language_code = $1`,
      [fromCode, toCode],
    )
  }

  // ── Content Methods ─────────────────────────────────────────────────────────

  async getPublicContent(languageCode: string): Promise<PublicContent> {
    const [siteContentResult, statsResult, featuresResult, productsResult, testimonialsResult, socialLinksResult] =
      await Promise.all([
        this.db.query('SELECT * FROM site_content WHERE language_code = $1', [languageCode]),
        this.db.query('SELECT * FROM site_stats WHERE language_code = $1 ORDER BY sort_order, id', [languageCode]),
        this.db.query('SELECT * FROM features WHERE language_code = $1 ORDER BY sort_order, id', [languageCode]),
        this.db.query('SELECT * FROM products WHERE language_code = $1 ORDER BY sort_order, id', [languageCode]),
        this.db.query('SELECT * FROM testimonials WHERE language_code = $1 ORDER BY sort_order, id', [languageCode]),
        this.db.query('SELECT * FROM social_links WHERE language_code = $1 ORDER BY sort_order, id', [languageCode]),
      ])

    return {
      siteContent: mapSiteContent(siteContentResult.rows[0] as Record<string, string>),
      stats: statsResult.rows.map((row: unknown) => mapStat(row as Record<string, string | number>)),
      features: featuresResult.rows.map((row: unknown) => mapFeature(row as Record<string, string | number>)),
      products: productsResult.rows.map((row: unknown) => mapProduct(row as Record<string, string | number | boolean>)),
      testimonials: testimonialsResult.rows.map((row: unknown) => mapTestimonial(row as Record<string, string | number>)),
      socialLinks: socialLinksResult.rows.map((row: unknown) => mapSocialLink(row as Record<string, string | number>)),
    }
  }

  async upsertSiteContent(siteContent: SiteContent, languageCode: string): Promise<void> {
    await this.db.query(
      `INSERT INTO site_content (
        language_code, brand_name, hero_title, hero_subtitle, hero_image_url, primary_cta_label, secondary_cta_label,
        features_title, products_title, products_subtitle, testimonials_title, cta_title, cta_subtitle,
        cta_button_label, contact_title, phone, line_id, email, address, footer_description, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7,
        $8, $9, $10, $11, $12, $13,
        $14, $15, $16, $17, $18, $19, $20, NOW()
      )
      ON CONFLICT (language_code) DO UPDATE SET
        brand_name = EXCLUDED.brand_name,
        hero_title = EXCLUDED.hero_title,
        hero_subtitle = EXCLUDED.hero_subtitle,
        hero_image_url = EXCLUDED.hero_image_url,
        primary_cta_label = EXCLUDED.primary_cta_label,
        secondary_cta_label = EXCLUDED.secondary_cta_label,
        features_title = EXCLUDED.features_title,
        products_title = EXCLUDED.products_title,
        products_subtitle = EXCLUDED.products_subtitle,
        testimonials_title = EXCLUDED.testimonials_title,
        cta_title = EXCLUDED.cta_title,
        cta_subtitle = EXCLUDED.cta_subtitle,
        cta_button_label = EXCLUDED.cta_button_label,
        contact_title = EXCLUDED.contact_title,
        phone = EXCLUDED.phone,
        line_id = EXCLUDED.line_id,
        email = EXCLUDED.email,
        address = EXCLUDED.address,
        footer_description = EXCLUDED.footer_description,
        updated_at = NOW()`,
      [
        languageCode,
        siteContent.brandName,
        siteContent.heroTitle,
        siteContent.heroSubtitle,
        siteContent.heroImageUrl,
        siteContent.primaryCtaLabel,
        siteContent.secondaryCtaLabel,
        siteContent.featuresTitle,
        siteContent.productsTitle,
        siteContent.productsSubtitle,
        siteContent.testimonialsTitle,
        siteContent.ctaTitle,
        siteContent.ctaSubtitle,
        siteContent.ctaButtonLabel,
        siteContent.contactTitle,
        siteContent.phone,
        siteContent.lineId,
        siteContent.email,
        siteContent.address,
        siteContent.footerDescription,
      ],
    )
  }

  async replaceStats(stats: SiteStat[], languageCode: string): Promise<void> {
    await this.replaceRowsForLanguage('site_stats', 'value, label, sort_order', stats.map((item) => [item.value, item.label, item.sortOrder]), languageCode)
  }

  async replaceFeatures(features: Feature[], languageCode: string): Promise<void> {
    await this.replaceRowsForLanguage('features', 'icon, title, description, sort_order', features.map((item) => [item.icon, item.title, item.description, item.sortOrder]), languageCode)
  }

  async replaceProducts(products: Product[], languageCode: string): Promise<void> {
    await this.replaceRowsForLanguage(
      'products',
      'name, size_label, price, original_price, image_url, description, in_stock, sort_order',
      products.map((item) => [item.name, item.sizeLabel, item.price, item.originalPrice, item.imageUrl, item.description, item.inStock, item.sortOrder]),
      languageCode,
    )
  }

  async replaceTestimonials(testimonials: Testimonial[], languageCode: string): Promise<void> {
    await this.replaceRowsForLanguage(
      'testimonials',
      'customer_name, location, comment, rating, sort_order',
      testimonials.map((item) => [item.customerName, item.location, item.comment, item.rating, item.sortOrder]),
      languageCode,
    )
  }

  async replaceSocialLinks(socialLinks: SocialLink[], languageCode: string): Promise<void> {
    await this.replaceRowsForLanguage('social_links', 'label, url, icon, sort_order', socialLinks.map((item) => [item.label, item.url, item.icon, item.sortOrder]), languageCode)
  }

  private async replaceRowsForLanguage(tableName: string, columns: string, rows: unknown[][], languageCode: string): Promise<void> {
    await this.db.query(`DELETE FROM ${tableName} WHERE language_code = $1`, [languageCode])
    if (rows.length === 0) return

    const allColumns = `${columns}, language_code`
    const rowsWithLang = rows.map((row) => [...row, languageCode])
    const columnCount = rowsWithLang[0].length
    const values: unknown[] = []
    const placeholders = rowsWithLang
      .map((row, rowIndex) => {
        values.push(...row)
        const rowPlaceholders = row.map((_, columnIndex) => `$${rowIndex * columnCount + columnIndex + 1}`).join(', ')
        return `(${rowPlaceholders})`
      })
      .join(', ')

    await this.db.query(`INSERT INTO ${tableName} (${allColumns}) VALUES ${placeholders}`, values)
  }
}
