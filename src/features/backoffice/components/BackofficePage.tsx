import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../../../shared/api/client'
import { useAuth } from '../../../shared/auth/AuthProvider'
import { SectionPanel } from '../../../shared/components/SectionPanel'
import type { Feature, Language, Product, PublicContent, SiteContent, SiteStat, SocialLink, Testimonial } from '../../../shared/types/content'
import { LanguageManager } from './LanguageManager'

const emptyProduct = (index: number): Product => ({
  id: Date.now() + index,
  name: '',
  sizeLabel: '',
  price: 0,
  originalPrice: 0,
  imageUrl: '/mortar.svg',
  description: '',
  inStock: true,
  sortOrder: index + 1,
})

const emptyFeature = (index: number): Feature => ({
  id: Date.now() + index,
  icon: '✨',
  title: '',
  description: '',
  sortOrder: index + 1,
})

const emptyTestimonial = (index: number): Testimonial => ({
  id: Date.now() + index,
  customerName: '',
  location: '',
  comment: '',
  rating: 5,
  sortOrder: index + 1,
})

const emptyStat = (index: number): SiteStat => ({
  id: Date.now() + index,
  value: '',
  label: '',
  sortOrder: index + 1,
})

const emptySocialLink = (index: number): SocialLink => ({
  id: Date.now() + index,
  label: '',
  url: '#',
  icon: '🔗',
  sortOrder: index + 1,
})

function moveItem<T extends { sortOrder: number }>(arr: T[], from: number, to: number): T[] {
  const next = [...arr]
  const [item] = next.splice(from, 1)
  next.splice(to, 0, item)
  return next.map((el, i) => ({ ...el, sortOrder: i + 1 }))
}

function updateItem<T>(arr: T[], index: number, patch: Partial<T>): T[] {
  return arr.map((item, i) => (i === index ? { ...item, ...patch } : item))
}

export function BackofficePage() {
  const navigate = useNavigate()
  const { token, user, logout } = useAuth()
  const [draft, setDraft] = useState<PublicContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [view, setView] = useState<'content' | 'languages'>('content')
  const [adminLanguages, setAdminLanguages] = useState<Language[]>([])
  const [editingLang, setEditingLang] = useState<string>('th')

  useEffect(() => {
    if (!token) return
    apiClient
      .getAdminLanguages(token)
      .then((langs) => {
        setAdminLanguages(langs)
        const def = langs.find((l) => l.isDefault) ?? langs[0]
        if (def) setEditingLang(def.code)
      })
      .catch(() => {
        // Keep default lang on error
      })
  }, [token])

  useEffect(() => {
    if (!token) return
    setLoading(true)
    apiClient
      .getAdminContent(token, editingLang)
      .then(setDraft)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [token, editingLang])

  useEffect(() => {
    if (!successMessage) return
    if (successTimer.current) clearTimeout(successTimer.current)
    successTimer.current = setTimeout(() => setSuccessMessage(null), 3000)
    return () => {
      if (successTimer.current) clearTimeout(successTimer.current)
    }
  }, [successMessage])

  if (!token) {
    navigate('/admin/login', { replace: true })
    return null
  }

  if (loading || !draft) {
    return <div className="status-page">กำลังโหลดข้อมูล backoffice...</div>
  }

  const updateContent = (patch: Partial<SiteContent>) => {
    setDraft({ ...draft, siteContent: { ...draft.siteContent, ...patch } })
  }

  const updateCollection = <K extends keyof PublicContent>(key: K, items: PublicContent[K]) => {
    setDraft({ ...draft, [key]: items })
  }

  const save = async () => {
    setSaving(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const updated = await apiClient.saveAdminContent(token, draft, editingLang)
      setDraft(updated)
      setSuccessMessage('บันทึกข้อมูลเรียบร้อยแล้ว')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="backoffice-layout">
      <aside className="backoffice-sidebar">
        <p className="eyebrow">CMS Backoffice</p>
        <h1>{draft.siteContent.brandName}</h1>
        <p>แก้ไขข้อมูลทุกส่วนของหน้า storefront จากฐานข้อมูลเดียวกัน</p>
        <div className="sidebar-meta">
          <span>{user?.displayName}</span>
          <span>{user?.username}</span>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/')} type="button">
          เปิดหน้าเว็บไซต์
        </button>
        <div className="sidebar-section">
          <button
            className={`btn ${view === 'content' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setView('content')}
            type="button"
          >
            จัดการเนื้อหา
          </button>
          <button
            className={`btn ${view === 'languages' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setView('languages')}
            type="button"
          >
            จัดการภาษา
          </button>
        </div>
        <button className="btn btn-ghost" onClick={logout} type="button">
          ออกจากระบบ
        </button>
      </aside>

      <main className="backoffice-main">
        {view === 'content' && adminLanguages.length > 1 && (
          <div className="lang-tabs">
            {adminLanguages.map((lang) => (
              <button
                key={lang.code}
                className={`lang-tab${editingLang === lang.code ? ' lang-tab-active' : ''}`}
                onClick={() => setEditingLang(lang.code)}
                type="button"
              >
                {lang.name}
                {lang.isDefault && <span className="lang-default-badge"> (default)</span>}
              </button>
            ))}
          </div>
        )}

        {view === 'languages' ? (
          <LanguageManager token={token} />
        ) : (
          <>
        <div className="backoffice-toolbar">
          <div>
            <h2>จัดการข้อมูลหน้าเว็บ</h2>
            <p>ข้อมูลที่บันทึกจะอัปเดตในหน้า storefront ทันทีหลังรีโหลด</p>
          </div>
          <button className="btn btn-primary" disabled={saving} onClick={save} type="button">
            {saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
          </button>
        </div>

        {error && <div className="banner banner-error">{error}</div>}
        {successMessage && <div className="banner banner-success">{successMessage}</div>}

        <SectionPanel title="Brand & Hero">
          <div className="form-grid two-columns">
            <label>Brand Name<input value={draft.siteContent.brandName} onChange={(e) => updateContent({ brandName: e.target.value })} /></label>
            <label>Hero Image URL<input value={draft.siteContent.heroImageUrl} onChange={(e) => updateContent({ heroImageUrl: e.target.value })} /></label>
            <label>Primary CTA<input value={draft.siteContent.primaryCtaLabel} onChange={(e) => updateContent({ primaryCtaLabel: e.target.value })} /></label>
            <label>Secondary CTA<input value={draft.siteContent.secondaryCtaLabel} onChange={(e) => updateContent({ secondaryCtaLabel: e.target.value })} /></label>
            <label className="span-2">Hero Title<textarea rows={3} value={draft.siteContent.heroTitle} onChange={(e) => updateContent({ heroTitle: e.target.value })} /></label>
            <label className="span-2">Hero Subtitle<textarea rows={3} value={draft.siteContent.heroSubtitle} onChange={(e) => updateContent({ heroSubtitle: e.target.value })} /></label>
          </div>
        </SectionPanel>

        <SectionPanel title="Section Titles & Contact">
          <div className="form-grid two-columns">
            <label>Features Title<input value={draft.siteContent.featuresTitle} onChange={(e) => updateContent({ featuresTitle: e.target.value })} /></label>
            <label>Products Title<input value={draft.siteContent.productsTitle} onChange={(e) => updateContent({ productsTitle: e.target.value })} /></label>
            <label>Products Subtitle<input value={draft.siteContent.productsSubtitle} onChange={(e) => updateContent({ productsSubtitle: e.target.value })} /></label>
            <label>Testimonials Title<input value={draft.siteContent.testimonialsTitle} onChange={(e) => updateContent({ testimonialsTitle: e.target.value })} /></label>
            <label>CTA Title<input value={draft.siteContent.ctaTitle} onChange={(e) => updateContent({ ctaTitle: e.target.value })} /></label>
            <label>CTA Subtitle<input value={draft.siteContent.ctaSubtitle} onChange={(e) => updateContent({ ctaSubtitle: e.target.value })} /></label>
            <label>CTA Button<input value={draft.siteContent.ctaButtonLabel} onChange={(e) => updateContent({ ctaButtonLabel: e.target.value })} /></label>
            <label>Contact Title<input value={draft.siteContent.contactTitle} onChange={(e) => updateContent({ contactTitle: e.target.value })} /></label>
            <label>Phone<input value={draft.siteContent.phone} onChange={(e) => updateContent({ phone: e.target.value })} /></label>
            <label>Line ID<input value={draft.siteContent.lineId} onChange={(e) => updateContent({ lineId: e.target.value })} /></label>
            <label>Email<input value={draft.siteContent.email} onChange={(e) => updateContent({ email: e.target.value })} /></label>
            <label>Address<input value={draft.siteContent.address} onChange={(e) => updateContent({ address: e.target.value })} /></label>
            <label className="span-2">Footer Description<textarea rows={3} value={draft.siteContent.footerDescription} onChange={(e) => updateContent({ footerDescription: e.target.value })} /></label>
          </div>
        </SectionPanel>

        <SectionPanel title="Hero Stats">
          <CollectionToolbar count={draft.stats.length} onAdd={() => updateCollection('stats', [...draft.stats, emptyStat(draft.stats.length)])} />
          <div className="editor-list">
            {draft.stats.map((item, index) => (
              <div className="editor-card" key={item.id}>
                <CardHeader
                  index={index}
                  total={draft.stats.length}
                  onMoveUp={() => updateCollection('stats', moveItem(draft.stats, index, index - 1))}
                  onMoveDown={() => updateCollection('stats', moveItem(draft.stats, index, index + 1))}
                  onDelete={() => updateCollection('stats', draft.stats.filter((_, i) => i !== index))}
                />
                <label>Value<input value={item.value} onChange={(e) => updateCollection('stats', updateItem(draft.stats, index, { value: e.target.value }))} /></label>
                <label>Label<input value={item.label} onChange={(e) => updateCollection('stats', updateItem(draft.stats, index, { label: e.target.value }))} /></label>
              </div>
            ))}
          </div>
        </SectionPanel>

        <SectionPanel title="Features">
          <CollectionToolbar count={draft.features.length} onAdd={() => updateCollection('features', [...draft.features, emptyFeature(draft.features.length)])} />
          <div className="editor-list">
            {draft.features.map((item, index) => (
              <div className="editor-card" key={item.id}>
                <CardHeader
                  index={index}
                  total={draft.features.length}
                  onMoveUp={() => updateCollection('features', moveItem(draft.features, index, index - 1))}
                  onMoveDown={() => updateCollection('features', moveItem(draft.features, index, index + 1))}
                  onDelete={() => updateCollection('features', draft.features.filter((_, i) => i !== index))}
                />
                <label>Icon<input value={item.icon} onChange={(e) => updateCollection('features', updateItem(draft.features, index, { icon: e.target.value }))} /></label>
                <label>Title<input value={item.title} onChange={(e) => updateCollection('features', updateItem(draft.features, index, { title: e.target.value }))} /></label>
                <label className="span-2">Description<textarea rows={3} value={item.description} onChange={(e) => updateCollection('features', updateItem(draft.features, index, { description: e.target.value }))} /></label>
              </div>
            ))}
          </div>
        </SectionPanel>

        <SectionPanel title="Products">
          <CollectionToolbar count={draft.products.length} onAdd={() => updateCollection('products', [...draft.products, emptyProduct(draft.products.length)])} />
          <div className="editor-list">
            {draft.products.map((item, index) => (
              <div className="editor-card product-editor" key={item.id}>
                <CardHeader
                  index={index}
                  total={draft.products.length}
                  onMoveUp={() => updateCollection('products', moveItem(draft.products, index, index - 1))}
                  onMoveDown={() => updateCollection('products', moveItem(draft.products, index, index + 1))}
                  onDelete={() => updateCollection('products', draft.products.filter((_, i) => i !== index))}
                />
                <label>Name<input value={item.name} onChange={(e) => updateCollection('products', updateItem(draft.products, index, { name: e.target.value }))} /></label>
                <label>Size<input value={item.sizeLabel} onChange={(e) => updateCollection('products', updateItem(draft.products, index, { sizeLabel: e.target.value }))} /></label>
                <label>Price<input type="number" value={item.price} onChange={(e) => updateCollection('products', updateItem(draft.products, index, { price: Number(e.target.value) }))} /></label>
                <label>Original Price<input type="number" value={item.originalPrice} onChange={(e) => updateCollection('products', updateItem(draft.products, index, { originalPrice: Number(e.target.value) }))} /></label>
                <label className="span-2">Image URL<input value={item.imageUrl} onChange={(e) => updateCollection('products', updateItem(draft.products, index, { imageUrl: e.target.value }))} /></label>
                <label className="span-2">Description<textarea rows={3} value={item.description} onChange={(e) => updateCollection('products', updateItem(draft.products, index, { description: e.target.value }))} /></label>
                <label className="checkbox-row"><input type="checkbox" checked={item.inStock} onChange={(e) => updateCollection('products', updateItem(draft.products, index, { inStock: e.target.checked }))} />In stock</label>
              </div>
            ))}
          </div>
        </SectionPanel>

        <SectionPanel title="Testimonials">
          <CollectionToolbar count={draft.testimonials.length} onAdd={() => updateCollection('testimonials', [...draft.testimonials, emptyTestimonial(draft.testimonials.length)])} />
          <div className="editor-list">
            {draft.testimonials.map((item, index) => (
              <div className="editor-card" key={item.id}>
                <CardHeader
                  index={index}
                  total={draft.testimonials.length}
                  onMoveUp={() => updateCollection('testimonials', moveItem(draft.testimonials, index, index - 1))}
                  onMoveDown={() => updateCollection('testimonials', moveItem(draft.testimonials, index, index + 1))}
                  onDelete={() => updateCollection('testimonials', draft.testimonials.filter((_, i) => i !== index))}
                />
                <label>Name<input value={item.customerName} onChange={(e) => updateCollection('testimonials', updateItem(draft.testimonials, index, { customerName: e.target.value }))} /></label>
                <label>Location<input value={item.location} onChange={(e) => updateCollection('testimonials', updateItem(draft.testimonials, index, { location: e.target.value }))} /></label>
                <label>Rating (1–5)<input type="number" min={1} max={5} value={item.rating} onChange={(e) => updateCollection('testimonials', updateItem(draft.testimonials, index, { rating: Number(e.target.value) }))} /></label>
                <label className="span-2">Comment<textarea rows={3} value={item.comment} onChange={(e) => updateCollection('testimonials', updateItem(draft.testimonials, index, { comment: e.target.value }))} /></label>
              </div>
            ))}
          </div>
        </SectionPanel>

        <SectionPanel title="Social Links">
          <CollectionToolbar count={draft.socialLinks.length} onAdd={() => updateCollection('socialLinks', [...draft.socialLinks, emptySocialLink(draft.socialLinks.length)])} />
          <div className="editor-list">
            {draft.socialLinks.map((item, index) => (
              <div className="editor-card" key={item.id}>
                <CardHeader
                  index={index}
                  total={draft.socialLinks.length}
                  onMoveUp={() => updateCollection('socialLinks', moveItem(draft.socialLinks, index, index - 1))}
                  onMoveDown={() => updateCollection('socialLinks', moveItem(draft.socialLinks, index, index + 1))}
                  onDelete={() => updateCollection('socialLinks', draft.socialLinks.filter((_, i) => i !== index))}
                />
                <label>Label<input value={item.label} onChange={(e) => updateCollection('socialLinks', updateItem(draft.socialLinks, index, { label: e.target.value }))} /></label>
                <label>Icon<input value={item.icon} onChange={(e) => updateCollection('socialLinks', updateItem(draft.socialLinks, index, { icon: e.target.value }))} /></label>
                <label className="span-2">URL<input value={item.url} onChange={(e) => updateCollection('socialLinks', updateItem(draft.socialLinks, index, { url: e.target.value }))} /></label>
              </div>
            ))}
          </div>
        </SectionPanel>
          </>
        )}
      </main>
    </div>
  )
}

function CollectionToolbar({ count, onAdd }: { count: number; onAdd: () => void }) {
  return (
    <div className="collection-toolbar">
      <span className="collection-count">{count} รายการ</span>
      <button className="btn btn-secondary" onClick={onAdd} type="button">
        + เพิ่มรายการ
      </button>
    </div>
  )
}

function CardHeader({
  index,
  total,
  onMoveUp,
  onMoveDown,
  onDelete,
}: {
  index: number
  total: number
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
}) {
  return (
    <div className="editor-card-header span-2">
      <span className="editor-card-index">#{index + 1}</span>
      <div className="editor-card-actions">
        <button className="btn-icon" disabled={index === 0} onClick={onMoveUp} title="เลื่อนขึ้น" type="button">↑</button>
        <button className="btn-icon" disabled={index === total - 1} onClick={onMoveDown} title="เลื่อนลง" type="button">↓</button>
        <button className="btn-icon btn-icon-danger" onClick={onDelete} title="ลบรายการนี้" type="button">ลบ</button>
      </div>
    </div>
  )
}
