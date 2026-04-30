export type Language = {
  code: string
  name: string
  isDefault: boolean
  isActive: boolean
  sortOrder: number
}

export type Product = {
  id: number
  name: string
  sizeLabel: string
  price: number
  originalPrice: number
  imageUrl: string
  description: string
  inStock: boolean
  sortOrder: number
}

export type Feature = {
  id: number
  icon: string
  title: string
  description: string
  sortOrder: number
}

export type Testimonial = {
  id: number
  customerName: string
  location: string
  comment: string
  rating: number
  sortOrder: number
}

export type SiteStat = {
  id: number
  value: string
  label: string
  sortOrder: number
}

export type SocialLink = {
  id: number
  label: string
  url: string
  icon: string
  sortOrder: number
}

export type SiteContent = {
  brandName: string
  heroTitle: string
  heroSubtitle: string
  heroImageUrl: string
  primaryCtaLabel: string
  secondaryCtaLabel: string
  featuresTitle: string
  productsTitle: string
  productsSubtitle: string
  testimonialsTitle: string
  ctaTitle: string
  ctaSubtitle: string
  ctaButtonLabel: string
  contactTitle: string
  phone: string
  lineId: string
  email: string
  address: string
  footerDescription: string
}

export type PublicContent = {
  siteContent: SiteContent
  stats: SiteStat[]
  features: Feature[]
  products: Product[]
  testimonials: Testimonial[]
  socialLinks: SocialLink[]
}

export type AuthUser = {
  id: number
  username: string
  displayName: string
  role: 'admin'
  googleEmail: string | null
}

export type AuthSession = {
  token: string
  user: AuthUser
}
