import './App.css'

function App() {
  const products = [
    {
      id: 1,
      name: 'ครกหินแกรนิต ขนาดเล็ก',
      size: '5 นิ้ว',
      price: 450,
      originalPrice: 590,
      image: 'https://img5.pic.in.th/file/secure-sv1/image_mortar.md.png',
      description: 'ครกหินแกรนิตแท้ เนื้อละเอียด ทนทาน เหมาะสำหรับบ้านเรือน',
      inStock: true
    },
    {
      id: 2,
      name: 'ครกหินแกรนิต ขนาดกลาง',
      size: '7 นิ้ว',
      price: 690,
      originalPrice: 850,
      image: 'https://img5.pic.in.th/file/secure-sv1/image_mortar.md.png',
      description: 'ครกหินแกรนิตคุณภาพสูง ขนาดพอดี ใช้งานได้หลากหลาย',
      inStock: true
    },
    {
      id: 3,
      name: 'ครกหินแกรนิต ขนาดใหญ่',
      size: '9 นิ้ว',
      price: 990,
      originalPrice: 1200,
      image: 'https://img5.pic.in.th/file/secure-sv1/image_mortar.md.png',
      description: 'ครกหินแกรนิตขนาดใหญ่ เหมาะสำหรับร้านอาหารหรือครอบครัวใหญ่',
      inStock: true
    },
    {
      id: 4,
      name: 'ครกหินอ่างศิลา พรีเมียม',
      size: '8 นิ้ว',
      price: 1490,
      originalPrice: 1800,
      image: 'https://img5.pic.in.th/file/secure-sv1/image_mortar.md.png',
      description: 'ครกหินอ่างศิลาแท้ 100% งานฝีมือช่างชำนาญ ของดีเมืองชล',
      inStock: false
    }
  ]

  const features = [
    {
      icon: '🏔️',
      title: 'หินแกรนิตแท้',
      description: 'คัดสรรหินคุณภาพดีจากแหล่งธรรมชาติ'
    },
    {
      icon: '🔨',
      title: 'ฝีมือช่างชำนาญ',
      description: 'ผลิตโดยช่างฝีมือที่มีประสบการณ์กว่า 30 ปี'
    },
    {
      icon: '✨',
      title: 'ทนทานใช้ได้นาน',
      description: 'รับประกันคุณภาพ ใช้งานได้ตลอดชีพ'
    },
    {
      icon: '🚚',
      title: 'จัดส่งทั่วไทย',
      description: 'บริการส่งฟรีทั่วประเทศ เมื่อซื้อครบ 1,000 บาท'
    }
  ]

  const testimonials = [
    {
      name: 'คุณสมศรี',
      location: 'กรุงเทพฯ',
      comment: 'ครกสวยมากค่ะ คุณภาพดีเกินราคา ใช้ตำน้ำพริกอร่อยมาก',
      rating: 5
    },
    {
      name: 'คุณประยุทธ์',
      location: 'เชียงใหม่',
      comment: 'สั่งซื้อมาหลายใบแล้ว ของดีจริงๆ แนะนำเลยครับ',
      rating: 5
    },
    {
      name: 'คุณมาลี',
      location: 'ขอนแก่น',
      comment: 'ส่งเร็วมาก แพ็คอย่างดี ครกสวยถูกใจมากค่ะ',
      rating: 5
    }
  ]

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="logo">
            {/* <span className="logo-icon">⚱️</span> */}
            <span className="logo-text">ครกหินไทย</span>
          </div>
          <nav className="nav">
            <a href="#products">สินค้า</a>
            <a href="#features">ทำไมต้องเรา</a>
            <a href="#testimonials">รีวิว</a>
            <a href="#contact">ติดต่อ</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>ครกหินแกรนิตแท้<br />งานฝีมือไทย</h1>
            <p>คัดสรรหินคุณภาพดี ผลิตด้วยฝีมือช่างชำนาญ<br />ทนทานใช้ได้ตลอดชีพ ส่งฟรีทั่วไทย</p>
            <div className="hero-buttons">
              <a href="#products" className="btn btn-primary">ดูสินค้าทั้งหมด</a>
              <a href="#contact" className="btn btn-secondary">สอบถามเพิ่มเติม</a>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">30+</span>
                <span className="stat-label">ปีประสบการณ์</span>
              </div>
              <div className="stat">
                <span className="stat-number">10,000+</span>
                <span className="stat-label">ลูกค้าพึงพอใจ</span>
              </div>
              <div className="stat">
                <span className="stat-number">100%</span>
                <span className="stat-label">หินแท้ธรรมชาติ</span>
              </div>
            </div>
          </div>
          <div className="hero-image">
            <img 
              src="https://img5.pic.in.th/file/secure-sv1/image_mortar.md.png" 
              alt="ครกหินแกรนิต"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <h2 className="section-title">ทำไมต้องเลือกเรา</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <span className="feature-icon">{feature.icon}</span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="products">
        <div className="container">
          <h2 className="section-title">สินค้าของเรา</h2>
          <p className="section-subtitle">ครกหินคุณภาพดี ราคาโรงงาน</p>
          <div className="products-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                {!product.inStock && <span className="out-of-stock-badge">สินค้าหมด</span>}
                <div className="product-image">
                  <img src={product.image} alt={product.name} />
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="product-size">ขนาด: {product.size}</p>
                  <p className="product-description">{product.description}</p>
                  <div className="product-price">
                    <span className="price">฿{product.price.toLocaleString()}</span>
                    <span className="original-price">฿{product.originalPrice.toLocaleString()}</span>
                    <span className="discount">
                      -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                    </span>
                  </div>
                  <button 
                    className={`btn btn-add-cart ${!product.inStock ? 'disabled' : ''}`}
                    disabled={!product.inStock}
                  >
                    {product.inStock ? '🛒 เพิ่มลงตะกร้า' : 'สินค้าหมด'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="testimonials">
        <div className="container">
          <h2 className="section-title">ลูกค้าพูดถึงเรา</h2>
          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-rating">
                  {'⭐'.repeat(testimonial.rating)}
                </div>
                <p className="testimonial-comment">"{testimonial.comment}"</p>
                <div className="testimonial-author">
                  <span className="author-name">{testimonial.name}</span>
                  <span className="author-location">{testimonial.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2>พร้อมสั่งซื้อครกหินคุณภาพดีแล้วหรือยัง?</h2>
          <p>โปรโมชั่นพิเศษ! ส่งฟรีทั่วไทยเมื่อสั่งซื้อครบ 1,000 บาท</p>
          <a href="#products" className="btn btn-primary btn-large">สั่งซื้อเลย</a>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <div className="container">
          <h2 className="section-title">ติดต่อเรา</h2>
          <div className="contact-grid">
            <div className="contact-info">
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <div>
                  <h4>โทรศัพท์</h4>
                  <p>081-784-1857</p>
                </div>
              </div>
              <div className="contact-item">
                <span className="contact-icon">💬</span>
                <div>
                  <h4>Line Official</h4>
                  <p>@pesilathong</p>
                </div>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📧</span>
                <div>
                  <h4>อีเมล</h4>
                  <p>pongpat.w@hotmail.com</p>
                </div>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <div>
                  <h4>ที่อยู่</h4>
                  <p>12 หมู่ 10 ต.พิชัย อ.เมือง จ.ลำปาง 52000</p>
                </div>
              </div>
            </div>
            <div className="contact-form">
              <form>
                <div className="form-group">
                  <label htmlFor="name">ชื่อ-นามสกุล</label>
                  <input type="text" id="name" placeholder="กรุณากรอกชื่อ-นามสกุล" />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">เบอร์โทรศัพท์</label>
                  <input type="tel" id="phone" placeholder="กรุณากรอกเบอร์โทรศัพท์" />
                </div>
                <div className="form-group">
                  <label htmlFor="message">ข้อความ</label>
                  <textarea id="message" rows={4} placeholder="กรุณากรอกข้อความ"></textarea>
                </div>
                <button type="submit" className="btn btn-primary btn-full">ส่งข้อความ</button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="logo">
                <span className="logo-icon">⚱️</span>
                <span className="logo-text">ครกหินไทย</span>
              </div>
              <p>ผู้ผลิตและจำหน่ายครกหินคุณภาพดี<br />ส่งตรงจากโรงงานถึงบ้านคุณ</p>
            </div>
            <div className="footer-links">
              <h4>ลิงก์ด่วน</h4>
              <a href="#products">สินค้า</a>
              <a href="#features">ทำไมต้องเรา</a>
              <a href="#testimonials">รีวิว</a>
              <a href="#contact">ติดต่อ</a>
            </div>
            <div className="footer-social">
              <h4>ติดตามเรา</h4>
              <div className="social-icons">
                <a href="#" className="social-icon">📘</a>
                <a href="#" className="social-icon">📸</a>
                <a href="#" className="social-icon">🎵</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 ครกหินไทย. สงวนลิขสิทธิ์.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
