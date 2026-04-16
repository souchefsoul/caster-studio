# Requirements: Caster Studio

**Defined:** 2026-04-16
**Core Value:** Textile companies can generate professional product imagery from a single, clean workspace without needing photographers or studios.

## v1 Requirements

### Authentication

- [ ] **AUTH-01**: User can create account with email and password
- [ ] **AUTH-02**: User session persists across browser refresh

### Workspace

- [ ] **WORK-01**: Left sidebar with navigation, prompt input, generation controls, and account info
- [ ] **WORK-02**: Canvas area with toggle between full-screen single image and grid view
- [ ] **WORK-03**: Dark/light theme toggle
- [ ] **WORK-04**: Responsive layout (desktop, tablet, mobile)

### Generation

- [ ] **GEN-01**: On-Model Generation — upload flat/mannequin product, generate or select AI model, place on model in scene (includes built-in AI model generator)
- [ ] **GEN-02**: Catalog Mode — generate consistent multi-angle product shots
- [ ] **GEN-03**: Colorway Generator — show same garment in multiple color variations
- [ ] **GEN-04**: Design Language Copier — copy visual style of a given product, change text and make small modifications
- [ ] **GEN-05**: Full prompt controls (model, steps, guidance, seed, aspect ratio, quality)

### Brand & Organization

- [ ] **BRAND-01**: Brand Face — create and save persistent AI model face for brand consistency
- [ ] **BRAND-02**: History timeline of all generations (chronological)
- [ ] **BRAND-03**: Collections — organize generations into named groups (season, line, etc.)
- [ ] **BRAND-04**: Download generated images in full resolution

### Infrastructure

- [ ] **INFRA-01**: FAL AI proxy via Supabase Edge Functions (no client-side API keys)
- [x] **INFRA-02**: Supabase Auth integration
- [x] **INFRA-03**: Supabase database for users, generations, collections, brand models
- [ ] **INFRA-04**: i18n system with Turkish (default) and English

## v2 Requirements

### Generation

- **GEN-06**: Pattern Lab — generate textile patterns from text prompts
- **GEN-07**: Fabric Visualizer — apply pattern to garment mockup (3D drape preview)

### Export

- **EXP-01**: Lookbook Export — arrange generated images into presentation-ready PDF/deck
- **EXP-02**: Scene Builder — customizable backgrounds with textile-specific presets

### Batch

- **BATCH-01**: Batch Generation — multi-product generation with style templates

## Out of Scope

| Feature | Reason |
|---------|--------|
| Video generation | High complexity, not core to textile imagery |
| AI prompt assistant (Mr. Prompt) | Users have full controls, learn prompting |
| Campaign/banner generation | Not core to textile workflow |
| Reference image / image-to-image | Text-to-image only for v1 simplicity |
| Team/company workspaces | Individual accounts only |
| OAuth (Google, Apple) | Email/password sufficient for B2B clients |
| Framer Motion animations | Keep tool fast and professional |
| Stripe metered billing (BILL-01) | Removed from v1 scope per user decision |
| Usage dashboard (BILL-02) | Removed from v1 scope per user decision |
| Invoice history (BILL-03) | Removed from v1 scope per user decision |
| Admin billing view (BILL-04) | Removed from v1 scope per user decision |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Pending |
| AUTH-02 | Phase 1 | Pending |
| WORK-01 | Phase 2 | Pending |
| WORK-02 | Phase 2 | Pending |
| WORK-03 | Phase 2 | Pending |
| WORK-04 | Phase 2 | Pending |
| GEN-01 | Phase 2 | Pending |
| GEN-02 | Phase 3 | Pending |
| GEN-03 | Phase 3 | Pending |
| GEN-04 | Phase 3 | Pending |
| GEN-05 | Phase 2 | Pending |
| BRAND-01 | Phase 3 | Pending |
| BRAND-02 | Phase 3 | Pending |
| BRAND-03 | Phase 3 | Pending |
| BRAND-04 | Phase 3 | Pending |
| INFRA-01 | Phase 1 | Pending |
| INFRA-02 | Phase 1 | Complete |
| INFRA-03 | Phase 1 | Complete |
| INFRA-04 | Phase 1 | Pending |

**Coverage:**
- v1 requirements: 19 total
- Mapped to phases: 19
- Unmapped: 0

---
*Requirements defined: 2026-04-16*
*Last updated: 2026-04-16 after roadmap revision (billing removed)*
