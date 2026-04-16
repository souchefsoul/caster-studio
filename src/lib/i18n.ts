import { create } from 'zustand'
import { tr } from './translations/tr'
import { en } from './translations/en'
import type { TranslationKeys } from './translations/tr'

type Locale = 'tr' | 'en'

interface LocaleState {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const STORAGE_KEY = 'stivra-locale'

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'tr'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'tr' || stored === 'en') return stored
  return 'tr'
}

export const useLocale = create<LocaleState>((set) => ({
  locale: getInitialLocale(),
  setLocale: (locale: Locale) => {
    localStorage.setItem(STORAGE_KEY, locale)
    set({ locale })
  },
}))

const translations: Record<Locale, TranslationKeys> = { tr, en }

export function t(path: string): string {
  const locale = useLocale.getState().locale
  const keys = path.split('.')
  let result: unknown = translations[locale]
  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = (result as Record<string, unknown>)[key]
    } else {
      return path // fallback: return the key path
    }
  }
  return typeof result === 'string' ? result : path
}
