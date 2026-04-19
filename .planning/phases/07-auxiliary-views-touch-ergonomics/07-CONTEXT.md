# Phase 7: Auxiliary Views & Touch Ergonomics - Context

**Gathered:** 2026-04-19
**Status:** Ready for planning
**Source:** Smart discuss — all 3 grey areas accepted verbatim.

<domain>
## Phase Boundary

Two kinds of work:

1. **Global touch/input ergonomics across the whole app** — 40×40px minimum tap targets (TOUCH-01), 16px minimum font-size on text inputs/textareas (TOUCH-02), `accept="image/*"` on every file upload without adding `capture` hints (TOUCH-03), and textarea auto-grow for any remaining prompt textareas that still have fixed rows (TOUCH-04).

2. **Two specific mobile view reflows** — Brand Face management view (AUX-01) gets a single-column grid with tap-sized controls; Auth page (AUX-02) renders within the viewport on a 667px-tall phone with 16px+ inputs and no submit-button scroll.

Covers REQUIREMENTS.md: AUX-01, AUX-02, TOUCH-01, TOUCH-02, TOUCH-03, TOUCH-04.

Phase 6 already delivered mode-panel ergonomics on 3 panels specifically (Colorway input, Design Copy textarea, Video prompt textarea) — Phase 7 handles everything else globally without re-doing those three.

</domain>

<decisions>
## Implementation Decisions

### Global Tap Target & Font-Size Sweep (TOUCH-01, TOUCH-02)
- **Audit strategy:** scan existing `Button`, `input`, and icon-only button usage for any instance below 40×40px; lift to `min-h-10` (+ `min-w-10` when icon-only). Shadcn's default Button size is already 40px — the audit targets `size="sm"` variants and bare `<button>` elements.
- **Icon-only buttons:** explicit `min-h-10 min-w-10` on the button itself. The icon stays `size-4` (16px); the hit-area grows via the button's min dimensions, not icon scaling.
- **Font-size approach:** selective, not a blanket sweep. Bump `text-sm` → `text-base` on user-input `<input>` / `<textarea>` elements only (not labels, not buttons, not read-only text). Phase 6 already did this on 3 panels — Phase 7 touches the rest.
- **Scope:** every primary interactive control across the app, including the canvas toolbar's icon-only buttons. Decorative icons may stay small only when paired with a larger hit area.

### Textarea Auto-Grow + Capture Hints (TOUCH-03, TOUCH-04)
- **PromptPanel textarea** (On-Model, Catalog, Colorway all feed through it) gets the same treatment as Design Copy / Video in Phase 6: `field-sizing-content` + `min-h-[5rem]` + `text-base` + `rows={3}` default + `resize-none`.
- **Video prompt textarea:** already handled in Phase 6 plan 06-05, leave alone.
- **Capture hint policy: NONE.** No `capture="environment"` on product uploads, no `capture="user"` on brand face uploads. `accept="image/*"` alone triggers the native OS sheet, which offers both camera and library. This honors the Phase 6 user decision ("no capture hint — let the OS offer both"). TOUCH-03 is met by `accept="image/*"` coverage audit.
- **File input audit:** grep for all `<input type="file">` occurrences plus every `ImageUpload` usage; confirm `accept="image/*"` is present (directly or via ImageUpload's default from Phase 6 plan 06-01). Fix any stragglers.

### BrandFaceView + AuthPage Mobile Reflow (AUX-01, AUX-02)
- **BrandFaceView grid:** `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`. Single column mobile per AUX-01's explicit wording. Multi-col reappears at `sm` (640px) so small phones in landscape and larger phones still get density.
- **BrandFaceView controls (add / delete / set-active):** always visible, not hover-gated. Use `min-h-10 min-w-10` on icon-only buttons. Matches BrandFacePanel pattern from Phase 6 plan 06-06.
- **AuthPage layout:** keep the `max-w-md` centered card. On mobile, side margin comes from `mx-4` (or equivalent) rather than full-bleed. Inputs get `text-base min-h-10` if not already. Submit button and form fit within a 667px-tall viewport (field count is low — email, password, optional full name).
- **AuthPage input font audit:** verify Shadcn `Input` component renders `text-base` (16px) on this page. If it defaults to `text-sm`, override with `className="text-base"`. Switch link ("Don't have an account? Sign up") wrapped in a tappable `min-h-10` container.

### Claude's Discretion
- Exact class to use for icon-only-button hit-area floor — `min-h-10 min-w-10` is the anchor, but if a component already has `size="icon"` from Shadcn that renders 40×40px, no change needed.
- Whether to add a `prefers-reduced-motion` guard on any auto-grow transition — nice-to-have, planner picks based on Phase 4/5/6 precedent (no such guard added before).
- Whether to introduce a shared `<AutoTextarea />` wrapper for the three-plus textareas now using `field-sizing-content` — the planner decides if the repetition justifies it. If not, inline className is fine and consistent.

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/ui/button.tsx` — Shadcn Button with `default` (40px) and `sm` (32px) variants. Audit tells us which to use; Phase 7 does not refactor Button itself.
- `src/components/ui/input.tsx` — Shadcn Input. Check default font-size; override at usage site if needed.
- `src/components/PromptPanel.tsx` — shared prompt entry point for On-Model/Catalog/Colorway, targets TOUCH-04 upgrade.
- `src/components/BrandFaceView.tsx` — full management view (grid of faces + create form), targets AUX-01.
- `src/components/AuthPage.tsx` — sign-in/sign-up forms, targets AUX-02.
- `src/components/ImageUpload.tsx` — already carries `accept="image/*"` default from Phase 6 plan 06-01.

### Established Patterns
- Windows 95 flat (`rounded-none`, 1px borders, no shadows) — locked
- `min-h-10 min-w-10` = 40×40px tap floor (established in Phase 6 for icon-only buttons)
- `field-sizing-content` + `min-h-[5rem]` + `text-base` + `rows={3}` = auto-grow textarea recipe (Phase 6)
- `accept="image/*"` only (no `capture`) = file input pattern (Phase 6 user decision)
- Turkish default, English secondary; auth/aux views need i18n key audit

### Integration Points
- Phase 6's PromptPanel i18n keys already exist (added in 06-01); Phase 7 extends keys only if hit new user-facing strings in AuthPage/BrandFaceView that were previously English-hardcoded.
- BrandFaceView opens via the `brand-face` activeView switch in the workspace store — already wired.
- AuthPage sits outside the protected route tree — no workspace store touchpoints.

</code_context>

<specifics>
## Specific Ideas

- The "40px tap target" rule comes directly from TOUCH-01 and is not negotiable.
- The "no capture hint" rule comes from the Phase 6 user decision — do not reintroduce `capture` in Phase 7.
- AuthPage must remain reachable without vertical scroll on a 667px-tall phone (e.g., iPhone SE). If it currently doesn't, trim spacing; don't hide fields.
- Textarea auto-grow via CSS `field-sizing: content` is the Tailwind v4 way — no polyfill expected on modern iOS Safari + Android Chrome.

</specifics>

<deferred>
## Deferred Ideas

- Shared `<AutoTextarea />` wrapper component — planner may introduce but it's not required by any requirement.
- Global default font-size lift on the Shadcn Input component (`text-base` everywhere by default) — out of scope, selective lift is the decision.
- Larger touch targets for decorative icons (e.g., status dots on brand face tiles) — TOUCH-01 explicitly exempts decorative icons when paired with larger hit areas.
- OAuth button sizing on AuthPage — AuthPage currently only does email/password (PROJECT.md), no OAuth in scope for v1.

</deferred>

<effects_on_later_phases>
## Downstream Impact

- **Phase 8 (Real-Device Verification):** The TOUCH-* rules are what Phase 8 will check across 360×640, 390×844, 414×896 viewports. Phase 7 sets the contract; Phase 8 validates on device.

</effects_on_later_phases>
