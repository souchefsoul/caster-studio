---
phase: 08-real-device-verification
status: awaiting_execution
created: 2026-04-19
devices_tested:
  ios: ""
  android: ""
---

# Phase 8 — Real-Device QA Report

Fill in this template on the real devices you own. Each checkbox represents a blocking item for milestone v1.1 ship.

**How to use:**
1. Run `npm run dev` locally. Expose via Vercel preview or ngrok if testing on external device.
2. Work through each section on each device. Check the box on PASS; add a bullet below with viewport + observed behavior on FAIL.
3. When all boxes checked, set frontmatter `status: passed` and run `/gsd:audit-milestone` → `/gsd:complete-milestone v1.1`.

---

## Devices Under Test

- **iOS Safari:** (model + iOS version — e.g., "iPhone 12 Pro, iOS 17.5")
- **Android Chrome:** (model + Android + Chrome version)

---

## Part A — End-to-End Generation Mode Runs (VERIFY-01)

For each mode: upload inputs, trigger generation, confirm result appears in history, refresh the page, confirm result is still there.

### iOS Safari

- [ ] **On-Model** — product photo → scene prompt → generated model shot in Gallery
- [ ] **Catalog** — product photo → select ≥2 angles → generated angle variants in Gallery
- [ ] **Colorway** — product photo → add ≥2 colors → generated color variants in Gallery
- [ ] **Design Copy** — reference photo → modification prompt → generated edit in Gallery
- [ ] **Video** — source image (upload or pick from Gallery) → prompt → generated video plays inline in panel
- [ ] **History persistence** — refresh the page; all generations above are still in Gallery history

### Android Chrome

- [ ] **On-Model**
- [ ] **Catalog**
- [ ] **Colorway**
- [ ] **Design Copy**
- [ ] **Video**
- [ ] **History persistence** (refresh)

---

## Part B — Visual QA Pass (VERIFY-02)

Test at three reference viewport widths. In iOS Safari use the real device; in Android use the real device; confirm that the UI works at the target size (the device's native resolution usually matches).

### 360×640 class (small phone)

- [ ] No horizontal scroll anywhere
- [ ] No clipped content (toolbar buttons, text labels, thumbnails)
- [ ] No unreadable text (<12px anywhere the user has to read)
- [ ] All primary taps hit their target (40×40px rule)
- [ ] Generator = primary view on first paint (Phase 5.1 flip verified)
- [ ] Gallery button opens canvas overlay; X closes; focus returns to Gallery

### 390×844 class (iPhone 12/13)

- [ ] Same items as 360×640

### 414×896 class (iPhone XR / 11 Pro Max)

- [ ] Same items as 360×640

---

## Part C — Accumulated human_needed items from prior phases

### Phase 5 (Mobile Canvas) — CANVAS-04, CANVAS-05, CANVAS-02

- [ ] Grid item delete/download/create-video reachable on touch (no hover requirement)
- [ ] Video plays inline on iOS Safari with controls — no forced fullscreen
- [ ] Single view fills viewport width at 360×640, no letterbox gap

### Phase 5.1 (Mobile Layout Flip) — FLIP-01..05

- [ ] Mobile first-paint shows generator primary (full-width sidebar contents)
- [ ] Gallery button exists in top bar, opens canvas as full-screen overlay
- [ ] Close X inside canvas returns to generator
- [ ] Tab key after close lands focus on the Gallery button (focus-return)
- [ ] Desktop ≥1024px: no top bar, no Gallery button, no X
- [ ] Language toggle flips Galeri/Gallery label on the button

### Phase 6 (Mode Panels) — MODES-01..06

- [ ] On-Model: slot ≥80px on device tap; native picker sheet offers camera + library
- [ ] Catalog: 3-col angle grid below md, 4-col at md+
- [ ] Colorway: input focus does NOT trigger iOS auto-zoom
- [ ] Design Copy: textarea auto-grows vertically on iOS Safari as you type
- [ ] Video: two-button source picker (Upload + From Gallery) both reachable
- [ ] Video: inline player renders at correct aspect ratio, no fullscreen takeover
- [ ] Brand Face: View All navigates to BrandFaceView without layout break

### Phase 7 (Auxiliary Views + Touch Ergonomics) — AUX-01, AUX-02, TOUCH-01..04

- [ ] AuthPage fits fully on iPhone SE portrait (667px tall) — no scroll
- [ ] iOS: tapping email/password input does NOT auto-zoom the viewport
- [ ] BrandFaceView: Add / set-active / remove-X all tap-responsive on 360px
- [ ] PromptPanel textarea grows vertically past 4 lines of prompt

---

## Part D — Defect Log

Any item checked as FAIL above goes here with repro steps. If any entry appears, Phase 8 status becomes `gaps_found` and triggers phase 08.1 gap closure.

| # | Viewport | Mode / View | Observed | Expected | Screenshot |
|---|----------|-------------|----------|----------|------------|
|   |          |             |          |          |            |

---

## Sign-off

- [ ] All Part A items pass on both devices
- [ ] All Part B items pass at all 3 viewports
- [ ] All Part C items pass
- [ ] Part D is empty (or all entries triaged to 08.1)

When all four are checked, update frontmatter:
```yaml
status: passed
completed: YYYY-MM-DD
```

Then run:
```bash
/gsd:audit-milestone
/gsd:complete-milestone v1.1
```
