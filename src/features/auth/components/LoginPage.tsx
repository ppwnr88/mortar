import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../shared/auth/AuthProvider'
import { frontendEnv } from '../../../shared/config/env'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loginWithGoogle, user } = useAuth()
  const googleButtonRef = useRef<HTMLDivElement | null>(null)
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (user) {
      navigate('/admin', { replace: true })
    }
  }, [navigate, user])

  useEffect(() => {
    if (!frontendEnv.googleClientId || !googleButtonRef.current) {
      return
    }

    const existingScript = document.querySelector<HTMLScriptElement>('script[data-google-identity="true"]')
    const initialize = () => {
      if (!window.google?.accounts.id || !googleButtonRef.current) {
        return
      }

      googleButtonRef.current.innerHTML = ''
      window.google.accounts.id.initialize({
        client_id: frontendEnv.googleClientId,
        callback: async (response) => {
          try {
            setPending(true)
            setError(null)
            await loginWithGoogle(response.credential)
            navigate('/admin', { replace: true })
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Google login failed')
          } finally {
            setPending(false)
          }
        },
      })

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'pill',
      })
    }

    if (existingScript) {
      initialize()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.dataset.googleIdentity = 'true'
    script.onload = initialize
    document.head.appendChild(script)
  }, [loginWithGoogle, navigate])

  const redirectTarget = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/admin'

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setPending(true)
    setError(null)

    try {
      await login(username, password)
      navigate(redirectTarget, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div>
          <p className="eyebrow">Backoffice</p>
          <h1>เข้าสู่ระบบจัดการข้อมูล</h1>
          <p className="auth-copy">ล็อกอินเพื่อแก้ไขข้อมูลทุก section ที่แสดงบนหน้าเว็บหลักจากแหล่งข้อมูลเดียวกัน</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Username
            <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="admin" />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="รหัสผ่านผู้ดูแล"
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="btn btn-primary" disabled={pending} type="submit">
            {pending ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
        <div className="auth-divider">หรือ</div>
        {frontendEnv.googleClientId ? (
          <div className="google-button-slot" ref={googleButtonRef} />
        ) : (
          <div className="env-note">
            เปิดใช้งาน Google Login โดยกำหนด GOOGLE_CLIENT_ID และ VITE_GOOGLE_CLIENT_ID ใน env
          </div>
        )}
        <Link className="back-link" to="/">
          กลับไปหน้าเว็บไซต์
        </Link>
      </div>
    </div>
  )
}