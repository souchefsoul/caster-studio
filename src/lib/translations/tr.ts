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
  workspace: {
    sidebar: {
      navigation: 'Navigasyon',
      prompt: 'Prompt',
      controls: 'Kontroller',
      account: 'Hesap',
      generate: 'Olustur',
      onModel: 'Model Uzerinde',
      catalog: 'Katalog',
      colorway: 'Renk Varyasyonu',
      designCopy: 'Tasarim Kopyalama',
      textToImage: 'Metin > Gorsel',
    },
    canvas: {
      empty: 'Gorsel olusturmak icin sol panelden bir prompt girin.',
      singleView: 'Tekli Gorunum',
      gridView: 'Izgara Gorunum',
    },
    theme: {
      light: 'Acik Tema',
      dark: 'Koyu Tema',
      toggle: 'Tema Degistir',
    },
  },
} as const

// Recursive type that preserves structure but allows any string values
type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringify<T[K]>
}

export type TranslationKeys = DeepStringify<typeof tr>
