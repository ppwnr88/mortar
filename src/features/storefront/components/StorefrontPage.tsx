import { useEffect, useState } from 'react'
import { apiClient } from '../../../shared/api/client'
import { useLanguage } from '../../../shared/language/useLanguage'
import type { PublicContent } from '../../../shared/types/content'

const fallbackMortarImage = '/mortar.svg'

function useFallbackImage(event: React.SyntheticEvent<HTMLImageElement>) {
  const image = event.currentTarget
  if (image.src.endsWith(fallbackMortarImage)) {
    return
  }

  image.src = fallbackMortarImage
}

export function StorefrontPage() {
  const { languages, currentLang, setLanguage } = useLanguage()
  const [content, setContent] = useState<PublicContent | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    apiClient
      .getPublicContent(currentLang)
      .then(setContent)
      .catch((err: Error) => setError(err.message))
  }, [currentLang])

  useEffect(() => {
    if (!content || !window.location.hash) {
      return
    }

    requestAnimationFrame(() => {
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView()
    })
  }, [content])

  if (error) {
    return <div className="status-page">ไม่สามารถโหลดข้อมูลหน้าเว็บไซต์ได้: {error}</div>
  }

  if (!content) {
    return <div className="status-page">กำลังโหลดข้อมูลหน้าเว็บไซต์...</div>
  }

  const { siteContent, stats, features, products, testimonials, socialLinks } = content

  return (
    <div className="app-shell">
      <header className="header">
        <div className="container header-inner">
          <div className="logo-block">
            <span className="logo-kicker">Stone Kitchenware</span>
            <span className="logo-text">{siteContent.brandName}</span>
          </div>
          <nav className="nav">
            <a href="#story">เรื่องราว</a>
            <a href="#products">สินค้า</a>
            <a href="#features">จุดเด่น</a>
            <a href="#testimonials">รีวิว</a>
            <a href="#contact">ติดต่อ</a>
            {languages.length > 1 && (
              <div className="lang-switcher">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    className={`lang-btn${currentLang === lang.code ? ' lang-btn-active' : ''}`}
                    onClick={() => setLanguage(lang.code)}
                    type="button"
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </nav>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-pattern" aria-hidden="true" />
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">Lampang stone craft</p>
              <h1>{siteContent.heroTitle}</h1>
              <p className="hero-subtitle">{siteContent.heroSubtitle.replaceAll('\n', ' ')}</p>
              <div className="hero-actions">
                <a className="btn btn-primary" href="#products">
                  {siteContent.primaryCtaLabel}
                </a>
                <a className="btn btn-secondary" href="#contact">
                  {siteContent.secondaryCtaLabel}
                </a>
              </div>
              <div className="hero-stats">
                {stats.map((stat) => (
                  <div key={stat.id} className="stat-card">
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-frame">
                <img src={siteContent.heroImageUrl} alt={siteContent.brandName} onError={useFallbackImage} />
                <span className="hero-seal">Lampang Craft</span>
              </div>
            </div>
          </div>
        </section>

        <section id="story" className="story-section">
          <div className="container story-grid">
            <div className="story-copy">
              <p className="eyebrow">From local hands to Thai kitchens</p>
              <h2>ครกหินที่ไม่ได้มีดีแค่ความแข็ง แต่มีเรื่องราวของช่างและครัวไทยอยู่ในทุกใบ</h2>
              <p>
                เราอยากให้หน้านี้รู้สึกเหมือนได้แวะดูงานคราฟต์ท้องถิ่นจริงๆ เห็นผิวหิน น้ำหนัก
                และความตั้งใจของช่าง ก่อนเลือกขนาดที่เหมาะกับบ้าน ร้านอาหาร หรือเป็นของฝากจากลำปาง.
              </p>
            </div>
            <div className="story-notes">
              <div>
                <strong>หินแท้</strong>
                <span>คัดผิวและน้ำหนักให้เหมาะกับการตำจริง</span>
              </div>
              <div>
                <strong>งานช่าง</strong>
                <span>ขัดแต่งทีละใบ เน้นทรงถนัดมือและใช้งานได้นาน</span>
              </div>
              <div>
                <strong>ใช้จริง</strong>
                <span>เหมาะกับน้ำพริก เครื่องแกง และครัวไทยทุกวัน</span>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="content-section warm-section">
          <div className="container">
            <h2 className="section-title">{siteContent.featuresTitle}</h2>
            <div className="feature-grid">
              {features.map((feature) => (
                <article key={feature.id} className="feature-card">
                  <span className="feature-icon">{feature.icon}</span>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="products" className="content-section">
          <div className="container">
            <div className="section-heading-row">
              <div>
                <p className="eyebrow">Stone gallery</p>
                <h2 className="section-title left">{siteContent.productsTitle}</h2>
              </div>
              <p className="section-subtitle align-right">{siteContent.productsSubtitle}</p>
            </div>
            <div className="product-grid">
              {products.map((product, index) => {
                const discount = Math.round((1 - product.price / product.originalPrice) * 100)
                const productFit = ['ครัวบ้านและของฝาก', 'ครอบครัวที่ทำอาหารบ่อย', 'ร้านอาหารและงานหนัก'][index % 3]

                return (
                  <article key={product.id} className="product-card">
                    {!product.inStock && <span className="pill">สินค้าหมด</span>}
                    <div className="product-image">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        onLoad={(event) => {
                          event.currentTarget.dataset.loaded = 'true'
                        }}
                        onError={useFallbackImage}
                      />
                      <span className="product-stone-mark">ครกหินไทย</span>
                    </div>
                    <div className="product-body">
                      <div className="product-header">
                        <h3>{product.name}</h3>
                        <span>{product.sizeLabel}</span>
                      </div>
                      <p>{product.description}</p>
                      <div className="product-meta">
                        <span>เหมาะสำหรับ</span>
                        <strong>{productFit}</strong>
                      </div>
                      <div className="price-row">
                        <strong>฿{product.price.toLocaleString()}</strong>
                        <span>฿{product.originalPrice.toLocaleString()}</span>
                        <em>-{discount}%</em>
                      </div>
                      <button className="btn btn-primary" disabled={!product.inStock}>
                        {product.inStock ? 'สอบถามเพื่อสั่งซื้อ' : 'สินค้าหมด'}
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section id="testimonials" className="content-section clay-section">
          <div className="container">
            <h2 className="section-title">{siteContent.testimonialsTitle}</h2>
            <div className="testimonial-grid">
              {testimonials.map((testimonial) => (
                <article key={testimonial.id} className="testimonial-card">
                  <span className="testimonial-rating">{'★'.repeat(testimonial.rating)}</span>
                  <p>“{testimonial.comment}”</p>
                  <strong>{testimonial.customerName}</strong>
                  <span>{testimonial.location}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="cta-band">
          <div className="container cta-band-inner">
            <div>
              <h2>{siteContent.ctaTitle}</h2>
              <p>{siteContent.ctaSubtitle}</p>
            </div>
            <a className="btn btn-primary" href="#contact">
              {siteContent.ctaButtonLabel}
            </a>
          </div>
        </section>

        <section id="contact" className="content-section contact-section">
          <div className="container contact-grid">
            <div>
              <h2 className="section-title left">{siteContent.contactTitle}</h2>
              <div className="contact-stack">
                <div className="contact-card"><strong>โทรศัพท์</strong><span>{siteContent.phone}</span></div>
                <div className="contact-card"><strong>Line Official</strong><span>{siteContent.lineId}</span></div>
                <div className="contact-card"><strong>อีเมล</strong><span>{siteContent.email}</span></div>
                <div className="contact-card"><strong>ที่อยู่</strong><span>{siteContent.address}</span></div>
              </div>
            </div>
            <div className="contact-panel">
              <p className="contact-panel-kicker">Visit Lampang craft</p>
              <h3>งานครกหินจากช่างท้องถิ่น ส่งตรงถึงบ้านคุณ</h3>
              <p>พูดคุยขนาดที่เหมาะกับครัว ร้านอาหาร หรือของฝากสำหรับคนรักงานฝีมือไทย เราช่วยแนะนำจากการใช้งานจริงได้ครบ.</p>
              <a className="btn btn-secondary" href={`tel:${siteContent.phone}`}>
                โทรสอบถาม
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <div className="logo-block compact">
              <span className="logo-text">{siteContent.brandName}</span>
            </div>
            <p>{siteContent.footerDescription}</p>
          </div>
          <div className="footer-links">
            {socialLinks.map((link) => (
              <a key={link.id} href={link.url} target="_blank" rel="noreferrer">
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
