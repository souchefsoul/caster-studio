import { useTranslation } from '@/hooks/useTranslation'
import { Button } from '@/components/ui/button'

export function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation()

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLocale(locale === 'tr' ? 'en' : 'tr')}
      className="min-h-10"
    >
      {locale === 'tr' ? 'EN' : 'TR'}
    </Button>
  )
}
