import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn, signUp } from '@/lib/auth'
import { useTranslation } from '@/hooks/useTranslation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

type AuthMode = 'signin' | 'signup'

export function AuthPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setFullName('')
    setError('')
    setMessage('')
  }

  const toggleMode = () => {
    resetForm()
    setMode(mode === 'signin' ? 'signup' : 'signin')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (mode === 'signup' && password !== confirmPassword) {
      setError(t('auth.passwordMismatch'))
      return
    }

    setLoading(true)

    try {
      if (mode === 'signin') {
        await signIn(email, password)
        navigate('/')
      } else {
        await signUp(email, password, fullName || undefined)
        setMessage(t('auth.checkEmail'))
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('common.error')
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">
            {mode === 'signin' ? t('auth.signInTitle') : t('auth.signUpTitle')}
          </CardTitle>
          <CardDescription>
            {mode === 'signin'
              ? t('auth.signInDescription')
              : t('auth.signUpDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === 'signup' && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="fullName">{t('common.fullName')}</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">{t('common.email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">{t('common.password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {mode === 'signup' && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="confirmPassword">{t('common.confirmPassword')}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            {message && (
              <p className="text-sm text-green-600">{message}</p>
            )}

            <Button type="submit" disabled={loading} className="w-full">
              {loading
                ? t('auth.pleaseWait')
                : mode === 'signin'
                  ? t('common.signIn')
                  : t('common.signUp')}
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              {mode === 'signin' ? (
                <>
                  {t('auth.noAccount')}{' '}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="text-primary underline underline-offset-4 hover:text-primary/80"
                  >
                    {t('auth.noAccountAction')}
                  </button>
                </>
              ) : (
                <>
                  {t('auth.hasAccount')}{' '}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="text-primary underline underline-offset-4 hover:text-primary/80"
                  >
                    {t('auth.hasAccountAction')}
                  </button>
                </>
              )}
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
