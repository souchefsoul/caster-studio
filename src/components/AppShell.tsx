import { signOut } from '@/lib/auth'
import { useAuth } from '@/hooks/useAuth'
import { useTranslation } from '@/hooks/useTranslation'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export function AppShell() {
  const { user } = useAuth()
  const { t } = useTranslation()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">{t('app.title')}</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user?.email}</span>
          <LanguageSwitcher />
          <Button variant="outline" size="sm" onClick={handleSignOut} className="min-h-10">
            {t('common.signOut')}
          </Button>
        </div>
      </header>
      <main className="p-6">
        <p className="text-muted-foreground">{t('app.welcome')}</p>
      </main>
    </div>
  )
}
