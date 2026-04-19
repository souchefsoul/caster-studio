# Texora Studio

## What This Is

A professional AI-powered image and video generation tool built for textile companies. Users log in, choose a generation mode (on-model, catalog, colorway, design-copy, video), configure their prompt and parameters, and generate on a unified canvas workspace. Works on desktop; v1.1 brings full feature parity to phones.

## Core Value

Textile companies can generate professional product imagery and product videos from a single, clean workspace — on any device they have with them — without needing photographers or studios.

## Current Milestone: v1.1 Mobile-Usable Site

**Goal:** Every v1.0 feature works on a phone browser with no feature cuts, keeping the existing Windows 95 flat aesthetic.

**Target features:**
- Responsive sidebar (drawer on mobile, fixed on desktop)
- Mobile-tuned canvas (grid + single view reflow, touch-friendly controls)
- All 5 generation modes usable on a phone (on-model, catalog, colorway, design-copy, video)
- Brand face management + generation history usable on mobile
- Touch-optimised upload grids, no iOS input zoom, no horizontal scroll

## Requirements

### Validated

<!-- Shipped in v1.0 -->

- ✓ Solo login screen with clean, professional entry point — v1.0
- ✓ Unified workspace: left sidebar + canvas — v1.0
- ✓ Canvas toggle between single-image and grid view — v1.0
- ✓ On-Model Generation: multi-image refs (up to 10) + front/back view — v1.0 (redesigned 03-06)
- ✓ Catalog Mode: multi-angle product shots — v1.0
- ✓ Colorway Generator: same garment in multiple colors — v1.0
- ✓ Design Copy mode (reference-driven edits) — v1.0
- ✓ Video generation (Kling v3 Pro) persisted in history — v1.0 (added 03-06)
- ✓ Brand Face: persistent AI model face — v1.0
- ✓ Generation history with delete — v1.0
- ✓ Prompt controls: aspect ratio, quality, num images — v1.0
- ✓ Supabase auth (email/password) — v1.0
- ✓ FAL AI via @fal-ai/client + pass-through Supabase edge function — v1.0 (refactored 03-06)
- ✓ i18n: Turkish + English — v1.0

### Active

<!-- v1.1 Mobile scope -->

- [ ] Responsive layout: sidebar becomes a drawer below `lg`, fixed on desktop
- [ ] Mobile-safe canvas: 2-col grid on phones, single-view fills viewport, zero horizontal scroll
- [ ] Touch-friendly controls: tap targets ≥ 40px, no iOS input zoom on textareas
- [ ] All 5 generation modes fully usable on a phone
- [ ] Mobile-tuned Brand Face view + generation history
- [ ] Viewport + PWA-friendly meta tags (installable later without refactor)
- [ ] Verified on real iOS Safari + Android Chrome (not just DevTools simulation)

### Out of Scope

- Pattern Lab (textile pattern generation) — deferred, not core to current flows
- Collections feature — removed in 03-06 (UI + DB tables dropped)
- AI prompt assistant (Mr. Prompt) — users have full controls
- Campaign/banner generation — not core to textile workflow
- Batch generation — v2+ consideration
- Team/company workspaces — individual accounts only
- Spanish language support — Turkish + English only for now
- Fabric Visualizer (3D drape) — v2, complex rendering
- Lookbook Export (PDF/deck) — v2
- Scene Builder (custom backgrounds) — v2
- OAuth (Google, Apple) — email/password sufficient for B2B clients
- Framer Motion animations — keep it snappy, not flashy
- Stripe metered billing — removed from v1, no payment features in application
- Usage dashboard / invoice history — removed with billing
- PWA installability + offline mode — v1.2+ (viewport/meta prepared but not shipped)
- Native wrapper (Capacitor / iOS / Android app store) — v2+, web-first
- Mobile-first redesign (new visual language) — v1.1 keeps Windows 95 flat aesthetic

## Context

- This is a full rebuild of an existing product (Studio AI Design / studioaidesign.com)
- The old product had 11 features across fashion/general e-com — this rebuild focuses exclusively on textile companies
- Old product used a credit-based subscription model (iyzico) — new model handles billing externally
- The old UI was generic and clunky — the new design should feel like a professional creative tool (clean, dark, purposeful)
- Brand name: Texora Studio (domain: texora.studio)
- No existing code to carry over — greenfield build

## Constraints

- **AI Provider**: FAL AI via Supabase Edge Function proxy — all API keys server-side only
- **Auth**: Supabase Auth, email/password only
- **Language**: Turkish (default) + English, i18n system required
- **Design**: Professional tool aesthetic — dark UI, no unnecessary animation, sidebar + canvas layout
- **No reference images**: All generation is text-to-image (prompt-based only)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Full rebuild over migration | Old codebase has debt from 11 features, different billing, i18n overhead | ✓ Good |
| Unified canvas over separate pages | Single workspace feels more professional, reduces navigation friction | ✓ Good |
| Drop Framer Motion | Keep tool feeling fast and professional, reduce bundle size | ✓ Good |
| Turkish + English with i18n | B2B textile clients are Turkish companies, English for international reach | ✓ Good |
| Reference-image generation (was: text-to-image only) | FAL nano-banana-pro/edit produces far better textile results with refs; matches user workflow (upload garment → see it on model) | ✓ Good — changed in v1.0 build |
| Reference image uploads go to fal.storage, not Supabase Storage | Avoids `WORKER_RESOURCE_LIMIT` on edge function; payload stays small | ✓ Good (v1.0 03-06) |
| Video generation (Kling v3 Pro) added | Customers asked for short product videos; single edge function supports both | ✓ Good (v1.0 03-06) |
| No billing in v1 | Billing handled externally, keeps application focused on generation tools | ✓ Good |
| v1.1: responsive web over PWA / native | Tek codebase, h\u0131zl\u0131 teslim, no App Store overhead | — Pending |
| v1.1: keep Windows 95 flat aesthetic on mobile | Brand consistency, faster delivery, no redesign debt | — Pending |
| v1.1: feature parity (no mobile-only cuts) | Users switch devices mid-task; tool must feel complete on phone | — Pending |

---
*Last updated: 2026-04-19 — milestone v1.1 Mobile started*
