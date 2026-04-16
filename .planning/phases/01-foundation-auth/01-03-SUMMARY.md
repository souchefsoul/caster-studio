---
phase: 01-foundation-auth
plan: 03
subsystem: infra
tags: [fal-ai, deno-edge-function, i18n, zustand, translations, turkish, english, supabase-functions]

# Dependency graph
requires:
  - phase: 01-foundation-auth/01
    provides: Vite + React + TypeScript scaffold, Supabase client singleton
  - phase: 01-foundation-auth/02
    provides: AuthPage, AppShell, useAuth hook, React Router
provides:
  - FAL AI proxy edge function with endpoint allowlist and server-side API key
  - i18n system with Zustand locale store and t() translation function
  - Turkish (default) and English translation files
  - LanguageSwitcher component
  - Translated AuthPage and AppShell
affects: [02-workspace-first-gen]

# Tech tracking
tech-stack:
  added: [deno-edge-functions, i18n-zustand]
  patterns: [supabase-edge-function-proxy, cors-shared-module, zustand-locale-store, translation-hook, localStorage-persistence]

key-files:
  created:
    - supabase/functions/fal-proxy/index.ts
    - supabase/functions/_shared/cors.ts
    - src/lib/i18n.ts
    - src/lib/translations/tr.ts
    - src/lib/translations/en.ts
    - src/hooks/useTranslation.ts
    - src/components/LanguageSwitcher.tsx
  modified:
    - src/components/AppShell.tsx
    - src/components/AuthPage.tsx

key-decisions:
  - "Used DeepStringify<typeof tr> for TranslationKeys to allow different string values across locales while preserving structure"
  - "Split auth toggle text into separate question and action keys (noAccount/noAccountAction) for cleaner i18n"
  - "Added signInDescription/signUpDescription and pleaseWait keys beyond plan spec for complete AuthPage i18n coverage"

patterns-established:
  - "Edge function proxy: Deno.serve with CORS, Deno.env.get for secrets, endpoint allowlist"
  - "Shared CORS: supabase/functions/_shared/cors.ts imported by all edge functions"
  - "i18n: Zustand store (useLocale) + t() function + useTranslation hook"
  - "Locale persistence: localStorage key 'stivra-locale', default 'tr'"
  - "Translation structure: src/lib/translations/{locale}.ts with TranslationKeys type"

requirements-completed: [INFRA-01, INFRA-04]

# Metrics
duration: 3min
completed: 2026-04-16
---

# Phase 01 Plan 03: FAL AI Proxy and i18n System Summary

**FAL AI proxy edge function with endpoint allowlist and Zustand-based i18n system with Turkish (default) and English translations**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-16T00:25:12Z
- **Completed:** 2026-04-16T00:27:56Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- FAL AI proxy Deno edge function that keeps API keys server-side, validates against 4 allowed FAL endpoints, and proxies requests with CORS support
- Shared CORS module for reuse across future edge functions
- Zustand-based i18n system with Turkish (default) and English, locale persisted in localStorage under stivra-locale key
- LanguageSwitcher toggle in both AuthPage and AppShell, all UI strings use t() for translation

## Task Commits

Each task was committed atomically:

1. **Task 1: FAL AI proxy Supabase Edge Function** - `8083887` (feat)
2. **Task 2: i18n system with Turkish and English translations** - `e4e6a1c` (feat)

## Files Created/Modified
- `supabase/functions/fal-proxy/index.ts` - Deno edge function proxying requests to FAL AI with server-side API key and endpoint allowlist
- `supabase/functions/_shared/cors.ts` - Shared CORS headers for all edge functions
- `src/lib/i18n.ts` - Zustand locale store (useLocale) and t() translation lookup function
- `src/lib/translations/tr.ts` - Turkish translations with TranslationKeys type export
- `src/lib/translations/en.ts` - English translations conforming to TranslationKeys structure
- `src/hooks/useTranslation.ts` - React hook wrapping useLocale and t() for component use
- `src/components/LanguageSwitcher.tsx` - Toggle button switching between TR and EN
- `src/components/AppShell.tsx` - Updated with LanguageSwitcher and t() for title, welcome, sign-out
- `src/components/AuthPage.tsx` - Updated with LanguageSwitcher and t() for all form labels, buttons, messages

## Decisions Made
- Used `DeepStringify<typeof tr>` recursive type for TranslationKeys instead of `typeof tr` directly -- `as const` makes literal string types which prevents different string values in English translations
- Split auth toggle text into question + action keys (e.g., `noAccount` + `noAccountAction`) for cleaner i18n instead of embedding the link text within the question string
- Added extra translation keys beyond plan spec (`signInDescription`, `signUpDescription`, `pleaseWait`) to fully translate all AuthPage strings

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TranslationKeys type for multi-locale compatibility**
- **Found during:** Task 2 (build verification)
- **Issue:** `as const` on the Turkish translations object made `typeof tr` produce literal string types (e.g., `'Giris Yap'`), so the English translations could not satisfy the type since they have different string values
- **Fix:** Created `DeepStringify<T>` recursive mapped type that preserves object structure but widens all leaf values to `string`
- **Files modified:** src/lib/translations/tr.ts
- **Verification:** `npm run build` succeeds with both locale files type-checking correctly
- **Committed in:** e4e6a1c (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Type fix necessary for TypeScript compilation. No scope creep.

## Issues Encountered
None beyond the type fix documented above.

## User Setup Required

None - FAL AI proxy edge function is ready to deploy when the Supabase `fal` secret is set. The secret is configured via `npx supabase secrets set "fal=<key>" --project-ref dtgxpiaqybgpdspdbcfc`. No local configuration needed.

## Next Phase Readiness
- Phase 01 (Foundation & Auth) is fully complete: scaffold, auth, FAL proxy, i18n
- FAL AI proxy is ready for deployment to Supabase Edge Functions
- i18n system is ready for additional translation keys as new features are built in Phase 2
- All UI components use t() so new languages can be added by creating a new translation file

## Self-Check: PASSED

All 9 files verified on disk. Both task commits (8083887, e4e6a1c) verified in git log.

---
*Phase: 01-foundation-auth*
*Completed: 2026-04-16*
