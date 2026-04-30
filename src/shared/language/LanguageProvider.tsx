import { useCallback, useEffect, useState } from 'react'
import { apiClient } from '../api/client'
import type { Language } from '../types/content'
import { LanguageContext } from './LanguageContext'

const STORAGE_KEY = 'preferred_language'

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [languages, setLanguages] = useState<Language[]>([])
  const [currentLang, setCurrentLang] = useState<string>(() => localStorage.getItem(STORAGE_KEY) ?? 'th')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient
      .getPublicLanguages()
      .then((langs) => {
        setLanguages(langs)
        // If stored language is no longer active, fall back to default
        const stored = localStorage.getItem(STORAGE_KEY)
        const isValid = stored && langs.some((l) => l.code === stored && l.isActive)
        if (!isValid) {
          const def = langs.find((l) => l.isDefault) ?? langs[0]
          if (def) {
            setCurrentLang(def.code)
            localStorage.setItem(STORAGE_KEY, def.code)
          }
        }
      })
      .catch(() => {
        // Keep default on error
      })
      .finally(() => setLoading(false))
  }, [])

  const setLanguage = useCallback((code: string) => {
    setCurrentLang(code)
    localStorage.setItem(STORAGE_KEY, code)
  }, [])

  return <LanguageContext.Provider value={{ languages, currentLang, setLanguage, loading }}>{children}</LanguageContext.Provider>
}
