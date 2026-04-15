# Caster Studio

## What This Is

A professional AI-powered image generation tool built for textile companies. Users log in, choose a generation mode (on-model, pattern, catalog, colorway), configure their prompt and parameters, and generate images on a unified canvas workspace. Billing is Stripe metered — clients pay per-generation directly.

## Core Value

Textile companies can generate professional product imagery (on-model shots, patterns, catalogs, colorways) from a single, clean workspace without needing photographers or studios.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Solo login screen with clean, professional entry point
- [ ] Unified workspace: left sidebar (nav, prompt, controls, account) + canvas area
- [ ] Canvas toggle between full-screen single image and grid view
- [ ] On-Model Generation: upload flat/mannequin product → place on AI model in scene
- [ ] Pattern Lab: generate textile patterns from text prompts
- [ ] Catalog Mode: generate consistent multi-angle product shots
- [ ] Brand Face: create and save persistent AI model face for brand consistency
- [ ] Colorway Generator: show same garment in multiple color variations
- [ ] History timeline of all generations
- [ ] Collections: organize generations into named groups (season, line, etc.)
- [ ] Full prompt controls: model, steps, guidance, seed, aspect ratio, quality
- [ ] Stripe metered billing: per-generation usage tracking and charging
- [ ] User authentication via Supabase (email/password)
- [ ] FAL AI proxy via Supabase Edge Functions (no client-side API keys)
- [ ] Turkish language only

### Out of Scope

- Video generation (Video Ads) — complexity, not core to textile imagery
- AI prompt assistant (Mr. Prompt) — users have full controls, learn prompting
- Campaign/banner generation — not core to textile workflow
- Batch generation — v2 consideration after core tools are solid
- Reference image / image-to-image — text-to-image only, keep it simple
- Team/company workspaces — individual accounts only
- i18n (English, Spanish) — Turkish only for now
- Fabric Visualizer (3D drape) — v2, complex rendering
- Lookbook Export (PDF/deck) — v2
- Scene Builder (custom backgrounds) — v2
- OAuth (Google, Apple) — email/password sufficient for B2B clients
- Framer Motion animations — keep it snappy, not flashy

## Context

- This is a full rebuild of an existing product (Studio AI Design / studioaidesign.com)
- The old product had 11 features across fashion/general e-com — this rebuild focuses exclusively on textile companies
- Old product used a credit-based subscription model (iyzico) — new model is installation fee + monthly retainer + Stripe metered per-generation
- The old UI was generic and clunky — the new design should feel like a professional creative tool (clean, dark, purposeful)
- Brand name: Caster Studio (domain: caster.studio)
- No existing code to carry over — greenfield build

## Constraints

- **AI Provider**: FAL AI via Supabase Edge Function proxy — all API keys server-side only
- **Billing**: Stripe metered billing — no credit system, no iyzico
- **Auth**: Supabase Auth, email/password only
- **Language**: Turkish only, no i18n system needed
- **Design**: Professional tool aesthetic — dark UI, no unnecessary animation, sidebar + canvas layout
- **No reference images**: All generation is text-to-image (prompt-based only)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Full rebuild over migration | Old codebase has debt from 11 features, different billing, i18n overhead | — Pending |
| Unified canvas over separate pages | Single workspace feels more professional, reduces navigation friction | — Pending |
| Stripe metered over credit system | Client pays per-use directly, simpler than managing credit tiers | — Pending |
| Drop Framer Motion | Keep tool feeling fast and professional, reduce bundle size | — Pending |
| Turkish only | B2B textile clients are Turkish companies, no need for i18n complexity | — Pending |
| Text-to-image only | Simplifies UX, no reference image upload flows needed | — Pending |

---
*Last updated: 2026-04-16 after initialization*
