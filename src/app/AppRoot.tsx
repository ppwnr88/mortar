import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { LoginPage } from '../features/auth/components/LoginPage'
import { BackofficePage } from '../features/backoffice/components/BackofficePage'
import { StorefrontPage } from '../features/storefront/components/StorefrontPage'
import { AuthProvider, useAuth } from '../shared/auth/AuthProvider'
import { LanguageProvider } from '../shared/language/LanguageProvider'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { loading, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="status-page">กำลังตรวจสอบสิทธิ์...</div>
  }

  if (!user) {
    return <Navigate to="/backoffice/login" replace state={{ from: location }} />
  }

  return <>{children}</>
}

export function AppRoot() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<StorefrontPage />} />
            <Route path="/backoffice/login" element={<LoginPage />} />
            <Route
              path="/backoffice"
              element={
                <ProtectedRoute>
                  <BackofficePage />
                </ProtectedRoute>
              }
            />
            <Route path="/admin/login" element={<Navigate to="/backoffice/login" replace />} />
            <Route path="/admin" element={<Navigate to="/backoffice" replace />} />
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  )
}
