export const tr = {
  common: {
    signIn: 'Giris Yap',
    signUp: 'Kayit Ol',
    signOut: 'Cikis Yap',
    email: 'E-posta',
    password: 'Sifre',
    confirmPassword: 'Sifre Tekrar',
    fullName: 'Ad Soyad',
    submit: 'Gonder',
    cancel: 'Iptal',
    loading: 'Yukleniyor...',
    error: 'Hata',
    success: 'Basarili',
  },
  auth: {
    signInTitle: 'Giris Yap',
    signUpTitle: 'Kayit Ol',
    signInDescription: 'Caster Studio\'ya erisim icin bilgilerinizi girin.',
    signUpDescription: 'Baslamak icin bir hesap olusturun.',
    noAccount: 'Hesabiniz yok mu?',
    noAccountAction: 'Kayit olun',
    hasAccount: 'Zaten hesabiniz var mi?',
    hasAccountAction: 'Giris yapin',
    checkEmail: 'Hesabinizi onaylamak icin e-postanizi kontrol edin',
    invalidCredentials: 'Gecersiz e-posta veya sifre',
    passwordMismatch: 'Sifreler eslesmiyor',
    pleaseWait: 'Lutfen bekleyin...',
  },
  app: {
    title: 'Caster Studio',
    welcome: 'Caster Studio\'ya hosgeldiniz. Calisma alani Faz 2\'de gelecek.',
  },
} as const

// Recursive type that preserves structure but allows any string values
type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]>
}

export type TranslationKeys = DeepStringify<typeof tr>
