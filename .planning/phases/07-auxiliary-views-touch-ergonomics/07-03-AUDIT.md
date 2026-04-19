---
phase: 07-auxiliary-views-touch-ergonomics
plan: 03
type: audit
requirement: TOUCH-03
audit_date: 2026-04-19
result: PASS
---

# 07-03 Audit: File-Input `accept` Coverage + Zero `capture` Hints

**Result:** PASS — Zero stragglers. TOUCH-03 satisfied. Zero source-file modifications required.

The Phase 6 plan 06-01 work (widening both `ImageUpload`'s default prop and `OnModelPanel`'s dedicated hidden input to `accept="image/*"`) remains intact on master. Every file-input surface in `src/` opens the OS native picker via `accept="image/*"` — either directly or via the shared `ImageUpload` component's prop-driven default. No `capture` attribute exists anywhere in the source tree, preserving the Phase 6 user decision ("no capture hint — let the OS offer both camera and library").

## Grep Output (as captured on 2026-04-19)

### Step 1 — `ImageUpload` default prop = `'image/*'`

```
$ grep -n "accept = 'image/\*'" src/components/ImageUpload.tsx
19:  accept = 'image/*',
```
Expected: 1 match. Actual: **1**. PASS.

### Step 2 — `OnModelPanel` dedicated hidden input `accept="image/*"`

```
$ grep -n 'accept="image/\*"' src/components/OnModelPanel.tsx
93:          accept="image/*"
```
Expected: 1 match. Actual: **1**. PASS.

### Step 3 — Every `<input type="file">` in `src/`

```
$ grep -rn 'type="file"' src/
src/components/ImageUpload.tsx:116:        type="file"
src/components/OnModelPanel.tsx:92:          type="file"
src/components/VideoPanel.tsx:114:                  '[data-video-source-upload] input[type="file"]'
```
Expected: 2 actual `<input>` elements. Actual: **2** — ImageUpload.tsx:116 (prop-driven `accept={accept}`, default `'image/*'`) and OnModelPanel.tsx:92 (hard-coded `accept="image/*"`). The VideoPanel.tsx:114 hit is a `document.querySelector` string selector (not an `<input>` definition), exactly as the plan's `<interfaces>` note predicted. PASS.

### Step 4 — ZERO `capture` attributes anywhere

```
$ grep -rn 'capture="' src/
(no matches)
$ grep -rn "capture='" src/
(no matches)
$ grep -rnE 'capture\s*=\s*"?(user|environment)' src/
(no matches)
$ grep -rni 'capture' src/
(no matches)
```
Expected: 0 matches across all probes (including case-insensitive full-word sweep). Actual: **0**. Phase 6 "no capture hint" policy preserved. PASS.

### Step 5 — `VideoPanel` source-picker bridge is querySelector-based, not a new `<input>`

```
$ grep -n 'data-video-source-upload' src/components/VideoPanel.tsx
100:        <div data-video-source-upload>
114:                  '[data-video-source-upload] input[type="file"]'
```
Expected: 2 matches (wrapper `<div>` + `document.querySelector` lookup). Actual: **2**. VideoPanel reaches into `ImageUpload`'s hidden input via data-attribute handoff (Phase 06-05 pattern); it does **not** define its own file input. PASS.

### Step 6 — `<ImageUpload>` call-sites and accept-override audit

```
$ grep -rn '<ImageUpload' src/
src/components/CatalogPanel.tsx:36:        <ImageUpload
src/components/CatalogPanel.tsx:44:        <ImageUpload
src/components/BrandFaceView.tsx:70:              <ImageUpload
src/components/ColorwayPanel.tsx:44:        <ImageUpload
src/components/DesignCopyPanel.tsx:16:        <ImageUpload
src/components/VideoPanel.tsx:101:          <ImageUpload

$ grep -rnE '<ImageUpload[^/]*accept=' src/
(no matches)
```
Expected: 6 call-sites (Catalog×2, BrandFaceView, Colorway, DesignCopy, Video), 0 accept-prop overrides. Actual: **6 call-sites, 0 overrides**. Every call-site inherits the `ImageUpload` default `accept = 'image/*'`. PASS.

### Step 7 — Prop propagation inside `ImageUpload`

```
$ grep -n 'accept={accept}' src/components/ImageUpload.tsx
117:        accept={accept}
```
Expected: 1 match (prop wired to hidden `<input>`). Actual: **1**. PASS.

### Step 8 — Build

```
$ npm run build
✓ 1973 modules transformed.
✓ built in 451ms
```
Exit code 0. (Pre-existing CSS `env(...)` warning from Phase 4/5 safe-area utilities is unrelated to this plan; logged elsewhere.)

## Summary

| Check                                                             | Expected | Actual  | Status |
| ----------------------------------------------------------------- | -------- | ------- | ------ |
| `ImageUpload` default prop `accept = 'image/*'`                   | 1        | 1       | PASS   |
| `OnModelPanel` hidden input `accept="image/*"`                    | 1        | 1       | PASS   |
| `<input type="file">` instances in `src/`                         | 2        | 2       | PASS   |
| `capture=` attributes (all variants)                              | 0        | 0       | PASS   |
| `<ImageUpload>` call-sites                                        | 6        | 6       | PASS   |
| `<ImageUpload>` call-sites overriding `accept`                    | 0        | 0       | PASS   |
| `data-video-source-upload` hits in `VideoPanel`                   | 2        | 2       | PASS   |
| `accept={accept}` prop propagation in `ImageUpload`               | 1        | 1       | PASS   |
| `npm run build` exit code                                         | 0        | 0       | PASS   |

**TOUCH-03 regression-locked.** Every file-input surface opens the OS native picker via `accept="image/*"`. Zero `capture` hints. The Phase 6 user decision ("no capture — let the OS offer both camera and library") is preserved and grep-verifiable.
