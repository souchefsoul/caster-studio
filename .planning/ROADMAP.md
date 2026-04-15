# Roadmap: Caster Studio

## Overview

Caster Studio is a greenfield build delivering a professional AI image generation workspace for textile companies. The roadmap moves from infrastructure and auth (Phase 1), through the core workspace with the primary generation mode (Phase 2), to the full generation suite and organization tools (Phase 3). Each phase delivers a complete, verifiable capability that unblocks the next.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation & Auth** - Supabase backend, authentication, database schema, FAL proxy, and i18n system
- [ ] **Phase 2: Workspace & First Generation** - Unified sidebar+canvas workspace with prompt controls and On-Model generation (first end-to-end flow)
- [ ] **Phase 3: Full Generation Suite & Organization** - Remaining generation modes (Catalog, Colorway, Design Language Copier) plus Brand Face, history, collections, and downloads

## Phase Details

### Phase 1: Foundation & Auth
**Goal**: Users can sign up, log in, and access a protected application shell with Turkish/English language support
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, INFRA-01, INFRA-02, INFRA-03, INFRA-04
**Success Criteria** (what must be TRUE):
  1. User can create an account with email/password and land on a protected page
  2. User can close the browser, reopen it, and still be logged in
  3. FAL AI proxy endpoint accepts a test prompt and returns a generated image (no API keys exposed to client)
  4. User can switch between Turkish and English and all UI text updates accordingly
  5. Database tables exist for users, generations, collections, and brand models
**Plans**: TBD

Plans:
- [ ] 01-01: TBD
- [ ] 01-02: TBD

### Phase 2: Workspace & First Generation
**Goal**: Users can work inside a professional canvas workspace, configure prompt parameters, and generate their first On-Model product image
**Depends on**: Phase 1
**Requirements**: WORK-01, WORK-02, WORK-03, WORK-04, GEN-05, GEN-01
**Success Criteria** (what must be TRUE):
  1. User sees a left sidebar with navigation, prompt input area, generation controls, and account info
  2. User can type a prompt, adjust parameters (model, steps, guidance, seed, aspect ratio, quality), and trigger a generation
  3. Generated image appears on the canvas; user can toggle between full-screen single image and grid view
  4. User can upload a flat/mannequin product photo and generate an on-model shot with an AI model in a scene
  5. Layout adapts cleanly to desktop, tablet, and mobile viewports with dark/light theme toggle
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD

### Phase 3: Full Generation Suite & Organization
**Goal**: Users have access to all generation modes and can organize, persist, and download their work
**Depends on**: Phase 2
**Requirements**: GEN-02, GEN-03, GEN-04, BRAND-01, BRAND-02, BRAND-03, BRAND-04
**Success Criteria** (what must be TRUE):
  1. User can generate consistent multi-angle product shots via Catalog Mode
  2. User can generate the same garment in multiple color variations via Colorway Generator
  3. User can copy the visual style of a product and make text/small modifications via Design Language Copier
  4. User can create a persistent AI model face (Brand Face) and reuse it across generations for brand consistency
  5. User can view a chronological history of all generations, organize them into named collections, and download any image in full resolution
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Auth | 0/? | Not started | - |
| 2. Workspace & First Generation | 0/? | Not started | - |
| 3. Full Generation Suite & Organization | 0/? | Not started | - |
