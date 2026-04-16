# Studio AI Design

AI-powered visual content generation platform for fashion/textile e-commerce.

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Shadcn/ui (new-york) + Radix UI + Tailwind CSS + Framer Motion
- **State**: Zustand (useAppStore) + TanStack React Query
- **Backend**: Supabase (PostgreSQL, Auth, Edge Functions, Storage)
- **AI**: FAL AI (image/video gen via proxy), OpenAI GPT-4o (via proxy), ElevenLabs (TTS via proxy)
- **Payments**: iyzico (subscription API via Supabase Edge Functions)
- **Hosting**: Vercel (auto-deploy on push to main)
- **Domain**: studioaidesign.com

## Project Structure

```
src/
  components/    # Pages and UI components (~43 files)
  lib/           # API integrations, utils, i18n, constants
  stores/        # Zustand store (useAppStore.ts)
  types/         # TypeScript type definitions
  hooks/         # Custom React hooks
supabase/
  functions/     # 11 Deno edge functions
  migrations/    # 52 SQL migration files
public/          # Static assets and images
```

## Commands

- `npm run dev` - Start dev server
- `npm run build` - Production build
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## Deployment

- **Vercel**: Auto-deploys on `git push origin main`
- **Manual deploy**: `npx vercel --prod`
- **Edge Functions deploy**: `SUPABASE_ACCESS_TOKEN=<token> npx supabase functions deploy <function-name> --project-ref dtgxpiaqybgpdspdbcfc`

## Supabase

- **Project**: StudioAiDesign
- **Ref ID**: dtgxpiaqybgpdspdbcfc
- **Region**: West EU (Ireland)
- **Edge Functions**: prompt-assistant, generate, catalog-analyze, fal-proxy, openai-proxy, elevenlabs-proxy, iyzico-checkout, iyzico-callback, stripe-checkout (legacy), stripe-webhook (legacy), create-admin-user, create-user-with-credits, upload-external-asset

## Security (API Key Proxies)

All API keys are stored as Supabase secrets, NOT in frontend code:
- **FAL AI**: `fal` secret → `fal-proxy` edge function (proxyUrl pattern)
- **OpenAI**: `openai` secret → `openai-proxy` edge function
- **ElevenLabs**: `elevenlabs` secret → `elevenlabs-proxy` edge function
- To update a key: `npx supabase secrets set "keyname=value" --project-ref dtgxpiaqybgpdspdbcfc`

## Key Conventions

- All frontend env vars use `VITE_` prefix (only SUPABASE_URL and ANON_KEY needed)
- Credit system: anonymous users get 20 free credits, authenticated users use subscription-based credits
- Admin users see infinity symbol for credits
- Plans: free, starter, basic, standard, pro, premium, elite, admin
- i18n: Turkish (default), English, Spanish
- Auth: Email/password, Google OAuth, Apple OAuth
- SPA routing handled by vercel.json rewrites
- localStorage keys prefixed with `stivra-`

## AI Features

1. **Studio** - Fashion photography AI (src/components/StudioPage.tsx)
2. **Digital Model** - AI model product visualization (src/components/DigitalModelPage.tsx)
3. **Product Shoot** - Product photography + Mannequin to Model (src/components/ProductShootPage.tsx)
4. **Pattern Design** - Textile pattern creation (src/components/PatternDesignPage.tsx)
5. **Video Ads** - Commercial video generation + voiceover (src/components/VideoAdsPage.tsx)
6. **Campaign** - Campaign visuals and banners (src/components/CampaignPage.tsx)
7. **Mr. Prompt** - AI prompt assistant via edge function (src/components/MrPromptPage.tsx)
8. **Full Catalog** - 8 or 16 angle product catalog generation (src/components/CatalogPage.tsx)
9. **Batch Generation** - Multi-product generation with style templates (src/components/BatchGenerationPage.tsx)
10. **Brand Model** - AI model designer + upload, saved per user (src/components/BrandSettingsPage.tsx)
11. **Model Picker** - Preset + brand model selector, used across all generators (src/components/ModelPicker.tsx)

## Database Tables

- `preset_models` - 12 preset AI models (6F/6M) for model picker
- `user_brand_models` - Per-user brand model faces with active selection
- `batch_jobs` + `batch_job_items` - Batch generation queue system
- `teams` + `team_members` + `team_invites` - Team collaboration (DB ready, UI removed for now)

## FAL.ai Endpoints (via fal-proxy)

- `fal-ai/nano-banana-pro/edit` - Main image generation with reference images
- `fal-ai/nano-banana` - Text-to-image (brand model generation)
- `fal-ai/kling-video/v2.5-turbo/pro/image-to-video` - Video generation
- `fal-ai/index-tts-2/text-to-speech` - TTS

## Dashboard Tools Menu

Accessible via "Araçlar" dropdown (top-left):
- Mr.Prompt
- Full Catalog (/catalog)
- Batch Generation (/batch)
- Brand Model (/brand-settings)

## Batch Generation Templates

5 style presets with campaign-level prompts:
- Beyaz Stüdyo (Vogue/Hasselblad quality)
- Yaşam Tarzı (Paris/Milan, Zara/COS feel)
- Sokak Stili (Acne Studios, no graffiti)
- Doğa (botanical/coastal, no wind)
- Siyah Stüdyo (Saint Laurent, Rembrandt lighting)
- Özel Prompt (user writes)

## Background Presets

25 presets in 5 categories (Studio, Nature, Urban, Luxury, Seasonal) defined in src/lib/constants.ts
