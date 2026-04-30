import { frontendEnv } from '../config/env'
import type { AuthSession, AuthUser, Language, PublicContent } from '../types/content'

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  token?: string
  body?: unknown
}

async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(`${frontendEnv.apiBaseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as { message?: string } | null
    throw new Error(errorPayload?.message ?? 'Request failed')
  }

  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export const apiClient = {
  // Content
  getPublicContent: (lang?: string) =>
    apiRequest<PublicContent>(`/public/content${lang ? `?lang=${encodeURIComponent(lang)}` : ''}`),
  getAdminContent: (token: string, lang?: string) =>
    apiRequest<PublicContent>(`/admin/content${lang ? `?lang=${encodeURIComponent(lang)}` : ''}`, { token }),
  saveAdminContent: (token: string, payload: PublicContent, lang: string) =>
    apiRequest<PublicContent>(`/admin/content?lang=${encodeURIComponent(lang)}`, { method: 'PUT', token, body: payload }),

  // Languages
  getPublicLanguages: () => apiRequest<Language[]>('/public/languages'),
  getAdminLanguages: (token: string) => apiRequest<Language[]>('/admin/languages', { token }),
  createLanguage: (token: string, code: string, name: string, copyFrom?: string) =>
    apiRequest<Language>('/admin/languages', { method: 'POST', token, body: { code, name, copyFrom } }),
  updateLanguage: (token: string, code: string, patch: Partial<{ name: string; isActive: boolean; isDefault: boolean; sortOrder: number }>) =>
    apiRequest<Language>(`/admin/languages/${encodeURIComponent(code)}`, { method: 'PUT', token, body: patch }),
  deleteLanguage: (token: string, code: string) =>
    apiRequest<void>(`/admin/languages/${encodeURIComponent(code)}`, { method: 'DELETE', token }),

  // Auth
  login: (username: string, password: string) =>
    apiRequest<AuthSession>('/auth/login', {
      method: 'POST',
      body: { username, password },
    }),
  loginWithGoogle: (credential: string) =>
    apiRequest<AuthSession>('/auth/google', {
      method: 'POST',
      body: { credential },
    }),
  me: (token: string) => apiRequest<{ user: AuthUser }>('/auth/me', { token }),
}
