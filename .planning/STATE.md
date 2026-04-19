---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: Mobile-Usable Site
status: unknown
stopped_at: Completed 05.1-02 (gallery-overlay-and-topbar) plan — Phase 05.1 plans done, orchestrator will run phase verification next
last_updated: "2026-04-19T13:36:39.088Z"
progress:
  total_phases: 6
  completed_phases: 3
  total_plans: 7
  completed_plans: 7
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-19)

**Core value:** Textile companies can generate professional product imagery and product videos from a single, clean workspace — on any device they have with them — without needing photographers or studios.
**Current focus:** Phase 05.1 — mobile-layout-flip

## Current Position

Phase: 05.1 (mobile-layout-flip) — ALL PLANS COMPLETE, awaiting phase verification
Plan: 2 of 2 (complete)

## Milestone Progress

- v1.0 MVP: Phases 1-3 — **Complete** (shipped 2026-04-18)
- v1.1 Mobile-Usable Site: Phases 4-8 — **In progress** (2/5 phases complete)

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

### Pending Todos

- Plan Phase 06 (mode-panels)

### Blockers/Concerns

None.

## Session Continuity

Last session: 2026-04-19T13:31:48.318Z
Stopped at: Completed 05.1-02 (gallery-overlay-and-topbar) plan — Phase 05.1 plans done, orchestrator will run phase verification next
Resume file: None
