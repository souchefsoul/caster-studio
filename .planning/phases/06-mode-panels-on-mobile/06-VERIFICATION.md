---
phase: 06-mode-panels-on-mobile
verified: 2026-04-19T00:00:00Z
status: human_needed
score: 6/6 must-haves verified
human_verification:
  - test: "Run On-Model end-to-end on a real phone — upload ≥2 images via grid, toggle Front/Back, generate"
    expected: "3-col grid renders, each slot ≥80px, Front/Back buttons ≥40px tall, file picker opens native camera+library sheet, generation completes and lands in canvas"
    why_human: "Visual tap-target size and native OS sheet behavior cannot be verified by grep; field-sizing-content CSS is programmatically confirmed but rendered auto-grow requires real interaction"
  - test: "Run Catalog on a ~360px viewport — upload front+back images, select angles, generate"
    expected: "Angle grid shows 3 columns at <md, 4 columns at md+; all 6 angle buttons ≥40px tall; labels are localized (not hardcoded Turkish)"
    why_human: "Responsive breakpoint rendering requires visual verification at actual viewport sizes"
  - test: "Run Colorway on a phone — add 3 colors, remove one, pick generation count"
    expected: "Color chips wrap across rows (no horizontal scroll), remove button is a 40px hit area, add-color input does NOT trigger iOS auto-zoom on focus, Add button ≥40px"
    why_human: "iOS auto-zoom absence can only be confirmed on a real iOS Safari device; wrap behavior needs visual check"
  - test: "Run Design Copy on a phone — type a 200-char prompt in the modifications textarea"
    expected: "Textarea grows vertically as text is entered, Generate button stays reachable via scroll, no horizontal overflow, no iOS auto-zoom on focus"
    why_human: "field-sizing-content auto-grow behavior requires live interaction to confirm; iOS zoom requires real device"
  - test: "Run Video end-to-end on a phone — upload source image, write prompt, pick 9:16, generate, wait for result"
    expected: "Two-button source picker visible (Upload from Device + Pick from Gallery) when gallery is populated; prompt textarea auto-grows; Duration/Aspect/Audio controls ≥40px; completed video renders inline in panel at 9:16 aspect with playsInline+muted+controls; tapping play does NOT force fullscreen"
    why_human: "Inline video behavior (no forced fullscreen, correct aspect ratio render) requires real iOS Safari; gallery availability requires a prior generation to exist"
  - test: "Open Brand Face panel on a phone and switch/clear active face"
    expected: "Expanded grid shows 2 columns; each tile ≥80px; active tile shows 'Aktif' caption; collapse toggle and View All button each ≥40px; tapping View All navigates to Brand Face management view without layout break"
    why_human: "Tap-target heights and 2-col tile width require visual check; navigation wiring needs a live click to confirm the management view opens"
---

# Phase 6: Mode Panels on Mobile — Verification Report

**Phase Goal:** All five generation modes plus the Brand Face panel are fully operable on a phone with no feature cuts.
**Verified:** 2026-04-19
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | On-Model: 3-col upload grid with ≥80px slots, localized Front/Back toggle ≥40px, accept=image/* | VERIFIED | `OnModelPanel.tsx` lines 63/66/80: `grid grid-cols-3 gap-2`, `min-h-20 min-w-20` on both tile types; `accept="image/*"` line 93; `min-h-10` on both buttons lines 109/117; `t('workspace.onModel.viewFront/Back')` lines 111/118 |
| 2 | Catalog: angle grid 3-col on mobile / 4-col at md+, all buttons ≥40px, hardcoded Turkish removed | VERIFIED | `CatalogPanel.tsx` line 52: `grid grid-cols-3 gap-1 md:grid-cols-4`; line 59: `className="rounded-none min-h-10"`; `t('workspace.catalog.anglesLabel')` line 51, `t('workspace.catalog.hintGenerated')` line 66; AVAILABLE_ANGLES uses labelKeys, no hardcoded strings |
| 3 | Colorway: chips wrap, add-color input 16px font + 40px, Add button 40px, remove button 40px, no horizontal scroll | VERIFIED | `ColorwayPanel.tsx` line 55: `flex flex-wrap gap-1`; line 65: `flex h-10 w-10 items-center justify-center`; line 84: `text-base min-h-10`; line 90: `rounded-none text-xs px-3 min-h-10`; `aria-label="Remove color"` line 67 |
| 4 | Design Copy: textarea auto-grows via field-sizing-content, 16px font, 3-row min-height, vertical stack preserved, no horizontal overflow | VERIFIED | `DesignCopyPanel.tsx` line 29: `font-mono text-base min-h-[5rem] field-sizing-content resize-none w-full`; outer `flex flex-col gap-3` line 13 preserved |
| 5 | Video: two-button source picker, gallery grid 3-col mobile/4-col md+, prompt auto-grows 16px, duration/aspect/audio ≥40px, inline video player with playsInline+muted | VERIFIED | `VideoPanel.tsx`: `data-video-source-upload` wrapper line 100; two buttons lines 108-131; gallery grid `grid-cols-3 gap-1 md:grid-cols-4 max-h-60` line 137; prompt textarea `text-base min-h-[5rem] field-sizing-content` line 166; Duration/Aspect buttons `flex-1 rounded-none min-h-10` lines 181/199; audio label `min-h-10` line 207; `<video playsInline muted controls>` lines 235-243; `aspectRatio` inline style line 242 |
| 6 | Brand Face: 2-col mobile / 4-col lg+, tiles ≥80px, collapse toggle ≥40px, View All ≥40px, active caption preserved | VERIFIED | `BrandFacePanel.tsx` line 57: `grid grid-cols-2 gap-1 lg:grid-cols-4`; line 63: `relative aspect-square min-h-20 overflow-hidden border`; line 36: `flex min-h-10 items-center gap-1`; line 89: `w-full min-h-10 border border-border`; `t('workspace.brandFace.active')` caption line 77 |

**Score:** 6/6 truths verified

---

### Required Artifacts

| Artifact | Requirement | Status | Details |
|----------|-------------|--------|---------|
| `src/components/ImageUpload.tsx` | MODES-01 shared upload base | VERIFIED | Default `accept = 'image/*'` line 19; no mime-subset whitelist; no `capture` attribute (Phase 7 scope) |
| `src/components/OnModelPanel.tsx` | MODES-01 | VERIFIED | `grid-cols-3`, `min-h-20 min-w-20` on both tile types, `accept="image/*"`, `min-h-10` on Front/Back, all 4 i18n strings consumed |
| `src/components/CatalogPanel.tsx` | MODES-02 | VERIFIED | `grid-cols-3 md:grid-cols-4`, `min-h-10` on angle buttons, `labelKey` pattern replacing hardcoded labels, `anglesLabel` + `hintGenerated` consumed |
| `src/components/ColorwayPanel.tsx` | MODES-03 | VERIFIED | `flex flex-wrap gap-1`, 40px remove button, `text-base min-h-10` input, 40px Add button |
| `src/components/DesignCopyPanel.tsx` | MODES-04 | VERIFIED | `field-sizing-content`, `min-h-[5rem]`, `text-base`, `resize-none`, `w-full`, vertical stack |
| `src/components/VideoPanel.tsx` | MODES-05 | VERIFIED | Side-by-side picker, `grid-cols-3 md:grid-cols-4` gallery, auto-grow textarea, ≥40px controls, inline `<video playsInline muted controls>` with aspect-ratio style |
| `src/components/BrandFacePanel.tsx` | MODES-06 | VERIFIED | `grid-cols-2 lg:grid-cols-4`, `min-h-20` tiles, `min-h-10` toggle + View All, `useState(true)` collapsed default, 8-tile cap |
| `src/lib/translations/tr.ts` | All | VERIFIED | 8 new keys present: `onModel.hint`, `onModel.viewQuestion`, `onModel.viewFront`, `onModel.viewBack`, `catalog.anglesLabel`, `catalog.hintGenerated`, `video.uploadFromDevice`, `video.pickFromGallery` |
| `src/lib/translations/en.ts` | All | VERIFIED | Mirror of tr.ts for all 8 new keys; `canvas.videoReady: 'Video ready'` confirmed present |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `OnModelPanel.tsx` | `tr.ts#workspace.onModel` | `t('workspace.onModel.viewQuestion/Front/Back/hint')` | WIRED | All 4 call sites confirmed in OnModelPanel lines 57, 103, 111, 118 |
| `OnModelPanel.tsx` | hidden file input | `accept="image/*"` | WIRED | Line 93: `accept="image/*"` on own input; ImageUpload default also `image/*` |
| `CatalogPanel.tsx` | `tr.ts#workspace.catalog` | `t('workspace.catalog.anglesLabel/hintGenerated/angleFront/...')` | WIRED | anglesLabel line 51, hintGenerated line 66, `t(angle.labelKey)` line 61 |
| `ColorwayPanel.tsx` | `stores/workspaceStore` | `colorwayColors, setColorwayColors` | WIRED | Lines 11-12 |
| `DesignCopyPanel.tsx` | `stores/workspaceStore` | `designCopyModifications, setDesignCopyModifications` | WIRED | Lines 8-9 |
| `VideoPanel.tsx` | `stores/workspaceStore` | `videoSourceImage, videoPrompt, generations` | WIRED | Lines 14-19 |
| `VideoPanel.tsx (inline video)` | `stores.generations` | `latestVideoGeneration` find + `<video>` src | WIRED | Lines 37-39 (find), lines 232-245 (render) |
| `BrandFacePanel.tsx` | `hooks/useBrandModels` | `useBrandModels()` → models, setActive | WIRED | Line 9 |
| `BrandFacePanel.tsx` | `stores/workspaceStore` | `setActiveBrandFaceUrl`, `setActiveView` | WIRED | Lines 10-11 |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| MODES-01 | 06-01 | On-Model fully usable on mobile — multi-image grid ≥80px, Front/Back tappable | SATISFIED | OnModelPanel: 3-col grid, `min-h-20 min-w-20`, `min-h-10` buttons, `accept="image/*"` |
| MODES-02 | 06-02 | Catalog fully usable on mobile — angle grid reflows to 3 on small screens | SATISFIED | CatalogPanel: `grid-cols-3 gap-1 md:grid-cols-4`, all angles localized |
| MODES-03 | 06-03 | Colorway fully usable on mobile — add/remove colors, count picker tappable | SATISFIED | ColorwayPanel: `flex flex-wrap`, 40px targets on all controls, 16px font on input |
| MODES-04 | 06-04 | Design Copy fully usable on mobile — no zoom, no layout break | SATISFIED | DesignCopyPanel: `text-base`, `field-sizing-content`, `min-h-[5rem]`, `w-full` |
| MODES-05 | 06-05 | Video fully usable on mobile — source picker, prompt, controls, in-panel video | SATISFIED | VideoPanel: two-button picker, responsive gallery, auto-grow prompt, ≥40px controls, playsInline+muted inline player |
| MODES-06 | 06-06 | Brand Face usable on mobile — active preview, switch/clear, no layout break | SATISFIED | BrandFacePanel: 2-col/4-col grid, min-h-20 tiles, 40px toggle + View All |

No orphaned requirements — MODES-01..06 are all claimed by plans 06-01..06-06 and implemented.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None | — | — | — | No TODOs, no placeholder returns, no empty handlers, no hardcoded Turkish strings found in modified panel files |

Note: Three pre-existing lint errors in `ui/button.tsx`, `useBrandModels.ts`, and `useGenerations.ts` are tracked in `deferred-items.md`. They pre-date Phase 6 and are not introduced by this phase's changes.

---

### Human Verification Required

The automated checks (file existence, class names, i18n key presence, wiring patterns) all pass. What remains is real-device confirmation that the CSS properties do what they claim:

#### 1. On-Model upload grid and tap targets

**Test:** On a ~360px wide phone, open On-Model panel, tap the upload slot.
**Expected:** 3 columns of square tiles each visually ≥80px tall; tapping a slot opens the native iOS/Android image picker (camera + photos library options); Front/Back toggle rows are ≥40px tall and feel comfortable to tap.
**Why human:** Rendered pixel size depends on device DPR, system font scaling, and actual sidebar padding. `min-h-20` is a CSS floor; a human confirms it holds in practice.

#### 2. Catalog responsive grid breakpoint

**Test:** On a ~360px phone and then a ~768px tablet, count the angle button columns.
**Expected:** 3 columns below md, 4 columns at md+; labels are in the active language (Turkish or English), not hardcoded "Önden".
**Why human:** Responsive breakpoint rendering requires a real browser or devtools resize.

#### 3. Colorway iOS auto-zoom

**Test:** On a real iOS Safari device, tap the add-color input.
**Expected:** Viewport does NOT zoom in on focus (because `text-base` = 16px meets iOS threshold).
**Why human:** iOS auto-zoom behavior is device-only; cannot be verified statically or in DevTools emulation.

#### 4. Design Copy textarea auto-grow

**Test:** On a phone, type or paste a 300-character string into the modifications textarea.
**Expected:** Textarea grows vertically; Generate button is still reachable by scrolling the sidebar; no horizontal overflow; no iOS zoom on focus.
**Why human:** `field-sizing-content` is a CSS property — the browser must support it (Safari 17.4+, Chrome 123+). Actual grow behavior requires user interaction.

#### 5. Video inline player and source picker

**Test:** With an existing gallery of completed non-video generations, open Video panel. Then generate a 9:16 video, wait for completion.
**Expected:** "Upload from Device" and "Pick from Gallery" appear as two side-by-side buttons; after generation completes, the video renders inside the panel at 9:16 aspect ratio with native controls; tapping play plays inline (no iOS fullscreen takeover).
**Why human:** The source picker only appears when `completedGenerations.length > 0` — requires a prior generation. The playsInline contract (no forced fullscreen) is an iOS runtime behavior.

#### 6. Brand Face 2-col grid and navigation

**Test:** On a phone, expand the Brand Face panel. Then tap "View All".
**Expected:** Face thumbnails appear in 2 columns with visible "Aktif" badge on active face; View All button navigates to the Brand Face management view without horizontal overflow or layout break.
**Why human:** Navigation wiring (`setActiveView('brand-face')`) requires a running app to confirm the management view opens and renders without overflow.

---

### Summary

All six panels (On-Model, Catalog, Colorway, Design Copy, Video, Brand Face) have received their Phase 6 mobile polish changes. Every must-have from plans 06-01 through 06-06 is confirmed in the actual source files:

- Upload grids use correct column counts with explicit minimum size floors
- All interactive controls carry `min-h-10` (40px) tap-target classes
- File inputs use `accept="image/*"` (no mime-subset restriction)
- Both textareas (Design Copy, Video prompt) carry `field-sizing-content text-base min-h-[5rem]`
- The Video inline player carries `playsInline muted controls` and a CSS `aspect-ratio` style
- Brand Face grid is `grid-cols-2 lg:grid-cols-4` with `min-h-20` tile floors
- All 8 new i18n keys exist in both tr.ts and en.ts; no hardcoded Turkish strings remain in the modified files

The status is `human_needed` because the six items above require real-device confirmation. No gaps were found — all automated verification passed.

---

_Verified: 2026-04-19_
_Verifier: Claude (gsd-verifier)_
