---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: Mobile-Usable Site
status: unknown
stopped_at: "Completed 07-04-PLAN.md — AUX-01 BrandFaceView mobile reflow (1-col/sm:2/lg:3 grid) + TOUCH-01 40px tap floors on all 5 controls + TOUCH-02 16px name input; 3 atomic commits, zero deviations, ready for 07-05 (AuthPage AUX-02 reflow)"
last_updated: "2026-04-19T15:11:39.093Z"
progress:
  total_phases: 6
  completed_phases: 4
  total_plans: 18
  completed_plans: 17
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-19)

**Core value:** Textile companies can generate professional product imagery and product videos from a single, clean workspace — on any device they have with them — without needing photographers or studios.
**Current focus:** Phase 07 — auxiliary-views-touch-ergonomics

## Current Position

Phase: 07 (auxiliary-views-touch-ergonomics) — EXECUTING
Plan: 5 of 5

## Milestone Progress

- v1.0 MVP: Phases 1-3 — **Complete** (shipped 2026-04-18)
- v1.1 Mobile-Usable Site: Phases 4-8 — **In progress** (3/5 phases complete)

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- [v1.0 Roadmap]: 3-phase coarse roadmap — Foundation, Workspace+OnModel, Full Gen Suite+Org
- [v1.0 Roadmap]: On-Model generation bundled with workspace (Phase 2) to deliver first end-to-end flow early
- [v1.0 Revision]: Billing (BILL-01 through BILL-04) removed from v1 scope entirely
- [01-01]: Tailwind CSS v4 with @tailwindcss/vite plugin
- [01-01]: shadcn/ui v4 base-nova style
- [Phase 02-01]: Windows 95 flat design: rounded-none, visible 1px borders, no shadows/gradients/animations
- [Phase 02-01]: Sidebar uses fixed positioning with z-40 overlay on mobile, static on lg+ breakpoint
- [Phase 02-02]: FAL proxy pattern: fetch to ${SUPABASE_URL}/functions/v1/fal-proxy
- [Phase 03-01]: Fire-and-forget persistence: saveGeneration errors logged, do not block UI
- [Phase 03-01]: Generation history limited to 200 most recent per user
- [Phase 03-02]: BrandFacePanel placed above mode-specific panels in sidebar as global component
- [Phase 03-04]: Catalog/colorway parallel generation via Promise.allSettled
- [Phase 03-06]: Adopted @fal-ai/client; fal-proxy reduced to dumb x-fal-target-url pass-through
- [Phase 03-06]: Reference images uploaded directly to fal.storage, not Supabase Storage — eliminates WORKER_RESOURCE_LIMIT
- [Phase 03-06]: Queue polling moved to browser via fal.subscribe(); edge function no longer blocks on Kling jobs
- [Phase 03-06]: numImages fan-out: N parallel calls with num_images=1 for reliable count and isolated failures
- [Phase 03-06]: useAuth preserves user reference across silent token refreshes; useGenerations merges fetched + in-memory
- [Phase 03-06]: On-Model redesigned — single multi-image grid (up to 10) + Front/Back view toggle, no per-angle UI
- [Phase 03-06]: Collections feature removed from UI and DB (migration 002 drops tables)
- [Phase 03-06]: fal-proxy deployed with --no-verify-jwt to work around ES256 JWT signing keys
- [Phase 03-06]: Migration 002 adds 'video' to generations.mode CHECK, adds DELETE RLS policy, creates uploads bucket
- [v1.1 Scope]: Responsive web (not PWA/native) — same React app, Tailwind breakpoints
- [v1.1 Scope]: Feature parity on mobile — no feature cuts vs desktop
- [v1.1 Scope]: Keep Windows 95 flat aesthetic on mobile (no redesign)
- [v1.1 Roadmap]: 5 phases (4-8) derived from natural requirement boundaries — Responsive Shell → Mobile Canvas → Mode Panels → Aux Views + Touch Ergonomics → Real-Device Verification
- [v1.1 Roadmap]: Verification isolated as its own phase (Phase 8) because "runs on real iOS/Android" is a shippability gate, not a polish detail
- [Phase 04-01]: viewport-fit=cover added to meta viewport — required for iOS env(safe-area-inset-*) to resolve to nonzero values
- [Phase 04-01]: Global overflow-x: hidden on html+body as safety net for horizontal scroll; component-level fixes in 04-02/04-03 address root causes
- [Phase 04-01]: Used raw CSS overflow-x: hidden (not @apply) inside @layer base to avoid Tailwind v4 @apply resolution ambiguity
- [Phase 04-02]: Sidebar drawer width below lg: w-[85vw] max-w-[360px]; restored to w-[32rem] at lg+ with max-w-none
- [Phase 04-02]: Safe-area insets use max(0.75rem, env(...)) so existing py-3 padding remains floor on non-notch devices
- [Phase 04-02]: Initial sidebarOpen computed via matchMedia('(min-width: 1024px)') — static, no resize listener; Tailwind's lg:static handles visual breakpoint switch
- [Phase 04-02]: Focus-return on drawer close uses document.querySelector('[data-sidebar-trigger=true]') — DOM-level handoff instead of ref threading through WorkspaceLayout; attribute added by plan 04-03
- [Phase 04-03]: Auto-close sidebar drawer via single useEffect in WorkspaceLayout watching [currentMode, activeView, setSidebarOpen]; matchMedia('(min-width: 1024px)') guard makes it a no-op on desktop
- [Phase 04-03]: Canvas hamburger carries data-sidebar-trigger='true' + aria-label='Toggle sidebar'; closes 04-02 focus-return contract end-to-end and adds a11y for icon-only button
- [Phase 04-03]: Canvas toolbar uses pt-[max(0.5rem,env(safe-area-inset-top))] to preserve py-2 floor on non-notch devices and gap-2 + min-w-0 on flex-wrap parent to prevent intrinsic-size horizontal overflow at 360px
- [Phase 05-01]: Hover-to-touch migration pattern — flip `opacity-0 group-hover:opacity-100` to `opacity-100 lg:opacity-0 lg:group-hover:opacity-100`; preferred mobile-first approach for any hover-gated UI that must remain reachable on touch without losing desktop hover-reveal
- [Phase 05-01]: Verify-only tasks with grep-based acceptance criteria codify prior-phase invariants (CANVAS-01 columns, CANVAS-03 toolbar) into current plan's regression gates without re-implementing
- [Phase 05-02]: Conditional responsive padding on a shared wrapper via template-literal className + view-mode guard (`${mode === 'single' ? 'p-0 lg:p-4' : 'p-4'}`) — keeps two responsive behaviors in one wrapper without branching JSX
- [Phase 05-02]: iOS inline-video contract — every `<video autoPlay>` on mobile must carry both `playsInline` (prevents forced fullscreen) AND `muted` (satisfies audio-autoplay policy); mandatory pair, not optional
- [Phase 05.1]: Phase 05.1-01: new galleryOpen slice chosen over inverting sidebarOpen — cleaner Plan 02 consumer
- [Phase 05.1]: Phase 05.1-01: Sidebar mobile drop drawer pattern entirely (Option A) — <aside> collapses to static className relative w-full ... lg:w-[32rem]
- [Phase 05.1]: Phase 05.1-01: sidebarOpen slice preserved byte-for-byte in workspaceStore; Plan 02 will retire WorkspaceLayout backdrop incrementally
- [Phase 05.1]: Phase 05.1-02: User approved mobile layout flip — generator-primary first paint, Gallery overlay works, focus returns to Gallery trigger on close, desktop unchanged
- [Phase 05.1]: Phase 05.1-02: Gallery overlay + focus-return pattern — queueMicrotask + document.querySelector('[data-gallery-trigger]') chosen over React refs; runs after React commits overlay unmount, eliminates setTimeout(0) paint flash
- [Phase 05.1]: Phase 05.1-02: Mobile layout composed via flex-col lg:flex-row root + sharp gates (lg:hidden on mobile-only elements, hidden lg:flex on desktop-only canvas column) — two directions never mixed, zero desktop regression
- [Phase 05.1]: Phase 05.1-02: Gallery close button reused the retired Canvas hamburger slot — Canvas toolbar already has safe-area inset + flex-wrap + lg:hidden from Phase 5, so no new overlay header was needed
- [Phase 06-01]: Phase 6 i18n pre-staging — foundation plan lands every downstream key (onModel/catalog/video) in tr.ts+en.ts so Plans 06-02..06-05 touch only their component file and Wave 2 can run in parallel without merge conflicts on translation files
- [Phase 06-01]: 80x80 mobile slot floor via `aspect-square min-h-20 min-w-20` combo — min-h/w-20 is an explicit floor that becomes a no-op on desktop where aspect-square already exceeds 80px; avoids responsive media query
- [Phase 06-01]: File input `accept="image/*"` over mime-subset whitelist — lets native OS sheet expose camera+library+files and unblocks iOS HEIC users; no `capture` attribute added (Phase 7 TOUCH-03 owns capture hints)
- [Phase 06-01]: Tap-size retrofit for shadcn xs buttons — add `min-h-10` alongside `size="xs"` to get 40px mobile tap target without introducing a new button variant; xs density preserved on desktop where vertical constraint doesn't bite
- [Phase 06-02]: Responsive grid step at md: grid-cols-3 gap-1 md:grid-cols-4 reflows Catalog angles 3-col mobile to 4-col md+; desktop (lg+) byte-preserved because grid-cols-4 already applied at lg
- [Phase 06-02]: labelKey indirection on module-scope arrays: store i18n key strings in AVAILABLE_ANGLES then resolve via t(angle.labelKey) at render, keeps array static while enabling runtime locale switching
- [Phase 06-03]: flex flex-wrap gap-1 (not CSS grid) for bounded-count chip reflow — wraps naturally on mobile, packs on desktop without media queries; applicable to any tag/chip list with small hard cap
- [Phase 06-03]: Decoupled hit-area pattern: 40x40 flex container wrapping a size-3 icon lets chips/dense UI meet touch-target floor without visual bloat
- [Phase 06-03]: text-base (16px) on color text input to prevent iOS Safari auto-zoom on focus; Phase 7 TOUCH-02 will enforce globally but Phase 6 preemptively complies where inputs land
- [Phase 06-04]: Tailwind v4 field-sizing-content utility chosen over JS auto-resize handler for textarea growth — declarative, zero listeners, zero SSR mismatch risk; Safari 17.4+ / Chrome 123+ native support with rows={3} HTML fallback for older engines
- [Phase 06-04]: Triple-guard textarea sizing pattern: field-sizing-content (modern auto-grow) + min-h-[5rem] (3-row Tailwind floor) + rows={3} (SSR/HTML fallback) — composable guard stack for mobile-friendly long-input textareas
- [Phase 06-04]: 16px text-base no-auto-zoom rule now enforced on both <input> (Plan 06-03) and <textarea> (this plan) surfaces in Phase 6 panels — uniform iOS Safari compliance precedent for Phase 7 TOUCH-02 global enforcement
- [Phase 06-05]: data-* attribute handoff for reaching into encapsulated child refs — 'Upload from Device' button triggers ImageUpload's hidden <input type=file> via document.querySelector('[data-video-source-upload] input[type=file]'); avoids ref threading or modifying the shared ImageUpload API
- [Phase 06-05]: Inline <video> element in sidebar preserves CANVAS-05 iOS contract — playsInline + muted both present; no autoPlay (sidebar is not a playback surface; user-initiated controls play is the intended interaction)
- [Phase 06-05]: CSS aspect-ratio inline style from stored generation params — style={{ aspectRatio: params.aspectRatio.replace(':', ' / ') }} prevents layout shift on video load; key={generation.id} forces remount on new generation so src updates play from the start
- [Phase 06-05]: Phase 6 textarea triple-guard (field-sizing-content + min-h-[5rem] + rows={3}) now applied uniformly to DesignCopy (06-04) AND Video (06-05) prompts — pattern stable for Phase 7 TOUCH-02 global rollout
- [Phase 06-06]: Brand Face mobile grid: grid-cols-2 mobile / lg:grid-cols-4 desktop — CONTEXT-locked 2-col decision preserves the 'Aktif' caption overlay legibility at 360px by yielding ~160px tiles instead of ~80px
- [Phase 06-06]: 80px pixel floor via min-h-20 on aspect-square tiles — protects parmak-dostu target when sidebar narrows below 360px; no-op at lg+ where aspect-square already exceeds 80px in a 32rem sidebar
- [Phase 06-06]: min-h-10 retrofit on collapse toggle + View All — adds 40px tap floor without new button variant, matches Phase 06-01 xs-button retrofit precedent
- [Phase 07]: Phase 07-01: min-h-10 retrofit pattern — append (not replace) — preserves existing layout utilities (flex-1, w-full, rounded-none) while lifting mobile tap floor; icon-only buttons get min-h-10 min-w-10 together so icon stays size-4 and hit-area grows via container
- [Phase 07]: Phase 07-01: Bare <button> h-7 -> min-h-10 swap (replace, not append) because h-7 and min-h-10 would conflict on the same element; applied to Canvas toolbarBtn const and clear-failed bare button
- [Phase 07]: Phase 07-01: Grid-item hover-reveal overlay (text-[11px] inside lg:opacity-0 lg:group-hover:opacity-100 bar) intentionally NOT lifted — Phase 5 touch-overlay pattern treats the entire overlay bar as the hit area; TOUCH-01 decorative-icon exemption applies
- [Phase 07]: Phase 07-01: Shared Shadcn Button and Input components remain unmodified — only call-site className lifts applied. Preserves xs/sm/icon-sm density on desktop and avoids rippling changes into ungoverned call-sites
- [Phase 07-02]: Triple-guard textarea recipe (field-sizing-content + min-h-[5rem] + rows={3} + text-base + resize-none) now applied uniformly across three long-input textareas: DesignCopy (06-04), Video (06-05), PromptPanel (07-02). Pattern is stable and portable — future long-input textareas should adopt the same token set
- [Phase 07-02]: TOUCH-04 closed for the last shared long-input textarea (On-Model/Catalog/Colorway all feed through PromptPanel). iOS Safari no-auto-zoom + 3-row floor + auto-grow now universal on the mode-panel surface
- [Phase 07-02]: Recipe application preserves per-component focus style (PromptPanel's focus:border-ring focus:outline-none kept distinct from DesignCopy's focus-visible variant) — TOUCH-04 mandates sizing/typography/growth tokens only, not focus styling
- [Phase 07-02]: font-mono retained alongside text-base on PromptPanel — Windows 95 prompt-console typewriter feel survives the 14px → 16px iOS-compliance bump
- [Phase 07-03]: Audit-only plan pattern — zero source modifications on the happy path; single commit lands a grep-capture audit document (07-03-AUDIT.md) that regression-locks TOUCH-03 / the Phase 6 accept='image/*' + no-capture invariants
- [Phase 07-03]: Grep-based acceptance criteria over unit tests for HTML-attribute invariants — cheap to run, immune to framework churn, directly expressive of 'no capture attr anywhere' / 'accept=image/* on every file input' contracts
- [Phase 07-03]: VideoPanel's data-video-source-upload bridge (06-05 pattern) confirmed NOT a new file input — line 114's type=file is inside a document.querySelector string literal; audit counts exactly 2 actual <input type=file> elements in src/ (ImageUpload, OnModelPanel)
- [Phase 07-04]: BrandFaceView grid = 1-col / sm:2-col / lg:3-col — distinct from BrandFacePanel sidebar preview's 2-col / lg:4-col; CONTEXT-locked at single-column mobile per AUX-01 explicit wording
- [Phase 07-04]: Icon-only remove-X grows via flex centering + min-h-10 + min-w-10 — X icon stays size-3 (12px), hit-area grows via container; matches Phase 6 06-03 decoupled hit-area pattern
- [Phase 07-04]: Decorative 10px caption text on per-tile set-active button unchanged — TOUCH-01 exempts decorative text when paired with larger hit area (entire tile face image is primary tap surface)
- [Phase 07-04]: Name input adds w-full alongside text-base + min-h-10 upgrade; wrapper style maxWidth:320 preserved so form fills 320px on mobile and caps at 320px on desktop

### Pending Todos

- Execute remaining Phase 07 Wave 2 plans (07-03 ImageUpload accept audit, 07-04 BrandFaceView reflow, 07-05 AuthPage reflow)
- Optional: lint-cleanup plan for the 3 pre-existing lint errors tracked in `.planning/phases/06-mode-panels-on-mobile/deferred-items.md`

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-04-19T15:11:39.090Z
Stopped at: Completed 07-04-PLAN.md — AUX-01 BrandFaceView mobile reflow (1-col/sm:2/lg:3 grid) + TOUCH-01 40px tap floors on all 5 controls + TOUCH-02 16px name input; 3 atomic commits, zero deviations, ready for 07-05 (AuthPage AUX-02 reflow)
Resume file: None
