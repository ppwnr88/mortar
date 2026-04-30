import { createContext } from 'react'

export type LanguageContextValue = {
  languages: import('../types/content').Language[]
  currentLang: string
  setLanguage: (code: string) => void
  loading: boolean
}

export const LanguageContext = createContext<LanguageContextValue>({
  languages: [],
  currentLang: 'th',
  setLanguage: () => {},
  loading: true,
})
