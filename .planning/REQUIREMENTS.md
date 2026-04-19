# Requirements: Caster Studio — Milestone v1.1 Mobile-Usable Site

**Defined:** 2026-04-19
**Core Value:** Textile companies can generate professional product imagery and product videos from a single, clean workspace — on any device they have with them — without needing photographers or studios.

## v1.1 Requirements

Requirements for the Mobile-Usable Site milestone. Each maps to a roadmap phase. All requirements target real mobile browsers (iOS Safari, Android Chrome), keeping the Windows 95 flat aesthetic.

### Layout (Responsive Shell)

- [x] **LAYOUT-01**: Viewport meta tag configured (`width=device-width, initial-scale=1, viewport-fit=cover`) so mobile browsers render the app at the correct scale.
- [x] **LAYOUT-02**: Sidebar becomes a full-height overlay drawer below the `lg` breakpoint, opened via a hamburger in the canvas toolbar; remains a fixed column on `lg` and up.
- [ ] **LAYOUT-03**: Sidebar drawer closes automatically after navigation (changing mode, opening Brand Face view) on mobile so the user returns to the canvas without an extra tap.
- [x] **LAYOUT-04**: No part of the app causes horizontal scroll on any screen ≥ 320px wide (including prompt textareas, toolbars, grids, video playback).
- [x] **LAYOUT-05**: Safe-area insets respected on iOS notch/home-indicator devices (sidebar, toolbar, account section don't clip under system UI).

### Canvas (Gallery / Single View)

- [ ] **CANVAS-01**: Grid view shows 2 columns below the `sm` breakpoint, 3 columns at `md`, 4 at `lg+` so thumbnails stay legible on phones.
- [ ] **CANVAS-02**: Single view fills the mobile viewport without a letterbox gap; image/video uses the full width minus a thin border.
- [ ] **CANVAS-03**: Canvas toolbar (view toggle, generation count, download, delete, create-video, hamburger) reflows cleanly on a 360px-wide screen — no overlapping or cut-off controls.
- [ ] **CANVAS-04**: Grid item hover-only overlay (delete / create video / download) has an equivalent that works on touch — buttons are visible on tap or always shown on mobile.
- [ ] **CANVAS-05**: Video generations play inline on mobile with controls, no forced fullscreen autoplay that breaks iOS audio policy.

### Mode Panels (Feature Parity)

- [ ] **MODES-01**: On-Model panel fully usable on mobile — multi-image grid uploads via file picker, each slot ≥ 80px, front/back view toggle tappable.
- [ ] **MODES-02**: Catalog panel fully usable on mobile — product image uploads, 4-column angle grid reflows to 3 on small screens, generates correctly.
- [ ] **MODES-03**: Colorway panel fully usable on mobile — color input, add/remove colors, generation count picker tappable.
- [ ] **MODES-04**: Design Copy panel fully usable on mobile — reference image upload and modifications textarea usable without zoom.
- [ ] **MODES-05**: Video panel fully usable on mobile — source image (upload or gallery-picker), prompt textarea, duration/aspect/audio controls tappable, generated video plays in-panel.
- [ ] **MODES-06**: Brand Face panel usable on mobile — active face preview visible, switch/clear buttons tappable, opens the Brand Face management view without layout break.

### Auxiliary Views

- [ ] **AUX-01**: Brand Face management view (BrandFaceView) reflows to a single column grid on mobile with tap-sized add/delete/set-active controls.
- [ ] **AUX-02**: Auth page (Sign In / Sign Up) renders within the viewport with inputs ≥ 16px font-size (no iOS auto-zoom) and the submit button reachable without scroll on a 667px-tall screen.

### Touch & Input Ergonomics

- [ ] **TOUCH-01**: All primary interactive controls (buttons, toggles, inputs, thumbnails) have a minimum 40×40px tap target; decorative icons may be smaller only when paired with a larger hit area.
- [ ] **TOUCH-02**: Text inputs and textareas use `font-size: 16px` (or larger) so iOS Safari does not auto-zoom the viewport on focus.
- [ ] **TOUCH-03**: File upload inputs request `accept="image/*"` (and appropriate `capture` hints where useful) so the OS offers camera/library pickers natively.
- [ ] **TOUCH-04**: Long prompts don't break layout — textarea grows vertically; buttons next to it wrap to a new row rather than overflowing.

### Verification

- [ ] **VERIFY-01**: Every v1.0 generation mode has been end-to-end run on a real mobile browser (iOS Safari and Android Chrome) with a successful image/video saved to history and survived a page refresh.
- [ ] **VERIFY-02**: Visual QA pass documented: no horizontal scroll, no clipped content, no unreadable text, no broken tap targets across 360×640, 390×844, 414×896 viewport sizes.

## v1.2+ Requirements

Deferred to future releases. Tracked but not in this roadmap.

### Mobile Enhancements

- **PWA-01**: Web App Manifest + install prompt so users can add Caster Studio to their Home Screen.
- **PWA-02**: Service worker caching the app shell for faster repeat loads and basic offline viewing of past generations.
- **MOBILE-01**: Swipe gestures in the canvas grid to open single view, swipe left/right to navigate between generations.
- **MOBILE-02**: Pull-to-refresh on the canvas to re-sync generation history.

### Native

- **NATIVE-01**: Capacitor packaging for iOS and Android App Store distribution.
- **NATIVE-02**: Native share sheet integration for downloading/sharing generated videos.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Mobile-first visual redesign | Scope creep — v1.1 keeps existing Windows 95 aesthetic and only makes it responsive. |
| Native wrappers (Capacitor, iOS/Android apps) | Web-first for v1.1; native is v2+. |
| PWA installability + service worker | Deferred to v1.2 so v1.1 ships faster. Meta tags will be prepared. |
| Touch gesture navigation (swipe between generations) | Nice-to-have; tap-based nav sufficient for v1.1. |
| Tablet-specific UI tuning | Tailwind `md` breakpoint covers tablets acceptably; dedicated tuning later. |
| Pattern Lab on mobile | Feature itself is out of scope for the product (see PROJECT.md). |

## Traceability

Which phases cover which requirements. Populated by roadmapper; confirmed by ROADMAP.md v1.1.

| Requirement | Phase | Status |
|-------------|-------|--------|
| LAYOUT-01 | Phase 4 | Complete |
| LAYOUT-02 | Phase 4 | Complete |
| LAYOUT-03 | Phase 4 | Pending |
| LAYOUT-04 | Phase 4 | Complete |
| LAYOUT-05 | Phase 4 | Complete |
| CANVAS-01 | Phase 5 | Pending |
| CANVAS-02 | Phase 5 | Pending |
| CANVAS-03 | Phase 5 | Pending |
| CANVAS-04 | Phase 5 | Pending |
| CANVAS-05 | Phase 5 | Pending |
| MODES-01 | Phase 6 | Pending |
| MODES-02 | Phase 6 | Pending |
| MODES-03 | Phase 6 | Pending |
| MODES-04 | Phase 6 | Pending |
| MODES-05 | Phase 6 | Pending |
| MODES-06 | Phase 6 | Pending |
| AUX-01 | Phase 7 | Pending |
| AUX-02 | Phase 7 | Pending |
| TOUCH-01 | Phase 7 | Pending |
| TOUCH-02 | Phase 7 | Pending |
| TOUCH-03 | Phase 7 | Pending |
| TOUCH-04 | Phase 7 | Pending |
| VERIFY-01 | Phase 8 | Pending |
| VERIFY-02 | Phase 8 | Pending |

**Coverage:**
- v1.1 requirements: 24 total
- Mapped to phases: 24
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-19*
*Last updated: 2026-04-19 — roadmap v1.1 created, phase assignments confirmed (Phases 4-8)*
