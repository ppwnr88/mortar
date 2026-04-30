import type { AuthSession } from '../types/content'

const TOKEN_KEY = 'mortar-admin-session'

export const authStorage = {
  read(): AuthSession | null {
    const raw = localStorage.getItem(TOKEN_KEY)
    if (!raw) {
      return null
    }

    try {
      return JSON.parse(raw) as AuthSession
    } catch {
      localStorage.removeItem(TOKEN_KEY)
      return null
    }
  },
  write(session: AuthSession) {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(session))
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY)
  },
}