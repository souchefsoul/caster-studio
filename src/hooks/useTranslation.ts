import { useLocale, t } from '@/lib/i18n'

export function useTranslation() {
  const { locale, setLocale } = useLocale()
  return { locale, setLocale, t }
}
